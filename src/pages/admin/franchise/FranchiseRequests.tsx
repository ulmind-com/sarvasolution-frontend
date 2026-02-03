import { useState } from 'react';
import { FileText, Search, Check, X, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock data for UI placeholder
const mockRequests = [
  {
    _id: '1',
    requestId: 'REQ-2024-001',
    franchiseName: 'ABC Store',
    vendorId: 'VND001',
    productName: 'Health Supplement A',
    quantity: 50,
    status: 'pending',
    requestedAt: '2024-02-03T10:30:00Z',
  },
  {
    _id: '2',
    requestId: 'REQ-2024-002',
    franchiseName: 'XYZ Mart',
    vendorId: 'VND002',
    productName: 'Personal Care Kit',
    quantity: 30,
    status: 'approved',
    requestedAt: '2024-02-02T14:15:00Z',
  },
  {
    _id: '3',
    requestId: 'REQ-2024-003',
    franchiseName: 'Quick Shop',
    vendorId: 'VND003',
    productName: 'Home Care Bundle',
    quantity: 25,
    status: 'pending',
    requestedAt: '2024-02-03T09:45:00Z',
  },
  {
    _id: '4',
    requestId: 'REQ-2024-004',
    franchiseName: 'Super Store',
    vendorId: 'VND004',
    productName: 'Agriculture Product X',
    quantity: 15,
    status: 'rejected',
    requestedAt: '2024-02-01T16:20:00Z',
  },
];

const FranchiseRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch =
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.franchiseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'all' || request.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (requestId: string) => {
    toast.info(`Approve API not implemented for ${requestId}`);
  };

  const handleReject = (requestId: string) => {
    toast.info(`Reject API not implemented for ${requestId}`);
  };

  const pendingCount = mockRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = mockRequests.filter((r) => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Franchise Product Requests</h1>
        <p className="text-muted-foreground">Manage product requests from franchise partners</p>
        <Badge variant="secondary" className="mt-2">
          <FileText className="h-3 w-3 mr-1" />
          UI Placeholder - API Not Connected
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{mockRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Franchise</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-mono font-medium">{request.requestId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.franchiseName}</p>
                        <p className="text-xs text-muted-foreground">{request.vendorId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.productName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{request.quantity}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleApprove(request.requestId)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleReject(request.requestId)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseRequests;
