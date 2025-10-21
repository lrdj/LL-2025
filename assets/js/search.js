// Search page logic: Pagefind init + fallback simple search
(function(){
  const { onReady, byId, rel, fetchJSON } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    // Initialize Pagefind UI if available
    if (typeof PagefindUI !== 'undefined') {
      new PagefindUI({ 
        element: "#pagefind-search",
        showSubResults: true,
        showImages: false,
        excerptLength: 30
      });
    } else {
      // Give Pagefind a moment to load, then fallback
      setTimeout(() => { if (typeof PagefindUI === 'undefined') initSimpleSearch(); }, 800);
    }
  });

  function initSimpleSearch() {
    const searchInput = byId('pagefind-search');
    const resultsContainer = byId('search-results');
    const emptyState = byId('search-empty');
    if (!searchInput || !resultsContainer) return;

    fetchJSON('/assets/data/lectures.json')
      .then(lectures => {
        searchInput.addEventListener('input', function() {
          const query = (this.value || '').toLowerCase().trim();
          if (query.length < 2) {
            resultsContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'none';
            return;
          }
          const results = (lectures || []).filter(lec => {
            const searchText = `${lec.title||''} ${lec.synopsis||''} ${lec.keywords||''}`.toLowerCase();
            return searchText.includes(query);
          }).slice(0, 20);
          if (!results.length) {
            resultsContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
          }
          if (emptyState) emptyState.style.display = 'none';
          resultsContainer.innerHTML = results.map(lecture => {
            const speakers = (lecture.speakers || []).map(s => s.name).join(', ');
            return `
              <div class="search-result">
                <h3 class="search-result-title"><a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a></h3>
                ${speakers ? `<p class="search-result-meta">${speakers}</p>` : ''}
                ${lecture.synopsis ? `<p class="search-result-excerpt">${lecture.synopsis.substring(0, 200)}...</p>` : ''}
              </div>`;
          }).join('');
        });
      })
      .catch(() => {
        if (emptyState) emptyState.style.display = 'block';
      });
  }
})();

