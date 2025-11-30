// // email.js

// // Safety init (if firebase-init.js didn’t run for some reason)
// if (!firebase.apps.length) {
//   firebase.initializeApp({
//     apiKey: "AIzaSyCJq6hcDWkGAeox63VE9Retj3bteBI8Z1E",
//     authDomain: "mabros-db.firebaseapp.com",
//     databaseURL: "https://mabros-db-default-rtdb.firebaseio.com",
//     projectId: "mabros-db",
//     storageBucket: "mabros-db.appspot.com",
//     messagingSenderId: "298975594318",
//     appId: "1:298975594318:web:b6b76cd7b623f1faf4801f",
//     measurementId: "G-M3H022MYF0"
//   });
// }
// var db = firebase.database();

// // Format vehicle name (kept as you had it)
// function formatVehicleName(value) {
//   switch (value) {
//     case "smallVan": return "Small Van";
//     case "transitVan": return "Transit Van";
//     case "lwbVan": return "LWB Van";
//     default: return value || "Unknown";
//   }
// }

// // Human-friendly Booking ID, example: MBR-250811-7XQ4
// function generateBookingId() {
//   const now = new Date();
//   const y = String(now.getFullYear()).slice(-2);
//   const m = String(now.getMonth() + 1).padStart(2, "0");
//   const d = String(now.getDate()).padStart(2, "0");
//   const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
//   return `MBR-${y}${m}${d}-${rand}`;
// }

// // Populate summary from localStorage (unchanged)
// window.addEventListener("DOMContentLoaded", () => {
//   const pickup = localStorage.getItem("pickup") || "N/A";
//   const destination = localStorage.getItem("destination") || "N/A";
//   const vehicleType = formatVehicleName(localStorage.getItem("vehicleType"));
//   const pickupDate = localStorage.getItem("pickupDate") || "N/A";
//   const pickupTime = localStorage.getItem("pickupTime") || "N/A";
//   const fare = localStorage.getItem("totalFare") || "N/A";

//   document.getElementById("pickupInfo").innerText = `Pickup Address: ${pickup}`;
//   document.getElementById("destinationInfo").innerText = `Destination Address: ${destination}`;
//   document.getElementById("vehicleTypeInfo").innerText = `Vehicle Type: ${vehicleType}`;
//   document.getElementById("pickupDateOnlyInfo").innerText = `Pickup Date: ${pickupDate}`;
//   document.getElementById("pickupDateTimeInfo").innerText = `Pickup: ${pickupDate} at ${pickupTime}`;
//   document.getElementById("fareInfo").innerText = `Total Fare: £${fare}`;
// });

// // Submit: send EmailJS + save to Firebase
// document.getElementById("bookingForm").addEventListener("submit", function (event) {
//   event.preventDefault();

//   const email = document.getElementById("email").value;
//   const deliveryDate = document.getElementById("deliveryDate").value;
//   const deliveryTime = document.getElementById("deliveryTime").value;

//   const pickup = localStorage.getItem("pickup") || "N/A";
//   const destination = localStorage.getItem("destination") || "N/A";
//   const vehicleType = formatVehicleName(localStorage.getItem("vehicleType"));
//   const pickupDate = localStorage.getItem("pickupDate") || "N/A";
//   const pickupTime = localStorage.getItem("pickupTime") || "N/A";
//   const fare = localStorage.getItem("totalFare") || "N/A";

//   // NEW: generate & store a Booking ID
//   const bookingID = generateBookingId();
//   localStorage.setItem("bookingId", bookingID);

//   // EmailJS params (add booking_id)
//   const templateParams = {
//     booking_id: bookingID,
//     email: email,               // recipient
//     userEmail: email,           // {{userEmail}} in template
//     deliveryDate: deliveryDate, // {{deliveryDate}}
//     delivery_time: deliveryTime,
//     pickup: pickup,
//     destination: destination,
//     vehicle_type: vehicleType,
//     pickup_date: pickupDate,
//     pickup_time: pickupTime,
//     fare: fare
//   };

//   // Send email to user (template must include {{booking_id}})
//   emailjs
//     .send("service_3s79mls", "template_5tmisjg", templateParams)
//     .then(
//       function () {
//         // Optional: send to admin as well (same template, admin email as recipient)
//         emailjs.send("service_3s79mls", "template_5tmisjg", {
//           ...templateParams,
//           email: "admin@mabroscouriers.com"
//         }).catch(() => { /* ignore admin send error */ });

//         alert(`📩 Booking email sent! Your Booking ID is ${bookingID}`);

