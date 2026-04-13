/**
 * New Ways of Seeing — main.js
 * Fetches content from Sanity's public read API and renders it into the page.
 * No build step, no dependencies.
 */

const PROJECT_ID = '2bp4wflj';
const DATASET    = 'production';
const API_BASE   = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

async function sanityQuery(groq, params = {}) {
  let url = `${API_BASE}?query=${encodeURIComponent(groq)}`;
  for (const [k, v] of Object.entries(params)) {
    url += `&${encodeURIComponent('$' + k)}=${encodeURIComponent(JSON.stringify(v))}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity API error: ${res.status}`);
  return (await res.json()).result;
}

// ── Sanity image URL helper ───────────────────────────────────────────────────

/**
 * Appends Sanity image transformation params to a CDN URL.
 * w/h = max dimension in CSS px (supply 2× for retina), q = quality (1-100).
 * auto=format lets the CDN serve WebP/AVIF where the browser supports it.
 */
function sanityImgUrl(url, { w, h, q = 75 } = {}) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (w) u.searchParams.set('w', String(w));
    if (h) u.searchParams.set('h', String(h));
    u.searchParams.set('q', String(q));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'max');
    return u.toString();
  } catch { return url; }
}

// ── Render helpers ────────────────────────────────────────────────────────────

function setText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/** Set a text field, italicising every occurrence of "New Ways of Seeing". */
function setIntroText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (!el) return;
  const escaped = value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  el.innerHTML = escaped.replace(/New Ways of Seeing/g, '<em>New Ways of Seeing</em>');
}

