import { useState } from 'react';
import { Package, Loader2, Search, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface ProductDetails {
  _id: string;
  productName: string;
  productImage?: { url: string };
  stockQuantity: number;
  price: number;
  mrp: number;
  productDP: number;
  bv: number;
  pv: number;
  category: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitDP: number;
  bv: number;
  pv: number;
  maxStock: number;
}

interface ProductLookupProps {
  onAddToCart: (item: CartItem) => void;
  isDisabled: boolean;
}

const ProductLookup = ({ onAddToCart, isDisabled }: ProductLookupProps) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLooking, setIsLooking] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);

  const handleLookup = async () => {
    if (!productId.trim()) {
      toast.error('Please enter a Product ID');
      return;
    }

    setIsLooking(true);
    try {
      const response = await api.get(`/api/v1/user/products/${productId.trim()}`);
      const product = response.data?.data?.product || response.data?.product || response.data;
      
      if (!product) {
        toast.error('Product not found');
        return;
      }

      setProductDetails(product);
    } catch (error: any) {
      console.error('Error looking up product:', error);
      toast.error(error.response?.data?.message || 'Failed to find product');
      setProductDetails(null);
    } finally {
      setIsLooking(false);
    }
  };

  const handleAddToCart = () => {
    if (!productDetails) return;

    if (quantity <= 0) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (quantity > productDetails.stockQuantity) {
      toast.error(`Only ${productDetails.stockQuantity} units available in stock`);
      return;
    }

    onAddToCart({
      productId: productDetails._id,
      name: productDetails.productName,
      quantity,
      unitDP: productDetails.productDP || productDetails.price,
      bv: productDetails.bv || 0,
      pv: productDetails.pv || 0,
      maxStock: productDetails.stockQuantity,
    });

    // Reset
    setProductId('');
    setQuantity(1);
    setProductDetails(null);
    toast.success('Added to bill');
  };

  const handleClear = () => {
    setProductId('');
    setQuantity(1);
    setProductDetails(null);
  };

  return (
    <Card className={isDisabled ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Product Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDisabled && (
          <p className="text-sm text-muted-foreground">
            Please verify a franchise first
          </p>
        )}

        {!isDisabled && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <Button onClick={handleLookup} disabled={isLooking}>
                {isLooking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {productDetails && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex gap-3">
                  {productDetails.productImage?.url ? (
                    <img
                      src={productDetails.productImage.url}
                      alt={productDetails.productName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{productDetails.productName}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {productDetails.category}
                    </Badge>
                    <div className="flex items-center gap-2 mt-1">
                      {productDetails.stockQuantity < 10 ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock: {productDetails.stockQuantity}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Stock: {productDetails.stockQuantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded text-center">
                    <p className="text-xs text-muted-foreground">DP</p>
                    <p className="font-bold">₹{(productDetails.productDP || productDetails.price)?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <p className="text-xs text-muted-foreground">MRP</p>
                    <p className="font-medium">₹{productDetails.mrp?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <p className="text-xs text-muted-foreground">BV</p>
                    <p className="font-medium">{productDetails.bv || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max={productDetails.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-24"
                    placeholder="Qty"
                  />
                  <Button className="flex-1" onClick={handleAddToCart}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Bill
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductLookup;
