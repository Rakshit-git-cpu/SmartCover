// Test script to verify email verification is disabled
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

async function testNoEmailVerification() {
  try {
    console.log('📧 Testing Email Verification Disabled...');
    
    // Test user data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    console.log('Creating test user:', testEmail);

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });

    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return;
    }

    console.log('✅ Sign up successful!');
    console.log('User data:', {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at,
      created_at: data.user?.created_at,
    });

    // Check if user is immediately confirmed
    if (data.user?.email_confirmed_at) {
      console.log('✅ Email verification is DISABLED - user is immediately confirmed!');
      console.log('Confirmed at:', new Date(data.user.email_confirmed_at).toLocaleString());
    } else {
      console.log('⚠️ Email verification is still ENABLED - user needs to verify email');
    }

    // Test if user can immediately sign in
    console.log('\n🔐 Testing immediate sign in...');
    
    // Sign out first
    await supabase.auth.signOut();
    
    // Try to sign in immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('❌ Immediate sign in failed:', signInError.message);
      console.log('This might be because email verification is still required');
    } else {
      console.log('✅ Immediate sign in successful!');
      console.log('User can access the app immediately after registration');
    }

    // Clean up - delete test user
    console.log('\n🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user?.id);
    
    if (deleteError) {
      console.log('Note: Could not delete test user (this is normal for client-side)');
    } else {
      console.log('✅ Test user cleaned up');
    }

    console.log('\n🎯 Email Verification Test Complete!');
    console.log('\nSummary:');
    if (data.user?.email_confirmed_at) {
      console.log('✅ Email verification is DISABLED');
      console.log('✅ Users can register and immediately access the app');
      console.log('✅ No email confirmation required');
    } else {
      console.log('❌ Email verification is still ENABLED');
      console.log('❌ Users need to verify their email before accessing the app');
      console.log('💡 Run the migration: supabase/migrations/20250912170000_disable_email_confirmation.sql');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNoEmailVerification();