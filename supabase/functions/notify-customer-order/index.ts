// Supabase Edge Function: Notify Customer on Order Confirmation
// This function sends an order confirmation email to the customer

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://bytek-store.vercel.app";

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
    size?: string;
    color?: string;
  }>;
  created_at: string;
  tracking_number?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== CUSTOMER ORDER CONFIRMATION EMAIL ===");
    
    if (req.method !== "POST") {
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

    const body = await req.json();
    const { order } = body;

    if (!order || !order.customer_email) {
      console.log("No customer email provided, skipping email");
      return new Response(
        JSON.stringify({ message: "No customer email, email skipped" }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const orderData: OrderData = order;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
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

    // Format order items for HTML email
    const itemsHtml = orderData.items
      .map((item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name || 'Product'}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price || 0).toLocaleString()} DZD</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${((item.price || 0) * (item.quantity || 1)).toLocaleString()} DZD</td>
        </tr>
      `)
      .join("");

    const totalItems = orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const orderDate = new Date(orderData.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Beautiful HTML email
    const emailSubject = `✅ Order Confirmation: ${orderData.order_number}`;
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
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Thank you for your order</p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 20px 30px 10px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 12px 24px;">
                <span style="color: #047857; font-size: 18px; font-weight: 700;">Order #${orderData.order_number}</span>
              </div>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Hi <strong>${orderData.customer_name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We've received your order and it's being processed. You'll receive another email when your order ships.
              </p>
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
                    <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px;">
                      <div style="font-size: 16px; color: #047857; margin-bottom: 8px;">Total Amount</div>
                      <div style="font-size: 32px; font-weight: 700; color: #10b981;">${orderData.total.toLocaleString()} DZD</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Shipping Information</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Address:</strong></td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">${orderData.customer_address}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4b5563; font-size: 15px;"><strong style="color: #1f2937;">Wilaya:</strong></td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 15px; text-align: right;">${orderData.wilaya_name}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Tracking -->
          ${orderData.tracking_number ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Track Your Order</p>
                <p style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 14px;">Tracking Number: <strong>${orderData.tracking_number}</strong></p>
                <a href="${APP_URL}/track?order=${orderData.order_number}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">Track Order →</a>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Order placed:</strong> ${orderDate}
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${APP_URL}/track?order=${orderData.order_number}" style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 10px;">Track Your Order →</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Text -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">This is an automated confirmation from BytekStore</p>
              <p style="margin: 5px 0 0 0;">If you have any questions, please contact us</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const emailText = `
Order Confirmation: ${orderData.order_number}

Hi ${orderData.customer_name},

We've received your order and it's being processed.

Order Items:
${orderData.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${(item.price * item.quantity).toLocaleString()} DZD`).join('\n')}

Total: ${orderData.total.toLocaleString()} DZD

Shipping Address: ${orderData.customer_address}, ${orderData.wilaya_name}

Order placed: ${orderDate}

Track your order: ${APP_URL}/track?order=${orderData.order_number}
    `.trim();

    console.log("Sending confirmation email to:", orderData.customer_email);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BytekStore <onboarding@resend.dev>",
        to: [orderData.customer_email],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    const responseText = await resendResponse.text();
    console.log("Resend API response status:", resendResponse.status);

    if (!resendResponse.ok) {
      console.error("Failed to send email:", responseText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email notification",
          details: responseText
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
    console.log("✅ Email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ 
        message: "Order confirmation email sent successfully",
        sentTo: orderData.customer_email
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("❌ Error in notify-customer-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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

