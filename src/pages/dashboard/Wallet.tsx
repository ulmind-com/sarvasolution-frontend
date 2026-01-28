import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Wallet = () => {
  const { currentUser, transactions, addTransaction } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
  
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
      completed: 'bg-primary/20 text-primary border-primary/30',
      rejected: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'withdrawal' || type === 'purchase') {
      return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-primary" />;
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    
    if (amount > (currentUser?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addTransaction({
      userId: currentUser!.id,
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: 'Withdrawal request to bank'
    });
    
    setIsWithdrawing(false);
    setWithdrawAmount('');
    setDialogOpen(false);
    
    toast.success('Withdrawal request submitted! It will be processed within 24-48 hours.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Available Balance
            </CardTitle>
            <WalletIcon className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{currentUser?.balance.toLocaleString()}
            </div>
            <p className="text-xs opacity-80 mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Withdrawals
            </CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{userTransactions
                .filter(t => t.type === 'withdrawal' && t.status === 'pending')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card className="border-border sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  Request Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw. Minimum ₹500.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-foreground">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-card border-input"
                    />
                  </div>
                  
                  <div className="bg-accent p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Balance</span>
                      <span className="font-medium text-foreground">₹{currentUser?.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">After Withdrawal</span>
                      <span className="font-medium text-accent-foreground">
                        ₹{Math.max(0, (currentUser?.balance || 0) - (parseFloat(withdrawAmount) || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Withdrawals processed within 24-48 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  userTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <span className="capitalize text-foreground">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'withdrawal' || transaction.type === 'purchase'
                          ? 'text-destructive'
                          : 'text-primary'
                      }`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'purchase' ? '-' : '+'}
                        ₹{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
