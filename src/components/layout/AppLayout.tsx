import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Camera, 
  UtensilsCrossed, 
  Newspaper, 
  BarChart3, 
  History, 
  User,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/feed", label: "News & Updates", icon: Newspaper },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-cb-green-500 text-white shadow-soft' 
                : 'text-cb-ink hover:bg-cb-green-100 hover:text-cb-green-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-cb-taupe min-h-screen p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-conqueror text-cb-ink">CB Lens</h1>
                <p className="text-xs text-cb-green-600">Nutrition Companion</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            <NavContent />
          </nav>
          
          {/* Canteen Selector */}
          <div className="mt-8 p-4 bg-cb-green-100 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-cb-green-600">Current Canteen</span>
              <Badge variant="secondary" className="text-xs">Default</Badge>
            </div>
            <p className="text-sm text-cb-ink">Main Campus</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full text-cb-green-600 hover:bg-cb-green-200">
              Change Location
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-conqueror text-cb-ink">CB Lens</h1>
            </div>
          </div>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-cb-taupe">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-conqueror text-cb-ink">Navigation</h2>
              </div>
              <nav className="space-y-2">
                <NavContent />
              </nav>
              
              {/* Mobile Canteen Selector */}
              <div className="mt-8 p-4 bg-cb-green-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-cb-green-600">Current Canteen</span>
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                </div>
                <p className="text-sm text-cb-ink">Main Campus</p>
                <Button variant="ghost" size="sm" className="mt-2 w-full text-cb-green-600 hover:bg-cb-green-200">
                  Change Location
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Mobile Main Content */}
        <main className="pb-20">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-cb-green-500' 
                      : 'text-muted-foreground hover:text-cb-green-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Floating Scan Button (Mobile) */}
      <Link
        to="/scan"
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-primary rounded-full shadow-elevated flex items-center justify-center z-50"
      >
        <Camera className="h-6 w-6 text-white" />
      </Link>
    </div>
  );
}