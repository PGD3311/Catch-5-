import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { isValidPin, getPlayerNameFromPin } from "@shared/pinCodes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get current user's stats (Replit Auth)
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get stats by PIN code
  app.get("/api/stats/pin/:pin", async (req, res) => {
    try {
      const { pin } = req.params;
      if (!isValidPin(pin)) {
        return res.status(400).json({ message: "Invalid PIN code" });
      }
      const stats = await storage.getUserStats(pin);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching PIN stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get leaderboard (Replit Auth)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get PIN-based leaderboard
  app.get("/api/leaderboard/pin", async (req, res) => {
    try {
      const leaderboard = await storage.getPinLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching PIN leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
