// ─── DARK MODE
function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  localStorage.setItem(
    'theme',
    html.classList.contains('dark') ? 'dark' : 'light'
  );
}
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
document.getElementById('trackPackage').addEventListener('click', trackPackage);
document.getElementById('bookShipment').addEventListener('click', bookShipment);

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

// ─── SCROLL TO TRACK
function scrollToTrack() {
  const val = document.getElementById('heroTrackInput').value.trim();
  if (val) document.getElementById('trackingId').value = val;
  document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
  if (val) setTimeout(trackPackage, 600);
}

// ─── TRACKING
const fakePackages = {
  'SWR-2024-001': {
    status: 'Out for Delivery',
    badge: '🚴 Out for Delivery',
    steps: [
      {
        icon: '✅',
        title: 'Order Booked',
        time: 'Apr 3, 9:00 AM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'Picked Up — Pune Hub',
        time: 'Apr 3, 11:30 AM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'In Transit — Lonavala Sort',
        time: 'Apr 3, 2:00 PM',
        state: 'done',
      },
      {
        icon: '🚴',
        title: 'Out for Delivery — Mumbai',
        time: 'Apr 4, 9:00 AM',
        state: 'active',
      },
      {
        icon: '📦',
        title: 'Delivered',
        time: 'Estimated by 6:00 PM',
        state: 'pending',
      },
    ],
  },
  'SWR-2024-002': {
    status: 'Delivered',
    badge: '✅ Delivered',
    steps: [
      {
        icon: '✅',
        title: 'Order Booked',
        time: 'Apr 1, 8:00 AM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'Picked Up — Delhi Hub',
        time: 'Apr 1, 10:15 AM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'In Transit — Agra Sort',
        time: 'Apr 1, 3:00 PM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'Delivered',
        time: 'Apr 2, 11:45 AM',
        state: 'done',
      },
    ],
  },
  'SWR-2024-003': {
    status: 'In Transit',
    badge: '🚚 In Transit',
    steps: [
      {
        icon: '✅',
        title: 'Order Booked',
        time: 'Apr 4, 7:00 AM',
        state: 'done',
      },
      {
        icon: '✅',
        title: 'Picked Up — Bengaluru Hub',
        time: 'Apr 4, 10:00 AM',
        state: 'done',
      },
      {
        icon: '🚚',
        title: 'In Transit — Chennai Sort',
        time: 'Apr 4, 1:00 PM',
        state: 'active',
      },
      {
        icon: '📦',
        title: 'Out for Delivery',
        time: 'Estimated Apr 5',
        state: 'pending',
      },
      {
        icon: '📦',
        title: 'Delivered',
        time: 'Estimated Apr 5',
        state: 'pending',
      },
    ],
  },
};

function trackPackage() {
  const id = document.getElementById('trackingId').value.trim().toUpperCase();
  const resultEl = document.getElementById('trackResult');

  if (!id) {
    showToast('Please enter a tracking ID');
    return;
  }

  const pkg = fakePackages[id] || fakePackages['SWR-2024-001'];
  const displayId = fakePackages[id] ? id : 'SWR-DEMO';

  document.getElementById('resultId').textContent = displayId;
  document.getElementById('resultBadge').textContent = pkg.badge;

  const timeline = document.getElementById('timeline');
  timeline.innerHTML = pkg.steps
    .map(
      (s) => `
      <div class="timeline-step">
        <div class="step-dot ${s.state}">${s.icon}</div>
        <div class="step-info">
          <div class="step-title">${s.title}</div>
          <div class="step-time">${s.time}</div>
        </div>
      </div>
    `
    )
    .join('');

  resultEl.classList.add('visible');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── QUOTE CALCULATOR
const serviceMult = { sameday: 3.5, express: 2, standard: 1, economy: 0.6 };
const serviceLabel = {
  sameday: 'Same-Day +250%',
  express: 'Express +100%',
  standard: 'Standard',
  economy: 'Economy -40%',
};

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
