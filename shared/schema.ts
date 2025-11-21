import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Court status types
export type CourtStatus = "available" | "occupied";
export type SportType = "badminton" | "volleyball" | "carrom" | "basketball" | "football" | "tennis";

// Courts configuration
export interface Court {
  id: string;
  sport: SportType;
  name: string;
  courtNumber: number;
  status: CourtStatus;
  currentSession?: Session;
}

// Active session
export interface Session {
  id: string;
  courtId: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp (startTime + 1 hour)
}

// WebSocket message types
export type WSMessageType = 
  | "court_update" 
  | "check_in" 
  | "check_out" 
  | "timer_update"
  | "session_warning"
  | "session_expired";

export interface WSMessage {
  type: WSMessageType;
  courtId?: string;
  court?: Court;
  courts?: Court[];
  session?: Session;
  message?: string;
}

// User schema (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sport metadata
export const SPORT_METADATA: Record<SportType, { name: string; icon: string; color: string }> = {
  badminton: { name: "Badminton", icon: "activity", color: "chart-1" },
  volleyball: { name: "Volleyball", icon: "circle", color: "chart-2" },
  carrom: { name: "Carrom", icon: "grid-3x3", color: "chart-3" },
  basketball: { name: "Basketball", icon: "circle-dot", color: "chart-4" },
  football: { name: "Football", icon: "hexagon", color: "chart-5" },
  tennis: { name: "Tennis", icon: "activity", color: "chart-1" },
};

// Initial courts data
export const INITIAL_COURTS: Omit<Court, "status" | "currentSession">[] = [
  // Badminton
  { id: "bad-1", sport: "badminton", name: "Badminton Court 1", courtNumber: 1 },
  { id: "bad-2", sport: "badminton", name: "Badminton Court 2", courtNumber: 2 },
  // Volleyball
  { id: "vol-1", sport: "volleyball", name: "Volleyball Court 1", courtNumber: 1 },
  { id: "vol-2", sport: "volleyball", name: "Volleyball Court 2", courtNumber: 2 },
  // Carrom
  { id: "car-1", sport: "carrom", name: "Carrom Board 1", courtNumber: 1 },
  { id: "car-2", sport: "carrom", name: "Carrom Board 2", courtNumber: 2 },
  { id: "car-3", sport: "carrom", name: "Carrom Board 3", courtNumber: 3 },
  { id: "car-4", sport: "carrom", name: "Carrom Board 4", courtNumber: 4 },
  { id: "car-5", sport: "carrom", name: "Carrom Board 5", courtNumber: 5 },
  // Basketball
  { id: "bas-1", sport: "basketball", name: "Basketball Court 1", courtNumber: 1 },
  { id: "bas-2", sport: "basketball", name: "Basketball Court 2", courtNumber: 2 },
  // Football
  { id: "foo-1", sport: "football", name: "Football Field", courtNumber: 1 },
  // Tennis
  { id: "ten-1", sport: "tennis", name: "Tennis Court", courtNumber: 1 },
];
