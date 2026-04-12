/**
 * New Ways of Seeing — edition2026.js
 * Fetches the 2026 edition page content from Sanity.
 */

const PROJECT_ID = '2bp4wflj';
const DATASET    = 'production';
const API_BASE   = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

async function sanityQuery(groq) {
  const url = `${API_BASE}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity API error: ${res.status}`);
  return (await res.json()).result;
}

async function init() {
  try {
    const page = await sanityQuery(`
      *[_type == "edition2026Page" && _id == "edition2026Page"][0] {
        heroTitle, heroSubtitle, description, date, venue, registrationUrl
      }
    `);

    if (!page) return;

    if (page.heroTitle) {
      const el = document.getElementById('edition2026-title');
      if (el) el.textContent = page.heroTitle;
      document.title = `${page.heroTitle} — New Ways of Seeing`;
    }

    if (page.heroSubtitle) {
      const el = document.getElementById('edition2026-subtitle');
      if (el) el.textContent = page.heroSubtitle;
    }

    if (page.description) {
      const el = document.getElementById('edition2026-description');
      if (el) el.textContent = page.description;
    }

    if (page.date || page.venue) {
      const el = document.getElementById('edition2026-meta');
      if (el) el.textContent = [page.date, page.venue].filter(Boolean).join(' · ');
    }

    if (page.registrationUrl) {
      const el = document.getElementById('edition2026-cta');
      if (el) {
        el.href = page.registrationUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        el.style.display = 'inline-flex';
      }
    }

  } catch (err) {
    console.warn('Could not load 2026 page content:', err.message);
  }
}

init();
