# Admin Order Notification Edge Function

## Overview
This Supabase Edge Function sends email notifications to the admin when a new order is created.

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ysmooabkfrnuawdqpvxt

# Deploy the function
supabase functions deploy notify-admin-order
```

### 2. Set Environment Variables (Secrets)

In Supabase Dashboard → Edge Functions → notify-admin-order → Settings → Secrets:

1. **RESEND_API_KEY** (required)
   - Get API key from [Resend.com](https://resend.com)
   - Sign up for free account
   - Create API key in dashboard
   - Add as secret: `RESEND_API_KEY`

2. **ADMIN_EMAIL** (optional)
   - Admin email address to receive notifications
   - If not set, function will query database for admin user email
   - Example: `admin@yourdomain.com`

3. **SUPABASE_URL** (optional, auto-set)
   - Your Supabase project URL
   - Usually auto-configured, but can be set manually

4. **SUPABASE_SERVICE_ROLE_KEY** (optional, auto-set)
   - Service role key for database access
   - Usually auto-configured, but can be set manually

5. **APP_URL** (optional)
   - Your application URL for links in emails
   - Example: `https://yourdomain.com`

### 3. Run the Database Migration

Run the migration file in Supabase SQL Editor:
- `supabase/migrations/20251230000001_notify_admin_on_order.sql`

This creates the database trigger that calls the edge function.

### 4. Configure Database Settings (Optional)

For better reliability, set these in Supabase SQL Editor:

```sql
-- Set Supabase URL (replace with your actual URL)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://ysmooabkfrnuawdqpvxt.supabase.co';

-- Set service role key (get from Supabase Dashboard → Settings → API)
-- Note: This is sensitive - consider using a different approach
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
```

**Security Note:** Storing service role key in database settings is not ideal. The trigger will work without it if the edge function has proper authentication.

## How It Works

1. **Order Created**: When a new order is inserted into `orders` table
2. **Trigger Fires**: `notify_admin_on_new_order()` function is called
3. **HTTP Request**: Trigger makes HTTP POST to edge function
4. **Edge Function**: Receives order data, fetches admin email, sends email via Resend
5. **Email Sent**: Admin receives notification email

## Email Service: Resend

This function uses [Resend](https://resend.com) for sending emails:
- Free tier: 3,000 emails/month
- Simple API
- Good deliverability

### Alternative Email Services

To use a different email service, modify `supabase/functions/notify-admin-order/index.ts`:
- **SendGrid**: Replace Resend API calls with SendGrid API
- **Mailgun**: Replace Resend API calls with Mailgun API
- **SMTP**: Use Deno's built-in SMTP support

## Testing

Test the function manually:

```bash
# Using Supabase CLI
supabase functions invoke notify-admin-order --body '{"order":{"order_number":"TEST-001","customer_name":"Test Customer","total":1000}}'

# Or via HTTP
curl -X POST https://ysmooabkfrnuawdqpvxt.supabase.co/functions/v1/notify-admin-order \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order":{"order_number":"TEST-001","customer_name":"Test Customer","total":1000}}'
```

## Troubleshooting

- **No emails received**: Check Resend API key is set correctly
- **Function errors**: Check Edge Function logs in Supabase Dashboard
- **Trigger not firing**: Verify migration was run successfully
- **HTTP errors**: Check database settings for Supabase URL

