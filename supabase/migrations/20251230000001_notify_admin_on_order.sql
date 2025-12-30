-- ============================================
-- ADMIN EMAIL NOTIFICATION ON NEW ORDER
-- ============================================
-- Triggers an email notification to admin when a new order is created
-- Uses Supabase Edge Function (notify-admin-order)
-- ============================================

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call the edge function when a new order is created
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Construct edge function URL
  -- Replace 'ysmooabkfrnuawdqpvxt' with your actual project ref if different
  edge_function_url := 'https://ysmooabkfrnuawdqpvxt.supabase.co/functions/v1/notify-admin-order';
  
  -- Get service role key from environment (set via Supabase Dashboard → Settings → API)
  -- This should be set as a database setting or use anon key for public functions
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If no service role key, use anon key (less secure but works for public functions)
  IF service_role_key IS NULL OR service_role_key = '' THEN
    -- You can set this via: ALTER DATABASE postgres SET app.settings.service_role_key = 'your-key';
    -- Or use anon key (function should handle auth internally)
    service_role_key := current_setting('app.settings.anon_key', true);
  END IF;

  -- Prepare payload with order data
  payload := jsonb_build_object(
    'order', jsonb_build_object(
      'id', NEW.id,
      'order_number', NEW.order_number,
      'customer_name', NEW.customer_name,
      'customer_phone', NEW.customer_phone,
      'customer_email', NEW.customer_email,
      'customer_address', NEW.customer_address,
      'wilaya_name', NEW.wilaya_name,
      'total', NEW.total,
      'items', NEW.items,
      'created_at', NEW.created_at
    )
  );

  -- Call the edge function asynchronously using pg_net
  -- This doesn't block the order insertion
  -- Note: Edge function should be configured to allow unauthenticated calls from database triggers
  -- Or use service role key if authentication is required
  IF service_role_key IS NOT NULL AND service_role_key != '' THEN
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      )::text,
      body := payload::text
    ) INTO request_id;
  ELSE
    -- Call without auth header (function should handle this or be configured as public)
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      )::text,
      body := payload::text
    ) INTO request_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order insertion
    RAISE WARNING 'Failed to trigger admin notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on order insertion
CREATE TRIGGER notify_admin_on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_order();

