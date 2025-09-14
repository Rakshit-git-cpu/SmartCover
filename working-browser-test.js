// Working Browser Console Test - Copy and paste this into your browser console
// Make sure you're on the dashboard page (http://localhost:5173/) first!

console.log('🧪 Starting Warranty Expiry Test...');

// Test 1: Check if debug functions are available
if (typeof window.debugWarrantySystem !== 'undefined') {
  console.log('✅ Debug functions available');
  
  // Test 2: Get current user
  console.log('\n=== User Info ===');
  const user = window.debugWarrantySystem.getUser();
  console.log('Current user:', user);
  
  // Test 3: Get all products
  console.log('\n=== All Products ===');
  const products = window.debugWarrantySystem.getProducts();
  console.log('Total products:', products.length);
  products.forEach((product, index) => {
    const daysUntilExpiry = Math.ceil((new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    console.log(`${index + 1}. ${product.brand} ${product.model} - ${daysUntilExpiry} days until expiry`);
  });
  
  // Test 4: Get expiring products
  console.log('\n=== Expiring Products (≤30 days) ===');
  const expiringProducts = window.debugWarrantySystem.getExpiringProducts();
  console.log('Expiring products count:', expiringProducts.length);
  
  if (expiringProducts.length > 0) {
    console.log('✅ Expiry warnings should be visible!');
    expiringProducts.forEach((product, index) => {
      const daysUntilExpiry = Math.ceil((new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      console.log(`⚠️ ${index + 1}. ${product.brand} ${product.model} - ${daysUntilExpiry} days until expiry`);
    });
  } else {
    console.log('ℹ️ No products expiring soon (this is normal if no products are expiring)');
  }
  
  // Test 5: Get notifications
  console.log('\n=== Notifications ===');
  const notifications = window.debugWarrantySystem.getNotifications();
  console.log('Total notifications:', notifications.length);
  notifications.forEach((notification, index) => {
    console.log(`${index + 1}. ${notification.title} - ${notification.message}`);
  });
  
  // Test 6: Run expiry check
  console.log('\n=== Expiry Check Test ===');
  const expiryResult = window.debugWarrantySystem.testExpiryCheck();
  console.log('Expiry check result:', expiryResult);
  
} else {
  console.log('❌ Debug functions not available');
  console.log('Make sure you are on the dashboard page and logged in');
  console.log('Navigate to: http://localhost:5173/');
}

// Test 7: Check for visual elements
console.log('\n=== Visual Elements Check ===');

// Look for warning banners
const warningBanners = document.querySelectorAll('[class*="warning"], [class*="alert"], [class*="expiry"]');
console.log('Warning banners found:', warningBanners.length);

if (warningBanners.length > 0) {
  console.log('✅ Visual warnings detected!');
  warningBanners.forEach((banner, index) => {
    console.log(`Warning ${index + 1}:`, banner.textContent.trim());
  });
} else {
  console.log('ℹ️ No visual warnings found');
}

// Look for stats cards
const statsCards = document.querySelectorAll('[class*="stats"], [class*="card"]');
console.log('Stats cards found:', statsCards.length);

// Look for product cards
const productCards = document.querySelectorAll('[class*="product"]');
console.log('Product cards found:', productCards.length);

console.log('\n🎯 Test Complete!');
console.log('If you see expiry warnings above, the system is working!');
console.log('If not, try running: node test-dashboard-alerts.js first');