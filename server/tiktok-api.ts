import axios from 'axios';
import { InsertVideo } from '@shared/schema';

// Types for TikTok API responses
interface TikTokVideoStats {
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
}

interface TikTokVideoData {
  id: string;
  description: string;
  cover: string;
  video: {
    playAddr: string;
  };
  stats: TikTokVideoStats;
  createTime: number;
}

interface TikTokUserProfile {
  id: string;
  uniqueId: string;
  nickname: string;
  avatarThumb: string;
  signature: string;
  stats: {
    followingCount: number;
    followerCount: number;
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
    this.baseUrl = 'https://tiktok-api-wrapper.p.rapidapi.com';

    if (!this.apiKey) {
      console.warn('TIKTOK_API_KEY environment variable is not set');
    }
  }

  // Fetch user profile information by username
  async getUserProfile(username: string): Promise<TikTokUserProfile> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-api-wrapper.p.rapidapi.com'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok user profile:', error);
      throw new Error('Failed to fetch TikTok user profile');
    }
  }

  // Fetch user videos by username
  async getUserVideos(username: string, limit = 30): Promise<TikTokVideoData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/videos/${username}`, {
        params: { count: limit },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'tiktok-api-wrapper.p.rapidapi.com'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok user videos:', error);
      throw new Error('Failed to fetch TikTok user videos');
    }
  }

  // Convert TikTok API video format to our application's video format
  convertToAppVideo(tiktokVideo: TikTokVideoData, accountId: number): InsertVideo {
    // Extract hashtags from description
    const hashtagRegex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(tiktokVideo.description)) !== null) {
      hashtags.push(match[1]);
    }

    return {
      accountId,
      title: tiktokVideo.description || 'No description',
      thumbnailUrl: tiktokVideo.cover,
      videoUrl: tiktokVideo.video.playAddr,
      views: tiktokVideo.stats.playCount || 0,
      likes: tiktokVideo.stats.diggCount || 0,
      comments: tiktokVideo.stats.commentCount || 0,
      shares: tiktokVideo.stats.shareCount || 0,
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