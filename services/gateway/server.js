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

// API Proxy Routes

// Order Service (Specific routes first)
app.use('/api/user/orders', createProxyMiddleware({ 
    target: 'http://localhost:3003',
    changeOrigin: true
}));

// Auth Service routes
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true
}));

app.use('/api/login', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true
}));

app.use('/api/signup', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true
}));

app.use('/api/logout', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true
}));

app.use('/api/user', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true
}));

app.use('/auth', createProxyMiddleware({ 
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true
}));

// Product Service
app.use('/api/products', createProxyMiddleware({ 
    target: 'http://localhost:3002',
    changeOrigin: true
}));

// Order Service routes
app.use('/api/orders', createProxyMiddleware({ 
    target: 'http://localhost:3003',
    changeOrigin: true
}));

app.use('/api/purchase', createProxyMiddleware({ 
    target: 'http://localhost:3003',
    changeOrigin: true
}));

app.use('/api/report', createProxyMiddleware({ 
    target: 'http://localhost:3003',
    changeOrigin: true
}));

// Serve Static Files (Frontend)
// Create static middleware once
const staticMiddleware = express.static(path.join(__dirname, '../../public'));

// Only serve static files for non-API routes
app.use((req, res, next) => {
    // Skip static file serving for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return next();
    }
    staticMiddleware(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
    console.log(`Proxying Auth -> http://localhost:3001`);
    console.log(`Proxying Products -> http://localhost:3002`);
    console.log(`Proxying Orders -> http://localhost:3003`);
});

