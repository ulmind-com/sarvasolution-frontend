import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Award, 
  Copy, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

const Overview = () => {
  const { user } = useAuthStore();
  
  // Use real data from the authenticated user
  const walletBalance = user?.wallet?.availableBalance || 0;
  const totalEarnings = user?.wallet?.totalEarnings || 0;
  const leftTeamCount = user?.leftTeamCount || 0;
  const rightTeamCount = user?.rightTeamCount || 0;
  const rank = user?.rank || 'Starter';
  const userName = user?.fullName?.split(' ')[0] || 'User';
  const memberId = user?.memberId || '';

  const copyReferralLink = () => {
    const link = `https://sarvasolutionvision.com/join/${memberId}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: typeof TrendingUp;
  }> = [
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString()}`,
      change: 'Lifetime',
      changeType: 'neutral',
      icon: TrendingUp
    },
    {
      title: 'Wallet Balance',
      value: `₹${walletBalance.toLocaleString()}`,
      change: 'Available',
      changeType: 'positive',
      icon: Wallet
    },
    {
      title: 'Member ID',
      value: memberId || 'N/A',
      change: 'Your unique ID',
      changeType: 'neutral',
      icon: Users
    },
    {
      title: 'Current Rank',
      value: rank,
      change: 'Keep growing!',
      changeType: 'neutral',
      icon: Award
    }
  ];

  const recentActivity = [
    { type: 'info', message: 'Welcome to Sarva Solution Vision!', time: 'Just now' },
    { type: 'info', message: 'Complete your profile for better experience', time: 'Tip' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your network today.</p>
        </div>
        <Button onClick={copyReferralLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Referral Link
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.changeType === 'positive' && (
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                )}
                {stat.changeType === 'negative' && (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-primary' : 
                  stat.changeType === 'negative' ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Team Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Network Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Left Team</p>
                <p className="text-3xl font-bold text-accent-foreground">
                  {leftTeamCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Members</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Team</p>
                <p className="text-3xl font-bold text-accent-foreground">
                  {rightTeamCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Members</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tip: </span>
                Grow your team to unlock higher ranks
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Referral Card */}
      <Card className="border-border bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Invite Friends & Earn More</h3>
              <p className="text-primary-foreground/80 mt-1">
                Share your unique referral link and grow your network!
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={copyReferralLink}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
