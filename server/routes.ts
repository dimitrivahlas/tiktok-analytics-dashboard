import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { tiktokApiService } from "./tiktok-api";
import { 
  loginSchema, 
  registerSchema, 
  tiktokProfileSchema 
} from "@shared/schema";
import { z } from "zod";

// Extend Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

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
      
      req.session.userId = user.id;
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
      req.session.userId = user.id;
      
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
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      req.session.destroy((err) => {
        console.error('Session destroy error:', err);
      });
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
      
      try {
        // Try to verify the TikTok user profile exists
        console.log(`Verifying TikTok profile for username: ${username}`);
        await tiktokApiService.getUserProfile(username);
        
        // Create the account in our database
        const account = await storage.createTikTokAccount({
          userId,
          username,
          profileUrl
        });
        
        return res.status(201).json(account);
      } catch (apiError) {
        console.error('TikTok API error:', apiError);
        
        // If we couldn't verify with the API, still allow adding the account
        // but log a warning (the storage class will handle fallback to mock data)
        console.warn(`Couldn't verify TikTok profile via API for ${username}, proceeding anyway`);
        
        const account = await storage.createTikTokAccount({
          userId,
          username,
          profileUrl
        });
        
        return res.status(201).json(account);
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Error adding TikTok account:', error);
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
  
  // Refresh videos for an account from TikTok API
  app.post("/api/tiktok/accounts/:accountId/refresh", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accountId = parseInt(req.params.accountId);
      
      // Get the account to get the username
      const accounts = await storage.getTikTokAccountsByUserId(userId);
      const account = accounts.find(acc => acc.id === accountId);
      
      if (!account) {
        return res.status(404).json({ message: "TikTok account not found" });
      }
      
      // Re-fetch videos from TikTok API
      try {
        console.log(`Refreshing videos for account: ${account.username} (ID: ${accountId})`);
        const videos = await tiktokApiService.getUserVideos(account.username);
        
        if (!videos || videos.length === 0) {
          return res.status(404).json({ message: "No videos found for this account" });
        }
        
        // Convert TikTok videos to our format
        const videoInserts = videos.map((video: any) => 
          tiktokApiService.convertToAppVideo(video, accountId)
        );
        
        // Use our transaction method to replace all videos
        await storage.refreshAccountVideos(accountId, videoInserts);
        
        return res.status(200).json({ 
          message: "Account videos refreshed successfully",
          count: videos.length
        });
      } catch (error) {
        const apiError = error as Error;
        console.error('TikTok API error during refresh:', apiError);
        return res.status(500).json({ 
          message: "Failed to refresh videos from TikTok API",
          error: apiError.message
        });
      }
    } catch (error) {
      console.error('Error refreshing account videos:', error);
      return res.status(500).json({ message: "Failed to refresh account videos" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
