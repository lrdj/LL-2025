// Speakers page logic with robust guards
(function(){
  const { onReady, byId, setText, setHTML, rel, fetchJSON } = window.__LL__ || {};
  if (!onReady) return; // utils not loaded

  onReady(() => {
    const searchInput = byId('speaker-search');
    const speakersList = byId('speakers-list');
    const countEl = byId('speaker-count');
    if (!speakersList) return; // page section not present

    let allSpeakers = [];

    fetchJSON('/assets/data/speakers.json')
      .then(speakers => {
        allSpeakers = (speakers || []).slice().sort((a, b) => (a.name||'').localeCompare(b.name||''));
        if (countEl) setText('speaker-count', `Browse ${allSpeakers.length.toLocaleString()} speakers who have given lectures in our archive.`);
        renderSpeakers(allSpeakers);
      })
      .catch(err => {
        console.error('Error loading speakers:', err);
        if (speakersList) speakersList.innerHTML = '<p>Error loading speakers. Please refresh the page.</p>';
      });

    function renderSpeakers(speakers) {
      const grouped = (speakers || []).reduce((acc, speaker) => {
        const nm = (speaker && speaker.name) ? speaker.name : '';
        const letter = nm.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(speaker);
        return acc;
      }, {});
      const html = Object.keys(grouped).sort().map(letter => {
        const items = grouped[letter].map(speaker => `
          <div class="speaker-item">
            <h3 class="speaker-name">
              <a href="${rel('/speaker/')}?slug=${speaker.slug}">${speaker.name}</a>
            </h3>
            ${speaker.bio ? `<p class="speaker-bio-preview">${speaker.bio.substring(0, 120)}...</p>` : ''}
          </div>
        `).join('');
        return `
          <section class="speaker-group" id="${letter}">
            <h2 class="speaker-group-letter">${letter}</h2>
            <div class="speaker-items">${items}</div>
          </section>`;
      }).join('');
      if (speakersList) speakersList.innerHTML = html || '<p>No speakers to display.</p>';
    }

    if (searchInput) {
      searchInput.addEventListener('input', function(){
        const query = (this.value || '').toLowerCase().trim();
        if (!query) { renderSpeakers(allSpeakers); return; }
        const filtered = allSpeakers.filter(s =>
          (s.name || '').toLowerCase().includes(query) ||
          (s.bio && s.bio.toLowerCase().includes(query))
        );
        if (!filtered.length) {
          if (speakersList) speakersList.innerHTML = '<p>No speakers found matching your search.</p>';
          return;
        }
        const items = filtered.map(speaker => `
          <div class="speaker-item">
            <h3 class="speaker-name">
              <a href="${rel('/speaker/')}?slug=${speaker.slug}">${speaker.name}</a>
            </h3>
            ${speaker.bio ? `<p class="speaker-bio-preview">${speaker.bio.substring(0, 120)}...</p>` : ''}
          </div>
        `).join('');
        if (speakersList) speakersList.innerHTML = `<div class="speaker-items">${items}</div>`;
      });
    }
  });
})();

