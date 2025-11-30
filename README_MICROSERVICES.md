# Microservices Architecture

This project has been migrated to a microservices architecture.

## Services

| Service | Port | Description |
|---------|------|-------------|
| **Gateway** | 3000 | Entry point. Serves frontend and proxies API requests. |
| **Auth** | 3001 | Handles Login, Signup, OAuth, User Profile. |
| **Products** | 3002 | Handles Product listing and details. |
| **Orders** | 3003 | Handles Purchases, Order History, Reports. |

## Running Locally

To start all services at once:

```bash
npm start
```

This uses `concurrently` to launch all 4 services.

## Architecture Details

*   **Shared Database**: All services connect to the same MongoDB instance.
*   **Shared Session**: All services share the same MongoDB session store. This allows `req.user` to work across services (via Passport).
*   **Proxying**: The Gateway uses `http-proxy-middleware` to route requests.
    *   `/api/auth` -> Auth Service
    *   `/api/products` -> Product Service
    *   `/api/orders` -> Order Service

## Deployment Note

**Important**: This multi-process setup is **NOT** compatible with Vercel's standard serverless deployment.
To deploy this architecture, you should use a container-based platform like **Render**, **Railway**, or **Heroku**, or deploy each service as a separate Vercel project (which would require code separation).

For Vercel, the monolithic `server.js` (via `npm run start:monolith`) is still the best option unless you refactor to Vercel Functions.
