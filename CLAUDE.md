# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready, standalone mega menu component for FortifyIQ's website, designed for WordPress/Elementor integration. Built with vanilla JavaScript (ES6+), HTML5, and CSS3 — zero dependencies, no build step.

**Files:** `index.html` (660 lines), `js/mega-menu.js` (848 lines), `css/styles.css` (1252 lines)

## Architecture

### Pattern
IIFE-wrapped namespace to prevent global pollution. Central `state` object manages current menu, category, crypto type, and mobile navigation stack. DOM data attributes (`data-menu`, `data-sub`, `data-crypto`, `data-tab`) drive navigation routing.

### JavaScript Structure (mega-menu.js)
- **State object** (~line 7): Tracks `currentMenu`, `currentCategory`, `currentCrypto`, `viewStack`, 4 timer keys, `navDirection`, and breakpoint booleans
- **DOM element cache `els`** (~line 24): All interactive elements queried once at init
- **Helpers** (~line 38): `clearTimer(key)`, `clearAllTimers()`, `addHoverIntent()` — shared across desktop and tabbed menus
- **Desktop menu handlers** (~line 77): Hover/click with 175ms close delay; `openMegaMenu()` / `closeMegaMenu()`
- **Products menu** (~line 125): 3-column navigation; `activateProductCategory()` / `activateCryptoType()` / `toggleAccordion()` — only one accordion open per section
- **Tabbed menus** (~line 195): Insights/Newsroom/Company with sidebar + content panel and background image fading; uses `addHoverIntent`
- **Mobile/tablet menu** (~line 210): Stack-based navigation (`state.viewStack`); `renderCurrentViews()` dispatches to typed render functions; `animateSlide()` handles transitions
- **`renderView` dispatch map** (~line 285): Object map of `{ type → fn }` replacing a switch statement
- **Render functions** (~line 295): `renderMainNavView`, `renderProductsSubView`, `renderCryptoTypesView`, `renderCryptoDetailView`, `renderApplicationsView`, `renderNewsroomSubView`, `renderProductCardsView`, `renderInsightsSubView`, `renderCompanySubView`, `renderCardListView`
- **Crypto accordion data** (~line 530): `getCryptoAccordionData(cryptoId)` returns structured data for 6 crypto types
- **Breadcrumb** (~line 650): `updateBreadcrumb()` builds clickable nav trail from `state.viewStack`
- **Keyboard navigation** (~line 675): ESC closes menu; Tab trapping within mega menu
- **Responsive handling** (~line 700): `matchMedia` listeners for tablet/mobile breakpoints

### CSS Structure (styles.css)
- CSS variables in `:root` control colors, layout dimensions, border radii, typography scale, transitions
- Font sizes use `rem` units (base 16px): `--font-nav: 1.125rem`, `--font-body: 0.9375rem`, `--font-sm: 0.875rem`, `--font-xs: 0.75rem`
- Layout tokens: `--header-height: 70px`, `--container-max: 1240px`
- Border-radius tokens: `--radius-pill/xl/lg/md/sm`
- `dvh` units used for viewport height (accounts for mobile browser UI bars)
- Animations use CSS transforms (GPU-accelerated): mega menu slides down with opacity fade, mobile slides from right
- Accordion uses `max-height` transition (0 → scrollHeight → unset)
- `inset: 0` shorthand used for full-cover positioned elements
- `:has()` selectors with `data-crypto` attributes for corner-radius adjustments on the Products grid

### Responsive Breakpoints
- **Desktop (>1024px):** Hover-activated mega menu, 5 sections
- **Tablet (768–1024px):** Hamburger menu, two-column layout (nav left, content right)
- **Mobile (<768px):** Hamburger menu, stacked with slide transitions

## Key Dimensions

| Element | Value |
|---------|-------|
| Container width | 1046px (from `--container-max: 1240px` minus logo) |
| Header height | `--header-height: 70px` |
| Products grid | 330px + auto + 1fr |
| Insights sidebar | 242px |
| Company sidebar | 306px |
| Close delay | 175ms (`setupDesktopMenu()`) |
| Hover-intent delay | 120ms (`addHoverIntent()`) |
| Transition speed | `--transition-speed: 200ms` |

## Integration

No build or install commands. This is a drop-in component:
1. HTML goes into an Elementor HTML widget (Theme Builder header)
2. CSS goes into Elementor Custom CSS or Additional CSS
3. JS uploaded to theme and enqueued via `wp_enqueue_script` in functions.php

## Important Conventions

- The Products section is the most complex: 3-column layout with categories (col 1) → crypto types (col 2, conditional) → dynamic content area (col 3) with accordions or card grids
- State cleanup happens in `closeMegaMenu()` via `clearAllTimers()` — always reset state when closing
- Mobile uses a stack-based navigation model (`state.viewStack`) for breadcrumb history; tablet always keeps at least 2 items in the stack
- `addHoverIntent(buttons, stateKey, delay, skipFn, actionFn)` — use this for any new hover-triggered navigation; do NOT attach raw `mouseenter` listeners for navigation
- `clearTimer(key)` is safe to call even when the timer is already null (`clearTimeout(null)` is a no-op)
- HTML building in render functions uses `map().join('')` — do NOT revert to `forEach +=` string concatenation
- `renderView` uses an object dispatch map — add new view types there, not as new switch cases
- Link color `--link-color: #0066cc` and brand accent `--hover-color: #F16D24` are CSS variables — do not hardcode hex values
- ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-modal`, `aria-label`) are maintained throughout for accessibility; both `.mega-menu` and `.mobile-menu` have `role="dialog"` and `aria-modal="true"`
