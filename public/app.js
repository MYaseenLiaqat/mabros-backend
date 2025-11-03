// === Rate per mile ===
let vehicleRates = {
  smallVan: 1.20,
  transitVan: 1.50,
  lwbVan: 1.65
};

// === Default minimum charges per vehicle type (outside London 10mi rule) ===
let minFare = {
  smallVan: 45.00,
  transitVan: 65.00,
  lwbVan: 75.00
};

// === London minimums (apply ONLY if pickup OR destination is within 10 miles of centre) ===
const londonMinFare = {
  smallVan: 60.00,
  transitVan: 80.00,
  lwbVan: 100.00
};

// === Additional delivery time charges (global, unchanged) ===
let deliveryCharges = {
  sameDay: 10,
  scheduled: 5
};

// === Helpers ===
function todayISO() {
  return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// London centre & radius we use for the 10-mile rule
const LONDON_CENTER = "51.5074,-0.1278";
const LONDON_CENTER_LAT = 51.5074;
const LONDON_CENTER_LNG = -0.1278;
const INNER_LONDON_RADIUS_MILES = 10; // keep only this rule

// === Google Maps Places Autocomplete setup ===
let pickupAutocomplete;
let destinationAutocomplete;

function initMap() {
  // Wait for DOM to be ready
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

// === Legacy callback (kept) ===
function fetchDistanceFromAPI(pickup, destination, callback) {
  const apiUrl = `${window.API_BASE_URL}/api/fetchDistance?pickup=${pickup}&destination=${destination}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.distance) callback(data.distance);
      else alert("Error fetching distance.");
    })
    .catch(error => {
      console.error("Error fetching distance:", error);
      alert("An error occurred while fetching the distance.");
    });
}

// === Promise wrapper for distance ===
function fetchDistanceMiles(originRaw, destRaw) {
  const origin = encodeURIComponent(originRaw);
  const dest = encodeURIComponent(destRaw);
  const apiUrl = `${window.API_BASE_URL}/api/fetchDistance?pickup=${origin}&destination=${dest}`;
  return fetch(apiUrl)
    .then(r => r.json())
    .then(data => (typeof data.distance === 'number' ? data.distance : null))
    .catch(() => null);
}

// === 10-mile London check (geodesic, not road miles) ===
function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function geocodeToLatLng(address) {
  return new Promise(function(resolve, reject){
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, function(results, status){
        if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(status || 'GEOCODE_FAILED');
        }
      });
    } catch (e) { reject(e); }
  });
}

function isWithinInnerLondon(address) {
  return geocodeToLatLng(address)
    .then(function(pos){
      const miles = haversineMiles(LONDON_CENTER_LAT, LONDON_CENTER_LNG, pos.lat, pos.lng);
      return miles <= INNER_LONDON_RADIUS_MILES;
    })
    .catch(function(){ return false; });
}

// === Congestion-time surcharge (time windows only) ===
// UK bank holidays (England & Wales) — extend as needed
const UK_BANK_HOLIDAYS = new Set([
  '2025-01-01', // New Year's Day
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-05', // Early May bank holiday
  '2025-05-26', // Spring bank holiday
  '2025-08-25', // Summer bank holiday
  '2025-12-25', // Christmas Day
  '2025-12-26'  // Boxing Day
]);

function isBankHoliday(isoDate) {
  try { return UK_BANK_HOLIDAYS.has(isoDate); } catch (_) { return false; }
}

function getCongestionTimeSurcharge(pickupDate, pickupTime) {
  const [yy, mm, dd] = pickupDate.split('-').map(Number);
  const [HH, MM] = pickupTime.split(':').map(Number);
  const dt = new Date(yy, (mm - 1), dd, HH, MM, 0);

  const day = dt.getDay(); // 0=Sun ... 6=Sat
  const mins = dt.getHours() * 60 + dt.getMinutes();
  const inRange = (startMins, endMins) => mins >= startMins && mins < endMins;

  // Bank holidays are free (no congestion)
  if (isBankHoliday(pickupDate)) {
    return 0;
  }

  // Weekdays (Mon–Fri): 07:00–18:00 => £18
  if (day >= 1 && day <= 5) return inRange(7 * 60, 18 * 60) ? 18 : 0;
  // Weekends (Sat–Sun): free
  if (day === 6 || day === 0) return 0;

  return 0;
}

// === Main function to be called on "Show Fare" ===
function showFareDetails() {
  console.log('showFareDetails function called');
  
  const pickup = document.getElementById('pickup').value;
  const destination = document.getElementById('destination').value;
  const vehicleType = document.getElementById('vehicleType').value;

  const pickupDate = document.getElementById('pickupDate').value; // "YYYY-MM-DD"
  const pickupTime = document.getElementById('pickupTime').value;
  const destinationDate = document.getElementById('destinationDate').value; // "YYYY-MM-DD"
  const destinationTime = document.getElementById('destinationTime').value; // "HH:MM"

  console.log('Form values:', { pickup, destination, vehicleType, pickupDate, pickupTime, destinationDate, destinationTime });

  // Validate
  if (!pickup || !destination || !vehicleType || !pickupDate || !pickupTime || !destinationDate || !destinationTime) {
    alert("Please fill in all the fields.");
    return;
  }
  // Prevent identical pickup/destination
  if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
    alert("Pickup and destination cannot be the same.");
    return;
  }

  // Same-day vs scheduled (unchanged)
  const isSameDay = pickupDate === todayISO();
  const additionalCharge = isSameDay ? deliveryCharges.sameDay : deliveryCharges.scheduled;
  const appliedChargeType = isSameDay ? 'Same-Day' : 'Scheduled';

  // Compute:
  // 1) Trip miles (pickup -> destination)
  // 2) Is pickup within 10mi?
  // 3) Is destination within 10mi?
  Promise.all([
    fetchDistanceMiles(pickup, destination),
    isWithinInnerLondon(pickup),
    isWithinInnerLondon(destination)
  ])
    .then(([tripMiles, pickupIn10, destIn10]) => {
      if (tripMiles === null) {
        alert("Error fetching distance.");
        return;
      }

      // London 10-mile rule
      const useLondonMins = (pickupIn10 || destIn10);
      const minTable = useLondonMins ? londonMinFare : minFare;
      
      // Log which minimum fare table is being used
      console.log('London zone check:', { pickupIn10, destIn10, useLondonMins });
      console.log('Using minimum fare table:', useLondonMins ? 'London' : 'Standard');
      console.log('Minimum fares:', minTable);

      // ✅ Congestion-time fee only from the side(s) within the London 10-mile zone
      let congestionCharge = 0;
      let pickupCongestionCalc = 0;
      let destinationCongestionCalc = 0;
      if (useLondonMins) {
        // Only consider pickup time if pickup is within 10 miles
        if (pickupIn10) {
          pickupCongestionCalc = getCongestionTimeSurcharge(pickupDate, pickupTime);
        }
        // Only consider destination time if destination is within 10 miles
        if (destIn10) {
          destinationCongestionCalc = getCongestionTimeSurcharge(destinationDate, destinationTime);
        }
        // If both sides are within, take the higher; otherwise take the one that applies
        congestionCharge = Math.max(pickupCongestionCalc, destinationCongestionCalc);
        console.log('Congestion charges (zone-filtered):', { pickupIn10, destIn10, pickupCongestionCalc, destinationCongestionCalc, finalCongestion: congestionCharge });
      }

      // Combine charges
      const combinedExtraCharge = Number(additionalCharge) + Number(congestionCharge);

      const subtotalFare = calculateFare(
        vehicleRates[vehicleType],
        tripMiles,
        vehicleType,
        minTable,
        combinedExtraCharge
      );

      // Calculate VAT (20%) and total fare
      const vatAmount = (Number(subtotalFare) * 0.20).toFixed(2);
      const totalFare = (Number(subtotalFare) + Number(vatAmount)).toFixed(2);

      // Persist for details page
      localStorage.setItem('pickup', pickup);
      localStorage.setItem('destination', destination);
      localStorage.setItem('vehicleType', vehicleType);
      localStorage.setItem('pickupDate', pickupDate);
      localStorage.setItem('pickupTime', pickupTime);
      localStorage.setItem('destinationDate', destinationDate);
      localStorage.setItem('destinationTime', destinationTime);
      localStorage.setItem('distance', tripMiles.toFixed(2));
      localStorage.setItem('subtotalFare', subtotalFare);
      localStorage.setItem('vatAmount', vatAmount);
      localStorage.setItem('totalFare', totalFare);
      localStorage.setItem('additionalCharge', String(additionalCharge));
      localStorage.setItem('chargeType', appliedChargeType);
      localStorage.setItem('londonZone', useLondonMins ? 'Yes' : 'No');
      localStorage.setItem('congestionCharge', String(congestionCharge));
      localStorage.setItem('congestionApplied', congestionCharge > 0 ? 'Yes' : 'No');
      // Store per-side congestion considering zone eligibility (0 if not in zone)
      localStorage.setItem('pickupCongestion', String(pickupCongestionCalc));
      localStorage.setItem('destinationCongestion', String(destinationCongestionCalc));
      localStorage.setItem('pickupInLondon', String(pickupIn10));
      localStorage.setItem('destinationInLondon', String(destIn10));
      localStorage.setItem('minimumFareApplied', String(minTable[vehicleType]));
      localStorage.setItem('fareTableUsed', useLondonMins ? 'London' : 'Standard');

      window.location.href = "fareDetails.html";
    })
    .catch(err => {
      console.error(err);
      alert("Error computing fare. Please try again.");
    });
}

// === Fare calculation (unchanged: min up to 20mi, then per-mile) ===
function calculateFare(rate, distanceInMiles, vehicleType, minTable, additionalCharge = 0) {
  let baseFare = 0;

  if (distanceInMiles <= 20) {
    baseFare = minTable[vehicleType];
  } else {
    const extraMiles = distanceInMiles - 20;
    baseFare = minTable[vehicleType] + (extraMiles * rate);
  }

  const total = baseFare + Number(additionalCharge || 0);
  return total.toFixed(2);
}
