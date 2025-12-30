import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, Truck, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  tracking_number: string | null;
  total: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: 'Order number required',
        description: 'Please enter an order number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Order not found. Please check your order number and try again.');
        } else {
          throw fetchError;
        }
      } else if (data) {
        // Parse items if needed
        let items = data.items;
        if (typeof items === 'string') {
          items = JSON.parse(items);
        }
        
        setOrder({
          ...data,
          items: Array.isArray(items) ? items : []
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('An error occurred while searching for your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOnEcoTrack = () => {
    if (!order?.tracking_number) {
      toast({
        title: 'No tracking number',
        description: 'Tracking number has not been assigned to this order yet.',
        variant: 'destructive',
      });
      return;
    }

    // Redirect to ecotrack.dz with tracking number pre-filled
    const ecotrackUrl = `https://suivi.ecotrack.dz/?tracking=${encodeURIComponent(order.tracking_number)}`;
    window.open(ecotrackUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Track Your Order</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-background border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="Enter order number (e.g., ORD-123456)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Order {order.order_number}</h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Tracking Number */}
              {order.tracking_number ? (
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                      <p className="font-mono font-semibold text-foreground">{order.tracking_number}</p>
                    </div>
                    <Button
                      onClick={handleTrackOnEcoTrack}
                      className="flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Track on EcoTrack
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    Tracking number will be assigned once your order is shipped.
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString()} DZD
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{order.total.toLocaleString()} DZD</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-foreground font-medium">{order.customer_name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!order && !error && (
          <div className="bg-background border border-border rounded-xl p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Order</h3>
            <p className="text-muted-foreground mb-4">
              Enter your order number above to view order status and tracking information.
            </p>
            <p className="text-sm text-muted-foreground">
              Your order number can be found in your order confirmation email.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

