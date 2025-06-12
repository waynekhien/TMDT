const express = require('express');
const router = express.Router();
const { Comment, User, Product } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');

// Get comments for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const comments = await Comment.findAndCountAll({
      where: { productId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'fullName']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comments: comments.rows,
      totalComments: comments.count,
      totalPages: Math.ceil(comments.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new comment (requires authentication)
router.post('/', validateToken, async (req, res) => {
  try {
    const { content, productId, rating } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!content || !productId) {
      return res.status(400).json({ 
        error: 'Content and productId are required' 
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      productId,
      userId,
      rating: rating || null
    });

    // Fetch the created comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a comment (only by the comment author)
router.put('/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ 
        error: 'You can only edit your own comments' 
      });
    }

    // Update comment
    await comment.update({
      content: content || comment.content,
      rating: rating !== undefined ? rating : comment.rating
    });

    // Fetch updated comment with user info
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment (only by the comment author)
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ 
        error: 'You can only delete your own comments' 
      });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
