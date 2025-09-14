// Simple Browser Console Test - Copy and paste this into your browser console
// Make sure you're on the dashboard page (http://localhost:5173/) first!

console.log('🧪 Starting Simple Warranty Expiry Test...');

// Test 1: Check if we're on the right page
console.log('=== Page Check ===');
console.log('Current URL:', window.location.href);
console.log('Page title:', document.title);

if (window.location.href.includes('localhost:5173')) {
  console.log('✅ Correct page detected');
} else {
  console.log('❌ Please navigate to http://localhost:5173/ first');
}

// Test 2: Check for React app elements
console.log('\n=== React App Check ===');
const reactRoot = document.querySelector('#root');
if (reactRoot) {
  console.log('✅ React app found');
  
  // Look for dashboard elements
  const dashboardElements = document.querySelectorAll('[class*="dashboard"], [class*="product"], [class*="warranty"]');
  console.log('Dashboard elements found:', dashboardElements.length);
  
  // Look for stats cards
  const statsCards = document.querySelectorAll('[class*="stats"], [class*="card"]');
  console.log('Stats cards found:', statsCards.length);
  
  // Look for warning banners
  const warningBanners = document.querySelectorAll('[class*="warning"], [class*="alert"], [class*="expiry"]');
  console.log('Warning banners found:', warningBanners.length);
  
  if (warningBanners.length > 0) {
    console.log('✅ Expiry warnings detected!');
    warningBanners.forEach((banner, index) => {
      console.log(`Warning ${index + 1}:`, banner.textContent.trim());
    });
  } else {
    console.log('ℹ️ No expiry warnings found (this is normal if no products are expiring)');
  }
  
} else {
  console.log('❌ React app not found');
}

// Test 3: Check for products in the DOM
console.log('\n=== Product Elements Check ===');
const productElements = document.querySelectorAll('[class*="product"], [class*="card"]');
console.log('Product elements found:', productElements.length);

if (productElements.length > 0) {
  console.log('✅ Products detected in UI');
  productElements.forEach((product, index) => {
    const text = product.textContent.trim();
    if (text.length > 0) {
      console.log(`Product ${index + 1}:`, text.substring(0, 100) + '...');
    }
  });
} else {
  console.log('ℹ️ No products found in UI (add some products first)');
}

// Test 4: Check for notification elements
console.log('\n=== Notification Check ===');
const notificationElements = document.querySelectorAll('[class*="notification"], [class*="bell"], [class*="alert"]');
console.log('Notification elements found:', notificationElements.length);

// Test 5: Check for expiry-related text
console.log('\n=== Expiry Text Check ===');
const expiryTexts = document.querySelectorAll('*');
let expiryFound = false;
expiryTexts.forEach(element => {
  if (element.textContent && element.textContent.toLowerCase().includes('expir')) {
    console.log('Found expiry text:', element.textContent.trim());
    expiryFound = true;
  }
});

if (!expiryFound) {
  console.log('ℹ️ No expiry text found (normal if no products are expiring)');
}

// Test 6: Check for stats numbers
console.log('\n=== Stats Check ===');
const numberElements = document.querySelectorAll('*');
let numbersFound = [];
numberElements.forEach(element => {
  if (element.textContent && /^\d+$/.test(element.textContent.trim())) {
    numbersFound.push(element.textContent.trim());
  }
});

if (numbersFound.length > 0) {
  console.log('Numbers found in UI:', [...new Set(numbersFound)]);
} else {
  console.log('ℹ️ No numbers found in UI');
}

console.log('\n🎯 Test Complete!');
console.log('If you see expiry warnings above, the system is working!');
console.log('If not, try running: node test-dashboard-alerts.js first');