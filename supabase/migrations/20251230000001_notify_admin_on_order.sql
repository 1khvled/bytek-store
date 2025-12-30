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
  anon_key TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Construct edge function URL
  edge_function_url := 'https://ysmooabkfrnuawdqpvxt.supabase.co/functions/v1/notify-admin-order';
  
  -- Anon key hardcoded (get from Supabase Dashboard → Settings → API)
  -- This is safe because anon key is meant to be public (used in frontend)
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbW9vYWJrZnJudWF3ZHFwdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjc5MTMsImV4cCI6MjA4MjYwMzkxM30.uMcWOV_wOXRpsfHxvVuzhU8D4H6VAlyfSHQ5YDNikBk';

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

  -- Call the edge function asynchronously using pg_net with anon key
  -- This doesn't block the order insertion
  -- Using anon key allows the function to be called (function is public and accepts anon key)
  BEGIN
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      )::text,
      body := payload::text,
      timeout_milliseconds := 30000
    ) INTO request_id;
    
    -- Log success (check Supabase logs for this)
    RAISE NOTICE 'Triggered admin notification for order % (request_id: %)', NEW.order_number, request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log detailed error
      RAISE WARNING 'Failed to call edge function for order %: %', NEW.order_number, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order insertion
    RAISE WARNING 'Failed to trigger admin notification for order %: %', NEW.order_number, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS notify_admin_on_new_order ON public.orders;

-- Create trigger on order insertion
CREATE TRIGGER notify_admin_on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_order();

