import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "wouter";
import { AccountStats, TikTokAccount, Video } from "@/types";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TikTokForm } from "@/components/dashboard/tiktok-form";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { VideoGrid } from "@/components/dashboard/video-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
  
  // Fetch TikTok accounts
  const { 
    data: accounts, 
    isLoading: accountsLoading 
  } = useQuery({
    queryKey: ["/api/tiktok/accounts"],
    enabled: !!user,
  });

  // Set the first account as selected if available
  useEffect(() => {
    if (accounts?.length && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  // Fetch top videos
  const { 
    data: topVideos, 
    isLoading: topVideosLoading 
  } = useQuery<Video[]>({
    queryKey: [`/api/tiktok/accounts/${selectedAccount?.id}/videos/top`],
    enabled: !!selectedAccount,
  });

  // Fetch bottom videos
  const { 
    data: bottomVideos, 
    isLoading: bottomVideosLoading 
  } = useQuery<Video[]>({
    queryKey: [`/api/tiktok/accounts/${selectedAccount?.id}/videos/bottom`],
    enabled: !!selectedAccount,
  });

  // If not authenticated, redirect to home page
  if (!authLoading && !user) {
    return <Redirect to="/" />;
  }

  // Calculate account stats based on videos data
  const calculateAccountStats = (): AccountStats => {
    if (!topVideos && !bottomVideos) {
      return {
        totalViews: 2400000,
        totalLikes: 356000,
        newFollowers: 12800,
        avgEngagement: 5.7,
        viewsGrowth: 14.2,
        likesGrowth: 7.6,
        followersGrowth: -3.2,
        engagementGrowth: 1.3
      };
    }

    const allVideos = [...(topVideos || []), ...(bottomVideos || [])];
    const totalViews = allVideos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = allVideos.reduce((sum, video) => sum + video.likes, 0);
    
    // These would normally be calculated based on actual data over time
    return {
      totalViews,
      totalLikes,
      newFollowers: Math.round(totalViews * 0.005),  // Mocked calculation
      avgEngagement: parseFloat(((totalLikes / totalViews) * 100).toFixed(1)),
      viewsGrowth: 14.2,
      likesGrowth: 7.6,
      followersGrowth: -3.2,
      engagementGrowth: 1.3
    };
  };

  const isLoading = authLoading || accountsLoading || (selectedAccount && (topVideosLoading || bottomVideosLoading));

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TikTokForm onAccountAdded={(account) => setSelectedAccount(account)} />

          {isLoading ? (
            <DashboardSkeleton />
          ) : accounts?.length ? (
            <>
              <AccountOverview 
                username={selectedAccount?.username || "username"} 
                stats={calculateAccountStats()} 
              />
              <VideoGrid 
                title="Top Performing Videos" 
                videos={topVideos || []} 
                showRanking 
              />
              <VideoGrid 
                title="Lowest Performing Videos" 
                videos={bottomVideos || []} 
              />
            </>
          ) : (
            <div className="bg-white shadow-card rounded-lg p-8 text-center">
              <h2 className="text-lg font-medium text-text-primary mb-2">No TikTok accounts found</h2>
              <p className="text-text-secondary mb-4">
                Connect your TikTok account to see your analytics
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="bg-white shadow-card rounded-lg mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </>
  );
}
