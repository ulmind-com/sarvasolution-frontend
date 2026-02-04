import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Package, Loader2, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllProducts, getProductDetails, Product } from '@/services/userService';
import { toast } from 'sonner';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllProducts(currentPage, 12);
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setHasNextPage(response.data.pagination.hasNextPage);
        setHasPrevPage(response.data.pagination.hasPrevPage);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        (product.productName || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleOpenDetails = async (product: Product) => {
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);
    try {
      const response = await getProductDetails(product._id);
      if (response.success) {
        setSelectedProduct(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      // Fallback to basic product data
      setSelectedProduct(product);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedProduct(null);
  };

  // Stock status logic (masks actual numbers)
  const getStockStatus = (product: Product) => {
    if (!product.isInStock) {
      return { label: 'Out of Stock', variant: 'destructive' as const, pulse: false };
    }
    if (product.stockQuantity < 10) {
      return { label: 'Hurry! Low Stock', variant: 'secondary' as const, pulse: true };
    }
    return { label: 'In Stock', variant: 'default' as const, pulse: false };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Our Products</h1>
          <p className="text-muted-foreground">Browse our complete product catalog</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-20 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'Products will appear here soon'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => {
              const stockStatus = getStockStatus(product);
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
                    onClick={() => handleOpenDetails(product)}
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <AspectRatio ratio={1}>
                        <img
                          src={product.productImage?.url || '/placeholder.svg'}
                          alt={product.productName}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </AspectRatio>
                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={stockStatus.variant}
                          className={stockStatus.pulse ? 'animate-pulse' : ''}
                        >
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-4">
                      <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                        {product.category || 'General'}
                      </p>
                      <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.productName}
                      </h3>
                    </CardContent>

                    {/* Pricing Grid */}
                    <CardFooter className="p-4 pt-0">
                      <div className="w-full grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-muted/50 rounded-md p-2 text-center">
                          <p className="text-muted-foreground text-xs">MRP</p>
                          <p className="font-medium line-through text-muted-foreground">
                            ₹{product.mrp?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-md p-2 text-center">
                          <p className="text-muted-foreground text-xs">DP</p>
                          <p className="font-bold text-primary">
                            ₹{product.productDP?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-md p-2 text-center">
                          <p className="text-muted-foreground text-xs">BV</p>
                          <p className="font-medium text-foreground">{product.bv || 0}</p>
                        </div>
                        <div className="bg-muted/50 rounded-md p-2 text-center">
                          <p className="text-muted-foreground text-xs">PV</p>
                          <p className="font-medium text-foreground">{product.pv || 0}</p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Product Details</DialogTitle>
            <DialogDescription className="sr-only">
              View detailed information about this product
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedProduct ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="relative">
                <AspectRatio ratio={1}>
                  <img
                    src={selectedProduct.productImage?.url || '/placeholder.svg'}
                    alt={selectedProduct.productName}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </AspectRatio>
                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  {(() => {
                    const status = getStockStatus(selectedProduct);
                    return (
                      <Badge
                        variant={status.variant}
                        className={`text-sm ${status.pulse ? 'animate-pulse' : ''}`}
                      >
                        {status.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                  {selectedProduct.category || 'General'}
                </p>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {selectedProduct.productName}
                </h2>

                {selectedProduct.description && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Pricing Section */}
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-foreground mb-3">Pricing Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-md p-3 text-center border">
                      <p className="text-muted-foreground text-xs mb-1">MRP</p>
                      <p className="text-lg font-medium line-through text-muted-foreground">
                        ₹{selectedProduct.mrp?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-primary/10 rounded-md p-3 text-center border border-primary/20">
                      <p className="text-muted-foreground text-xs mb-1">Dealer Price</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{selectedProduct.productDP?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-background rounded-md p-3 text-center border">
                      <p className="text-muted-foreground text-xs mb-1">Business Volume</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedProduct.bv || 0} BV
                      </p>
                    </div>
                    <div className="bg-background rounded-md p-3 text-center border">
                      <p className="text-muted-foreground text-xs mb-1">Point Value</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedProduct.pv || 0} PV
                      </p>
                    </div>
                  </div>
                </div>

                {/* HSN Code if available */}
                {selectedProduct.hsnCode && (
                  <p className="text-xs text-muted-foreground mb-4">
                    HSN Code: {selectedProduct.hsnCode}
                  </p>
                )}

                {/* Purchase Info */}
                <div className="mt-auto bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Contact your nearest Franchise to purchase
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Locate a franchise partner to buy this product at Dealer Price
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
