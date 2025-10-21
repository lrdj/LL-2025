// Speaker detail page logic
(function(){
  const { onReady, byId, setHTML, rel, loadScript, fetchJSON } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    const container = byId('speaker-container');
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (!slug) { setHTML('speaker-container', '<div class="error">No speaker specified</div>'); return; }
    loadSpeaker(slug);
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

  async function loadSpeaker(slug) {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceLegacy = params.get('legacy') === '1';

      await ensureLoader();
      const speaker = await DataLoader.loadSpeaker(slug);
      if (!speaker) { setHTML('speaker-container', '<div class="error">Speaker not found</div>'); return; }

      let speakerLectures = null;
      if (!forceLegacy) {
        try {
          const idxResp = await fetch(rel('/assets/data/index_speaker_lectures.json'));
          if (idxResp.ok) {
            const indexMap = await idxResp.json();
            const slugs = indexMap[String(speaker.id)] || [];
            speakerLectures = await DataLoader.loadLecturesBySlugs(slugs);
          }
        } catch(_) {}
      }
      if (!speakerLectures) {
        const all = await DataLoader.loadAllLectures();
        speakerLectures = (all || []).filter(lec => lec.speakers && lec.speakers.some(s => s.id === speaker.id));
      }

      renderSpeaker(speaker, speakerLectures);
    } catch (err) {
      console.error('Error loading speaker:', err);
      setHTML('speaker-container', '<div class="error">Error loading speaker</div>');
    }
  }

  function renderSpeaker(speaker, lectures) {
    const container = byId('speaker-container');
    if (!container) return;
    (lectures || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    const topicsMap = new Map();
    (lectures || []).forEach(l => (l.topics || []).forEach(t => { if (!topicsMap.has(t.id)) topicsMap.set(t.id, t); }));
    const uniqueTopics = Array.from(topicsMap.values());

    const venuesMap = new Map();
    (lectures || []).forEach(l => { const v = l.venue; if (v && !venuesMap.has(v.id)) venuesMap.set(v.id, v); });
    const uniqueVenues = Array.from(venuesMap.values());

    const categoryCount = {};
    (lectures || []).forEach(l => { if (l.supercategory) categoryCount[l.supercategory] = (categoryCount[l.supercategory] || 0) + 1; });

    container.innerHTML = `
      <div class="container">
        <div class="speaker-header">
          <h1 class="speaker-name">${speaker.name}</h1>
          ${speaker.title ? `<p class="speaker-title-text">${speaker.title}</p>` : ''}
          ${speaker.url ? `<p class="speaker-url"><a href="${speaker.url}" target="_blank" rel="noopener">${speaker.url}</a></p>` : ''}
        </div>
        ${speaker.bio && speaker.bio !== '[Null]' ? `<div class="speaker-bio"><h2>Biography</h2><p>${speaker.bio}</p></div>` : ''}
        <div class="speaker-stats">
          <div class="stat-card"><div class="stat-number">${lectures.length}</div><div class="stat-label">Lectures</div></div>
          <div class="stat-card"><div class="stat-number">${uniqueTopics.length}</div><div class="stat-label">Topics</div></div>
          <div class="stat-card"><div class="stat-number">${uniqueVenues.length}</div><div class="stat-label">Venues</div></div>
        </div>
        ${Object.keys(categoryCount).length ? `
          <div class="speaker-categories">
            <h3>Lectures by Category</h3>
            <div class="category-list">
              ${Object.entries(categoryCount).sort((a,b) => b[1]-a[1]).map(([cat,count]) => `<span class=\"category-badge\" data-category=\"${cat}\">${cat} (${count})</span>`).join('')}
            </div>
          </div>` : ''}
        ${uniqueTopics.length ? `
          <div class="speaker-topics">
            <h3>Topics Covered</h3>
            <div class="topic-list">
              ${uniqueTopics.slice(0,20).map(t => `<a href="${rel('/topic/')}?id=${t.id}" class="topic-tag">${t.name}</a>`).join('')}
              ${uniqueTopics.length > 20 ? `<span class=\"more-topics\">+${uniqueTopics.length - 20} more</span>` : ''}
            </div>
          </div>` : ''}
        <div class="speaker-lectures">
          <h2>Lectures (${lectures.length})</h2>
          <div class="lectures-list">
            ${(lectures || []).map(lecture => {
              const dateStr = lecture.date ? new Date(lecture.date).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' }) : 'Date TBA';
              return `
                <div class="lecture-item">
                  <div class="lecture-item-header">
                    <h3 class="lecture-item-title"><a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a></h3>
                    <span class="lecture-item-date">${dateStr}</span>
                  </div>
                  ${lecture.synopsis ? `<p class=\"lecture-item-synopsis\">${lecture.synopsis}</p>` : ''}
                  <div class="lecture-item-meta">
                    ${lecture.venue ? `<span class=\"venue-name\">${lecture.venue.name}</span>` : ''}
                    ${lecture.supercategory ? `<span class=\"category-badge small\" data-category=\"${lecture.supercategory}\">${lecture.supercategory}</span>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    document.title = `${speaker.name} - The Lecture List`;
  }
})();

