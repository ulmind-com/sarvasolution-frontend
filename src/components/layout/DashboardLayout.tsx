import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Home,
  Users,
  ShoppingBag,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Menu,
  Network,
  IndianRupee,
  FileText,
  Settings,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { incomeTypes } from '@/data/mockData';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Overview', icon: Home },
  { path: '/dashboard/genealogy', label: 'Genealogy', icon: Network },
  { path: '/dashboard/store', label: 'Product Store', icon: ShoppingBag },
  { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { 
    label: 'My Incomes', 
    icon: IndianRupee,
    children: incomeTypes.map(t => ({ path: `/dashboard/incomes/${t.slug}`, label: t.name }))
  },
  { path: '/dashboard/capping', label: 'Capping Summary', icon: FileText },
  { 
    label: 'My Profile', 
    icon: User,
    children: [
      { path: '/dashboard/profile', label: 'Update Profile' },
      { path: '/dashboard/change-password', label: 'Change Password' }
    ]
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">UL</span>
              </div>
              <span className="font-bold text-foreground">ULMind</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(child => location.pathname === child.path);
              return (
                <Collapsible key={item.label} defaultOpen={isChildActive}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors",
                        isChildActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && <ChevronDown className="h-4 w-4" />}
                    </button>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent className="pl-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* User Info */}
        {!collapsed && currentUser && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.rank}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">₹{currentUser.balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
