import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import BackToTop from './BackToTop.jsx';

/* -------------------------------------------------------------------------- */
/* Shared SVG helpers — same line-art icons as the original implementation    */
/* -------------------------------------------------------------------------- */

const S = ({ children, strokeWidth = 2, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 39 19 13l9 13 4-6 13 19H3Z" />
    <path d="m13 21 6-8 6 8" />
    <path d="m28 26 4-6 4 6" />
    <circle cx="38" cy="9" r="2.4" fill="currentColor" stroke="none" />
  </svg>
);

const ArrowRight = () => <S><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></S>;
const PinIcon = () => <S><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></S>;
const SearchIcon = () => <S><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></S>;
const PlaneIcon = ({ strokeWidth = 1.8 }) => (
  <S strokeWidth={strokeWidth}>
    <path d="M12 2c.8 0 1.5.7 1.5 1.5v6l7 4v2l-7-2v4l2.5 1.8V22L12 20.5 8.5 22v-2.7L11 17.5v-4l-7 2v-2l7-4v-6C10.5 2.7 11.2 2 12 2Z" />
  </S>
);
const ShieldIcon = () => <S strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></S>;
const HeadsetIcon = () => (
  <S strokeWidth={1.8}>
    <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
    <path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2v2Z" />
    <path d="M3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2v2Z" />
    <path d="M19 18v1a3 3 0 0 1-3 3h-3" />
  </S>
);
const GlobeIcon = ({ strokeWidth = 1.7 }) => (
  <S strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18" />
    <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </S>
);
const CompassIcon = ({ strokeWidth = 1.7 }) => <S strokeWidth={strokeWidth}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></S>;
const HomeIcon = () => <S strokeWidth={1.7}><path d="M3 20h18M6 20V9l6-5 6 5v11M10 20v-5h4v5" /></S>;
const UsersIcon = ({ strokeWidth = 1.6 }) => (
  <S strokeWidth={strokeWidth}>
    <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M17 5.5a3 3 0 0 1 0 5.8M18 14.5a5.5 5.5 0 0 1 3.5 5.1" />
  </S>
);
const MailIcon = () => <S strokeWidth={1.8}><path d="M4 4h16v16H4z" /><path d="m4 6 8 7 8-7" /></S>;
const PhoneIcon = () => (
  <S strokeWidth={1.8}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  </S>
);
const InstagramIcon = () => <S strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></S>;
const FacebookIcon = () => <S strokeWidth={1.8}><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5v4h3v7h4v-7h3l1-4h-4V7.5A1.5 1.5 0 0 1 13.5 6H15V3Z" /></S>;
const XIcon = () => <S strokeWidth={1.8}><path d="M4 4 20 20M20 4 4 20" /></S>;

/* -------------------------------------------------------------------------- */
/* Destination data — identical content to the original section               */
/* -------------------------------------------------------------------------- */

const REGIONS = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

const DESTINATIONS = {
  Asia: [
    { name: 'Thailand', alt: 'Turquoise islands and beaches in Thailand', img: '1528181304800-259b08848526' },
    { name: 'Japan', alt: 'Mount Fuji rising above a Japanese landscape', img: '1493976040374-85c8e12f0c0e' },
    { name: 'Bali', alt: 'Balinese temple with a mountain backdrop', img: '1537996194471-e657df975ab4' },
    { name: 'Dubai', alt: 'Dubai skyline glowing at sunset', img: '1512453979798-5ea266f8880c' },
  ],
  Europe: [
    { name: 'Santorini', alt: 'Blue domes and white walls in Santorini', img: '1613395877344-13d4a8e0d49e' },
    { name: 'Amalfi Coast', alt: 'Colorful cliffs along the Amalfi Coast', img: '1516483638261-f4dbaf036963' },
    { name: 'Paris', alt: 'Paris cityscape at golden hour', img: '1502602898657-3e91760cbb34' },
    { name: 'Iceland', alt: 'Dramatic Icelandic landscape', img: '1476610182048-b716b8518aae' },
  ],
  'North America': [
    { name: 'Banff', alt: 'Turquoise lake in the Canadian Rockies', img: '1501785888041-af3ef285b470' },
    { name: 'New York', alt: 'New York skyline at dusk', img: '1449824913935-59a10b8d2000' },
    { name: 'Yosemite', alt: 'Granite cliffs and forest in Yosemite', img: '1500534314209-a25ddb2bd429' },
    { name: 'Mexico', alt: 'Sunny streets and architecture in Mexico', img: '1518105779142-d975f22f1b0a' },
  ],
  'South America': [
    { name: 'Rio de Janeiro', alt: 'Rio coastline and mountain peaks', img: '1483729558449-99ef09a8c325' },
    { name: 'Machu Picchu', alt: 'Ancient Inca citadel in the Andes', img: '1526392060635-9d6019884377' },
    { name: 'Patagonia', alt: 'Snowy peaks of Patagonia', img: '1464822759023-fed622ff2c3b' },
    { name: 'Buenos Aires', alt: 'Colorful streets of Buenos Aires', img: '1589909202802-8f4aadce1849' },
  ],
  Africa: [
    { name: 'Marrakech', alt: 'Ornate Moroccan architecture', img: '1597212618440-806262de4f6b' },
    { name: 'Cape Town', alt: 'Table Mountain above Cape Town', img: '1580060839134-75a5edca2e99' },
    { name: 'Safari', alt: 'Wildlife on an African safari', img: '1516426122078-c23e76319801' },
    { name: 'Egypt', alt: 'Ancient Egyptian monuments', img: '1572252009286-268acec5ca0a' },
  ],
  Oceania: [
    { name: 'Sydney', alt: 'Sydney harbour and opera house', img: '1506973035872-a4ec16b8e8d9' },
    { name: 'New Zealand', alt: 'Alpine lakes of New Zealand', img: '1464822759023-fed622ff2c3b' },
    { name: 'Fiji', alt: 'Clear turquoise water in Fiji', img: '1544551763-46a013bb70d5' },
    { name: 'Melbourne', alt: 'Street art and lanes in Melbourne', img: '1514395462725-fb4566210144' },
  ],
};

const imageUrl = (id, width = 900) => `/assets/images/${id}.jpg`;

/* -------------------------------------------------------------------------- */
/* Animated Destinations section                                               */
/* -------------------------------------------------------------------------- */

const indicatorSpring = { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 };

const cardVariants = {
  enter: ({ direction, reduced }) => ({
    x: reduced ? 0 : direction * 52,
    opacity: 0,
  }),
  center: ({ index, reduced }) => ({
    x: 0,
    opacity: 1,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 },
  }),
  exit: ({ direction, reduced }) => ({
    x: reduced ? 0 : -direction * 52,
    opacity: 0,
    transition: reduced ? { duration: 0 } : { duration: 0.42, ease: 'easeOut' },
  }),
};

