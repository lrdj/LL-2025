# The Lecture List — Jekyll Static Archive

A static, client-driven archive of 15,847 public lectures from across the UK (2003–2018).

## Quick Start

### Prerequisites

- Ruby 2.7+ and Bundler
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lrdj/LL-2025.git
   cd LL-2025
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Serve locally**
   ```bash
   bundle exec jekyll serve
   ```

4. **View in browser**
   ```
   http://localhost:4000
   ```

## Project Structure

```
├── _config.yml                # Jekyll configuration (baseurl/url, plugins)
├── _data/
│   └── summary.json           # Lightweight counts for footer (Jekyll data)
├── _includes/                 # Reusable components
│   ├── header.html
│   ├── footer.html            # Uses site.data.summary
│   └── lecture-card.html      # Unused helper include (references site.data.supercategories)
├── _layouts/                  # Page templates
│   ├── default.html           # Global shell, SEO, CSS/JS
│   ├── page.html              # Wrapper for content pages
│   └── lecture.html           # Template for future static collections
├── assets/
│   ├── css/main.css           # Design system, responsive layout
│   ├── js/main.js             # Nav, minor UI behaviors
│   ├── images/
│   │   ├── supercategories/   # 11 category images (JPG)
│   │   └── sm/                # Per-lecture images (subset)
│   └── data/                  # Primary data used by pages (JSON)
│       ├── lectures.json      # Monolithic list of lectures (~28MB)
│       ├── speakers.json      # Monolithic speakers (~2.2MB)
│       ├── institutions.json  # Monolithic institutions (~1.1MB)
│       ├── topics.json        # Topics (~662KB)
│       ├── summary.json       # Same shape as _data/summary.json (used on homepage)
│       ├── supercategories.json
│       ├── lectures_#.json    # Chunked data shards
│       ├── speakers_#.json    # Chunked data shards
│       ├── institutions_#.json# Chunked data shards
│       ├── lectures_index.json      # slug → chunk mapping
│       ├── speakers_index.json      # slug → chunk mapping
│       └── institutions_index.json  # slug → chunk mapping
├── pages/                     # Client-rendered entity and listing pages
│   ├── browse.html            # Filter/sort lectures client-side
│   ├── topics.html            # Topic explorer, counts from lectures.json
│   ├── topic.html             # Topic detail, lectures filtered client-side
│   ├── speakers.html          # Alphabetical list (from speakers.json)
│   ├── speaker.html           # Speaker detail (DataLoader + lectures.json)
│   ├── institution.html       # Institution detail (DataLoader + lectures.json)
│   ├── search.html            # Pagefind UI with JS fallback
│   └── about.md
├── scripts/
│   └── merge_data.js          # Node script to merge chunked files → monoliths
└── index.html                 # Homepage (stats, categories, recents)
```

## Features

### Implemented

- Browse 15,847 lectures with client-side filtering/sorting (category, date, title)
- Topic exploration across 11 supercategories with per-topic counts
- Speaker directory (16,912) with search and A–Z sections
- Lecture, Speaker, Topic, Institution detail pages rendered client-side
- Pagefind search UI integration with a JavaScript fallback
- Baseurl-safe URLs for GitHub Pages project site deployments
- SEO: jekyll-seo-tag, jekyll-sitemap; RSS via jekyll-feed
- Responsive design and accessible, semantic markup

### Notes and Roadmap

- Collections for `lectures`, `speakers`, `topics` are configured in `_config.yml` but not used yet. Pages are currently rendered client-side via JSON. You can generate static collections later for improved SEO and shareable URLs.
- Client pages that need global context (e.g., “all lectures for a speaker”) currently fetch the monolithic `assets/data/lectures.json`, which is large (~28MB). Consider per-entity indexes or server-side generation if payload becomes a bottleneck.

## Data Model and Loading

Primary data lives under `assets/data/` and is consumed client-side by pages:

- `lectures.json` (~28MB): Full lecture records
- `speakers.json` (~2.2MB): Speaker records
- `topics.json` (~662KB): Hierarchical topics with `path`
- `institutions.json` (~1.1MB): Venues and organizations
- `summary.json`: Aggregate counts; used by the homepage and footer (also mirrored in `_data/summary.json` for Liquid access)

Data is also available in chunked shards with `*_index.json` files mapping `slug → chunk` to enable targeted fetches without loading the entire dataset.

### DataLoader helper (client-side)

`assets/data/data-loader.js` provides:

- `DataLoader.baseUrl`: Set at runtime to `{{ site.baseurl }}/assets/data` on entity pages
- `loadLecture(slug)`, `loadSpeaker(slug)`, `loadInstitution(slug)`: Use `*_index.json` to fetch only the shard containing the requested entity
- `loadAllLectures()`: Fetches `lectures.json` (used on detail pages to gather related lectures)

### Data Structure

