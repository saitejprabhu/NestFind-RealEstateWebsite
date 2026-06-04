/* ── Inject profile dropdown styles ── */
(function(){
  var s = document.createElement('style');
  s.textContent = [
    '.nf-profile-wrap{position:relative;display:inline-block;}',
    '.nf-profile-btn{display:flex;align-items:center;gap:8px;background:var(--primary,#2d7a5e);color:#fff;border:none;border-radius:8px;padding:9px 18px;cursor:pointer;font-weight:700;font-size:14px;font-family:inherit;}',
    '.nf-profile-btn:hover{opacity:0.9;}',
    '.nf-profile-menu{display:none;position:absolute;right:0;top:calc(100% + 8px);background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;overflow:hidden;}',
    '.nf-profile-menu.nf-menu-open{display:block;}',
    '.nf-profile-header{padding:14px 16px;border-bottom:1px solid #f0f0f0;background:#f0faf5;}',
    '.nf-profile-header strong{display:block;font-size:14px;color:#1a1a1a;}',
    '.nf-profile-header span{font-size:12px;color:#888;}',
    '.nf-menu-item{display:block;width:100%;text-align:left;padding:12px 16px;font-size:14px;font-weight:600;color:#1a1a1a;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;box-sizing:border-box;}',
    '.nf-menu-item:hover{background:#f0faf5;}',
    '.nf-logout{color:#e53e3e;border-top:1px solid #f0f0f0;}'
  ].join('');
  document.head.appendChild(s);
})();

/**
 * ============================================================
 * NestFind — Main JavaScript File
 * ============================================================
 * OVERVIEW OF FEATURES IMPLEMENTED:
 * ----------------------------------------------------------
 * 1.  Mobile Navigation Toggle      — hamburger menu open/close
 * 2.  Smooth Scroll                 — anchor links glide smoothly
 * 3.  Navbar Scroll Shrink          — navbar compacts on scroll
 * 4.  Hero Search                   — filters cards on index page
 * 5.  Filter Chips (Buy & Rent)     — single-click property filter
 * 6.  Wishlist / Heart Toggle       — adds/removes from wishlist (localStorage)
 * 7.  Property Detail Modal         — dynamic modal with real card data
 * 8.  Image Carousel / Slider       — hero-section image slider
 * 9.  Counter Animation             — stats count up on enter viewport
 * 10. Login Form Validation         — email/mobile + password checks
 * 11. Sign-Up Form Validation       — full field validation + pw match
 * 12. Sell Form Validation          — listing form field checks
 * 13. Toast Notifications           — lightweight success/error toasts
 * 14. "Load More" Pagination        — reveals hidden property cards
 * 15. Scroll-To-Top Button          — appears after scrolling 300px
 * 16. Scroll Reveal Animations      — cards fade-in as they enter view
 *
 * WHERE jQuery IS USED (and WHY):
 * ----------------------------------------------------------
 * - DOM selection & manipulation    → cleaner, chainable selectors
 * - Event delegation                → handles dynamically created elements
 * - .animate() / .fadeIn()         → simple, cross-browser animations
 * - $.ajax / form serialise        → form handling abstraction
 * jQuery is ideal for rapid, readable DOM work while keeping
 * performance-critical loops in vanilla JS.
 * ============================================================
 */

/* ============================================================
   SECTION 0 — PROPERTY DATA
   Central data store — each page reads from this array so the
   modal always shows the REAL card's details, not static text.
   ============================================================ */

