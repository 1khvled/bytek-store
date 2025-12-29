-- ============================================
-- SETUP ADMIN BY SPECIFIC UUID
-- ============================================
-- Use this if you know the exact UUID
-- Replace 'YOUR_UUID_HERE' with the actual UUID
-- ============================================

DO $$
DECLARE
  admin_user_id UUID := 'YOUR_UUID_HERE';  -- Replace with your UUID
  admin_email TEXT;
BEGIN
  -- Get email from auth.users
  SELECT email INTO admin_email
  FROM auth.users
  WHERE id = admin_user_id;
  
  IF admin_email IS NULL THEN
    RAISE EXCEPTION 'User with UUID % not found in auth.users', admin_user_id;
  END IF;
  
  RAISE NOTICE 'Setting up admin for user: % (email: %)', admin_user_id, admin_email;
  
  -- Delete all existing profiles
  DELETE FROM public.profiles;
  
  -- Insert admin profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    admin_user_id,
    admin_email,
    'Admin User',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, 'Admin User'),
    updated_at = now();
  
  -- Ensure admin role exists
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (admin_user_id, 'admin', now())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin setup complete!';
END $$;

-- Verify
SELECT 
  p.id,
  p.email,
  p.full_name,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.id = 'YOUR_UUID_HERE';  -- Replace with your UUID

