/**
 * New Ways of Seeing — speaker.js
 * Reads ?slug= from the URL, fetches the speaker profile from Sanity,
 * and populates the page.
 */

const PROJECT_ID = '2bp4wflj';
const DATASET    = 'production';
const API_BASE   = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

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

async function sanityQuery(groq, params = {}) {
  const url = new URL(API_BASE);
  url.searchParams.set('query', groq);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`$${k}`, JSON.stringify(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sanity API error: ${res.status}`);
  return (await res.json()).result;
}

async function init() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) { window.location.href = '/'; return; }

  try {
    // Fetch speaker data + full ordered list in parallel
    const [speaker, allSpeakers] = await Promise.all([
      sanityQuery(
        `*[_type == "speaker" && slug.current == $slug][0] {
          name, role, bio,
          "photoUrl": photo.asset->url,
          "workImages": workImages[] { "url": asset->url, alt }
        }`,
        { slug }
      ),
      sanityQuery(
        `*[_type == "speaker"] | order(_createdAt asc) { name, "slug": slug.current }`
      ),
    ]);

    if (!speaker) { window.location.href = '/'; return; }

    // Page title
    document.title = `${speaker.name} — New Ways of Seeing`;

    // Name
    const nameEl = document.getElementById('speaker-page-name');
    if (nameEl) nameEl.textContent = speaker.name || '';

    // Role
    const roleEl = document.getElementById('speaker-page-role');
    if (roleEl) roleEl.textContent = speaker.role || '';

    // Photo
    const photoEl = document.getElementById('speaker-photo');
    if (photoEl && speaker.photoUrl) {
      const img = document.createElement('img');
      img.src = sanityImgUrl(speaker.photoUrl, { w: 640, q: 80 });
      img.alt = speaker.name || '';
      photoEl.appendChild(img);
    }

    // Bio (inside hero-info, next to photo)
    const bioEl = document.getElementById('speaker-bio');
    if (bioEl && speaker.bio) {
      bioEl.textContent = speaker.bio;
    } else if (bioEl) {
      bioEl.style.display = 'none';
    }

    // Work images — horizontal row, natural ratio
    const worksEl = document.getElementById('speaker-works');
    if (worksEl && speaker.workImages && speaker.workImages.length) {
      speaker.workImages.forEach(imgData => {
        if (!imgData.url) return;
        const wrap = document.createElement('div');
        wrap.className = 'speaker-work-img';
        const img = document.createElement('img');
        img.src     = sanityImgUrl(imgData.url, { h: 600, q: 80 });
        img.alt     = imgData.alt || '';
        img.loading = 'lazy';
        wrap.appendChild(img);
        worksEl.appendChild(wrap);
      });
    }

    // ── Arrow key navigation between speakers ──────────────────────────────
    const slugList = (allSpeakers || []).map(s => s.slug).filter(Boolean);
    const currentIdx = slugList.indexOf(slug);

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && currentIdx < slugList.length - 1) {
        window.location.href = `/speaker/?slug=${encodeURIComponent(slugList[currentIdx + 1])}`;
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        window.location.href = `/speaker/?slug=${encodeURIComponent(slugList[currentIdx - 1])}`;
      }
    });

  } catch (err) {
    console.warn('Could not load speaker:', err.message);
  }
}

init();