/** Build the auto-scrolling gallery slideshow. */
function renderGalleryImages(images) {
  if (!images || images.length === 0) return;
  const track = document.getElementById('gallery-track');
  if (!track) return;
  track.innerHTML = '';

  const valid = images.filter(img => img.url);
  if (!valid.length) return;

  // Duplicate slides for seamless infinite loop
  function makeSlide(imgData) {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    const img = document.createElement('img');
    img.src       = sanityImgUrl(imgData.url, { w: 760 });
    img.alt       = imgData.alt || '';
    img.draggable = false;
    slide.appendChild(img);
    return slide;
  }

  [...valid, ...valid].forEach(imgData => track.appendChild(makeSlide(imgData)));

  // ── Scroll engine ─────────────────────────────
  let pos = 0;
  let isDragging = false, isTouching = false;
  let dragStartX, dragStartPos;
  const SPEED = 0.5; // px per frame

  function tick() {
    if (!isDragging && !isTouching) {
      const half = track.scrollWidth / 2;
      pos = (pos + SPEED) % half;
      track.style.transform = `translateX(${-pos}px)`;
    }
    requestAnimationFrame(tick);
  }

  // Mouse drag (desktop)
  const outer = track.parentElement;
  outer.addEventListener('mousedown', e => {
    isDragging  = true;
    dragStartX  = e.clientX;
    dragStartPos = pos;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const half = track.scrollWidth / 2;
    pos = ((dragStartPos - (e.clientX - dragStartX)) % half + half) % half;
    track.style.transform = `translateX(${-pos}px)`;
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  // Touch (mobile)
  outer.addEventListener('touchstart', e => {
    isTouching  = true;
    dragStartX  = e.touches[0].clientX;
    dragStartPos = pos;
  }, { passive: true });
  outer.addEventListener('touchmove', e => {
    const half = track.scrollWidth / 2;
    pos = ((dragStartPos - (e.touches[0].clientX - dragStartX)) % half + half) % half;
    track.style.transform = `translateX(${-pos}px)`;
  }, { passive: true });
  outer.addEventListener('touchend', () => { isTouching = false; });

  requestAnimationFrame(tick);
}

/** Render the aftermovie player with poster image and "watch" CTA.
 *  Controls are hidden until the user clicks the pill — then the video plays
 *  and native controls appear. preload="none" means nothing is fetched upfront. */
function renderAftermovie(url, posterUrl) {
  const player = document.getElementById('aftermovie-player');
  if (!player || !url) return;

  const video = document.createElement('video');
  video.src         = url;
  video.preload     = 'none';
  video.playsInline = true;
  video.controls    = false;
  if (posterUrl) video.poster = sanityImgUrl(posterUrl, { w: 1400, q: 80 });

  // "watch the aftermovie" pill — same style as original Figma design
  const cta = document.createElement('button');
  cta.className   = 'video-label';
  cta.textContent = 'watch the aftermovie';

  // Transparent overlay — sits above the video, captures clicks reliably
  // (video elements don't always propagate click events when controls=false)
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;z-index:3;cursor:pointer;';

  function startPlay() {
    overlay.remove();
    video.controls = true;
    video.play();
    cta.style.display = 'none';
    player.classList.add('is-playing');
  }

  overlay.addEventListener('click', startPlay);
  cta.addEventListener('click', e => { e.stopPropagation(); startPlay(); });

  // Also handle native play (e.g. autoplay after preload)
  video.addEventListener('play', () => {
    overlay.remove();
    cta.style.display = 'none';
    player.classList.add('is-playing');
  });

  const placeholder = player.querySelector('.video-placeholder');
  if (placeholder) placeholder.replaceWith(video);
  player.appendChild(cta);
  player.appendChild(overlay); // must be last so it sits on top
}

/** Render speaker cards into the grid. */
function renderSpeakers(speakers) {
  if (!speakers || speakers.length === 0) return;
  _speakersList = speakers.filter(s => s.slug).map(s => ({ name: s.name, slug: s.slug }));
  const container = document.getElementById('speakers-grid');
  if (!container) return;
  container.innerHTML = '';

  speakers.forEach(speaker => {
    const card = document.createElement('a');
    card.className = 'speaker-card';
    // Keep href for SEO / right-click open-in-tab, but intercept left-clicks
    if (speaker.slug) {
      card.href = `/speaker/?slug=${encodeURIComponent(speaker.slug)}`;
      card.addEventListener('click', e => {
        e.preventDefault();
        openSpeakerModal(speaker.slug);
      });
    }

    const name = document.createElement('span');
    name.className   = 'speaker-name';
    name.textContent = speaker.name || '';

    const photoWrap = document.createElement('div');
    photoWrap.className = 'speaker-photo';
    if (speaker.photoUrl) {
      const img = document.createElement('img');
      img.src     = sanityImgUrl(speaker.photoUrl, { w: 520 });
      img.alt     = speaker.name || '';
      img.loading = 'lazy';
      photoWrap.appendChild(img);
    }

    const role = document.createElement('span');
    role.className   = 'speaker-role';
    role.textContent = speaker.role || '';

    card.appendChild(name);
    card.appendChild(photoWrap);
    card.appendChild(role);
    container.appendChild(card);
  });
}

// ── Speaker modal ─────────────────────────────────────────────────────────────

function closeSpeakerModal() {
  const modal = document.getElementById('speaker-modal');
  if (!modal || !modal.classList.contains('is-open')) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  document.title = 'New Ways of Seeing';
  history.pushState({}, '', '/');
  // Restore backdrop to scroll-driven state
  if (_backdropCanvas) {
    _backdropCanvas.style.transition = 'filter 0.7s ease';
    const quoteEl    = document.querySelector('.quote-wrap');
    const playlistEl = document.querySelector('.playlist-section');
    const pastQuote  = quoteEl    && quoteEl.getBoundingClientRect().bottom < 0;
    const pastThemes = playlistEl && playlistEl.getBoundingClientRect().top  < window.innerHeight;
    _backdropCanvas.style.filter = (!pastQuote || pastThemes)
      ? 'brightness(1) saturate(1)'
      : 'brightness(0.3) saturate(1.2)';
  }
}

async function openSpeakerModal(slug) {
  // Ensure modal container exists (created once, reused)
  let modal = document.getElementById('speaker-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'speaker-modal';
    modal.className = 'speaker-modal';
    document.body.appendChild(modal);

    // Keyboard: Escape closes, arrows navigate between speakers
    document.addEventListener('keydown', e => {
      const m = document.getElementById('speaker-modal');
      if (!m?.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeSpeakerModal(); return; }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const currentSlug = new URLSearchParams(window.location.search).get('slug');
      const idx = _speakersList.findIndex(s => s.slug === currentSlug);
      if (idx === -1) return;
      if (e.key === 'ArrowRight' && idx < _speakersList.length - 1) {
        openSpeakerModal(_speakersList[idx + 1].slug);
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        openSpeakerModal(_speakersList[idx - 1].slug);
      }
    });

    // Close on click outside the content body
    modal.addEventListener('click', e => {
      if (!e.target.closest('.speaker-modal-body')) closeSpeakerModal();
    });

    // Handle browser back button
    window.addEventListener('popstate', () => {
      if (document.getElementById('speaker-modal')?.classList.contains('is-open')) {
        closeSpeakerModal();
      }
    });
  }

  // Build shell: close bar → header(name+role) → hero(photo+bio) → works row
  modal.innerHTML = `
    <div class="speaker-modal-close-bar">
      <button class="pill pill-white speaker-modal-close" id="speaker-modal-close">Back</button>
    </div>
    <div class="speaker-modal-body">
      <div class="speaker-modal-header">
        <h1 class="speaker-page-name" id="sm-name">—</h1>
        <p  class="speaker-page-role" id="sm-role"></p>
      </div>
      <div class="speaker-modal-hero">
        <div class="speaker-modal-photo" id="sm-photo"></div>
        <p class="speaker-modal-bio" id="sm-bio" style="display:none"></p>
      </div>
      <div class="speaker-works" id="sm-works"></div>
    </div>`;

  // Close button — stopPropagation so the backdrop-click handler doesn't double-fire
  document.getElementById('speaker-modal-close')
    .addEventListener('click', e => { e.stopPropagation(); closeSpeakerModal(); });

  // Push URL for deep-links / SEO
  history.pushState({ speakerSlug: slug }, '', `/speaker/?slug=${encodeURIComponent(slug)}`);

  // Dim (not blur) the canvas — backdrop-filter on the modal handles the blur
  if (_backdropCanvas) {
    _backdropCanvas.style.transition = 'filter 0.45s ease';
    _backdropCanvas.style.filter = 'brightness(0.25)';
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0;

  // Fetch and render speaker data
  try {
    const speaker = await sanityQuery(
      `*[_type == "speaker" && slug.current == $slug][0] {
        name, role, bio,
        "photoUrl": photo.asset->url,
        "workImages": workImages[] { "url": asset->url, alt }
      }`,
      { slug }
    );
    if (!speaker) return;

    document.title = `${speaker.name} — New Ways of Seeing`;

    const nameEl = document.getElementById('sm-name');
    if (nameEl) nameEl.textContent = speaker.name || '';

    const roleEl = document.getElementById('sm-role');
    if (roleEl) roleEl.textContent = speaker.role || '';

    const photoEl = document.getElementById('sm-photo');
    if (photoEl && speaker.photoUrl) {
      const img = document.createElement('img');
      img.src = sanityImgUrl(speaker.photoUrl, { w: 640, q: 80 });
      img.alt = speaker.name || '';
      photoEl.appendChild(img);
    }

    const bioEl = document.getElementById('sm-bio');
    if (bioEl && speaker.bio) {
      bioEl.textContent = speaker.bio;
      bioEl.style.display = '';
    }

    const worksEl = document.getElementById('sm-works');
    if (worksEl && speaker.workImages?.length) {
      speaker.workImages.forEach(imgData => {
        if (!imgData.url) return;
        const wrap = document.createElement('div');
        wrap.className = 'speaker-work-img'; // natural ratio — no forced aspect-ratio
        const img = document.createElement('img');
        img.src = sanityImgUrl(imgData.url, { h: 600, q: 80 }); img.alt = imgData.alt || ''; img.loading = 'lazy';
        wrap.appendChild(img);
        worksEl.appendChild(wrap);
      });
    }
  } catch (err) {
    console.warn('Could not load speaker:', err.message);
  }
}

/** Render theme cards. */
function renderThemes(themes) {
  if (!themes || themes.length === 0) return;
  const container = document.getElementById('themes-grid');
  if (!container) return;
  container.innerHTML = '';

  themes.forEach(theme => {
    const card = document.createElement('div');
    card.className = 'theme-card';

    if (theme.videoUrl) {
      const videoWrap = document.createElement('div');
      videoWrap.className = 'theme-video-wrap';
      const video = document.createElement('video');
      video.className   = 'theme-video';
      video.src         = theme.videoUrl;
      video.autoplay    = true;
      video.muted       = true;
      video.loop        = true;
      video.playsInline = true;
      videoWrap.appendChild(video);
      card.appendChild(videoWrap);
    }

    if (theme.description) {
      const desc = document.createElement('p');
      desc.className   = 'theme-description';
      desc.textContent = theme.description;
      card.appendChild(desc);
    }

    if (theme.participants && theme.participants.length) {
      const pax = document.createElement('p');
      pax.className   = 'theme-participants';
      pax.textContent = 'With: ' + theme.participants.join(', ');
      card.appendChild(pax);
    }

    container.appendChild(card);
  });
}

// ── Page modal (Support Us / Contact) ────────────────────────────────────────

function closePageModal() {
  const modal = document.getElementById('page-modal');
  if (!modal || !modal.classList.contains('is-open')) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  document.title = 'New Ways of Seeing';
  history.pushState({}, '', '/');
  if (_backdropCanvas) {
    _backdropCanvas.style.transition = 'filter 0.7s ease';
    const quoteEl    = document.querySelector('.quote-wrap');
    const playlistEl = document.querySelector('.playlist-section');
    const pastQuote  = quoteEl    && quoteEl.getBoundingClientRect().bottom < 0;
    const pastThemes = playlistEl && playlistEl.getBoundingClientRect().top  < window.innerHeight;
    _backdropCanvas.style.filter = (!pastQuote || pastThemes)
      ? 'brightness(1) saturate(1)'
      : 'brightness(0.3) saturate(1.2)';
  }
}

async function openPageModal(type) {
  let modal = document.getElementById('page-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'page-modal';
    modal.className = 'speaker-modal';
    document.body.appendChild(modal);

    document.addEventListener('keydown', e => {
      const m = document.getElementById('page-modal');
      if (!m?.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePageModal();
    });

    modal.addEventListener('click', e => {
      if (!e.target.closest('.speaker-modal-body')) closePageModal();
    });

    window.addEventListener('popstate', () => {
      if (document.getElementById('page-modal')?.classList.contains('is-open')) {
        closePageModal();
      }
    });
  }

  modal.innerHTML = `
    <div class="speaker-modal-close-bar">
      <button class="pill pill-white speaker-modal-close" id="page-modal-close">Back</button>
    </div>
    <div class="speaker-modal-body">
      <div class="page-modal-content" id="page-modal-content"></div>
    </div>`;

  document.getElementById('page-modal-close')
    .addEventListener('click', e => { e.stopPropagation(); closePageModal(); });

  const urlMap   = { support: '/support/', contact: '/contact/', edition2026: '/edition-2026/' };
  const titleMap = { support: 'Support Us', contact: 'Contact', edition2026: 'Edition 2, 2026' };
  history.pushState({ pageType: type }, '', urlMap[type] || '/');
  document.title = (titleMap[type] || '') + ' — New Ways of Seeing';

  if (_backdropCanvas) {
    _backdropCanvas.style.transition = 'filter 0.45s ease';
    _backdropCanvas.style.filter = 'brightness(0.25)';
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0;

  try {
    const content = document.getElementById('page-modal-content');
    if      (type === 'support')      await renderSupportContent(content);
    else if (type === 'edition2026')  await renderEdition2026Content(content);
    else                              await renderContactContent(content);
  } catch (err) {
    console.warn('Could not load page modal:', err.message);
  }
}

async function renderSupportContent(container) {
  const page = await sanityQuery(
    `*[_type == "supportPage" && _id == "supportPage"][0]{ title, intro, ways[] { title, description, ctaLabel, ctaUrl } }`
  );

  const titleEl = document.createElement('h1');
  titleEl.className   = 'page-modal-title';
  titleEl.textContent = (page && page.title) ? page.title : 'Support Us';
  container.appendChild(titleEl);

  if (page && page.intro) {
    const intro = document.createElement('p');
    intro.className   = 'page-modal-intro';
    intro.textContent = page.intro;
    container.appendChild(intro);
  }

  if (page && page.ways && page.ways.length) {
    const waysEl = document.createElement('div');
    waysEl.className = 'support-ways';
    page.ways.forEach(way => {
      const div = document.createElement('div');
      div.className = 'support-way';
      const t = document.createElement('h2');
      t.className   = 'support-way-title';
      t.textContent = way.title || '';
      div.appendChild(t);
      if (way.description) {
        const d = document.createElement('p');
        d.className   = 'support-way-desc';
        d.textContent = way.description;
        div.appendChild(d);
      }
      if (way.ctaUrl && way.ctaLabel) {
        const a = document.createElement('a');
        a.className   = 'register-cta';
        a.href        = way.ctaUrl;
        a.target      = '_blank';
        a.rel         = 'noopener noreferrer';
        a.textContent = way.ctaLabel;
        a.style.marginTop = '8px';
        a.style.alignSelf = 'flex-start';
        div.appendChild(a);
      }
      waysEl.appendChild(div);
    });
    container.appendChild(waysEl);
  }
}

async function renderContactContent(container) {
  const page = await sanityQuery(
    `*[_type == "contactPage" && _id == "contactPage"][0]{ title, intro, generalEmail, pressEmail }`
  );

  const titleEl = document.createElement('h1');
  titleEl.className   = 'page-modal-title';
  titleEl.textContent = (page && page.title) ? page.title : 'Contact';
  container.appendChild(titleEl);

  if (page && page.intro) {
    const intro = document.createElement('p');
    intro.className   = 'page-modal-intro';
    intro.textContent = page.intro;
    container.appendChild(intro);
  }

  const detailsEl = document.createElement('div');
  detailsEl.className = 'contact-details';
  const rows = [
    { label: 'General enquiries', value: page?.generalEmail, href: `mailto:${page?.generalEmail}` },
    { label: 'Press',             value: page?.pressEmail,   href: `mailto:${page?.pressEmail}` },
  ];
  rows.forEach(({ label, value, href }) => {
    if (!value) return;
    const row = document.createElement('div');
    row.className = 'contact-row';
    const lbl = document.createElement('span');
    lbl.className   = 'contact-label';
    lbl.textContent = label;
    const a = document.createElement('a');
    a.className   = 'contact-value';
    a.href        = href;
    a.textContent = value;
    row.appendChild(lbl);
    row.appendChild(a);
    detailsEl.appendChild(row);
  });
  container.appendChild(detailsEl);
}

async function renderEdition2026Content(container) {
  const page = await sanityQuery(
    `*[_type == "edition2026Page" && _id == "edition2026Page"][0]{ heroTitle, heroSubtitle, description, date, venue, registrationUrl }`
  );

  const titleEl = document.createElement('h1');
  titleEl.className   = 'page-modal-title';
  titleEl.textContent = (page && page.heroTitle) ? page.heroTitle : 'New Ways of Seeing\nEdition 2';
  container.appendChild(titleEl);

  if (page && page.heroSubtitle) {
    const sub = document.createElement('p');
    sub.className   = 'edition2026-subtitle';
    sub.textContent = page.heroSubtitle;
    container.appendChild(sub);
  }

  if (page && page.description) {
    const desc = document.createElement('p');
    desc.className   = 'page-modal-intro';
    desc.textContent = page.description;
    container.appendChild(desc);
  }

  if (page && (page.date || page.venue)) {
    const meta = document.createElement('p');
    meta.className   = 'edition2026-meta';
    meta.textContent = [page.date, page.venue].filter(Boolean).join(' · ');
    container.appendChild(meta);
  }

  if (page && page.registrationUrl) {
    const cta = document.createElement('a');
    cta.className   = 'register-cta';
    cta.href        = page.registrationUrl;
    cta.target      = '_blank';
    cta.rel         = 'noopener noreferrer';
    cta.textContent = 'Register Interest';
    container.appendChild(cta);
  }
}

/** Set or create a <meta> tag by name or property. */
function setMetaTag(nameOrProp, content) {
  if (!content) return;
  const isOg = nameOrProp.startsWith('og:') || nameOrProp.startsWith('twitter:');
  const attr  = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Apply CMS-driven metadata to <head>. */
function applyMeta(settings) {
  if (!settings) return;
  const { metaTitle, metaDescription, ogImageUrl, faviconUrl } = settings;

  const title = metaTitle || 'New Ways of Seeing';
  document.title = title;
  setMetaTag('og:title',          title);
  setMetaTag('twitter:title',     title);

  if (metaDescription) {
    setMetaTag('description',       metaDescription);
    setMetaTag('og:description',    metaDescription);
    setMetaTag('twitter:description', metaDescription);
  }

  if (ogImageUrl) {
    // Request a well-sized OG image from the Sanity CDN
    const imgUrl = sanityImgUrl(ogImageUrl, { w: 1200, h: 630, q: 85 });
    setMetaTag('og:image',       imgUrl);
    setMetaTag('twitter:image',  imgUrl);
    setMetaTag('twitter:card',   'summary_large_image');
  }

  if (faviconUrl) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = sanityImgUrl(faviconUrl, { w: 512, q: 90 });
  }
}

/** Wire footer / nav links from siteSettings. */
function applySettings(settings) {
  if (!settings) return;
  const { instagramUrl, contactEmail, mailingListUrl, supportUrl } = settings;

  if (instagramUrl) {
    document.querySelectorAll('[data-link="instagram"]').forEach(el => {
      el.href = instagramUrl; el.target = '_blank'; el.rel = 'noopener noreferrer';
    });
  }
  if (mailingListUrl) {
    document.querySelectorAll('[data-link="mailing"]').forEach(el => {
      el.href = mailingListUrl; el.target = '_blank'; el.rel = 'noopener noreferrer';
    });
  }
  if (contactEmail) {
    document.querySelectorAll('[data-link="contact"]').forEach(el => {
      el.href = `mailto:${contactEmail}`;
    });
  }
  if (supportUrl) {
    document.querySelectorAll('[data-link="support"]').forEach(el => {
      el.href = supportUrl; el.target = '_blank'; el.rel = 'noopener noreferrer';
    });
  }
}

// ── Mobile menu overlay ───────────────────────────────────────────────────────

function initMobileMenu() {
  const fab = document.getElementById('menu-fab');
  if (!fab) return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id        = 'menu-overlay';
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  const inner = document.createElement('div');
  inner.className = 'menu-overlay-inner';
  overlay.appendChild(inner);

  const ITEMS = [
    { label: 'who we are',            action: 'scroll', target: '#who' },
    { label: '2025 edition overview', action: 'scroll', target: '#overview' },
    { label: 'playlist',              action: 'scroll', target: '#playlist' },
    { label: 'support us',            action: 'modal',  target: 'support' },
    { label: 'contact',               action: 'modal',  target: 'contact' },
    { label: 'shop',                  action: 'link',   target: 'https://www.helloasso.com/associations/new-ways-of-seeing-revoir-le-voir/boutiques/the-new-ways-of-seeing-kiosk-1' },
    { label: 'register interest 2026',action: 'modal',  target: 'edition2026' },
  ];

  ITEMS.forEach(({ label, action, target }) => {
    const el = document.createElement(action === 'link' ? 'a' : 'button');
    el.className   = 'menu-overlay-link';
    el.textContent = label;
    if (action === 'link') { el.href = target; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    el.addEventListener('click', e => {
      if (action === 'link') return; // let it open naturally
      e.preventDefault();
      closeMenu();
      if (action === 'scroll') {
        const dest = document.querySelector(target);
        if (dest) dest.scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'modal') {
        openPageModal(target);
      }
    });
    inner.appendChild(el);
  });

  function openMenu() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (_backdropCanvas) {
      _backdropCanvas.style.transition = 'filter 0.45s ease';
      _backdropCanvas.style.filter = 'brightness(0.25)';
    }
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (_backdropCanvas) {
      _backdropCanvas.style.transition = 'filter 0.7s ease';
      const quoteEl    = document.querySelector('.quote-wrap');
      const playlistEl = document.querySelector('.playlist-section');
      const pastQuote  = quoteEl    && quoteEl.getBoundingClientRect().bottom < 0;
      const pastThemes = playlistEl && playlistEl.getBoundingClientRect().top  < window.innerHeight;
      _backdropCanvas.style.filter = (!pastQuote || pastThemes)
        ? 'brightness(1) saturate(1)'
        : 'brightness(0.3) saturate(1.2)';
    }
  }

  fab.addEventListener('click', () => {
    overlay.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', e => {
    if (!e.target.closest('.menu-overlay-inner')) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });
}

// ── Main fetch ────────────────────────────────────────────────────────────────

async function init() {
  initMobileMenu();
  try {
    const settled = await Promise.allSettled([

      sanityQuery(`
        *[_type == "whoWeAre"][0] {
          introText,
          participantQuote,
          aboutText,
          "galleryImages": galleryImages[] { "url": asset->url, alt }
        }
      `),

      sanityQuery(`
        *[_type == "edition"] | order(year desc)[0] {
          overviewDescription,
          "aftermovieUrl": aftermovie.asset->url,
          "posterUrl": aftermoviePoster.asset->url
        }
      `),

      sanityQuery(`
        *[_type == "speaker"] | order(_createdAt asc) {
          name,
          "slug": slug.current,
          role,
          "photoUrl": photo.asset->url
        }
      `),

      sanityQuery(`
        *[_type == "festivalTheme"] | order(order asc) {
          title,
          description,
          participants,
          "videoUrl": videoLoop.asset->url
        }
      `),

      sanityQuery(`
        *[_type == "siteSettings"][0] {
          instagramUrl, contactEmail, mailingListUrl, supportUrl,
          backdropType,
          "backdropVideoUrl": backdropVideo.asset->url,
          "backdropImageUrl": backdropImage.asset->url,
          metaTitle, metaDescription,
          "ogImageUrl": ogImage.asset->url,
          "faviconUrl": favicon.asset->url
        }
      `),

    ]);

    const val = (i) => settled[i].status === 'fulfilled' ? settled[i].value : null;
    const whoWeAre = val(0);
    const edition  = val(1);
    const speakers = val(2);
    const themes   = val(3);
    const settings = val(4);

    // Who We Are
    if (whoWeAre) {
      setIntroText('intro-text', whoWeAre.introText);
      setText('participant-quote', whoWeAre.participantQuote);
      setText('who-we-are-text', whoWeAre.aboutText);
      renderGalleryImages(whoWeAre.galleryImages);
    }

    // 2025 Edition Overview
    if (edition) {
      setText('edition-description', edition.overviewDescription);
      renderAftermovie(edition.aftermovieUrl, edition.posterUrl);
    }


    // Line-Up
    renderSpeakers(speakers);

    // Themes
    renderThemes(themes);

    // Links + metadata
    applySettings(settings);
    applyMeta(settings);

    // Intercept support/contact/edition-2026 nav + footer links → open as modal
    document.querySelectorAll('a[href="/support/"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openPageModal('support'); });
    });
    document.querySelectorAll('a[href="/contact/"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openPageModal('contact'); });
    });
    document.querySelectorAll('a[href="/edition-2026/"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openPageModal('edition2026'); });
    });

    // Backdrop + ripple effect
    const backdropSource = applyBackdrop(settings);
    initRipples(backdropSource);

  } catch (err) {
    console.warn('Could not load Sanity content:', err.message);
    const fallback = document.getElementById('backdrop-video');
    if (fallback) {
      fallback.src = 'public/videos/loop.mp4';
      fallback.load();
      fallback.play().catch(() => {});
      initRipples(fallback);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ── Backdrop (CMS-driven) ─────────────────────────────────────────────────────

/**
 * Switches the page backdrop based on siteSettings.
 * Returns the active media element (video or img) for the ripple effect.
 */
function applyBackdrop(settings) {
  const video = document.getElementById('backdrop-video');
  const img   = document.getElementById('backdrop-img');
  const { backdropType, backdropVideoUrl, backdropImageUrl } = settings || {};

  // ── Image backdrop ────────────────────────────────────────────────────────
  if (backdropType === 'image' && backdropImageUrl && img) {
    img.crossOrigin = 'anonymous';
    img.src         = sanityImgUrl(backdropImageUrl, { w: 1920, q: 70 });
    img.style.display = 'block';
    if (video) {
      // The video element has no src yet (set by JS only) — just remove it.
      video.remove();
    }
    return img;
  }

  // ── Video backdrop (default) ──────────────────────────────────────────────
  // src is set here — the HTML element has no <source> so nothing loaded yet.
  if (video) {
    const src = backdropVideoUrl || 'public/videos/loop.mp4';
    video.crossOrigin = 'anonymous';
    video.src         = src;
    video.load();
    video.play().catch(() => {});
  }
  return video;
}


// ════════════════════════════════════════════════
// WATER RIPPLE EFFECT
// ════════════════════════════════════════════════

/**
 * Start the WebGL water-ripple effect over the given media element
 * (either an HTMLVideoElement or HTMLImageElement).
 * Safe to call only once per page load.
 */
let _ripplesStarted  = false;
let _backdropCanvas  = null; // shared ref for modal blur
let _speakersList    = []; // [{name, slug}] in render order — for arrow navigation

function initRipples(source) {
  if (_ripplesStarted || !source) return;
  _ripplesStarted = true;

  const isVideo = source instanceof HTMLVideoElement;

  // ── Canvas overlay ────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'z-index:0', 'pointer-events:none', 'display:block',
    'transition:filter 0.9s ease',
  ].join(';');
  document.body.insertBefore(canvas, document.body.firstChild);
  _backdropCanvas = canvas;

  // ── Scroll-based backdrop dim ─────────────────
  // Dims below the quote, restores once past the themes section.
  const DIM    = 'brightness(0.3) saturate(1.2)';
  const NORMAL = 'brightness(1) saturate(1)';
  function updateBackdropFilter() {
    if (document.getElementById('speaker-modal')?.classList.contains('is-open')) return;
    const quoteEl    = document.querySelector('.quote-wrap');
    const playlistEl = document.querySelector('.playlist-section');
    const pastQuote  = quoteEl    && quoteEl.getBoundingClientRect().bottom < 0;
    const pastThemes = playlistEl && playlistEl.getBoundingClientRect().top  < window.innerHeight;
    canvas.style.filter = (!pastQuote || pastThemes) ? NORMAL : DIM;
  }
  window.addEventListener('scroll', updateBackdropFilter, { passive: true });

  // ── WebGL context ─────────────────────────────
  const gl = canvas.getContext('webgl', { alpha: false });
  if (!gl) { canvas.remove(); return; }

  // Prefer half-float (most widely supported + allows LINEAR filtering).
  // Fall back to float, then to byte.
  const halfExt       = gl.getExtension('OES_texture_half_float');
  const halfLinearExt = gl.getExtension('OES_texture_half_float_linear');
  const floatExt      = gl.getExtension('OES_texture_float');
  const floatLinearExt= gl.getExtension('OES_texture_float_linear');

  let simType, simFilter;
  if (halfExt) {
    simType   = halfExt.HALF_FLOAT_OES;
    simFilter = halfLinearExt ? gl.LINEAR : gl.NEAREST;
  } else if (floatExt) {
    simType   = gl.FLOAT;
    simFilter = floatLinearExt ? gl.LINEAR : gl.NEAREST;
  } else {
    simType   = gl.UNSIGNED_BYTE;
    simFilter = gl.LINEAR;
  }

  // ── Shader helpers ────────────────────────────
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  function mkProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER,   vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    return p;
  }
  function uloc(prog, name) { return gl.getUniformLocation(prog, name); }

  // Shared fullscreen quad
  const quadVS = `
    attribute vec2 a_pos;
    varying   vec2 v_uv;
    void main() {
      v_uv        = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  function bindQuad(prog) {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  // ── Simulation resolution ─────────────────────
  // 512 gives a much smoother gradient than 256; LINEAR filtering does the rest.
  const SIM_RES = 512;
  const texel   = [1 / SIM_RES, 1 / SIM_RES];

  // ── Shader programs ───────────────────────────

  // Drop: smooth circular splash stamped into the height field (red channel)
  const dropProg = mkProgram(quadVS, `
    precision highp float;
    uniform sampler2D u_tex;
    uniform vec2  u_center;
    uniform float u_radius;
    uniform float u_strength;
    varying vec2  v_uv;
    void main() {
      vec4  prev = texture2D(u_tex, v_uv);
      float dist = distance(v_uv, u_center);
      float drop = max(0.0, 1.0 - dist / u_radius);
      drop = (drop * drop * (3.0 - 2.0 * drop)) * u_strength;
      gl_FragColor = vec4(prev.r + drop, prev.g, 0.0, 1.0);
    }`);

  // Update: classic neighbour-averaging wave equation with damping
  const updateProg = mkProgram(quadVS, `
    precision highp float;
    uniform sampler2D u_tex;
    uniform vec2      u_texel;
    varying vec2      v_uv;
    void main() {
      float l   = texture2D(u_tex, v_uv - vec2(u_texel.x, 0.0)).r;
      float r   = texture2D(u_tex, v_uv + vec2(u_texel.x, 0.0)).r;
      float t   = texture2D(u_tex, v_uv - vec2(0.0, u_texel.y)).r;
      float b   = texture2D(u_tex, v_uv + vec2(0.0, u_texel.y)).r;
      float cur = texture2D(u_tex, v_uv).g;
      float next = (l + r + t + b) * 0.5 - cur;
      next *= 0.988; /* damping — tweak for longer/shorter ripple decay */
      gl_FragColor = vec4(texture2D(u_tex, v_uv).r, next, 0.0, 1.0);
    }`);

  // Render: displace the media texture using the ripple surface gradient.
  // u_coverScale implements object-fit:cover so portrait canvases (mobile)
  // don't show a stretched landscape video.
  const renderProg = mkProgram(quadVS, `
    precision highp float;
    uniform sampler2D u_media;
    uniform sampler2D u_sim;
    uniform vec2      u_texel;
    uniform float     u_perturbance;
    uniform vec2      u_coverScale;
    varying vec2      v_uv;
    void main() {
      float l = texture2D(u_sim, v_uv - vec2(u_texel.x, 0.0)).r;
      float r = texture2D(u_sim, v_uv + vec2(u_texel.x, 0.0)).r;
      float t = texture2D(u_sim, v_uv - vec2(0.0, u_texel.y)).r;
      float b = texture2D(u_sim, v_uv + vec2(0.0, u_texel.y)).r;
      vec2  uv_cover = (v_uv - 0.5) * u_coverScale + 0.5;
      vec2  offset   = vec2(r - l, b - t) * u_perturbance;
      gl_FragColor   = texture2D(u_media, uv_cover + offset);
    }`);

  // ── Ping-pong FBOs ────────────────────────────
  function makeFBO() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, simFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, simFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      SIM_RES, SIM_RES, 0, gl.RGBA, simType, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb };
  }

  let ping = makeFBO();
  let pong = makeFBO();

  // ── Media texture (video or image) ────────────
  const mediaTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, mediaTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // For images, upload once immediately (they don't change each frame)
  let imageUploaded = false;
  if (!isVideo) {
    function uploadImage() {
      gl.bindTexture(gl.TEXTURE_2D, mediaTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      imageUploaded = true;
    }
    if (source.complete && source.naturalWidth) {
      uploadImage();
    } else {
      source.addEventListener('load', uploadImage, { once: true });
    }
  }

  // ── Resize ────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Mouse interaction (radius varies inversely with speed) ───
  const DROP_RADIUS_MIN = 8  / SIM_RES;  // fast cursor → tight splash
  const DROP_RADIUS_MAX = 42 / SIM_RES;  // slow cursor → wide ripple
  const DROP_STRENGTH   = 0.7;
  let   pendingDrop     = null;
  let   prevMouseX = null, prevMouseY = null, prevMouseT = null;

  window.addEventListener('mousemove', e => {
    const x   = e.clientX / window.innerWidth;
    const y   = 1.0 - e.clientY / window.innerHeight;
    const now = performance.now();

    let radius = DROP_RADIUS_MAX;
    if (prevMouseX !== null && (now - prevMouseT) > 0) {
      const dx    = x - prevMouseX;
      const dy    = y - prevMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy) / (now - prevMouseT) * 1000;
      // speed ≈ 0 → MAX radius ; speed ≥ 3 normalised units/s → MIN radius
      const t = Math.min(speed / 3.0, 1.0);
      radius  = DROP_RADIUS_MAX - t * (DROP_RADIUS_MAX - DROP_RADIUS_MIN);
    }

    prevMouseX = x; prevMouseY = y; prevMouseT = now;
    pendingDrop = { x, y, radius };
  });

  // ── Render loop ───────────────────────────────
  function step() {
    requestAnimationFrame(step);

    // 1. Upload media texture
    if (isVideo) {
      if (source.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, mediaTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
    }
    // (images are uploaded on load; nothing to do here)

    // 2. Drop pass
    if (pendingDrop) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fb);
      gl.viewport(0, 0, SIM_RES, SIM_RES);
      gl.useProgram(dropProg);
      gl.uniform1i(uloc(dropProg, 'u_tex'), 0);
      gl.uniform2f(uloc(dropProg, 'u_center'), pendingDrop.x, pendingDrop.y);
      gl.uniform1f(uloc(dropProg, 'u_radius'),   pendingDrop.radius);
      gl.uniform1f(uloc(dropProg, 'u_strength'), DROP_STRENGTH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ping.tex);
      bindQuad(dropProg);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      [ping, pong] = [pong, ping];
      pendingDrop = null;
    }

    // 3. Update pass (wave equation)
    gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fb);
    gl.viewport(0, 0, SIM_RES, SIM_RES);
    gl.useProgram(updateProg);
    gl.uniform1i(uloc(updateProg, 'u_tex'), 0);
    gl.uniform2fv(uloc(updateProg, 'u_texel'), texel);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ping.tex);
    bindQuad(updateProg);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    [ping, pong] = [pong, ping];

    // 4. Render pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(renderProg);
    gl.uniform1i(uloc(renderProg, 'u_media'), 0);
    gl.uniform1i(uloc(renderProg, 'u_sim'),   1);
    gl.uniform2fv(uloc(renderProg, 'u_texel'), texel);
    gl.uniform1f(uloc(renderProg, 'u_perturbance'), 0.08);
    // object-fit: cover — scale UVs so the media fills the canvas without stretching
    {
      const mW = isVideo ? source.videoWidth  : source.naturalWidth;
      const mH = isVideo ? source.videoHeight : source.naturalHeight;
      let sx = 1.0, sy = 1.0;
      if (mW > 0 && mH > 0) {
        const cAR = canvas.width / canvas.height;
        const mAR = mW / mH;
        if (cAR > mAR) { sy = mAR / cAR; } // canvas wider → crop height
        else            { sx = cAR / mAR; } // canvas taller → crop width
      }
      gl.uniform2f(uloc(renderProg, 'u_coverScale'), sx, sy);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mediaTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ping.tex);
    bindQuad(renderProg);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Hide the original element — the WebGL canvas renders it instead
  source.style.opacity = '0';
  step();
}
