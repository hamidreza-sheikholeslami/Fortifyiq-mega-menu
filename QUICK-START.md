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
Upload the JS file to your theme and enqueue it:

**Option A: Using functions.php**
```php
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script(
        'mega-menu',
        get_stylesheet_directory_uri() . '/js/mega-menu.js',
        array(),
        '1.0.0',
        true
    );
});
```

**Option B: Using Insert Headers and Footers plugin**
1. Install "Insert Headers and Footers" plugin
2. Go to Settings > Insert Headers and Footers
3. Paste the contents of `js/mega-menu.js` wrapped in `<script>` tags in the footer section

### Step 4: Test
1. Visit your site
2. Test desktop hover interactions
3. Test mobile/tablet hamburger menu
4. Test keyboard navigation (Tab and ESC keys)

## Key Measurements

- **Container Width:** 1046px (adjust in CSS if needed)
- **Header Height:** 70px
- **Mega Menu Max Height:** 100vh
- **Close Delay:** 175ms
- **Transition Speed:** 200ms

## Customization Quick Reference

### Change Colors
Edit these CSS variables:
```css
:root {
    --primary-bg: #ffffff;        /* Background */
    --text-primary: #1a1a1a;      /* Main text */
    --text-secondary: #666666;    /* Secondary text */
    --border-color: #e0e0e0;      /* Borders */
    --hover-bg: #f5f5f5;          /* Hover state */
    --active-bg: #e8e8e8;         /* Active state */
}
```

### Change Link Colors
Search for `#0066cc` in the CSS file and replace with your brand color.

### Change Fonts
Add your font to the `body` selector in CSS:
```css
body {
    font-family: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Adjust Timing
**Close delay** (JavaScript, line ~202):
```javascript
state.leaveTimeout = setTimeout(closeMegaMenu, 175);  // Change 175 to your value
```

**Transition speed** (CSS):
```css
--transition-speed: 200ms;  /* Change to 150ms, 250ms, etc. */
```

## Troubleshooting

### Menu doesn't open on hover
- Check that JavaScript is loaded (view browser console)
- Ensure you're on desktop (>1024px width)
- Check for JavaScript errors in console

### Mobile menu doesn't work
- Verify hamburger button exists in DOM
- Check console for errors
- Ensure viewport meta tag is present

### Accordion not animating
- Check that CSS is properly loaded
- Verify browser supports CSS transitions
- Check for conflicting CSS

### Styling conflicts
- Check CSS specificity
- Use browser DevTools to inspect elements
- May need to add `!important` for certain properties

## Browser Testing Checklist

- [ ] Chrome Desktop (hover, click, keyboard)
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Chrome Mobile (hamburger, swipe, breadcrumb)
- [ ] Safari iOS
- [ ] Tablet landscape and portrait modes

## Accessibility Checklist

- [ ] Can navigate entire menu with keyboard (Tab key)
- [ ] ESC key closes menu
- [ ] Focus indicators are visible
- [ ] Screen reader announces expanded/collapsed states
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG standards

## Performance Checklist

- [ ] No JavaScript errors in console
- [ ] Smooth animations (60fps)
- [ ] No layout shifts
- [ ] Fast initial load
- [ ] Works with slow 3G connection

## Need Help?

Refer to the main README.md for detailed documentation, or check the inline comments in the source files.
