import { Video } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface VideoCardProps {
  video: Video;
  rank?: number;
}

export function VideoCard({ video, rank }: VideoCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
      <div className="relative pb-[177.77%]">
        <img 
          src={`${video.thumbnailUrl}?auto=format&fit=crop&w=500&q=80`}
          alt={video.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <div className="text-white">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-1" />
              <span className="font-medium">{formatNumber(video.views)}</span>
            </div>
          </div>
        </div>
        {rank && (
          <div className="absolute top-3 right-3 bg-secondary text-white text-sm font-medium px-2 py-1 rounded">
            #{rank}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-text-primary line-clamp-2">{video.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {video.hashtags.map((tag, index) => (
            <span key={index} className="px-2 py-1 rounded-full bg-background-secondary text-text-secondary">
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm border-t pt-4">
          <div className="text-center">
            <div className="font-medium text-text-primary">{formatNumber(video.likes)}</div>
            <div className="text-text-secondary text-xs">Likes</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-text-primary">{formatNumber(video.comments)}</div>
            <div className="text-text-secondary text-xs">Comments</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-text-primary">{formatNumber(video.shares)}</div>
            <div className="text-text-secondary text-xs">Shares</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format numbers with K, M, etc.
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
