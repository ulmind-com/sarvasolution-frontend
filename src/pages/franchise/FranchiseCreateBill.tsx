import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, Package, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getMemberByCode, getProductMasterDetails, processFranchiseSale } from '@/services/franchiseService';
import { useFranchiseAuthStore } from '@/stores/useFranchiseAuthStore';

interface VerifiedMember {
  _id: string;
  memberId: string;
  name: string;
  status: string;
  phone?: string;
  email?: string;
}

interface ProductDetails {
  _id: string;
  productName: string;
  productImage?: { url: string };
  price: number;
  productDP?: number;
  bv: number;
  pv: number;
  stockQuantity: number;
  category?: string;
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  bv: number;
  pv: number;
}

const FranchiseCreateBill = () => {
  const navigate = useNavigate();
  const { isAuthenticated, franchise } = useFranchiseAuthStore();

  // Member State
  const [memberIdInput, setMemberIdInput] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<VerifiedMember | null>(null);
  const [isMemberLoading, setIsMemberLoading] = useState(false);

  // Product State
  const [productIdInput, setProductIdInput] = useState('');
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Sale State
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [saleResult, setSaleResult] = useState<{
    saleNo?: string;
    grandTotal?: number;
    totalBV?: number;
    totalPV?: number;
    userActivated?: boolean;
    isFirstPurchase?: boolean;
    emailSent?: boolean;
  } | null>(null);

  // Redirect if not authenticated (after all hooks)
  if (!isAuthenticated) {
    navigate('/franchise/login');
    return null;
  }

  // ===== Member Verification =====
  const handleVerifyMember = async () => {
    if (!memberIdInput.trim()) {
      toast.error('Please enter a Member ID');
      return;
    }

    setIsMemberLoading(true);
    try {
      const response = await getMemberByCode(memberIdInput.trim());
      const member = response.data?.user || response.user || response.data || response;
      
      if (member && member.memberId) {
        setVerifiedMember({
          _id: member._id,
          memberId: member.memberId,
          name: member.name || 'N/A',
          status: member.status || 'active',
          phone: member.phone,
          email: member.email,
        });
        toast.success('Member verified successfully!');
      } else {
        toast.error('Member not found');
        setVerifiedMember(null);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Member not found';
      toast.error(errorMsg);
      setVerifiedMember(null);
    } finally {
      setIsMemberLoading(false);
    }
  };

  const handleClearMember = () => {
    setVerifiedMember(null);
    setMemberIdInput('');
    setProductDetails(null);
    setProductIdInput('');
    setCart([]);
  };

  // ===== Product Lookup =====
  const handleCheckProduct = async () => {
    if (!productIdInput.trim()) {
      toast.error('Please enter a Product ID');
      return;
    }

    setIsProductLoading(true);
    try {
      const response = await getProductMasterDetails(productIdInput.trim());
      const product = response.data?.product || response.product || response.data || response;
      
      if (product && product._id) {
        setProductDetails({
          _id: product._id,
          productName: product.productName || 'Unknown Product',
          productImage: product.productImage,
          price: product.price || product.productDP || 0,
          productDP: product.productDP,
          bv: product.bv || 0,
          pv: product.pv || 0,
          stockQuantity: product.stockQuantity || 0,
          category: product.category,
        });
        setQuantity(1);
        toast.success('Product found!');
      } else {
        toast.error('Product not found');
        setProductDetails(null);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Product not found';
      toast.error(errorMsg);
      setProductDetails(null);
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!productDetails) return;

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (quantity > productDetails.stockQuantity) {
      toast.error(`Only ${productDetails.stockQuantity} units available`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === productDetails._id);
    
    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > productDetails.stockQuantity) {
        toast.error(`Cannot exceed available stock (${productDetails.stockQuantity})`);
        return;
      }
      setCart(cart.map((item, i) => 
        i === existingIndex ? { ...item, quantity: newQty } : item
      ));
    } else {
      setCart([...cart, {
        productId: productDetails._id,
        name: productDetails.productName,
        quantity,
        price: productDetails.price,
        bv: productDetails.bv,
        pv: productDetails.pv,
      }]);
    }

    toast.success(`${productDetails.productName} added to bill`);
    setProductDetails(null);
    setProductIdInput('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // ===== Calculate Totals =====
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalBV = cart.reduce((sum, item) => sum + (item.bv * item.quantity), 0);
  const totalPV = cart.reduce((sum, item) => sum + (item.pv * item.quantity), 0);

  // ===== Generate Bill =====
  const handleGenerateBill = async () => {
    if (!verifiedMember) {
      toast.error('Please verify member first');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        memberId: verifiedMember.memberId,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
      };

      const response = await processFranchiseSale(payload);
      const data = response.data || response;
      setSaleResult({
        saleNo: data.sale?.saleNo,
        grandTotal: data.grandTotal,
        totalBV: data.totalBV,
        totalPV: data.totalPV,
        userActivated: data.userActivated,
        isFirstPurchase: data.isFirstPurchase,
        emailSent: data.emailSent,
      });
      setShowSuccessDialog(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to generate bill';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    setSaleResult(null);
    setVerifiedMember(null);
    setMemberIdInput('');
    setProductDetails(null);
    setProductIdInput('');
    setCart([]);
    setPaymentMethod('cash');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/franchise/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Create Bill</h1>
            <p className="text-xs text-muted-foreground">{franchise?.shopName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column - Search & Add */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Member Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Step 1: Verify Member
                </CardTitle>
                <CardDescription>Enter the Member ID to verify the buyer</CardDescription>
              </CardHeader>
              <CardContent>
                {!verifiedMember ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter Member ID (e.g., SS000001)"
                      value={memberIdInput}
                      onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyMember()}
                    />
                    <Button type="button" onClick={handleVerifyMember} disabled={isMemberLoading}>
                      <Search className="h-4 w-4 mr-2" />
                      {isMemberLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-green-500/50 rounded-lg bg-green-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{verifiedMember.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {verifiedMember.memberId}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        {verifiedMember.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleClearMember}>
                      Change Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Product Addition */}
            <Card className={!verifiedMember ? 'opacity-50 pointer-events-none' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Step 2: Add Products
                </CardTitle>
                <CardDescription>Search products by ID and add to bill</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Product ID"
                    value={productIdInput}
                    onChange={(e) => setProductIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckProduct()}
                    disabled={!verifiedMember}
                  />
                    <Button type="button" onClick={handleCheckProduct} disabled={isProductLoading || !verifiedMember}>
                      <Search className="h-4 w-4 mr-2" />
                      {isProductLoading ? 'Checking...' : 'Check'}
                    </Button>
                </div>

                {/* Product Preview */}
                {productDetails && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex gap-4">
                      {productDetails.productImage?.url ? (
                        <img
                          src={productDetails.productImage.url}
                          alt={productDetails.productName}
                          className="h-20 w-20 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{productDetails.productName}</h4>
                        {productDetails.category && (
                          <Badge variant="secondary" className="mt-1">{productDetails.category}</Badge>
                        )}
                        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                          <div className="p-2 bg-background rounded text-center">
                            <p className="text-muted-foreground text-xs">Price</p>
                            <p className="font-bold">₹{productDetails.price}</p>
                          </div>
                          <div className="p-2 bg-background rounded text-center">
                            <p className="text-muted-foreground text-xs">BV</p>
                            <p className="font-bold">{productDetails.bv}</p>
                          </div>
                          <div className="p-2 bg-background rounded text-center">
                            <p className="text-muted-foreground text-xs">PV</p>
                            <p className="font-bold">{productDetails.pv}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Stock: {productDetails.stockQuantity} units
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Qty:</span>
                        <Input
                          type="number"
                          min={1}
                          max={productDetails.stockQuantity}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </div>
                      <Button type="button" onClick={handleAddToCart} className="flex-1">
                        Add to Bill
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cart & Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Bill Summary
                </CardTitle>
                <CardDescription>
                  {cart.length} item(s) in bill
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Table */}
                {cart.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ₹{item.price} × {item.quantity}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{item.price * item.quantity}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveFromCart(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items in bill</p>
                    <p className="text-sm">Add products to generate bill</p>
                  </div>
                )}

                {/* Grand Totals */}
                {cart.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total BV</span>
                        <span className="font-semibold">{totalBV}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total PV</span>
                        <span className="font-semibold">{totalPV}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Generate Bill Button */}
                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      onClick={handleGenerateBill}
                      disabled={isProcessing || !verifiedMember || cart.length === 0}
                    >
                      {isProcessing ? 'Processing...' : 'Generate Bill'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">Sale Completed Successfully! ✅</DialogTitle>
            <DialogDescription className="text-center">
              Invoice generated for {verifiedMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Sale Number */}
          {saleResult?.saleNo && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Sale No</p>
              <p className="font-mono font-bold text-lg">{saleResult.saleNo}</p>
            </div>
          )}

          {/* Grand Total */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Grand Total</p>
            <p className="text-3xl font-bold text-primary">
              ₹{(saleResult?.grandTotal ?? totalAmount).toLocaleString()}
            </p>
          </div>

          {/* BV/PV Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total BV</p>
              <p className="font-bold text-lg">{saleResult?.totalBV ?? totalBV}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total PV</p>
              <p className="font-bold text-lg">{saleResult?.totalPV ?? totalPV}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {saleResult?.userActivated && (
              <Badge className="bg-green-500">User Activated! 🎉</Badge>
            )}
            {saleResult?.isFirstPurchase && (
              <Badge variant="secondary">First Purchase</Badge>
            )}
            {saleResult?.emailSent && (
              <Badge variant="outline">Invoice Emailed ✉️</Badge>
            )}
          </div>

          <Button type="button" onClick={handleCloseSuccess} className="w-full">
            Create New Bill
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FranchiseCreateBill;
