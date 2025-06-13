const express = require('express');
const router = express.Router();
const { Like, Follow, User, Post, SocialComment } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');

// Like/Unlike a post or comment
router.post('/like', validateToken, async (req, res) => {
  try {
    const { postId, commentId, type = 'like' } = req.body;
    const userId = req.user.id;

    if (!postId && !commentId) {
      return res.status(400).json({ message: 'Either postId or commentId is required' });
    }

    const whereClause = { userId };
    if (postId) whereClause.postId = postId;
    if (commentId) whereClause.commentId = commentId;

    // Check if already liked
    const existingLike = await Like.findOne({ where: whereClause });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      
      // Update counts
      if (postId) {
        await Post.decrement('likesCount', { where: { id: postId } });
      }
      if (commentId) {
        await SocialComment.decrement('likesCount', { where: { id: commentId } });
      }

      res.json({ message: 'Unliked successfully', liked: false });
    } else {
      // Like
      await Like.create({
        userId,
        postId: postId || null,
        commentId: commentId || null,
        type
      });

      // Update counts
      if (postId) {
        await Post.increment('likesCount', { where: { id: postId } });
      }
      if (commentId) {
        await SocialComment.increment('likesCount', { where: { id: commentId } });
      }

      res.json({ message: 'Liked successfully', liked: true, type });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

// Follow/Unfollow a user
router.post('/follow', validateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const followerId = req.user.id;

    if (followerId === parseInt(userId)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId: userId }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      
      // Update counts
      await User.decrement('followingCount', { where: { id: followerId } });
      await User.decrement('followersCount', { where: { id: userId } });

      res.json({ message: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      await Follow.create({
        followerId,
        followingId: userId,
        status: userToFollow.isPrivate ? 'pending' : 'accepted'
      });

      // Update counts only if accepted
      if (!userToFollow.isPrivate) {
        await User.increment('followingCount', { where: { id: followerId } });
        await User.increment('followersCount', { where: { id: userId } });
      }

      res.json({ 
        message: userToFollow.isPrivate ? 'Follow request sent' : 'Followed successfully',
        following: true,
        status: userToFollow.isPrivate ? 'pending' : 'accepted'
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Error toggling follow', error: error.message });
  }
});

// Accept/Reject follow request
router.post('/follow/respond', validateToken, async (req, res) => {
  try {
    const { followerId, action } = req.body; // action: 'accept' or 'reject'
    const followingId = req.user.id;

    const followRequest = await Follow.findOne({
      where: { followerId, followingId, status: 'pending' }
    });

    if (!followRequest) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    if (action === 'accept') {
      await followRequest.update({ status: 'accepted' });
      
      // Update counts
      await User.increment('followingCount', { where: { id: followerId } });
      await User.increment('followersCount', { where: { id: followingId } });

      res.json({ message: 'Follow request accepted' });
    } else if (action === 'reject') {
      await followRequest.destroy();
      res.json({ message: 'Follow request rejected' });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
    }
  } catch (error) {
    console.error('Error responding to follow request:', error);
    res.status(500).json({ message: 'Error responding to follow request', error: error.message });
  }
});

// Get follow requests
router.get('/follow/requests', validateToken, async (req, res) => {
  try {
    const requests = await Follow.findAll({
      where: { followingId: req.user.id, status: 'pending' },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'fullName', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching follow requests:', error);
    res.status(500).json({ message: 'Error fetching follow requests', error: error.message });
  }
});

// Get followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const followers = await Follow.findAndCountAll({
      where: { followingId: userId, status: 'accepted' },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'fullName', 'profilePicture', 'bio']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      followers: followers.rows,
      totalFollowers: followers.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(followers.count / limit)
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Error fetching followers', error: error.message });
  }
});

// Get following
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const following = await Follow.findAndCountAll({
      where: { followerId: userId, status: 'accepted' },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'fullName', 'profilePicture', 'bio']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      following: following.rows,
      totalFollowing: following.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(following.count / limit)
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Error fetching following', error: error.message });
  }
});

// Get suggested users to follow
router.get('/suggestions', validateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    // Get users that current user is already following
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Exclude self

    // Get suggested users (users not followed by current user)
    const suggestions = await User.findAll({
      where: {
        id: { [require('sequelize').Op.notIn]: followingIds }
      },
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'bio', 'followersCount'],
      order: [['followersCount', 'DESC']], // Order by popularity
      limit: parseInt(limit)
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
});

// Check if user is following another user
router.get('/following/status/:userId', validateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { followerId, followingId: userId }
    });

    res.json({
      isFollowing: !!follow,
      status: follow ? follow.status : null
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Error checking follow status', error: error.message });
  }
});

// Check follow status
router.get('/follow-status/:userId', validateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: {
        followerId: followerId,
        followingId: userId
      }
    });

    res.json({
      isFollowing: !!follow,
      status: follow ? follow.status : null
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Error checking follow status', error: error.message });
  }
});

module.exports = router;
