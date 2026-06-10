/* =========================================
   CAMPUS IMPACT — MAIN JS
   Scroll reveals, nav, Razorpay integration
   ========================================= */

// ---- NAV ----
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- SMOOTH ACTIVE NAV ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navItems.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? '#FF6B00' : '';
  });
});

// ---- RAZORPAY PAYMENT ----
const form = document.getElementById('registrationForm');
const payBtn = document.getElementById('payBtn');
const payBtnText = document.getElementById('payBtnText');
const payLoader = document.getElementById('payLoader');

function showLoader() {
  payBtnText.style.display = 'none';
  payLoader.style.display = 'flex';
  payBtn.disabled = true;
}

function hideLoader() {
  payBtnText.style.display = 'block';
  payLoader.style.display = 'none';
  payBtn.disabled = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    teamName: form.teamName.value.trim(),
    teamLeader: form.teamLeader.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    college: form.college.value.trim(),
    members: {
      member2: form.member2.value.trim(),
      member3: form.member3.value.trim(),
      member4: form.member4.value.trim(),
    },
    department: form.department.value.trim()
  };

  if (!formData.teamName || !formData.teamLeader || !formData.email || !formData.phone || !formData.college) {
    showError('Please fill in all required fields.');
    return;
  }

  if (!form.agree.checked) {
    showError('Please confirm that all members are enrolled college students and agree to the rules.');
    return;
  }

  showLoader();

  try {
    // Create Razorpay order
    const orderRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const orderData = await orderRes.json();

    if (!orderData.success) {
      hideLoader();
      showError(orderData.error || 'Failed to create order. Please try again.');
      return;
    }

    // Launch Razorpay checkout
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Campus Impact',
      description: `Team Registration — ${formData.teamName}`,
      order_id: orderData.orderId,
      image: '/images/logo.png',
      prefill: {
        name: formData.teamLeader,
        email: formData.email,
        contact: formData.phone
      },
      notes: {
        team_name: formData.teamName,
        college: formData.college
      },
      theme: {
        color: '#FF6B00'
      },
      handler: async function (response) {
        // Verify payment on server
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Redirect to success page
            window.location.href = `/success?payment_id=${response.razorpay_payment_id}`;
          } else {
            hideLoader();
            showError('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        } catch (err) {
          hideLoader();
          showError('Verification error. Please contact support.');
        }
      },
      modal: {
        ondismiss: function () {
          hideLoader();
        }
      }
    };

    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
      hideLoader();
      showError('Payment gateway is loading. Please refresh the page and try again.');
      return;
    }

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      hideLoader();
      showError('Payment failed: ' + (response.error.description || 'Unknown error'));
    });

    rzp.open();

  } catch (error) {
    hideLoader();
    showError('Network error. Please check your connection and try again.');
    console.error('Payment error:', error);
  }
});

// ---- MODALS ----
function showSuccess(paymentId) {
  const modal = document.getElementById('successModal');
  document.getElementById('modalPaymentId').textContent = paymentId ? `Payment ID: ${paymentId}` : '';
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('successModal').style.display = 'none';
  form.reset();
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').style.display = 'flex';
}

function closeErrorModal() {
  document.getElementById('errorModal').style.display = 'none';
}

// Close modals on overlay click
document.getElementById('successModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
document.getElementById('errorModal').addEventListener('click', function (e) {
  if (e.target === this) closeErrorModal();
});

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1500;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start) + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ---- PARALLAX SHAPES ----
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('.shape').forEach((shape, i) => {
    const speed = 0.05 * (i + 1);
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
});
