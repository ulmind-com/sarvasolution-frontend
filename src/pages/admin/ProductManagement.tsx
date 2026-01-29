import { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Search, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddProductModal from '@/components/admin/AddProductModal';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  bv: number;
  description: string;
  segment: string;
  productImage?: {
    url: string;
    public_id: string;
  };
  image?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
}

const getProductImageUrl = (product: Product): string | null => {
  return product.productImage?.url || product.image?.url || null;
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await api.get('/api/v1/products');
      setProducts(response.data.data || response.data.products || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.segment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'health care': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'aquaculture': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'agriculture': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      'personal care': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'home care': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'luxury goods': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[segment.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or segment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => fetchProducts(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {searchTerm ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-square relative overflow-hidden bg-muted">
                {getProductImageUrl(product) ? (
                  <img
                    src={getProductImageUrl(product)!}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.placeholder-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center absolute inset-0 placeholder-icon ${getProductImageUrl(product) ? 'hidden' : ''}`}>
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  {product.bv} BV
                </Badge>
              </div>
              <CardContent className="p-4">
                <Badge 
                  variant="secondary" 
                  className={`mb-2 text-xs capitalize ${getSegmentColor(product.segment)}`}
                >
                  {product.segment}
                </Badge>
                <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-foreground mt-3">
                  ₹{product.price.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onProductCreated={() => fetchProducts(true)}
      />
    </div>
  );
};

export default ProductManagement;
