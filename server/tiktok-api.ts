import axios from 'axios';
import { InsertVideo } from '@shared/schema';

// Types for TikTok API responses from tiktok-video-data API
interface TikTokVideoStats {
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
}

interface TikTokVideoData {
  id: string;
  desc: string; // description
  cover: string;
  originCover: string;
  dynamicCover: string;
  url: string;
  createTime: number;
  authorMeta: {
    id: string;
    name: string;
    nickName: string;
  };
  musicMeta: {
    musicId: string;
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
  };
  diggCount: number;
  shareCount: number;
  playCount: number;
  commentCount: number;
  downloaded: boolean;
  hashtags: {
    id: string;
    name: string;
    title: string;
  }[];
}

interface TikTokUserProfile {
  user: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
    avatarMedium: string;
    signature: string;
    verified: boolean;
    stats: {
      followingCount: number;
      followerCount: number;
      heartCount: number;
      videoCount: number;
    };
  };
  stats: {
    followerCount: number;
    followingCount: number;
    heart: number;
    heartCount: number;
    videoCount: number;
  };
}

// TikTok API service using RapidAPI's TikTok API
export class TikTokApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TIKTOK_API_KEY || '';
    this.baseUrl = 'https://tiktok-api-scraper.p.rapidapi.com';

    if (!this.apiKey) {
      console.warn('TIKTOK_API_KEY environment variable is not set');
    }
    
    console.log('TikTok API Service initialized with API key:', this.apiKey ? 'KEY_IS_SET' : 'MISSING_KEY');
  }

  // Fetch user profile information by username
  async getUserProfile(username: string): Promise<TikTokUserProfile> {
    try {
      console.log(`Fetching TikTok profile for username: ${username}`);
      
      // Remove @ symbol if present
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      const response = await axios.get(`${this.baseUrl}/user`, {
        params: { username: cleanUsername },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-api-scraper.p.rapidapi.com'
        }
      });

      if (!response.data || response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      console.log(`Successfully retrieved profile for ${username}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching TikTok user profile:', error?.response?.data || error.message || error);
      throw new Error(`Failed to fetch TikTok user profile: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  }

  // Fetch user videos by username
  async getUserVideos(username: string, limit = 30): Promise<TikTokVideoData[]> {
    try {
      console.log(`Fetching TikTok videos for username: ${username}, limit: ${limit}`);
      
      // Remove @ symbol if present
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      const response = await axios.get(`${this.baseUrl}/user/videos`, {
        params: { 
          username: cleanUsername, 
          count: limit
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-api-scraper.p.rapidapi.com'
        }
      });

      if (!response.data || response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const videos = response.data;
      console.log(`Successfully retrieved ${videos.length} videos for ${username}`);
      return videos;
    } catch (error: any) {
      console.error('Error fetching TikTok user videos:', error?.response?.data || error.message || error);
      throw new Error(`Failed to fetch TikTok user videos: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  }

  // Convert TikTok API format to our application's video format
  convertToAppVideo(tiktokVideo: any, accountId: number): InsertVideo {
    console.log('Converting TikTok video to app format:', 
      JSON.stringify({
        id: tiktokVideo.id || tiktokVideo.video_id,
        desc: tiktokVideo.desc || tiktokVideo.description || 'No description'
      })
    );
    
    // Handle different API response formats
    let hashtags: string[] = [];
    let description = tiktokVideo.desc || tiktokVideo.description || '';
    
    // Extract hashtags from description
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(description)) !== null) {
      hashtags.push(match[1]);
    }

    return {
      accountId,
      title: description || 'No description',
      thumbnailUrl: tiktokVideo.cover || tiktokVideo.thumbnail_url || tiktokVideo.cover_image_url || '',
      videoUrl: tiktokVideo.url || tiktokVideo.video_url || '',
      views: tiktokVideo.playCount || tiktokVideo.play_count || tiktokVideo.stats?.playCount || tiktokVideo.stats?.play_count || 0,
      likes: tiktokVideo.diggCount || tiktokVideo.like_count || tiktokVideo.stats?.diggCount || tiktokVideo.stats?.like_count || 0,
      comments: tiktokVideo.commentCount || tiktokVideo.comment_count || tiktokVideo.stats?.commentCount || tiktokVideo.stats?.comment_count || 0,
      shares: tiktokVideo.shareCount || tiktokVideo.share_count || tiktokVideo.stats?.shareCount || tiktokVideo.stats?.share_count || 0,
      hashtags
    };
  }

  // Handle API errors
  handleApiError(error: any): never {
    console.error('TikTok API Error:', error.message || error);
    throw new Error(`TikTok API Error: ${error.message || 'Unknown error'}`);
  }
}

export const tiktokApiService = new TikTokApiService();