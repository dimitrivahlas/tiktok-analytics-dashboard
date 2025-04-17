import { VideoCard } from "./video-card";
import { Video } from "@/types";

interface VideoGridProps {
  title: string;
  videos: Video[];
  showRanking?: boolean;
}

export function VideoGrid({ title, videos, showRanking = false }: VideoGridProps) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-text-primary mb-6">{title}</h2>
      {videos.length === 0 ? (
        <div className="text-center py-8 bg-background-secondary rounded-lg">
          <p className="text-text-secondary">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              rank={showRanking ? index + 1 : undefined} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
