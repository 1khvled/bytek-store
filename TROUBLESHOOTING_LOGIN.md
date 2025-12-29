# Troubleshooting Login Issues

## Common Issues and Solutions

### Issue 1: "Wrong Password" Error

**Possible Causes:**
1. Email confirmation required (Supabase default)
2. Password typed incorrectly
3. User created in Supabase Dashboard without proper password setup

### Solution 1: Check Email Confirmation

Supabase requires email confirmation by default. Check:

1. **Go to Supabase Dashboard** → Authentication → Users
2. Find your user email
3. Check the **Email Confirmed** column
4. If it shows `false`, you need to confirm your email

**To confirm email:**
- Check your email inbox for a confirmation link from Supabase
- Click the confirmation link
- Then try logging in again

**OR disable email confirmation (for development):**

1. Go to Supabase Dashboard → Authentication → Settings
2. Under **Email Auth**, find **Enable email confirmations**
3. Toggle it OFF (for development/testing)
4. Save changes

### Solution 2: Reset Password

If you forgot your password or it's not working:

1. **Use Supabase Dashboard:**
   - Go to Authentication → Users
   - Find your user
   - Click the three dots (⋯) → **Reset Password**
   - Check your email for reset link

2. **Or use SQL to reset (if you have access):**
   ```sql
   -- This will send a password reset email
   -- The user will receive an email with a reset link
   ```

### Solution 3: Create New User Through App

1. Go to your app's admin login page
2. Click "Don't have an account? Sign up"
3. Enter your email and password
4. Check your email for confirmation (if enabled)
5. Log in with the credentials you just created

### Solution 4: Check User Status in Supabase

Run this SQL to check your user status:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

**What to look for:**
- `email_confirmed_at` should NOT be NULL (if email confirmation is enabled)
- `confirmed_at` should NOT be NULL

### Solution 5: Disable Email Confirmation (Development Only)

For development, you can disable email confirmation:

1. Supabase Dashboard → Authentication → Settings
2. Scroll to **Email Auth**
3. Toggle OFF **Enable email confirmations**
4. Click **Save**

**⚠️ Warning:** Only disable this for development. Re-enable it for production.

### Solution 6: Manually Confirm Email (SQL)

If you have database access, you can manually confirm the email:

```sql
-- Replace 'your-email@example.com' with your email
UPDATE auth.users
SET 
  email_confirmed_at = now(),
  confirmed_at = now()
WHERE email = 'your-email@example.com';
```

## Quick Fix Checklist

- [ ] Check if email confirmation is required
- [ ] Check your email inbox for confirmation link
- [ ] Verify password is correct (try showing password)
- [ ] Check user exists in Supabase Dashboard → Authentication → Users
- [ ] Verify email is spelled correctly (case-sensitive)
- [ ] Try resetting password
- [ ] Try creating a new account
- [ ] Check browser console for errors

## Still Having Issues?

1. Check the browser console (F12) for error messages
2. Check Supabase Dashboard → Logs for authentication errors
3. Verify your `.env` file has correct Supabase credentials
4. Make sure you're using the correct email (the one you signed up with)

