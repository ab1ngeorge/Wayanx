/* ========================================
   WayanX — Shared JavaScript
   ======================================== */

(function () {
  'use strict';

  // ---- Cart State ----
  const cart = {
    items: [],
    get count() { return this.items.length; },
    get total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
    add(name, price) {
      const existing = this.items.find(i => i.name === name);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ name, price, qty: 1 });
      }
      this.save();
      this.updateUI();
    },
    save() {
      try { sessionStorage.setItem('wayanx_cart', JSON.stringify(this.items)); } catch (e) {}
    },
    load() {
      try {
        const d = sessionStorage.getItem('wayanx_cart');
        if (d) this.items = JSON.parse(d);
      } catch (e) {}
      this.updateUI();
    },
    updateUI() {
      // Badge counts
      document.querySelectorAll('.badge-count').forEach(el => {
        el.textContent = this.count;
        if (this.count > 0) {
          el.classList.add('visible');
          el.classList.add('pop');
          setTimeout(() => el.classList.remove('pop'), 400);
        } else {
          el.classList.remove('visible');
        }
      });
      // Floating cart
      const fc = document.querySelector('.floating-cart');
      if (fc) {
        if (this.count > 0) {
          fc.classList.add('visible');
          fc.querySelector('.fc-count').textContent = this.count + ' Item' + (this.count > 1 ? 's' : '') + ' in Cart';
          fc.querySelector('.fc-total').textContent = '$' + this.total.toFixed(2);
        } else {
          fc.classList.remove('visible');
        }
      }
    }
  };

  // ---- Scroll-Reveal ----
  function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  // ---- Header Scroll Shadow ----
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Add-to-Cart Buttons ----
  function initCartButtons() {
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.dataset.addCart;
        const price = parseFloat(btn.dataset.price) || 0;
        cart.add(name, price);
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 600);
      });
    });
  }

  // ---- Wishlist Toggle ----
  function initWishlist() {
    document.querySelectorAll('.product-card-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 200);
      });
    });
  }

  // ---- Weight Selector ----
  function initWeightSelector() {
    document.querySelectorAll('.weight-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // ---- Quantity Selector ----
  function initQtySelector() {
    const qtyEl = document.querySelector('.qty-value');
    if (!qtyEl) return;
    let qty = 1;
    document.querySelector('.qty-minus')?.addEventListener('click', () => {
      if (qty > 1) { qty--; qtyEl.textContent = qty; }
    });
    document.querySelector('.qty-plus')?.addEventListener('click', () => {
      qty++;
      qtyEl.textContent = qty;
    });
  }

  // ---- Newsletter ----
  function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    const success = document.querySelector('.newsletter-success');
    if (!form || !success) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      success.classList.add('show');
    });
  }

  // ---- Contact Form ----
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Sent!';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  }

  // ---- Filter Pills ----
  function initFilters() {
    document.querySelectorAll('.filter-pill:not(.muted)').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
      });
    });
  }

  // ---- Active Nav ----
  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href && page.includes(href.replace('./',''))) {
        item.classList.add('active');
      }
    });
  }

  // ---- Init ----
  function init() {
    cart.load();
    initReveal();
    initHeaderScroll();
    initCartButtons();
    initWishlist();
    initWeightSelector();
    initQtySelector();
    initNewsletter();
    initContactForm();
    initFilters();
    setActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
