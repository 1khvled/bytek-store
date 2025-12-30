import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, ShoppingCart, Search, Eye, Save, X, Truck,
  Package, Clock, CheckCircle, XCircle, Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  wilaya_id: number;
  wilaya_name: string;
  shipping_type: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  items: OrderItem[];
  status: string;
  tracking_number: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_status: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrders() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    tracking_number: '',
    estimated_delivery: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching orders',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Parse items from JSONB and normalize field names (handle both old and new formats)
      const parsedOrders = (data || []).map(order => {
        let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        // Normalize field names: convert old format to new format if needed
        if (Array.isArray(items)) {
          items = items.map((item: any) => ({
            id: item.id || item.productId,
            name: item.name || item.productName,
            image: item.image || item.productImage,
            price: item.price,
            quantity: item.quantity,
            size: item.size || item.selectedSize,
            color: item.color || item.selectedColor,
            subtotal: item.subtotal || (item.price * item.quantity)
          }));
        }
        
        return {
          ...order,
          items
        };
      });
      setOrders(parsedOrders);
    }
    setIsLoading(false);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditData({
      status: order.status,
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Order deleted',
        description: `Order ${orderNumber} has been deleted successfully.`,
      });
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error deleting order',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('orders')
      .update({
        status: editData.status,
        tracking_number: editData.tracking_number || null,
        estimated_delivery: editData.estimated_delivery || null,
      })
      .eq('id', selectedOrder.id);

    if (error) {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Order updated' });
      setIsDialogOpen(false);
      fetchOrders();
    }
    setIsSaving(false);
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Orders</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">You need admin privileges to view orders.</p>
          </div>
        )}

        {isAdmin && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by order #, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Orders Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Order #</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-medium text-foreground">
                              {order.order_number}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-muted-foreground">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-foreground">
                              {order.total.toLocaleString()} DZD
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOrder(order.id, order.order_number)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wilaya:</span>
                    <p className="font-medium">{selectedOrder.wilaya_name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{selectedOrder.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => {
                      // Handle both old and new field names
                      const itemName = item.name || item.productName || 'Unknown Product';
                      const itemImage = item.image || item.productImage || '/placeholder.svg';
                      const itemSize = item.size || item.selectedSize;
                      const itemColor = item.color || item.selectedColor;
                      const itemPrice = item.price || 0;
                      const itemQuantity = item.quantity || 1;
                      
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-muted/30 rounded-lg p-3">
                          <img 
                            src={itemImage} 
                            alt={itemName}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              {itemSize && `Size: ${itemSize}`}
                              {itemSize && itemColor && ' • '}
                              {itemColor && `Color: ${itemColor}`}
                            </p>
                            <p className="text-sm text-muted-foreground">Qty: {itemQuantity}</p>
                          </div>
                          <p className="font-medium">{(itemPrice * itemQuantity).toLocaleString()} DZD</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">No items found in this order</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{selectedOrder.subtotal.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Shipping ({selectedOrder.shipping_type === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}):
                    </span>
                    <span>{selectedOrder.shipping_cost.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>{selectedOrder.total.toLocaleString()} DZD</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Customer Notes:</strong> {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Update Order */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold">Update Order</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tracking">Tracking Number</Label>
                    <Input
                      id="tracking"
                      value={editData.tracking_number}
                      onChange={(e) => setEditData({ ...editData, tracking_number: e.target.value })}
                      placeholder="Enter tracking #"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery">Est. Delivery</Label>
                    <Input
                      id="delivery"
                      value={editData.estimated_delivery}
                      onChange={(e) => setEditData({ ...editData, estimated_delivery: e.target.value })}
                      placeholder="e.g., 3-5 days"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
