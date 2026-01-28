import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate(result.redirect);
    } else {
      toast.error('Invalid credentials. Try admin@ulmind.com or user@ulmind.com');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground">ULMind</h1>
          <p className="text-primary-foreground/80 mt-2">Network Marketing Platform</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-foreground/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Grow Your Network</h3>
              <p className="text-primary-foreground/70 text-sm">Build a powerful team and earn unlimited commissions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-foreground/10 rounded-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Binary System</h3>
              <p className="text-primary-foreground/70 text-sm">Proven binary compensation plan for maximum earnings</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-foreground/10 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Instant Payouts</h3>
              <p className="text-primary-foreground/70 text-sm">Get your earnings directly to your bank account</p>
            </div>
          </div>
        </div>
        
        <p className="text-primary-foreground/60 text-sm">
          © 2024 ULMind. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-card border-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-xs text-accent-foreground font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground">Admin: admin@ulmind.com</p>
              <p className="text-xs text-muted-foreground">User: user@ulmind.com</p>
              <p className="text-xs text-muted-foreground italic mt-1">(any password works)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
