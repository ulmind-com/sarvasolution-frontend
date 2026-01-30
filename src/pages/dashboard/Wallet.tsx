import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
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
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Loader2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface WalletData {
  availableBalance: number;
  totalEarnings: number;
  pendingWithdrawals: number;
}

interface PayoutRequest {
  _id: string;
  amount: number;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

const Wallet = () => {
  const { user } = useAuthStore();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const MIN_WITHDRAWAL = 450;

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      // Fetch wallet balance
      const walletResponse = await api.get('/api/v1/user/wallet');
      setWalletData(walletResponse.data.data || walletResponse.data);

      // Fetch payout history
      try {
        const historyResponse = await api.get('/api/v1/user/payouts');
        setPayoutHistory(historyResponse.data.data || historyResponse.data || []);
      } catch {
        // If payout history endpoint doesn't exist, use empty array
        setPayoutHistory([]);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      // Use fallback data from user object if available
      if (user?.wallet) {
        setWalletData({
          availableBalance: user.wallet.availableBalance || 0,
          totalEarnings: user.wallet.totalEarnings || 0,
          pendingWithdrawals: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
      processed: 'bg-primary/20 text-primary border-primary/30',
      rejected: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const validateAmount = (value: string): string | null => {
    const amount = parseFloat(value);
    
    if (isNaN(amount) || amount <= 0) {
      return 'Please enter a valid amount';
    }
    
    if (amount < MIN_WITHDRAWAL) {
      return `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`;
    }
    
    if (walletData && amount > walletData.availableBalance) {
      return 'Insufficient balance';
    }

    return null;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    
    if (value) {
      const validationError = validateAmount(value);
      setError(validationError || '');
    } else {
      setError('');
    }
  };

  const handleWithdraw = async () => {
    const validationError = validateAmount(withdrawAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsWithdrawing(true);
    setError('');
    
    try {
      const amount = parseFloat(withdrawAmount);
      await api.post('/api/v1/user/request-payout', { amount });
      
      toast.success('Withdrawal request submitted! Processing occurs every Friday at 11 AM IST.');
      
      setWithdrawAmount('');
      setDialogOpen(false);
      
      // Refresh wallet data
      fetchWalletData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit withdrawal request';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const availableBalance = walletData?.availableBalance || 0;
  const pendingAmount = payoutHistory
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              ₹{availableBalance.toLocaleString()}
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
              ₹{pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card className="border-border sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={availableBalance < MIN_WITHDRAWAL}>
                  Request Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw. Minimum ₹{MIN_WITHDRAWAL}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-foreground">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Min ₹${MIN_WITHDRAWAL}`}
                      value={withdrawAmount}
                      onChange={handleAmountChange}
                      className={`bg-card border-input ${error ? 'border-destructive' : ''}`}
                      min={MIN_WITHDRAWAL}
                      max={availableBalance}
                    />
                    {error && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-accent p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Balance</span>
                      <span className="font-medium text-foreground">₹{availableBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">After Withdrawal</span>
                      <span className="font-medium text-accent-foreground">
                        ₹{Math.max(0, availableBalance - (parseFloat(withdrawAmount) || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Processing occurs every Friday at 11 AM IST. Minimum withdrawal amount is ₹{MIN_WITHDRAWAL}.
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={isWithdrawing || !!error || !withdrawAmount}
                  >
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
            
            {availableBalance < MIN_WITHDRAWAL && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Minimum balance of ₹{MIN_WITHDRAWAL} required
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Payout History</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchWalletData}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No payout requests yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutHistory.map((payout) => (
                    <TableRow key={payout._id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                          <span className="capitalize text-foreground">Withdrawal</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        -₹{payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(payout.status)}>
                          {payout.status}
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
