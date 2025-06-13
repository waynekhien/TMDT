const express = require('express');
const router = express.Router();
const { Story, User, StoryView, Follow } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Configure multer for story uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/stories/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Get stories from followed users
router.get('/feed', validateToken, async (req, res) => {
  try {
    // Get users that current user follows
    const following = await Follow.findAll({
      where: { followerId: req.user.id, status: 'accepted' },
      attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include own stories

    const stories = await Story.findAll({
      where: {
        userId: followingIds,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: StoryView,
          as: 'views',
          include: [{
            model: User,
            as: 'viewer',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group stories by user
    const storiesByUser = {};
    stories.forEach(story => {
      const userId = story.userId;
      if (!storiesByUser[userId]) {
        storiesByUser[userId] = {
          user: story.author,
          stories: [],
          hasUnviewedStories: false
        };
      }
      
      // Check if current user has viewed this story
      const hasViewed = story.views.some(view => view.userId === req.user.id);
      if (!hasViewed) {
        storiesByUser[userId].hasUnviewedStories = true;
      }
      
      storiesByUser[userId].stories.push({
        ...story.toJSON(),
        hasViewed
      });
    });

    res.json(Object.values(storiesByUser));
  } catch (error) {
    console.error('Error fetching stories feed:', error);
    res.status(500).json({ message: 'Error fetching stories feed', error: error.message });
  }
});

// Get user's stories
router.get('/user/:userId', validateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.findAll({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: StoryView,
          as: 'views',
          include: [{
            model: User,
            as: 'viewer',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ message: 'Error fetching user stories', error: error.message });
  }
});

// Get single story
router.get('/:id', validateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: StoryView,
          as: 'views',
          include: [{
            model: User,
            as: 'viewer',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ]
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (new Date() > story.expiresAt) {
      return res.status(410).json({ message: 'Story has expired' });
    }

    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Error fetching story', error: error.message });
  }
});

// Create new story
router.post('/', validateToken, upload.single('media'), async (req, res) => {
  try {
    const { content, backgroundColor, textColor } = req.body;

    const storyData = {
      userId: req.user.id,
      content,
      backgroundColor: backgroundColor || '#ffffff',
      textColor: textColor || '#000000'
    };

    // Handle media upload
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        storyData.imageUrl = `/uploads/stories/${req.file.filename}`;
      } else if (req.file.mimetype.startsWith('video/')) {
        storyData.videoUrl = `/uploads/stories/${req.file.filename}`;
      }
    }

    const story = await Story.create(storyData);

    // Fetch the complete story with associations
    const completeStory = await Story.findByPk(story.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ]
    });

    res.status(201).json(completeStory);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
});

// View story (mark as viewed)
router.post('/:id/view', validateToken, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    // Check if story exists and is not expired
    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (new Date() > story.expiresAt) {
      return res.status(410).json({ message: 'Story has expired' });
    }

    // Create or update story view
    const [storyView, created] = await StoryView.findOrCreate({
      where: { userId, storyId },
      defaults: { userId, storyId, viewedAt: new Date() }
    });

    if (!created) {
      await storyView.update({ viewedAt: new Date() });
    }

    // Update story views count
    await Story.increment('viewsCount', { where: { id: storyId } });

    res.json({ message: 'Story viewed successfully' });
  } catch (error) {
    console.error('Error viewing story:', error);
    res.status(500).json({ message: 'Error viewing story', error: error.message });
  }
});

// Delete story
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await story.update({ isActive: false });

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
});

// Clean up expired stories (can be called by a cron job)
router.delete('/cleanup/expired', async (req, res) => {
  try {
    const expiredStories = await Story.update(
      { isActive: false },
      {
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          },
          isActive: true
        }
      }
    );

    res.json({ 
      message: 'Expired stories cleaned up successfully',
      count: expiredStories[0]
    });
  } catch (error) {
    console.error('Error cleaning up expired stories:', error);
    res.status(500).json({ message: 'Error cleaning up expired stories', error: error.message });
  }
});

module.exports = router;
