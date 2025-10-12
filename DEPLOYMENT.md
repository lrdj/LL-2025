# Deployment Guide

## Step-by-Step: Getting Your Site Live

### 1. Copy Files to Your GitHub Repo

You have two options:

#### Option A: Copy Individual Files

Copy these files from the generated site to your `LL-2025` repo:

```bash
# Layouts
cp _layouts/* /path/to/LL-2025/_layouts/

# Includes  
cp _includes/* /path/to/LL-2025/_includes/

# Pages
cp pages/* /path/to/LL-2025/pages/

# Assets
cp -r assets/css /path/to/LL-2025/assets/
cp -r assets/js /path/to/LL-2025/assets/

# Root files
cp index.html /path/to/LL-2025/
cp README.md /path/to/LL-2025/
```

#### Option B: Replace Entire Repo Contents

```bash
# Backup your existing _data folder
cp -r /path/to/LL-2025/_data /tmp/backup-data

# Copy everything
cp -r * /path/to/LL-2025/

# Restore your data
cp -r /tmp/backup-data/* /path/to/LL-2025/_data/
```

### 2. Update _config.yml

Edit `_config.yml` in your repo:

```yaml
# Change these to your values
baseurl: "" # Leave empty if using custom domain, or "/LL-2025" for GitHub Pages
url: "https://yourusername.github.io" # Or your custom domain
```

### 3. Commit and Push

```bash
cd /path/to/LL-2025
git add .
git commit -m "Add Jekyll site structure and templates"
git push origin main
```

### 4. Enable GitHub Pages

1. Go to https://github.com/lrdj/LL-2025/settings/pages
2. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click "Save"

### 5. Wait for Build

GitHub will build your site automatically. This takes 2-5 minutes.

Check the Actions tab to see progress: https://github.com/lrdj/LL-2025/actions

### 6. Visit Your Site

Once built, your site will be at:
```
https://lrdj.github.io/LL-2025/
```

## Adding Search

### Install Pagefind (After First Deploy)

1. **Clone your repo locally** (if you haven't)
   ```bash
   git clone https://github.com/lrdj/LL-2025.git
   cd LL-2025
   ```

2. **Build the site locally**
   ```bash
   bundle install
   bundle exec jekyll build
   ```

3. **Install Pagefind**
   ```bash
   npm install -g pagefind
   # or
   npx pagefind --source _site
   ```

4. **Index the site**
   ```bash
   pagefind --source _site
   ```

5. **Commit the search index**
   ```bash
   git add _site/pagefind
   git commit -m "Add Pagefind search index"
   git push
   ```

**Note:** You'll need to rebuild the search index whenever you update content.

## Custom Domain (Optional)

### 1. Add CNAME File

Create a file named `CNAME` in your repo root:

```
lecturelist.org
```

### 2. Configure DNS

Add these records at your domain registrar:

```
Type  Name  Value
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   lrdj.github.io
```

### 3. Enable HTTPS

In GitHub Pages settings, check "Enforce HTTPS" (may take 24 hours to activate).

## Troubleshooting

### Site not building?

**Check the Actions tab** for error messages:
https://github.com/lrdj/LL-2025/actions

Common issues:
- Syntax error in `_config.yml`
- Missing Gemfile or dependencies
- File too large (>100MB limit)

### 404 errors?

- Check `baseurl` in `_config.yml`
- If using `/LL-2025`, all links need `{{ site.baseurl }}`
- Try clearing browser cache

### Images not loading?

- Verify images are in `assets/images/supercategories/`
- Check file names match exactly (case-sensitive)
- Ensure images are committed to git

### Search not working?

- Pagefind index needs to be generated locally
- Can't run Pagefind on GitHub Actions (yet)
- Alternative: Use Algolia or simple JS search

## Performance Optimization

### 1. Optimize Images

```bash
# Install imagemagick
brew install imagemagick

# Convert to WebP
for img in assets/images/supercategories/*.png; do
  cwebp "$img" -o "${img%.png}.webp"
done
```

### 2. Minify CSS

Add to `_config.yml`:

```yaml
sass:
  style: compressed
```

### 3. Enable Caching

GitHub Pages automatically handles caching. No action needed.

## Monitoring

### Analytics

Add Google Analytics to `_includes/head.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Uptime Monitoring

Use a free service like:
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://pingdom.com)

## Backup

Your site is already backed up on GitHub! But for extra safety:

1. **Clone to multiple locations**
2. **Export data periodically**
3. **Keep MySQL backup** (you already have this)

## Next Steps

Once deployed:

1. ✅ Test all pages and links
2. ✅ Add search (Pagefind)
3. ✅ Generate Midjourney images for categories
4. ✅ Share with potential funders
5. ✅ Gather feedback
6. ✅ Iterate and improve

---

**Need help?** Open an issue on GitHub or check the README.

