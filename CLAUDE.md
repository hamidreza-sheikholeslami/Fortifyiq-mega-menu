# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready, standalone mega menu component for FortifyIQ's website, designed for WordPress/Elementor integration. Built with vanilla JavaScript (ES6+), HTML5, and CSS3 — zero dependencies, no build step.

**Files:** `index.html`, `mega-menu.js` (803 lines), `styles.css` (709 lines)

## Architecture

### Pattern
IIFE-wrapped namespace to prevent global pollution. Central state object manages current menu, category, crypto type, and mobile navigation stack. DOM data attributes (`data-menu`, `data-sub`, `data-crypto`, `data-tab`) drive navigation routing.

### JavaScript Structure (mega-menu.js)
- **State management** (~line 5): Central state object tracking all menu state
- **DOM element cache** (~line 16): All interactive elements queried once at init
- **Desktop menu handlers** (~line 42): Hover/click with 175ms close delay timeout
- **Products menu** (~line 155): 3-column navigation with accordion toggling — only one accordion open per section, first item auto-activated at each level
- **Tabbed menus** (~line 271): Insights/Company/Newsroom with sidebar + content panel and background image fading
- **Mobile/tablet menu** (~line 308): Level-based rendering with breadcrumb navigation; crypto accordion data is an embedded JS object (~line 560)
- **Keyboard navigation** (~line 729): ESC closes menu, Tab trapping within mega menu

### CSS Structure (styles.css)
- CSS variables in `:root` control colors, transitions, and easing
- Animations use CSS transforms (GPU-accelerated): mega menu slides down with opacity fade, mobile slides from right
- Accordion uses max-height transition (0 to 1000px)

### Responsive Breakpoints
- **Desktop (>1024px):** Hover-activated mega menu, 5 sections
- **Tablet (768–1024px):** Hamburger menu, two-column layout (nav left, content right)
- **Mobile (<768px):** Hamburger menu, stacked with slide transitions

## Key Dimensions

| Element | Value |
|---------|-------|
| Container width | 1046px (from 1240px minus logo) |
| Header height | 70px |
| Products grid | 330px + auto + 1fr |
| Insights sidebar | 242px |
| Company sidebar | 306px |
| Close delay | 175ms (JS line ~202) |
| Transition speed | 200ms (CSS variable) |

## Integration

No build or install commands. This is a drop-in component:
1. HTML goes into an Elementor HTML widget (Theme Builder header)
2. CSS goes into Elementor Custom CSS or Additional CSS
3. JS uploaded to theme and enqueued via `wp_enqueue_script` in functions.php

## Important Conventions

- The Products section is the most complex: 3-column layout with categories (col 1) → crypto types (col 2, conditional) → dynamic content area (col 3) with accordions or card grids
- State cleanup happens in `closeMegaMenu()` — always reset state when closing
- Mobile uses a stack-based navigation model (`mobileNavStack`) for breadcrumb history
- Link color `#0066cc` is used throughout CSS — replace globally for brand color changes
- ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-modal`) are maintained throughout for accessibility
