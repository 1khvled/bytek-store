import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; quantity: number }>;
}

interface RecentOrdersProps {
  orders: Order[];
  isLoading?: boolean;
}

const statusConfig: Record<string, { icon: typeof Package; label: string; className: string }> = {
  pending: { icon: Clock, label: 'En attente', className: 'bg-amber-500/10 text-amber-600' },
  confirmed: { icon: CheckCircle, label: 'Confirmée', className: 'bg-blue-500/10 text-blue-600' },
  shipped: { icon: Truck, label: 'Expédiée', className: 'bg-purple-500/10 text-purple-600' },
  delivered: { icon: CheckCircle, label: 'Livrée', className: 'bg-emerald-500/10 text-emerald-600' },
  cancelled: { icon: XCircle, label: 'Annulée', className: 'bg-red-500/10 text-red-500' },
};

export function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Dernières Commandes</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-6 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Dernières Commandes</h3>
        <Link 
          to="/admin/orders" 
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune commande récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status || 'pending'] || statusConfig.pending;
            const StatusIcon = status.icon;
            const itemsCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
            
            return (
              <Link
                key={order.id}
                to="/admin/orders"
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={cn("p-2.5 rounded-lg", status.className)}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {order.order_number}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      • {itemsCount} article{itemsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.customer_name} • {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{order.total.toLocaleString()} DA</p>
                  <p className={cn("text-xs font-medium", status.className.replace('/10', '').replace('bg-', 'text-'))}>
                    {status.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
