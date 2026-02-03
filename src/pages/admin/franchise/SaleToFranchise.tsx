import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Store, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock data for UI placeholder
const mockFranchises = [
  { _id: '1', shopName: 'ABC Store', vendorId: 'VND001', city: 'Mumbai' },
  { _id: '2', shopName: 'XYZ Mart', vendorId: 'VND002', city: 'Delhi' },
  { _id: '3', shopName: 'Quick Shop', vendorId: 'VND003', city: 'Bangalore' },
];

const mockProducts = [
  { _id: '1', name: 'Health Supplement A', price: 500, bv: 50, stock: 100 },
  { _id: '2', name: 'Personal Care Kit', price: 750, bv: 75, stock: 50 },
  { _id: '3', name: 'Home Care Bundle', price: 1200, bv: 120, stock: 30 },
  { _id: '4', name: 'Agriculture Product X', price: 2000, bv: 200, stock: 25 },
];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  bv: number;
}

const SaleToFranchise = () => {
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: typeof mockProducts[0]) => {
    const existingItem = cart.find((item) => item.productId === product._id);
    if (existingItem) {
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
          bv: product.bv,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
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

  const handleCreateInvoice = () => {
    if (!selectedFranchise) {
      toast.error('Please select a franchise');
      return;
    }
    if (cart.length === 0) {
      toast.error('Please add products to cart');
      return;
    }

    // Placeholder - Log to console
    console.log('Creating invoice:', {
      franchiseId: selectedFranchise,
      items: cart,
      total: calculateTotal(),
      totalBV: calculateTotalBV(),
    });

    toast.info('Invoice creation API not yet implemented');
  };

  const selectedFranchiseData = mockFranchises.find((f) => f._id === selectedFranchise);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sale to Franchise</h1>
        <p className="text-muted-foreground">Create a sale order for a franchise partner</p>
        <Badge variant="secondary" className="mt-2">
          <FileText className="h-3 w-3 mr-1" />
          UI Placeholder - API Not Connected
        </Badge>
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
              <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a franchise..." />
                </SelectTrigger>
                <SelectContent>
                  {mockFranchises.map((franchise) => (
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
                    Vendor ID: {selectedFranchiseData.vendorId} • {selectedFranchiseData.city}
                  </p>
                </div>
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
              <div className="grid gap-3 sm:grid-cols-2">
                {mockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{product.price}</p>
                        <Badge variant="outline" className="text-xs">
                          {product.bv} BV
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                          ₹{item.price} × {item.quantity}
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

                  <Button className="w-full" onClick={handleCreateInvoice}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SaleToFranchise;
