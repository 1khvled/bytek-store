import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  image: string;
  stock: unknown;
  in_stock: boolean | null;
}

interface LowStockAlertProps {
  products: Product[];
  isLoading?: boolean;
}

export function LowStockAlert({ products, isLoading }: LowStockAlertProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-foreground">Stock Faible</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-foreground">Stock OK</h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm">Tous les produits sont en stock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-amber-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Stock Faible</h3>
          <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </span>
        </div>
        <Link 
          to="/admin/products" 
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Gérer
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="space-y-2">
        {products.slice(0, 5).map((product) => {
          let stockTotal = 0;
          if (product.stock && typeof product.stock === 'object' && 'total' in product.stock) {
            stockTotal = (product.stock as { total?: number }).total ?? 0;
          }
          
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {product.name}
                </p>
                <p className={cn(
                  "text-xs font-medium",
                  stockTotal === 0 ? "text-red-500" : "text-amber-600"
                )}>
                  {stockTotal === 0 ? 'Rupture de stock' : `${stockTotal} restant${stockTotal > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          );
        })}
        {products.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            + {products.length - 5} autres produits
          </p>
        )}
      </div>
    </div>
  );
}
