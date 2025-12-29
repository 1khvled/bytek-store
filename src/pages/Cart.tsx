import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(price) + ' DZD';
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <Button asChild size="lg" variant="gaming">
              <Link to="/products">
                Browse Products
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
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
      
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">Shopping Cart</h1>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div 
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="bg-card rounded-xl border border-border p-4 lg:p-6"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-lg bg-secondary"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${item.product.id}`}
                        className="font-heading font-semibold hover:text-gaming-blue transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.selectedSize !== 'One Size' && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor !== 'Default' && (
                          <span className="ml-3">Color: {item.selectedColor}</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(
                              item.product.id, 
                              item.selectedSize, 
                              item.selectedColor, 
                              item.quantity - 1
                            )}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(
                              item.product.id, 
                              item.selectedSize, 
                              item.selectedColor, 
                              item.quantity + 1
                            )}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-heading font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.product.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-heading font-semibold">Total</span>
                    <span className="font-heading font-bold text-lg">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg" variant="gaming">
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>

                <Link 
                  to="/products" 
                  className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
