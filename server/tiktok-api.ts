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
    this.baseUrl = 'https://tiktok-video-data.p.rapidapi.com';

    if (!this.apiKey) {
      console.warn('TIKTOK_API_KEY environment variable is not set');
    }
  }

  // Fetch user profile information by username
  async getUserProfile(username: string): Promise<TikTokUserProfile> {
    try {
      console.log(`Fetching TikTok profile for username: ${username}`);
      
      const response = await axios.get(`${this.baseUrl}/user/info`, {
        params: { unique_id: username },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-video-data.p.rapidapi.com'
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
      
      const response = await axios.get(`${this.baseUrl}/feed/user`, {
        params: { 
          unique_id: username, 
          count: limit
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-video-data.p.rapidapi.com'
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

  // Convert TikTok API video format to our application's video format
  convertToAppVideo(tiktokVideo: TikTokVideoData, accountId: number): InsertVideo {
    // Get hashtags from the API response if available or extract from description
    let hashtags: string[] = [];
    
    if (tiktokVideo.hashtags && tiktokVideo.hashtags.length > 0) {
      // Use API-provided hashtags
      hashtags = tiktokVideo.hashtags.map(tag => tag.name);
    } else {
      // Extract hashtags from description as fallback
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(tiktokVideo.desc)) !== null) {
        hashtags.push(match[1]);
      }
    }

    return {
      accountId,
      title: tiktokVideo.desc || 'No description',
      thumbnailUrl: tiktokVideo.cover || tiktokVideo.originCover || tiktokVideo.dynamicCover,
      videoUrl: tiktokVideo.url,
      views: tiktokVideo.playCount || 0,
      likes: tiktokVideo.diggCount || 0,
      comments: tiktokVideo.commentCount || 0,
      shares: tiktokVideo.shareCount || 0,
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