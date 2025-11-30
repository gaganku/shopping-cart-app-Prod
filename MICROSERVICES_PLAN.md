# Microservices Migration Plan

We are migrating the monolithic `server.js` into a microservices architecture. This will improve scalability and organization.

## Architecture

We will split the application into 4 distinct services:

1.  **Gateway Service (Port 3000)**
    *   **Role**: Entry point for the frontend.
    *   **Responsibilities**:
        *   Serve static files (`public/` folder).
        *   Route API requests to appropriate microservices.
        *   Handle CORS.
    *   **Dependencies**: `express`, `http-proxy-middleware`.

2.  **Auth Service (Port 3001)**
    *   **Role**: Handle User Authentication.
    *   **Responsibilities**:
        *   Login, Signup, Logout.
        *   Google OAuth.
        *   OTP Verification (Email).
        *   User Profile Management.
    *   **Database**: Access to `users` collection.

3.  **Product Service (Port 3002)**
    *   **Role**: Manage Product Catalog.
    *   **Responsibilities**:
        *   List products.
        *   Get product details.
        *   Manage stock (internal API).
    *   **Database**: Access to `products` collection.

4.  **Order Service (Port 3003)**
    *   **Role**: Handle Purchases.
    *   **Responsibilities**:
        *   Create orders.
        *   Process payments (mock).
        *   Send confirmation emails.
        *   Generate reports.
    *   **Database**: Access to `orders` collection.

## Shared Resources
*   **Database**: All services will connect to the same MongoDB instance for now (Shared Database pattern).
*   **Session**: All services will share the same MongoDB session store to maintain login state across services.

## Migration Steps
1.  Setup directory structure.
2.  Install `http-proxy-middleware` and `concurrently`.
3.  Implement **Gateway**.
4.  Extract **Auth Service**.
5.  Extract **Product Service**.
6.  Extract **Order Service**.
7.  Update `package.json` to run all services.
