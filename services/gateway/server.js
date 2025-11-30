const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Debug logging
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
});

// Proxy Instances
const authProxy = createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true
});

const productProxy = createProxyMiddleware({ 
    target: 'http://localhost:3002',
    changeOrigin: true
});

const orderProxy = createProxyMiddleware({ 
    target: 'http://localhost:3003',
    changeOrigin: true
});

// Manual Routing to prevent path stripping
app.use((req, res, next) => {
    const path = req.path;

    // Order Service
    if (path.startsWith('/api/user/orders') || 
        path.startsWith('/api/orders') || 
        path.startsWith('/api/purchase') || 
        path.startsWith('/api/report')) {
        return orderProxy(req, res, next);
    }

    // Product Service
    if (path.startsWith('/api/products')) {
        return productProxy(req, res, next);
    }

    // Auth Service
    if (path.startsWith('/api/auth') || 
        path.startsWith('/api/login') || 
        path.startsWith('/api/signup') || 
        path.startsWith('/api/logout') || 
        path.startsWith('/api/user') || 
        path.startsWith('/auth')) {
        return authProxy(req, res, next);
    }

    next();
});

// Serve Static Files (Frontend)
// Create static middleware once
const staticMiddleware = express.static(path.join(__dirname, '../../public'));

// Only serve static files for non-API routes (Fallback)
app.use((req, res, next) => {
    staticMiddleware(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
    console.log(`Proxying Auth -> http://localhost:3001`);
    console.log(`Proxying Products -> http://localhost:3002`);
    console.log(`Proxying Orders -> http://localhost:3003`);
});

