// Topics browse page logic
(function(){
  const { onReady, byId, setHTML, rel, fetchJSON } = window.__LL__ || {};
  if (!onReady) return;

  onReady(async () => {
    const topicsContainer = byId('topics-container');
    const topicSearch = byId('topic-search');
    const supercategoryTabs = byId('supercategory-tabs');
    if (!topicsContainer) return;

    let allTopics = [];
    let filteredTopics = [];
    let currentSupercategory = '';

    try {
      const [topics, categories] = await Promise.all([
        fetchJSON('/assets/data/topics.json'),
        fetchJSON('/assets/data/supercategories.json')
      ]);
      allTopics = Array.isArray(topics) ? topics : [];

      let counts = null;
      try {
        const resp = await fetch(rel('/assets/data/meta_topic_counts.json'));
        if (resp.ok) counts = await resp.json();
      } catch(_) {}
      if (counts) {
        allTopics.forEach(t => { t.lectureCount = counts[String(t.id)] || 0; });
      } else {
        const allLectures = await fetchJSON('/assets/data/lectures.json');
        const topicCounts = {};
        (allLectures || []).forEach(lec => (lec.topics || []).forEach(t => { topicCounts[t.id] = (topicCounts[t.id] || 0) + 1; }));
        allTopics.forEach(t => { t.lectureCount = topicCounts[t.id] || 0; });
      }

      if (supercategoryTabs && Array.isArray(categories)) {
        categories.forEach(cat => {
          const button = document.createElement('button');
          button.className = 'tab-button';
          button.textContent = cat.name;
          button.dataset.category = cat.slug;
          button.addEventListener('click', () => filterBySupercategory(cat.slug));
          supercategoryTabs.appendChild(button);
        });
      }

      if (topicSearch) topicSearch.addEventListener('input', filterTopics);
      filterTopics();
    } catch (err) {
      console.error('Error loading topics:', err);
      setHTML('topics-container', '<div class="error">Error loading topics</div>');
    }

    function filterBySupercategory(category) {
      currentSupercategory = category;
      document.querySelectorAll('.tab-button').forEach(btn => { btn.classList.toggle('active', btn.dataset.category === category); });
      filterTopics();
    }

    function filterTopics() {
      const searchTerm = (topicSearch && topicSearch.value ? topicSearch.value : '').toLowerCase();
      filteredTopics = allTopics.filter(topic => {
        if (currentSupercategory) {
          const pathStart = `/${currentSupercategory}/`;
          if (!topic.path.startsWith(pathStart)) return false;
        }
        if (searchTerm) {
          if (!topic.name.toLowerCase().includes(searchTerm) && !topic.path.toLowerCase().includes(searchTerm)) return false;
        }
        return topic.lectureCount > 0;
      });
      renderTopics();
    }

    function renderTopics() {
      const hierarchy = buildHierarchy(filteredTopics);
      topicsContainer.innerHTML = `<div class="topics-grid">${renderHierarchy(hierarchy)}</div>`;
    }

    function buildHierarchy(topics) {
      const grouped = {};
      (topics || []).forEach(topic => {
        const pathParts = topic.path.split('/').filter(p => p);
        const topLevel = pathParts[0] || 'other';
        if (!grouped[topLevel]) grouped[topLevel] = [];
        grouped[topLevel].push(topic);
      });
      return grouped;
    }

    function renderHierarchy(hierarchy) {
      return Object.entries(hierarchy)
        .sort((a,b) => {
          const countA = a[1].reduce((sum, t) => sum + t.lectureCount, 0);
          const countB = b[1].reduce((sum, t) => sum + t.lectureCount, 0);
          return countB - countA;
        })
        .map(([category, topics]) => {
          const totalCount = topics.reduce((sum, t) => sum + t.lectureCount, 0);
          return `
            <div class="topic-category">
              <h3 class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}<span class="category-count">${totalCount} lectures</span></h3>
              <div class="topic-list">
                ${topics.sort((a,b)=>b.lectureCount - a.lectureCount).slice(0,20).map(t => `
                  <a href="${rel('/topic/')}?id=${t.id}" class="topic-item">
                    <span class="topic-name">${t.name}</span>
                    <span class="topic-path">${t.path}</span>
                    <span class="topic-count">${t.lectureCount}</span>
                  </a>`).join('')}
                ${topics.length > 20 ? `<div class=\"topic-more\">+${topics.length - 20} more topics in ${category}</div>` : ''}
              </div>
            </div>`;
        }).join('');
    }
  });
})();

