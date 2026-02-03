import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, Search, Loader2, RefreshCw, Ban, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Franchise {
  _id: string;
  name: string;
  shopName: string;
  email: string;
  phone: string;
  city?: string;
  status: 'active' | 'blocked' | 'pending';
  vendorId?: string;
  createdAt: string;
}

const FranchiseList = () => {
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Block modal
  const [blockModal, setBlockModal] = useState<{ open: boolean; franchise: Franchise | null }>({ open: false, franchise: null });
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const fetchFranchises = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params: Record<string, string> = {};
      if (cityFilter !== 'all') params.city = cityFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get('/api/v1/admin/franchise/list', { params });
      setFranchises(response.data.data || response.data.franchises || []);
    } catch (error: any) {
      console.error('Error fetching franchises:', error);
      toast.error('Failed to fetch franchises');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [cityFilter, statusFilter]);

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  const filteredFranchises = franchises.filter((franchise) =>
    franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueCities = [...new Set(franchises.map((f) => f.city).filter(Boolean))];

  const handleBlockFranchise = async () => {
    if (!blockModal.franchise) return;

    setIsBlocking(true);
    try {
      await api.patch(`/api/v1/admin/franchise/block/${blockModal.franchise._id}`, {
        reason: blockReason,
      });

      toast.success('Franchise blocked successfully');
      setBlockModal({ open: false, franchise: null });
      setBlockReason('');
      fetchFranchises(true);
    } catch (error: any) {
      console.error('Error blocking franchise:', error);
      toast.error(error.response?.data?.message || 'Failed to block franchise');
    } finally {
      setIsBlocking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Franchises</h1>
          <p className="text-muted-foreground">{franchises.length} franchise partners</p>
        </div>
        <Button onClick={() => navigate('/admin/franchise/add')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Franchise
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, shop, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {uniqueCities.map((city) => (
              <SelectItem key={city} value={city!}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => fetchFranchises(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Franchises Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFranchises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No franchises found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Try a different search term' : 'Add your first franchise to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/admin/franchise/add')} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Franchise
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Details</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFranchises.map((franchise) => (
                  <TableRow key={franchise._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{franchise.shopName}</p>
                          {franchise.vendorId && (
                            <p className="text-xs text-muted-foreground">{franchise.vendorId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{franchise.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {franchise.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {franchise.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {franchise.city ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {franchise.city}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(franchise.status)}</TableCell>
                    <TableCell className="text-right">
                      {franchise.status !== 'blocked' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setBlockModal({ open: true, franchise })}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Block Modal */}
      <Dialog open={blockModal.open} onOpenChange={(open) => setBlockModal({ open, franchise: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Franchise</DialogTitle>
            <DialogDescription>
              Are you sure you want to block <strong>{blockModal.franchise?.shopName}</strong>? They will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason for blocking</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this franchise"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockModal({ open: false, franchise: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockFranchise} disabled={isBlocking}>
              {isBlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Block Franchise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FranchiseList;