//         // Save booking to Firebase (includes bookingID)
//         db.ref("bookings").push({
//           bookingID: bookingID,
//           email: email,
//           pickup: pickup,
//           destination: destination,
//           pickupDate: pickupDate,
//           pickupTime: pickupTime,
//           deliveryDate: deliveryDate,
//           deliveryTime: deliveryTime,
//           vehicleType: vehicleType,
//           fare: fare,
//           createdAt: Date.now()
//         })
//         .then(() => console.log("✅ Booking saved to Firebase"))
//         .catch((error) => console.error("❌ Failed to write to Firebase:", error));
//       },
//       function (error) {
//         console.error("❌ Email error:", error);
//         alert("❌ Error sending email: " + (error && error.text ? error.text : "Unknown error"));
//       }
//     );
// });

// email.js

// Global variables to store config
var appConfig = null;
var db = null;
var configLoaded = false;
var firebaseReady = false;
var emailjsReady = false;

// Function to initialize EmailJS once library and config are ready
function initializeEmailJS() {
  if (!appConfig || !appConfig.emailjs || !appConfig.emailjs.userId) {
    console.log('Waiting for config...');
    setTimeout(initializeEmailJS, 100);
    return;
  }

  if (typeof emailjs === 'undefined') {
    console.log('Waiting for EmailJS library...');
    setTimeout(initializeEmailJS, 100);
    return;
  }

  // Both config and library are ready
  try {
    emailjs.init(appConfig.emailjs.userId);
    emailjsReady = true;
    console.log('Email.js: EmailJS initialized successfully');
  } catch (error) {
    console.error('Error initializing EmailJS:', error);
  }
}

fetch(window.API_BASE_URL + '/api/config', {
  headers: { 'X-Client-Token': window.CLIENT_TOKEN }
})
  .then(function (response) {
    if (!response.ok) throw new Error('Failed to fetch config');
    return response.json();
  })
  .then(function (config) {
    appConfig = config;
    configLoaded = true;
    console.log('Email.js: Config loaded successfully');


    // Start trying to initialize EmailJS
    initializeEmailJS();
  })
  .catch(function (error) {
    console.error('Error loading config:', error);
    alert('Failed to load application configuration. Please ensure the backend server is running.');
  });

// Wait for Firebase to be initialized by firebase-init.js
function waitForFirebase() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    try {
      db = firebase.database();
      firebaseReady = true;
      console.log('Email.js: Firebase is ready');
    } catch (error) {
      console.error('Error accessing Firebase database:', error);
    }
  } else {
    setTimeout(waitForFirebase, 100);
  }
}

// Start waiting for Firebase
waitForFirebase();

// Format vehicle name (kept as you had it)
function formatVehicleName(value) {
  switch (value) {
    case "smallVan": return "Small Van";
    case "transitVan": return "Transit Van";
    case "lwbVan": return "LWB Van";
    default: return value || "Unknown";
  }
}

