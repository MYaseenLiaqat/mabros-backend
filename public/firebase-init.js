// firebase-init.js
// Fetch Firebase configuration from backend API
(function () {
  // Fetch config from backend (uses dynamic URL from config.js)
  fetch(window.API_BASE_URL + '/api/config')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch config');
      return response.json();
    })
    .then(function(config) {
      var firebaseConfig = config.firebase;
      // Initialize Firebase only if not already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      }
    })
    .catch(function(error) {
      console.error('Error loading Firebase config:', error);
      alert('Failed to load application configuration. Please ensure the backend server is running.');
    });
})();
