# Quick Start Guide - The Lecture List Jekyll Site

## What You Have

✅ **Complete Jekyll site** with all templates and layouts  
✅ **15,847 lectures** exported from MySQL  
✅ **Responsive design** based on 2014 refresh  
✅ **Search-ready** (Pagefind integration)  
✅ **11 supercategory images** from Midjourney  

## File Overview

### In the Archive (`jekyll-site-complete.tar.gz`)

```
jekyll-site/
├── _config.yml          ← Jekyll configuration
├── _data/               ← Your 15,847 lectures + speakers + topics
├── _layouts/            ← Page templates (default, page, lecture)
├── _includes/           ← Reusable components (header, footer, cards)
├── assets/
│   ├── css/main.css     ← Complete design system
│   ├── js/main.js       ← JavaScript functionality
│   └── images/supercategories/  ← (copy your Midjourney images here)
├── pages/               ← Browse, Topics, Speakers, Search, About
├── index.html           ← Homepage
├── Gemfile              ← Ruby dependencies
├── .gitignore           ← Git ignore rules
├── README.md            ← Full documentation
└── DEPLOYMENT.md        ← Step-by-step deployment guide
```

## Next Steps (30 minutes)

### 1. Extract the Archive (2 min)

```bash
cd ~/Downloads
tar -xzf jekyll-site-complete.tar.gz
```

### 2. Copy to Your GitHub Repo (5 min)

```bash
# Clone your repo if you haven't
git clone https://github.com/lrdj/LL-2025.git
cd LL-2025

# Copy the Jekyll site files
cp -r ~/Downloads/jekyll-site/* .

# Your _data folder is already there, so this won't overwrite it
```

### 3. Copy Your Midjourney Images (2 min)

```bash
# Copy the 11 supercategory images you generated
cp ~/path/to/midjourney/images/*.png assets/images/supercategories/
```

Make sure the filenames match:
- `science.png`
- `arts.png`
- `politics.png`
- `business.png`
- `music.png`
- `religion.png`
- `academic.png`
- `sport.png`
- `society.png`
- `children.png`
- `leisure.png`

### 4. Update Configuration (3 min)

Edit `_config.yml`:

```yaml
# Change these lines
title: The Lecture List
baseurl: "" # Leave empty for custom domain, or "/LL-2025" for GitHub Pages
url: "https://lrdj.github.io" # Or your custom domain
```

### 5. Test Locally (Optional, 10 min)

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

### 6. Deploy to GitHub Pages (5 min)

```bash
git add .
git commit -m "Add complete Jekyll site with templates and design"
git push origin main
```

### 7. Enable GitHub Pages (3 min)

1. Go to https://github.com/lrdj/LL-2025/settings/pages
2. Source: Branch `main`, Folder `/ (root)`
3. Click Save

**Wait 2-5 minutes** for GitHub to build your site.

### 8. Visit Your Site! 🎉

```
https://lrdj.github.io/LL-2025/
```

## What You'll See

### Homepage
- Hero section with search
- 11 category cards with your Midjourney images
- Recent lectures grid
- Statistics (15,847 lectures, etc.)

### Browse Page
- Filter by category
- Sort by date or title
- Load more pagination
- Lecture cards with gradients

### Topics Page
- Topics organized by supercategory
- Color-coded by category
- Expandable lists

### Speakers Page
- Alphabetical listing
- Search functionality
- 16,912 speakers

### Search Page
- Full-text search (with Pagefind)
- Fallback to simple JS search

## Common Issues & Fixes

### "Page not found" errors
- Check `baseurl` in `_config.yml`
- If using `/LL-2025`, you need it in all URLs

### Images not showing
- Verify filenames match exactly (case-sensitive)
- Check images are in `assets/images/supercategories/`
- Commit and push images to Git

### Site not building
- Check GitHub Actions tab for errors
- Verify `_config.yml` syntax
- Ensure all files are committed

### Slow build times
- Normal! 15K lectures takes 2-5 minutes
- GitHub Pages has 10-minute limit (you're well within it)

## Adding Search

After your site is live, add Pagefind search:

```bash
# Build site locally
bundle exec jekyll build

# Install and run Pagefind
npx pagefind --source _site

# Commit the index
git add _site/pagefind
git commit -m "Add search index"
git push
```

## Customization

### Change Colors

Edit `assets/css/main.css`:

```css
:root {
  --color-science: #4A90E2;  /* Change to your preferred color */
  --color-arts: #D4A574;
  /* etc. */
}
```

### Add/Remove Navigation Items

Edit `_config.yml`:

```yaml
navigation:
  - title: Browse
    url: /browse/
  - title: Your New Page
    url: /your-page/
```

### Modify Homepage

Edit `index.html` - it's all standard HTML and Liquid templates.

## What's Next?

1. **Test everything** - Click through pages, test search
2. **Generate more images** - Topic-level images from Midjourney
3. **Share with funders** - Show off the archive!
4. **Gather feedback** - What features do people want?
5. **Iterate** - Improve based on feedback

## Resources

- **Full README:** See `README.md` in the site folder
- **Deployment Guide:** See `DEPLOYMENT.md` for detailed steps
- **Jekyll Docs:** https://jekyllrb.com/docs/
- **GitHub Pages Docs:** https://docs.github.com/en/pages

## Getting Help

- **GitHub Issues:** Open an issue on your repo
- **Jekyll Community:** https://talk.jekyllrb.com/
- **Stack Overflow:** Tag `jekyll` and `github-pages`

---

**You're ready to go!** 🚀

The hardest part (data export) is done. Now you have a beautiful, working static site ready to deploy.

