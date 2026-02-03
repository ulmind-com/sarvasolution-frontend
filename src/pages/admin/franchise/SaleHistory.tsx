import { useState } from 'react';
import { History, Search, Eye, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for UI placeholder
const mockSaleHistory = [
  {
    _id: '1',
    invoiceNo: 'INV-2024-001',
    franchiseName: 'ABC Store',
    vendorId: 'VND001',
    amount: 15000,
    itemCount: 5,
    status: 'completed',
    createdAt: '2024-02-01T10:30:00Z',
  },
  {
    _id: '2',
    invoiceNo: 'INV-2024-002',
    franchiseName: 'XYZ Mart',
    vendorId: 'VND002',
    amount: 28500,
    itemCount: 8,
    status: 'pending',
    createdAt: '2024-02-02T14:15:00Z',
  },
  {
    _id: '3',
    invoiceNo: 'INV-2024-003',
    franchiseName: 'Quick Shop',
    vendorId: 'VND003',
    amount: 42000,
    itemCount: 12,
    status: 'completed',
    createdAt: '2024-02-03T09:45:00Z',
  },
  {
    _id: '4',
    invoiceNo: 'INV-2024-004',
    franchiseName: 'Super Store',
    vendorId: 'VND004',
    amount: 18750,
    itemCount: 6,
    status: 'cancelled',
    createdAt: '2024-02-03T16:20:00Z',
  },
];

const SaleHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = mockSaleHistory.filter(
    (sale) =>
      sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.franchiseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.vendorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSales = mockSaleHistory.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = mockSaleHistory.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sale History</h1>
        <p className="text-muted-foreground">View all franchise sale transactions</p>
        <Badge variant="secondary" className="mt-2">
          <FileText className="h-3 w-3 mr-1" />
          UI Placeholder - API Not Connected
        </Badge>
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
                <p className="text-2xl font-bold">{mockSaleHistory.length}</p>
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
                <History className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{totalSales.toLocaleString()}</p>
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
              {filteredHistory.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-mono font-medium">{sale.invoiceNo}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.franchiseName}</p>
                      <p className="text-xs text-muted-foreground">{sale.vendorId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{sale.itemCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{sale.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{formatDate(sale.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleHistory;
