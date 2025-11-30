# Project Changelog & Checkpoints

All notable changes to this project will be documented in this file.

## [save4] - 2025-11-30

### Added
- **Sakura Live Background**: Implemented the animated sakura background on all authentication pages (`login.html`, `signup.html`, `forgot-password.html`, `reset-password.html`, `google-otp.html`, `google-complete.html`) for a consistent and premium visual experience.
- **Enhanced Signup Flow**: Rewrote the signup process to create users immediately and use OTP verification instead of email links. Form signups now auto-login upon successful verification.
- **Session Persistence**: Added explicit session saving in OAuth and OTP flows to prevent data loss during redirects.

### Fixed
- **Profile Data Missing**: Resolved the "Profile data missing from session" error in Google OAuth by implementing a fallback mechanism to recover user data from the database if the session profile is lost.
- **Username Display**: Updated the UI to prioritize displaying the chosen `username` instead of the generic `displayName` (email prefix) in the header and profile page.
- **Verification Status**: Ensured that `isVerified` is correctly set to `true` for all users (both new and existing) upon successful OTP verification.
- **Duplicate Endpoints**: Removed duplicate API endpoints in `server.js` that were causing conflicts.

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
