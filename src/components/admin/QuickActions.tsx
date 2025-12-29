import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Truck, Plus, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  icon: typeof Package;
  href: string;
  badge?: number;
  variant?: 'default' | 'primary' | 'warning';
}

interface QuickActionsProps {
  pendingOrdersCount: number;
  lowStockCount: number;
}

export function QuickActions({ pendingOrdersCount, lowStockCount }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: 'Produits',
      description: 'Gérer le catalogue',
      icon: Package,
      href: '/admin/products',
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      variant: lowStockCount > 0 ? 'warning' : 'default',
    },
    {
      title: 'Commandes',
      description: 'Traiter les commandes',
      icon: ShoppingCart,
      href: '/admin/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      variant: pendingOrdersCount > 0 ? 'primary' : 'default',
    },
    {
      title: 'Livraison',
      description: 'Tarifs par wilaya',
      icon: Truck,
      href: '/admin/shipping',
    },
    {
      title: 'Ajouter Produit',
      description: 'Nouveau produit',
      icon: Plus,
      href: '/admin/products?action=add',
    },
  ];

  const variantStyles = {
    default: 'border-border hover:border-foreground/20',
    primary: 'border-primary/30 hover:border-primary/50',
    warning: 'border-amber-500/30 hover:border-amber-500/50',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Actions Rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border bg-background hover:shadow-md transition-all duration-300 group",
                variantStyles[action.variant || 'default']
              )}
            >
              {action.badge !== undefined && (
                <span className={cn(
                  "absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold rounded-full text-white",
                  action.variant === 'warning' ? 'bg-amber-500' : 'bg-primary'
                )}>
                  {action.badge}
                </span>
              )}
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                action.variant === 'warning' ? 'bg-amber-500/10 group-hover:bg-amber-500/20' :
                action.variant === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' :
                'bg-muted group-hover:bg-muted/80'
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  action.variant === 'warning' ? 'text-amber-600' :
                  action.variant === 'primary' ? 'text-primary' :
                  'text-foreground'
                )} />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
