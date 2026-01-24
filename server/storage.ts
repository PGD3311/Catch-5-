import { 
  type User, 
  type GameRoom, 
  type InsertGameRoom,
  type RoomPlayer,
  type InsertRoomPlayer,
  type UserStats,
  type InsertUserStats,
  users,
  gameRooms,
  roomPlayers,
  userStats
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  createRoom(room: InsertGameRoom): Promise<GameRoom>;
  getRoomByCode(code: string): Promise<GameRoom | undefined>;
  getRoomById(id: string): Promise<GameRoom | undefined>;
  updateRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  deleteRoom(id: string): Promise<void>;
  
  addPlayerToRoom(player: InsertRoomPlayer): Promise<RoomPlayer>;
  getPlayersInRoom(roomId: string): Promise<RoomPlayer[]>;
  getPlayerByToken(token: string): Promise<RoomPlayer | undefined>;
  updatePlayer(id: string, updates: Partial<RoomPlayer>): Promise<RoomPlayer | undefined>;
  removePlayerFromRoom(playerId: string): Promise<void>;
  
  // User stats
  getUserStats(userId: string): Promise<UserStats | null>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats>;
  incrementUserStats(userId: string, increments: {
    gamesPlayed?: number;
    gamesWon?: number;
    bidsMade?: number;
    bidsSucceeded?: number;
    timesSet?: number;
    totalPointsScored?: number;
    highestBid?: number;
    highestBidMade?: number;
  }): Promise<UserStats>;
  getLeaderboard(limit: number): Promise<Array<UserStats & { user: User | null }>>;
}

export class DatabaseStorage implements IStorage {

  async createRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const result = await db.insert(gameRooms).values(insertRoom).returning();
    return result[0];
  }

  async getRoomByCode(code: string): Promise<GameRoom | undefined> {
    const result = await db.select().from(gameRooms).where(eq(gameRooms.code, code));
    return result[0];
  }

  async getRoomById(id: string): Promise<GameRoom | undefined> {
    const result = await db.select().from(gameRooms).where(eq(gameRooms.id, id));
    return result[0];
  }

  async updateRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const result = await db.update(gameRooms).set(updates).where(eq(gameRooms.id, id)).returning();
    return result[0];
  }

  async deleteRoom(id: string): Promise<void> {
    await db.delete(roomPlayers).where(eq(roomPlayers.roomId, id));
    await db.delete(gameRooms).where(eq(gameRooms.id, id));
  }

  async addPlayerToRoom(insertPlayer: InsertRoomPlayer): Promise<RoomPlayer> {
    const result = await db.insert(roomPlayers).values(insertPlayer).returning();
    return result[0];
  }

  async getPlayersInRoom(roomId: string): Promise<RoomPlayer[]> {
    return await db.select().from(roomPlayers).where(eq(roomPlayers.roomId, roomId));
  }

  async getPlayerByToken(token: string): Promise<RoomPlayer | undefined> {
    const result = await db.select().from(roomPlayers).where(eq(roomPlayers.playerToken, token));
    return result[0];
  }

  async updatePlayer(id: string, updates: Partial<RoomPlayer>): Promise<RoomPlayer | undefined> {
    const result = await db.update(roomPlayers).set(updates).where(eq(roomPlayers.id, id)).returning();
    return result[0];
  }

  async removePlayerFromRoom(playerId: string): Promise<void> {
    await db.delete(roomPlayers).where(eq(roomPlayers.id, playerId));
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const result = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return result[0] || null;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      const result = await db.update(userStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(userStats.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userStats)
        .values({ userId, ...stats })
        .returning();
      return result[0];
    }
  }

  async incrementUserStats(userId: string, increments: {
    gamesPlayed?: number;
    gamesWon?: number;
    bidsMade?: number;
    bidsSucceeded?: number;
    timesSet?: number;
    totalPointsScored?: number;
    highestBid?: number;
    highestBidMade?: number;
  }): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (!existing) {
      // Create initial stats record
      const result = await db.insert(userStats)
        .values({
          userId,
          gamesPlayed: increments.gamesPlayed || 0,
          gamesWon: increments.gamesWon || 0,
          bidsMade: increments.bidsMade || 0,
          bidsSucceeded: increments.bidsSucceeded || 0,
          timesSet: increments.timesSet || 0,
          totalPointsScored: increments.totalPointsScored || 0,
          highestBid: increments.highestBid || 0,
          highestBidMade: increments.highestBidMade || 0,
        })
        .returning();
      return result[0];
    }
    
    // Update with increments
    const updates: Record<string, any> = { updatedAt: new Date() };
    
    if (increments.gamesPlayed) updates.gamesPlayed = existing.gamesPlayed + increments.gamesPlayed;
    if (increments.gamesWon) updates.gamesWon = existing.gamesWon + increments.gamesWon;
    if (increments.bidsMade) updates.bidsMade = existing.bidsMade + increments.bidsMade;
    if (increments.bidsSucceeded) updates.bidsSucceeded = existing.bidsSucceeded + increments.bidsSucceeded;
    if (increments.timesSet) updates.timesSet = existing.timesSet + increments.timesSet;
    if (increments.totalPointsScored) updates.totalPointsScored = existing.totalPointsScored + increments.totalPointsScored;
    if (increments.highestBid && increments.highestBid > existing.highestBid) updates.highestBid = increments.highestBid;
    if (increments.highestBidMade && increments.highestBidMade > existing.highestBidMade) updates.highestBidMade = increments.highestBidMade;
    
    const result = await db.update(userStats)
      .set(updates)
      .where(eq(userStats.userId, userId))
      .returning();
    return result[0];
  }

  async getLeaderboard(limit: number): Promise<Array<UserStats & { user: User | null }>> {
    const stats = await db.select()
      .from(userStats)
      .orderBy(desc(userStats.gamesWon))
      .limit(limit);
    
    // Join with user data
    const results = await Promise.all(
      stats.map(async (stat) => {
        const userResult = await db.select().from(users).where(eq(users.id, stat.userId));
        return { ...stat, user: userResult[0] || null };
      })
    );
    
    return results;
  }
}

export const storage = new DatabaseStorage();
