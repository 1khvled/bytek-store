import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  ArrowLeft, 
  LayoutDashboard, 
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { QuickActions } from '@/components/admin/QuickActions';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; quantity: number }>;
}

interface Product {
  id: string;
  name: string;
  image: string;
  stock: unknown;
  in_stock: boolean | null;
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('products')
          .select('id, name, image, stock, in_stock')
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      const parsedOrders = (ordersRes.data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []
      }));

      setOrders(parsedOrders);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success('Données actualisées');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  // Calculate stats
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter(p => {
    let stockTotal = 999;
    if (p.stock && typeof p.stock === 'object' && 'total' in p.stock) {
      stockTotal = (p.stock as { total?: number }).total ?? 999;
    } else if (!p.in_stock) {
      stockTotal = 0;
    }
    return stockTotal <= 5;
  });

  // Recent orders for the widget
  const recentOrders = orders.slice(0, 5);

  // Orders from last 30 days for chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrdersForChart = orders.filter(
    o => new Date(o.created_at) >= thirtyDaysAgo
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-lg">
                  <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
              {isAdmin && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                  Admin
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour, {user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre boutique
          </p>
        </div>

        {!isAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800 font-medium">
              Vous n'avez pas les droits d'administrateur. Contactez le propriétaire de la boutique.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Revenus Total"
                value={`${totalRevenue.toLocaleString()} DA`}
                subtitle="Commandes livrées"
                icon={DollarSign}
                variant="success"
              />
              <StatsCard
                title="Commandes en Attente"
                value={pendingOrders}
                subtitle="À traiter"
                icon={ShoppingCart}
                variant={pendingOrders > 0 ? 'warning' : 'default'}
              />
              <StatsCard
                title="Produits"
                value={products.length}
                subtitle={`${lowStockProducts.length} en stock faible`}
                icon={Package}
                variant={lowStockProducts.length > 0 ? 'warning' : 'default'}
              />
              <StatsCard
                title="Commandes Livrées"
                value={deliveredOrders}
                subtitle="Total livré"
                icon={TrendingUp}
                variant="success"
              />
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Chart & Orders */}
              <div className="lg:col-span-2 space-y-6">
                <RevenueChart orders={recentOrdersForChart} isLoading={isLoadingData} />
                <RecentOrders orders={recentOrders} isLoading={isLoadingData} />
              </div>

              {/* Right Column - Actions & Alerts */}
              <div className="space-y-6">
                <QuickActions 
                  pendingOrdersCount={pendingOrders} 
                  lowStockCount={lowStockProducts.length} 
                />
                <LowStockAlert products={lowStockProducts} isLoading={isLoadingData} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
