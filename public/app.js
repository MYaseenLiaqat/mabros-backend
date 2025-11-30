
const LONDON_CENTER_LAT = 51.5074;
const LONDON_CENTER_LNG = -0.1278;
const INNER_LONDON_RADIUS_MILES = 10;

let pickupAutocomplete;
let destinationAutocomplete;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function initMap() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
    return;
  }

  const pickupInput = document.getElementById('pickup');
  const destinationInput = document.getElementById('destination');

  if (!pickupInput || !destinationInput) {
    console.log('Input fields not found, retrying...');
    setTimeout(initMap, 100);
    return;
  }

  try {
    pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
      types: ['geocode'],
      componentRestrictions: { country: "GB" }
    });

    destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
      types: ['geocode'],
      componentRestrictions: { country: "GB" }
    });

    pickupAutocomplete.addListener("place_changed", function () {
      const place = pickupAutocomplete.getPlace();
      if (place && place.formatted_address) {
        pickupInput.value = place.formatted_address;
      }
    });

    destinationAutocomplete.addListener("place_changed", function () {
      const place = destinationAutocomplete.getPlace();
      if (place && place.formatted_address) {
        destinationInput.value = place.formatted_address;
      }
    });

    console.log('Google Maps Autocomplete initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
  }
}

function fetchDistanceMiles(originRaw, destRaw) {
  const origin = encodeURIComponent(originRaw);
  const dest = encodeURIComponent(destRaw);
  const apiUrl = `${window.API_BASE_URL}/api/fetchDistance?pickup=${origin}&destination=${dest}`;
  return fetch(apiUrl)
    .then(r => r.json())
    .then(data => (typeof data.distance === 'number' ? data.distance : null))
    .catch(() => null);
}

function showFareDetails() {
  console.log('showFareDetails function called');

  const pickup = document.getElementById('pickup').value;
  const destination = document.getElementById('destination').value;
  const vehicleType = document.getElementById('vehicleType').value;
  const pickupDate = document.getElementById('pickupDate').value;
  const pickupTime = document.getElementById('pickupTime').value;
  const destinationDate = document.getElementById('destinationDate').value;
  const destinationTime = document.getElementById('destinationTime').value;

  console.log('Form values:', { pickup, destination, vehicleType, pickupDate, pickupTime, destinationDate, destinationTime });

  // Validate inputs
  if (!pickup || !destination || !vehicleType || !pickupDate || !pickupTime || !destinationDate || !destinationTime) {
    alert("Please fill in all the fields.");
    return;
  }

  if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
    alert("Pickup and destination cannot be the same.");
    return;
  }

  fetchDistanceMiles(pickup, destination)
    .then(distance => {
      if (distance === null) {
        alert("Error fetching distance.");
        return;
      }

      console.log(`Distance: ${distance} miles`);

      
      const fareData = {
        pickup: pickup,
        destination: destination,
        vehicleType: vehicleType,
        pickupDate: pickupDate,
        pickupTime: pickupTime,
        destinationDate: destinationDate,
        destinationTime: destinationTime,
        distance: distance
      };

      return fetch(`${window.API_BASE_URL}/api/calculateFare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fareData)
      });
    })
    .then(response => {
      if (!response) return; 
      return response.json();
    })
    .then(result => {
      if (!result || !result.success) {
        alert(result?.error || "Error calculating fare.");
        return;
      }

      console.log('Fare calculation result:', result);

      
      localStorage.setItem('pickup', pickup);
      localStorage.setItem('destination', destination);
      localStorage.setItem('vehicleType', vehicleType);
      localStorage.setItem('pickupDate', pickupDate);
      localStorage.setItem('pickupTime', pickupTime);
      localStorage.setItem('destinationDate', destinationDate);
      localStorage.setItem('destinationTime', destinationTime);
      localStorage.setItem('distance', result.distance);
      localStorage.setItem('subtotalFare', result.subtotal);
      localStorage.setItem('vatAmount', result.vat);
      localStorage.setItem('totalFare', result.total);
      localStorage.setItem('additionalCharge', result.additionalCharge);
      localStorage.setItem('chargeType', result.chargeType);
      localStorage.setItem('londonZone', result.londonZone);
      localStorage.setItem('congestionCharge', result.congestionCharge);
      localStorage.setItem('congestionApplied', result.congestionApplied);
      localStorage.setItem('pickupCongestion', result.pickupCongestion);
      localStorage.setItem('destinationCongestion', result.destinationCongestion);
      localStorage.setItem('pickupInLondon', result.pickupInLondon);
      localStorage.setItem('destinationInLondon', result.destinationInLondon);
      localStorage.setItem('minimumFareApplied', result.minimumFareApplied);
      localStorage.setItem('fareTableUsed', result.fareTableUsed);

    
      window.location.href = "fareDetails.html";
    })
    .catch(err => {
      console.error('Error:', err);
      alert("Error computing fare. Please try again.");
    });
}
