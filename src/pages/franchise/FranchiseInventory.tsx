import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFranchiseAuthStore } from '@/stores/useFranchiseAuthStore';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';

interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    productImage?: { url: string };
    category: string;
    mrp: number;
  };
  stockQuantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

const FranchiseInventory = () => {
  const navigate = useNavigate();
  const { franchise, franchiseToken, isAuthenticated } = useFranchiseAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/franchise/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch inventory
  useEffect(() => {
    const fetchInventory = async () => {
      if (!franchiseToken) return;

      try {
        setIsLoading(true);
        const response = await api.get('/api/v1/franchise/inventory/list', {
          headers: {
            Authorization: `Bearer ${franchiseToken}`,
          },
        });

        // Handle nested response structure
        const inventoryData = response.data?.data?.inventory || 
                             response.data?.inventory || 
                             response.data?.data || 
                             response.data || 
                             [];
        
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } catch (error: any) {
        console.error('Error fetching inventory:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch inventory');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [franchiseToken]);

  // Filter inventory by search query
  const filteredInventory = inventory.filter((item) =>
    (item.product?.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isAuthenticated || !franchise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/franchise/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{franchise.shopName}</p>
              <p className="text-xs text-muted-foreground">{franchise.vendorId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">My Inventory</h1>
          <p className="text-muted-foreground">View your available product stock</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredInventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Products Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Your inventory is empty. Request products from admin.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">My Stock</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Last Purchased</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item._id}>
                        {/* Product */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {item.product?.productImage?.url ? (
                                <img
                                  src={item.product.productImage.url}
                                  alt={item.product.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.product?.productName || 'Unknown Product'}</p>
                              <Badge variant="secondary" className="mt-1 capitalize text-xs">
                                {item.product?.category || 'General'}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* My Stock */}
                        <TableCell className="text-center">
                          <span
                            className={`text-2xl font-bold ${
                              item.stockQuantity < 10 ? 'text-destructive' : 'text-foreground'
                            }`}
                          >
                            {item.stockQuantity}
                          </span>
                          {item.stockQuantity < 10 && item.stockQuantity > 0 && (
                            <p className="text-xs text-destructive">Low Stock</p>
                          )}
                        </TableCell>

                        {/* Pricing */}
                        <TableCell>
                          <div>
                            <p className="font-bold text-primary">
                              DP: {formatCurrency(item.purchasePrice)}
                            </p>
                            <p className="text-sm text-muted-foreground line-through">
                              MRP: {formatCurrency(item.product?.mrp || 0)}
                            </p>
                          </div>
                        </TableCell>

                        {/* Last Purchased */}
                        <TableCell>
                          <p className="text-sm">{formatDate(item.purchaseDate)}</p>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {item.stockQuantity > 0 ? (
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FranchiseInventory;
