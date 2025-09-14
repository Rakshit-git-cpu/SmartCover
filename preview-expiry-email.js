// Script to preview the expiry email content without sending
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

async function previewExpiryEmail() {
  try {
    console.log('📧 Warranty Expiry Email Preview');
    console.log('================================\n');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Using sample user data...');
    }

    const userName = user?.user_metadata?.full_name || 'Test User';
    const userEmail = user?.email || 'user@example.com';

    // Sample expiring products
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro 128GB',
        serial_number: 'ABC123DEF456',
        warranty_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        days_until_expiry: 5
      },
      {
        name: 'MacBook Pro',
        brand: 'Apple',
        model: 'MacBook Pro 14" M3',
        serial_number: 'XYZ789GHI012',
        warranty_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        days_until_expiry: 15
      },
      {
        name: 'Samsung Galaxy S24',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra 256GB',
        serial_number: 'SAMSUNG123456',
        warranty_expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        days_until_expiry: 25
      }
    ];

    // Generate email content
    const emailContent = {
      to: userEmail,
      subject: `⚠️ Warranty Expiry Alert - ${sampleProducts.length} Product(s) Expiring Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F59E0B, #DC2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Warranty Expiry Alert</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
            <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
            <p style="color: #333; font-size: 16px;">
              We wanted to remind you that <strong>${sampleProducts.length} product(s)</strong> in your warranty portfolio will expire soon.
            </p>
            
            ${sampleProducts.map(product => `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">${product.brand} ${product.model}</h3>
                <p style="color: #92400e; margin: 5px 0;"><strong>Product:</strong> ${product.name}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Serial Number:</strong> ${product.serial_number}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${product.warranty_expires_at.toLocaleDateString()}</p>
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
              <a href="http://localhost:5173/dashboard" style="background: linear-gradient(135deg, #FACC15, #F59E0B); color: black; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
                View All Products
              </a>
              <a href="http://localhost:5173/claims" style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
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

    // Display email details
    console.log('📧 Email Details:');
    console.log('================');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('\n📱 Products in Email:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.brand} ${product.model} - ${product.days_until_expiry} days until expiry`);
    });

    console.log('\n📄 HTML Content:');
    console.log('================');
    console.log(emailContent.html);

    console.log('\n🎯 Email Preview Complete!');
    console.log('This is what users will receive when their warranties are about to expire.');

  } catch (error) {
    console.error('❌ Error generating email preview:', error.message);
  }
}

previewExpiryEmail();