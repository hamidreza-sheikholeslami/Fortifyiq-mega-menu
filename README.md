# FortifyIQ Mega Menu System

Production-ready WordPress/Elementor-compatible mega menu with comprehensive desktop and mobile/tablet navigation.

## Features

### Desktop (>1024px)
- Hover-activated mega menu with 175ms close delay
- Five main sections: Products, Applications, Insights, Newsroom, Company
- Complex Products section with 3-column layout and accordion functionality
- 120ms hover-intent delay on category/crypto-type switching (prevents flicker)
- Background image fading for Insights, Newsroom, and Company sections

### Tablet (768px–1024px)
- Two-column layout with hamburger menu
- Left column: main navigation; right column: contextual content
- Breadcrumb navigation for deep hierarchies
- First item auto-activated by default
- Slide animation on navigation transitions

### Mobile (<768px)
- Stacked layout with slide transitions
- Breadcrumb navigation maintained
- Full-screen menu panel
- `dvh` units for viewport height (safe on iOS/Android with floating browser UI)

## File Structure

```
├── index.html          # Complete HTML structure (660 lines)
├── css/
│   └── styles.css      # All styling — desktop, tablet, mobile (1252 lines)
└── js/
    └── mega-menu.js    # Complete functionality (848 lines)
```

## Installation

### For WordPress/Elementor

1. **Add the HTML structure:**
   - In Elementor's Theme Builder, edit your header template
   - Add an HTML widget
   - Paste the `<header>` block and mega menu containers from `index.html`

2. **Add the CSS:**
   - Go to Elementor > Custom CSS (or Theme > Customize > Additional CSS)
   - Paste the entire contents of `css/styles.css`

3. **Add the JavaScript:**
   - Upload `js/mega-menu.js` to your theme's `js/` folder
   - Enqueue via `functions.php`:
   ```php
   function enqueue_mega_menu_js() {
       wp_enqueue_script(
           'mega-menu',
           get_stylesheet_directory_uri() . '/js/mega-menu.js',
           [],
           '2.0.0',
           true
       );
   }
   add_action('wp_enqueue_scripts', 'enqueue_mega_menu_js');
   ```

## Key Features

### State Management
- Central `state` object tracks current menu, category, crypto type, and nav direction
- `state.viewStack` array powers mobile/tablet breadcrumb history
- Clean teardown via `closeMegaMenu()` / `closeMobileMenu()`

### Accordion Behavior
- Only one accordion open at a time per crypto section
- Smooth `max-height` transition (height → 0 or scrollHeight)
- Click to expand/collapse; first accordion auto-opened on section activation

### Mobile Navigation
- Two-column layout on tablet (side-by-side)
- Stacked layout on mobile (slide transitions)
- Breadcrumb shows full navigation path; each step is clickable to go back

### Keyboard Accessibility
- ESC closes any open menu
- Tab trapping within the mega menu dialog
- Focus management and visible focus indicators
- ARIA: `aria-expanded`, `aria-hidden`, `aria-modal`, `aria-label` on all interactive elements

### Performance
- Zero dependencies — no jQuery, no frameworks
- CSS transforms for animations (GPU-accelerated)
- `addHoverIntent()` helper debounces hover activation (120ms)
- All DOM elements queried once at init (`els` cache object)
- HTML built with `map().join('')` — minimal reflows
- `fetchpriority="high"` on the logo image (LCP candidate)
- `<link rel="preconnect">` for the CDN domain

## Customization

### Colors
Edit CSS variables in `:root` of `styles.css`:
```css
--hover-color:        #F16D24;  /* Brand accent (buttons, active borders) */
--hover-bg-primary:   #FEF4EE;  /* Hover background (warm) */
--hover-bg-secondary: #E8EEF6;  /* Hover background (cool) */
--content-bg:         #F3F6FA;  /* Content area background */
--link-color:         #0066cc;  /* Link color — replace for brand */
--text-primary:       #1B293D;
--text-secondary:     #4A5568;
--text-tertiary:      #718096;
```

### Typography (rem-based, scales with user browser preferences)
```css
--font-nav:  1.125rem;   /* 18px — nav buttons */
--font-body: 0.9375rem;  /* 15px — body text */
--font-sm:   0.875rem;   /* 14px — small text */
--font-xs:   0.75rem;    /* 12px — labels */
```

### Border Radii
```css
--radius-pill: 50px;
--radius-xl:   16px;
--radius-lg:   12px;
--radius-md:    8px;
--radius-sm:    6px;
```

### Layout
```css
--header-height:  70px;    /* Header height — used in dvh calculations */
--container-max: 1240px;   /* Max content width */
```

### Timing
```css
--transition-speed: 200ms;
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

In JavaScript (`setupDesktopMenu()`):
```javascript
state.leaveTimeout = setTimeout(closeMegaMenu, 175);  // Close delay
// Hover-intent delay (addHoverIntent calls):
addHoverIntent(buttons, key, 120, skipFn, actionFn);
```

### Container Width
```css
/* .mega-content in styles.css */
max-width: calc(var(--container-max) - [logo-width]);
```

### Column Widths
Products section:
- Column 1: 330px
- Column 2: auto (conditional, shown only for Hardware)
- Column 3: 1fr (fills remaining space)

Sidebars: `--sidebar-width` inline CSS variable (242px Insights/Newsroom, 306px Company)

## Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari, Chrome Mobile
- Requires: `CSS :has()`, `dvh` units, `Array.prototype.at()` — all supported in browsers released after 2022

## Accessibility
- Semantic HTML5 with `<header>`, `<nav>`, `<ul role="menu">`, `<button role="menuitem">`
- Both mega menu and mobile menu have `role="dialog"`, `aria-modal="true"`, `aria-label`
- `aria-expanded` on all nav triggers and accordion headers
- `aria-hidden="true"` on decorative SVG icons
- Tab trapping within open mega menu
- ESC key support

## Performance Considerations
- GPU-accelerated CSS transforms for all animations
- `dvh` viewport units (avoids layout shift on mobile)
- `fetchpriority="high"` on logo (LCP)
- `<link rel="preconnect">` + `dns-prefetch` for CDN
- No layout shifts from undefined image dimensions

## Notes for WordPress/Elementor
- No conflicts with Elementor's default scripts
- IIFE-wrapped — zero global pollution
- Uses standard DOM methods — no framework dependency
- `document.readyState` guard handles both deferred and inline loading

## Maintenance
Code is modular with clear section comments. Key areas:
- `addHoverIntent()` — shared hover logic for col1, col2, and tabbed menus
- `renderView()` object map — add new view types here
- `getCryptoAccordionData()` — single source of truth for crypto accordion content
- `state` object — all mutable state is centralized here

## License
Copyright © 2025 FortifyIQ. All rights reserved.

## Support
For issues or customization requests, refer to inline code comments or `CLAUDE.md` for architectural guidance.
