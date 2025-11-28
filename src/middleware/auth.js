// Admin Middleware
function isAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next()
}

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

module.exports = { isAdmin, isAuthenticated };
