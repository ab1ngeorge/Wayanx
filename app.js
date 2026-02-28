/* ========================================
   WayanX — Shared JavaScript
   Premium Visual Enhancement Edition
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
      try { sessionStorage.setItem('wayanx_cart', JSON.stringify(this.items)); } catch (e) { }
    },
    load() {
      try {
        const d = sessionStorage.getItem('wayanx_cart');
        if (d) this.items = JSON.parse(d);
      } catch (e) { }
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

  // ---- Scroll Progress Bar ----
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = progress + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Toast Notification System ----
  function showToast(message, icon) {
    icon = icon || 'check_circle';
    let toast = document.getElementById('wayanx-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wayanx-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="material-symbols-outlined">' + icon + '</span> ' + message;
    // Reset animation
    toast.classList.remove('show');
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

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
        showToast(name + ' added to cart!');
      });
    });
  }

  // ---- Wishlist Toggle ----
  function initWishlist() {
    document.querySelectorAll('.product-card-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasActive = btn.classList.contains('active');
        btn.classList.toggle('active');
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 200);
        if (!wasActive) {
          showToast('Added to wishlist', 'favorite');
        }
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
      showToast('Subscribed successfully!', 'mark_email_read');
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
      showToast('Message sent successfully!', 'send');
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
      if (href && page.includes(href.replace('./', ''))) {
        item.classList.add('active');
      }
    });
  }

  // ---- Animated Counters ----
  function initAnimatedCounters() {
    const statEls = document.querySelectorAll('.stat-item-value, .stat-value');
    if (!statEls.length) return;

    function animateCounter(el) {
      const text = el.textContent.trim();
      // Extract numeric part, prefix, and suffix
      const match = text.match(/^([^0-9]*)(\d[\d,.]*)(.*)$/);
      if (!match) return;
      const prefix = match[1];
      const numStr = match[2].replace(/,/g, '');
      const suffix = match[3];
      const target = parseFloat(numStr);
      if (isNaN(target)) return;
      const isInt = Number.isInteger(target) && !numStr.includes('.');
      const duration = 1200;
      const start = performance.now();
      el.dataset.counted = 'true';

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        if (isInt) {
          el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
        } else {
          el.textContent = prefix + current.toFixed(numStr.split('.')[1]?.length || 0) + suffix;
        }
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = prefix + (isInt ? Math.round(target).toLocaleString() : target) + suffix;
          el.classList.add('counting');
          setTimeout(() => el.classList.remove('counting'), 300);
        }
      }
      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => observer.observe(el));
  }

  // ---- Smooth Image Loading ----
  function initImageLoading() {
    const imgs = document.querySelectorAll(
      '.product-card-img img, .category-card img, .farm-card-img img, .related-item-img img'
    );
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
      }
    });
  }

  // ---- Page Transitions ----
  function initPageTransitions() {
    // Only intercept local navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      // Skip external links, anchors, tel/mailto, javascript, blank targets
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') ||
        href.startsWith('mailto:') || href.startsWith('javascript:') ||
        link.target === '_blank') return;
      // Skip non-HTML links
      if (!href.endsWith('.html') && !href.endsWith('/') && href.includes('.')) return;

      e.preventDefault();
      const wrapper = document.querySelector('.page-wrapper');
      if (wrapper) {
        wrapper.classList.add('page-exit');
        setTimeout(() => {
          window.location.href = href;
        }, 280);
      } else {
        window.location.href = href;
      }
    });
  }

  // ---- Mobile Navigation Drawer ----
  function initNavDrawer() {
    const menuBtn = document.querySelector('.site-header .header-btn[aria-label="Menu"]');
    if (!menuBtn) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-drawer-overlay';
    document.body.appendChild(overlay);

    // Create drawer
    const drawer = document.createElement('nav');
    drawer.className = 'nav-drawer';
    drawer.innerHTML = `
      <div class="nav-drawer-header">
        <img src="logo.jpg" alt="WayanX" style="height:36px;width:auto;" />
        <button class="nav-drawer-close" aria-label="Close menu">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="nav-drawer-links">
        <a href="index.html" class="nav-drawer-link">
          <span class="material-symbols-outlined">home</span> Home
        </a>
        <a href="shop.html" class="nav-drawer-link">
          <span class="material-symbols-outlined">storefront</span> Shop
        </a>
        <a href="wayanad.html" class="nav-drawer-link">
          <span class="material-symbols-outlined">landscape</span> Wayanad
        </a>
        <a href="about.html" class="nav-drawer-link">
          <span class="material-symbols-outlined">info</span> About
        </a>
        <a href="contact.html" class="nav-drawer-link">
          <span class="material-symbols-outlined">mail</span> Contact
        </a>
      </div>
      <div class="nav-drawer-footer">
        <p style="font-size:0.75rem;color:var(--text-muted);">© 2024 WayanX Foods Pvt.</p>
      </div>
    `;
    document.body.appendChild(drawer);

    // Highlight active link
    const page = window.location.pathname.split('/').pop() || 'index.html';
    drawer.querySelectorAll('.nav-drawer-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && page.includes(href.replace('./', ''))) {
        link.classList.add('active');
      }
    });

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });

    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.nav-drawer-close').addEventListener('click', closeDrawer);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  // ---- Back to Top Button ----
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<span class="material-symbols-outlined">keyboard_arrow_up</span>';
    document.body.appendChild(btn);

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          btn.classList.toggle('visible', window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Hero Parallax ----
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    // Skip on mobile for performance
    if (window.innerWidth < 768) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const rate = scrolled * 0.35;
          hero.style.backgroundPositionY = 'calc(center + ' + rate + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Product Card Tilt (Desktop Only) ----
  function initCardTilt() {
    if (window.innerWidth < 768) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.product-card').forEach(card => {
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px) scale(1.01)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease';
        setTimeout(() => card.style.transition = '', 400);
      });
    });
  }

  // ---- Init ----
  function init() {
    cart.load();
    initScrollProgress();
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
    initAnimatedCounters();
    initImageLoading();
    initPageTransitions();
    initNavDrawer();
    initBackToTop();
    initHeroParallax();
    initCardTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
