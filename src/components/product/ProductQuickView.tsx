import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductQuickViewProduct {
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

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat("fr-DZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price) + " DZD"
  );
}

export function ProductQuickView({ product }: { product: ProductQuickViewProduct }) {
  const { addToCart } = useCart();

  const originalPrice = product.original_price || product.originalPrice;
  const isDiscounted = originalPrice && originalPrice > product.price;
  const inStock = product.in_stock ?? product.inStock ?? true;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleQuickAdd = () => {
    const sizes = product.sizes || ["One Size"];
    const colors = product.colors || ["Default"];

    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: originalPrice || undefined,
      image: product.image,
      images: product.images || undefined,
      category: product.category,
      inStock: inStock,
      status: (product.status as "available" | "soon" | "out_of_stock") || "available",
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      sku: product.sku || undefined,
      stock: product.stock || {},
      sizes,
      colors,
      tags: product.tags || undefined,
      featured: product.featured || undefined,
    };

    addToCart(cartProduct, 1, sizes[0], colors[0]);
    toast.success("Added to cart");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-full shadow-sm"
          aria-label={`Quick view ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[92vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
            <img
              src={images[0]}
              alt={`${product.name} product photo`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>

            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold">{formatPrice(product.price)}</p>
              {isDiscounted && (
                <p className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice!)}</p>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-4">{product.description}</p>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleQuickAdd} disabled={!inStock} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to cart
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to={`/product/${product.id}`}>View full details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
