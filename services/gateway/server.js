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

// Proxy Configuration with pathRewrite
const authServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
});

const productServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
});

const orderServiceProxy = createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
});

// API Routes (MUST come BEFORE static file serving)

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

// Serve Static Files (Frontend) - AFTER API routes
// Note: We go up two levels to find 'public'
app.use(express.static(path.join(__dirname, '../../public')));

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
    console.log(`Proxying Auth -> http://localhost:3001`);
    console.log(`Proxying Products -> http://localhost:3002`);
    console.log(`Proxying Orders -> http://localhost:3003`);
});
