const express = require('express');
const router = express.Router();
const { Post, User, Like, SocialComment, PostImage, Follow } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/posts/';
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get feed posts (posts from followed users + own posts)
router.get('/feed', validateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get users that current user follows
    const following = await Follow.findAll({
      where: { followerId: req.user.id, status: 'accepted' },
      attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include own posts

    const posts = await Post.findAndCountAll({
      where: {
        userId: followingIds,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        },
        {
          model: Like,
          as: 'likes',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Check if current user liked each post
    const postsWithLikeStatus = await Promise.all(posts.rows.map(async (post) => {
      const userLike = await Like.findOne({
        where: { userId: req.user.id, postId: post.id }
      });

      return {
        ...post.toJSON(),
        isLikedByCurrentUser: !!userLike,
        currentUserLikeType: userLike ? userLike.type : null
      };
    }));

    res.json({
      posts: postsWithLikeStatus,
      totalPosts: posts.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.count / limit)
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
});

// Get all posts (public timeline)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        },
        {
          model: Like,
          as: 'likes',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Check if current user liked each post (if user is authenticated)
    let postsWithLikeStatus = posts.rows;

    // Get user ID from token if available
    const authHeader = req.headers.authorization;
    let currentUserId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.id;
      } catch (error) {
        // Token invalid, continue without user context
      }
    }

    if (currentUserId) {
      postsWithLikeStatus = await Promise.all(posts.rows.map(async (post) => {
        const userLike = await Like.findOne({
          where: { userId: currentUserId, postId: post.id }
        });

        console.log(`Post ${post.id} - User ${currentUserId} - Like found:`, !!userLike);

        return {
          ...post.toJSON(),
          isLikedByCurrentUser: !!userLike,
          currentUserLikeType: userLike ? userLike.type : null
        };
      }));
    } else {
      console.log('No currentUserId found in token');
      postsWithLikeStatus = posts.rows.map(post => ({
        ...post.toJSON(),
        isLikedByCurrentUser: false,
        currentUserLikeType: null
      }));
    }

    res.json({
      posts: postsWithLikeStatus,
      totalPosts: posts.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.count / limit)
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: {
        userId: userId,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        },
        {
          model: Like,
          as: 'likes',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Check if current user liked each post (if user is authenticated)
    let postsWithLikeStatus = posts.rows;

    // Get user ID from token if available
    const authHeader = req.headers.authorization;
    let currentUserId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.id;
      } catch (error) {
        // Token invalid, continue without user context
      }
    }

    if (currentUserId) {
      postsWithLikeStatus = await Promise.all(posts.rows.map(async (post) => {
        const userLike = await Like.findOne({
          where: { userId: currentUserId, postId: post.id }
        });

        return {
          ...post.toJSON(),
          isLikedByCurrentUser: !!userLike,
          currentUserLikeType: userLike ? userLike.type : null
        };
      }));
    } else {
      postsWithLikeStatus = posts.rows.map(post => ({
        ...post.toJSON(),
        isLikedByCurrentUser: false,
        currentUserLikeType: null
      }));
    }

    res.json({
      posts: postsWithLikeStatus,
      totalPosts: posts.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.count / limit)
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        },
        {
          model: SocialComment,
          as: 'socialComments',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'profilePicture']
          }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create new post
router.post('/', validateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { content, location, taggedUsers } = req.body;

    const post = await Post.create({
      userId: req.user.id,
      content,
      location,
      taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : []
    });

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return PostImage.create({
          postId: post.id,
          imageUrl: `/uploads/posts/${file.filename}`,
          order: index
        });
      });
      await Promise.all(imagePromises);
    }

    // Update user's posts count
    await User.increment('postsCount', { where: { id: req.user.id } });

    // Fetch the complete post with associations
    const completePost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        }
      ]
    });

    res.status(201).json(completePost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post
router.put('/:id', validateToken, async (req, res) => {
  try {
    const { content, location } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    await post.update({ content, location });

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption', 'order']
        }
      ]
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.update({ isActive: false });

    // Update user's posts count
    await User.decrement('postsCount', { where: { id: req.user.id } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

module.exports = router;
