import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountStats } from "@/types";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatItemProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
}

function StatItem({ title, value, change, changeLabel }: StatItemProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-background-secondary px-4 py-5 rounded-lg overflow-hidden">
      <dt className="text-sm font-medium text-text-secondary truncate">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold text-text-primary">{value}</dd>
      <dd className="mt-2 flex items-center text-sm">
        <span className={`font-medium flex items-center ${isPositive ? 'text-status-success' : 'text-status-error'}`}>
          {isPositive ? (
            <ArrowUp className="self-center flex-shrink-0 h-5 w-5 mr-1" />
          ) : (
            <ArrowDown className="self-center flex-shrink-0 h-5 w-5 mr-1" />
          )}
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="ml-2 text-text-secondary">{changeLabel}</span>
      </dd>
    </div>
  );
}

interface AccountOverviewProps {
  username: string;
  stats: AccountStats;
}

export function AccountOverview({ username, stats }: AccountOverviewProps) {
  return (
    <Card className="bg-white shadow-card rounded-lg mb-8 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-text-primary">Account Overview</CardTitle>
            <p className="mt-1 text-sm text-text-secondary">Last 30 days performance</p>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <span>@{username}</span>
            <div className="ml-3 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">{username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem
            title="Total Views"
            value={formatNumber(stats.totalViews)}
            change={stats.viewsGrowth}
            changeLabel="vs. last month"
          />
          <StatItem
            title="Total Likes"
            value={formatNumber(stats.totalLikes)}
            change={stats.likesGrowth}
            changeLabel="vs. last month"
          />
          <StatItem
            title="New Followers"
            value={formatNumber(stats.newFollowers)}
            change={stats.followersGrowth}
            changeLabel="vs. last month"
          />
          <StatItem
            title="Avg. Engagement"
            value={`${stats.avgEngagement}%`}
            change={stats.engagementGrowth}
            changeLabel="vs. last month"
          />
        </dl>
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
