import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Store, Package, FileText, Loader2, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Franchise {
  _id: string;
  shopName: string;
  vendorId: string;
  name: string;
  city: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  bv: number;
  stock: number;
  segment: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  bv: number;
  maxStock: number;
}

interface InvoiceResult {
  invoiceNo: string;
  pdfUrl: string;
}

const SaleToFranchise = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoadingFranchises, setIsLoadingFranchises] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);

  // Fetch franchises and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [franchiseRes, productRes] = await Promise.all([
          api.get('/api/v1/admin/franchise/list'),
          api.get('/api/v1/admin/product/list'),
        ]);

        const franchiseData = franchiseRes.data.data || franchiseRes.data;
        const productData = productRes.data.data || productRes.data;

        // Filter only active franchises
        setFranchises(
          Array.isArray(franchiseData)
            ? franchiseData.filter((f: Franchise) => f.status === 'active')
            : []
        );
        setProducts(Array.isArray(productData) ? productData : productData.products || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoadingFranchises(false);
        setIsLoadingProducts(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    const existingItem = cart.find((item) => item.productId === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more than available stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          bv: product.bv || 0,
          maxStock: product.stock,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.maxStock) {
              toast.error('Cannot exceed available stock');
              return item;
            }
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotalBV = () => {
    return cart.reduce((sum, item) => sum + item.bv * item.quantity, 0);
  };

  const handleCreateInvoice = async () => {
    if (!selectedFranchise) {
      toast.error('Please select a franchise');
      return;
    }
    if (cart.length === 0) {
      toast.error('Please add products to cart');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        franchiseId: selectedFranchise,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/api/v1/admin/sales/sell-to-franchise', payload);
      
      // Extract invoice data from response
      const invoiceData = response.data?.data?.invoice || response.data?.invoice || response.data;
      const invoiceNo = invoiceData?.invoiceNo || invoiceData?.invoiceNumber || 'N/A';
      const pdfUrl = invoiceData?.pdfUrl || '';

      setInvoiceResult({ invoiceNo, pdfUrl });
      setShowSuccessDialog(true);
      setCart([]);
      setSelectedFranchise('');

      // Refresh products to get updated stock
      const productRes = await api.get('/api/v1/admin/product/list');
      const productData = productRes.data.data || productRes.data;
      setProducts(Array.isArray(productData) ? productData : productData.products || []);
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast.error(error.response?.data?.message || 'Failed to process sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFranchiseData = franchises.find((f) => f._id === selectedFranchise);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sale to Franchise</h1>
        <p className="text-muted-foreground">Create a sale order for a franchise partner</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Franchise Selection & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Franchise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Select Franchise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFranchises ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a franchise..." />
                    </SelectTrigger>
                    <SelectContent>
                      {franchises.map((franchise) => (
                        <SelectItem key={franchise._id} value={franchise._id}>
                          {franchise.shopName} ({franchise.vendorId}) - {franchise.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFranchiseData && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="font-medium">{selectedFranchiseData.shopName}</p>
                      <p className="text-sm text-muted-foreground">
                        Owner: {selectedFranchiseData.name} • Vendor ID: {selectedFranchiseData.vendorId} • {selectedFranchiseData.city}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Products
              </CardTitle>
              <CardDescription>Click on a product to add it to the cart</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products available</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={`p-4 border rounded-lg transition-colors ${
                        product.stock > 0
                          ? 'hover:border-primary cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => product.stock > 0 && addToCart(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {product.segment}
                          </p>
                          <p className={`text-sm ${product.stock <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Stock: {product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{product.price?.toLocaleString()}</p>
                          {product.bv > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {product.bv} BV
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
                {cart.length > 0 && (
                  <Badge className="ml-auto">{cart.length} items</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Click on products to add them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          value={item.quantity}
                          className="w-12 h-7 text-center text-sm"
                          readOnly
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total BV</span>
                      <span>{calculateTotalBV()} BV</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreateInvoice}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Create Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center">Sale Completed Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Invoice <span className="font-mono font-bold">{invoiceResult?.invoiceNo}</span> has been generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            {invoiceResult?.pdfUrl && (
              <Button
                className="w-full"
                onClick={() => window.open(invoiceResult.pdfUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice PDF
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaleToFranchise;
