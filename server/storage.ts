import { type User, type UpsertUser, type Court, type Session, INITIAL_COURTS, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (REQUIRED for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Court methods
  getAllCourts(): Promise<Court[]>;
  getCourt(courtId: string): Promise<Court | undefined>;
  updateCourtStatus(courtId: string, status: "available" | "occupied", session?: Session): Promise<Court | undefined>;
  
  // Session methods
  createSession(courtId: string, userId: string, userEmail: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  endSession(sessionId: string): Promise<void>;
  getActiveSession(courtId: string): Promise<Session | undefined>;
  getUserActiveSession(userId: string): Promise<Session | undefined>;
  getAllActiveSessions(): Promise<Session[]>;
}

export class DatabaseStorage implements IStorage {
  private courts: Map<string, Court>;
  private sessions: Map<string, Session>;

  constructor() {
    this.courts = new Map();
    this.sessions = new Map();
    
    // Initialize courts with available status
    INITIAL_COURTS.forEach(courtData => {
      const court: Court = {
        ...courtData,
        status: "available",
        currentSession: undefined,
      };
      this.courts.set(court.id, court);
    });
  }

  // User methods (REQUIRED for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Court methods
  async getAllCourts(): Promise<Court[]> {
    return Array.from(this.courts.values());
  }

  async getCourt(courtId: string): Promise<Court | undefined> {
    return this.courts.get(courtId);
  }

  async updateCourtStatus(
    courtId: string, 
    status: "available" | "occupied", 
    session?: Session
  ): Promise<Court | undefined> {
    const court = this.courts.get(courtId);
    if (!court) return undefined;

    court.status = status;
    court.currentSession = session;
    this.courts.set(courtId, court);
    
    return court;
  }

  // Session methods
  async createSession(courtId: string, userId: string, userEmail: string): Promise<Session> {
    const id = randomUUID();
    const startTime = Date.now();
    const endTime = startTime + 3600000; // 1 hour (3600000 ms)
    
    const session: Session = {
      id,
      courtId,
      userId,
      userEmail,
      startTime,
      endTime,
    };
    
    this.sessions.set(id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getActiveSession(courtId: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.courtId === courtId,
    );
  }

  async getUserActiveSession(userId: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.userId === userId,
    );
  }

  async getAllActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
}

export const storage = new DatabaseStorage();
