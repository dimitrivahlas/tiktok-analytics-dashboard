import { 
  users, type User, type InsertUser,
  tiktokAccounts, type TikTokAccount, type InsertTikTokAccount,
  videos, type Video, type InsertVideo 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import { tiktokApiService } from "./tiktok-api";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // TikTok Account methods
  getTikTokAccountsByUserId(userId: number): Promise<TikTokAccount[]>;
  createTikTokAccount(account: InsertTikTokAccount): Promise<TikTokAccount>;
  
  // Video methods
  getVideosByAccountId(accountId: number): Promise<Video[]>;
  getTopVideosByAccountId(accountId: number, limit: number): Promise<Video[]>;
  getBottomVideosByAccountId(accountId: number, limit: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  deleteVideosByAccountId(accountId: number): Promise<void>;
  refreshAccountVideos(accountId: number, newVideos: InsertVideo[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // TikTok Account methods
  async getTikTokAccountsByUserId(userId: number): Promise<TikTokAccount[]> {
    return await db.select()
      .from(tiktokAccounts)
      .where(eq(tiktokAccounts.userId, userId));
  }

  async createTikTokAccount(insertAccount: InsertTikTokAccount): Promise<TikTokAccount> {
    const [account] = await db.insert(tiktokAccounts)
      .values(insertAccount)
      .returning();
    
    // Fetch real TikTok videos for this account
    try {
      await this.fetchAndSaveTikTokVideos(account.id, insertAccount.username);
    } catch (error) {
      console.error('Failed to fetch TikTok videos:', error);
      // Fallback to mock videos if API fails
      await this.createMockVideos(account.id);
    }
    
    return account;
  }

  // Video methods
  async getVideosByAccountId(accountId: number): Promise<Video[]> {
    return await db.select()
      .from(videos)
      .where(eq(videos.accountId, accountId));
  }

  async getTopVideosByAccountId(accountId: number, limit: number): Promise<Video[]> {
    return await db.select()
      .from(videos)
      .where(eq(videos.accountId, accountId))
      .orderBy(desc(videos.views))
      .limit(limit);
  }

  async getBottomVideosByAccountId(accountId: number, limit: number): Promise<Video[]> {
    return await db.select()
      .from(videos)
      .where(eq(videos.accountId, accountId))
      .orderBy(asc(videos.views))
      .limit(limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos)
      .values(insertVideo)
      .returning();
    return video;
  }
  
  async deleteVideosByAccountId(accountId: number): Promise<void> {
    await db.delete(videos)
      .where(eq(videos.accountId, accountId));
  }
  
  async refreshAccountVideos(accountId: number, newVideos: InsertVideo[]): Promise<void> {
    // Use a transaction to ensure atomicity (delete old videos and add new ones)
    await db.transaction(async (tx) => {
      // Delete all existing videos for this account
      await tx.delete(videos)
        .where(eq(videos.accountId, accountId));
      
      // Insert the new videos
      if (newVideos.length > 0) {
        await tx.insert(videos).values(newVideos);
      }
    });
  }

  // Helper method to fetch and save real TikTok videos
  private async fetchAndSaveTikTokVideos(accountId: number, username: string): Promise<void> {
    try {
      console.log(`Fetching TikTok videos for account: ${username}`);
      
      // Get videos from TikTok API
      const tiktokVideosResponse: any = await tiktokApiService.getUserVideos(username);
      console.log(`Raw API response structure:`, Object.keys(tiktokVideosResponse || {}));
      
      // Handle different API response formats
      let tiktokVideos: any[] = [];
      
      if (Array.isArray(tiktokVideosResponse)) {
        tiktokVideos = tiktokVideosResponse;
      } else if (tiktokVideosResponse && typeof tiktokVideosResponse === 'object') {
        const responseObj: any = tiktokVideosResponse;
        // Check for common response patterns in different APIs
        if (responseObj.data && Array.isArray(responseObj.data)) {
          tiktokVideos = responseObj.data;
        } else if (responseObj.videos && Array.isArray(responseObj.videos)) {
          tiktokVideos = responseObj.videos;
        } else if (responseObj.items && Array.isArray(responseObj.items)) {
          tiktokVideos = responseObj.items;
        } else if (responseObj.aweme_list && Array.isArray(responseObj.aweme_list)) {
          // TokAPI specific response format
          tiktokVideos = responseObj.aweme_list;
        }
      }
      
      if (!tiktokVideos || tiktokVideos.length === 0) {
        console.warn(`No videos found for TikTok account: ${username}`);
        throw new Error('No videos found or invalid response format');
      }
      
      console.log(`Found ${tiktokVideos.length} videos for account: ${username}`);
      
      // Sample the first video to see structure (for debugging)
      if (tiktokVideos.length > 0) {
        console.log(`Sample video structure:`, Object.keys(tiktokVideos[0]));
      }
      
      // Convert TikTok videos to our application format
      const videoInserts: InsertVideo[] = tiktokVideos.map((video: any) => 
        tiktokApiService.convertToAppVideo(video, accountId)
      );
      
      // Save videos to database
      if (videoInserts.length > 0) {
        await db.insert(videos).values(videoInserts);
        console.log(`Saved ${videoInserts.length} videos to database for account ID: ${accountId}`);
      }
    } catch (error) {
      console.error('Error fetching TikTok videos:', error);
      throw error;
    }
  }

  // Helper method to create mock videos for a new account
  private async createMockVideos(accountId: number): Promise<void> {
    // Top performing videos
    const topVideos = [
      {
        title: "Morning routine: 5 steps to kickstart productivity",
        thumbnailUrl: "https://images.unsplash.com/photo-1640271443625-3276ed8f62b5",
        videoUrl: "https://www.tiktok.com/@username/video/1",
        views: 1200000,
        likes: 253000,
        comments: 14200,
        shares: 76300,
        hashtags: ["morningroutine", "productivity"],
      },
      {
        title: "3 quick smoothie recipes for busy mornings",
        thumbnailUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
        videoUrl: "https://www.tiktok.com/@username/video/2",
        views: 890000,
        likes: 189000,
        comments: 8700,
        shares: 42100,
        hashtags: ["smoothies", "healthyrecipes"],
      },
      {
        title: "How I saved $10K in 6 months (finance tips)",
        thumbnailUrl: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d",
        videoUrl: "https://www.tiktok.com/@username/video/3",
        views: 750000,
        likes: 165000,
        comments: 11200,
        shares: 31500,
        hashtags: ["finance", "moneytips"],
      }
    ];

    // Bottom performing videos
    const bottomVideos = [
      {
        title: "My thoughts on the new sustainable fashion trend",
        thumbnailUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4",
        videoUrl: "https://www.tiktok.com/@username/video/4",
        views: 15700,
        likes: 2100,
        comments: 245,
        shares: 86,
        hashtags: ["fashion", "sustainability"],
      },
      {
        title: "Book review: The Silent Patient",
        thumbnailUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1",
        videoUrl: "https://www.tiktok.com/@username/video/5",
        views: 12300,
        likes: 1800,
        comments: 142,
        shares: 53,
        hashtags: ["bookreview", "reading"],
      },
      {
        title: "My thoughts on the latest tech gadgets",
        thumbnailUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
        videoUrl: "https://www.tiktok.com/@username/video/6",
        views: 10500,
        likes: 1400,
        comments: 98,
        shares: 25,
        hashtags: ["tech", "gadgets"],
      }
    ];

    // Additional videos for diversity in results
    const middleVideos = [
      {
        title: "5 minute ab workout you can do anywhere",
        thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        videoUrl: "https://www.tiktok.com/@username/video/7",
        views: 450000,
        likes: 95000,
        comments: 5600,
        shares: 18200,
        hashtags: ["fitness", "workout"],
      },
      {
        title: "Easy dinner recipe: 15-minute pasta",
        thumbnailUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
        videoUrl: "https://www.tiktok.com/@username/video/8",
        views: 320000,
        likes: 68000,
        comments: 3400,
        shares: 12800,
        hashtags: ["recipe", "easymeals"],
      }
    ];

    // Create all the mock videos
    const videoInserts: InsertVideo[] = [];
    [...topVideos, ...middleVideos, ...bottomVideos].forEach(video => {
      videoInserts.push({
        accountId,
        ...video
      });
    });

    if (videoInserts.length > 0) {
      await db.insert(videos).values(videoInserts);
    }
  }
}

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();
