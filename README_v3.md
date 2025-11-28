# v3 Release Notes - Shopping Cart Application

## Overview
This release (v3) focuses on stabilizing the Admin Dashboard, enhancing user management capabilities, and fixing critical backend workflows compared to v2.

## 🚀 New Features & Improvements

### 1. Admin Dashboard Overhaul (`admin.html`)
*   **Functional User Management:**
    *   The "Registered Users" table now correctly fetches and displays data from MongoDB.
    *   Added ability to **Edit** user details (Email, Verification Status, Admin Role).
    *   Added **Bulk Delete** functionality with safety checks (prevents deleting own admin account).
*   **Advanced Bulk User Upload:**
    *   **Excel Support:** Upload users via `.xlsx` files.
    *   **Smart Duplicate Detection:** Automatically skips users that already exist in the database.
    *   **Detailed Reporting:** Shows a clear summary of:
        *   ✅ Successfully added users.
        *   ⚠️ Skipped users (duplicates).
        *   ❌ Errors (with specific reasons).
    *   **Continuous Workflow:** Added "Upload Another File" button to reset the form instantly without refreshing the page.

### 2. Backend Enhancements (`server.js`)
*   **New Admin API Endpoints:**
    *   `GET /api/admin/users`: Fetch all users (excluding sensitive data).
    *   `POST /api/admin/bulk-upload`: Handle Excel file parsing and user creation.
    *   `PUT /api/admin/users/:id`: Update specific user details.
    *   `POST /api/admin/users/bulk-delete`: Remove multiple users safely.
    *   `POST /api/admin/verify-user`: Toggle user verification status.
*   **Security & Middleware:**
    *   Enforced `isAdmin` middleware on all admin routes to prevent unauthorized access.
    *   Fixed session management issues to ensure admins stay logged in.

### 3. Bug Fixes
*   Fixed issue where Admin page would load blank or fail to fetch data.
*   Fixed JavaScript errors in the upload response handler (`filter` of undefined).
*   Resolved issues with Google OAuth session persistence.

## 📝 How to Run
1.  Ensure MongoDB is running.
2.  Start the server: `npm start`
3.  Login as admin at `/login.html`.
4.  Access dashboard at `/admin.html`.
