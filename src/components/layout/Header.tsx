import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import bytekLogo from '@/assets/bytek-logo.png';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'All Products', href: '/products' },
  { name: 'Keyboards', href: '/products?category=keyboards' },
  { name: 'Mice', href: '/products?category=mice' },
  { name: 'SSDs', href: '/products?category=ssds' },
  { name: 'Headsets', href: '/products?category=headsets' },
];

// Custom TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

// Custom Instagram icon
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar with contact and socials */}
      <div className="bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-end h-9 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-primary-foreground/60 hidden sm:block">Follow us</span>
              <a 
                href="https://www.instagram.com/bytekstore_dz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@byteckstoredz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Store Name */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={bytekLogo} 
              alt="Bytek Store" 
              className="h-9 w-auto object-contain"
            />
            <span className="font-bold text-lg tracking-tight hidden sm:block text-foreground">BYTEK STORE</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => {
              const isActive = item.href === '/products' 
                ? location.pathname === '/products' && !location.search
                : location.search.includes(item.href.split('=')[1] || '');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative touch-target flex items-center justify-center">
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-foreground text-background text-[11px] font-semibold flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = item.href === '/products' 
                  ? location.pathname === '/products' && !location.search
                  : location.search.includes(item.href.split('=')[1] || '');
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-colors touch-target",
                      isActive
                        ? "text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile socials */}
            <div className="mt-4 pt-4 border-t border-border px-4">
              <div className="flex items-center justify-end gap-3">
                <a 
                  href="https://www.instagram.com/bytekstore_dz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@byteckstoredz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
