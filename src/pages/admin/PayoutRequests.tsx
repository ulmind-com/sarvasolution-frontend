import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, X, Clock, Loader2, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface PayoutRequest {
  _id: string;
  userId: {
    _id: string;
    memberId: string;
    name: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

interface PayoutStats {
  pendingCount: number;
  pendingAmount: number;
  processedToday: number;
  processedTodayAmount: number;
  rejectedCount: number;
}

const PayoutRequests = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<PayoutStats>({
    pendingCount: 0,
    pendingAmount: 0,
    processedToday: 0,
    processedTodayAmount: 0,
    rejectedCount: 0,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/v1/admin/payouts`, {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      
      const data = response.data.data || response.data;
      setPayouts(Array.isArray(data) ? data : data.payouts || []);
      
      // Calculate stats from data
      if (data.stats) {
        setStats(data.stats);
      } else {
        calculateStats(Array.isArray(data) ? data : data.payouts || []);
      }
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to fetch payout requests');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (payoutList: PayoutRequest[]) => {
    const today = new Date().toDateString();
    
    const pending = payoutList.filter(p => p.status === 'pending');
    const processedToday = payoutList.filter(
      p => p.status === 'processed' && p.processedAt && new Date(p.processedAt).toDateString() === today
    );
    const rejected = payoutList.filter(p => p.status === 'rejected');

    setStats({
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      processedToday: processedToday.length,
      processedTodayAmount: processedToday.reduce((sum, p) => sum + p.amount, 0),
      rejectedCount: rejected.length,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = payouts
        .filter(p => p.status === 'pending')
        .map(p => p._id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleProcessBulk = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one payout to process');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/api/v1/admin/payouts/process-bulk', {
        payoutIds: selectedIds
      });
      
      toast.success(`${selectedIds.length} payout(s) processed successfully`);
      setSelectedIds([]);
      fetchPayouts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to process payouts';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBulk = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one payout to reject');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/api/v1/admin/payouts/reject-bulk', {
        payoutIds: selectedIds
      });
      
      toast.success(`${selectedIds.length} payout(s) rejected`);
      setSelectedIds([]);
      fetchPayouts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reject payouts';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
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

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const allPendingSelected = pendingPayouts.length > 0 && 
    pendingPayouts.every(p => selectedIds.includes(p._id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payout Requests</h1>
          <p className="text-muted-foreground">Manage withdrawal requests from users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayouts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                  ₹{stats.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingCount} request(s)
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
                <p className="text-sm text-muted-foreground">Processed Today</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{stats.processedTodayAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.processedToday} payout(s)
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
                <p className="text-2xl font-bold text-foreground">{stats.rejectedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Total rejected</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-foreground">All Withdrawal Requests</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedIds.length > 0 && (
              <>
                <Button 
                  size="sm" 
                  onClick={handleProcessBulk}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Process ({selectedIds.length})
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleRejectBulk}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payouts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No withdrawal requests found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allPendingSelected}
                        onCheckedChange={handleSelectAll}
                        disabled={pendingPayouts.length === 0}
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground">Member ID</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout._id} className="border-border">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(payout._id)}
                          onCheckedChange={(checked) => handleSelectOne(payout._id, !!checked)}
                          disabled={payout.status !== 'pending'}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {payout.userId?.memberId || 'N/A'}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {payout.userId?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payout.userId?.email || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ₹{payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(payout.status)}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutRequests;
