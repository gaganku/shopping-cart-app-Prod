const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
    origin: true, // Allow all origins for now
    credentials: true
}));

// Serve Static Files (Frontend)
// Note: We go up two levels to find 'public'
app.use(express.static(path.join(__dirname, '../../public')));

// Proxy Configuration
const authServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true, // Proxy websockets if needed
});

const productServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
});

const orderServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
});

// Routes Routing

// Order Service (Specific routes first)
app.use('/api/user/orders', orderServiceProxy);

// Auth Service
app.use('/api/auth', authServiceProxy);
app.use('/api/login', authServiceProxy);
app.use('/api/signup', authServiceProxy);
app.use('/api/logout', authServiceProxy);
app.use('/api/user', authServiceProxy); // Profile, etc.
app.use('/auth', authServiceProxy); // Google OAuth

// Product Service
app.use('/api/products', productServiceProxy);

// Order Service
app.use('/api/orders', orderServiceProxy);
app.use('/api/purchase', orderServiceProxy);
app.use('/api/report', orderServiceProxy);

// Fallback for SPA (if using client-side routing, but we are using multi-page HTML)
// For now, just let express.static handle it.

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
    console.log(`Proxying Auth -> http://localhost:3001`);
    console.log(`Proxying Products -> http://localhost:3002`);
    console.log(`Proxying Orders -> http://localhost:3003`);
});
