import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

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

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-heading text-xl font-bold tracking-tight">Bytek Store</span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
              Premium gaming gear for serious gamers. Fast delivery across all 69 wilayas in Algeria via WorldExpress.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.instagram.com/bytekstore_dz/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@byteckstoredz" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=mice" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  Gaming Mice
                </Link>
              </li>
              <li>
                <Link to="/products?category=keyboards" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  Keyboards
                </Link>
              </li>
              <li>
                <Link to="/products?category=headsets" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  Headsets
                </Link>
              </li>
              <li>
                <Link to="/products?category=ssds" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  SSDs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Shipping Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Livraison</h4>
            <ul className="space-y-3">
              <li className="text-primary-foreground/60 text-sm">
                🚚 Via <span className="text-primary-foreground font-medium">WorldExpress</span>
              </li>
              <li className="text-primary-foreground/60 text-sm">
                📍 69 Wilayas en Algérie
              </li>
              <li className="text-primary-foreground/60 text-sm">
                ⏱️ Délai: 24-48h max
              </li>
              <li className="text-primary-foreground/60 text-sm">
                💵 Paiement à la livraison (COD)
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary-foreground/40 flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/60 text-sm">
                  Algeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-foreground/40 flex-shrink-0" />
                <a href="tel:0672536920" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                  0672 536 920
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/40 text-sm">
              © {new Date().getFullYear()} Bytek Store. All rights reserved.
            </p>
            <p className="text-primary-foreground/40 text-sm">
              Prices in DZD · Cash on Delivery
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
