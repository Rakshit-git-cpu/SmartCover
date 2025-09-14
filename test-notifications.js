// Test script for notification functionality
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

async function testNotifications() {
  try {
    console.log('🔔 Testing Notification System...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Please log in first to test notifications');
      return;
    }

    console.log('User:', user.email);

    // Create test notifications
    console.log('\n📝 Creating test notifications...');
    
    const testNotifications = [
      {
        user_id: user.id,
        title: 'Welcome to Mera Chhata!',
        message: 'Your warranty management system is now ready to use.',
        type: 'success',
        read: false,
      },
      {
        user_id: user.id,
        title: 'Product Added Successfully',
        message: 'Your iPhone 15 Pro has been registered with warranty protection.',
        type: 'success',
        read: false,
      },
      {
        user_id: user.id,
        title: 'Warranty Expiry Alert',
        message: 'Your MacBook Pro warranty will expire in 15 days.',
        type: 'warning',
        read: false,
      },
      {
        user_id: user.id,
        title: 'Warranty Claim Submitted',
        message: 'Your warranty claim for Samsung Galaxy S24 has been submitted.',
        type: 'info',
        read: true,
      },
      {
        user_id: user.id,
        title: 'Warranty Renewed',
        message: 'Your iPhone 15 Pro warranty has been extended by 12 months.',
        type: 'success',
        read: false,
      }
    ];

    // Insert test notifications
    const { data: notifications, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select();

    if (insertError) {
      console.error('Error creating test notifications:', insertError.message);
      return;
    }

    console.log('✅ Test notifications created successfully!');
    console.log('Created notifications:', notifications.length);

    // Fetch and display notifications
    console.log('\n📋 Current Notifications:');
    const { data: allNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError.message);
      return;
    }

    console.log(`Total notifications: ${allNotifications.length}`);
    console.log(`Unread notifications: ${allNotifications.filter(n => !n.read).length}`);

    allNotifications.forEach((notification, index) => {
      const status = notification.read ? '✅ Read' : '🔔 Unread';
      const type = notification.type.toUpperCase();
      console.log(`${index + 1}. [${type}] ${notification.title} - ${status}`);
      console.log(`   ${notification.message}`);
      console.log(`   Created: ${new Date(notification.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log('🎯 Notification Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Go to your dashboard at http://localhost:5173/');
    console.log('2. Look for the notification bell icon in the header');
    console.log('3. Click the bell icon to open the notification panel');
    console.log('4. You should see 4 unread notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotifications();