export interface User {
  id: number;
  username: string;
  email: string;
}

export interface TikTokAccount {
  id: number;
  userId: number;
  username: string;
  profileUrl: string;
}

export interface Video {
  id: number;
  accountId: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  hashtags: string[];
}

export interface AccountStats {
  totalViews: number;
  totalLikes: number;
  newFollowers: number;
  avgEngagement: number;
  viewsGrowth: number;
  likesGrowth: number;
  followersGrowth: number;
  engagementGrowth: number;
}