**Lecture:**
```json
{
  "id": 16348,
  "title": "The Gendered Brain",
  "synopsis": "...",
  "slug": "gendered-brain",
  "speakers": [{"id": 123, "name": "...", "slug": "..."}],
  "topics": [{"id": 456, "name": "...", "path": "/science/neuroscience"}],
  "supercategory": "science",
  "added": "2018-12-13T13:31:05"
}
```

## Deployment

### GitHub Pages (project site)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Publish site"
   git push origin main
   ```
2. Enable GitHub Pages: Settings → Pages → Branch `main`, Folder `/ (root)`
3. Wait ~2–5 minutes, then visit: `https://yourusername.github.io/LL-2025/`

Baseurl is already configured for project site deployment:

```yaml
baseurl: "/LL-2025"
url: "https://lrdj.github.io"
```

If you use a custom domain, set `baseurl: ""` and update `url` accordingly.

## Search

### Pagefind (recommended)

`pages/search.html` integrates the Pagefind UI from `/pagefind/` within the built `_site`. To enable:

1. Build the site:
   ```bash
   bundle exec jekyll build
   ```
2. Generate the index:
   ```bash
   npx pagefind --source _site
   # or: pagefind --source _site
   ```
3. Commit the index directory:
   ```bash
   git add _site/pagefind
   git commit -m "Add search index"
   git push
   ```

The search page auto-detects if Pagefind is unavailable and falls back to a simple client-side search over `assets/data/lectures.json` (limited to basic substring matching, capped to top 20 results).

## Performance

### Build Time

- **Local:** ~2-3 minutes
- **GitHub Pages:** ~5-10 minutes

### Optimization Tips

1. Reduce payloads for client pages that currently fetch `lectures.json` by adding per-entity reverse indexes (e.g., speaker → lecture IDs) or by generating static pages via Jekyll collections.
2. Lazy-load images where used and prefer WebP.
3. Caching and compression are handled by GitHub Pages/CDN; keep file sizes under GitHub limits (100MB per file).

## Customization

### Colors

Edit CSS variables in `assets/css/main.css`:

```css
:root {
  --color-science: #4A90E2;
  --color-arts: #D4A574;
  /* etc. */
}
```

### Navigation

Edit `_config.yml` to add/remove nav items:

```yaml
navigation:
  - title: Browse
    url: /browse/
  - title: Topics
    url: /topics/
  - title: Speakers
    url: /speakers/
  - title: About
    url: /about/
```

### Content

- **Homepage:** Edit `index.html`
- **About page:** Edit `pages/about.md`
- **Footer:** Edit `_includes/footer.html`

## Troubleshooting

### Build fails on GitHub Pages

- Check `_config.yml` syntax
- Ensure plugins are supported (jekyll-feed, jekyll-seo-tag, jekyll-sitemap are compatible)
- Check file sizes (GitHub has 100MB limit per file)

### Search not working

- Run Pagefind after building
- Check that `/pagefind/` folder exists in `_site`
- Verify JavaScript is loading (check browser console)

### Slow build times

- Consider splitting data files
- Use collections for lectures
- Reduce number of pages generated

## Contributing

This is an archive site, so we're not accepting new lecture submissions. However, contributions to improve the site are welcome:

- Bug fixes and small UX polish
- Design and accessibility improvements
- Performance optimizations (data loading, payloads)
- Documentation updates

## License

Data: Archive of public lecture listings (2003-2018)
Code: MIT License

## Credits

- **Original site:** The Lecture List (2003-2018)
- **2014 redesign:** Rieko Vining
- **2025 static archive:** Built with Jekyll + client-side JSON

## Implementation Details (Deep Dive)

- Architecture: Jekyll provides templates, layout, and SEO. Most listing and detail pages are rendered client-side by fetching JSON from `assets/data/`. Collections are preconfigured but currently not generating individual HTML files.
- Homepage: Loads `assets/data/summary.json` for counts and `assets/data/lectures.json` to render recent lectures. Category cards link to `/browse/?category=...`.
- Browse: Fetches `lectures.json`, supports category filter (via `supercategory`), sorting (date/title), and incremental rendering (“Load more”).
- Topic Explorer: Fetches `topics.json` and `lectures.json`, computes per-topic counts, and renders topic groups by hierarchy prefix.
- Entity Pages: `pages/lecture.html`, `pages/speaker.html`, `pages/institution.html` use `DataLoader` to fetch a single shard by slug, then (for speaker/institution) load `lectures.json` to enumerate related lectures.
- Search: `pages/search.html` integrates Pagefind UI loaded from `_site/pagefind/`. If Pagefind isn’t present, a simple substring search over `lectures.json` is used.
- Base URL: All Liquid links use `relative_url`. JavaScript fetches and links inject `{{ site.baseurl }}` or use `| relative_url` for compatibility with project site deployment at `/LL-2025/` and custom domains.

Known quirks
- `_includes/lecture-card.html` references `site.data.supercategories` which is not present in `_data/`. The include is not currently used by pages.
- Some pages fetch the full `lectures.json` which is large; consider switching to reverse indexes or static pages for scalability.


---

**Questions?** Open an issue on GitHub.
