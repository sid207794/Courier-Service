// Restore saved preference
(function () {
  const saved = localStorage.getItem('theme');
  if (
    saved === 'dark' ||
    (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // ─── DARK MODE
  function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      html.classList.contains('dark') ? 'dark' : 'light'
    );
  }

  // ─── NAV SCROLL
  window.addEventListener('scroll', () => {
    document
      .getElementById('navbar')
      .classList.toggle('scrolled', window.scrollY > 30);
  });

  // ─── MOBILE MENU
  function openMobileMenu() {
    document.getElementById('mobileMenu').classList.add('open');
  }
  function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
  }

  document
    .getElementById('openMobileMenu')
    .addEventListener('click', openMobileMenu);
  document
    .getElementById('closeMobileMenu')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuLink')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuTrack')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuHow')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuBook')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuTestimonials')
    .addEventListener('click', closeMobileMenu);
  document
    .getElementById('closeMobileMenuContact')
    .addEventListener('click', closeMobileMenu);
  document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
  document
    .getElementById('scrollToTrack')
    .addEventListener('click', scrollToTrack);
  document
    .getElementById('trackPackage')
    .addEventListener('click', trackPackage);
  document
    .getElementById('bookShipment')
    .addEventListener('click', bookShipment);

  // ─── FADE IN OBSERVER
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  // ─── TRACKING
  // ─── TRACKING: reads live from localStorage (populated by admin dashboard)
  // Drop this into your existing dom.js, replacing the old fakePackages + trackPackage block

  const STORAGE_KEY = 'swiftroute_shipments';

  function getShipmentsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function getStatusBadgeText(status) {
    const map = {
      Booked: '🔵 Booked',
      'Picked Up': '🟡 Picked Up',
      'In Transit': '🚚 In Transit',
      'Out for Delivery': '🚴 Out for Delivery',
      Delivered: '✅ Delivered',
    };
    return map[status] || status;
  }

  function getTimelineSteps(shipment) {
    // If admin saved a timeline array, use it; otherwise build from status
    if (shipment.timeline && Array.isArray(shipment.timeline)) {
      return shipment.timeline;
    }
    const statuses = [
      'Booked',
      'Picked Up',
      'In Transit',
      'Out for Delivery',
      'Delivered',
    ];
    const icons = {
      Booked: '📋',
      'Picked Up': '📬',
      'In Transit': '🚚',
      'Out for Delivery': '🚴',
      Delivered: '✅',
    };
    const currentIdx = statuses.indexOf(shipment.status);
    return statuses.map((s, i) => ({
      icon: icons[s],
      title:
        s === 'Booked'
          ? 'Order Booked'
          : s === 'Picked Up'
            ? `Picked Up — ${shipment.location}`
            : s === 'In Transit'
              ? `In Transit — ${shipment.location}`
              : s === 'Out for Delivery'
                ? `Out for Delivery — ${shipment.location}`
                : 'Delivered',
      time:
        i < currentIdx
          ? 'Completed'
          : i === currentIdx
            ? 'Current status'
            : `Expected by ${shipment.date}`,
      state: i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending',
    }));
  }

  function trackPackage() {
    const rawId = document.getElementById('trackingId').value.trim();
    const id = rawId.toUpperCase();
    const resultEl = document.getElementById('trackResult');

    // Hide result on empty
    if (!id) {
      showToast('Please enter a tracking ID');
      resultEl.classList.remove('visible');
      return;
    }

    const shipments = getShipmentsFromStorage();
    const shipment = shipments.find((s) => s.id.toUpperCase() === id);

    if (!shipment) {
      // ── NOT FOUND: show error state
      document.getElementById('resultId').textContent = id;
      document.getElementById('resultBadge').textContent = '❌ Not Found';
      document.getElementById('resultBadge').style.background =
        'rgba(232,93,58,0.1)';
      document.getElementById('resultBadge').style.color = '#e85d3a';

      document.getElementById('timeline').innerHTML = `
      <div style="
        text-align:center;
        padding:2rem 1rem;
        color:#8a8070;
      ">
        <div style="font-size:2.5rem;margin-bottom:0.8rem">🔍</div>
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:#0d0d0d;margin-bottom:0.4rem">
          No shipment found
        </div>
        <div style="font-size:0.88rem;line-height:1.6">
          We couldn't find a shipment with tracking ID <strong style="color:#0d0d0d">${id}</strong>.<br>
          Please double-check your tracking ID and try again.
        </div>
        <div style="margin-top:1.2rem;font-size:0.8rem;background:rgba(201,74,43,0.07);border-radius:8px;padding:0.7rem 1rem;display:inline-block">
          💡 Try: SWR-2024-001 · SWR-2024-002 · SWR-2024-003
        </div>
      </div>`;

      resultEl.classList.add('visible');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // ── FOUND: render shipment details
    // Reset badge style
    const badge = document.getElementById('resultBadge');
    badge.style.background = '';
    badge.style.color = '';

    document.getElementById('resultId').textContent = shipment.id;
    badge.textContent = getStatusBadgeText(shipment.status);

    const steps = getTimelineSteps(shipment);

    document.getElementById('timeline').innerHTML = `
    <!-- Shipment summary -->
    <div style="
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:0.8rem;
      margin-bottom:1.5rem;
      padding-bottom:1.2rem;
      border-bottom:1px solid rgba(13,13,13,0.08);
    ">
      <div>
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Customer</div>
        <div style="font-size:0.9rem;font-weight:500">${shipment.customer}</div>
      </div>
      <div>
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Service</div>
        <div style="font-size:0.9rem;font-weight:500">${shipment.service || 'Standard'}</div>
      </div>
      <div>
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Current Location</div>
        <div style="font-size:0.9rem;font-weight:500">📍 ${shipment.location}</div>
      </div>
      <div>
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Expected Delivery</div>
        <div style="font-size:0.9rem;font-weight:500">📅 ${shipment.date}</div>
      </div>
      ${
        shipment.delivery
          ? `
      <div style="grid-column:1/-1">
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Delivery Address</div>
        <div style="font-size:0.88rem;color:#0d0d0d">${shipment.delivery}</div>
      </div>`
          : ''
      }
      ${
        shipment.notes
          ? `
      <div style="grid-column:1/-1">
        <div style="font-size:0.72rem;color:#8a8070;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.3rem">Notes</div>
        <div style="font-size:0.85rem;color:#8a8070">${shipment.notes}</div>
      </div>`
          : ''
      }
    </div>

    <!-- Timeline header -->
    <div style="font-family:'Syne',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8a8070;margin-bottom:1rem">Shipment Timeline</div>

    <!-- Timeline steps -->
    ${steps
      .map(
        (s) => `
      <div class="timeline-step">
        <div class="step-dot ${s.state}">${s.icon || (s.state === 'done' ? '✅' : s.state === 'active' ? '🔵' : '⬜')}</div>
        <div class="step-info">
          <div class="step-title">${s.title}</div>
          <div class="step-time">${s.time}</div>
        </div>
      </div>
    `
      )
      .join('')}
  `;

    resultEl.classList.add('visible');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Hero mini-track button handler
  function scrollToTrack() {
    const val = document.getElementById('heroTrackInput').value.trim();
    if (val) document.getElementById('trackingId').value = val;
    document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
    if (val) setTimeout(trackPackage, 600);
  }

  // Export if using modules (webpack)
  // If using webpack, uncomment these:
  //export { trackPackage, scrollToTrack };

  // ─── QUOTE CALCULATOR
  const serviceMult = { sameday: 3.5, express: 2, standard: 1, economy: 0.6 };
  const serviceLabel = {
    sameday: 'Same-Day +250%',
    express: 'Express +100%',
    standard: 'Standard',
    economy: 'Economy -40%',
  };

  // ─── QUOTE CALCULATOR TRIGGERS
  ['pickupCity', 'dropCity', 'weight'].forEach((id) => {
    document.getElementById(id).addEventListener('input', calcQuote);
  });
  document.getElementById('serviceType').addEventListener('change', calcQuote);

  function calcQuote() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const service = document.getElementById('serviceType').value;
    const pickup = document.getElementById('pickupCity').value.trim();
    const drop = document.getElementById('dropCity').value.trim();

    if (!weight || !service || !pickup || !drop) {
      ['qBase', 'qWeight', 'qService', 'qGst', 'qTotal'].forEach(
        (id) => (document.getElementById(id).textContent = '₹—')
      );
      return;
    }

    const base = 80;
    const weightCharge = Math.ceil(weight) * 35;
    const multiplier = serviceMult[service] || 1;
    const subtotal = (base + weightCharge) * multiplier;
    const serviceSurcharge = subtotal - (base + weightCharge);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    document.getElementById('qBase').textContent = '₹' + base;
    document.getElementById('qWeight').textContent =
      '₹' + weightCharge.toFixed(0);
    document.getElementById('qService').textContent =
      '₹' + serviceSurcharge.toFixed(0);
    document.getElementById('qGst').textContent = '₹' + gst.toFixed(0);
    document.getElementById('qTotal').textContent = '₹' + total.toFixed(0);
  }

  // ─── BOOK
  function bookShipment() {
    const name = document.getElementById('senderName').value.trim();
    const pickup = document.getElementById('pickupCity').value.trim();
    const drop = document.getElementById('dropCity').value.trim();
    const weight = document.getElementById('weight').value;
    const service = document.getElementById('serviceType').value;
    const phone = document.getElementById('receiverPhone').value.trim();

    if (!name || !pickup || !drop || !weight || !service || !phone) {
      showToast('⚠️ Please fill in all fields');
      return;
    }

    const id = 'SWR-' + Date.now().toString().slice(-6);
    showToast(`🎉 Booked! Your tracking ID: ${id}`, 4000);

    // Reset
    [
      'senderName',
      'pickupCity',
      'dropCity',
      'weight',
      'receiverPhone',
      'deliveryAddr',
    ].forEach((id) => (document.getElementById(id).value = ''));
    document.getElementById('serviceType').value = '';
    calcQuote();
  }

  // ─── TOAST
  function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ─── SMOOTH SCROLL FOR ALL ANCHORS
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
