import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight 
} from 'lucide-react';

const AdminHome = () => {
  const { allUsers, transactions } = useAuth();
  
  const pendingPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const totalPendingAmount = pendingPayouts.reduce((sum, t) => sum + t.amount, 0);
  const completedPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed');
  const totalPaidAmount = completedPayouts.reduce((sum, t) => sum + t.amount, 0);
  const activeUsers = allUsers.filter(u => u.status === 'active').length;

  const stats = [
    {
      title: 'Total Users',
      value: allUsers.length.toString(),
      change: '+12 this week',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      change: `${Math.round((activeUsers / allUsers.length) * 100)}% active`,
      icon: TrendingUp,
      color: 'text-chart-1'
    },
    {
      title: 'Pending Payouts',
      value: `₹${totalPendingAmount.toLocaleString()}`,
      change: `${pendingPayouts.length} requests`,
      icon: CreditCard,
      color: 'text-chart-4'
    },
    {
      title: 'Total Paid Out',
      value: `₹${totalPaidAmount.toLocaleString()}`,
      change: '+₹50,000 this month',
      icon: DollarSign,
      color: 'text-chart-2'
    }
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your MLM network</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-primary" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => {
                const user = allUsers.find(u => u.id === tx.userId);
                return (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        tx.status === 'pending' ? 'bg-chart-4' :
                        tx.status === 'completed' ? 'bg-primary' :
                        'bg-destructive'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">₹{tx.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Network Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Crown Diamond', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Starter'].map(rank => {
                const count = allUsers.filter(u => u.rank === rank).length;
                const percentage = Math.round((count / allUsers.length) * 100);
                return (
                  <div key={rank}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{rank}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
