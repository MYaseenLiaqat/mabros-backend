(function(){
  var db = null;
  var firebaseReady = false;

  
  function waitForFirebase() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      try {
        db = firebase.database();
        firebaseReady = true;
        console.log('Track.js: Firebase is ready');
      } catch (error) {
        console.error('Error accessing Firebase database:', error);
      }
    } else {
      setTimeout(waitForFirebase, 100);
    }
  }
  
  
  waitForFirebase();

  function renderStatusBadge(status){
    var normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'pending') return 'bg-secondary';
    if (normalized === 'enroute' || normalized === 'enroute delivery' || normalized === 'in transit') return 'bg-info text-dark';
    if (normalized === 'delivered') return 'bg-success';
    return 'bg-secondary';
  }

  function formatMoney(v){
    var n = parseFloat(v || 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  function showNotFound(message){
    var el = document.getElementById('notFound');
    el.textContent = message || "We couldn't find a booking with that ID. Please check and try again.";
    document.getElementById('resultCard').classList.add('d-none');
    el.classList.remove('d-none');
  }

  function showResult(b){
    document.getElementById('notFound').classList.add('d-none');

    var subtotal = b.subtotalFare || null;
    var vat = b.vatAmount || null;
    var total = b.fare || null;
    if (!subtotal && total) {
      var t = parseFloat(total) || 0;
      var s = t / 1.2;
      subtotal = s.toFixed(2);
      vat = (t - s).toFixed(2);
    }

    var status = b.status || b.Status || 'Pending';
    var badge = document.getElementById('statusBadge');
    badge.textContent = status;
    badge.className = 'badge ' + renderStatusBadge(status);

    var html = `
      <div class="row g-2">
        <div class="col-md-6">
          <div><strong>Booking ID:</strong> ${b.bookingID || b.bookingId || '-'}</div>
          <div><strong>Email:</strong> ${b.email || '-'}</div>
          <div><strong>Pickup:</strong> ${b.pickup || '-'}</div>
          <div><strong>Destination:</strong> ${b.destination || '-'}</div>
        </div>
        <div class="col-md-6">
          <div><strong>Status:</strong> ${status}</div>
          <div><strong>Pickup:</strong> ${b.pickupDate || '-'} ${b.pickupTime || ''}</div>
          <div><strong>Delivery:</strong> ${(b.destinationDate || b.deliveryDate || '-')} ${(b.destinationTime || b.deliveryTime || '')}</div>
          <div><strong>Subtotal:</strong> £${formatMoney(subtotal)}</div>
          <div><strong>VAT (20%):</strong> £${formatMoney(vat)}</div>
          <div><strong>Total:</strong> £${formatMoney(total)}</div>
        </div>
      </div>`;
    document.getElementById('trackResult').innerHTML = html;
    document.getElementById('resultCard').classList.remove('d-none');
  }

  document.getElementById('trackForm').addEventListener('submit', function(e){
    e.preventDefault();
    var bookingId = (document.getElementById('trackBookingId').value || '').trim();
    if (!bookingId) return;

    
    if (!firebaseReady || !db) {
      showNotFound('System is still loading. Please wait a moment and try again.');
      return;
    }

    var bookingsRef = db.ref('bookings');

    function findByChild(child){
      return bookingsRef.orderByChild(child).equalTo(bookingId).once('value');
    }

    
    findByChild('bookingID')
      .then(function(snap){
        if (snap && snap.val()) return snap.val();
        return findByChild('bookingId').then(function(s2){ return s2 && s2.val(); });
      })
      .then(function(val){
        if (val) {
          var key = Object.keys(val)[0];
          showResult(val[key]);
          return;
        }
        
        return bookingsRef.once('value').then(function(all){
          var data = all.val() || {};
          var target = bookingId.toLowerCase();
          var found = null;
          Object.keys(data).some(function(k){
            var b = data[k] || {};
            var idA = (b.bookingID || '').trim().toLowerCase();
            var idB = (b.bookingId || '').trim().toLowerCase();
            if (idA === target || idB === target) { found = b; return true; }
            return false;
          });
          if (found) showResult(found); else showNotFound();
        });
      })
      .catch(function(err){
        
        console.error('Track error:', err);
        if (err && err.code === 'PERMISSION_DENIED') {
          showNotFound('Tracking is temporarily unavailable. Please try again later.');
        } else {
          showNotFound();
        }
      });
  });
})();
