/**
 * Configuration file for Mabros Couriers
 * Automatically detects environment and sets appropriate API URL
 */

// Auto-detect environment and set API base URL
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  
  // Production: Use Render backend
  return 'https://mabros-backend.onrender.com';
})();

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;

console.log('🔧 Config loaded - API URL:', API_BASE_URL);


