import { 
  users, type User, type InsertUser,
  tiktokAccounts, type TikTokAccount, type InsertTikTokAccount,
  videos, type Video, type InsertVideo 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tiktokAccounts: Map<number, TikTokAccount>;
  private videos: Map<number, Video>;
  
  private userIdCounter: number;
  private accountIdCounter: number;
  private videoIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tiktokAccounts = new Map();
    this.videos = new Map();
    
    this.userIdCounter = 1;
    this.accountIdCounter = 1;
    this.videoIdCounter = 1;
    
    // Add a demo user
    this.createUser({
      username: "demouser",
      email: "demo@example.com",
      password: "password123"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // TikTok Account methods
  async getTikTokAccountsByUserId(userId: number): Promise<TikTokAccount[]> {
    return Array.from(this.tiktokAccounts.values()).filter(
      (account) => account.userId === userId,
    );
  }

  async createTikTokAccount(insertAccount: InsertTikTokAccount): Promise<TikTokAccount> {
    const id = this.accountIdCounter++;
    const account: TikTokAccount = { ...insertAccount, id };
    this.tiktokAccounts.set(id, account);
    
    // Create mock videos for this account
    this.createMockVideos(id);
    
    return account;
  }

  // Video methods
  async getVideosByAccountId(accountId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.accountId === accountId,
    );
  }

  async getTopVideosByAccountId(accountId: number, limit: number): Promise<Video[]> {
    const accountVideos = await this.getVideosByAccountId(accountId);
    return accountVideos
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async getBottomVideosByAccountId(accountId: number, limit: number): Promise<Video[]> {
    const accountVideos = await this.getVideosByAccountId(accountId);
    return accountVideos
      .sort((a, b) => a.views - b.views)
      .slice(0, limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const createdAt = new Date();
    const video: Video = { ...insertVideo, id, createdAt };
    this.videos.set(id, video);
    return video;
  }

  // Helper method to create mock videos for a new account
  private createMockVideos(accountId: number): void {
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
    [...topVideos, ...middleVideos, ...bottomVideos].forEach(video => {
      this.createVideo({
        accountId,
        ...video
      });
    });
  }
}

export const storage = new MemStorage();
