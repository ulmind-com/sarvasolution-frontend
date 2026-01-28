import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { users } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [sponsorId, setSponsorId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState<{ verified: boolean; name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sponsorId.length >= 4) {
      const sponsor = users.find(u => u.id.toLowerCase() === sponsorId.toLowerCase());
      if (sponsor) {
        setSponsorVerified({ verified: true, name: sponsor.name });
      } else {
        setSponsorVerified({ verified: false, name: '' });
      }
    } else {
      setSponsorVerified(null);
    }
  }, [sponsorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sponsorVerified?.verified) {
      toast.error('Please enter a valid Sponsor ID');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Registration successful! Please login to continue.');
    navigate('/');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground">ULMind</h1>
          <p className="text-primary-foreground/80 mt-2">Network Marketing Platform</p>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-foreground">Start Your Journey Today</h2>
          <p className="text-primary-foreground/80">
            Join thousands of successful entrepreneurs who are building their financial freedom with ULMind.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary-foreground">10,000+</p>
              <p className="text-primary-foreground/70 text-sm">Active Members</p>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary-foreground">₹5Cr+</p>
              <p className="text-primary-foreground/70 text-sm">Total Payouts</p>
            </div>
          </div>
        </div>
        
        <p className="text-primary-foreground/60 text-sm">
          © 2024 ULMind. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to join the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sponsorId" className="text-foreground">Sponsor ID</Label>
                <Input
                  id="sponsorId"
                  type="text"
                  placeholder="e.g., U001"
                  value={sponsorId}
                  onChange={(e) => setSponsorId(e.target.value.toUpperCase())}
                  required
                  className="bg-card border-input"
                />
                {sponsorVerified && (
                  <div className={`flex items-center gap-2 text-sm ${sponsorVerified.verified ? 'text-primary' : 'text-destructive'}`}>
                    {sponsorVerified.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Verified: {sponsorVerified.name}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Invalid Sponsor ID</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-card border-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card border-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-card border-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !sponsorVerified?.verified}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Join Network
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