// Human-friendly Booking ID, example: MBR-250811-7XQ4
function generateBookingId() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MBR-${y}${m}${d}-${rand}`;
}

// Populate summary from localStorage (unchanged)
window.addEventListener("DOMContentLoaded", () => {
  const pickup = localStorage.getItem("pickup") || "N/A";
  const destination = localStorage.getItem("destination") || "N/A";
  const vehicleType = formatVehicleName(localStorage.getItem("vehicleType"));
  const pickupDate = localStorage.getItem("pickupDate") || "N/A";
  const pickupTime = localStorage.getItem("pickupTime") || "N/A";
  const destinationDate = localStorage.getItem("destinationDate") || "N/A";
  const destinationTime = localStorage.getItem("destinationTime") || "N/A";
  const subtotalFare = localStorage.getItem("subtotalFare") || "N/A";
  const vatAmount = localStorage.getItem("vatAmount") || "N/A";
  const fare = localStorage.getItem("totalFare") || "N/A";

  document.getElementById("pickupInfo").innerText = `Pickup Address: ${pickup}`;
  document.getElementById("destinationInfo").innerText = `Destination Address: ${destination}`;
  document.getElementById("vehicleTypeInfo").innerText = `Vehicle Type: ${vehicleType}`;
  document.getElementById("pickupDateOnlyInfo").innerText = `Pickup Date: ${pickupDate}`;
  document.getElementById("pickupDateTimeInfo").innerText = `Pickup: ${pickupDate} at ${pickupTime}`;
  const destDT = document.getElementById("destinationDateTimeInfo");
  if (destDT) destDT.innerText = `Delivery: ${destinationDate} at ${destinationTime}`;
  document.getElementById("fareInfo").innerHTML = `
    <div>Subtotal: £${subtotalFare}</div>
    <div>VAT (20%): £${vatAmount}</div>
    <div class="fw-bold">Total Fare: £${fare}</div>
  `;

  // Initialize intl-tel-input on phone field if present
  var phoneInput = document.getElementById('phone');
  if (phoneInput && window.intlTelInput) {
    window.itiPhone = window.intlTelInput(phoneInput, {
      initialCountry: 'gb',
      separateDialCode: true,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
    });
  }
});

// Submit: send EmailJS + save to Firebase
document.getElementById("bookingForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  var rawPhoneInput = document.getElementById("phone");
  var phone = (rawPhoneInput?.value || "").trim();
  try {
    if (window.itiPhone && rawPhoneInput) {
      var e164 = window.itiPhone.getNumber();
      if (e164) phone = e164; // store standardized E.164 number
    }
  } catch (_) { /* ignore formatting errors */ }
  // Build a friendly Job Specs summary
  var orderType = (document.getElementById('orderType')?.value || '').trim();
  var persons = (document.getElementById('personsNeeded')?.value || '').trim();
  var flags = [];
  if (document.getElementById('specFragile')?.checked) flags.push('Fragile');
  if (document.getElementById('specHeavy')?.checked) flags.push('Heavy/bulky');
  if (document.getElementById('specStairs')?.checked) flags.push('Stairs/no lift');
  if (document.getElementById('specParking')?.checked) flags.push('Limited parking');
  if (document.getElementById('specTimed')?.checked) flags.push('Timed collection/delivery');
  const jobSpecsFree = (document.getElementById("jobSpecs")?.value || "").trim();
  const jobSpecsParts = [];
  if (orderType) jobSpecsParts.push('Type: ' + orderType);
  if (persons) jobSpecsParts.push('Persons needed: ' + persons);
  if (flags.length) jobSpecsParts.push('Flags: ' + flags.join(', '));
  if (jobSpecsFree) jobSpecsParts.push('Notes: ' + jobSpecsFree);
  const jobSpecs = jobSpecsParts.join(' | ');

  // Validate email via Kickbox proxy before proceeding
  function verifyEmail(emailAddr) {
    return fetch(window.API_BASE_URL + '/api/verify_email?email=' + encodeURIComponent(emailAddr))
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }

  // Pull all context from localStorage (set by app.js)
  const pickup = localStorage.getItem("pickup") || "N/A";
  const destination = localStorage.getItem("destination") || "N/A";
  const vehicleTypeRaw = localStorage.getItem("vehicleType") || "";
  const vehicleType = formatVehicleName(vehicleTypeRaw);
  const pickupDate = localStorage.getItem("pickupDate") || "N/A";
  const pickupTime = localStorage.getItem("pickupTime") || "N/A";
  const destinationDate = localStorage.getItem("destinationDate") || "N/A";
  const destinationTime = localStorage.getItem("destinationTime") || "N/A";
  const subtotalFare = localStorage.getItem("subtotalFare") || "0";
  const vatAmount = localStorage.getItem("vatAmount") || "0";
  const fare = localStorage.getItem("totalFare") || "0";
  const distance = localStorage.getItem("distance") || "0";
  const additionalCharge = localStorage.getItem("additionalCharge") || "0";   // 10 or 5
  const chargeType = localStorage.getItem("chargeType") || "";          // Same-Day/Scheduled
  const londonZone = localStorage.getItem("londonZone") || "No";        // Yes/No
  const congestionApplied = localStorage.getItem("congestionApplied") || "No"; // Yes/No
  const congestionCharge = localStorage.getItem("congestionCharge") || "0";   // 15 or 0
  const pickupCongestion = localStorage.getItem("pickupCongestion") || "0";  // Pickup congestion charge
  const destinationCongestion = localStorage.getItem("destinationCongestion") || "0"; // Destination congestion charge

  // NEW: generate & store a Booking ID
  const bookingID = generateBookingId();
  localStorage.setItem("bookingId", bookingID);

  // Build a subject and human note if congestion applies in London
  const congActive = (londonZone === "Yes" && congestionApplied === "Yes");
  const subject = `Mabros Booking • ${bookingID}`;

  // Remove surcharge note entirely from emails
  const surchargeNote = ``;

  // Professional note about additional service charges for the customer
  const additionalServicesNote = `Please note: the total may be adjusted if additional services are required on the day (e.g., waiting time, extra loading/handball, stairs or long carry). We will always confirm any such charges transparently before proceeding.`;
  const jobSpecsLine = jobSpecs ? `Job specifications: ${jobSpecs}\n` : "";

  // Useful plain summaries (user vs admin)
  const summaryPlainUser = `
