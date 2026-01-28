import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  Shield, 
  BarChart3, 
  Users, 
  ArrowRight, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  const scrollToPlans = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sarva Solution</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Our Plans</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          
          <Link to="/login">
            <Button className="font-semibold">
              Login / Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              The Future of{' '}
              <span className="text-primary">Network Marketing</span>{' '}
              Software
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Manage your team, track payouts, and grow your binary network with our advanced algorithmic solutions. Built for modern MLM businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="font-semibold px-8 py-6 text-lg">
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-semibold px-8 py-6 text-lg"
                onClick={scrollToPlans}
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Sarva Solution
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Sarva Solution provides cutting-edge digital tools for MLM businesses, ensuring transparency and speed. Our platform is designed to empower network marketers with the tools they need to succeed.
              </p>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                With over 5 years of experience in the industry, we've helped thousands of businesses streamline their operations and maximize their growth potential.
              </p>
              <div className="space-y-3">
                {['Trusted by 10,000+ users', 'Enterprise-grade security', '24/7 Customer support'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 shadow-sm">
                    <h3 className="text-3xl font-bold text-primary mb-2">10K+</h3>
                    <p className="text-muted-foreground text-sm">Active Users</p>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-sm">
                    <h3 className="text-3xl font-bold text-primary mb-2">₹50Cr+</h3>
                    <p className="text-muted-foreground text-sm">Payouts Processed</p>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-sm">
                    <h3 className="text-3xl font-bold text-primary mb-2">99.9%</h3>
                    <p className="text-muted-foreground text-sm">Uptime</p>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-sm">
                    <h3 className="text-3xl font-bold text-primary mb-2">5+</h3>
                    <p className="text-muted-foreground text-sm">Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform is built with the latest technology to give you the competitive edge in network marketing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Automated Payouts</h3>
                <p className="text-muted-foreground">
                  Instant calculation of binary and level matching commissions with zero manual intervention.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Secure Wallet</h3>
                <p className="text-muted-foreground">
                  256-bit encrypted transactions ensuring your funds are always safe and secure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Track your downline growth live with comprehensive dashboards and reports.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Team Management</h3>
                <p className="text-muted-foreground">
                  Powerful genealogy tools to visualize and manage your entire network efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your MLM Business?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful network marketers who trust Sarva Solution for their business growth.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="font-semibold px-8 py-6 text-lg">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold text-foreground">Sarva Solution</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering network marketers with cutting-edge technology solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Home</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About Us</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</a></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Refund Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2026 Sarva Solution. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
