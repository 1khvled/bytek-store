import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Order {
  created_at: string;
  total: number;
  status: string;
}

interface RevenueChartProps {
  orders: Order[];
  isLoading?: boolean;
}

export function RevenueChart({ orders, isLoading }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      };
    });

    orders
      .filter(order => order.status !== 'cancelled')
      .forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        const dayData = last7Days.find(d => d.date === orderDate);
        if (dayData) {
          dayData.revenue += order.total;
          dayData.orders += 1;
        }
      });

    return last7Days;
  }, [orders]);

  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = chartData.reduce((sum, day) => sum + day.orders, 0);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Revenus - 7 derniers jours</h3>
            <div className="h-8 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="h-[200px] bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenus - 7 derniers jours</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()} DA</p>
            <span className="text-sm text-muted-foreground">• {totalOrders} commande{totalOrders > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Revenus']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
