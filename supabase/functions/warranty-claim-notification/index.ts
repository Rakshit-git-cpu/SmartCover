const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface WarrantyClaimData {
  product: {
    id: string;
    name: string;
    brand: string;
    model: string;
    serial_number: string;
    purchase_date: string;
  };
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
  problem: string;
  contact_phone: string;
  preferred_contact: string;
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
    const claimData: WarrantyClaimData = await req.json();

    // Here you would typically integrate with:
    // 1. Email service (SendGrid, Resend, etc.)
    // 2. SMS service (Twilio, etc.)
    // 3. Dealer/repair center notification system
    
    // For demo purposes, we'll simulate the notifications
    console.log('Warranty claim submitted:', {
      product: `${claimData.product.brand} ${claimData.product.model}`,
      customer: claimData.user.user_metadata.full_name,
      problem: claimData.problem,
      contact: claimData.contact_phone,
    });

    // Simulate email to dealer/repair center
    const dealerEmailContent = {
      to: 'dealer@example.com', // This would be dynamic based on product brand/location
      subject: `Warranty Claim: ${claimData.product.brand} ${claimData.product.model}`,
      html: `
        <h2>New Warranty Claim Submitted</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Product Details</h3>
          <p><strong>Product:</strong> ${claimData.product.name}</p>
          <p><strong>Brand:</strong> ${claimData.product.brand}</p>
          <p><strong>Model:</strong> ${claimData.product.model}</p>
          <p><strong>Serial Number:</strong> ${claimData.product.serial_number}</p>
          <p><strong>Purchase Date:</strong> ${new Date(claimData.product.purchase_date).toLocaleDateString()}</p>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${claimData.user.user_metadata.full_name}</p>
          <p><strong>Email:</strong> ${claimData.user.email}</p>
          <p><strong>Phone:</strong> ${claimData.contact_phone}</p>
          <p><strong>Preferred Contact:</strong> ${claimData.preferred_contact}</p>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Problem Description</h3>
          <p>${claimData.problem}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Please contact the customer within 24 hours to initiate the warranty claim process.
        </p>
      `,
    };

    // Simulate SMS to dealer
    const dealerSMSContent = `
      New warranty claim: ${claimData.product.brand} ${claimData.product.model}
      Customer: ${claimData.user.user_metadata.full_name}
      Phone: ${claimData.contact_phone}
      Issue: ${claimData.problem.substring(0, 100)}...
      Login to dealer portal for full details.
    `;

    // Simulate customer confirmation email
    const customerEmailContent = {
      to: claimData.user.email,
      subject: `Warranty Claim Submitted - ${claimData.product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FACC15, #F59E0B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: black; margin: 0; font-size: 28px;">Claim Submitted Successfully!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
            <p style="color: #333; font-size: 16px;">Dear ${claimData.user.user_metadata.full_name},</p>
            <p style="color: #333; font-size: 16px;">
              Your warranty claim for <strong>${claimData.product.name}</strong> has been successfully submitted to our authorized service center.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Claim Details</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Product:</strong> ${claimData.product.brand} ${claimData.product.model}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Serial:</strong> ${claimData.product.serial_number}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Issue:</strong> ${claimData.problem}</p>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #FACC15; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">What Happens Next?</h4>
              <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
                <li>Our service partner will contact you within 24 hours</li>
                <li>You'll receive updates via ${claimData.preferred_contact}</li>
                <li>Track your claim status in the Mera Chhata app</li>
              </ul>
            </div>
            <p style="color: #333; font-size: 16px;">
              Thank you for choosing Mera Chhata for your warranty protection needs.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://your-app-url.com" style="background: linear-gradient(135deg, #FACC15, #F59E0B); color: black; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                View Claim Status
              </a>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2025 Mera Chhata. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // In a real implementation, you would send these notifications here
    // Example integrations:
    // - await sendEmail(dealerEmailContent)
    // - await sendSMS(dealerSMSContent) 
    // - await sendEmail(customerEmailContent)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Warranty claim notifications sent successfully',
        notifications_sent: {
          dealer_email: true,
          dealer_sms: true,
          customer_email: true,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error processing warranty claim notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process warranty claim notification',
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