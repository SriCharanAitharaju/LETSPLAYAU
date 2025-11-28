import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { WSMessage, Court } from "@shared/schema";

// Store active sessions with their timeout IDs and warning timers
const sessionTimers = new Map<string, NodeJS.Timeout>();
const warningTimers = new Map<string, NodeJS.Timeout>();

// Store all WebSocket clients
const wsClients = new Set<WebSocket>();

// Broadcast message to all connected clients
function broadcast(message: WSMessage) {
  const messageStr = JSON.stringify(message);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Automatic checkout function
async function autoCheckout(courtId: string, sessionId: string) {
  try {
    const court = await storage.getCourt(courtId);
    if (!court || court.status !== "occupied") return;

    // End the session
    await storage.endSession(sessionId);
    
    // Update court status
    const updatedCourt = await storage.updateCourtStatus(courtId, "available");
    
    // Clear the timer
    sessionTimers.delete(sessionId);

    // Broadcast the update with full courts list
    const allCourts = await storage.getAllCourts();
    if (updatedCourt) {
      broadcast({
        type: "session_expired",
        courtId,
        court: updatedCourt,
        courts: allCourts,
        message: `${court.name} session has expired and is now available`,
      });
    }

    console.log(`Auto checkout completed for court ${courtId}`);
  } catch (error) {
    console.error("Error during auto checkout:", error);
  }
}

// Set up 10-minute warning
async function scheduleWarning(courtId: string, sessionId: string) {
  const warningTimeout = setTimeout(async () => {
    // Check if session is still active before warning
    const court = await storage.getCourt(courtId);
    const session = await storage.getSession(sessionId);
    
    if (court && session && court.status === "occupied") {
      const allCourts = await storage.getAllCourts();
      broadcast({
        type: "session_warning",
        courtId,
        courts: allCourts,
        message: `${court.name} - Only 10 minutes remaining!`,
      });
    }
    warningTimers.delete(sessionId);
  }, 50 * 60 * 1000); // 50 minutes (10 minutes before end)
  
  warningTimers.set(sessionId, warningTimeout);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  const httpServer = createServer(app);

  // Set up WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket client connected");
    wsClients.add(ws);

    // Send current court status to new client
    storage.getAllCourts().then(courts => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "court_update",
          courts,
        }));
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      wsClients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(ws);
    });
  });

  // Auth route: Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all courts
  app.get("/api/courts", async (req, res) => {
    try {
      const courts = await storage.getAllCourts();
      res.json(courts);
    } catch (error) {
      console.error("Error fetching courts:", error);
      res.status(500).json({ error: "Failed to fetch courts" });
    }
  });

  // Get user's active session
  app.get("/api/user-session", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getUserActiveSession(userId);
      res.json({ session });
    } catch (error) {
      console.error("Error fetching user session:", error);
      res.status(500).json({ error: "Failed to fetch user session" });
    }
  });

  // Check in to a court
  app.post("/api/check-in", isAuthenticated, async (req: any, res) => {
    try {
      const { courtId } = req.body;
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email || "unknown@anurag.edu.in";

      if (!courtId) {
        return res.status(400).json({ error: "Court ID is required" });
      }

      const court = await storage.getCourt(courtId);
      
      if (!court) {
        return res.status(404).json({ error: "Court not found" });
      }

      if (court.status === "occupied") {
        return res.status(400).json({ error: "Court is already occupied by another user" });
      }

      // Check if user already has an active session on another court
      const userActiveSession = await storage.getUserActiveSession(userId);
      if (userActiveSession) {
        const activeCourtId = userActiveSession.courtId;
        const activeCourt = await storage.getCourt(activeCourtId);
        return res.status(409).json({ 
          error: `You are already using ${activeCourt?.name}. Please check out from that court first.`,
          activeCourtId,
          activeCourtName: activeCourt?.name,
        });
      }

      // Create a new session
      const session = await storage.createSession(courtId, userId, userEmail);
      
      // Update court status
      const updatedCourt = await storage.updateCourtStatus(courtId, "occupied", session);

      // Schedule auto checkout after 1 hour
      const timeout = setTimeout(() => {
        autoCheckout(courtId, session.id);
      }, 3600000); // 1 hour
      
      sessionTimers.set(session.id, timeout);

      // Schedule 10-minute warning
      scheduleWarning(courtId, session.id);

      // Broadcast the update to all clients
      const allCourts = await storage.getAllCourts();
      broadcast({
        type: "check_in",
        courtId,
        court: updatedCourt!,
        courts: allCourts,
      });

      res.json({ court: updatedCourt, session });
    } catch (error) {
      console.error("Error during check-in:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // Check out from a court
  app.post("/api/check-out", isAuthenticated, async (req: any, res) => {
    try {
      const { courtId } = req.body;

      if (!courtId) {
        return res.status(400).json({ error: "Court ID is required" });
      }

      const court = await storage.getCourt(courtId);
      
      if (!court) {
        return res.status(404).json({ error: "Court not found" });
      }

      if (court.status === "available") {
        return res.status(400).json({ error: "Court is not occupied" });
      }

      // Get and end the session
      const session = await storage.getActiveSession(courtId);
      if (session) {
        await storage.endSession(session.id);
        
        // Clear the auto checkout timer
        const timer = sessionTimers.get(session.id);
        if (timer) {
          clearTimeout(timer);
          sessionTimers.delete(session.id);
        }
        
        // Clear the warning timer
        const warningTimer = warningTimers.get(session.id);
        if (warningTimer) {
          clearTimeout(warningTimer);
          warningTimers.delete(session.id);
        }
      }

      // Update court status
      const updatedCourt = await storage.updateCourtStatus(courtId, "available");

      // Broadcast the update to all clients
      const allCourts = await storage.getAllCourts();
      broadcast({
        type: "check_out",
        courtId,
        court: updatedCourt!,
        courts: allCourts,
      });

      res.json({ court: updatedCourt });
    } catch (error) {
      console.error("Error during check-out:", error);
      res.status(500).json({ error: "Failed to check out" });
    }
  });

  // Admin: Get all registered users (signed-in)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersList = allUsers.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      }));
      res.json({ 
        totalUsers: usersList.length,
        users: usersList 
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin: Get all active users (currently using courts)
  app.get("/api/admin/active-sessions", async (req, res) => {
    try {
      const allSessions = await storage.getAllActiveSessions();
      const activeSessions = await Promise.all(allSessions.map(async (session) => ({
        sessionId: session.id,
        userId: session.userId,
        userEmail: session.userEmail,
        courtId: session.courtId,
        startTime: new Date(session.startTime).toISOString(),
        endTime: new Date(session.endTime).toISOString(),
        timeRemainingMs: Math.max(0, session.endTime - Date.now()),
      })));
      
      res.json({ 
        activeUsers: activeSessions.length,
        sessions: activeSessions 
      });
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ error: "Failed to fetch active sessions" });
    }
  });

  return httpServer;
}