const PROPERTIES = {
  buy: [
    {
      id: "b1",
      title: "3BHK Apartment with Pool in Calangute",
      price: "₹85,00,000",
      priceNote: "onwards",
      location: "Calangute, Goa ",
      distance: "1.5 km drive to calangute beach",
      beds: "3 BHK", baths: "2 Bath", area: "1,450 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "images/apartment.jpg",
      amenities: ["🏊 Swimming Pool","🏋️ Gym","🅿️ 2 Parking","🔐 24/7 Security","🌿 Garden","🛗 Lift"],
      agent: { name: "Rohan Mehta", phone: "+91 98201 11234", rating: "4.9" },
      description: "A spectacular 3 BHK apartment nestled in the heart of Calangute, offering panoramic city views, premium fittings and a gated complex with world-class amenities. Perfect for families seeking luxury living.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b2",
      title: "4 BHK Villa for Sale in Corjuem, Goa",
      price: "₹2,10,00,000",
      priceNote: "",
      location: "Corjuem, Goa",
      distance: "Gated Community",
      beds: "4 BHK", baths: "4 Bath", area: "3,870 sqft",
      type: "Villa", status: "Ready to Move",
      img: "images/villa.jpg",
      amenities: ["🌳 Private Garden","🏊 Club Pool","🅿️ 3 Parking","🔐 Security","🐾 Pet Friendly","⚡ Power Backup"],
      agent: { name: "Priya Nair", phone: "+91 90351 22345", rating: "4.8" },
      description: "An exquisite independent villa in the prestigious Whitefield gated township. Expansive private garden, modern interiors and a serene neighbourhood — an ideal family retreat.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b3",
      title: "4 BHK Villa for Sale in Colvale",
      price: "₹42,00,000",
      priceNote: "",
      location: "Colvale, Goa",
      distance: "Near Beach",
      beds: "4 BHK", baths: "5 Bath", area: "3,800 sqft",
      type: "Villa", status: "Ready to Move",
      img: "images/villa1.jpg",
      amenities: ["🛗 Lift","🅿️ Parking","🔐 Security","🌿 Park","⚡ Power Backup"],
      agent: { name: "Ravi Sharma", phone: "+91 97311 33456", rating: "4.7" },
      description: "A smart, well-planned 4 BHK villa in the scenic town of Colvale. Perfect for families seeking a peaceful retreat with easy access to the beach.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b4",
      title: "Premium 3 BHK — Hi-Tech City",
      price: "₹1,20,00,000",
      priceNote: "",
      location: "Hi-Tech City, Hyderabad",
      distance: "IT Corridor",
      beds: "3 BHK", baths: "3 Bath", area: "1,620 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      amenities: ["🏊 Pool","🏋️ Gym","🅿️ 2 Parking","🔐 Security","🎮 Clubhouse"],
      agent: { name: "Sunita Reddy", phone: "+91 99001 44567", rating: "4.9" },
      description: "Located in the booming Hi-Tech City corridor, this premium 3 BHK offers modern interiors, excellent connectivity to tech parks and a full suite of amenities.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b5",
      title: "Sea-View 2 BHK — Marine Drive Area",
      price: "₹68,00,000",
      priceNote: "",
      location: "Nariman Point, Mumbai",
      distance: "Sea View",
      beds: "2 BHK", baths: "2 Bath", area: "1,050 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      amenities: ["🌊 Sea View","🛗 Lift","🅿️ Parking","🔐 Security","🏊 Pool"],
      agent: { name: "Deepak Malhotra", phone: "+91 98450 55678", rating: "4.8" },
      description: "Wake up to stunning Arabian Sea views every morning. This 2 BHK at Nariman Point is a rare gem combining premium location, sea-facing balcony and timeless city charm.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b6",
      title: "Row House with Private Terrace — Pune",
      price: "₹95,00,000",
      priceNote: "",
      location: "Baner, Pune",
      distance: "Near IT Park",
      beds: "3 BHK", baths: "3 Bath", area: "2,100 sqft",
      type: "Villa", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      amenities: ["🌿 Terrace Garden","🅿️ 2 Parking","🔐 Security","🌳 Park","⚡ Power Backup"],
      agent: { name: "Meera Joshi", phone: "+91 96541 66789", rating: "4.7" },
      description: "A charming row house with a spacious private terrace ideal for entertaining. Close to IT parks in Baner with easy highway access and a peaceful residential community.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b7",
      title: "Affordable 1 BHK — Thane West",
      price: "₹28,00,000",
      priceNote: "",
      location: "Thane West, Mumbai MMR",
      distance: "",
      beds: "1 BHK", baths: "1 Bath", area: "580 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      amenities: ["🛗 Lift","🅿️ Parking","🔐 Security","🌿 Garden"],
      agent: { name: "Kiran Patil", phone: "+91 95231 77890", rating: "4.6" },
      description: "An affordable, compact 1 BHK in Thane West perfect for first-time buyers or investors. Well-connected to Mumbai via road and rail.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b8",
      title: "Penthouse with 360° City View — DLF Phase 5",
      price: "₹3,50,00,000",
      priceNote: "",
      location: "DLF Phase 5, Gurgaon",
      distance: "Ultra Premium",
      beds: "5 BHK", baths: "5 Bath", area: "5,200 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      amenities: ["🏊 Infinity Pool","🏋️ Private Gym","🅿️ 4 Parking","🔐 Concierge","🍷 Lounge","🚁 Helipad Access"],
      agent: { name: "Vikram Singh", phone: "+91 99881 88901", rating: "5.0" },
      description: "Ultra-luxury penthouse spanning 5,200 sqft with jaw-dropping 360° views of Gurgaon's skyline. Customised interiors, smart home automation and world-class finishes.",
      badge: "For Sale", badgeClass: ""
    },
    {
      id: "b9",
      title: "Corner Unit 2.5 BHK — Salt Lake City",
      price: "₹55,00,000",
      priceNote: "",
      location: "Salt Lake, Kolkata",
      distance: "Prime Locality",
      beds: "2.5 BHK", baths: "2 Bath", area: "1,200 sqft",
      type: "Apartment", status: "Ready to Move",
      img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      amenities: ["🛗 Lift","🅿️ Parking","🔐 Security","🌿 Park Facing","⚡ Power Backup"],
      agent: { name: "Ananya Das", phone: "+91 94321 99012", rating: "4.8" },
      description: "A well-designed corner unit offering extra light and ventilation. Located in prime Salt Lake with schools, hospitals and malls all within easy reach.",
      badge: "For Sale", badgeClass: ""
    }
  ],

  rent: [
    {
      id: "r1",
      title: "Fully Furnished 2 BHK in Koramangala",
      price: "₹28,000",
      priceNote: "/month",
      location: "Koramangala 4th Block, Bangalore",
      distance: "",
      beds: "2 BHK", baths: "2 Bath", area: "1,100 sqft",
      type: "Apartment", status: "Furnished",
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      amenities: ["🛋️ Fully Furnished","📺 TV","❄️ AC All Rooms","🍳 Modular Kitchen","🛗 Lift","🅿️ Parking"],
      agent: { name: "Rohan Iyer", phone: "+91 98201 11100", rating: "4.9" },
      description: "Beautifully furnished 2 BHK in the heart of Koramangala. Walking distance to top restaurants, cafes and IT offices. Move-in ready with all appliances included.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r2",
      title: "Semi-Furnished 1 BHK — Andheri East",
      price: "₹18,500",
      priceNote: "/month",
      location: "Andheri East, Mumbai",
      distance: "",
      beds: "1 BHK", baths: "1 Bath", area: "620 sqft",
      type: "Apartment", status: "Semi-Furnished",
      img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      amenities: ["🛋️ Semi-Furnished","❄️ AC","🛗 Lift","🅿️ Parking","🔐 Security"],
      agent: { name: "Sneha Kulkarni", phone: "+91 90351 22200", rating: "4.7" },
      description: "Neat and compact 1 BHK in Andheri East — ideal for young professionals. Close to metro, BKC and international airport. Quiet society, 24/7 water.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r3",
      title: "Premium 3 BHK — Golf Course Road",
      price: "₹45,000",
      priceNote: "/month",
      location: "Golf Course Road, Gurgaon",
      distance: "",
      beds: "3 BHK", baths: "3 Bath", area: "1,800 sqft",
      type: "Apartment", status: "Semi-Furnished",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      amenities: ["🏊 Pool","🏋️ Gym","🅿️ 2 Parking","🔐 Security","🎮 Clubhouse","🌿 Garden"],
      agent: { name: "Anil Grover", phone: "+91 97311 33300", rating: "4.8" },
      description: "Spacious 3 BHK with premium finishes in the most coveted Gurgaon address. Ideal for senior professionals and families wanting the best of Millennium City living.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r4",
      title: "Compact Studio Near Cyber Hub",
      price: "₹12,000",
      priceNote: "/month",
      location: "Sector 29, Gurgaon",
      distance: "Bachelors OK",
      beds: "Studio", baths: "1 Bath", area: "380 sqft",
      type: "Studio", status: "Furnished",
      img: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      amenities: ["🛋️ Furnished","📺 TV","❄️ AC","🍳 Kitchenette","🅿️ Bike Parking"],
      agent: { name: "Kavya Mehta", phone: "+91 99001 44400", rating: "4.6" },
      description: "A smart, affordable studio steps from Cyber Hub. All basic furnishings included. Bachelors welcome. Great for short to medium-term stays.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r5",
      title: "Airy 2 BHK with Balcony — Viman Nagar",
      price: "₹22,000",
      priceNote: "/month",
      location: "Viman Nagar, Pune",
      distance: "Near Airport",
      beds: "2 BHK", baths: "2 Bath", area: "990 sqft",
      type: "Apartment", status: "Semi-Furnished",
      img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      amenities: ["🌬️ Spacious Balcony","❄️ AC","🛗 Lift","🅿️ Parking","🌿 Park View"],
      agent: { name: "Tejas Deshpande", phone: "+91 98450 55500", rating: "4.8" },
      description: "Bright and breezy 2 BHK with a large balcony overlooking greenery. Near Pune airport, malls and top schools. Perfect family rental.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r6",
      title: "Luxe Duplex 4 BHK — Juhu",
      price: "₹75,000",
      priceNote: "/month",
      location: "Juhu, Mumbai",
      distance: "Sea-Facing",
      beds: "4 BHK", baths: "4 Bath", area: "3,200 sqft",
      type: "Duplex", status: "Furnished",
      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      amenities: ["🌊 Sea-Facing","🛋️ Fully Furnished","🏊 Pool","🅿️ 3 Parking","🔐 Security","🎵 Entertainment Room"],
      agent: { name: "Hina Shah", phone: "+91 96541 66600", rating: "5.0" },
      description: "An opulent duplex in Juhu with sweeping Arabian Sea views. Four bedrooms across two floors, designer furniture, rooftop terrace and private parking.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r7",
      title: "Budget 1 BHK — HSR Layout",
      price: "₹9,500",
      priceNote: "/month",
      location: "HSR Layout, Bangalore",
      distance: "Families Preferred",
      beds: "1 BHK", baths: "1 Bath", area: "550 sqft",
      type: "Apartment", status: "Unfurnished",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      amenities: ["🛗 Lift","🔐 Security","🌿 Park","🚰 24hr Water"],
      agent: { name: "Suresh Babu", phone: "+91 95231 77700", rating: "4.5" },
      description: "An honest, budget-friendly 1 BHK in the family-oriented HSR Layout neighbourhood. Clean society, nearby markets and good public transport.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r8",
      title: "Spacious 3 BHK — Jubilee Hills",
      price: "₹35,000",
      priceNote: "/month",
      location: "Jubilee Hills, Hyderabad",
      distance: "Premium Zone",
      beds: "3 BHK", baths: "2 Bath", area: "1,500 sqft",
      type: "Apartment", status: "Semi-Furnished",
      img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      amenities: ["🏋️ Gym","🅿️ Parking","🔐 Security","🌿 Jogging Track","🎮 Kids Play Area"],
      agent: { name: "Arjun Reddy", phone: "+91 94321 88800", rating: "4.9" },
      description: "A generous 3 BHK in Hyderabad's most prestigious neighbourhood. Well-maintained complex with round-the-clock security and lush green surroundings.",
      badge: "For Rent", badgeClass: "rent"
    },
    {
      id: "r9",
      title: "Well-Maintained 1.5 BHK — Powai",
      price: "₹16,000",
      priceNote: "/month",
      location: "Powai, Mumbai",
      distance: "Lake-View Available",
      beds: "1.5 BHK", baths: "1 Bath", area: "720 sqft",
      type: "Apartment", status: "Semi-Furnished",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      amenities: ["🌊 Lake View","❄️ AC","🛗 Lift","🅿️ Parking","🔐 Security"],
      agent: { name: "Neha Sawant", phone: "+91 98801 99900", rating: "4.7" },
      description: "A serene 1.5 BHK with lake views in the premium Powai township. Near IIT, malls and major offices. A calm retreat in the city.",
      badge: "For Rent", badgeClass: "rent"
    }
  ]
};