function Destinations({ searchTerm }) {
  const [activeRegion, setActiveRegion] = useState('Asia');
  const [direction, setDirection] = useState(1);
  const tabRefs = useRef([]);
  const reduced = useReducedMotion();

  const selectRegion = useCallback((region) => {
    if (region === activeRegion) return; // clicking the active tab is a no-op
    setDirection(REGIONS.indexOf(region) > REGIONS.indexOf(activeRegion) ? 1 : -1);
    setActiveRegion(region);
  }, [activeRegion]);

  const handleTabKeyDown = (event, index) => {
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % REGIONS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + REGIONS.length) % REGIONS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = REGIONS.length - 1;
    if (next === null) return;
    event.preventDefault();
    selectRegion(REGIONS[next]);
    tabRefs.current[next]?.focus();
  };

  const visibleDestinations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return DESTINATIONS[activeRegion].filter((item) => item.name.toLowerCase().includes(term));
  }, [activeRegion, searchTerm]);

  return (
    <section className="destinations section" id="destinations" aria-labelledby="destinationsTitle">
      <div className="container">
        <div className="section-head center">
          <p className="section-kicker">Where to next?</p>
          <h2 id="destinationsTitle">Destinations</h2>
          <span className="gold-underline" aria-hidden="true" />
        </div>

        <LayoutGroup id="destination-tabs">
          <div className="tabs" role="tablist" aria-label="Choose a region">
            {REGIONS.map((region, index) => {
              const isActive = region === activeRegion;
              return (
                <button
                  key={region}
                  ref={(node) => { tabRefs.current[index] = node; }}
                  type="button"
                  role="tab"
                  className={`tab${isActive ? ' is-active' : ''}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectRegion(region)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-region-pill"
                      className="tab-indicator"
                      aria-hidden="true"
                      transition={reduced ? { duration: 0 } : indicatorSpring}
                    />
                  )}
                  <span className="tab-label">{region}</span>
                </button>
              );
            })}
          </div>

          <div className="destination-grid" role="tabpanel" aria-live="polite" tabIndex={0}>
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={{ direction, index: 0, reduced }}
            >
              {visibleDestinations.map((item, index) => (
                <motion.a
                  key={`${activeRegion}-${item.name}`}
                  href="#contact"
                  className="destination-card"
                  aria-label={`Plan a trip to ${item.name}`}
                  custom={{ direction, index, reduced }}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <img src={imageUrl(item.img)} alt={item.alt} loading="lazy" />
                  <span className="card-shade" aria-hidden="true" />
                  <span className="card-body">
                    <span className="card-label"><PinIcon />{item.name}</span>
                    <span className="card-arrow"><ArrowRight /></span>
                  </span>
                </motion.a>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {visibleDestinations.length === 0 && (
          <p className="search-empty">No destinations match your search. Try another place.</p>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { label: 'Home', href: '#top' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

function Header({ searchTerm, onSearchChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('#top');
  const searchRef = useRef(null);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

  useEffect(() => {
    const map = [
      { id: 'hero', nav: '#top' },
      { id: 'about', nav: '#about' },
      { id: 'destinations', nav: '#destinations' },
      { id: 'gallery', nav: '#gallery' },
      { id: 'contact', nav: '#contact' },
    ];
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = map.find((item) => item.id === entry.target.id);
        if (match) setActiveNav(match.nav);
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    map.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const navLinks = (mobile = false) => NAV_ITEMS.map((item) => (
    <a
      key={item.href}
      href={item.href}
      className={`nav-link${activeNav === item.href ? ' is-active' : ''}`}
      onClick={mobile ? closeAll : undefined}
    >
      {item.label}
    </a>
  ));

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="brand" href="#top">
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name">Travel Vibes</span>
            <span className="brand-tagline">EXPLORE · DISCOVER · EXPERIENCE</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <ul>{NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={`nav-link${activeNav === item.href ? ' is-active' : ''}`}>{item.label}</a>
            </li>
          ))}</ul>
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn search-toggle"
            type="button"
            aria-label="Search destinations"
            aria-expanded={searchOpen}
            aria-controls="searchPanel"
            onClick={() => {
              const willOpen = !searchOpen;
              setMenuOpen(false);
              setSearchOpen(willOpen);
              if (willOpen) requestAnimationFrame(() => searchRef.current?.focus());
            }}
          >
            <SearchIcon />
          </button>
          <a className="btn btn-gold btn-small" href="#contact">Plan Your Trip</a>
          <button
            className={`icon-btn menu-toggle${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobileNav"
            onClick={() => { setSearchOpen(false); setMenuOpen((open) => !open); }}
          >
            <S className="icon-menu"><path d="M4 7h16M4 12h16M4 17h16" /></S>
            <S className="icon-close"><path d="M6 6l12 12M18 6 6 18" /></S>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="search-panel" id="searchPanel">
          <div className="container search-panel-inner">
            <SearchIcon />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search a destination (e.g. Japan, Bali…)"
              aria-label="Search destinations"
              autoComplete="off"
            />
            <button className="search-close" type="button" aria-label="Close search" title="Close search (Esc)" onClick={closeAll}>Close search</button>
          </div>
        </div>
      )}

      {menuOpen && (
        <nav className="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
          {navLinks(true)}
          <a className="btn btn-gold" href="#contact" onClick={closeAll}>Plan Your Trip</a>
        </nav>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Remaining sections — markup and styling preserved from the original build  */
/* -------------------------------------------------------------------------- */

function Hero() {
  const postcardRefs = useRef([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        postcardRefs.current.forEach((node, index) => {
          node?.style.setProperty('--py', `${(y * (index === 0 ? 0.045 : -0.035)).toFixed(1)}px`);
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  return (
    <section className="hero" id="hero" aria-labelledby="heroTitle">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Your adventure starts here</p>
          <h1 id="heroTitle">Explore the<br /><span className="gold">World</span><br />Together</h1>
          <p className="hero-text">Discover breathtaking destinations, create unforgettable memories, and let us plan your next adventure.</p>
          <a className="btn btn-gold btn-lg" href="#destinations">
            Explore Destinations <ArrowRight />
          </a>
        </div>

        <div className="hero-postcards" aria-hidden="true">
          <figure className="postcard postcard-santorini" ref={(node) => { postcardRefs.current[0] = node; }}>
            <img src="/assets/images/1613395877344-13d4a8e0d49e.jpg" alt="" />
            <figcaption>Santorini, Greece</figcaption>
          </figure>
          <figure className="postcard postcard-banff" ref={(node) => { postcardRefs.current[1] = node; }}>
            <img src="/assets/images/1501785888041-af3ef285b470.jpg" alt="" />
            <figcaption>Banff, Canada</figcaption>
          </figure>
          <svg className="postcard-route" viewBox="0 0 300 220" fill="none" aria-hidden="true">
            <path d="M20 180C80 120 120 200 190 90S270 40 288 30" stroke="#1689BE" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
            <path d="m280 26 10 2-7 7-1-5-4-2Z" fill="#FFC32D" />
          </svg>
        </div>
      </div>

      <div className="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none">
          <path d="M0 66C180 118 360 6 600 34c220 26 320 92 540 62 144-20 228-52 300-76v110H0V66Z" fill="#031D32" />
        </svg>
      </div>
    </section>
  );
}

const BENEFITS = [
  { title: 'Best Price Guarantee', text: 'Get the best deals for your dream trip.', icon: <PlaneIcon /> },
  { title: 'Safe & Secure', text: 'Your safety is our priority.', icon: <ShieldIcon /> },
  { title: '24/7 Support', text: "We're always here to help.", icon: <HeadsetIcon /> },
  { title: 'Expert Guides', text: 'Local experts for real experiences.', icon: <PinIcon /> },
];

function Trust() {
  return (
    <section className="trust section" id="trust" aria-labelledby="trustTitle">
      <div className="container">
        <h2 id="trustTitle" className="sr-only">Why travel with us</h2>
        <div className="benefits">
          {BENEFITS.map((item) => (
            <div className="benefit" key={item.title}>
              <span className="benefit-icon">{item.icon}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
            </div>
          ))}
        </div>

        <hr className="section-rule" />

        <div className="intro-grid">
          <div className="intro-copy">
            <p className="script-accent">More Than Just a Trip</p>
            <h2>Travel that <span className="gold">moves you</span></h2>
            <p className="body-text">We design journeys around the moments that stay with you — the quiet sunrise over a mountain lake, a rooftop dinner in a new city, a path you never expected to take. Every itinerary is shaped by your budget, your pace, and your sense of wonder.</p>
            <div className="mini-icons" aria-hidden="true">
              <span className="mini-icon"><GlobeIcon /></span>
              <span className="mini-icon"><S strokeWidth={1.7}><path d="M2 12.5 22 4l-8.5 20-2.8-8.7L2 12.5Z" /></S></span>
              <span className="mini-icon"><CompassIcon /></span>
              <span className="mini-icon"><HomeIcon /></span>
            </div>
            <a className="text-link" href="#about">Learn More <ArrowRight /></a>
          </div>

          <div className="photo-stack">
            <figure className="stack-photo stack-photo-back">
              <img src="/assets/images/1533105079780-92b9be482077.jpg" alt="Whitewashed coastal village above the sea" loading="lazy" />
            </figure>
            <figure className="stack-photo stack-photo-mid">
              <img src="/assets/images/1514282401047-d79a71a590e8.jpg" alt="Overwater bungalows in a turquoise lagoon" loading="lazy" />
            </figure>
            <figure className="stack-photo stack-photo-front">
              <img src="/assets/images/1464822759023-fed622ff2c3b.jpg" alt="Traveler in front of snow-covered alpine peaks" loading="lazy" />
            </figure>
            <svg className="stack-route" viewBox="0 0 420 140" fill="none" aria-hidden="true">
              <path d="M8 120C90 40 150 130 230 60s120-20 170-40" stroke="#1689BE" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
              <path d="m392 17 12 1-9 8-1-5-4-2Z" fill="#FFC32D" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about section" id="about" aria-labelledby="aboutTitle">
      <svg className="about-route" viewBox="0 0 1440 300" fill="none" aria-hidden="true">
        <path d="M-20 250C180 250 240 40 480 70s280 190 520 140 300-170 470-150" stroke="#1689BE" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 10" strokeLinecap="round" />
        <path d="m1405 56 16 2-11 9-2-6-5-2Z" fill="#FFC32D" />
      </svg>
      <div className="container about-grid">
        <div className="about-photo-wrap">
          <div className="about-photo-inner">
            <img src="/assets/images/1488646953014-85cb44e25828.jpg" alt="Traveler with a map planning a journey" loading="lazy" />
          </div>
          <span className="photo-pin" aria-hidden="true"><PinIcon /></span>
        </div>

        <div className="about-copy">
          <p className="section-kicker">Who we are</p>
          <h2 id="aboutTitle">About <span className="gold">Us</span></h2>
          <span className="gold-underline" aria-hidden="true" />
          <p className="body-text">Travel is more than a change of scenery — it is a new perspective. We are a team of explorers and planners who believe the best trips feel personal. That is why we listen first, then build an itinerary around your budget, your style, and the experiences you have been dreaming about.</p>
          <p className="body-text">From the first idea to the last sunset, we take care of the details so you can be present for every moment.</p>

          <div className="stats">
            <div className="stat">
              <span className="stat-icon"><S strokeWidth={1.6}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></S></span>
              <span className="stat-label">Trusted by Travelers</span>
            </div>
            <div className="stat">
              <span className="stat-icon"><UsersIcon /></span>
              <span className="stat-label">1000+ Happy Clients</span>
            </div>
            <div className="stat">
              <span className="stat-icon"><GlobeIcon strokeWidth={1.6} /></span>
              <span className="stat-label">Global Destinations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const GALLERY = [
  { img: '1470770841072-f978cf4d019e', alt: 'Cabin beside a still alpine lake', caption: 'Alpine calm' },
  { img: '1533105079780-92b9be482077', alt: 'Sunset over a Mediterranean coastal town', caption: 'Coastal light' },
  { img: '1514282401047-d79a71a590e8', alt: 'Overwater villas over clear blue water', caption: 'Island living' },
  { img: '1493976040374-85c8e12f0c0e', alt: 'Traditional Japanese pagoda with Mount Fuji', caption: 'Eastward' },
  { img: '1528181304800-259b08848526', alt: 'Palm-lined tropical beach in Thailand', caption: 'Tropical days' },
  { img: '1464822759023-fed622ff2c3b', alt: 'Snow-capped mountain range under a blue sky', caption: 'Above the clouds' },
];

function Gallery() {
  return (
    <section className="gallery section" id="gallery" aria-labelledby="galleryTitle">
      <div className="container">
        <div className="section-head center">
          <p className="script-accent">Collect moments</p>
          <h2 id="galleryTitle">Gallery</h2>
          <span className="gold-underline" aria-hidden="true" />
        </div>
        <div className="gallery-grid">
          {GALLERY.map((item) => (
            <figure className="gallery-item" key={item.img + item.caption}>
              <img src={imageUrl(item.img, 800)} alt={item.alt} loading="lazy" />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please add your name and a valid email so we can get back to you.');
      return;
    }
    setStatus(`Thanks, ${name}! Your trip inquiry is ready — we'll be in touch soon.`);
    form.reset();
  };

  return (
    <section className="contact section" id="contact" aria-labelledby="contactTitle">
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="section-kicker">Start planning</p>
          <h2 id="contactTitle">Let's plan your <span className="gold">next trip</span></h2>
          <span className="gold-underline" aria-hidden="true" />
          <p className="body-text">Tell us where you dream of going. We will craft a journey that fits your budget, your timing, and the way you love to explore.</p>
          <ul className="contact-details">
            <li><MailIcon /><span>hello@travelvibes.example</span></li>
            <li><PhoneIcon /><span>+1 (555) 204-7788</span></li>
            <li><PinIcon /><span>24/7 travel support, wherever you are</span></li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <label>Your name<input type="text" name="name" placeholder="Alex Traveler" required /></label>
            <label>Email address<input type="email" name="email" placeholder="alex@example.com" required /></label>
          </div>
          <div className="field-row">
            <label>Destination<input type="text" name="destination" placeholder="Where to?" /></label>
            <label>Travel month<input type="text" name="month" placeholder="e.g. October" /></label>
          </div>
          <label>Tell us more<textarea name="message" rows="4" placeholder="A little about the trip you imagine…" /></label>
          <button className="btn btn-gold btn-lg" type="submit">Send inquiry <ArrowRight /></button>
          <p className="form-status" role="status" aria-live="polite" hidden={!status}>{status}</p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <BrandMark />
            <span className="brand-text"><span className="brand-name">Travel Vibes</span><span className="brand-tagline">EXPLORE · DISCOVER · EXPERIENCE</span></span>
          </a>
          <p>Journeys designed around the moments that matter.</p>
        </div>
        <div className="footer-col">
          <h3>Explore</h3>
          <a href="#destinations">Destinations</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About us</a>
        </div>
        <div className="footer-col">
          <h3>Plan</h3>
          <a href="#contact">Plan your trip</a>
          <a href="#trust">Why Travel Vibes</a>
          <a href="#contact">Get in touch</a>
        </div>
        <div className="footer-col">
          <h3>Follow</h3>
          <div className="socials">
            <a href="#contact" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#contact" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#contact" aria-label="X"><XIcon /></a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Travel Vibes. Made for curious people.</span>
        <span>Explore · Discover · Experience</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* App                                                                         */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.body.classList.add('js-reveal');
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    items.forEach((el) => {
      if (el.dataset.delay) el.style.setProperty('--reveal-delay', `${el.dataset.delay}ms`);
    });

    const revealAllInView = () => {
      items.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40 && rect.bottom > 0) el.classList.add('is-visible');
      });
    };

    revealAllInView();
    window.addEventListener('scroll', revealAllInView, { passive: true });
    window.addEventListener('resize', revealAllInView);
    window.addEventListener('load', revealAllInView);
    return () => {
      window.removeEventListener('scroll', revealAllInView);
      window.removeEventListener('resize', revealAllInView);
      window.removeEventListener('load', revealAllInView);
    };
  }, []);

  return (
    <>
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main>
        <Hero />
        <Trust />
        <About />
        <Destinations searchTerm={searchTerm} />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
