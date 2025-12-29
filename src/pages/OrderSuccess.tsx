import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const orderId = `BYT-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="font-heading text-3xl font-bold mb-2 animate-slide-up">
            Order Confirmed!
          </h1>
          
          <p className="text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Thank you for your order. We'll contact you soon to confirm the details.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="h-5 w-5 text-gaming-blue" />
              <span className="text-sm text-muted-foreground">Order ID</span>
            </div>
            <p className="font-heading text-2xl font-bold">{orderId}</p>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-muted-foreground">
              A confirmation message will be sent to your phone. 
              You can pay with cash when the order arrives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="gaming">
                <Link to="/products">
                  Continue Shopping
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