Booking ID: ${bookingID}
Pickup: ${pickup}
Destination: ${destination}
Vehicle: ${vehicleType}
Pickup: ${pickupDate} ${pickupTime}
Destination: ${destinationDate} ${destinationTime}
Distance: ${distance} miles
London zone: ${londonZone}
${jobSpecsLine}${congActive ? `Congestion: Yes\n` : ""}
Subtotal: £${subtotalFare}
VAT (20%): £${vatAmount}
Total fare: £${fare}
\n${additionalServicesNote}
  `.trim();

  const summaryPlainAdmin = `
Booking ID: ${bookingID}
Pickup: ${pickup}
Destination: ${destination}
Vehicle: ${vehicleType}
Pickup: ${pickupDate} ${pickupTime}
Destination: ${destinationDate} ${destinationTime}
Distance: ${distance} miles
London zone: ${londonZone}
${jobSpecsLine}${congActive ? `Congestion: Yes\n` : ""}Charge type: ${chargeType} (+£${additionalCharge})
Subtotal: £${subtotalFare}
VAT (20%): £${vatAmount}
Total fare: £${fare}
  `.trim();

  // EmailJS params - user facing (no internal fixed service charges)
  const templateParamsUser = {
    // addressing
    email,                 // recipient (used by your template)
    subject,               // put {{subject}} in the template Subject field

    // booking fields
    booking_id: bookingID,
    pickup,
    destination,
    vehicle_type: vehicleType,
    pickup_date: pickupDate,
    pickup_time: pickupTime,
    destination_date: destinationDate,
    destination_time: destinationTime,
    distance_miles: distance,
    subtotal_fare: subtotalFare,
    vat_amount: vatAmount,
    fare,
    job_specs: jobSpecs,
    phone,

    // breakdown / flags (no numeric congestion details sent)
    chargeType,               // Service type only (Same-Day or Scheduled)
    londonZone,               // Yes/No
    congestionApplied,        // Yes/No
    surchargeNote,            // generic note only; no amounts
    additionalServicesNote,   // professional note for customer
    summary_plain: summaryPlainUser
  };

  // First: call Kickbox verification
  verifyEmail(email).then(function (v) {
    var verdict = v && v.result ? String(v.result).toLowerCase() : 'unknown';
    if (verdict === 'undeliverable') {
      alert('The email appears undeliverable. Please check and try again.');
      return; // STOP: do not email or write to Firebase
    }
    if (verdict === 'risky') {
      if (!confirm('This email looks risky (may not exist). Continue anyway?')) return;
    }
    // Check if config, Firebase, and EmailJS are ready
    if (!configLoaded || !appConfig || !appConfig.emailjs) {
      alert('Configuration not loaded yet. Please wait a moment and try again.');
      return;
    }

    if (!firebaseReady || !db) {
      alert('Database not ready yet. Please wait a moment and try again.');
      return;
    }

    if (!emailjsReady) {
      alert('Email service not ready yet. Please wait a moment and try again.');
      return;
    }

    // 1) Send email to user
    emailjs
      .send(appConfig.emailjs.serviceId, appConfig.emailjs.templateId, templateParamsUser)
      .then(function () {
        // 2) Send the same message to admin (different recipient)
        emailjs
          .send(appConfig.emailjs.serviceId, appConfig.emailjs.templateId, {
            ...templateParamsUser,
            email: "admin@mabroscouriers.com",
            admin_copy: true,
            // expose internal pricing knobs to admin only
            chargeType,
            additionalCharge,
            job_specs: jobSpecs,
            summary_plain: summaryPlainAdmin
          })
          .catch(() => { /* ignore admin send error */ });

        alert(`📩 Booking email sent! Your Booking ID is ${bookingID}`);

        // Save booking to Firebase (only after passable verification), then redirect to Thank You
        db.ref("bookings").push({
          bookingID: bookingID,
          email: email,
          phone: phone,
          pickup: pickup,
          destination: destination,
          pickupDate: pickupDate,
          pickupTime: pickupTime,
          destinationDate: destinationDate,
          destinationTime: destinationTime,
          vehicleType: vehicleType,
          distance: distance,
          subtotalFare: subtotalFare,
          vatAmount: vatAmount,
          fare: fare,
          chargeType: chargeType,
          additionalCharge: additionalCharge,
          londonZone: londonZone,
          congestionApplied: congestionApplied,
          congestionCharge: congestionCharge,
          jobSpecs: jobSpecs,
          createdAt: Date.now(),
          emailVerification: verdict
        })
          .then(() => {
            console.log("✅ Booking saved to Firebase");
            // Navigate to Thank You page which clears data and offers next steps
            window.location.href = "thankyou.html";
          })
          .catch((error) => console.error("❌ Failed to write to Firebase:", error));
      })
      .catch(function (error) {
        console.error("❌ Email error:", error);
        alert("❌ Error sending email: " + (error && error.text ? error.text : "Unknown error"));
      });
  });
});