/* ============================================================
   SECTION 1 — DOCUMENT READY (jQuery entry point)
   WHY jQuery: $(document).ready() ensures all DOM nodes are
   available before we attach any listeners.
   ============================================================ */
$(document).ready(function () {

  /* ----------------------------------------------------------
     AUTH — Navbar profile dropdown & logout
  ---------------------------------------------------------- */
  var nfUser = null;
  try { nfUser = JSON.parse(localStorage.getItem('nf_user') || 'null'); } catch(e) {}

  if (nfUser && nfUser.name) {
    var firstName = nfUser.name.split(' ')[0];
    var dropdown =
      '<div class="nf-profile-wrap">' +
        '<button class="nf-profile-btn">👤 ' + firstName + ' ▾</button>' +
        '<div class="nf-profile-menu">' +
          '<div class="nf-profile-header">' +
            '<strong>' + nfUser.name + '</strong>' +
            '<span>Logged in</span>' +
          '</div>' +
          '<a href="wishlist.html" class="nf-menu-item">❤️ My Wishlist</a>' +
          '<a href="sell.html" class="nf-menu-item">🏠 Post Property</a>' +
          '<button id="nf-logout-btn" class="nf-menu-item nf-logout">🚪 Logout</button>' +
        '</div>' +
      '</div>';

    $('.nav-actions').html(dropdown);

    $(document).on('click', '.nf-profile-btn', function(e) {
      e.stopPropagation();
      $('.nf-profile-menu').toggleClass('nf-menu-open');
    });
    $(document).on('click', function() {
      $('.nf-profile-menu').removeClass('nf-menu-open');
    });
    $(document).on('click', '#nf-logout-btn', function() {
      localStorage.removeItem('nf_user');
      window.location.href = 'index.html';
    });
  }

  var wlKey = nfUser ? ('nf_wishlist_' + nfUser.name) : 'nf_wishlist_guest';


  /* ----------------------------------------------------------
     1A. NAVBAR — Mobile Hamburger Toggle
     WHY jQuery: .toggleClass() and .slideToggle() are
     concise for show/hide transitions.
  ---------------------------------------------------------- */
  // Inject hamburger button into every nav-inner if not present
  if ($('.nav-hamburger').length === 0) {
    $('.nav-inner').append('<button class="nav-hamburger" aria-label="Toggle Menu">&#9776;</button>');
  }

  $(document).on('click', '.nav-hamburger', function () {
    $(this).toggleClass('open');
    $('.nav-links').toggleClass('nav-open');
    $('.nav-actions').toggleClass('nav-open');
  });

  // Close menu when a nav link is clicked (mobile UX)
  $(document).on('click', '.nav-link', function () {
    $('.nav-links').removeClass('nav-open');
    $('.nav-actions').removeClass('nav-open');
    $('.nav-hamburger').removeClass('open');
  });

  /* ----------------------------------------------------------
     1B. NAVBAR — Shrink on scroll (vanilla JS is faster here
     for scroll events — no jQuery overhead per scroll tick)
  ---------------------------------------------------------- */
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      document.querySelector('.navbar') && document.querySelector('.navbar').classList.add('navbar-scrolled');
    } else {
      document.querySelector('.navbar') && document.querySelector('.navbar').classList.remove('navbar-scrolled');
    }
    // Show / hide scroll-to-top
    if (window.scrollY > 300) {
      $('#scrollTop').fadeIn(300);
    } else {
      $('#scrollTop').fadeOut(300);
    }
  });

  /* ----------------------------------------------------------
     1C. SCROLL-TO-TOP BUTTON
  ---------------------------------------------------------- */
  if ($('#scrollTop').length === 0) {
    $('body').append('<button id="scrollTop" title="Back to top">▲</button>');
  }
  $(document).on('click', '#scrollTop', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });


  /* ----------------------------------------------------------
     SECTION 2 — COUNTER ANIMATION (IntersectionObserver)
     Counts up stat numbers when they enter the viewport.
     WHY vanilla JS: IntersectionObserver API is cleaner here.
  ---------------------------------------------------------- */
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statNums.forEach(el => {
      counterObserver.observe(el);
      // Fire immediately if already visible on page load (above-the-fold stats)
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && !el.dataset.counted) {
        el.dataset.counted = 'true';
        animateCounter(el);
      }
    });
  }

  /**
   * animateCounter — handles K/M suffixes and counts up with ease-out.
   * "50K+" counts 0..50 with suffix "K+"
   * "5M+"  counts 0..5  with suffix "M+" (smooth with decimal steps)
   * "200+" counts 0..200 with suffix "+"
   */
  window.animateCounter = function animateCounter(el) {
    const raw    = el.textContent.trim();
    const numStr = raw.match(/[\d.]+/)?.[0] || '0';
    const suffix = raw.replace(/[\d.]/g, '');
    const target = parseFloat(numStr);
    const duration = 2000;
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased   = 1 - Math.pow(1 - progress, 3);
      const current = target <= 10
        ? (eased * target).toFixed(1).replace(/\.0$/, '')
        : Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }


  /* ----------------------------------------------------------
     SECTION 3 — SCROLL REVEAL ANIMATIONS
     Cards and sections fade in from below as they scroll in.
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.prop-card, .feat-card, .sec-header, .auth-box');
  if (revealEls.length) {
    revealEls.forEach(el => el.classList.add('reveal-hidden'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ----------------------------------------------------------
     SECTION 4 — HERO IMAGE SLIDER (index.html)
     WHY jQuery: .fadeIn()/.fadeOut() give a clean crossfade
     without writing CSS keyframe boilerplate.
  ---------------------------------------------------------- */
  const heroImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80'
  ];
  let heroIdx = 0;
  const $hero = $('.hero');
  if ($hero.length) {
    // Set initial bg
    $hero.css({ backgroundImage: `url(${heroImages[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' });
    // Add dot nav
    const dots = heroImages.map((_, i) =>
      `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`
    ).join('');
    $hero.append(`<div class="slider-dots">${dots}</div>`);

    function changeHero(idx) {
      heroIdx = (idx + heroImages.length) % heroImages.length;
      $hero.css('backgroundImage', `url(${heroImages[heroIdx]})`);
      $('.slider-dot').removeClass('active').eq(heroIdx).addClass('active');
    }

    // Auto-play
    setInterval(() => changeHero(heroIdx + 1), 5000);

    $(document).on('click', '.slider-dot', function () {
      changeHero(parseInt($(this).data('idx')));
    });
  }


  /* ----------------------------------------------------------
     SECTION 5 — HERO SEARCH (index.html)
     Filters property cards on the page when user types in
     the hero search box.
  ---------------------------------------------------------- */
  $(document).on('input', '.hero-search input', function () {
    // Hero search is handled inline in index.html
  });

  $(document).on('click', '.btn-search', function () {
    // Hero search is handled inline in index.html
  });

  $(document).on('keydown', '.hero-search input', function (e) {
    if (e.key === 'Enter') $('.btn-search').trigger('click');
  });

  function filterCardsByQuery(q) {
    if (!q) {
      $('.prop-card').show();
      return;
    }
    $('.prop-card').each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(q));
    });
  }

  // On buy.html / rent.html — auto-apply ?q= search param after cards load
  (function applyUrlSearch() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (!q) return;

    // Wait for the AJAX to finish rendering cards, then filter
    const maxWait = 5000; // 5s timeout
    const interval = 100;
    let elapsed = 0;
    const timer = setInterval(function () {
      elapsed += interval;
      const cards = $('.prop-card');
      if (cards.length > 0) {
        clearInterval(timer);
        filterCardsByQuery(q.toLowerCase());
        // Pre-fill the search input on buy/rent pages
        $('#buySearchInput, #rentSearchInput').val(q);
        // Show a banner so user knows search is active
        const banner = $('<div class="search-active-banner" style="background:var(--primary-light,#e8f5f0);border:1.5px solid var(--primary,#2d7a5e);border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:14px;color:var(--primary,#2d7a5e);font-weight:600;display:flex;align-items:center;justify-content:space-between;">' +
          '<span>🔍 Showing results for: <em style="font-style:normal;text-decoration:underline;">' + $('<div>').text(q).html() + '</em></span>' +
          '<button onclick="$(this).closest(\'.search-active-banner\').remove(); $(\'.prop-card\').show();" style="background:none;border:none;cursor:pointer;font-size:18px;line-height:1;color:inherit;">✕</button>' +
          '</div>');
        const $grid = $('#buyGrid, #rentGrid').first();
        $grid.before(banner);
      } else if (elapsed >= maxWait) {
        clearInterval(timer);
      }
    }, interval);
  })();


  /* ----------------------------------------------------------
     SECTION 6 — FILTER CHIPS (buy.html & rent.html)
     WHY jQuery: event delegation + .filter() makes chip logic
     very compact. Chips read data from .prop-card DOM.
  ---------------------------------------------------------- */

  // Chip click — single select
  $(document).on('click', '.chip', function () {
    $(this).siblings('.chip').removeClass('active');
    $(this).addClass('active');
    applyChipFilter();
  });

  /**
   * applyChipFilter — reads the active chip label and shows/hides
   * property cards based on their text content.
   */
  function applyChipFilter() {
    const active = $('.chip.active').text().trim();

    // Mapping of chip labels to filter functions
    const filters = {
      'All': () => true,
      'All Types': () => true,
      'Apartment': c => c.includes('apartment') || c.includes('bhk') && !c.includes('villa'),
      'Villa': c => c.includes('villa') || c.includes('row house'),
      'Plot/Land': c => c.includes('plot') || c.includes('land'),
      'Studio': c => c.includes('studio'),
      '1 BHK': c => /\b1 bhk\b/.test(c),
      '2 BHK': c => /\b2 bhk\b/.test(c),
      '3 BHK': c => /\b3 bhk\b/.test(c),
      '4+ BHK': c => /\b[4-9](\.\d)? bhk\b/.test(c) || c.includes('4 bhk') || c.includes('5 bhk'),
      'Furnished': c => c.includes('furnished') && !c.includes('semi') && !c.includes('unfurnished'),
      'Semi-Furnished': c => c.includes('semi-furnished') || c.includes('semi furnished'),
      'Unfurnished': c => c.includes('unfurnished'),
      'Bachelors OK': c => c.includes('bachelor'),
      'Under ₹30L': c => priceInLakhs(c) < 30,
      '₹30L–₹75L': c => priceInLakhs(c) >= 30 && priceInLakhs(c) <= 75,
      '₹75L–₹1.5Cr': c => priceInLakhs(c) > 75 && priceInLakhs(c) <= 150,
      '₹1.5Cr+': c => priceInLakhs(c) > 150,
      'Under ₹50L': c => priceInLakhs(c) < 50,
      '₹50L–₹1Cr': c => priceInLakhs(c) >= 50 && priceInLakhs(c) <= 100,
      '₹1Cr+': c => priceInLakhs(c) > 100,
      'Under ₹15K': c => monthlyRent(c) < 15000,
      '₹15K–₹35K': c => monthlyRent(c) >= 15000 && monthlyRent(c) <= 35000,
      '₹35K+': c => monthlyRent(c) > 35000,
      'Ready to Move': c => c.includes('ready'),
      'New Launch': c => c.includes('launch') || c.includes('new'),
      'All': () => true
    };

    const fn = filters[active] || (() => true);

    $('.prop-card').each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(fn(text));
    });
  }

  // Helper — extract price in lakhs from card text (buy)
  function priceInLakhs(text) {
    const m = text.match(/₹([\d,]+)/);
    if (!m) return 0;
    const num = parseInt(m[1].replace(/,/g, ''));
    return num / 100000;
  }

  // Helper — extract monthly rent from card text
  function monthlyRent(text) {
    const m = text.match(/₹([\d,]+)\s*\/month/);
    if (!m) return 0;
    return parseInt(m[1].replace(/,/g, ''));
  }


  /* ----------------------------------------------------------
     SECTION 7 — WISHLIST HEART TOGGLE
     Persisted in localStorage so hearts survive page refresh.
     WHY jQuery: event delegation handles dynamically injected
     cards without re-binding.
  ---------------------------------------------------------- */
  // Load saved wishlist
  let wishlist = JSON.parse(localStorage.getItem(wlKey) || '{}');

  // Paint hearts on page load
  function paintHearts() {
    $('.prop-wishlist').each(function () {
      const card = $(this).closest('.prop-card');
      const id = card.data('prop-id');
      if (id && wishlist[id]) {
        $(this).text('❤️').addClass('wished');
      } else {
        $(this).text('🤍').removeClass('wished');
      }
    });
  }
  paintHearts();

  // Toggle on click — stop propagation so modal doesn't open

  /* ----------------------------------------------------------
     SECTION 8 — PROPERTY DETAIL MODAL
     "View Details" overlay on prop-card opens a dynamic modal
     populated from the PROPERTIES data store using the card's
     data-prop-id attribute. This ensures the modal shows the
     ACTUAL card's data, not static/hardcoded content.
  ---------------------------------------------------------- */

  // Build and inject modal HTML once
  if ($('#propModal').length === 0) {
    $('body').append(`
      <div id="propModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Property Details">
        <div class="modal-box">
          <div id="modalBody"></div>
        </div>
      </div>
    `);
  }

  /**
   * openModal — finds property data by id, builds HTML, injects
   * and shows the modal.
   * @param {string} propId
   */
  function openModal(propId) {
    let prop = null;
    // Search buy then rent arrays
    prop = PROPERTIES.buy.find(p => p.id === propId) ||
           PROPERTIES.rent.find(p => p.id === propId);

    if (!prop) {
      // Fallback: try matching by title slug
      const allProps = [...PROPERTIES.buy, ...PROPERTIES.rent];
      prop = allProps.find(p => p.title.replace(/\s+/g, '_') === propId);
    }

    if (!prop) return;

    const amenityHTML = prop.amenities.map(a =>
      `<span class="modal-amenity">${a}</span>`
    ).join('');

    const isRent = !!prop.priceNote.includes('month');
    const actionBtn = isRent
      ? `<button class="modal-action-btn rent-btn" onclick="goToPaymentIfLoggedIn()">🔑 Rent Now</button>`
      : `<button class="modal-action-btn buy-btn"  onclick="goToPaymentIfLoggedIn()">🏠 Buy Now</button>`;

    $('#modalBody').html(`
      <div class="modal-img-wrap">
        <img src="${prop.img}" alt="${prop.title}" class="modal-hero-img" loading="lazy"/>
        <div class="modal-badge ${prop.badgeClass}">${prop.badge}</div>
        <div class="modal-wishlist" data-prop-id="${prop.id}">${wishlist[prop.id] ? '❤️' : '🤍'}</div>
        <button class="modal-close" id="modalClose" aria-label="Close">✕</button>
      </div>
      <div class="modal-content">
        <div class="modal-price">${prop.price} <span>${prop.priceNote}</span></div>
        <h2 class="modal-title">${prop.title}</h2>
        <p class="modal-loc">📍 ${prop.location}${prop.distance ? ' · ' + prop.distance : ''}</p>
        <div class="modal-meta-row">
          <span class="modal-meta-item">🛏 ${prop.beds}</span>
          <span class="modal-meta-item">🛁 ${prop.baths}</span>
          <span class="modal-meta-item">📐 ${prop.area}</span>
          <span class="modal-meta-item">🏷️ ${prop.type}</span>
          <span class="modal-meta-item">✅ ${prop.status}</span>
        </div>
        <p class="modal-desc">${prop.description}</p>
        <div class="modal-amenities-label">Amenities & Features</div>
        <div class="modal-amenities">${amenityHTML}</div>
        <div class="modal-agent">
          <div class="agent-info">
            <div class="agent-avatar">${prop.agent.name.charAt(0)}</div>
            <div>
              <div class="agent-name">${prop.agent.name}</div>
              <div class="agent-rating">⭐ ${prop.agent.rating} · Verified Agent</div>
            </div>
          </div>
          <a href="tel:${prop.agent.phone}" class="agent-call-btn">📞 Call Agent</a>
        </div>
        <div class="modal-actions">
          ${actionBtn}
          <button class="modal-share-btn" onclick="navigator.share ? navigator.share({title:'${prop.title}',url:window.location.href}) : showToast('Link copied!','success')">📤 Share</button>
        </div>
      </div>
    `);

    $('#propModal').fadeIn(250);
    $('body').addClass('modal-open');
  }

  // Close modal
  $(document).on('click', '#modalClose, .modal-overlay', function (e) {
    if ($(e.target).is('#modalClose') || $(e.target).is('.modal-overlay')) {
      $('#propModal').fadeOut(200);
      $('body').removeClass('modal-open');
    }
  });
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('#propModal').fadeOut(200);
      $('body').removeClass('modal-open');
    }
  });

  // Wishlist toggle inside modal
  $(document).on('click', '.modal-wishlist', function (e) {
    e.stopPropagation();
    const id = $(this).data('prop-id');
    if (wishlist[id]) {
      delete wishlist[id];
      $(this).text('🤍');
      showToast('Removed from Wishlist', 'info');
    } else {
      // Find prop data and save full details
      const prop = PROPERTIES.buy.find(p => p.id === id) || PROPERTIES.rent.find(p => p.id === id);
      if (prop) {
        const isRent = !!prop.priceNote.includes('month');
        wishlist[id] = JSON.stringify({
          id: prop.id, title: prop.title, price: prop.price,
          location: prop.location, image: prop.img || '',
          beds: prop.beds, area: prop.area,
          listing_type: isRent ? 'For Rent' : 'For Sale'
        });
      } else {
        wishlist[id] = true;
      }
      $(this).text('❤️');
      showToast('Added to Wishlist ❤️', 'success');
    }
    localStorage.setItem(wlKey, JSON.stringify(wishlist));
    paintHearts();
  });

  // Open modal when "View Details" overlay is clicked
  $(document).on('click', '.prop-overlay, .view-tag', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const card = $(this).closest('.prop-card');
    const propId = card.data('prop-id');
    if (propId) openModal(propId);
  });

  // Also open modal when the card itself is clicked (not buy/rent btn)
  $(document).on('click', '.prop-card', function (e) {
    if ($(e.target).is('a') || $(e.target).closest('a').length) return;
    if ($(e.target).is('.prop-wishlist') || $(e.target).closest('.prop-wishlist').length) return;
    const propId = $(this).data('prop-id');
    if (propId) openModal(propId);
  });


  /* ----------------------------------------------------------
     SECTION 9 — LOAD MORE BUTTON
     Shows the next batch of hidden cards.
  ---------------------------------------------------------- */
  const LOAD_BATCH = 3;

  $(document).on('click', '.load-more-btn', function () {
    const hidden = $('.prop-card.card-hidden');
    hidden.slice(0, LOAD_BATCH).each(function () {
      $(this).removeClass('card-hidden').hide().fadeIn(400);
    });
    if ($('.prop-card.card-hidden').length === 0) {
      $(this).text('No More Properties').prop('disabled', true);
    }
    updateResultCount();
  });

  function updateResultCount() {
    const visible = $('.prop-card:visible').length;
    $('.result-count strong').text(visible.toLocaleString('en-IN'));
  }


  /* ----------------------------------------------------------
     SECTION 10 — LOGIN FORM VALIDATION
     WHY jQuery: .val(), .addClass(), .focus() chaining keeps
     the validation code concise and readable.
  ---------------------------------------------------------- */
  $(document).on('submit', 'form[data-form="login"]', function (e) {
    e.preventDefault();
    let valid = true;

    const $id = $(this).find('input[data-field="identifier"]');
    const $pw = $(this).find('input[type="password"]');

    clearErrors($(this));

    // Email / mobile validation
    const idVal = $id.val().trim();
    if (!idVal) {
      showFieldError($id, 'Email or mobile number is required');
      valid = false;
    } else if (!isValidEmail(idVal) && !isValidMobile(idVal)) {
      showFieldError($id, 'Enter a valid email address or 10-digit mobile number');
      valid = false;
    }

    // Password validation
    if ($pw.val().length < 6) {
      showFieldError($pw, 'Password must be at least 6 characters');
      valid = false;
    }

    if (valid) {
      showToast('Signing you in…', 'info');
      fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idVal, password: $pw.val() })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('nf_user', JSON.stringify({ name: data.user_name }));
          showToast('Welcome, ' + data.user_name + '!', 'success');
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
          showToast(data.message || 'Login failed.', 'error');
        }
      })
      .catch(() => showToast('Server error. Make sure XAMPP is running.', 'error'));
    }
  });


  /* ----------------------------------------------------------
     SECTION 11 — SIGN-UP FORM VALIDATION
  ---------------------------------------------------------- */
  $(document).on('submit', 'form[data-form="signup"]', function (e) {
    e.preventDefault();
    let valid = true;
    clearErrors($(this));

    const $fname = $(this).find('[data-field="fname"]');
    const $lname = $(this).find('[data-field="lname"]');
    const $email = $(this).find('[data-field="email"]');
    const $mobile = $(this).find('[data-field="mobile"]');
    const $pw = $(this).find('[data-field="password"]');
    const $cpw = $(this).find('[data-field="confirm-password"]');
    const $terms = $(this).find('[data-field="terms"]');

    if (!$fname.val().trim()) { showFieldError($fname, 'First name is required'); valid = false; }
    if (!$lname.val().trim()) { showFieldError($lname, 'Last name is required'); valid = false; }
    if (!isValidEmail($email.val().trim())) { showFieldError($email, 'Enter a valid email address'); valid = false; }
    if (!isValidMobile($mobile.val().trim())) { showFieldError($mobile, 'Enter a valid 10-digit mobile number'); valid = false; }
    if ($pw.val().length < 8) { showFieldError($pw, 'Password must be at least 8 characters'); valid = false; }
    if ($pw.val() !== $cpw.val()) { showFieldError($cpw, 'Passwords do not match'); valid = false; }
    if (!$terms.is(':checked')) { showFieldError($terms, 'You must accept the Terms & Privacy Policy'); valid = false; }

    if (valid) {
    fetch('api/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            first_name: $fname.val().trim(),
            last_name:  $lname.val().trim(),
            email:      $email.val().trim(),
            mobile:     $mobile.val().trim(),
            password:        $pw.val(),
            confirm_password: $cpw.val()
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Account created! Redirecting…', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } else {
            showToast(data.message || 'Signup failed. Try again.', 'error');
        }
    })
    .catch(() => {
        showToast('Server error. Make sure XAMPP is running.', 'error');
    });
}
  });


  /* ----------------------------------------------------------
     SECTION 12 — SELL / LISTING FORM VALIDATION
  ---------------------------------------------------------- */
  $(document).on('submit', 'form[data-form="sell"]', function (e) {
    e.preventDefault();
    let valid = true;
    clearErrors($(this));

    $(this).find('[required]').each(function () {
      const val = $(this).val().trim();
      if (!val) {
        showFieldError($(this), 'This field is required');
        valid = false;
      }
    });

    if (valid) {
      const form = $(this);
      const payload = {};
      form.find('[name]').each(function() {
        payload[$(this).attr('name')] = $(this).val();
      });

      fetch('api/listing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('🎉 Your listing has been submitted for review!', 'success');
          setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } else {
          showToast(data.message || 'Submission failed.', 'error');
        }
      })
      .catch(() => showToast('Server error. Make sure XAMPP is running.', 'error'));
    }
  });


  /* ----------------------------------------------------------
     SECTION 13 — SMOOTH SCROLL for in-page anchor links
  ---------------------------------------------------------- */
  $(document).on('click', 'a[href^="#"]', function (e) {
    const target = $($(this).attr('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 70 }, 600);
    }
  });
 
  /* ----------------------------------------------------------
   SECTION 13B — INQUIRY FORM VALIDATION & AJAX SUBMIT
---------------------------------------------------------- */
$(document).on('submit', 'form[data-form="inquiry"]', function (e) {
  e.preventDefault();
  let valid = true;
  clearErrors($(this));

  const $name    = $(this).find('[data-field="name"]');
  const $email   = $(this).find('[data-field="email"]');
  const $mobile  = $(this).find('[data-field="mobile"]');
  const $message = $(this).find('[data-field="message"]');
  const listingId = $(this).find('[data-field="listing_id"]').val() || null;

  if (!$name.val().trim())                        { showFieldError($name, 'Name is required'); valid = false; }
  if (!isValidEmail($email.val().trim()))         { showFieldError($email, 'Enter a valid email address'); valid = false; }
  if (!isValidMobile($mobile.val().trim()))       { showFieldError($mobile, 'Enter a valid 10-digit mobile number'); valid = false; }
  if ($message.val().trim().length < 10)          { showFieldError($message, 'Message must be at least 10 characters'); valid = false; }

  if (valid) {
    $.ajax({
      url: 'api/inquiry.php',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        name:       $name.val().trim(),
        email:      $email.val().trim(),
        mobile:     $mobile.val().trim(),
        message:    $message.val().trim(),
        listing_id: listingId
      }),
      success: function (res) {
        if (res.success) {
          showToast('✅ ' + res.message, 'success');
          $('form[data-form="inquiry"]')[0].reset();
        } else {
          showToast('❌ ' + res.message, 'error');
        }
      },
      error: function () {
        showToast('Something went wrong. Please try again.', 'error');
      }
    });
  }
});

  /* ----------------------------------------------------------
     UTILITY FUNCTIONS
  ---------------------------------------------------------- */

  /**
   * showToast — displays a temporary notification banner.
   * @param {string} msg   — message text
   * @param {string} type  — 'success' | 'error' | 'info'
   */
  window.showToast = function (msg, type = 'success') {
    const $t = $(`<div class="toast toast-${type}">${msg}</div>`);
    $('body').append($t);
    setTimeout(() => $t.addClass('toast-show'), 10);
    setTimeout(() => {
      $t.removeClass('toast-show');
      setTimeout(() => $t.remove(), 400);
    }, 3000);
  };

  /**
   * showFieldError — marks an input invalid and inserts error text.
   * @param {jQuery} $el
   * @param {string} msg
   */
  function showFieldError($el, msg) {
    $el.addClass('input-error');
    if (!$el.next('.field-error').length) {
      $el.after(`<span class="field-error">${msg}</span>`);
    }
    $el.one('input change', function () {
      $(this).removeClass('input-error');
      $(this).next('.field-error').remove();
    });
  }

  /** clearErrors — removes all error states in a form */
  function clearErrors($form) {
    $form.find('.input-error').removeClass('input-error');
    $form.find('.field-error').remove();
  }

  /** isValidEmail */
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /** isValidMobile — 10 digit Indian mobile */
  function isValidMobile(v) {
    return /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
  }

}); // END $(document).ready


/* ============================================================
   SECTION 14 — PAGE-SPECIFIC INITIALISERS
   Called after DOM ready to set up data attributes and hide
   extra cards for "load more" feature.
   ============================================================ */

/**
 * initBuyPage — assigns data-prop-id to each card on buy.html
 * and hides cards beyond the first 6 for "load more".
 */
function initBuyPage() {
  const cards = document.querySelectorAll('#buyGrid .prop-card');
  cards.forEach((card, i) => {
    const prop = PROPERTIES.buy[i];
    if (prop) {
      card.dataset.propId = prop.id;
      // Add image if card only has placeholder
      const placeholder = card.querySelector('.prop-img-placeholder');
      if (placeholder) {
        const img = document.createElement('img');
        img.src = prop.img;
        img.alt = prop.title;
        img.loading = 'lazy';
        placeholder.replaceWith(img);
      }
    }
    if (i >= 6) card.classList.add('card-hidden');
  });
}

/**
 * initRentPage — same for rent.html
 */
function initRentPage() {
  const cards = document.querySelectorAll('#rentGrid .prop-card');
  cards.forEach((card, i) => {
    const prop = PROPERTIES.rent[i];
    if (prop) card.dataset.propId = prop.id;
    if (i >= 6) card.classList.add('card-hidden');
  });
}

/**
 * initIndexPage — assigns data-prop-id to featured cards on index.html
 */
function initIndexPage() {
  // Buy cards on index
  document.querySelectorAll('#buy .prop-card').forEach((card, i) => {
    if (PROPERTIES.buy[i]) card.dataset.propId = PROPERTIES.buy[i].id;
  });
  // Rent cards on index (second props-grid, no id selector)
  const allGrids = document.querySelectorAll('.props-grid');
  if (allGrids.length >= 2) {
    allGrids[1].querySelectorAll('.prop-card').forEach((card, i) => {
      if (PROPERTIES.rent[i]) card.dataset.propId = PROPERTIES.rent[i].id;
    });
  }

  // ── Live hero stats from DB ───────────────────────────────────
  const elListings = document.getElementById('statListings');
  const elUsers    = document.getElementById('statUsers');
  const elCities   = document.getElementById('statCities');
  const elPayments = document.getElementById('statPayments');

  if (elListings) {
    fetch('api/properties.php?action=stats')
      .then(r => r.json())
      .then(res => {
        if (!res.success) return;
        function setLiveStat(el, value) {
          if (!el) return;
          el.textContent = value;
          // Trigger the counter animation
          if (typeof animateCounter === 'function') {
            el.dataset.counted = '';
            animateCounter(el);
          }
        }
        setLiveStat(elListings, res.total    || 0);
        setLiveStat(elUsers,    res.users    || 0);
        setLiveStat(elCities,   res.cities   || 0);
        setLiveStat(elPayments, res.payments || 0);
      })
      .catch(() => {
        // Fallback to zeros on error
        [elListings, elUsers, elCities, elPayments].forEach(el => { if (el) el.textContent = '0'; });
      });
  }
}

// Auto-detect current page and run the correct initialiser
(function detectPage() {
  const path = window.location.pathname;
  if (path.includes('buy.html')) initBuyPage();
  else if (path.includes('rent.html')) initRentPage();
  else initIndexPage(); // index + others
})();
// ── Auth check before proceeding to payment ──────────────────────
function goToPaymentIfLoggedIn() {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('nf_user') || 'null'); } catch(e) {}
  if (user) {
    window.location.href = 'payment.html';
  } else {
    showLoginPrompt();
  }
}

function showLoginPrompt() {
  // Remove any existing prompt
  const existing = document.getElementById('nf-login-prompt');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nf-login-prompt';
  overlay.style.cssText = [
    'position:fixed','inset:0','background:rgba(0,0,0,0.55)',
    'display:flex','align-items:center','justify-content:center',
    'z-index:9999','font-family:inherit'
  ].join(';');
  overlay.innerHTML = `
    <div style="text-align:center;max-width:400px;width:90%;padding:36px 28px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.2);">
      <div style="font-size:48px;margin-bottom:14px;">🔒</div>
      <h2 style="margin:0 0 10px;font-size:20px;color:#1e293b;">Login Required</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        Please login before proceeding to payment.
      </p>
      <a href="login.html" style="display:inline-block;padding:11px 28px;background:#e85d26;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-right:8px;">
        Login
      </a>
      <button onclick="document.getElementById('nf-login-prompt').remove()" style="padding:11px 20px;background:#f1f5f9;color:#1e293b;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:14px;">
        Cancel
      </button>
    </div>`;
  // Close on backdrop click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}
