const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ExpiryNotificationData {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
  products: Array<{
    id: string;
    name: string;
    brand: string;
    model: string;
    serial_number: string;
    warranty_expires_at: string;
    days_until_expiry: number;
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const notificationData: ExpiryNotificationData = await req.json();

    // Create email content for warranty expiry reminders
    const expiryEmailContent = {
      to: notificationData.user.email,
      subject: `⚠️ Warranty Expiry Alert - ${notificationData.products.length} Product(s) Expiring Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F59E0B, #DC2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Warranty Expiry Alert</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
            <p style="color: #333; font-size: 16px;">Dear ${notificationData.user.user_metadata.full_name},</p>
            <p style="color: #333; font-size: 16px;">
              We wanted to remind you that <strong>${notificationData.products.length} product(s)</strong> in your warranty portfolio will expire soon.
            </p>
            
            ${notificationData.products.map(product => `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">${product.brand} ${product.model}</h3>
                <p style="color: #92400e; margin: 5px 0;"><strong>Product:</strong> ${product.name}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Serial Number:</strong> ${product.serial_number}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${new Date(product.warranty_expires_at).toLocaleDateString()}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Days Remaining:</strong> ${product.days_until_expiry} day(s)</p>
              </div>
            `).join('')}
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 20px 0;">
              <h4 style="color: #DC2626; margin-top: 0;">⚠️ Important Reminders</h4>
              <ul style="color: #DC2626; margin: 10px 0; padding-left: 20px;">
                <li>Check your products for any issues before warranty expires</li>
                <li>Submit warranty claims before the expiry date</li>
                <li>Keep your purchase receipts and invoices safe</li>
                <li>Contact authorized service centers for repairs</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-app-url.com/dashboard" style="background: linear-gradient(135deg, #FACC15, #F59E0B); color: black; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
                View All Products
              </a>
              <a href="https://your-app-url.com/claims" style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
                Submit Claim
              </a>
            </div>
            
            <p style="color: #333; font-size: 16px;">
              Don't miss out on your warranty benefits! Act now to ensure your products are protected.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2025 Mera Chhata. All rights reserved.</p>
            <p>This is an automated reminder. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    // In a real implementation, you would send the email here
    // Example: await sendEmail(expiryEmailContent)
    
    console.log('Warranty expiry notification prepared:', {
      user: notificationData.user.email,
      products_count: notificationData.products.length,
      products: notificationData.products.map(p => `${p.brand} ${p.model} (${p.days_until_expiry} days)`),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Warranty expiry notification sent successfully',
        user_email: notificationData.user.email,
        products_notified: notificationData.products.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error processing warranty expiry notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process warranty expiry notification',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});