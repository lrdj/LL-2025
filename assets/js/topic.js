// Topic detail page logic
(function(){
  const { onReady, byId, setHTML, rel, fetchJSON, loadScript } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    const container = byId('topic-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const topicId = parseInt(urlParams.get('id'));
    if (!topicId) {
      setHTML('topic-container', '<div class="error">No topic specified</div>');
      return;
    }

    loadTopic(topicId);
  });

  async function loadTopic(topicId) {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceLegacy = params.get('legacy') === '1';

      const topics = await fetchJSON('/assets/data/topics.json');
      const topic = (topics || []).find(t => t.id === topicId);
      if (!topic) {
        setHTML('topic-container', '<div class="error">Topic not found</div>');
        return;
      }

      let topicLectures = null;
      if (!forceLegacy) {
        try {
          const idxResp = await fetch(rel('/assets/data/index_topic_lectures.json'));
          if (idxResp.ok) {
            const indexMap = await idxResp.json();
            const slugs = indexMap[String(topicId)] || [];
            if (typeof DataLoader === 'undefined') {
              await loadScript(rel('/assets/data/data-loader.js'));
            }
            if (typeof DataLoader !== 'undefined') {
              DataLoader.baseUrl = rel('/assets/data');
              topicLectures = await DataLoader.loadLecturesBySlugs(slugs);
            }
          }
        } catch(_) {}
      }

      if (!topicLectures) {
        const allLectures = await fetchJSON('/assets/data/lectures.json');
        topicLectures = (allLectures || []).filter(lecture => lecture.topics && lecture.topics.some(t => t.id === topicId));
      }

      const pathPrefix = topic.path.split('/').slice(0, -1).join('/');
      const relatedTopics = (topics || []).filter(t => t.id !== topicId && t.path.startsWith(pathPrefix) && t.path !== topic.path).slice(0, 10);

      renderTopic(topic, topicLectures, relatedTopics);
    } catch (err) {
      console.error('Error loading topic:', err);
      setHTML('topic-container', '<div class="error">Error loading topic</div>');
    }
  }

  function renderTopic(topic, lectures, relatedTopics) {
    const container = byId('topic-container');
    if (!container) return;
    (lectures || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    const speakersMap = new Map();
    (lectures || []).forEach(lecture => {
      (lecture.speakers || []).forEach(s => { if (!speakersMap.has(s.id)) speakersMap.set(s.id, s); });
    });
    const uniqueSpeakers = Array.from(speakersMap.values());

    const venuesMap = new Map();
    (lectures || []).forEach(lecture => { const v = lecture.venue; if (v && !venuesMap.has(v.id)) venuesMap.set(v.id, v); });
    const uniqueVenues = Array.from(venuesMap.values());

    container.innerHTML = `
      <div class="container">
        <div class="topic-header">
          <div class="topic-breadcrumb">
            <a href="${rel('/topics/')}">Topics</a>
            ${topic.path.split('/').filter(p => p).slice(0, -1).map(p => `<span class="breadcrumb-sep">›</span><span class="breadcrumb-item">${p}</span>`).join('')}
          </div>
          <h1 class="topic-name">${topic.name}</h1>
          <p class="topic-path">${topic.path}</p>
        </div>
        <div class="topic-stats">
          <div class="stat-card"><div class="stat-number">${lectures.length}</div><div class="stat-label">Lectures</div></div>
          <div class="stat-card"><div class="stat-number">${uniqueSpeakers.length}</div><div class="stat-label">Speakers</div></div>
          <div class="stat-card"><div class="stat-number">${uniqueVenues.length}</div><div class="stat-label">Venues</div></div>
        </div>
        ${relatedTopics.length ? `
          <div class="related-topics">
            <h3>Related Topics</h3>
            <div class="topic-tags">
              ${relatedTopics.map(t => `<a href="${rel('/topic/')}?id=${t.id}" class="topic-tag">${t.name}</a>`).join('')}
            </div>
          </div>` : ''}
        <div class="topic-lectures">
          <h2>Lectures (${lectures.length})</h2>
          <div class="lectures-list">
            ${(lectures || []).map(lecture => {
              const dateStr = lecture.date ? new Date(lecture.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date TBA';
              return `
                <div class="lecture-item">
                  <div class="lecture-item-header">
                    <h3 class="lecture-item-title"><a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a></h3>
                    <span class="lecture-item-date">${dateStr}</span>
                  </div>
                  ${(lecture.speakers && lecture.speakers.length) ? `<div class="lecture-item-speakers">${lecture.speakers.map(s => `<a href=\"${rel('/speaker/')}?slug=${s.slug}\" class=\"speaker-link\">${s.name}</a>`).join(', ')}</div>` : ''}
                  ${lecture.synopsis ? `<p class="lecture-item-synopsis">${lecture.synopsis}</p>` : ''}
                  <div class="lecture-item-meta">
                    ${lecture.venue ? `<span class=\"venue-name\"><a href=\"${rel('/institution/')}?id=${lecture.venue.id}&slug=${lecture.venue.slug}\">${lecture.venue.name}</a></span>` : ''}
                    ${lecture.supercategory ? `<span class=\"category-badge\" data-category=\"${lecture.supercategory}\">${lecture.supercategory}</span>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    document.title = `${topic.name} - The Lecture List`;
  }
})();

