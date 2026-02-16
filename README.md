# FortifyIQ Mega Menu System

Production-ready WordPress/Elementor-compatible mega menu with comprehensive desktop and mobile/tablet navigation.

## Features

### Desktop (>1024px)
- Hover-activated mega menu with 150-200ms close delay
- Five main sections: Products, Applications, Insights, Newsroom, Company
- Complex Products section with 3-column layout and accordion functionality
- Smooth transitions and animations
- Stable hover behavior with no flicker
- Auto-activation of first items at each level
- Background image fading for Insights/Company sections

### Tablet (768px-1024px)
- Two-column layout with hamburger menu
- Left column: main navigation
- Right column: contextual content
- Breadcrumb navigation for deep hierarchies
- First item auto-activated by default

### Mobile (<768px)
- Stacked layout with slide transitions
- Breadcrumb navigation maintained
- Smooth transitions between levels
- Full-screen menu panel

## File Structure

```
megamenu/
├── index.html          # Complete HTML structure
├── css/
│   └── styles.css      # All styling (desktop, tablet, mobile)
└── js/
    └── mega-menu.js    # Complete functionality
```

## Installation

### For WordPress/Elementor

1. **Add the HTML structure:**
   - In Elementor's Theme Builder, edit your header template
   - Add an HTML widget
   - Paste the content from the `<header>` section of index.html
   - Paste the mega menu containers (everything after header)

2. **Add the CSS:**
   - Go to Elementor > Custom CSS (or Theme > Customize > Additional CSS)
   - Paste the entire contents of `css/styles.css`

3. **Add the JavaScript:**
   - Use a plugin like "Insert Headers and Footers" or add to your theme's functions.php:
   ```php
   function enqueue_mega_menu_js() {
       wp_enqueue_script('mega-menu', get_stylesheet_directory_uri() . '/js/mega-menu.js', array(), '1.0', true);
   }
   add_action('wp_enqueue_scripts', 'enqueue_mega_menu_js');
   ```
   - Upload `js/mega-menu.js` to your theme's js folder

## Key Features

### State Management
- Clean state management for current menu, category, and crypto type
- Proper cleanup on menu close
- Stack-based navigation for mobile breadcrumbs

### Accordion Behavior
- Only one accordion open at a time per crypto section
- Smooth height transitions (300ms)
- First accordion auto-opened on section activation
- Click to expand/collapse

### Mobile Navigation
- Two-column layout on tablet (side-by-side)
- Stacked layout on mobile (with slide transitions)
- Breadcrumb shows full navigation path
- Each breadcrumb level is clickable to go back

### Keyboard Accessibility
- ESC key closes mega menu
- Tab navigation within menu
- Focus management and visible focus indicators
- ARIA attributes for screen readers

### Performance
- No jQuery dependency
- Vanilla JavaScript
- CSS transitions (hardware-accelerated)
- Minimal DOM manipulation
- Event delegation where appropriate

## Customization

### Colors
Edit CSS variables in `:root`:
```css
--primary-bg: #ffffff;
--text-primary: #1a1a1a;
--text-secondary: #666666;
--border-color: #e0e0e0;
--hover-bg: #f5f5f5;
--active-bg: #e8e8e8;
```

### Timing
```css
--transition-speed: 200ms;      /* Menu open/close speed */
--ease: cubic-bezier(0.4, 0, 0.2, 1);  /* Easing function */
```

In JavaScript (line ~200):
```javascript
state.leaveTimeout = setTimeout(closeMegaMenu, 175);  /* Close delay */
```

### Container Width
The mega menu container is set to 1046px (derived from 1240px - logo area).
Adjust in CSS `.mega-content`:
```css
max-width: 1046px;
```

### Column Widths
Products section:
- Column 1: 330px
- Column 2: auto (conditional)
- Column 3: 1fr (fills remaining space)

Insights sidebar: 242px
Company sidebar: 306px

## Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Progressive Enhancement
The menu works with JavaScript disabled:
- Main navigation links remain accessible
- Can be enhanced with static dropdowns

## Performance Considerations
- Uses CSS transforms for animations (GPU-accelerated)
- Debounced resize handlers
- Efficient event delegation
- Minimal reflows/repaints

## Accessibility
- Semantic HTML structure
- ARIA attributes (aria-expanded, aria-hidden, aria-modal)
- Keyboard navigation (Tab, ESC)
- Focus management
- Screen reader compatible

## Notes for WordPress/Elementor
- No conflicts with Elementor's default scripts
- Uses standard DOM methods (no framework dependency)
- Namespace wrapped (IIFE) to prevent global pollution
- Can coexist with other plugins

## Maintenance
The code is modular and well-commented. Key sections:
- Desktop menu handlers (line ~45)
- Products menu logic (line ~180)
- Mobile/tablet menu (line ~350)
- State management (line ~10)

## License
Copyright © 2024 FortifyIQ. All rights reserved.

## Support
For issues or customization requests, refer to the inline code comments or contact your development team.
