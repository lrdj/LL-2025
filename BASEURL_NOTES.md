# Baseurl Configuration Notes

## Current Setup

The site is configured for GitHub Pages **project site** deployment:

```yaml
baseurl: "/LL-2025"
url: "https://lrdj.github.io"
```

**Final URL:** https://lrdj.github.io/LL-2025/

## How Baseurl Works

### In Liquid Templates

All paths use `relative_url` filter which automatically adds the baseurl:

```liquid
<!-- Correct ✅ -->
<a href="{{ '/browse/' | relative_url }}">Browse</a>
<!-- Outputs: /LL-2025/browse/ -->

<img src="{{ '/assets/images/logo.png' | relative_url }}">
<!-- Outputs: /LL-2025/assets/images/logo.png -->
```

### In JavaScript

JavaScript needs the baseurl injected from Jekyll:

```javascript
// Correct ✅
const baseurl = "{{ site.baseurl }}";
const url = `${baseurl}/lectures/${slug}/`;

// Or inline:
<a href="{{ site.baseurl }}/lectures/${lecture.slug}/">
```

## All Paths Fixed

I've audited and fixed all paths in:

- ✅ `_layouts/default.html` - Uses `relative_url`
- ✅ `_layouts/lecture.html` - Uses `relative_url`
- ✅ `_includes/header.html` - Uses `relative_url`
- ✅ `_includes/footer.html` - Uses `relative_url`
- ✅ `_includes/lecture-card.html` - Uses `relative_url`
- ✅ `index.html` - Uses `relative_url`
- ✅ `pages/browse.html` - Uses `{{ site.baseurl }}` in JS
- ✅ `pages/topics.html` - Uses `relative_url`
- ✅ `pages/speakers.html` - Uses `{{ site.baseurl }}` in JS
- ✅ `pages/search.html` - Uses `{{ site.baseurl }}` in JS
- ✅ `pages/about.md` - Uses `relative_url`

## Testing Locally

When testing locally, Jekyll automatically handles the baseurl:

```bash
bundle exec jekyll serve
# Visit: http://localhost:4000/LL-2025/
```

Note the `/LL-2025/` in the local URL - this matches production!

## If You Add a Custom Domain

When you add a CNAME and custom domain (e.g., `lecturelist.org`), update `_config.yml`:

```yaml
baseurl: ""  # Empty for custom domain
url: "https://lecturelist.org"
```

Then all URLs will be:
- https://lecturelist.org/
- https://lecturelist.org/browse/
- https://lecturelist.org/lectures/...

## Common Mistakes to Avoid

### ❌ Hardcoded Paths
```liquid
<!-- Wrong -->
<a href="/browse/">Browse</a>
```

### ✅ Use relative_url
```liquid
<!-- Correct -->
<a href="{{ '/browse/' | relative_url }}">Browse</a>
```

### ❌ Missing baseurl in JavaScript
```javascript
// Wrong
const url = `/lectures/${slug}/`;
```

### ✅ Include baseurl
```javascript
// Correct
const url = `{{ site.baseurl }}/lectures/${slug}/`;
```

## Verification Checklist

After deploying, verify these URLs work:

- [ ] https://lrdj.github.io/LL-2025/
- [ ] https://lrdj.github.io/LL-2025/browse/
- [ ] https://lrdj.github.io/LL-2025/topics/
- [ ] https://lrdj.github.io/LL-2025/speakers/
- [ ] https://lrdj.github.io/LL-2025/search/
- [ ] https://lrdj.github.io/LL-2025/about/
- [ ] CSS loads: https://lrdj.github.io/LL-2025/assets/css/main.css
- [ ] JS loads: https://lrdj.github.io/LL-2025/assets/js/main.js
- [ ] Images load: https://lrdj.github.io/LL-2025/assets/images/supercategories/science.png

## Summary

✅ **Everything is configured correctly for `/LL-2025/` deployment**

All paths will work automatically when you push to GitHub Pages. No manual fixes needed!

