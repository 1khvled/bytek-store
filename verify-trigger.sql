-- ============================================
-- VERIFY TRIGGER SETUP
-- ============================================
-- Run this to check if everything is set up correctly
-- ============================================

-- 1. Check if trigger exists and is enabled
SELECT 
    'Trigger Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE tgenabled
        WHEN 'O' THEN '✅ ENABLED'
        WHEN 'D' THEN '❌ DISABLED'
        ELSE '⚠️ UNKNOWN'
    END as enabled_status
FROM pg_trigger 
WHERE tgname = 'notify_admin_on_new_order'
GROUP BY tgname, tgrelid, tgenabled;

-- 2. Check if function exists
SELECT 
    'Function Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    proname as function_name
FROM pg_proc 
WHERE proname = 'notify_admin_new_order'
GROUP BY proname;

-- 3. Check if pg_net extension is enabled
SELECT 
    'Extension Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ENABLED'
        ELSE '❌ MISSING'
    END as status,
    extname as extension_name
FROM pg_extension 
WHERE extname = 'pg_net'
GROUP BY extname;

-- 4. Test insert (this will trigger the email if everything works)
-- Uncomment to test:
/*
INSERT INTO public.orders (
    customer_name,
    customer_phone,
    customer_email,
    customer_address,
    wilaya_id,
    wilaya_name,
    shipping_type,
    shipping_cost,
    subtotal,
    total,
    items,
    status,
    payment_method,
    payment_status
) VALUES (
    'SQL Test User',
    '123456789',
    'test@test.com',
    'Test Address',
    1,
    'Algiers',
    'homeDelivery',
    500,
    1000,
    1500,
    '[{"name": "Test Product", "quantity": 1, "price": 1000, "id": "test-id", "image": "", "size": "M", "color": "Blue", "subtotal": 1000}]'::jsonb,
    'pending',
    'cod',
    'pending'
) RETURNING id, order_number, created_at;
*/

