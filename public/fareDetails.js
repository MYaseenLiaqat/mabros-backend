window.onload = function() {
  const pickup = localStorage.getItem('pickup');
  const destination = localStorage.getItem('destination');
  const distance = localStorage.getItem('distance');
  const subtotalFare = localStorage.getItem('subtotalFare');
  const vatAmount = localStorage.getItem('vatAmount');
  const totalFare = localStorage.getItem('totalFare');
  const vehicleType = localStorage.getItem('vehicleType');
  const pickupDate = localStorage.getItem('pickupDate');
  const pickupTime = localStorage.getItem('pickupTime');
  const destinationDate = localStorage.getItem('destinationDate');
  const destinationTime = localStorage.getItem('destinationTime');
  const additionalCharge = localStorage.getItem('additionalCharge');
  const chargeType = localStorage.getItem('chargeType');
  const congestionCharge = localStorage.getItem('congestionCharge');
  const congestionApplied = localStorage.getItem('congestionApplied');
  const londonZone = localStorage.getItem('londonZone');
  const pickupCongestion = Number(localStorage.getItem('pickupCongestion') || '0');
  const destinationCongestion = Number(localStorage.getItem('destinationCongestion') || '0');

  
  document.getElementById('pickupInfo').innerHTML = `
    <strong>Pickup:</strong> ${pickup}<br>
    <small class="text-muted">Date: ${pickupDate} | Time: ${pickupTime}</small>
  `;
  
  document.getElementById('destinationInfo').innerHTML = `
    <strong>Destination:</strong> ${destination}<br>
    <small class="text-muted">Date: ${destinationDate} | Time: ${destinationTime}</small>
  `;
  
  document.getElementById('fareInfo').innerHTML = `
    <strong>Distance:</strong> ${distance} miles<br>
    <strong>Vehicle:</strong> ${vehicleType}<br>
    <strong>Service:</strong> ${chargeType}
    ${congestionApplied === 'Yes' ? `<br><strong>Congestion:</strong> Yes` : ''}
  `;
  
  document.getElementById('fareResult').innerHTML = `
    <div class="mb-2">Subtotal: £${subtotalFare}</div>
    <div class="mb-2">VAT (20%): £${vatAmount}</div>
    <div class="fw-bold fs-5">Total Fare: £${totalFare}</div>
  `;

  
  if (londonZone === 'Yes' && congestionApplied === 'Yes' && congestionCharge > 0) {
    const congestionCard = document.getElementById('congestionCard');
    const congestionInfo = document.getElementById('congestionInfo');
    if (congestionCard && congestionInfo) {
      congestionCard.style.display = 'block';
      
      let which = '';
      let whenText = '';
      if (pickupCongestion > 0 && pickupCongestion >= destinationCongestion) {
        which = 'Pickup';
        whenText = `${pickupDate} at ${pickupTime}`;
      } else if (destinationCongestion > 0) {
        which = 'Destination';
        whenText = `${destinationDate} at ${destinationTime}`;
      }

      congestionInfo.innerHTML = `
        <div class="alert alert-warning mb-3">
          <strong>London Congestion Zone:</strong> Congestion applies during weekday peak hours.
        </div>
        <div class="p-3 bg-light rounded">
          <strong>Congestion:</strong> Yes<br>
          <strong>${which} timing:</strong> <span class="text-muted">${whenText}</span>
        </div>
        <div class="mt-3 small text-muted">
          Window: 07:00–18:00 (Mon–Fri); free on Sat–Sun and bank holidays.
        </div>
      `;
    }
  }

  
  displayRouteMap(pickup, destination);
};


function displayRouteMap(pickup, destination) {
  
  function tryDisplayMap() {
    if (typeof google === 'undefined' || !google.maps) {
      
      setTimeout(tryDisplayMap, 100);
      return;
    }

    
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    const mapElement = document.getElementById('fareMap');
    if (!mapElement) {
      console.error('Map container not found!');
      return;
    }

    const map = new google.maps.Map(mapElement, {
      zoom: 7,
      center: { lat: 51.5074, lng: -0.1278 } 
    });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: pickup,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Directions request failed:", status);
          mapElement.innerHTML = '<div class="alert alert-warning">Unable to load route map. Please check the addresses.</div>';
        }
      }
    );
  }

  
  tryDisplayMap();
}


window.initMap = function() {
  console.log('Google Maps API loaded successfully');
  
};
