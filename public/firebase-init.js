

(function () {

  fetch(window.API_BASE_URL + '/api/config', {
    headers: {
      'X-Client-Token': 'mabros-client-v1'
    }
  })
    .then(function (response) {
      if (!response.ok) throw new Error('Failed to fetch config');
      return response.json();
    })
    .then(function (config) {
      var firebaseConfig = config.firebase;

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      }
    })
    .catch(function (error) {
      console.error('Error loading Firebase config:', error);
      alert('Failed to load application configuration. Please ensure the backend server is running.');
    });
})();
