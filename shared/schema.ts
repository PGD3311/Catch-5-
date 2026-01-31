import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (users and sessions tables)
export * from "./models/auth";

// User game statistics
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  gamesWon: integer("games_won").default(0).notNull(),
  bidsMade: integer("bids_made").default(0).notNull(),
  bidsSucceeded: integer("bids_succeeded").default(0).notNull(),
  timesSet: integer("times_set").default(0).notNull(),
  totalPointsScored: integer("total_points_scored").default(0).notNull(),
  totalBidAmount: integer("total_bid_amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

export const gameRooms = pgTable("game_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  hostPlayerId: varchar("host_player_id"),
  deckColor: varchar("deck_color", { length: 20 }).default("blue"),
  targetScore: integer("target_score").default(31),
  status: varchar("status", { length: 20 }).default("waiting"),
  gameState: jsonb("game_state"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roomPlayers = pgTable("room_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  seatIndex: integer("seat_index").notNull(),
  playerToken: varchar("player_token").notNull(),
  playerName: varchar("player_name", { length: 50 }).notNull(),
  isHuman: boolean("is_human").default(true),
  isConnected: boolean("is_connected").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
  createdAt: true,
});

export const insertRoomPlayerSchema = createInsertSchema(roomPlayers).omit({
  id: true,
  joinedAt: true,
});

export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertRoomPlayer = z.infer<typeof insertRoomPlayerSchema>;
export type RoomPlayer = typeof roomPlayers.$inferSelect;
