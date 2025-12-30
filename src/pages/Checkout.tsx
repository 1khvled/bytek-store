import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Truck, Building } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { wilayas } from '@/data/wilayas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ShippingType = 'stopDesk' | 'homeDelivery';

interface ShippingRate {
  wilaya_id: number;
  wilaya_name: string;
  home_delivery_cost: number;
  stop_desk_cost: number;
  is_active: boolean;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  wilayaId: number | null;
  shippingType: ShippingType;
  notes: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    wilayaId: null,
    shippingType: 'homeDelivery',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  
  // Spam protection: Track form load time and honeypot field
  const [formLoadTime] = useState(() => Date.now());
  const [honeypotValue, setHoneypotValue] = useState('');

  // Fetch shipping rates from database
  useEffect(() => {
    const fetchShippingRates = async () => {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching shipping rates:', error);
        // Fallback to static rates
        setShippingRates([]);
      } else {
        setShippingRates(data || []);
      }
      setIsLoadingRates(false);
    };

    fetchShippingRates();
  }, []);

  // Get shipping cost - check DB first, fallback to static
  const getShippingCost = () => {
    if (!formData.wilayaId) return 0;
    
    // Check if we have DB rate for this wilaya
    const dbRate = shippingRates.find(r => r.wilaya_id === formData.wilayaId);
    if (dbRate) {
      return formData.shippingType === 'homeDelivery' 
        ? dbRate.home_delivery_cost 
        : dbRate.stop_desk_cost;
    }
    
    // Fallback to static wilaya data
    const staticWilaya = wilayas.find(w => w.id === formData.wilayaId);
    if (staticWilaya) {
      return formData.shippingType === 'homeDelivery' 
        ? staticWilaya.domicileEcommerce 
        : staticWilaya.stopDeskEcommerce;
    }
    
    return 0;
  };

  const selectedWilaya = wilayas.find(w => w.id === formData.wilayaId);
  const shippingCost = getShippingCost();
  const subtotal = getSubtotal();
  const total = subtotal + shippingCost;

  // Get display prices for shipping options
  const getHomeDeliveryPrice = () => {
    if (!formData.wilayaId) return null;
    const dbRate = shippingRates.find(r => r.wilaya_id === formData.wilayaId);
    if (dbRate) return dbRate.home_delivery_cost;
    const staticWilaya = wilayas.find(w => w.id === formData.wilayaId);
    return staticWilaya?.domicileEcommerce ?? null;
  };

  const getStopDeskPrice = () => {
    if (!formData.wilayaId) return null;
    const dbRate = shippingRates.find(r => r.wilaya_id === formData.wilayaId);
    if (dbRate) return dbRate.stop_desk_cost;
    const staticWilaya = wilayas.find(w => w.id === formData.wilayaId);
    return staticWilaya?.stopDeskEcommerce ?? null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(price) + ' DZD';
  };

  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(0|\+213)[567]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Algerian phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.wilayaId) {
      newErrors.wilayaId = 'Please select a wilaya';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Spam protection: Check honeypot field (bots auto-fill hidden fields)
    if (honeypotValue.trim() !== '') {
      toast.error('Invalid submission detected. Please try again.');
      return;
    }
    
    // Spam protection: Check form timing (bots submit too quickly)
    const timeSinceLoad = Date.now() - formLoadTime;
    if (timeSinceLoad < 5000) {
      toast.error('Please take your time filling out the form.');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order items as JSON (matching OrderItem interface)
      const orderItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        subtotal: item.product.price * item.quantity
      }));

      // Create order in Supabase
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          customer_address: `${formData.address}, ${formData.city}`,
          wilaya_id: formData.wilayaId!,
          wilaya_name: selectedWilaya!.name,
          shipping_type: formData.shippingType,
          shipping_cost: shippingCost,
          subtotal: subtotal,
          total: total,
          items: orderItems as unknown as import('@/integrations/supabase/types').Json,
          notes: formData.notes || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cod',
          order_number: `ORD-${Date.now()}`
        }])
        .select()
        .single();

      if (error) throw error;

      // Send customer confirmation email if email provided
      if (formData.email && orderData) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          await fetch(`${supabaseUrl}/functions/v1/notify-customer-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              order: {
                ...orderData,
                items: orderItems,
              }
            }),
          });
          // Don't fail order creation if email fails
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Continue anyway - order is created
        }
      }

      // Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-success');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="font-heading text-2xl font-bold mb-2">No Items to Checkout</h1>
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild size="lg">
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </button>

          <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customer Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-heading text-lg font-semibold mb-4">Contact Information</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        className={cn(errors.fullName && "border-destructive")}
                      />
                      {errors.fullName && (
                        <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+213 555 123 456"
                        className={cn(errors.phone && "border-destructive")}
                      />
                      {errors.phone && (
                        <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={cn(errors.email && "border-destructive")}
                      />
                      {errors.email && (
                        <p className="text-destructive text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gaming-blue" />
                    Shipping Address
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                        className={cn(errors.address && "border-destructive")}
                      />
                      {errors.address && (
                        <p className="text-destructive text-xs mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                          className={cn(errors.city && "border-destructive")}
                        />
                        {errors.city && (
                          <p className="text-destructive text-xs mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="wilaya">Wilaya *</Label>
                        <select
                          id="wilaya"
                          value={formData.wilayaId || ''}
                          onChange={(e) => handleInputChange('wilayaId', Number(e.target.value) || null)}
                          className={cn(
                            "w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                            errors.wilayaId ? "border-destructive" : "border-input"
                          )}
                        >
                          <option value="">Select wilaya</option>
                          {wilayas.map((wilaya) => (
                            <option key={wilaya.id} value={wilaya.id}>
                              {wilaya.id.toString().padStart(2, '0')} - {wilaya.name}
                            </option>
                          ))}
                        </select>
                        {errors.wilayaId && (
                          <p className="text-destructive text-xs mt-1">{errors.wilayaId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-heading text-lg font-semibold mb-4">Shipping Method</h2>
                  
                  <div className="space-y-3">
                    <label className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      formData.shippingType === 'homeDelivery' 
                        ? "border-gaming-blue bg-gaming-blue/5" 
                        : "border-border hover:border-muted-foreground"
                    )}>
                      <input
                        type="radio"
                        name="shippingType"
                        checked={formData.shippingType === 'homeDelivery'}
                        onChange={() => handleInputChange('shippingType', 'homeDelivery')}
                        className="sr-only"
                      />
                      <Truck className="h-5 w-5 text-gaming-blue" />
                      <div className="flex-1">
                        <p className="font-medium">Home Delivery</p>
                        <p className="text-sm text-muted-foreground">Delivered to your doorstep</p>
                      </div>
                      <span className="font-semibold">
                        {getHomeDeliveryPrice() !== null ? formatPrice(getHomeDeliveryPrice()!) : '—'}
                      </span>
                    </label>

                    <label className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      formData.shippingType === 'stopDesk' 
                        ? "border-gaming-blue bg-gaming-blue/5" 
                        : "border-border hover:border-muted-foreground"
                    )}>
                      <input
                        type="radio"
                        name="shippingType"
                        checked={formData.shippingType === 'stopDesk'}
                        onChange={() => handleInputChange('shippingType', 'stopDesk')}
                        className="sr-only"
                      />
                      <Building className="h-5 w-5 text-gaming-blue" />
                      <div className="flex-1">
                        <p className="font-medium">Stop Desk Pickup</p>
                        <p className="text-sm text-muted-foreground">Pick up at relay point</p>
                      </div>
                      <span className="font-semibold">
                        {getStopDeskPrice() !== null ? formatPrice(getStopDeskPrice()!) : '—'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-heading text-lg font-semibold mb-4">Order Notes (Optional)</h2>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                  />
                </div>
                
                {/* Honeypot field - Hidden from users, bots will fill it */}
                <input
                  type="text"
                  name="website"
                  value={honeypotValue}
                  onChange={(e) => setHoneypotValue(e.target.value)}
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none',
                    tabIndex: -1
                  }}
                  aria-hidden="true"
                  autoComplete="off"
                />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
                    {items.map((item) => (
                      <div 
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        className="flex gap-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedSize !== 'One Size' && item.selectedSize}
                            {item.selectedColor !== 'Default' && ` / ${item.selectedColor}`}
                            {' × '}{item.quantity}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{selectedWilaya ? formatPrice(shippingCost) : 'Select wilaya'}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-heading font-semibold">Total</span>
                      <span className="font-heading font-bold text-xl">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-secondary rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium mb-1">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      Cash on Delivery (COD) - Pay when you receive your order
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    variant="gaming"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}