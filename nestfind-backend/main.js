/* =============================================================
   main.js  —  NestFind  |  jQuery 3.7 + Vanilla JS
============================================================= */

$(document).ready(function () {

  /* ===========================================================
     §1  NAVBAR — Mobile Hamburger Toggle
  =========================================================== */
  if (!$('.nav-hamburger').length) {
    $('.nav-inner').append(
      '<button class="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>'
    );
  }
  $('#scrollTop').hide();

  $(document).on('click', '.nav-hamburger', function () {
    var open = $(this).hasClass('open');
    $(this).toggleClass('open').attr('aria-expanded', String(!open));
    $('.nav-links, .nav-actions').toggleClass('nav-open');
  });

  $(document).on('click', '.nav-link', function () {
    $('.nav-links, .nav-actions').removeClass('nav-open');
    $('.nav-hamburger').removeClass('open').attr('aria-expanded', 'false');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.navbar').length) {
      $('.nav-links, .nav-actions').removeClass('nav-open');
      $('.nav-hamburger').removeClass('open').attr('aria-expanded', 'false');
    }
  });


  /* ===========================================================
     §2  NAVBAR — Shrink on scroll + scroll-to-top visibility
  =========================================================== */
  window.addEventListener('scroll', function () {
    var nav = document.querySelector('.navbar');
    if (nav) nav.classList.toggle('navbar-scrolled', window.scrollY > 60);
    if (window.scrollY > 300) { $('#scrollTop').fadeIn(300); }
    else                       { $('#scrollTop').fadeOut(300); }
  }, { passive: true });

  $(document).on('click', '#scrollTop', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });


  /* ===========================================================
     §3  HERO IMAGE SLIDER  (index.html)
  =========================================================== */
  var heroImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80'
  ];
  var heroIdx = 0;
  var $hero   = $('.hero');

  if ($hero.length) {
    $hero.css({
      backgroundImage    : 'url(' + heroImages[0] + ')',
      backgroundSize     : 'cover',
      backgroundPosition : 'center',
      backgroundRepeat   : 'no-repeat',
      position           : 'relative'
    });

    var dotHTML = heroImages.map(function (_, i) {
      return '<button class="slider-dot' + (i === 0 ? ' active' : '') +
             '" data-idx="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>';
    }).join('');
    $hero.append('<div class="slider-dots">' + dotHTML + '</div>');

    function changeHero(idx) {
      heroIdx = (idx + heroImages.length) % heroImages.length;
      $hero.css('backgroundImage', 'url(' + heroImages[heroIdx] + ')');
      $('.slider-dot').removeClass('active').eq(heroIdx).addClass('active');
    }

    var heroTimer = setInterval(function () { changeHero(heroIdx + 1); }, 5000);
    $(document).on('click', '.slider-dot', function () {
      clearInterval(heroTimer);
      changeHero(parseInt($(this).data('idx'), 10));
    });
  }


  /* ===========================================================
     §4  HERO SEARCH  (index.html)
  =========================================================== */
  function filterCardsByQuery(q) {
    if (!q) { $('.prop-card').show(); return; }
    $('.prop-card').each(function () {
      $(this).toggle($(this).text().toLowerCase().includes(q));
    });
  }

  $(document).on('input', '.hero-search input', function () {
    filterCardsByQuery($(this).val().toLowerCase().trim());
  });
  $(document).on('click', '.btn-search', function () {
    var q = $('.hero-search input').val().toLowerCase().trim();
    filterCardsByQuery(q);
    if (q) showToast('Showing results for "' + q + '"', 'info');
  });
  $(document).on('keydown', '.hero-search input', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); $('.btn-search').trigger('click'); }
  });


  /* ===========================================================
     §5  COUNTER ANIMATION  (.stat-num)
  =========================================================== */
  var statNums = document.querySelectorAll('.stat-num');
  if (statNums.length) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { cObs.observe(el); });
  }

  function animateCounter(el) {
    var raw = el.textContent.trim();
    var suffix = raw.replace(/[\d.]/g, '');
    var target = parseFloat(raw) || 0;
    var duration = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(p * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  /* ===========================================================
     §6  SCROLL REVEAL
  =========================================================== */
  var revealEls = document.querySelectorAll('.prop-card, .feat-card, .sec-header, .auth-box');
  if (revealEls.length) {
    revealEls.forEach(function (el) { el.classList.add('reveal-hidden'); });
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          rObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { rObs.observe(el); });
  }


  /* ===========================================================
     §7  WISHLIST HEART TOGGLE
     ─────────────────────────────────────────────────────────
     PROBLEM SOLVED:
     • On index.html the entire .prop-card is an <a> tag.
       Clicking anywhere inside navigates away — including the
       heart div. Fix: stopPropagation + preventDefault on the
       heart click so the parent <a> never fires.
     • .prop-wishlist is a <div> in the HTML, so pointer-events
       must be set to auto and z-index must be above the overlay.
  =========================================================== */
  var wishlist = {};
  try { wishlist = JSON.parse(localStorage.getItem('nf_wishlist') || '{}'); } catch (e) {}

  function getPropId($card) {
    var id = $card.data('prop-id');
    if (!id) {
      id = ($card.find('.prop-title').text().trim().replace(/\s+/g, '_')) || ('prop_' + Date.now());
      $card.attr('data-prop-id', id);
    }
    return id;
  }

  function paintHearts() {
    $('.prop-wishlist').each(function () {
      var id = getPropId($(this).closest('.prop-card'));
      $(this).text(wishlist[id] ? '\u2764\ufe0f' : '\ud83e\udd0d');
      $(this).toggleClass('wished', !!wishlist[id]);
    });
  }
  paintHearts();

  /* Use mousedown instead of click so we can cancel before
     the parent <a> href fires on mouseup/click */
  $(document).on('click', '.prop-wishlist', function (e) {
    e.preventDefault();    // stop parent <a> from navigating
    e.stopPropagation();   // stop event reaching the card link

    var $btn = $(this);
    var id   = getPropId($btn.closest('.prop-card'));

    if (wishlist[id]) {
      delete wishlist[id];
      $btn.text('\ud83e\udd0d').removeClass('wished');
      showToast('Removed from Wishlist', 'info');
    } else {
      wishlist[id] = true;
      $btn.text('\u2764\ufe0f').addClass('wished heart-pop');
      setTimeout(function () { $btn.removeClass('heart-pop'); }, 400);
      showToast('Added to Wishlist \u2764\ufe0f', 'success');
    }
    try { localStorage.setItem('nf_wishlist', JSON.stringify(wishlist)); } catch (e) {}
  });


  /* ===========================================================
     §8  VIEW DETAILS OVERLAY CLICK
     ─────────────────────────────────────────────────────────
     PROBLEM SOLVED:
     • On buy.html & rent.html cards are plain <div>, not <a>.
       Clicking the "View Details" overlay does nothing.
     • On index.html cards ARE <a> tags — overlay click already
       navigates (good), but we enhance it visually.
     • We read the href from the nearest "Buy Now" / "Rent Now"
       button inside the same card, or fall back to buy/rent page.
  =========================================================== */
  $(document).on('click', '.prop-overlay, .view-tag', function (e) {
    e.stopPropagation();

    var $card = $(this).closest('.prop-card');

    // If the card itself is an <a>, follow its href
    if ($card.is('a') && $card.attr('href')) {
      window.location.href = $card.attr('href');
      return;
    }

    // Otherwise find the action link inside the card
    var $actionLink = $card.find('a[href]').filter(function () {
      return !$(this).hasClass('prop-wishlist');
    }).first();

    if ($actionLink.length) {
      window.location.href = $actionLink.attr('href');
    } else {
      // Generic fallback based on badge text
      var badge = $card.find('.prop-badge').text().toLowerCase();
      window.location.href = badge.includes('rent') ? 'rent.html' : 'buy.html';
    }
  });

  /* Prevent overlay click from triggering card-level <a> navigation
     a second time when the card IS an anchor */
  $(document).on('click', '.prop-card a', function (e) {
    if ($(e.target).closest('.prop-wishlist').length) {
      e.preventDefault();
      e.stopPropagation();
    }
  });


  /* ===========================================================
     §9  FILTER CHIPS  (buy.html & rent.html)
  =========================================================== */
  $(document).on('click', '.chip', function () {
    $(this).closest('.filter-bar').find('.chip').removeClass('active');
    $(this).addClass('active');
    applyChipFilter();
  });

  function applyChipFilter() {
    var active = $('.chip.active').text().trim();
    var filters = {
      'All'                        : function ()  { return true; },
      'All Types'                  : function ()  { return true; },
      'Apartment'                  : function (c) { return c.includes('apartment') || (c.includes('bhk') && !c.includes('villa')); },
      'Villa'                      : function (c) { return c.includes('villa') || c.includes('row house'); },
      'Plot/Land'                  : function (c) { return c.includes('plot') || c.includes('land'); },
      'Studio'                     : function (c) { return c.includes('studio'); },
      '1 BHK'                      : function (c) { return /\b1(\.\d)?\s*bhk\b/.test(c); },
      '2 BHK'                      : function (c) { return /\b2(\.\d)?\s*bhk\b/.test(c); },
      '3 BHK'                      : function (c) { return /\b3(\.\d)?\s*bhk\b/.test(c); },
      '4+ BHK'                     : function (c) { return /\b[4-9](\.\d)?\s*bhk\b/.test(c); },
      'Furnished'                  : function (c) { return c.includes('furnished') && !c.includes('semi') && !c.includes('unfurnished'); },
      'Semi-Furnished'             : function (c) { return c.includes('semi-furnished') || c.includes('semi furnished'); },
      'Unfurnished'                : function (c) { return c.includes('unfurnished'); },
      'Bachelors OK'               : function (c) { return c.includes('bachelor'); },
      'Under \u20b930L'            : function (c) { return priceInLakhs(c) < 30; },
      '\u20b930L\u2013\u20b975L'   : function (c) { var p = priceInLakhs(c); return p >= 30 && p <= 75; },
      '\u20b975L\u2013\u20b91.5Cr' : function (c) { var p = priceInLakhs(c); return p > 75  && p <= 150; },
      '\u20b91.5Cr+'               : function (c) { return priceInLakhs(c) > 150; },
      'Under \u20b950L'            : function (c) { return priceInLakhs(c) < 50; },
      '\u20b950L\u2013\u20b91Cr'   : function (c) { var p = priceInLakhs(c); return p >= 50 && p <= 100; },
      '\u20b91Cr+'                 : function (c) { return priceInLakhs(c) > 100; },
      'Under \u20b915K'            : function (c) { return monthlyRent(c) < 15000; },
      '\u20b915K\u2013\u20b935K'   : function (c) { var r = monthlyRent(c); return r >= 15000 && r <= 35000; },
      '\u20b935K+'                 : function (c) { return monthlyRent(c) > 35000; },
      'Ready to Move'              : function (c) { return c.includes('ready'); },
      'New Launch'                 : function (c) { return c.includes('launch') || c.includes('new'); }
    };
    var fn = filters[active] || function () { return true; };
    $('.prop-card').each(function () {
      $(this).toggle(fn($(this).text().toLowerCase()));
    });
  }

  function priceInLakhs(text) {
    var m = text.match(/\u20b9([\d,]+)/);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) / 100000 : 0;
  }
  function monthlyRent(text) {
    var m = text.match(/\u20b9([\d,]+)\s*\/month/);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
  }


  /* ===========================================================
     §10  LOAD MORE  (buy.html & rent.html)
  =========================================================== */
  (function initLoadMore() {
    var $cards = $('.props-grid .prop-card');
    if ($cards.length <= 6) return;
    $cards.slice(6).addClass('card-hidden').hide();
    $('a').filter(function () { return /load more/i.test($(this).text()); })
          .attr('href', '#').addClass('load-more-btn');
    updateResultCount();
  })();

  $(document).on('click', '.load-more-btn', function (e) {
    e.preventDefault();
    var $hidden = $('.prop-card.card-hidden');
    $hidden.slice(0, 3).each(function () {
      $(this).removeClass('card-hidden').hide().fadeIn(400);
    });
    if (!$('.prop-card.card-hidden').length) {
      $(this).text('No More Properties').prop('disabled', true).css('opacity', 0.6);
    }
    updateResultCount();
  });

  function updateResultCount() {
    var visible = $('.prop-card:visible').length;
    $('.result-count strong').text(visible.toLocaleString('en-IN'));
  }


  /* ===========================================================
     §11  LOGIN FORM  —  AJAX
  =========================================================== */
  if (/login/.test(window.location.pathname)) {
    var $lf = $('#loginForm').length ? $('#loginForm') : $('form').first().removeAttr('action');
    $lf.on('submit', function (e) {
      e.preventDefault();
      clearErrors($lf);
      var valid  = true;
      var $id    = $lf.find('[name=identifier]');
      var $pw    = $lf.find('[name=password]');
      var idVal  = $id.val().trim();

      if (!idVal) {
        showFieldError($id, 'Email or mobile number is required'); valid = false;
      } else if (!isValidEmail(idVal) && !isValidMobile(idVal)) {
        showFieldError($id, 'Enter a valid email or 10-digit mobile number'); valid = false;
      }
      if ($pw.val().length < 6) { showFieldError($pw, 'Password must be at least 6 characters'); valid = false; }

      if (!valid) return;

      var $btn = $lf.find('button[type=submit]');
      $btn.prop('disabled', true).text('Signing in\u2026');
      showToast('Signing you in\u2026', 'info');

      $.ajax({
        url: 'api/login.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ identifier: idVal, password: $pw.val() }),
        success: function (res) {
          if (res.success) {
            showToast(res.message, 'success');
            localStorage.setItem('nf_user', res.user_name || '');
            setTimeout(function () { window.location.href = res.redirect || 'index.html'; }, 1200);
          } else {
            showToast(res.message, 'error');
            $btn.prop('disabled', false).text('Sign In');
          }
        },
        error: function () {
          showToast('Server error. Is XAMPP running?', 'error');
          $btn.prop('disabled', false).text('Sign In');
        }
      });
    });
  }


  /* ===========================================================
     §12  SIGN-UP FORM  —  AJAX
  =========================================================== */
  if (/signup/.test(window.location.pathname)) {
    var $sf = $('#signupForm').length ? $('#signupForm') : $('form').first().removeAttr('action');
    $sf.on('submit', function (e) {
      e.preventDefault();
      clearErrors($sf);
      var valid   = true;
      var $fname  = $sf.find('[name=first_name]');
      var $lname  = $sf.find('[name=last_name]');
      var $email  = $sf.find('[name=email]');
      var $mobile = $sf.find('[name=mobile]');
      var $pw     = $sf.find('[name=password]');
      var $cpw    = $sf.find('[name=confirm_password]');
      var $terms  = $sf.find('input[type=checkbox]').last();

      if (!$fname.val().trim())                 { showFieldError($fname,  'First name is required'); valid = false; }
      if (!$lname.val().trim())                 { showFieldError($lname,  'Last name is required'); valid = false; }
      if (!isValidEmail($email.val().trim()))   { showFieldError($email,  'Enter a valid email address'); valid = false; }
      if (!isValidMobile($mobile.val().trim())) { showFieldError($mobile, 'Enter a valid 10-digit mobile number'); valid = false; }
      if ($pw.val().length < 8)                 { showFieldError($pw,     'Password must be at least 8 characters'); valid = false; }
      if ($pw.val() !== $cpw.val())             { showFieldError($cpw,    'Passwords do not match'); valid = false; }
      if (!$terms.is(':checked'))               { showFieldError($terms,  'You must accept the Terms & Privacy Policy'); valid = false; }

      if (!valid) return;

      var $btn = $sf.find('button[type=submit]');
      $btn.prop('disabled', true).text('Creating account\u2026');

      $.ajax({
        url: 'api/signup.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          first_name       : $fname.val().trim(),
          last_name        : $lname.val().trim(),
          email            : $email.val().trim(),
          mobile           : $mobile.val().replace(/\s+/g, ''),
          password         : $pw.val(),
          confirm_password : $cpw.val()
        }),
        success: function (res) {
          if (res.success) {
            showToast(res.message, 'success');
            setTimeout(function () { window.location.href = res.redirect || 'login.html'; }, 1500);
          } else {
            showToast(res.message, 'error');
            $btn.prop('disabled', false).text('Create My Free Account');
          }
        },
        error: function () {
          showToast('Server error. Is XAMPP running?', 'error');
          $btn.prop('disabled', false).text('Create My Free Account');
        }
      });
    });
  }


  /* ===========================================================
     §13  SELL PAGE  —  AJAX (collects all 4 form sections)
  =========================================================== */
  if (/sell/.test(window.location.pathname)) {
    // Prevent default on intermediate sections
    $('form').not(':last').on('submit', function (e) { e.preventDefault(); showToast('Details saved!', 'success'); });

    // Final submit button triggers full listing POST
    $('form').last().on('submit', function (e) {
      e.preventDefault();

      // Gather data from ALL form sections on the page
      var payload = {};
      $('form').each(function () {
        $(this).find('[name]').each(function () {
          var n = $(this).attr('name'), v = $(this).val();
          if (n && v) payload[n] = v;
        });
      });

      var $btn = $(this).find('button[type=submit]');
      $btn.prop('disabled', true).text('Submitting\u2026');

      $.ajax({
        url: 'api/listing.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (res) {
          if (res.success) {
            showToast(res.message, 'success');
            setTimeout(function () { window.location.href = 'index.html'; }, 2000);
          } else {
            showToast(res.message, 'error');
            $btn.prop('disabled', false).text('\uD83D\uDE80 Post Property for Free');
          }
        },
        error: function () {
          showToast('Server error. Is XAMPP running?', 'error');
          $btn.prop('disabled', false).text('\uD83D\uDE80 Post Property for Free');
        }
      });
    });
  }


  /* ===========================================================
     §14  SMOOTH SCROLL
  =========================================================== */
  $(document).on('click', 'a[href^="#"]', function (e) {
    var href = $(this).attr('href');
    if (href === '#') return;
    var $t = $(href);
    if ($t.length) { e.preventDefault(); $('html, body').animate({ scrollTop: $t.offset().top - 70 }, 600); }
  });


  /* ===========================================================
     §15  CONFIRMATION PAGE
  =========================================================== */
  if (/confirmation/.test(window.location.pathname)) {
    showToast('\ud83c\udf89 Booking confirmed! Thank you for choosing NestFind.', 'success');
  }


  /* ===========================================================
     UTILITY HELPERS
  =========================================================== */
  function showToast(msg, type) {
    type = type || 'info';
    var colours = { success: '#22c55e', info: '#2563eb', error: '#ef4444' };
    $('#nf-toast').remove();
    $('<div id="nf-toast"></div>').text(msg).css({
      position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
      background: colours[type] || colours.info, color: '#fff',
      padding: '12px 28px', borderRadius: '8px', fontSize: '15px',
      fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,.18)',
      zIndex: 99999, whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center'
    }).appendTo('body');
    setTimeout(function () { $('#nf-toast').fadeOut(400, function () { $(this).remove(); }); }, 3000);
  }

  function showFieldError($field, msg) {
    $field.addClass('input-error');
    $field.siblings('.field-err').remove();
    $('<span class="field-err"></span>').text(msg).css({
      color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'
    }).insertAfter($field);
    $field.one('input change', function () {
      $(this).removeClass('input-error').siblings('.field-err').remove();
    });
  }

  function clearErrors($form) {
    $form.find('.input-error').removeClass('input-error');
    $form.find('.field-err').remove();
  }

  function isValidEmail(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function isValidMobile(v) { return /^[6-9]\d{9}$/.test(v); }

}); /* end ready */
