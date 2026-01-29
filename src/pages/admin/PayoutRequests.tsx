import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock } from 'lucide-react';

const PayoutRequests = () => {
  // TODO: Connect to real payout API when available

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payout Requests</h1>
          <p className="text-muted-foreground">Manage withdrawal requests from users</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-chart-4" />
          <span className="font-medium text-foreground">— Pending</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-chart-4/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            Connect to admin payout API to display withdrawal requests.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutRequests;
