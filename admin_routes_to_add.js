// -------- ADD THESE ADMIN USER ROUTES TO server.js AFTER THE PRODUCT ADMIN ROUTES --------

// ---------- Admin User Routes ----------
// Get all users
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -otpCode -resetPasswordToken').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
app.put('/api/admin/users/:userId', isAdmin, async (req, res) => {
  try {
    const { email, isVerified, isAdmin: makeAdmin, isAdminVerified } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (email) user.email = email;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (typeof makeAdmin === 'boolean') user.isAdmin = makeAdmin;
    if (typeof isAdminVerified === 'boolean') user.isAdminVerified = isAdminVerified;
    
    await user.save();
    res.json({ message: 'User updated', user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk delete users
app.delete('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'No user IDs provided' });
    }
    
    // Prevent admin from deleting themselves
    const currentUserId = req.user._id.toString();
    if (userIds.includes(currentUserId)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await User.deleteMany({ _id: { $in: userIds } });
    res.json({ message: `${result.deletedCount} user(s) deleted` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload users from Excel
app.post('/api/admin/users/upload', isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    const results = { success: [], failed: [] };
    
    for (const row of rows) {
      try {
        const { username, email, password, phoneNumber } = row;
        
        if (!username || !email) {
          results.failed.push({ row, reason: 'Missing username or email' });
          continue;
        }
        
        // Check if user exists
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
          results.failed.push({ row, reason: 'Username or email already exists' });
          continue;
        }
        
        const user = new User({
          username,
          email,
          password: password || Math.random().toString(36).slice(-8),
          phoneNumber: phoneNumber || '',
          isVerified: true,
          isAdminVerified: true
        });
        
        await user.save();
        results.success.push(username);
      } catch (err) {
        results.failed.push({ row, reason: err.message });
      }
    }
    
    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);
    
    res.json({
      message: `Upload complete: ${results.success.length} success, ${results.failed.length} failed`,
      results
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});
