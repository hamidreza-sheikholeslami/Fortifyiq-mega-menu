# Changelog

## Version 1.1 - Updated (Current)

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
- No changes - all interactions remain click-based as specified