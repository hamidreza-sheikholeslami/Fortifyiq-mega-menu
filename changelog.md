# Changelog

## Version 2.0 – Full Optimization Pass (Current)

### HTML (`index.html`) — 632 → 660 lines

**SEO & Social Meta (head)**
- Descriptive `<title>`: `FortifyIQ – Cryptographic Hardware IP & Security Solutions`
- `<meta name="description">` with concise brand copy
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical" href="https://fortifyiq.com/">`
- Full Open Graph block: `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`
- Twitter Card: `summary` type with title, description, image

**Performance (head)**
- `<link rel="icon">` pointing to the SVG logo (modern favicon)
- `<meta name="theme-color" content="#ffffff">` for browser chrome tinting
- `<link rel="preconnect" href="https://fortifyiq.com" crossorigin>` — early connection for CDN (logo + 10 background images)
- `<link rel="dns-prefetch" href="https://fortifyiq.com">`

**Accessibility (body)**
- Logo `<img>`: added `fetchpriority="high"` — marks it as LCP candidate for the browser fetch scheduler
- Desktop mega menu `<div>`: added `aria-label="Site navigation"` — dialogs require an accessible name
- Mobile menu `<div>`: added `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile navigation"` — consistent with desktop mega menu

---

### CSS (`css/styles.css`) — 709 → 1252 lines

**New CSS Variables in `:root`**
- Layout: `--header-height: 70px`, `--container-max: 1240px`
- Border radius: `--radius-pill: 50px`, `--radius-xl/lg/md/sm`
- Typography: `--font-nav: 1.125rem`, `--font-body: 0.9375rem`, `--font-sm: 0.875rem`, `--font-xs: 0.75rem`

**Responsive Units**
- All font sizes converted from `px` to `rem` — scales with user browser font-size preferences
- `vh` → `dvh` for all viewport-height calculations — safe on iOS/Android with floating browser UI bars
- `var(--header-height)` replaces all hardcoded `70px` instances
- `var(--container-max)` replaces all hardcoded `1240px` instances
- Radius variables replace all hardcoded border-radius values

**Globalized Colors**
- `var(--hover-color)` replaces hardcoded `#F16D24` in `.contact-btn`, `.learn-more-btn`, `.search-btn`

**Deduplication & Cleanup**
- Merged two split `.sub-panel` declarations into one
- Merged `.menu-btn:hover` and `.menu-btn.active` (were identical declarations)
- Removed redundant `.col-2 .menu-btn { font-weight: 300 }`
- `inset: 0` shorthand replaces `top: 0; right: 0; bottom: 0; left: 0` on `.bg-image`

**Bug Fix: `:has()` Corner Radius**
- Replaced unreliable `li:first-child` / `li:last-child` pseudo-class selectors inside `:has()` with explicit `data-crypto` attribute selectors:
  - `.products-grid:has(.col-2 .menu-btn[data-crypto="pqc"].active) .crypto-section.active { border-top-left-radius: 0 }`
  - `.products-grid:has(.col-2 .menu-btn[data-crypto="roots"].active) .crypto-section.active { border-bottom-left-radius: 0 }`

---

### JavaScript (`js/mega-menu.js`) — 1041 → 848 lines (−193 lines)

**New Helpers**
- `clearTimer(key)` — safely clears and nulls any state timer key; `clearTimeout(null)` is a no-op so no `if` guard needed
- `clearAllTimers()` — clears all 4 timer keys at once; used in `closeMegaMenu()` and breakpoint change handlers
- `addHoverIntent(buttons, stateKey, delay, skipFn, actionFn)` — the identical 15-line mouseenter/mouseleave pattern that existed for col1, col2, and tabbed menus is now a single reusable helper (~60 lines removed)

**`renderView` Dispatch Map**
- Replaced 9-branch `switch` statement with an object map `{ type: () => fn(...) }` + `?.()` optional call

**HTML Building**
- All `forEach +=` string-concatenation patterns replaced with `map().join('')` across all 8 render functions — functional, concise, no mutable string accumulation

**DOM Cache Rename**
- `elements` → `els` — shorter name used ~40× throughout the file

**Modern JS Patterns**
- `stack.at(-1)` replaces `stack[stack.length - 1]`
- `Array.from({ length: n }, (_, i) => …)` replaces `for` loop in `updateBreadcrumb`
- `classList.toggle(cls, bool)` replaces `add`/`remove` pairs in mobile column switching
- Optional chaining `?.` for nullable element queries and optional `skipFn` parameter
- `??` nullish coalescing replacing `||` where semantically appropriate
- `parseInt(n, 10)` with explicit radix on all string-to-integer conversions
- `new Set([…])` for O(1) navigable-item lookup in products sub view

**Removed**
- Empty `autoActivateFirstItems()` function and its call in `init()` — first-item activation is handled inline at each activation site
- Dead comment `// Handle search expansion here`

---

## Version 1.1 – Feature Update

### Changes Made:

1. **Logo Implementation**
   - Replaced text logo with image logo
   - URL: https://fortifyiq.com/wp-content/uploads/2025/01/fortifyiq-logo.svg
   - Width: 124px
   - Padding-right: 60px

2. **Header Layout Adjustments**
   - Menu floated to the left after logo
   - Search icon moved to right side
   - Added "Contact Us" button after search icon

3. **Hover Activation (Desktop)**
   - Products menu items (col-1) now activate on hover instead of click
   - Crypto types (col-2) now activate on hover instead of click
   - Insights sidebar items now activate on hover instead of click
   - Company sidebar items now activate on hover instead of click
   - Accordions remain click-to-toggle

4. **Card Grid Layouts**
   - Changed to 2-column grid for:
     * Cryptographic Software Libraries
     * PQC – Post-Quantum Cryptography
     * Forti EDA Validation Studios
     * Security Assurance

### Technical Updates:

**HTML:**
- Updated logo section with img tag
- Added header-actions wrapper for search and contact button
- Added `grid-2-cols` class to specific card grids

**CSS:**
- Logo image styling (width: 124px, padding-right: 60px)
- Desktop nav now uses flex: 1 to float left
- Header actions styling for right-aligned buttons
- Contact button styling with hover states
- Added `.grid-2-cols` modifier for 2-column card grids
- Responsive hide for header-actions on mobile/tablet

**JavaScript:**
- Changed Products menu items (col-1) from click to mouseenter
- Changed Crypto types (col-2) from click to mouseenter
- Changed Insights/Company tabs from click to mouseenter
- Maintained click behavior for accordions
- All mobile/tablet functionality unchanged

### Interaction Summary:

**Desktop Mega Menu:**
- Main nav items (Products, Applications, etc.): Hover to open mega menu
- Products > Category items: Hover to change content
- Products > Crypto types: Hover to change content
- Accordions: Click to expand/collapse
- Insights/Company tabs: Hover to change content

**Mobile/Tablet:**
- No changes — all interactions remain click-based as specified
