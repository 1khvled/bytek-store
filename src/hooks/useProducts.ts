import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'> & {
  stock: Record<string, Record<string, number>>;
};

// Transform database product to match our interface
const transformProduct = (dbProduct: Tables<'products'>): Product => ({
  ...dbProduct,
  stock: (dbProduct.stock as Record<string, Record<string, number>>) || {},
});

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(12);

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformProduct(data) : null;
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
  });
};

// Categories list
export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'mice', name: 'Mice' },
  { id: 'keyboards', name: 'Keyboards' },
  { id: 'mousepads', name: 'Mousepads' },
  { id: 'headsets', name: 'Headsets' },
  { id: 'ssds', name: 'SSDs' },
  { id: 'cpu', name: 'CPU' },
];
