const express = require('express');
const router = express.Router();
const { SocialComment, User, Like, Post } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await SocialComment.findAndCountAll({
      where: { 
        postId: postId,
        parentId: null, // Only top-level comments
        isActive: true 
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: SocialComment,
          as: 'replies',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'profilePicture']
          }],
          where: { isActive: true },
          required: false,
          limit: 3, // Show only first 3 replies
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comments: comments.rows,
      totalComments: comments.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(comments.count / limit)
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Get replies for a comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const replies = await SocialComment.findAndCountAll({
      where: { 
        parentId: commentId,
        isActive: true 
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'profilePicture']
      }],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      replies: replies.rows,
      totalReplies: replies.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(replies.count / limit)
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Error fetching replies', error: error.message });
  }
});

// Create a new comment
router.post('/', validateToken, async (req, res) => {
  try {
    const { postId, parentId, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If it's a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await SocialComment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await SocialComment.create({
      userId: req.user.id,
      postId,
      parentId: parentId || null,
      content: content.trim()
    });

    // Update post comments count
    await Post.increment('commentsCount', { where: { id: postId } });

    // If it's a reply, update parent comment replies count
    if (parentId) {
      await SocialComment.increment('repliesCount', { where: { id: parentId } });
    }

    // Fetch the complete comment with author info
    const completeComment = await SocialComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'profilePicture']
      }]
    });

    res.status(201).json(completeComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Update a comment
router.put('/:id', validateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await SocialComment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    await comment.update({ content: content.trim() });

    const updatedComment = await SocialComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'profilePicture']
      }]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// Delete a comment
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const comment = await SocialComment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.update({ isActive: false });

    // Update post comments count
    await Post.decrement('commentsCount', { where: { id: comment.postId } });

    // If it's a reply, update parent comment replies count
    if (comment.parentId) {
      await SocialComment.decrement('repliesCount', { where: { id: comment.parentId } });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Get single comment
router.get('/:id', async (req, res) => {
  try {
    const comment = await SocialComment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        },
        {
          model: SocialComment,
          as: 'replies',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'profilePicture']
          }],
          where: { isActive: true },
          required: false,
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Error fetching comment', error: error.message });
  }
});

module.exports = router;
