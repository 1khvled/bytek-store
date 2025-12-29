-- Create shipping_rates table for managing shipping costs per wilaya
CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wilaya_id INTEGER NOT NULL UNIQUE,
  wilaya_name TEXT NOT NULL,
  home_delivery_cost NUMERIC NOT NULL DEFAULT 0,
  stop_desk_cost NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can view shipping rates (needed for checkout)
CREATE POLICY "Anyone can view shipping rates"
ON public.shipping_rates
FOR SELECT
USING (true);

-- Only admins can modify shipping rates
CREATE POLICY "Admins can insert shipping rates"
ON public.shipping_rates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update shipping rates"
ON public.shipping_rates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete shipping rates"
ON public.shipping_rates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_shipping_rates_updated_at
BEFORE UPDATE ON public.shipping_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();