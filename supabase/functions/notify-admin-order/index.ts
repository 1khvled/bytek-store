// Supabase Edge Function: Notify Admin on New Order
// This function sends an email notification to the admin when a new order is created
// Email API keys are stored in Supabase secrets, not exposed to frontend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@bytekstore.com";

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  wilaya_name: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify request is from Supabase (optional security check)
    // In production, you might want to verify the Authorization header
    // For now, we'll allow requests from database triggers

    // Get the order data from the request body
    const { order } = await req.json();

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const orderData: OrderData = order;

    // If no Resend API key, log and return (don't fail)
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set. Email notification skipped.");
      return new Response(
        JSON.stringify({ message: "Email notification skipped (no API key)" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get admin email from database if not set in env
    let adminEmail = ADMIN_EMAIL;
    if (ADMIN_EMAIL === "admin@bytekstore.com") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin")
          .limit(1)
          .single();
        
        if (adminRole) {
          const { data: adminUser } = await supabase.auth.admin.getUserById(adminRole.user_id);
          if (adminUser?.user?.email) {
            adminEmail = adminUser.user.email;
          }
        }
      }
    }

    // Format order items for email
    const itemsList = orderData.items
      .map((item) => `- ${item.name} (Qty: ${item.quantity}) - ${item.price.toLocaleString()} DZD`)
      .join("\n");

    const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

    // Prepare email content
    const emailSubject = `New Order: ${orderData.order_number}`;
    const emailBody = `
New Order Received!

Order Details:
- Order Number: ${orderData.order_number}
- Customer Name: ${orderData.customer_name}
- Phone: ${orderData.customer_phone}
${orderData.customer_email ? `- Email: ${orderData.customer_email}` : ""}
- Address: ${orderData.customer_address}
- Wilaya: ${orderData.wilaya_name}
- Total Items: ${totalItems}
- Total Amount: ${orderData.total.toLocaleString()} DZD

Order Items:
${itemsList}

Order placed at: ${new Date(orderData.created_at).toLocaleString()}

View order in admin dashboard: ${Deno.env.get("APP_URL") || ""}/admin/orders
    `.trim();

    // Send email using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BytekStore <noreply@bytekstore.com>",
        to: [adminEmail],
        subject: emailSubject,
        text: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Failed to send email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email notification" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Email notification sent successfully",
        sentTo: adminEmail 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-admin-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

