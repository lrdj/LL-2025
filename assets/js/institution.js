// Institution detail page logic
(function(){
  const { onReady, byId, setHTML, rel, loadScript } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    const container = byId('institution-container');
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const instIdParam = parseInt(urlParams.get('id'));
    if (!slug && !instIdParam) { setHTML('institution-container', '<div class="error">No institution specified</div>'); return; }
    loadInstitution(slug, instIdParam);
  });

  async function ensureLoader() {
    if (typeof DataLoader === 'undefined') {
      await loadScript(rel('/assets/data/data-loader.js'));
    }
    if (typeof DataLoader !== 'undefined') {
      DataLoader.baseUrl = rel('/assets/data');
      return true;
    }
    return false;
  }

  async function loadInstitution(slug, instIdParam) {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceLegacy = params.get('legacy') === '1';

      await ensureLoader();
      const institution = instIdParam ? await DataLoader.loadInstitutionById(instIdParam) : await DataLoader.loadInstitution(slug);
      if (!institution) { setHTML('institution-container', '<div class="error">Institution not found</div>'); return; }

      const instId = institution.id;
      const instSlug = (institution.slug || '').toLowerCase();

      let allInstitutionLectures = null;
      let asVenue = [];
      let asOrganizer = [];

      if (!forceLegacy) {
        try {
          const idxResp = await fetch(rel('/assets/data/index_institution_lectures.json'));
          if (idxResp.ok) {
            const indexMap = await idxResp.json();
            const slugs = indexMap[String(instId)] || [];
            const lectures = await DataLoader.loadLecturesBySlugs(slugs);
            const lectureIds = new Set();
            const combined = [];
            for (const lecture of lectures) {
              const v = lecture.venue; const o = lecture.organizer;
              const isVenue = v && ((v.id === instId) || (instSlug && (v.slug || '').toLowerCase() === instSlug));
              const isOrganizer = o && ((o.id === instId) || (instSlug && (o.slug || '').toLowerCase() === instSlug));
              const role = isVenue && isOrganizer ? 'both' : isVenue ? 'venue' : isOrganizer ? 'organizer' : null;
              if (role) {
                if (!lectureIds.has(lecture.id)) { lectureIds.add(lecture.id); combined.push({ ...lecture, role }); }
                else if (role === 'both') { const existing = combined.find(l => l.id === lecture.id); if (existing) existing.role = 'both'; }
              }
            }
            allInstitutionLectures = combined;
            asVenue = combined.filter(l => l.role === 'venue' || l.role === 'both');
            asOrganizer = combined.filter(l => l.role === 'organizer' || l.role === 'both');
          }
        } catch(_) {}
      }

      if (!allInstitutionLectures) {
        const all = await DataLoader.loadAllLectures();
        asVenue = all.filter(lecture => { const v = lecture.venue; if (!v) return false; const vSlug = (v.slug || '').toLowerCase(); return (v.id === instId) || (instSlug && vSlug === instSlug); });
        asOrganizer = all.filter(lecture => { const o = lecture.organizer; if (!o) return false; const oSlug = (o.slug || '').toLowerCase(); return (o.id === instId) || (instSlug && oSlug === instSlug); });
        const lectureIds = new Set();
        const combined = [];
        asVenue.forEach(lecture => { if (!lectureIds.has(lecture.id)) { lectureIds.add(lecture.id); combined.push({ ...lecture, role: 'venue' }); }});
        asOrganizer.forEach(lecture => { if (!lectureIds.has(lecture.id)) { lectureIds.add(lecture.id); combined.push({ ...lecture, role: 'organizer' }); } else { const existing = combined.find(l => l.id === lecture.id); if (existing) existing.role = 'both'; }});
        allInstitutionLectures = combined;
      }

      renderInstitution(institution, allInstitutionLectures, asVenue.length, asOrganizer.length);
    } catch (err) {
      console.error('Error loading institution:', err);
      setHTML('institution-container', '<div class="error">Error loading institution</div>');
    }
  }

  function renderInstitution(institution, lectures, venueCount, organizerCount) {
    const container = byId('institution-container');
    if (!container) return;
    (lectures || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    const speakersMap = new Map();
    (lectures || []).forEach(l => (l.speakers || []).forEach(s => { if (!speakersMap.has(s.id)) speakersMap.set(s.id, s); }));
    const uniqueSpeakers = Array.from(speakersMap.values());

    const topicsMap = new Map();
    (lectures || []).forEach(l => (l.topics || []).forEach(t => { if (!topicsMap.has(t.id)) topicsMap.set(t.id, t); }));
    const uniqueTopics = Array.from(topicsMap.values());

    const categoryCount = {};
    (lectures || []).forEach(l => { if (l.supercategory) categoryCount[l.supercategory] = (categoryCount[l.supercategory] || 0) + 1; });

    container.innerHTML = `
      <div class="container">
        <div class="institution-header">
          <h1 class="institution-name">${institution.name}</h1>
          ${(function(){
            const parts = [];
            if (institution.address1) parts.push(institution.address1);
            if (institution.address2) parts.push(institution.address2);
            if (institution.city) parts.push(institution.city);
            if (institution.county) parts.push(institution.county);
            if (institution.postcode) parts.push(institution.postcode);
            if (institution.country && institution.country !== 'United Kingdom') parts.push(institution.country);
            return parts.length ? `<p class=\"institution-address\">${parts.join(', ')}</p>` : '';
          })()}
          ${institution.telephone ? `<p class="institution-phone">Tel: ${institution.telephone}</p>` : ''}
          ${institution.url ? `<p class="institution-url"><a href="${institution.url}" target="_blank" rel="noopener">${institution.url}</a></p>` : ''}
        </div>
        <div class="institution-stats">
          <div class="stat-card"><div class="stat-number">${lectures.length}</div><div class="stat-label">Total Lectures</div></div>
          <div class="stat-card"><div class="stat-number">${venueCount}</div><div class="stat-label">As Venue</div></div>
          <div class="stat-card"><div class="stat-number">${organizerCount}</div><div class="stat-label">As Organizer</div></div>
          <div class="stat-card"><div class="stat-number">${uniqueSpeakers.length}</div><div class="stat-label">Speakers</div></div>
        </div>
        ${Object.keys(categoryCount).length ? `
          <div class="institution-categories">
            <h3>Lectures by Category</h3>
            <div class="category-list">
              ${Object.entries(categoryCount).sort((a,b)=>b[1]-a[1]).map(([cat,count]) => `<span class=\"category-badge\" data-category=\"${cat}\">${cat} (${count})</span>`).join('')}
            </div>
          </div>` : ''}
        ${uniqueTopics.length ? `
          <div class="institution-topics">
            <h3>Topics Covered</h3>
            <div class="topic-list">
              ${uniqueTopics.slice(0,20).map(t => `<a href="${rel('/topic/')}?id=${t.id}" class="topic-tag">${t.name}</a>`).join('')}
              ${uniqueTopics.length > 20 ? `<span class=\"more-topics\">+${uniqueTopics.length - 20} more</span>` : ''}
            </div>
          </div>` : ''}
        ${uniqueSpeakers.length ? `
          <div class="institution-speakers">
            <h3>Featured Speakers (${uniqueSpeakers.length})</h3>
            <div class="speakers-list">
              ${uniqueSpeakers.slice(0,20).map(s => `<a href="${rel('/speaker/')}?slug=${s.slug}" class="speaker-link">${s.name}</a>`).join('')}
              ${uniqueSpeakers.length > 20 ? `<span class=\"more-speakers\">+${uniqueSpeakers.length - 20} more</span>` : ''}
            </div>
          </div>` : ''}
        <div class="institution-lectures">
          <h2>Lectures (${lectures.length})</h2>
          <div class="lectures-list">
            ${(lectures || []).map(lecture => {
              const dateStr = lecture.date ? new Date(lecture.date).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' }) : 'Date TBA';
              const roleLabel = lecture.role === 'both' ? 'Venue & Organizer' : lecture.role === 'venue' ? 'Venue' : 'Organizer';
              return `
                <div class="lecture-item">
                  <div class="lecture-item-header">
                    <h3 class="lecture-item-title"><a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a></h3>
                    <span class="lecture-item-date">${dateStr}</span>
                  </div>
                  ${lecture.synopsis ? `<p class=\"lecture-item-synopsis\">${lecture.synopsis}</p>` : ''}
                  <div class="lecture-item-meta">
                    <span class="role-badge">${roleLabel}</span>
                    ${(lecture.speakers && lecture.speakers.length) ? `<span class=\"speakers-list-inline\">${lecture.speakers.map(s => s.name).join(', ')}</span>` : ''}
                    ${lecture.supercategory ? `<span class=\"category-badge small\" data-category=\"${lecture.supercategory}\">${lecture.supercategory}</span>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    document.title = `${institution.name} - The Lecture List`;
  }
})();

