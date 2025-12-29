import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Flexible product interface that works with both static and database products
interface ProductCardProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  originalPrice?: number;
  image: string;
  images?: string[] | null;
  category: string;
  in_stock?: boolean | null;
  inStock?: boolean;
  status?: string | null;
  rating?: number | null;
  reviews?: number | null;
  sku?: string | null;
  stock?: Record<string, Record<string, number>> | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  tags?: string[] | null;
  featured?: boolean | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Handle both naming conventions
  const originalPrice = product.original_price || product.originalPrice;
  const inStock = product.in_stock ?? product.inStock ?? true;
  
  const isDiscounted = originalPrice && originalPrice > product.price;
  const discountPercent = isDiscounted 
    ? Math.round((1 - product.price / originalPrice!) * 100) 
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sizes = product.sizes || ['One Size'];
    const colors = product.colors || ['Default'];
    const defaultSize = sizes[0];
    const defaultColor = colors[0];
    
    // Create cart-compatible product
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: originalPrice || undefined,
      image: product.image,
      images: product.images || undefined,
      category: product.category,
      inStock: inStock,
      status: (product.status as 'available' | 'soon' | 'out_of_stock') || 'available',
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      sku: product.sku || undefined,
      stock: product.stock || {},
      sizes: sizes,
      colors: colors,
      tags: product.tags || undefined,
      featured: product.featured || undefined,
    };
    
    addToCart(cartProduct, 1, defaultSize, defaultColor);
    toast.success(`Added to cart`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(price) + ' DZD';
  };

  return (
    <Link to={`/product/${product.id}`} className={cn("group block", className)}>
      <div className="bg-card rounded-xl overflow-hidden border border-border transition-all duration-200 hover:border-foreground/20 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isDiscounted && (
              <span className="bg-foreground text-background text-[10px] font-semibold px-2 py-1 rounded">
                -{discountPercent}%
              </span>
            )}
            {!inStock && (
              <span className="bg-background/90 text-foreground text-[10px] font-medium px-2 py-1 rounded">
                Sold out
              </span>
            )}
          </div>

          {/* Quick Actions */}
          {inStock && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <ProductQuickView product={product} />
              <Button 
                size="icon" 
                className="h-9 w-9 rounded-full shadow-sm"
                onClick={handleQuickAdd}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {formatPrice(product.price)}
            </span>
            {isDiscounted && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice!)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
