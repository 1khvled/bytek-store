import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Truck, Search, Save, Loader2 } from 'lucide-react';
import { wilayas } from '@/data/wilayas';
import { Switch } from '@/components/ui/switch';

interface ShippingRate {
  id?: string;
  wilaya_id: number;
  wilaya_name: string;
  home_delivery_cost: number;
  stop_desk_cost: number;
  is_active: boolean;
}

export default function AdminShipping() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setIsLoading(true);
    
    // First fetch existing rates from database
    const { data: existingRates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('wilaya_id');

    if (error) {
      toast({
        title: 'Error fetching rates',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Create a map of existing rates
    const ratesMap = new Map(existingRates?.map(r => [r.wilaya_id, r]) || []);

    // Merge with wilayas data - use DB values if exist, otherwise use static defaults
    const mergedRates: ShippingRate[] = wilayas.map(w => {
      const existing = ratesMap.get(w.id);
      return {
        id: existing?.id,
        wilaya_id: w.id,
        wilaya_name: w.name,
        home_delivery_cost: existing?.home_delivery_cost ?? w.domicileEcommerce,
        stop_desk_cost: existing?.stop_desk_cost ?? w.stopDeskEcommerce,
        is_active: existing?.is_active ?? true,
      };
    }).sort((a, b) => a.wilaya_id - b.wilaya_id);

    setRates(mergedRates);
    setIsLoading(false);
  };

  const handleRateChange = (wilayaId: number, field: 'home_delivery_cost' | 'stop_desk_cost' | 'is_active', value: number | boolean) => {
    setRates(prev => prev.map(r => 
      r.wilaya_id === wilayaId ? { ...r, [field]: value } : r
    ));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!isAdmin) return;
    
    setIsSaving(true);

    try {
      // Upsert all rates
      for (const rate of rates) {
        const rateData = {
          wilaya_id: rate.wilaya_id,
          wilaya_name: rate.wilaya_name,
          home_delivery_cost: rate.home_delivery_cost,
          stop_desk_cost: rate.stop_desk_cost,
          is_active: rate.is_active,
        };

        if (rate.id) {
          // Update existing
          const { error } = await supabase
            .from('shipping_rates')
            .update(rateData)
            .eq('id', rate.id);
          
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('shipping_rates')
            .insert([rateData]);
          
          if (error) throw error;
        }
      }

      toast({ title: 'Shipping rates saved successfully' });
      setHasChanges(false);
      fetchRates(); // Refresh to get IDs
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error saving rates',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRates = rates.filter(r =>
    r.wilaya_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.wilaya_id.toString().includes(searchQuery)
  );

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-foreground" />
                <span className="text-base font-semibold text-foreground">Shipping rates</span>
              </div>
            </div>
            {isAdmin && (
              <Button 
                onClick={handleSaveAll} 
                disabled={!hasChanges || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">You need admin privileges to manage shipping rates.</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search wilayas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Rates Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Wilaya</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Home Delivery (DZD)</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Stop Desk (DZD)</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRates.map((rate) => (
                  <tr key={rate.wilaya_id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <span className="text-muted-foreground mr-2">{rate.wilaya_id.toString().padStart(2, '0')}</span>
                      <span className="font-medium text-foreground">{rate.wilaya_name}</span>
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={rate.home_delivery_cost}
                        onChange={(e) => handleRateChange(rate.wilaya_id, 'home_delivery_cost', Number(e.target.value))}
                        className="w-28 h-8 text-sm"
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={rate.stop_desk_cost}
                        onChange={(e) => handleRateChange(rate.wilaya_id, 'stop_desk_cost', Number(e.target.value))}
                        className="w-28 h-8 text-sm"
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={rate.is_active}
                        onCheckedChange={(checked) => handleRateChange(rate.wilaya_id, 'is_active', checked)}
                        disabled={!isAdmin}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-full shadow-lg text-sm font-medium">
            Unsaved changes
          </div>
        )}
      </main>
    </div>
  );
}
