import { useState, useEffect } from 'react';
import { History, Search, Eye, Download, Loader2, FileText, IndianRupee, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface SaleItem {
  productId: string;
  productName?: string;
  name?: string;
  quantity: number;
  price: number;
}

interface Sale {
  _id: string;
  invoiceNo?: string;
  invoiceNumber?: string;
  franchiseId: {
    _id: string;
    shopName: string;
    vendorId: string;
    name: string;
  };
  items: SaleItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const SaleHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/admin/sales/list');
      const data = response.data.data || response.data;
      setSales(Array.isArray(data) ? data : data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    const invoiceNo = sale.invoiceNo || sale.invoiceNumber || '';
    return (
      invoiceNo.toLowerCase().includes(searchLower) ||
      sale.franchiseId?.shopName?.toLowerCase().includes(searchLower) ||
      sale.franchiseId?.vendorId?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const completedSales = sales.filter((s) => 
    s.status?.toLowerCase() === 'completed' || s.status?.toLowerCase() === 'paid'
  ).length;

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sale History</h1>
        <p className="text-muted-foreground">View all franchise sale transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{totalSalesAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice, franchise, or vendor ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No sales found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell className="font-mono font-medium">
                      {sale.invoiceNo || sale.invoiceNumber || sale._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.franchiseId?.shopName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.franchiseId?.vendorId || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{sale.items?.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(sale.totalAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Invoice: {selectedSale?.invoiceNo || selectedSale?.invoiceNumber || selectedSale?._id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              {/* Franchise Info */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedSale.franchiseId?.shopName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSale.franchiseId?.name} • {selectedSale.franchiseId?.vendorId}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Items
                </p>
                <div className="border rounded-lg divide-y">
                  {selectedSale.items?.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.productName || item.name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-bold">₹{(selectedSale.totalAmount || 0).toLocaleString()}</span>
              </div>

              {/* Date & Status */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date: {formatDate(selectedSale.createdAt)}</span>
                {getStatusBadge(selectedSale.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaleHistory;
