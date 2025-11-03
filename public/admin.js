// Global variables
var db = null;
var tbody = document.querySelector("#bookingsTable tbody");

// Show loading immediately
if (tbody) {
  tbody.innerHTML = "<tr><td colspan='15' class='text-center'>Loading configuration...</td></tr>";
}

// Wait for Firebase to be initialized by the HTML page
function waitForFirebase() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    // Firebase is ready
    try {
      db = firebase.database();
      loadBookings();
    } catch (error) {
      console.error('Error accessing Firebase database:', error);
      if (tbody) {
        tbody.innerHTML = "<tr><td colspan='15' class='text-danger text-center'>Failed to access database.</td></tr>";
      }
    }
  } else {
    // Firebase not ready yet, check again in 100ms
    setTimeout(waitForFirebase, 100);
  }
}

// Start waiting for Firebase
waitForFirebase();

// Simple HTML escaping to avoid breaking the table with raw text
function escapeHtml(value){
	if (value == null) return '';
	return String(value)
	  .replace(/&/g, '&amp;')
	  .replace(/</g, '&lt;')
	  .replace(/>/g, '&gt;')
	  .replace(/\"/g, '&quot;')
	  .replace(/'/g, '&#39;');
}

function formatJobSpecs(raw){
	if (!raw) return '-';
	var parts = String(raw).split('|').map(function(p){ return p.trim(); }).filter(Boolean);
	var lower = parts.map(function(p){ return p.toLowerCase(); });
	function findVal(prefix){
		var idx = lower.findIndex(function(p){ return p.indexOf(prefix) === 0; });
		if (idx === -1) return '';
		var seg = parts[idx].split(':');
		return seg.length > 1 ? seg.slice(1).join(':').trim() : '';
	}
	var typeVal = findVal('type:');
	var personsVal = findVal('persons needed:');
	var flagsVal = findVal('flags:');
	var notesVal = findVal('notes:');

	var html = '<div class="small">';
	if (typeVal) html += '<div><strong>Type:</strong> ' + escapeHtml(typeVal) + '</div>';
	if (personsVal) html += '<div><strong>Persons:</strong> ' + escapeHtml(personsVal) + '</div>';
	if (flagsVal) {
		var flags = flagsVal.split(',').map(function(f){ return f.trim(); }).filter(Boolean);
		if (flags.length) {
			html += '<div>';
			flags.forEach(function(f){ html += '<span class="badge bg-light text-dark border me-1 mb-1">' + escapeHtml(f) + '</span>'; });
			html += '</div>';
		}
	}
	if (notesVal) {
		var full = notesVal;
		var shortTxt = full.length > 80 ? (full.slice(0,77) + '...') : full;
		html += '<div title="' + escapeHtml(full) + '">' + escapeHtml(shortTxt) + '</div>';
	}
	html += '</div>';
	return html;
}

// Function to load bookings from Firebase
function loadBookings() {
  if (!db || !tbody) return;
  
  // Show loading
  tbody.innerHTML = "<tr><td colspan='15' class='text-center'>Loading bookings...</td></tr>";

  db.ref("bookings").on(
    "value",
    function (snapshot) {
    tbody.innerHTML = "";
    var bookings = snapshot.val();

    if (!bookings) {
      tbody.innerHTML = "<tr><td colspan='15' class='text-center'>No bookings found.</td></tr>";
      return;
    }

    Object.keys(bookings).forEach(function (key) {
      var b = bookings[key];
		var subtotal = b.subtotalFare || null;
		var vat = b.vatAmount || null;
		var total = b.fare || null;
		// If only total exists, derive subtotal/vat (assuming 20% VAT)
		if (!subtotal && total) {
			var numTotal = parseFloat(total) || 0;
			var derivedSubtotal = (numTotal / 1.2);
			var derivedVat = numTotal - derivedSubtotal;
			subtotal = derivedSubtotal.toFixed(2);
			vat = derivedVat.toFixed(2);
		}

		// Determine status (persisted) and render select
		var currentStatus = b.status || "Pending";

		var tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${b.bookingID || b.bookingId || "-"}</td>
			<td title="${b.email || ""}">${b.email || "-"}</td>
			<td title="${b.phone || ""}">${b.phone || "-"}</td>
			<td title="${b.pickup || ""}">${b.pickup || "-"}</td>
			<td title="${b.destination || ""}">${b.destination || "-"}</td>
			<td>${b.pickupDate || "-"}</td>
			<td>${b.pickupTime || "-"}</td>
			<td>${b.destinationDate || b.deliveryDate || "-"}</td>
			<td>${b.destinationTime || b.deliveryTime || "-"}</td>
			<td>${b.vehicleType || "-"}</td>
			<td>${formatJobSpecs(b.jobSpecs)}</td>
			<td class="vat-col" style="text-align:right;">£${subtotal || "0.00"}</td>
			<td class="vat-col" style="text-align:right;">£${vat || "0.00"}</td>
			<td class="total-col" style="text-align:right;">£${(total || subtotal ? (total || (parseFloat(subtotal) + parseFloat(vat || 0)).toFixed(2)) : "0.00")}</td>
			<td class="status-col">
				<select class="form-select form-select-sm status-select">
					<option ${currentStatus==="Pending"?"selected":""}>Pending</option>
					<option ${currentStatus==="Enroute Delivery"?"selected":""}>Enroute Delivery</option>
					<option ${currentStatus==="Delivered"?"selected":""}>Delivered</option>
				</select>
			</td>
			<td class="actions-col">
				<div class="btn-group btn-group-sm" role="group">
					<button type="button" class="btn btn-outline-secondary">View</button>
					<button type="button" class="btn btn-outline-primary">Edit</button>
					<button type="button" class="btn btn-outline-danger">Delete</button>
					<a href="pod.html?id=${key}" class="btn btn-success">POD</a>
				</div>
			</td>
		`;
		// Attach change handler to persist status
		var selectEl = tr.querySelector('select.status-select');
		selectEl.addEventListener('change', function(){
			var newStatus = this.value;
			db.ref('bookings/'+key).update({ status: newStatus }).catch(()=>{});
		});
		tbody.appendChild(tr);
    });
  },
  function (error) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-danger text-center">
      Failed to load bookings: ${error?.message || "Unknown error"}
    </td></tr>`;
  }
  );
}

// Keep your existing rate/charge updater
window.updateRates = function updateRates() {
  var carRate = parseFloat(document.getElementById('carRate').value);
  var vanRate = parseFloat(document.getElementById('vanRate').value);
  var truckRate = parseFloat(document.getElementById('truckRate').value);

  var sameDayCharge = parseFloat(document.getElementById('sameDayCharge').value);
  var scheduledCharge = parseFloat(document.getElementById('scheduledCharge').value);

  var vehicleRates = { car: carRate, van: vanRate, truck: truckRate };
  var deliveryCharges = { sameDay: sameDayCharge, scheduled: scheduledCharge };

  localStorage.setItem('vehicleRates', JSON.stringify(vehicleRates));
  localStorage.setItem('deliveryCharges', JSON.stringify(deliveryCharges));

  alert("Vehicle rates and delivery charges updated successfully!");
};
