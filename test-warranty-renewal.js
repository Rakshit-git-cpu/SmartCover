// Test script for warranty renewal functionality
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

async function testWarrantyRenewal() {
  try {
    console.log('🔄 Testing Warranty Renewal System...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Please log in first to test warranty renewal');
      return;
    }

    console.log('User:', user.email);

    // Get user's products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    if (productsError) {
      console.error('Error fetching products:', productsError.message);
      return;
    }

    console.log(`Found ${products?.length || 0} products`);

    if (!products || products.length === 0) {
      console.log('No products found. Please add some products first.');
      return;
    }

    // Find products that are expiring soon or expired
    const expiringProducts = products.filter(product => {
      const daysUntilExpiry = Math.ceil(
        (new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30; // 30 days or less
    });

    console.log(`\n📋 Products eligible for renewal: ${expiringProducts.length}`);
    
    if (expiringProducts.length === 0) {
      console.log('No products are expiring soon. Creating a test product...');
      
      // Create a test product that's expiring soon
      const testProduct = {
        user_id: user.id,
        name: 'Test Product for Renewal',
        brand: 'Test Brand',
        model: 'Test Model',
        serial_number: 'TEST-RENEWAL-001',
        purchase_date: '2024-01-01',
        warranty_period: 12,
        warranty_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      };

      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating test product:', insertError.message);
        return;
      }

      console.log('✅ Test product created:', newProduct.name);
      expiringProducts.push(newProduct);
    }

    // Show expiring products
    expiringProducts.forEach((product, index) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`${index + 1}. ${product.brand} ${product.model} - ${daysUntilExpiry} days until expiry`);
    });

    // Test renewal plans
    console.log('\n💰 Available Renewal Plans:');
    const renewalPlans = [
      { months: 6, price: 299 },
      { months: 12, price: 499, popular: true },
      { months: 24, price: 899 },
      { months: 36, price: 1299 },
    ];

    renewalPlans.forEach(plan => {
      console.log(`${plan.months} months - ₹${plan.price}${plan.popular ? ' (Popular)' : ''}`);
    });

    // Test renewal process (simulate)
    console.log('\n🔄 Testing Renewal Process...');
    const testProduct = expiringProducts[0];
    const selectedPlan = renewalPlans[1]; // 12 months plan

    console.log(`Testing renewal for: ${testProduct.name}`);
    console.log(`Selected plan: ${selectedPlan.months} months for ₹${selectedPlan.price}`);

    // Calculate new expiry date
    const currentExpiry = new Date(testProduct.warranty_expires_at);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + selectedPlan.months);

    console.log(`Current expiry: ${currentExpiry.toLocaleDateString()}`);
    console.log(`New expiry: ${newExpiry.toLocaleDateString()}`);

    // Test renewal record creation
    const renewalData = {
      user_id: user.id,
      product_id: testProduct.id,
      renewal_months: selectedPlan.months,
      renewal_price: selectedPlan.price,
      payment_method: 'card',
      payment_status: 'completed',
      new_expiry_date: newExpiry.toISOString(),
      status: 'completed',
    };

    console.log('\n📝 Creating renewal record...');
    const { data: renewal, error: renewalError } = await supabase
      .from('warranty_renewals')
      .insert(renewalData)
      .select()
      .single();

    if (renewalError) {
      console.error('Error creating renewal record:', renewalError.message);
      console.log('This might be because the warranty_renewals table doesn\'t exist yet.');
      console.log('Run the migration: supabase/migrations/20250912160000_warranty_renewals.sql');
    } else {
      console.log('✅ Renewal record created successfully!');
      console.log('Renewal ID:', renewal.id);
    }

    // Test notification creation
    console.log('\n🔔 Testing notification creation...');
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Warranty Renewal Test',
        message: `Test renewal for ${testProduct.name} - ${selectedPlan.months} months extension`,
        type: 'success',
        read: false,
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError.message);
    } else {
      console.log('✅ Test notification created!');
    }

    console.log('\n🎯 Warranty Renewal Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Go to your dashboard at http://localhost:5173/');
    console.log('2. Look for the "Renew" button on expiring products');
    console.log('3. Click "Renew" to test the renewal modal');
    console.log('4. Try different renewal plans and payment methods');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWarrantyRenewal();