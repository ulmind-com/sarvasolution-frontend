import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight 
} from 'lucide-react';

const AdminHome = () => {
  // TODO: Connect to real admin stats API when available
  const stats = [
    {
      title: 'Total Users',
      value: '—',
      change: 'Connect API for stats',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Active Users',
      value: '—',
      change: 'Connect API for stats',
      icon: TrendingUp,
      color: 'text-chart-1'
    },
    {
      title: 'Pending Payouts',
      value: '—',
      change: 'Connect API for stats',
      icon: CreditCard,
      color: 'text-chart-4'
    },
    {
      title: 'Total Paid Out',
      value: '—',
      change: 'Connect API for stats',
      icon: DollarSign,
      color: 'text-chart-2'
    }
  ];

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

      {/* Placeholder for future dashboard content */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Connect to admin API to display recent transactions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Network Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Connect to admin API to display network stats.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
