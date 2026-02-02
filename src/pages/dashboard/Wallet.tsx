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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Loader2, AlertCircle, Info, CheckCircle, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface TransactionHistory {
  _id: string;
  payoutType: string;
  grossAmount: number;
  adminCharge: number;
  tdsDeducted: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

interface WalletInfo {
  totalEarnings: number;
  availableBalance: number;
  withdrawnAmount: number;
  pendingWithdrawal: number;
}

interface WalletApiResponse {
  wallet: WalletInfo;
  history: TransactionHistory[];
}

const Wallet = () => {
  const { user } = useAuthStore();
  const [walletData, setWalletData] = useState<WalletApiResponse | null>(null);
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
      const response = await api.get('/api/v1/user/wallet');
      const data = response.data.data || response.data;
      
      // Handle both new and old API response structures
      if (data.wallet) {
        setWalletData(data);
      } else {
        // Fallback for old structure
        setWalletData({
          wallet: {
            totalEarnings: data.totalEarnings || 0,
            availableBalance: data.availableBalance || 0,
            withdrawnAmount: data.withdrawnAmount || 0,
            pendingWithdrawal: data.pendingWithdrawal || data.pendingWithdrawals || 0,
          },
          history: data.history || data.payoutHistory || [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      // Use fallback data from user object if available
      if (user?.wallet) {
        setWalletData({
          wallet: {
            totalEarnings: user.wallet.totalEarnings || 0,
            availableBalance: user.wallet.availableBalance || 0,
            withdrawnAmount: (user.wallet as any).withdrawnAmount || 0,
            pendingWithdrawal: user.wallet.pendingWithdrawal || 0,
          },
          history: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPayoutType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-600 border-green-500/30',
      processed: 'bg-green-500/20 text-green-600 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
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
    
    if (walletData && amount > walletData.wallet.availableBalance) {
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

  const availableBalance = walletData?.wallet.availableBalance || 0;
  const totalEarnings = walletData?.wallet.totalEarnings || 0;
  const pendingAmount = walletData?.wallet.pendingWithdrawal || 0;
  const withdrawnAmount = walletData?.wallet.withdrawnAmount || 0;
  const history = walletData?.history || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Withdraw Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" disabled={availableBalance < MIN_WITHDRAWAL}>
              <Banknote className="mr-2 h-5 w-5" />
              Request Payout
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
      </div>

      {availableBalance < MIN_WITHDRAWAL && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Minimum balance of ₹{MIN_WITHDRAWAL} required to request a payout.
          </p>
        </div>
      )}

      {/* Balance Cards - 4 Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance - Highlighted */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
            <WalletIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ₹{availableBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime income</p>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Withdrawal
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              ₹{pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        {/* Total Withdrawn */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Withdrawn
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{withdrawnAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Transaction History</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchWalletData}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-right text-muted-foreground">Gross</TableHead>
                    <TableHead className="text-right text-muted-foreground">Deductions</TableHead>
                    <TableHead className="text-right text-muted-foreground">Net Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((transaction) => {
                      const totalDeductions = (transaction.adminCharge || 0) + (transaction.tdsDeducted || 0);
                      const isWithdrawal = transaction.payoutType?.toLowerCase().includes('withdrawal');
                      
                      return (
                        <TableRow key={transaction._id} className="border-border">
                          <TableCell className="text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isWithdrawal ? (
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              )}
                              <span className="text-foreground">
                                {formatPayoutType(transaction.payoutType)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            ₹{transaction.grossAmount?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalDeductions > 0 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-destructive cursor-help underline decoration-dotted">
                                    -₹{totalDeductions.toLocaleString()}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs space-y-1">
                                    <p>Admin Charge: ₹{(transaction.adminCharge || 0).toLocaleString()}</p>
                                    <p>TDS Deducted: ₹{(transaction.tdsDeducted || 0).toLocaleString()}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-500">
                            ₹{transaction.netAmount?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
