import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus, Star, Check, Truck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductById, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { data: product, isLoading } = useProductById(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || 'One Size');
      setSelectedColor(product.colors?.[0] || 'Default');
      setSelectedImage(0);
      setImageLoading(true);
    }
  }, [product]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!product) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    // Combine main image with gallery images
    const allImages = [product.image];
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && img !== product.image && !allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }
    
    if (Math.abs(diff) > threshold && allImages.length > 1) {
      if (diff > 0) {
        // Swipe left - next image
        setImageLoading(true);
        setSelectedImage(prev => prev === allImages.length - 1 ? 0 : prev + 1);
      } else {
        // Swipe right - previous image
        setImageLoading(true);
        setSelectedImage(prev => prev === 0 ? allImages.length - 1 : prev - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-4 lg:py-8">
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-16">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="font-heading text-xl lg:text-2xl font-bold mb-4">Produit non trouvé</h1>
            <Button asChild>
              <Link to="/products">Retour aux produits</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combine main image with gallery images, ensuring main image is first and no duplicates
  const allImages = [product.image];
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img && img !== product.image && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }
  const images = allImages;
  
  const isDiscounted = product.original_price && product.original_price > product.price;
  const sizes = product.sizes || ['One Size'];
  const colors = product.colors || ['Default'];
  
  const currentStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
  const isInStock = currentStock > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(price) + ' DA';
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image,
      images: product.images || undefined,
      category: product.category,
      inStock: product.in_stock || false,
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
    
    addToCart(cartProduct, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image,
      images: product.images || undefined,
      category: product.category,
      inStock: product.in_stock || false,
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
    
    addToCart(cartProduct, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  // Related products (same category, excluding current)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 lg:py-8 lg:px-8">
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-4 lg:mb-8 transition-colors text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16">
            {/* Images */}
            <div className="space-y-3">
              {/* Main Image with swipe support */}
              <div 
                className="aspect-square bg-secondary rounded-xl lg:rounded-2xl overflow-hidden relative group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary z-10">
                    <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                  </div>
                )}
                <img
                  key={`${product.id}-${selectedImage}-${images[selectedImage]}`}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    if (selectedImage !== 0) setSelectedImage(0);
                    setImageLoading(false);
                  }}
                />
                
                {/* Navigation Arrows - Hidden on mobile, visible on desktop hover */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setImageLoading(true);
                        setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                      }}
                      className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity active:scale-95 shadow-lg"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setImageLoading(true);
                        setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity active:scale-95 shadow-lg"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Image Dots for mobile */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setImageLoading(true);
                            setSelectedImage(index);
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            selectedImage === index 
                              ? "bg-foreground w-4" 
                              : "bg-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnails - Hidden on mobile */}
              {images.length > 1 && (
                <div className="hidden lg:flex gap-3 justify-center">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setImageLoading(true);
                        setSelectedImage(index);
                      }}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        selectedImage === index 
                          ? "border-foreground ring-2 ring-foreground/20 scale-105" 
                          : "border-transparent hover:border-border opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 lg:space-y-6">
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs lg:text-sm text-muted-foreground uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{product.rating || 0}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
                </div>
              </div>

              {/* Name */}
              <h1 className="font-heading text-2xl lg:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-heading text-2xl lg:text-3xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {isDiscounted && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-2">
                {isInStock ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600 font-medium">
                      En stock
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-destructive font-medium">
                    Rupture de stock
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              {sizes.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Taille</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-3 lg:px-4 py-2 rounded-lg border text-sm font-medium transition-all active:scale-95",
                          selectedSize === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-3 lg:px-4 py-2 rounded-lg border text-sm font-medium transition-all active:scale-95",
                          selectedColor === color
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart - Desktop only */}
              <div className="hidden lg:flex flex-col sm:flex-row gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                    disabled={quantity >= currentStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>

                <Button 
                  size="lg" 
                  variant="gaming"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                >
                  Acheter maintenant
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-3 p-3 lg:p-4 bg-secondary/50 rounded-xl">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Livraison via WorldExpress</p>
                  <p className="text-xs text-muted-foreground">
                    Paiement à la livraison (COD) • 69 wilayas • 24-48h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 lg:mt-24">
              <h2 className="font-heading text-xl lg:text-2xl font-bold mb-6">Produits similaires</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 z-50">
        <div className="flex items-center gap-3">
          {/* Quantity */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 active:bg-secondary transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              className="p-2.5 active:bg-secondary transition-colors"
              disabled={quantity >= currentStock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Add to Cart */}
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1 h-11"
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Panier
          </Button>

          {/* Buy Now */}
          <Button 
            size="lg" 
            className="flex-1 h-11"
            onClick={handleBuyNow}
            disabled={!isInStock}
          >
            Acheter
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
