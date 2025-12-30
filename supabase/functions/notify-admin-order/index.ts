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
  // CORS headers to allow calls from anywhere (including database triggers)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Log incoming request for debugging
    console.log("=== EDGE FUNCTION CALLED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    // Only allow POST requests
    if (req.method !== "POST") {
      console.warn("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Allow requests from database triggers (no auth required)
    // Get the order data from the request body
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body).substring(0, 200));
    
    const { order } = body;

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order data is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const orderData: OrderData = order;

    // If no Resend API key, log and return (don't fail)
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set. Email notification skipped.");
      console.log("Available env vars:", Object.keys(Deno.env.toObject()).filter(k => k.includes("RESEND") || k.includes("ADMIN")));
      return new Response(
        JSON.stringify({ message: "Email notification skipped (no API key)" }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    console.log("RESEND_API_KEY found, ADMIN_EMAIL:", ADMIN_EMAIL);

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

    // Format order items for HTML email
    const itemsHtml = orderData.items
      .map((item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name || 'Product'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price || 0).toLocaleString()} DZD</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${((item.price || 0) * (item.quantity || 1)).toLocaleString()} DZD</td>
        </tr>
      `)
      .join("");

    const totalItems = orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const appUrl = Deno.env.get("APP_URL") || "https://bytek-store.vercel.app";
    const orderDate = new Date(orderData.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Prepare beautiful HTML email
    const emailSubject = `🛒 New Order: ${orderData.order_number}`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🛒 New Order Received!</h1>
            </td>
          </tr>
          
          <!-- Order Number Badge -->
          <tr>
            <td style="padding: 20px 30px 10px; text-align: center;">
              <div style="display: inline-block; background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 12px 24px;">
                <span style="color: #0369a1; font-size: 18px; font-weight: 700;">Order #${orderData.order_number}</span>
              </div>
            </td>
          </tr>
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Name:</strong></td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">${orderData.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Phone:</strong></td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">
                    <a href="tel:${orderData.customer_phone}" style="color: #0ea5e9; text-decoration: none;">${orderData.customer_phone}</a>
                  </td>
                </tr>
                ${orderData.customer_email ? `
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Email:</strong></td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">
                    <a href="mailto:${orderData.customer_email}" style="color: #0ea5e9; text-decoration: none;">${orderData.customer_email}</a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Address:</strong></td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">${orderData.customer_address}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Wilaya:</strong></td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">${orderData.wilaya_name}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items (${totalItems})</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          
          <!-- Total -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px 0; text-align: right;">
                    <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px;">
                      <div style="font-size: 16px; color: #0369a1; margin-bottom: 8px;">Total Amount</div>
                      <div style="font-size: 32px; font-weight: 700; color: #0ea5e9;">${orderData.total.toLocaleString()} DZD</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Order placed:</strong> ${orderDate}
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${appUrl}/admin/orders" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 10px;">View Order in Dashboard →</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Text -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">This is an automated notification from BytekStore</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    
    // Plain text fallback
    const emailText = `
New Order Received!

Order Number: ${orderData.order_number}
Customer: ${orderData.customer_name}
Phone: ${orderData.customer_phone}
${orderData.customer_email ? `Email: ${orderData.customer_email}` : ''}
Address: ${orderData.customer_address}
Wilaya: ${orderData.wilaya_name}

Order Items:
${orderData.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${(item.price * item.quantity).toLocaleString()} DZD`).join('\n')}

Total: ${orderData.total.toLocaleString()} DZD
Order placed: ${orderDate}

View order: ${appUrl}/admin/orders
    `.trim();

    // Send email using Resend API
    console.log("Sending email to:", adminEmail);
    console.log("Email subject:", emailSubject);
    
    const emailPayload = {
      from: "BytekStore <onboarding@resend.dev>", // Use Resend's default domain for testing
      to: [adminEmail],
      subject: emailSubject,
      html: emailHtml,
      text: emailText, // Plain text fallback for email clients that don't support HTML
    };
    
    console.log("Email payload:", JSON.stringify(emailPayload).substring(0, 300));
    
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const responseText = await resendResponse.text();
    console.log("Resend API response status:", resendResponse.status);
    console.log("Resend API response:", responseText);

    if (!resendResponse.ok) {
      console.error("Failed to send email. Status:", resendResponse.status, "Response:", responseText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email notification",
          details: responseText,
          status: resendResponse.status
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const resendData = JSON.parse(responseText);
    console.log("Email sent successfully! Resend response:", resendData);

    const successResponse = {
      message: "Email notification sent successfully",
      sentTo: adminEmail,
      orderNumber: orderData.order_number
    };
    
    console.log("✅ SUCCESS:", successResponse);
    
    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("❌ ERROR in notify-admin-order function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});

