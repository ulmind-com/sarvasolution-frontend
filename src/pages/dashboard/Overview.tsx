import { useAuth } from '@/contexts/AuthContext';
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
  const { currentUser, transactions } = useAuth();
  
  const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
  const totalIncome = userTransactions
    .filter(t => t.type === 'commission' || t.type === 'bonus')
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const copyReferralLink = () => {
    const link = `https://ulmind.com/join/${currentUser?.id}`;
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
      title: 'Total Income',
      value: `₹${totalIncome.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Wallet Balance',
      value: `₹${currentUser?.balance.toLocaleString() || 0}`,
      change: '+8.2%',
      changeType: 'positive',
      icon: Wallet
    },
    {
      title: 'Team Size',
      value: '120',
      change: '+24',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Current Rank',
      value: currentUser?.rank || 'Starter',
      change: 'Next: Platinum',
      changeType: 'neutral',
      icon: Award
    }
  ];

  const recentActivity = [
    { type: 'commission', amount: 2500, user: 'Amit Kumar', time: '2 hours ago' },
    { type: 'signup', user: 'New member joined', time: '5 hours ago' },
    { type: 'purchase', amount: 1899, product: 'Energy Boost Powder', time: '1 day ago' },
    { type: 'commission', amount: 1500, user: 'Sneha Reddy', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {currentUser?.name?.split(' ')[0]}!</h1>
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
      
      {/* PV Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Business Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Left Leg PV</p>
                <p className="text-3xl font-bold text-accent-foreground">
                  {currentUser?.leftPV.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Leg PV</p>
                <p className="text-3xl font-bold text-accent-foreground">
                  {currentUser?.rightPV.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Matching Bonus: </span>
                Earn 10% on your weaker leg volume every week
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
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'commission' ? 'bg-primary' :
                    activity.type === 'signup' ? 'bg-chart-2' :
                    'bg-chart-3'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.type === 'commission' && `Commission from ${activity.user}`}
                      {activity.type === 'signup' && activity.user}
                      {activity.type === 'purchase' && `Purchased ${activity.product}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className={`text-sm font-medium ${
                      activity.type === 'purchase' ? 'text-destructive' : 'text-primary'
                    }`}>
                      {activity.type === 'purchase' ? '-' : '+'}₹{activity.amount.toLocaleString()}
                    </span>
                  )}
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
                Share your unique referral link and earn ₹500 for every successful signup!
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
