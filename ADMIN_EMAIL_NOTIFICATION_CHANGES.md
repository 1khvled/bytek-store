# Admin Email Notification Implementation - File Changes

## Files Created

### 1. `supabase/functions/notify-admin-order/index.ts` (NEW FILE)
**Path:** `supabase/functions/notify-admin-order/index.ts`

**Purpose:** Supabase Edge Function that sends email notifications to admin when orders are created.

**What it does:**
- Receives HTTP POST requests with order data
- Extracts order information (customer details, items, total)
- Fetches admin email from database (if not set in environment)
- Sends email using Resend API
- Returns success/error response

**Key features:**
- Email API keys stored in Supabase secrets (not in code)
- No frontend exposure of sensitive keys
- Graceful error handling (doesn't break if email fails)
- Auto-detects admin email from database if not configured

**Environment variables used:**
- `RESEND_API_KEY`: Resend API key (stored in Supabase secrets)
- `ADMIN_EMAIL`: Admin email address (optional, queries DB if not set)
- `SUPABASE_URL`: Auto-configured by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Auto-configured by Supabase
- `APP_URL`: Application URL for email links (optional)

### 2. `supabase/migrations/20251230000001_notify_admin_on_order.sql` (NEW FILE)
**Path:** `supabase/migrations/20251230000001_notify_admin_on_order.sql`

**Purpose:** Database trigger that automatically calls the edge function when a new order is created.

**What it does:**
- Enables `pg_net` extension for HTTP requests
- Creates `notify_admin_new_order()` PostgreSQL function
- Creates trigger on `orders` table INSERT
- Calls edge function via HTTP POST with order data
- Handles errors gracefully (won't fail order creation)

**How it works:**
1. New order inserted into `orders` table
2. Trigger fires `notify_admin_new_order()` function
3. Function constructs HTTP POST request to edge function
4. Request includes order data as JSON payload
5. Edge function receives request and sends email
6. Order creation continues regardless of email success/failure

**Security:**
- Uses `SECURITY DEFINER` to allow HTTP requests
- Service role key stored in database settings (not in code)
- Falls back to anon key if service role key not set
- Can work without authentication if edge function is public

### 3. `supabase/functions/notify-admin-order/README.md` (NEW FILE)
**Path:** `supabase/functions/notify-admin-order/README.md`

**Purpose:** Documentation for deploying and configuring the edge function.

**Contents:**
- Deployment instructions
- Environment variable setup
- Testing procedures
- Troubleshooting guide

### 4. `EDGE_FUNCTION_SETUP.md` (NEW FILE)
**Path:** `EDGE_FUNCTION_SETUP.md`

**Purpose:** Complete setup guide for the admin email notification system.

**Contents:**
- Overview of all files
- Step-by-step setup instructions
- Security considerations
- Testing and troubleshooting

## Files Modified

**None.** All functionality is added via new files. No existing code was changed.

## Security Implementation

### Email API Keys
- **Location:** Stored in Supabase Edge Function secrets
- **Access:** Only accessible server-side in edge function
- **Frontend exposure:** None - frontend never sees API keys

### Service Role Key
- **Location:** Stored in database settings (optional)
- **Usage:** Used to authenticate HTTP requests from database to edge function
- **Alternative:** Edge function can be configured as public (less secure but simpler)

### Admin Email
- **Source:** Can be set in environment variable OR queried from database
- **Query method:** Uses service role key to query `user_roles` table for admin user
- **Fallback:** Defaults to `admin@bytekstore.com` if not configured

## How It Works

1. **Order Creation:** Customer places order → `orders` table INSERT
2. **Trigger Execution:** Database trigger `notify_admin_on_new_order` fires
3. **HTTP Request:** Trigger function makes POST to edge function URL
4. **Edge Function:** Receives order data, processes, sends email via Resend
5. **Email Delivery:** Admin receives notification email
6. **Order Continues:** Order creation completes regardless of email status

## Deployment Requirements

1. **Deploy Edge Function:**
   ```bash
   supabase functions deploy notify-admin-order
   ```

2. **Set Secrets in Supabase Dashboard:**
   - `RESEND_API_KEY`: Your Resend API key
   - `ADMIN_EMAIL`: Admin email (optional)
   - `APP_URL`: Your app URL (optional)

3. **Run Database Migration:**
   - Execute `supabase/migrations/20251230000001_notify_admin_on_order.sql` in SQL Editor

4. **Optional - Set Database Settings:**
   ```sql
   ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
   ```

## No Frontend Changes Required

- No changes to `src/pages/Checkout.tsx`
- No changes to any React components
- No API key exposure in frontend code
- All email logic is server-side

## Email Service: Resend

- **Provider:** Resend.com
- **Free tier:** 3,000 emails/month
- **API:** Simple REST API
- **Setup:** Sign up at resend.com, create API key, add to Supabase secrets

## Testing

After deployment:
1. Create a test order through the checkout page
2. Check Supabase Dashboard → Edge Functions → notify-admin-order → Logs
3. Check admin email inbox
4. Verify email contains correct order details

