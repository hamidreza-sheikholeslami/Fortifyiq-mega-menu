# Quick Start Guide

## For WordPress + Elementor

### Step 1: Add HTML Structure
1. Open Elementor Theme Builder
2. Edit your header template
3. Add an HTML Widget
4. Copy/paste the **entire contents** of `index.html` into the widget

### Step 2: Add CSS
1. Go to **Elementor > Custom CSS** (or **Appearance > Customize > Additional CSS**)
2. Copy/paste the **entire contents** of `css/styles.css`
3. Save

### Step 3: Add JavaScript
Upload `js/mega-menu.js` to your theme and enqueue it:

**Option A: Using functions.php**
```php
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script(
        'mega-menu',
        get_stylesheet_directory_uri() . '/js/mega-menu.js',
        [],
        '2.0.0',
        true  // load in footer
    );
});
```

**Option B: Using Insert Headers and Footers plugin**
1. Install "Insert Headers and Footers" plugin
2. Go to Settings > Insert Headers and Footers
3. Paste `<script src="path/to/mega-menu.js"></script>` in the footer section

### Step 4: Test
1. Visit your site
2. Test desktop hover interactions (Products, Applications, etc.)
3. Test mobile/tablet hamburger menu and breadcrumb navigation
4. Test keyboard navigation (Tab and ESC keys)

---

## Key Measurements

| Setting | Value |
|---------|-------|
| Container width | 1046px |
| Header height | `--header-height: 70px` |
| Mega menu max height | `calc(100dvh - 70px)` |
| Hover-intent delay | 120ms |
| Close delay | 175ms |
| Transition speed | `--transition-speed: 200ms` |

---

## Customization Quick Reference

### Change Brand Colors
Edit these CSS variables at the top of `styles.css`:
```css
:root {
    --hover-color:        #F16D24;  /* Accent — active borders, buttons */
    --hover-bg-primary:   #FEF4EE;  /* Hover background (warm tint) */
    --hover-bg-secondary: #E8EEF6;  /* Hover background (cool tint) */
    --content-bg:         #F3F6FA;  /* Content area background */
    --link-color:         #0066cc;  /* Link color */
    --text-primary:       #1B293D;
    --text-secondary:     #4A5568;
}
```

### Change Link Colors
Replace `--link-color` variable value — it is referenced everywhere links are styled.

### Change Fonts
Override the font-size tokens:
```css
:root {
    --font-nav:  1.125rem;   /* 18px — nav buttons */
    --font-body: 0.9375rem;  /* 15px — body text */
    --font-sm:   0.875rem;   /* 14px */
    --font-xs:   0.75rem;    /* 12px */
}
```

Add your font family to the `body` selector:
```css
body {
    font-family: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Change Border Radii
```css
:root {
    --radius-pill: 50px;
    --radius-xl:   16px;
    --radius-lg:   12px;
    --radius-md:    8px;
    --radius-sm:    6px;
}
```

### Adjust Timing
**Close delay** — in `setupDesktopMenu()` inside `mega-menu.js`:
```javascript
state.leaveTimeout = setTimeout(closeMegaMenu, 175);  // Change 175ms
```

**Hover-intent delay** — in `addHoverIntent()` calls:
```javascript
addHoverIntent(col1Buttons, 'col1HoverTimeout', 120, ...);  // Change 120ms
```

**Transition speed** (CSS):
```css
--transition-speed: 200ms;
```

### Change Header Height
Update the CSS variable — it propagates to all `dvh` calculations automatically:
```css
--header-height: 70px;
```

---

## Troubleshooting

### Menu doesn't open on hover
- Confirm JavaScript is loaded (check browser console)
- Ensure viewport is >1024px wide (hamburger shows at ≤1024px)
- Check for JS errors in the console

### Mobile menu doesn't work
- Verify `.hamburger` button is present in the DOM
- Check console for errors
- Confirm `<meta name="viewport">` tag is in `<head>`

### Accordion not animating
- Check CSS is loading correctly (inspect `.acc-body` for `max-height` styles)
- Verify browser supports CSS transitions

### `:has()` selectors not working (corner radius)
- `:has()` requires Chrome 105+, Firefox 121+, Safari 15.4+
- Fallback: corners will remain rounded — no functional impact

### Styling conflicts
- Inspect with browser DevTools for specificity issues
- CSS variables allow targeted overrides without `!important`

---

## Browser Testing Checklist

- [ ] Chrome Desktop — hover, click, keyboard
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Chrome Mobile — hamburger, breadcrumb
- [ ] Safari iOS — floating toolbar with `dvh`
- [ ] Tablet landscape and portrait

## Accessibility Checklist

- [ ] Entire menu navigable with Tab key
- [ ] ESC closes menu from any depth
- [ ] Focus indicators visible at all levels
- [ ] Screen reader announces aria-expanded/collapsed states
- [ ] Both `.mega-menu` and `.mobile-menu` announced as dialogs

## Performance Checklist

- [ ] No JavaScript errors in console
- [ ] Smooth animations (60fps) — check Performance tab
- [ ] No layout shifts (check CLS in Lighthouse)
- [ ] Logo loads with high priority (check Network tab — `fetchpriority: high`)
- [ ] CDN preconnect resolves early (check Network waterfall)

---

Refer to `README.md` for full documentation, or `CLAUDE.md` for architectural notes.
