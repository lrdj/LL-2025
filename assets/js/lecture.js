// Lecture detail page logic
(function(){
  const { onReady, byId, setHTML, rel, loadScript } = window.__LL__ || {};
  if (!onReady) return;

  onReady(() => {
    const container = byId('lecture-container');
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (!slug) { setHTML('lecture-container', '<div class="error">No lecture specified</div>'); return; }
    loadLecture(slug);
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

  async function loadLecture(slug) {
    try {
      await ensureLoader();
      const lecture = await DataLoader.loadLecture(slug);
      if (!lecture) { setHTML('lecture-container', '<div class="error">Lecture not found</div>'); return; }
      renderLecture(lecture);
    } catch (err) {
      console.error('Error loading lecture:', err);
      setHTML('lecture-container', '<div class="error">Error loading lecture</div>');
    }
  }

  function renderLecture(lecture) {
    const container = byId('lecture-container');
    if (!container) return;
    const dateStr = lecture.date ? new Date(lecture.date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : 'Date TBA';
    const speakersHTML = (lecture.speakers && lecture.speakers.length)
      ? lecture.speakers.map(s => `<a href="${rel('/speaker/')}?slug=${s.slug}" class="speaker-link">${s.name}</a>`).join(', ')
      : 'Speaker TBA';
    const topicsHTML = (lecture.topics && lecture.topics.length)
      ? lecture.topics.map(t => `<a href="${rel('/topic/')}?id=${t.id}" class="topic-tag">${t.name}</a>`).join(' ')
      : '';
    const venueHTML = lecture.venue
      ? `<a href="${rel('/institution/')}?id=${lecture.venue.id}&slug=${lecture.venue.slug}" class="venue-link">${lecture.venue.name}</a>${lecture.venue.city ? ', ' + lecture.venue.city : ''}`
      : 'Venue TBA';
    const organizerHTML = lecture.organizer
      ? `<a href="${rel('/institution/')}?id=${lecture.organizer.id}&slug=${lecture.organizer.slug}" class="organizer-link">${lecture.organizer.name}</a>`
      : '';

    let additionalDatesHTML = '';
    if (lecture.dates && lecture.dates.length > 1) {
      additionalDatesHTML = `
        <div class="additional-dates">
          <h3>Additional Dates</h3>
          <ul class="dates-list">
            ${lecture.dates.slice(1).map(d => {
              const dStr = new Date(d.from_date).toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' });
              const timeStr = d.time !== '00:00:00' ? ` at ${d.time.substring(0,5)}` : '';
              const venueStr = d.venue ? ` - ${d.venue.name}` : '';
              return `<li>${dStr}${timeStr}${venueStr}</li>`;
            }).join('')}
          </ul>
        </div>`;
    }

    const imageUrl = lecture.image_id ? rel('/assets/images/sm/') + lecture.image_id + '.webp' : rel('/assets/images/supercategories/') + lecture.supercategory + '.webp';

    container.innerHTML = `
      <div class="container">
        <div class="lecture-header">
          <div class="lecture-meta">
            <span class="supercategory-badge" data-category="${lecture.supercategory}">${lecture.supercategory}</span>
            <span class="lecture-date">${dateStr}</span>
          </div>
          <h1 class="lecture-title">${lecture.title}</h1>
          <div class="lecture-speakers">${speakersHTML}</div>
          ${topicsHTML ? `<div class="lecture-topics">${topicsHTML}</div>` : ''}
        </div>
        <div class="lecture-content">
          <div class="lecture-main">
            ${lecture.image_id ? `<div class="lecture-image"><img src="${imageUrl}" alt="${lecture.title}" onerror="this.style.display='none'"></div>` : ''}
            ${lecture.synopsis ? `<div class="lecture-synopsis"><h2>Synopsis</h2><p>${lecture.synopsis}</p></div>` : ''}
            ${lecture.body ? `<div class="lecture-body"><h2>Description</h2><div class="lecture-text">${lecture.body.replace(/\r\n/g, '<br><br>')}</div></div>` : ''}
            ${lecture.additional_info ? `<div class="lecture-additional"><h3>Additional Information</h3><p>${lecture.additional_info}</p></div>` : ''}
            ${lecture.keywords ? `<div class="lecture-keywords"><strong>Keywords:</strong> ${lecture.keywords}</div>` : ''}
            ${additionalDatesHTML}
          </div>
          <aside class="lecture-sidebar">
            <div class="info-box">
              <h3>Event Details</h3>
              <div class="info-item"><strong>Venue:</strong><div>${venueHTML}</div></div>
              ${organizerHTML ? `<div class="info-item"><strong>Organized by:</strong><div>${organizerHTML}</div></div>` : ''}
              ${lecture.duration ? `<div class="info-item"><strong>Duration:</strong><div>${lecture.duration} minutes</div></div>` : ''}
              ${lecture.dates && lecture.dates[0] && lecture.dates[0].ticket_cost ? `<div class="info-item"><strong>Ticket Cost:</strong><div>${lecture.dates[0].ticket_cost}</div></div>` : ''}
              ${lecture.dates && lecture.dates[0] && lecture.dates[0].ticket_info ? `<div class="info-item"><strong>Tickets:</strong><div><a href="${lecture.dates[0].ticket_info}" target="_blank" rel="noopener">Book tickets</a></div></div>` : ''}
              ${lecture.dates && lecture.dates[0] && lecture.dates[0].members_only === 'Yes' ? `<div class="info-item members-only"><strong>Members Only</strong>${lecture.dates[0].members_info ? `<div>${lecture.dates[0].members_info}</div>` : ''}</div>` : ''}
            </div>
            ${lecture.venue && lecture.venue.postcode ? (()=>{
              const parts = [lecture.venue.name, lecture.venue.city, lecture.venue.postcode].filter(Boolean);
              const q = encodeURIComponent(parts.join(', '));
              const mapSrc = `https://www.google.com/maps?q=${q}&output=embed`;
              const mapHref = `https://www.google.com/maps/search/?api=1&query=${q}`;
              return `<div class=\"info-box\"><h3>Location</h3><div class=\"location-info\">${lecture.venue.name}<br>${lecture.venue.city || ''}<br>${lecture.venue.postcode}</div><div class=\"map-embed\" aria-label=\"Map location\"><iframe title=\"Map preview\" src=\"${mapSrc}\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\" allowfullscreen></iframe><div class=\"map-actions\"><a href=\"${mapHref}\" target=\"_blank\" rel=\"noopener\">View larger map</a></div></div></div>`;
            })() : ''}
          </aside>
        </div>
      </div>`;
    document.title = `${lecture.title} - The Lecture List`;
  }
})();

