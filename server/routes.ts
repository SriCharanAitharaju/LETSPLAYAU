import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
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

  // Check in to a court
  app.post("/api/check-in", async (req, res) => {
    try {
      const { courtId } = req.body;

      if (!courtId) {
        return res.status(400).json({ error: "Court ID is required" });
      }

      const court = await storage.getCourt(courtId);
      
      if (!court) {
        return res.status(404).json({ error: "Court not found" });
      }

      if (court.status === "occupied") {
        return res.status(400).json({ error: "Court is already occupied" });
      }

      // Create a new session
      const session = await storage.createSession(courtId);
      
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
  app.post("/api/check-out", async (req, res) => {
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

  return httpServer;
}
