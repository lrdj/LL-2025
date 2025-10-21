// Robust homepage logic with optional sections and safe DOM guards
(function () {
  const baseurl = (window.__BASEURL__ || '').replace(/\/$/, '');
  const demoNow = (window.__DEMO_NOW__ || '').trim();

  // Safe DOM helpers
  function byId(id) { return document.getElementById(id); }
  function setHTML(id, html) { const el = byId(id); if (el) el.innerHTML = html; }
  function setText(id, text) { const el = byId(id); if (el) el.textContent = text; }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function rel(path) { return baseurl + path; }

  onReady(() => {
    initCategoriesAndStats();
    initRecents();
    initHighlights();
  });

  // --- Categories + optional Stats ---
  function initCategoriesAndStats() {
    const catGrid = byId('category-grid');
    // If the section is missing, skip logic entirely
    if (!catGrid) return;

    const categories = [
      { slug: 'science', name: 'Science', count: 0 },
      { slug: 'arts', name: 'Arts', count: 0 },
      { slug: 'politics', name: 'Politics', count: 0 },
      { slug: 'business', name: 'Business', count: 0 },
      { slug: 'music', name: 'Music', count: 0 },
      { slug: 'religion', name: 'Religion', count: 0 },
      { slug: 'academic', name: 'Academic', count: 0 },
      { slug: 'sport', name: 'Sport', count: 0 },
      { slug: 'society', name: 'Society', count: 0 },
      { slug: 'children', name: 'Children', count: 0 },
      { slug: 'leisure', name: 'Leisure', count: 0 }
    ];

    // Render immediately with default counts; update after summary loads
    renderCategories(categories);

    fetch(rel('/assets/data/summary.json'))
      .then(r => r.json())
      .then(summary => {
        // Optional stats section; guard per element
        if (summary && typeof summary === 'object') {
          setText('lecture-count', (summary.total_lectures || 0).toLocaleString());
          setText('speaker-count', (summary.total_speakers || 0).toLocaleString());
          setText('topic-count', (summary.total_topics || 0).toLocaleString());
          setText('institution-count', (summary.total_institutions || 0).toLocaleString());

          if (summary.by_supercategory) {
            for (const cat of categories) {
              const v = summary.by_supercategory[cat.slug];
              if (typeof v === 'number') cat.count = v;
            }
          }
        }

        renderCategories(categories);
      })
      .catch(err => {
        console.error('Error loading summary:', err);
        // Still render categories with defaults
        renderCategories(categories);
      });

    function renderCategories(cats) {
      const el = byId('category-grid');
      if (!el) return;
      const html = cats.map(cat => `
        <a href="${rel('/browse/')}?category=${cat.slug}" class="category-card">
          <div class="category-image">
            <img src="${rel('/assets/images/supercategories/')}${cat.slug}.webp"
                 alt="${cat.name}"
                 onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--color-${cat.slug}), var(--color-${cat.slug}-light))';">
          </div>
          <div class="category-content">
            <h3 class="category-name">${cat.name}</h3>
            <p class="category-count">${cat.count > 0 ? cat.count.toLocaleString() + ' lectures' : 'View lectures'}</p>
          </div>
        </a>
      `).join('');
      el.innerHTML = html;
    }
  }

  // --- Recent lectures ---
  function initRecents() {
    const container = byId('recent-lectures');
    if (!container) return; // missing section is OK

    const params = new URLSearchParams(window.location.search);
    const forceLegacy = params.get('legacy') === '1';

    const renderRecentLectures = (lectures) => {
      const el = byId('recent-lectures');
      if (!el) return;
      const html = (lectures || []).map(lecture => {
        const sp = Array.isArray(lecture.speakers) ? lecture.speakers : [];
        const speakers = sp.slice(0, 2).map(s => s.name).join(', ');
        const moreCount = sp.length > 2 ? ` +${sp.length - 2}` : '';
        const dateStr = new Date(lecture.date || lecture.added).toLocaleDateString();
        const img = lecture.image_id ? `<img src="${rel('/assets/images/sm/')}${lecture.image_id}.webp" alt="${lecture.title}" onerror=\"this.style.display='none'\">` : '';
        return `
          <div class="lecture-card">
            <div class="lecture-card-image" style="background: linear-gradient(135deg, var(--color-${lecture.supercategory}), var(--color-${lecture.supercategory}-light));">
              ${img}
              <span class="lecture-card-category">${lecture.supercategory}</span>
            </div>
            <div class="lecture-card-content">
              <h3 class="lecture-card-title">
                <a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a>
              </h3>
              ${speakers ? `<div class="lecture-card-speakers">${speakers}${moreCount}</div>` : ''}
              ${lecture.synopsis ? `<p class="lecture-card-synopsis">${lecture.synopsis.substring(0, 120)}...</p>` : ''}
              <div class="lecture-card-meta">
                <span>${dateStr}</span>
              </div>
            </div>
          </div>`;
      }).join('');
      el.innerHTML = html;
    };

    if (!forceLegacy) {
      fetch(rel('/assets/data/view_recents.json'))
        .then(resp => (resp.ok ? resp.json() : Promise.reject(new Error('view_recents missing'))))
        .then(recents => renderRecentLectures((recents || []).slice(0, 10)))
        .catch(() => legacyFallback());
    } else {
      legacyFallback();
    }

    function legacyFallback() {
      fetch(rel('/assets/data/lectures.json'))
        .then(r => r.json())
        .then(lectures => {
          const recent = (lectures || [])
            .slice() // avoid in-place sort
            .sort((a, b) => new Date(b.date || b.added) - new Date(a.date || a.added))
            .slice(0, 10);
          renderRecentLectures(recent);
        })
        .catch(error => {
          console.error('Error loading lectures (fallback):', error);
          setHTML('recent-lectures', '<p>Error loading lectures.</p>');
        });
    }
  }

  // --- Highlights (Editor's pick / Today / This week) ---
  function initHighlights() {
    const highlightsGrid = byId('highlights-grid');
    if (!highlightsGrid) return; // optional section

    function getNowDate() {
      const params = new URLSearchParams(window.location.search);
      const override = params.get('now');
      const pick = (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) ? override
                : (demoNow && /^\d{4}-\d{2}-\d{2}$/.test(demoNow)) ? demoNow
                : null;
      return pick ? new Date(pick + 'T00:00:00') : new Date();
    }

    function parseDate(iso) {
      if (!iso) return null;
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
      if (!m) return null;
      const y = +m[1], mo = +m[2]-1, d = +m[3];
      const dt = new Date(Date.UTC(y, mo, d));
      return { y, m: mo+1, d, dt };
    }

    function dayOfYear(m, d, y) {
      const yy = y || 2001; // non-leap
      const date = new Date(Date.UTC(yy, m-1, d));
      const start = new Date(Date.UTC(yy, 0, 1));
      return Math.floor((date - start) / 86400000) + 1;
    }

    function weekWindow(now) {
      const dow = now.getUTCDay();
      const diffToMon = (dow + 6) % 7;
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMon));
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));
      return { start, end };
    }

    function inWeekByMonthDay(lectureMD, window, year) {
      const mapped = new Date(Date.UTC(year, lectureMD.m-1, lectureMD.d));
      return mapped >= window.start && mapped <= window.end;
    }

    function pickToday(lectures, now, curatedSlug) {
      const nowMD = { m: now.getUTCMonth() + 1, d: now.getUTCDate() };
      if (curatedSlug && lectures.bySlug[curatedSlug]) return lectures.bySlug[curatedSlug];
      const sameMD = lectures.list
        .filter(l => l.dateParts && l.dateParts.m === nowMD.m && l.dateParts.d === nowMD.d)
        .sort((a,b) => (b.dateParts?.y||0) - (a.dateParts?.y||0));
      if (sameMD.length) return sameMD[0];
      const target = dayOfYear(nowMD.m, nowMD.d);
      let best = null, bestDist = Infinity;
      for (const l of lectures.list) {
        if (!l.dateParts) continue;
        const doy = dayOfYear(l.dateParts.m, l.dateParts.d);
        const dist = Math.min(Math.abs(doy - target), 365 - Math.abs(doy - target));
        if (dist < bestDist) { bestDist = dist; best = l; }
      }
      return best || lectures.list[0];
    }

    function pickThisWeek(lectures, now, curatedSlugs) {
      if (Array.isArray(curatedSlugs) && curatedSlugs.length) {
        const arr = curatedSlugs.map(s => lectures.bySlug[s]).filter(Boolean);
        if (arr.length) return arr.slice(0, 3);
      }
      const ww = weekWindow(now);
      const year = now.getUTCFullYear();
      const inWeek = lectures.list
        .filter(l => l.dateParts && inWeekByMonthDay(l.dateParts, ww, year))
        .sort((a,b) => (b.dateParts?.y||0) - (a.dateParts?.y||0));
      if (inWeek.length) return inWeek.slice(0, 3);
      const dated = lectures.list.filter(l => l.dateParts).sort((a,b) => b.dateParts.dt - a.dateParts.dt);
      return dated.slice(0, 3);
    }

    function renderLectureCard(lecture) {
      const dateStr = lecture.dateParts?.dt ? new Date(lecture.dateParts.dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const sp = Array.isArray(lecture.speakers) ? lecture.speakers : [];
      const speakers = sp.slice(0,2).map(s => s.name).join(', ');
      const moreCount = sp.length > 2 ? ` +${sp.length - 2}` : '';
      return `
        <div class="lecture-card">
          <div class="lecture-card-image" style="background: linear-gradient(135deg, var(--color-${lecture.supercategory}), var(--color-${lecture.supercategory}-light));">
            ${lecture.image_id ? `<img src="${rel('/assets/images/sm/')}${lecture.image_id}.webp" alt="${lecture.title}" onerror=\"this.style.display='none'\">` : ''}
            <span class="lecture-card-category">${lecture.supercategory}</span>
          </div>
          <div class="lecture-card-content">
            <h3 class="lecture-card-title"><a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a></h3>
            ${speakers ? `<div class="lecture-card-speakers">${speakers}${moreCount}</div>` : ''}
            ${lecture.synopsis ? `<p class="lecture-card-synopsis">${lecture.synopsis.substring(0, 120)}...</p>` : ''}
            <div class="lecture-card-meta"><span>${dateStr}</span></div>
          </div>
        </div>`;
    }

    function renderWeekList(lectures) {
      const items = lectures.map(l => `
        <li>
          <a href="${rel('/lecture/')}?slug=${l.slug}">${l.title}</a>
          <span class="week-item-meta">${l.dateParts ? new Date(l.dateParts.dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span>
        </li>
      `).join('');
      return `<div class="week-card"><ul class="week-list">${items}</ul></div>`;
    }

    Promise.all([
      fetch(rel('/assets/data/lectures.json')).then(r => r.json()),
      fetch(rel('/assets/data/home_highlights.json')).then(r => r.json()).catch(() => ({ }))
    ])
    .then(([lectures, highlights]) => {
      const list = (lectures || []).map(l => ({ ...l, dateParts: parseDate(l.date || '') }));
      const bySlug = Object.fromEntries(list.map(l => [l.slug, l]));
      const now = getNowDate();

      const editorsPick = (highlights.editors_pick && highlights.editors_pick.slug && bySlug[highlights.editors_pick.slug])
        ? bySlug[highlights.editors_pick.slug]
        : list.filter(l => l.image_id && l.dateParts).sort((a,b) => b.dateParts.dt - a.dateParts.dt)[0] || list[0];

      const todayPick = pickToday({ list, bySlug }, now, highlights.today || null);
      const weekPicks = pickThisWeek({ list, bySlug }, now, highlights.this_week || []);

      function toISODate(d) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth()+1).padStart(2,'0');
        const da = String(d.getUTCDate()).padStart(2,'0');
        return `${y}-${m}-${da}`;
      }

      const nowISO = toISODate(now);
      const mainWeek = weekPicks[0];
      const weekMoreCount = Math.max(0, weekPicks.length - 1);

      const html = `
        <article class="highlight">
          <h3 class="highlight-label">Editor's pick</h3>
          ${renderLectureCard(editorsPick)}
          ${highlights.editors_pick && highlights.editors_pick.blurb ? `<p class=\"highlight-blurb\">${highlights.editors_pick.blurb}</p>` : ''}
        </article>
        <article class="highlight">
          <h3 class="highlight-label">Go today</h3>
          ${renderLectureCard(todayPick)}
        </article>
        <article class="highlight">
          <h3 class="highlight-label">Go this week</h3>
          ${mainWeek ? renderLectureCard(mainWeek) : ''}
          ${weekMoreCount > 0 ? `<div class=\"week-more\"><a href=\"${rel('/browse/')}?now=${encodeURIComponent(nowISO)}#this-week\">+${weekMoreCount} more this week</a></div>` : ''}
        </article>`;
      highlightsGrid.innerHTML = html;
    })
    .catch(err => {
      console.error('Error loading highlights:', err);
      highlightsGrid.innerHTML = '<p>Error loading highlights.</p>';
    });
  }
})();

