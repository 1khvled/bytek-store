# Edge Function Setup: Admin Order Notifications

## Files Created/Modified

### 1. `supabase/functions/notify-admin-order/index.ts` (NEW)
**Purpose:** Supabase Edge Function that sends email notifications to admin when orders are created.

**Key Features:**
- Receives order data via HTTP POST
- Fetches admin email from database (if not set in env)
- Sends email using Resend API
- API keys stored in Supabase secrets (not exposed to frontend)
- Error handling that doesn't break order creation

**Environment Variables Required:**
- `RESEND_API_KEY`: Resend API key for sending emails
- `ADMIN_EMAIL`: Admin email address (optional, will query DB if not set)
- `SUPABASE_URL`: Auto-configured by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Auto-configured by Supabase
- `APP_URL`: Your app URL for email links (optional)

### 2. `supabase/migrations/20251230000001_notify_admin_on_order.sql` (NEW)
**Purpose:** Database trigger that calls the edge function when a new order is inserted.

**What it does:**
- Enables `pg_net` extension for HTTP requests
- Creates `notify_admin_new_order()` function
- Creates trigger on `orders` table INSERT
- Calls edge function asynchronously (doesn't block order creation)
- Handles errors gracefully (won't fail order insertion)

**How it works:**
1. New order inserted into `orders` table
2. Trigger fires `notify_admin_new_order()` function
3. Function makes HTTP POST to edge function URL
4. Edge function sends email to admin
5. Order creation continues regardless of email success/failure

### 3. `supabase/functions/notify-admin-order/README.md` (NEW)
**Purpose:** Documentation for setting up and deploying the edge function.

## Setup Steps

### Step 1: Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref ysmooabkfrnuawdqpvxt

# Deploy function
supabase functions deploy notify-admin-order
```

### Step 2: Set Secrets in Supabase Dashboard

Go to: **Supabase Dashboard → Edge Functions → notify-admin-order → Settings → Secrets**

Add these secrets:
- `RESEND_API_KEY`: Your Resend API key (get from resend.com)
- `ADMIN_EMAIL`: Admin email address (optional)
- `APP_URL`: Your app URL (optional, for email links)

### Step 3: Run Database Migration

Run in **Supabase SQL Editor**:
- File: `supabase/migrations/20251230000001_notify_admin_on_order.sql`

### Step 4: (Optional) Set Database Settings

For better reliability, set service role key:

```sql
-- Get service role key from: Dashboard → Settings → API → service_role key
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
```

**Note:** The trigger will work without this if the edge function handles authentication properly.

## Security

- ✅ **Email API keys**: Stored in Supabase secrets, never exposed to frontend
- ✅ **Service role key**: Stored in database settings or edge function secrets
- ✅ **No frontend exposure**: All email logic is server-side
- ✅ **Error handling**: Email failures don't break order creation

## How It Works

1. **Customer places order** → Order inserted into `orders` table
2. **Database trigger fires** → `notify_admin_new_order()` function called
3. **HTTP request made** → Trigger calls edge function via `pg_net`
4. **Edge function executes** → Fetches admin email, sends email via Resend
5. **Admin receives email** → Notification with order details

## Testing

After setup, test by creating a new order. Check:
- Supabase Dashboard → Edge Functions → notify-admin-order → Logs
- Your admin email inbox
- Resend dashboard for email delivery status

## Troubleshooting

- **No emails**: Check Resend API key is set correctly
- **Function errors**: Check edge function logs in Supabase Dashboard
- **Trigger not firing**: Verify migration was run successfully
- **HTTP errors**: Check database settings for service role key

