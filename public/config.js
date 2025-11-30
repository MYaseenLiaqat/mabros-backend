


const API_BASE_URL = (() => {
  const hostname = window.location.hostname;


  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }


  return 'https://mabros-backend.onrender.com';
})();

const CLIENT_TOKEN = 'mabros-client-v1';

window.API_BASE_URL = API_BASE_URL;
window.CLIENT_TOKEN = CLIENT_TOKEN;

console.log('🔧 Config loaded - API URL:', API_BASE_URL);


