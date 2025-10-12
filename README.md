# The Lecture List - Jekyll Static Archive

A static archive of 15,847 public lectures from across the UK (2003-2018).

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
├── _config.yml           # Jekyll configuration
├── _data/                # JSON data files
│   ├── lectures.json     # 15,847 lectures
│   ├── speakers.json     # 16,912 speakers
│   ├── topics.json       # 4,463 topics
│   ├── institutions.json # 3,459 institutions
│   └── supercategories.json
├── _includes/            # Reusable components
│   ├── header.html
│   ├── footer.html
│   └── lecture-card.html
├── _layouts/             # Page templates
│   ├── default.html
│   ├── page.html
│   └── lecture.html
├── assets/
│   ├── css/
│   │   └── main.css      # Main stylesheet
│   ├── js/
│   │   └── main.js       # Main JavaScript
│   └── images/
│       └── supercategories/  # Category images
├── pages/                # Site pages
│   ├── browse.html
│   ├── topics.html
│   ├── speakers.html
│   ├── search.html
│   └── about.md
└── index.html            # Homepage
```

## Features

### ✅ Implemented

- **Browse 15,847 lectures** with filtering by category
- **Search functionality** (Pagefind integration ready)
- **Topic exploration** across 11 supercategories
- **Speaker directory** with 16,912 speakers
- **Responsive design** works on all devices
- **Fast, static site** hosted on GitHub Pages

### 🔄 To Implement

1. **Search with Pagefind**
   ```bash
   # After building the site
   npx pagefind --source _site
   ```

2. **Individual lecture pages**
   - Currently using data files
   - Can generate collections for better SEO

3. **Enhanced images**
   - Midjourney-generated visuals for categories
   - Placeholder system in place

## Data

All data is in `_data/` as JSON files:

- **lectures.json** (28 MB) - Full lecture records
- **speakers.json** (2.2 MB) - Speaker information
- **topics.json** (662 KB) - Hierarchical topics
- **institutions.json** (1.1 MB) - Venues and organizations

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

### GitHub Pages (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial site"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`

3. **Wait for build** (~2-5 minutes)

4. **Visit your site**
   ```
   https://yourusername.github.io/LL-2025/
   ```

### Custom Domain

1. Add `CNAME` file with your domain
2. Configure DNS:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   yourusername.github.io
   ```

## Search Setup

### Option 1: Pagefind (Recommended)

Pagefind is a static search library that works perfectly with GitHub Pages.

1. **Install Pagefind**
   ```bash
   npm install -g pagefind
   ```

2. **Build your site**
   ```bash
   bundle exec jekyll build
   ```

3. **Index the site**
   ```bash
   npx pagefind --source _site
   ```

4. **Commit the index**
   ```bash
   git add _site/pagefind
   git commit -m "Add search index"
   git push
   ```

**Pros:**
- Free, open source
- Works entirely client-side
- No API keys needed
- Fast and lightweight

### Option 2: Algolia

For more advanced search features.

1. Sign up at algolia.com (free tier: 10K records)
2. Install jekyll-algolia plugin
3. Configure in `_config.yml`
4. Index with `bundle exec jekyll algolia`

**Pros:**
- Typo tolerance
- Advanced filtering
- Analytics

**Cons:**
- Requires API key
- 10K record limit on free tier (you have 15K+)

## Performance

### Build Time

- **Local:** ~2-3 minutes
- **GitHub Pages:** ~5-10 minutes

### Optimization Tips

1. **Reduce data file size**
   - Split lectures by year if needed
   - Use collections instead of data files

2. **Lazy load images**
   - Add loading="lazy" to images
   - Use WebP format

3. **Enable caching**
   - GitHub Pages handles this automatically

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

Edit `_config.yml`:

```yaml
navigation:
  - title: Browse
    url: /browse/
  - title: Topics
    url: /topics/
```

### Content

- **Homepage:** Edit `index.html`
- **About page:** Edit `pages/about.md`
- **Footer:** Edit `_includes/footer.html`

## Troubleshooting

### Build fails on GitHub Pages

- Check `_config.yml` syntax
- Ensure all plugins are GitHub Pages compatible
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

- Bug fixes
- Design improvements
- Performance optimizations
- Documentation updates

## License

Data: Archive of public lecture listings (2003-2018)
Code: MIT License

## Credits

- **Original site:** The Lecture List (2003-2018)
- **2014 redesign:** Rieko Vining
- **2025 static archive:** Built with Jekyll

---

**Questions?** Open an issue on GitHub.

