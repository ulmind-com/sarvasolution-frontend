import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Package, Plus, Minus, History, Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  segment: string;
  stockCount?: number;
  productImage?: {
    url: string;
  };
}

interface LowStockAlert {
  _id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

interface StockHistoryItem {
  _id: string;
  type: 'add' | 'remove';
  quantity: number;
  reason: string;
  referenceNo?: string;
  batchNo?: string;
  createdAt: string;
  performedBy?: {
    fullName: string;
  };
}

const StockDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [addStockModal, setAddStockModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [removeStockModal, setRemoveStockModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [historyModal, setHistoryModal] = useState<{ open: boolean; product: Product | null; history: StockHistoryItem[] }>({ open: false, product: null, history: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form state
  const [stockForm, setStockForm] = useState({
    quantity: '',
    batchNo: '',
    referenceNo: '',
    reason: '',
  });

  const fetchData = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [productsRes, alertsRes] = await Promise.all([
        api.get('/api/v1/admin/product/list'),
        api.get('/api/v1/admin/product/alerts/low-stock'),
      ]);

      const productsData = productsRes.data.data?.products || productsRes.data.data || productsRes.data.products || [];
      setProducts(productsData);
      setLowStockAlerts(alertsRes.data.data || alertsRes.data.alerts || []);
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to fetch stock data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStock = async () => {
    if (!addStockModal.product || !stockForm.quantity) {
      toast.error('Please enter a quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/api/v1/admin/product/stock/add/${addStockModal.product._id}`, {
        quantityToAdd: parseInt(stockForm.quantity),
        batchNo: stockForm.batchNo,
        referenceNo: stockForm.referenceNo,
        reason: stockForm.reason,
      });

      toast.success('Stock added successfully');
      setAddStockModal({ open: false, product: null });
      setStockForm({ quantity: '', batchNo: '', referenceNo: '', reason: '' });
      fetchData(true);
    } catch (error: any) {
      console.error('Error adding stock:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStock = async () => {
    if (!removeStockModal.product || !stockForm.quantity) {
      toast.error('Please enter a quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/api/v1/admin/product/stock/remove/${removeStockModal.product._id}`, {
        quantityToRemove: parseInt(stockForm.quantity),
        referenceNo: stockForm.referenceNo,
        reason: stockForm.reason,
      });

      toast.success('Stock removed successfully');
      setRemoveStockModal({ open: false, product: null });
      setStockForm({ quantity: '', batchNo: '', referenceNo: '', reason: '' });
      fetchData(true);
    } catch (error: any) {
      console.error('Error removing stock:', error);
      toast.error(error.response?.data?.message || 'Failed to remove stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStockHistory = async (product: Product) => {
    setHistoryModal({ open: true, product, history: [] });
    setIsLoadingHistory(true);

    try {
      const response = await api.get(`/api/v1/admin/product/stock/history/${product._id}`);
      setHistoryModal((prev) => ({
        ...prev,
        history: response.data.data || response.data.history || [],
      }));
    } catch (error: any) {
      console.error('Error fetching stock history:', error);
      toast.error('Failed to fetch stock history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory stock levels</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lowStockAlerts.map((alert) => (
            <Card key={alert._id} className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{alert.productName}</p>
                    <p className="text-sm text-destructive">
                      Only {alert.currentStock} units left (Threshold: {alert.threshold})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stock Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                        {product.productImage?.url ? (
                          <img
                            src={product.productImage.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {product.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.stockCount && product.stockCount < 10 ? 'destructive' : 'outline'}
                      >
                        {product.stockCount ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => {
                            setStockForm({ quantity: '', batchNo: '', referenceNo: '', reason: '' });
                            setAddStockModal({ open: true, product });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => {
                            setStockForm({ quantity: '', batchNo: '', referenceNo: '', reason: '' });
                            setRemoveStockModal({ open: true, product });
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => fetchStockHistory(product)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Modal */}
      <Dialog open={addStockModal.open} onOpenChange={(open) => setAddStockModal({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add stock for <strong>{addStockModal.product?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-quantity">Quantity *</Label>
              <Input
                id="add-quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity to add"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-batch">Batch No</Label>
              <Input
                id="add-batch"
                value={stockForm.batchNo}
                onChange={(e) => setStockForm((prev) => ({ ...prev, batchNo: e.target.value }))}
                placeholder="Enter batch number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-reference">Reference No</Label>
              <Input
                id="add-reference"
                value={stockForm.referenceNo}
                onChange={(e) => setStockForm((prev) => ({ ...prev, referenceNo: e.target.value }))}
                placeholder="Enter reference number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-reason">Reason</Label>
              <Textarea
                id="add-reason"
                value={stockForm.reason}
                onChange={(e) => setStockForm((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for adding stock"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStockModal({ open: false, product: null })}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Stock Modal */}
      <Dialog open={removeStockModal.open} onOpenChange={(open) => setRemoveStockModal({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>
              Remove stock from <strong>{removeStockModal.product?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remove-quantity">Quantity *</Label>
              <Input
                id="remove-quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity to remove"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remove-reference">Reference No</Label>
              <Input
                id="remove-reference"
                value={stockForm.referenceNo}
                onChange={(e) => setStockForm((prev) => ({ ...prev, referenceNo: e.target.value }))}
                placeholder="Enter reference number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remove-reason">Reason *</Label>
              <Textarea
                id="remove-reason"
                value={stockForm.reason}
                onChange={(e) => setStockForm((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for removing stock"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveStockModal({ open: false, product: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveStock} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock History Modal */}
      <Dialog open={historyModal.open} onOpenChange={(open) => setHistoryModal({ open, product: null, history: [] })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
            <DialogDescription>
              History for <strong>{historyModal.product?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : historyModal.history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stock history found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyModal.history.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-sm">{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.type === 'add' ? 'default' : 'destructive'}
                          className={item.type === 'add' ? 'bg-green-500' : ''}
                        >
                          {item.type === 'add' ? 'Added' : 'Removed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={item.type === 'add' ? 'text-green-600' : 'text-red-600'}>
                          {item.type === 'add' ? '+' : '-'}{item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDashboard;
