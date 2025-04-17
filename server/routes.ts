import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  tiktokProfileSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      req.session = { userId: user.id };
      return res.status(201).json(userWithoutPassword);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // In a real app, we would check hashed passwords
      if (user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user id in session
      req.session = { userId: user.id };
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session = null;
    return res.status(200).json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      req.session = null;
      return res.status(401).json({ message: "User not found" });
    }
    
    // Don't return the password in the response
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  });

  // TikTok account routes
  app.post("/api/tiktok/accounts", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { profileUrl } = tiktokProfileSchema.parse(req.body);
      
      // Extract username from TikTok profile URL
      // Example: https://www.tiktok.com/@username
      const match = profileUrl.match(/@([a-zA-Z0-9_.]+)/);
      if (!match) {
        return res.status(400).json({ message: "Invalid TikTok profile URL format" });
      }
      
      const username = match[1];
      
      const account = await storage.createTikTokAccount({
        userId,
        username,
        profileUrl
      });
      
      return res.status(201).json(account);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Failed to add TikTok account" });
    }
  });

  app.get("/api/tiktok/accounts", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const accounts = await storage.getTikTokAccountsByUserId(userId);
    return res.status(200).json(accounts);
  });

  // Video routes
  app.get("/api/tiktok/accounts/:accountId/videos/top", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const accountId = parseInt(req.params.accountId);
    const limit = parseInt(req.query.limit?.toString() || "3");
    
    const videos = await storage.getTopVideosByAccountId(accountId, limit);
    return res.status(200).json(videos);
  });

  app.get("/api/tiktok/accounts/:accountId/videos/bottom", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const accountId = parseInt(req.params.accountId);
    const limit = parseInt(req.query.limit?.toString() || "3");
    
    const videos = await storage.getBottomVideosByAccountId(accountId, limit);
    return res.status(200).json(videos);
  });

  app.get("/api/tiktok/accounts/:accountId/videos", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const accountId = parseInt(req.params.accountId);
    
    const videos = await storage.getVideosByAccountId(accountId);
    return res.status(200).json(videos);
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
