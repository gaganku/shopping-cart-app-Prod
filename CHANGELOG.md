# Project Changelog & Checkpoints

All notable changes to this project will be documented in this file.

## [save3] - 2025-11-29

### Added
- **Dynamic Mobile Menu**: Implemented a content-aware height for the mobile burger menu. It now expands based on the number of buttons instead of taking up the full screen height (`100vh`), eliminating wasted whitespace.
- **Responsive Admin Product Cards**: Added a mobile-specific layout for the Admin Dashboard's product list. Product cards now stack vertically (image top, info bottom) on small screens.
- **Improved Button Layout**: Wrapped admin action buttons ("Update Stock", "Delete") in a flex container that ensures they are full-width and properly spaced on mobile devices, fixing the "cramped" look.

### Fixed
- **Mobile Menu Spacing**: Resolved issues with excessive padding and gaps in the mobile navigation menu.
- **CSS Lint Warnings**: Fixed `background-clip` property warnings by adding standard syntax alongside vendor prefixes in `style.css` and `admin.html`.
- **Admin Layout**: Fixed the vertical stacking issue of buttons in the admin product list by introducing a proper `.product-actions` container.

---
