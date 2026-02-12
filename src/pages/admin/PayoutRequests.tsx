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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Clock, 
  Loader2, 
  RefreshCw, 
  CreditCard, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';

interface PayoutRequest {
  _id: string;
  memberId: string;
  grossAmount: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'rejected' | 'processing' | 'failed';
  payoutType: string;
  scheduledFor: string;
  createdAt: string;
  processedAt?: string;
  userId: {
    _id?: string;
    fullName?: string;
    name?: string;
    email: string;
    phone?: number;
    memberId?: string;
  };
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
      p => p.status === 'completed' && p.processedAt && new Date(p.processedAt).toDateString() === today
    );
    const rejected = payoutList.filter(p => p.status === 'rejected');

    setStats({
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + (p.netAmount || p.grossAmount || 0), 0),
      processedToday: processedToday.length,
      processedTodayAmount: processedToday.reduce((sum, p) => sum + (p.netAmount || p.grossAmount || 0), 0),
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

  // Single approve/reject state
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject';
    payout: PayoutRequest;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSingleProcessing, setIsSingleProcessing] = useState(false);

  const handleMarkAsPaid = (payoutId: string) => {
    const payout = payouts.find(p => p._id === payoutId);
    if (payout) setConfirmDialog({ type: 'approve', payout });
  };

  const handleRejectSingle = (payoutId: string) => {
    const payout = payouts.find(p => p._id === payoutId);
    if (payout) {
      setRejectReason('');
      setConfirmDialog({ type: 'reject', payout });
    }
  };

  const confirmApprove = async () => {
    if (!confirmDialog) return;
    setIsSingleProcessing(true);
    try {
      await api.patch(`/api/v1/admin/payouts/${confirmDialog.payout._id}/accept`);
      toast.success('Payout Approved');
      setConfirmDialog(null);
      fetchPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve payout');
    } finally {
      setIsSingleProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!confirmDialog) return;
    setIsSingleProcessing(true);
    try {
      await api.patch(`/api/v1/admin/payouts/${confirmDialog.payout._id}/reject`, {
        rejectionReason: rejectReason || undefined,
      });
      toast.success('Payout Rejected');
      setConfirmDialog(null);
      setRejectReason('');
      fetchPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject payout');
    } finally {
      setIsSingleProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { 
        className: 'bg-chart-4/20 text-chart-4 border-chart-4/30', 
        label: 'Pending' 
      },
      completed: { 
        className: 'bg-primary/20 text-primary border-primary/30', 
        label: 'Completed' 
      },
      processing: { 
        className: 'bg-chart-2/20 text-chart-2 border-chart-2/30', 
        label: 'Processing' 
      },
      rejected: { 
        className: 'bg-destructive/20 text-destructive border-destructive/30', 
        label: 'Rejected' 
      },
      failed: { 
        className: 'bg-destructive/20 text-destructive border-destructive/30', 
        label: 'Failed' 
      },
    };
    return config[status] || config.pending;
  };

  const formatPayoutType = (type: string) => {
    if (!type) return 'Withdrawal';
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatPhone = (phone?: number) => {
    if (!phone) return null;
    const phoneStr = phone.toString();
    if (phoneStr.startsWith('91') && phoneStr.length > 10) {
      return `+91 ${phoneStr.slice(2)}`;
    }
    return phoneStr;
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
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-foreground">All Withdrawal Requests</CardTitle>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
          
          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Pending</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Processed</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Rejected</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                No {statusFilter !== 'all' ? statusFilter : ''} withdrawal requests found.
              </p>
            </div>
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
                    <TableHead className="text-muted-foreground">Member Details</TableHead>
                    <TableHead className="text-muted-foreground">Contact Info</TableHead>
                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Schedule</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => {
                    const statusConfig = getStatusBadge(payout.status);
                    const displayName = payout.userId?.fullName || payout.userId?.name || 'Unknown';
                    const displayMemberId = payout.memberId || payout.userId?.memberId || 'N/A';
                    const phone = formatPhone(payout.userId?.phone);
                    
                    return (
                      <TableRow key={payout._id} className="border-border">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(payout._id)}
                            onCheckedChange={(checked) => handleSelectOne(payout._id, !!checked)}
                            disabled={payout.status !== 'pending'}
                          />
                        </TableCell>
                        
                        {/* Member Details */}
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{displayName}</p>
                            <p className="text-xs font-mono text-muted-foreground">{displayMemberId}</p>
                          </div>
                        </TableCell>
                        
                        {/* Contact Info */}
                        <TableCell>
                          <div className="space-y-1">
                            {phone && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{payout.userId?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Amount */}
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="font-bold text-primary">
                              ₹{(payout.netAmount || payout.grossAmount || 0).toLocaleString()}
                            </p>
                            {payout.grossAmount && payout.netAmount && payout.grossAmount !== payout.netAmount && (
                              <p className="text-xs text-muted-foreground">
                                Gross: ₹{payout.grossAmount.toLocaleString()}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {formatPayoutType(payout.payoutType)}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        {/* Schedule */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(payout.scheduledFor || payout.createdAt)}</span>
                          </div>
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleMarkAsPaid(payout._id)}
                                disabled={payout.status !== 'pending'}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectSingle(payout._id)}
                                disabled={payout.status !== 'pending'}
                                className="text-destructive focus:text-destructive"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.type === 'approve'} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout of{' '}
              <span className="font-bold">₹{(confirmDialog?.payout.netAmount || confirmDialog?.payout.grossAmount || 0).toLocaleString()}</span>{' '}
              for <span className="font-bold">{confirmDialog?.payout.userId?.fullName || confirmDialog?.payout.userId?.name || 'Unknown'}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSingleProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} disabled={isSingleProcessing}>
              {isSingleProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.type === 'reject'} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Reject Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Reject payout of{' '}
              <span className="font-bold">₹{(confirmDialog?.payout.netAmount || confirmDialog?.payout.grossAmount || 0).toLocaleString()}</span>{' '}
              for <span className="font-bold">{confirmDialog?.payout.userId?.fullName || confirmDialog?.payout.userId?.name || 'Unknown'}</span>?
              The amount will be refunded to the user's wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Rejection Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g., Invalid bank details, suspicious activity..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSingleProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} disabled={isSingleProcessing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSingleProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayoutRequests;
