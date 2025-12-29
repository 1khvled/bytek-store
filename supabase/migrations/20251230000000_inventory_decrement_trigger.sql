-- ============================================
-- INVENTORY AUTO-DECREMENT TRIGGER
-- ============================================
-- Automatically decrements product inventory when order status changes to 'confirmed'
-- Also handles direct INSERT with confirmed status
-- ============================================

-- Function to decrement inventory on order confirmation
CREATE OR REPLACE FUNCTION public.decrement_inventory_on_order_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_item JSONB;
  product_id UUID;
  item_quantity INTEGER;
  item_size TEXT;
  item_color TEXT;
  current_stock JSONB;
  size_stock JSONB;
  new_quantity INTEGER;
  total_stock INTEGER;
  size_key TEXT;
  color_key TEXT;
  color_value JSONB;
BEGIN
  -- Only process if status is 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Loop through each item in the order
    FOR order_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      product_id := (order_item->>'id')::UUID;
      item_quantity := (order_item->>'quantity')::INTEGER;
      item_size := COALESCE(order_item->>'size', 'One Size');
      item_color := COALESCE(order_item->>'color', 'Default');
      
      -- Get current stock for the product
      SELECT stock INTO current_stock
      FROM public.products
      WHERE id = product_id;
      
      -- If stock exists and is a JSONB object
      IF current_stock IS NOT NULL AND jsonb_typeof(current_stock) = 'object' THEN
        -- Get stock for the specific size
        size_stock := current_stock->item_size;
        
        -- If size stock exists
        IF size_stock IS NOT NULL AND jsonb_typeof(size_stock) = 'object' THEN
          -- Get current quantity for the color
          new_quantity := COALESCE((size_stock->item_color)::INTEGER, 0);
          
          -- Decrement the quantity
          new_quantity := GREATEST(0, new_quantity - item_quantity);
          
          -- Update the stock JSONB structure
          current_stock := jsonb_set(
            current_stock,
            ARRAY[item_size, item_color],
            to_jsonb(new_quantity),
            true
          );
          
          -- Calculate total stock across all sizes and colors
          total_stock := 0;
          FOR size_key, size_stock IN SELECT * FROM jsonb_each(current_stock)
          LOOP
            IF jsonb_typeof(size_stock) = 'object' THEN
              FOR color_key, color_value IN SELECT * FROM jsonb_each(size_stock)
              LOOP
                IF jsonb_typeof(color_value) = 'number' THEN
                  total_stock := total_stock + (color_value::TEXT::INTEGER);
                END IF;
              END LOOP;
            END IF;
          END LOOP;
          
          -- Update the product stock
          UPDATE public.products
          SET 
            stock = current_stock,
            in_stock = (total_stock > 0),
            updated_at = now()
          WHERE id = product_id;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS decrement_inventory_on_order_update ON public.orders;
DROP TRIGGER IF EXISTS decrement_inventory_on_order_insert ON public.orders;

-- Create trigger for UPDATE operations
CREATE TRIGGER decrement_inventory_on_order_update
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION public.decrement_inventory_on_order_confirm();

-- Create trigger for INSERT operations (handles direct INSERT with confirmed status)
CREATE TRIGGER decrement_inventory_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION public.decrement_inventory_on_order_confirm();

