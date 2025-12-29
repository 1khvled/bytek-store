import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSkeleton } from '@/components/product/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/hooks/useProducts';

import categoryMice from '@/assets/category-mice.jpg';
import categoryKeyboards from '@/assets/category-keyboards.jpg';
import categoryHeadsets from '@/assets/category-headsets.jpg';
import categorySsds from '@/assets/category-ssds.jpg';

const features = [
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Toutes les 69 wilayas'
  },
  {
    icon: Shield,
    title: '100% Authentique',
    description: 'Produits originaux'
  },
  {
    icon: CreditCard,
    title: 'Paiement à la Livraison',
    description: 'Payez à la réception'
  }
];

const categories = [
  { name: 'Mice', href: '/products?category=mice', image: categoryMice },
  { name: 'Keyboards', href: '/products?category=keyboards', image: categoryKeyboards },
  { name: 'Headsets', href: '/products?category=headsets', image: categoryHeadsets },
  { name: 'SSDs', href: '/products?category=ssds', image: categorySsds },
];

export default function Index() {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - High Conversion */}
        <section className="relative bg-foreground text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />
          <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2 mb-5 animate-fade-in">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Gaming Gear Authentique</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 animate-slide-up tracking-tight">
                Équipement Gaming
                <span className="block text-primary-foreground/70 text-3xl sm:text-4xl lg:text-5xl mt-2">Livré en Algérie</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-primary-foreground/70 mb-6 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Souris, claviers, casques et SSD. 
                Paiement à la livraison.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 text-sm text-primary-foreground/60 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Produits Originaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Livraison 24-72h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  <span>69 Wilayas</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold">
                  <Link to="/products">
                    Voir les Produits
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip - Conversion Booster */}
        <section className="bg-secondary border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-border">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 sm:py-5 px-2 sm:px-4 text-center sm:text-left">
                  <feature.icon className="h-5 w-5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm">{feature.title}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products - Best Sellers */}
        <section className="py-10 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Populaire</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
                  Meilleures Ventes
                </h2>
              </div>
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link to="/products">
                  Tout Voir
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                featuredProducts.slice(0, 8).map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Button asChild className="w-full h-12">
                <Link to="/products">
                  Voir Tous les Produits
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories - Visual Navigation */}
        <section className="py-10 lg:py-16 bg-secondary/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-1">
                Catégories
              </h2>
              <p className="text-muted-foreground text-xs lg:text-sm">
                Trouvez ce qu'il vous faut
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
                    <h3 className="font-bold text-primary-foreground text-base lg:text-lg">
                      {category.name}
                    </h3>
                    <span className="text-primary-foreground/80 text-xs lg:text-sm flex items-center gap-1 mt-0.5 group-hover:gap-2 transition-all">
                      Explorer
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* Final CTA - Urgency */}
        <section className="py-12 lg:py-16 bg-foreground text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-4">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Livraison Express Disponible</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
              Commandez Maintenant
            </h2>
            <p className="text-primary-foreground/70 max-w-md mx-auto mb-6 text-sm">
              Paiement à la livraison. Satisfait ou remboursé. Livraison vers toutes les 69 wilayas.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-12 px-8 font-semibold">
              <Link to="/products">
                Voir les Produits
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
