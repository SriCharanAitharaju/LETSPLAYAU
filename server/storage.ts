import { type User, type InsertUser, type Court, type Session, INITIAL_COURTS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Court methods
  getAllCourts(): Promise<Court[]>;
  getCourt(courtId: string): Promise<Court | undefined>;
  updateCourtStatus(courtId: string, status: "available" | "occupied", session?: Session): Promise<Court | undefined>;
  
  // Session methods
  createSession(courtId: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  endSession(sessionId: string): Promise<void>;
  getActiveSession(courtId: string): Promise<Session | undefined>;
  getAllActiveSessions(): Promise<Session[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courts: Map<string, Court>;
  private sessions: Map<string, Session>;

  constructor() {
    this.users = new Map();
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

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
  async createSession(courtId: string): Promise<Session> {
    const id = randomUUID();
    const startTime = Date.now();
    const endTime = startTime + 3600000; // 1 hour (3600000 ms)
    
    const session: Session = {
      id,
      courtId,
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

  async getAllActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
}

export const storage = new MemStorage();
