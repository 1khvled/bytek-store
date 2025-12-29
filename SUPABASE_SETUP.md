# Supabase Database Setup Guide

## Quick Setup Instructions

### Step 1: Run the SQL Script

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ysmooabkfrnuawdqpvxt`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase/setup.sql` from this project
6. Copy the entire contents and paste it into the SQL Editor
7. Click **Run** (or press `Ctrl+Enter`)

This will create all the necessary tables, functions, triggers, and security policies.

### Step 2: Create Your First Admin User

After running the SQL script:

1. **Sign up through your app** - Create a user account through the app's signup/login page
2. **Get the user ID** - Go to Supabase Dashboard > Authentication > Users, find your user, and copy the UUID
3. **Assign admin role** - Run this SQL in the SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<paste-your-user-uuid-here>', 'admin');
```

Replace `<paste-your-user-uuid-here>` with your actual user UUID.

## Database Tables Created

Your Supabase database will have these tables:

### 1. **profiles**
- Stores user profile information
- Linked to Supabase Auth users
- Auto-created when a user signs up

### 2. **user_roles**
- Manages user roles (admin/user)
- Used for access control

### 3. **products**
- Product catalog
- Fields: name, price, images, category, stock, etc.

### 4. **orders**
- Customer orders
- Fields: customer info, items, shipping, payment status, etc.
- Auto-generates order numbers

### 5. **shipping_rates**
- Shipping costs per wilaya (region)
- Supports home delivery and stop desk options

## Storage Bucket

A storage bucket named `products` is created for storing product images. It's configured to be publicly accessible for viewing.

## Security (RLS Policies)

Row Level Security (RLS) is enabled on all tables with these rules:

- **Products**: Anyone can view, only admins can modify
- **Orders**: Anyone can create orders, only admins can view/update
- **Shipping Rates**: Anyone can view, only admins can modify
- **Profiles**: Users can view/update their own, admins can view all
- **User Roles**: Users can view their own roles, admins can view all

## Testing Your Setup

After setup, you can test by:

1. **Adding a product** (as admin):
   - Go to Admin Dashboard
   - Add a test product

2. **Creating an order**:
   - Add items to cart
   - Complete checkout

3. **Viewing orders** (as admin):
   - Go to Admin Dashboard > Orders
   - You should see the order you created

## Troubleshooting

### If you get permission errors:
- Make sure you've assigned yourself the admin role
- Check that RLS policies are created correctly

### If tables don't appear:
- Refresh the Supabase dashboard
- Check the SQL Editor for any error messages

### If storage bucket errors:
- Go to Storage in Supabase dashboard
- Verify the `products` bucket exists
- Check bucket policies

## Need Help?

If you encounter issues:
1. Check the SQL Editor for error messages
2. Verify your environment variables in `.env` are correct
3. Make sure you're using the correct Supabase project

