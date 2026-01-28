import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const PayoutRequests = () => {
  const { allUsers, transactions, updateTransaction, updateUserBalance } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const withdrawalTransactions = transactions.filter(t => t.type === 'withdrawal');
  const pendingCount = withdrawalTransactions.filter(t => t.status === 'pending').length;

  const handleApprove = async (transactionId: string, userId: string, amount: number) => {
    setProcessingId(transactionId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateTransaction(transactionId, { status: 'completed' });
    
    // Deduct from user balance (find user and update)
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      // Note: In a real app, balance would be updated server-side
    }
    
    setProcessingId(null);
    toast.success('Payout approved and processed!');
  };

  const handleReject = async (transactionId: string) => {
    setProcessingId(transactionId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateTransaction(transactionId, { status: 'rejected' });
    
    setProcessingId(null);
    toast.error('Payout request rejected');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
      completed: 'bg-primary/20 text-primary border-primary/30',
      rejected: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payout Requests</h1>
          <p className="text-muted-foreground">Manage withdrawal requests from users</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-chart-4" />
          <span className="font-medium text-foreground">{pendingCount} Pending</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{withdrawalTransactions
                    .filter(t => t.status === 'pending')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  ₹{withdrawalTransactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  ₹{withdrawalTransactions
                    .filter(t => t.status === 'rejected')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No withdrawal requests yet
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawalTransactions.map((tx) => {
                    const user = allUsers.find(u => u.id === tx.userId);
                    const isProcessing = processingId === tx.id;
                    
                    return (
                      <TableRow key={tx.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {user?.name.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{user?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          ₹{tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(tx.id, tx.userId, tx.amount)}
                                disabled={isProcessing}
                                className="gap-1"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(tx.id)}
                                disabled={isProcessing}
                                className="gap-1"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutRequests;
