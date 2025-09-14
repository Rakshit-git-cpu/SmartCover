// Script to send a sample expiry email notification
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
let supabaseUrl, supabaseAnonKey;
try {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendSampleExpiryEmail() {
  try {
    console.log('📧 Sending sample expiry email notification...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Please log in first to send test email');
      return;
    }

    console.log('User:', user.email);

    // Create sample expiring products data
    const sampleExpiryData = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.user_metadata?.full_name || 'Test User'
        }
      },
      products: [
        {
          id: 'sample-1',
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          model: 'iPhone 15 Pro 128GB',
          serial_number: 'SAMPLE-001',
          warranty_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          days_until_expiry: 5
        },
        {
          id: 'sample-2',
          name: 'MacBook Pro',
          brand: 'Apple',
          model: 'MacBook Pro 14" M3',
          serial_number: 'SAMPLE-002',
          warranty_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          days_until_expiry: 15
        },
        {
          id: 'sample-3',
          name: 'Samsung Galaxy S24',
          brand: 'Samsung',
          model: 'Galaxy S24 Ultra 256GB',
          serial_number: 'SAMPLE-003',
          warranty_expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
          days_until_expiry: 25
        }
      ]
    };

    console.log('Sample data prepared:');
    console.log('- User:', sampleExpiryData.user.email);
    console.log('- Products:', sampleExpiryData.products.length);
    sampleExpiryData.products.forEach(product => {
      console.log(`  • ${product.brand} ${product.model} - ${product.days_until_expiry} days`);
    });

    // Call the warranty expiry notification function
    console.log('\n📤 Sending notification to Edge Function...');
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/warranty-expiry-notification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleExpiryData),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Sample expiry email sent successfully!');
      console.log('Response:', result);
      
      // Also create an in-app notification
      console.log('\n📱 Creating in-app notification...');
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Sample Warranty Expiry Alert',
          message: `${sampleExpiryData.products.length} product(s) will expire soon. This is a test notification.`,
          type: 'warning',
          read: false,
        });

      if (notificationError) {
        console.error('Error creating in-app notification:', notificationError);
      } else {
        console.log('✅ In-app notification created!');
      }

      console.log('\n🎯 Test Results:');
      console.log('1. Email notification sent to Edge Function');
      console.log('2. In-app notification created');
      console.log('3. Check your dashboard for the notification');
      console.log('4. Check Supabase Edge Function logs for email content');

    } else {
      console.error('❌ Failed to send sample email:', result);
      console.log('This might be because:');
      console.log('- Edge Function is not deployed');
      console.log('- Supabase credentials are incorrect');
      console.log('- Network connection issue');
    }

  } catch (error) {
    console.error('❌ Error sending sample email:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you are logged in to the app');
    console.log('2. Check your Supabase credentials in .env file');
    console.log('3. Verify the Edge Function is deployed');
  }
}

// Also create a function to show the email content
async function showEmailContent() {
  console.log('\n📧 Sample Email Content Preview:');
  console.log('=====================================');
  
  const sampleEmail = {
    to: 'user@example.com',
    subject: '⚠️ Warranty Expiry Alert - 3 Product(s) Expiring Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #DC2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Warranty Expiry Alert</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
          <p style="color: #333; font-size: 16px;">Dear Test User,</p>
          <p style="color: #333; font-size: 16px;">
            We wanted to remind you that <strong>3 product(s)</strong> in your warranty portfolio will expire soon.
          </p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Apple iPhone 15 Pro</h3>
            <p style="color: #92400e; margin: 5px 0;"><strong>Product:</strong> iPhone 15 Pro</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Serial Number:</strong> SAMPLE-001</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Days Remaining:</strong> 5 day(s)</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Apple MacBook Pro</h3>
            <p style="color: #92400e; margin: 5px 0;"><strong>Product:</strong> MacBook Pro</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Serial Number:</strong> SAMPLE-002</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Days Remaining:</strong> 15 day(s)</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Samsung Galaxy S24</h3>
            <p style="color: #92400e; margin: 5px 0;"><strong>Product:</strong> Samsung Galaxy S24</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Serial Number:</strong> SAMPLE-003</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Days Remaining:</strong> 25 day(s)</p>
          </div>
          
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
    `
  };

  console.log('To:', sampleEmail.to);
  console.log('Subject:', sampleEmail.subject);
  console.log('\nHTML Content:');
  console.log(sampleEmail.html);
}

// Run the functions
sendSampleExpiryEmail().then(() => {
  showEmailContent();
});