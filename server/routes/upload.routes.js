const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth.middleware');
const { User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Logging middleware for upload routes
router.use((req, res, next) => {
  console.log(`[UPLOAD] ${req.method} ${req.url} - User: ${req.user?.id || 'Not authenticated'}`);
  console.log('[UPLOAD] Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'None'
  });
  next();
});

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log('[UPLOAD] File filter check:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('[UPLOAD] Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name for file upload.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }

  if (err) {
    console.error('[UPLOAD] Upload error:', err);
    return res.status(400).json({ message: err.message });
  }

  next();
};

// Upload profile picture
router.post('/profile-picture', validateToken, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    console.log('Profile picture upload request received');
    console.log('User ID:', req.user?.id);
    console.log('File info:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);

    // Update user's profile picture in database
    await User.update(
      { profilePicture: imageUrl },
      { where: { id: req.user.id } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    console.log('Profile picture updated successfully for user:', req.user.id);

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
  }
});

// Upload cover photo
router.post('/cover-photo', validateToken, upload.single('coverPhoto'), handleMulterError, async (req, res) => {
  try {
    console.log('Cover photo upload request received');
    console.log('User ID:', req.user?.id);
    console.log('File info:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);

    // Update user's cover photo in database
    await User.update(
      { coverPhoto: imageUrl },
      { where: { id: req.user.id } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    console.log('Cover photo updated successfully for user:', req.user.id);

    res.json({
      message: 'Cover photo uploaded successfully',
      coverPhoto: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error uploading cover photo', error: error.message });
  }
});

// Delete profile picture
router.delete('/profile-picture', validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user.profilePicture) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Update database
      await User.update(
        { profilePicture: null },
        { where: { id: req.user.id } }
      );
    }

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Error deleting profile picture', error: error.message });
  }
});

// Delete cover photo
router.delete('/cover-photo', validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user.coverPhoto) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', user.coverPhoto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Update database
      await User.update(
        { coverPhoto: null },
        { where: { id: req.user.id } }
      );
    }

    res.json({ message: 'Cover photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting cover photo:', error);
    res.status(500).json({ message: 'Error deleting cover photo', error: error.message });
  }
});

// Test endpoint to verify upload routes are working
router.get('/test', validateToken, (req, res) => {
  res.json({
    message: 'Upload routes are working!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
