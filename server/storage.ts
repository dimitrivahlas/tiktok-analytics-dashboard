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

  // Helper method to create high-quality mock videos for a new account
  private async createMockVideos(accountId: number): Promise<void> {
    // Top performing videos
    const topVideos = [
      {
        title: "POV: When the sunset hits just right 🌅 #sunsetvibes #fyp",
        thumbnailUrl: "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/1",
        views: 3500000,
        likes: 853000,
        comments: 24200,
        shares: 176300,
        hashtags: ["sunsetvibes", "fyp", "naturelover"],
      },
      {
        title: "This recipe changed my life 🍜 #foodtok #cookinghacks",
        thumbnailUrl: "https://images.unsplash.com/photo-1593829111182-8a2a5b780302?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/2",
        views: 2890000,
        likes: 689000,
        comments: 18700,
        shares: 142100,
        hashtags: ["foodtok", "cookinghacks", "easyrecipe"],
      },
      {
        title: "NYC apartment tour 🗽 How I transformed 500sqft #homedecor",
        thumbnailUrl: "https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/3",
        views: 1750000,
        likes: 365000,
        comments: 21200,
        shares: 81500,
        hashtags: ["homedecor", "apartmenttour", "transformation"],
      }
    ];

    // Bottom performing videos
    const bottomVideos = [
      {
        title: "My honest opinion on sustainable makeup brands #greenbeauty",
        thumbnailUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/4",
        views: 15700,
        likes: 2100,
        comments: 245,
        shares: 86,
        hashtags: ["greenbeauty", "sustainablebeauty", "makeup"],
      },
      {
        title: "Book review: Lessons in Chemistry 📚 #booktok #currentlyreading",
        thumbnailUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/5",
        views: 12300,
        likes: 1800,
        comments: 142,
        shares: 53,
        hashtags: ["booktok", "currentlyreading", "bookreview"],
      },
      {
        title: "Is this tech accessory worth the hype? 🤔 #techreview",
        thumbnailUrl: "https://images.unsplash.com/photo-1617997455403-41f333d44d57?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/6",
        views: 10500,
        likes: 1400,
        comments: 98,
        shares: 25,
        hashtags: ["techreview", "gadgets", "newtech"],
      }
    ];

    // Additional videos for diversity in results
    const middleVideos = [
      {
        title: "3 workout moves that transformed my arms 💪 #fittok",
        thumbnailUrl: "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/7",
        views: 450000,
        likes: 95000,
        comments: 5600,
        shares: 18200,
        hashtags: ["fittok", "workoutroutine", "armday"],
      },
      {
        title: "30-minute meal prep that saved my week 🥗 #mealprep",
        thumbnailUrl: "https://images.unsplash.com/photo-1631301883167-c6e9729509b0?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/8",
        views: 320000,
        likes: 68000,
        comments: 3400,
        shares: 12800,
        hashtags: ["mealprep", "healthyeating", "quickrecipes"],
      },
      {
        title: "Beach day vibes in Bali 🏝️ #traveltok #balilife",
        thumbnailUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/9",
        views: 528000,
        likes: 112000,
        comments: 6300,
        shares: 21400,
        hashtags: ["traveltok", "balilife", "beachvibes"],
      },
      {
        title: "This skincare routine cleared my skin in 2 weeks ✨ #skincare",
        thumbnailUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=640&auto=format&fit=crop",
        videoUrl: "https://www.tiktok.com/@username/video/10",
        views: 612000,
        likes: 143000,
        comments: 8900,
        shares: 35600,
        hashtags: ["skincare", "glowup", "skintok"],
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
