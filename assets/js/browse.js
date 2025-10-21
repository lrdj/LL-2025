// Browse page logic with robust guards
(function(){
  const { onReady, byId, setHTML, setText, rel, fetchJSON } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    const categoryFilter = byId('category-filter');
    const sortSelect = byId('sort-select');
    const lectureList = byId('lecture-list');
    const resultsCount = byId('results-count');
    const loadingIndicator = byId('loading-indicator');
    const loadMoreBtn = byId('load-more');
    if (!lectureList) return; // page section missing

    let allLectures = [];
    let filteredLectures = [];
    let displayedCount = 24;

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || '';

    Promise.all([
      fetchJSON('/assets/data/lectures.json'),
      fetchJSON('/assets/data/supercategories.json')
    ])
    .then(([lectures, categories]) => {
      allLectures = Array.isArray(lectures) ? lectures : [];
      // Populate category dropdown
      if (categoryFilter && Array.isArray(categories)) {
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.slug;
          option.textContent = cat.name;
          if (cat.slug === initialCategory) option.selected = true;
          categoryFilter.appendChild(option);
        });
      }

      if (loadingIndicator) loadingIndicator.style.display = 'none';
      if (resultsCount) resultsCount.style.display = 'block';

      filterLectures();
    })
    .catch(err => {
      console.error('Error loading lectures:', err);
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Error loading lectures. Please refresh the page.';
        loadingIndicator.style.color = 'red';
      }
    });

    function filterLectures() {
      const category = categoryFilter ? categoryFilter.value : '';
      filteredLectures = allLectures.filter(lecture => {
        if (category && lecture.supercategory !== category) return false;
        return true;
      });
      sortLectures();
    }

    function sortLectures() {
      const sortBy = sortSelect ? sortSelect.value : 'date-desc';
      filteredLectures.sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return (b.date || '').localeCompare(a.date || '');
          case 'date-asc':
            return (a.date || '').localeCompare(b.date || '');
          case 'title-asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'title-desc':
            return (b.title || '').localeCompare(a.title || '');
          default:
            return 0;
        }
      });
      displayedCount = 24;
      renderLectures();
    }

    function renderLectures() {
      const toDisplay = filteredLectures.slice(0, displayedCount);
      const html = toDisplay.map(lecture => {
        const dateStr = lecture.date ? new Date(lecture.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBA';
        const sp = Array.isArray(lecture.speakers) ? lecture.speakers : [];
        const speakers = sp.length ? sp.slice(0, 2).map(s => `<a href="${rel('/speaker/')}?slug=${s.slug}" class="speaker-link">${s.name}</a>`).join(', ') : '';
        const moreCount = sp.length > 2 ? ` +${sp.length - 2} more` : '';
        const venue = lecture.venue ? `<a href="${rel('/institution/')}?id=${lecture.venue.id}&slug=${lecture.venue.slug}" class="venue-link">${lecture.venue.name}</a>` : '';
        return `
          <article class="lecture-card">
            <div class="lecture-card-header">
              <span class="lecture-card-category" data-category="${lecture.supercategory}">${lecture.supercategory}</span>
              <time class="lecture-card-date">${dateStr}</time>
            </div>
            <div class="lecture-card-content">
              <h3 class="lecture-card-title">
                <a href="${rel('/lecture/')}?slug=${lecture.slug}">${lecture.title}</a>
              </h3>
              ${speakers ? `<div class="lecture-card-speakers">${speakers}${moreCount}</div>` : ''}
              ${lecture.synopsis ? `<p class="lecture-card-synopsis">${lecture.synopsis.substring(0, 150)}${(lecture.synopsis.length > 150) ? '...' : ''}</p>` : ''}
              <div class="lecture-card-meta">
                ${venue ? `<span class="lecture-venue">${venue}</span>` : ''}
                ${lecture.duration ? `<span class="lecture-duration">${lecture.duration} min</span>` : ''}
              </div>
            </div>
          </article>`;
      }).join('');

      if (lectureList) lectureList.innerHTML = html;
      if (resultsCount) {
        const strong = resultsCount.querySelector('strong');
        if (strong) strong.textContent = String(filteredLectures.length);
      }
      if (loadMoreBtn) loadMoreBtn.style.display = displayedCount >= filteredLectures.length ? 'none' : 'block';
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        const category = categoryFilter.value;
        const newUrl = category ? `${window.location.pathname}?category=${encodeURIComponent(category)}` : window.location.pathname;
        window.history.pushState({}, '', newUrl);
        filterLectures();
      });
    }

    if (sortSelect) sortSelect.addEventListener('change', sortLectures);

    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => {
      displayedCount += 24;
      renderLectures();
    });
  });
})();

