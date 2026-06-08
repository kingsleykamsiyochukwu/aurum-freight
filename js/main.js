// ================================
// AURUM FREIGHT — MAIN JS
// ================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.padding = '12px 0';
    navbar.style.borderBottomColor = 'rgba(201, 168, 76, 0.4)';
  } else {
    navbar.style.padding = '20px 0';
    navbar.style.borderBottomColor = 'rgba(201, 168, 76, 0.2)';
  }
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.left = '0';
    navLinks.style.width = '100%';
    navLinks.style.background = '#0a0a0a';
    navLinks.style.padding = '20px 30px';
    navLinks.style.gap = '20px';
  });
}

// ================================
// TRACKING SYSTEM
// ================================
const trackBtnEl = document.querySelector('.btn-track');
const trackInputEl = document.querySelector('.tracking-form input');
const trackingSection = document.querySelector('.tracking');

function getStatusColor(status) {
  if (status === 'delivered') return '#2ecc71';
  if (status === 'in-transit') return '#c9a84c';
  if (status === 'pending') return '#888888';
  return '#c9a84c';
}

function getStatusLabel(status) {
  if (status === 'delivered') return 'DELIVERED';
  if (status === 'in-transit') return 'IN TRANSIT';
  if (status === 'pending') return 'PENDING PICKUP';
  return 'UNKNOWN';
}

function buildTrackingResult(data, trackingNumber) {
  const completedSteps = data.steps.filter(s => s.done).length;
  const progressPercent = Math.round((completedSteps / data.steps.length) * 100);

  const stepsHTML = data.steps.map((step, index) => `
    <div class="track-step ${step.done ? 'done' : 'pending'}">
      <div class="step-icon">
        ${step.done ? `<i class='bx bx-check'></i>` : `<span>${index + 1}</span>`}
      </div>
      <div class="step-details">
        <h4>${step.label}</h4>
        <p>${step.location}</p>
        <span>${step.date} ${step.time !== 'Pending' ? '— ' + step.time : ''}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="tracking-result">
      <div class="tracking-result-header">
        <div>
          <p class="track-number">Tracking Number: <strong>${trackingNumber}</strong></p>
          <p class="track-service">${data.service} · ${data.weight}</p>
        </div>
        <div class="track-status-badge" style="background: ${getStatusColor(data.status)}">
          ${getStatusLabel(data.status)}
        </div>
      </div>
      <div class="tracking-route">
        <div class="route-point">
          <i class='bx bx-map'></i>
          <div><p>From</p><h4>${data.sender}</h4></div>
        </div>
        <div class="route-line">
          <div class="route-progress" style="width: ${progressPercent}%"></div>
          <i class='bx bxs-plane route-plane'></i>
        </div>
        <div class="route-point">
          <i class='bx bx-map-pin'></i>
          <div><p>To</p><h4>${data.destination}</h4></div>
        </div>
      </div>
      <p class="est-delivery">
        <i class='bx bx-calendar'></i>
        Estimated Delivery: <strong>${data.estimatedDelivery}</strong>
      </p>
      <div class="tracking-steps">${stepsHTML}</div>
    </div>
  `;
}

if (trackBtnEl && trackInputEl) {
  trackBtnEl.addEventListener('click', async () => {
    const number = trackInputEl.value.trim().toUpperCase();
    const oldResult = document.querySelector('.tracking-result');
    if (oldResult) oldResult.remove();

    if (!number) {
      alert('Please enter a tracking number.');
      return;
    }

    trackBtnEl.textContent = 'Searching...';

    try {
    const response = await fetch(`https://aurum-freight-production.up.railway.app/api/track/${number}`);
      if (!response.ok) {
        const notFound = document.createElement('div');
        notFound.className = 'tracking-result not-found';
        notFound.innerHTML = `
          <i class='bx bx-search-alt'></i>
          <h3>No Shipment Found</h3>
          <p>Tracking number <strong>${number}</strong> not found.</p>
          <p>Try: AF-2024-00123 · AF-2024-00456 · AF-2024-00789</p>
        `;
        trackingSection.appendChild(notFound);
        trackBtnEl.textContent = 'Track Now';
        return;
      }

      const data = await response.json();
      const resultHTML = buildTrackingResult(data, number);
      const resultDiv = document.createElement('div');
      resultDiv.innerHTML = resultHTML;
      trackingSection.appendChild(resultDiv.firstElementChild);
      document.querySelector('.tracking-result').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      alert('Cannot connect to server. Make sure node server.js is running.');
    }

    trackBtnEl.textContent = 'Track Now';
  });
}