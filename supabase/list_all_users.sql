-- ============================================
-- LIST ALL USERS IN AUTH.USERS
-- ============================================
-- Run this to see all users and their UUIDs
-- ============================================

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
