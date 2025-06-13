import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  User
} from 'lucide-react';
import SocialComments from '../SocialComments/SocialComments';
import './Post.css';

const Post = ({ post, onLike, onDelete, onUpdate }) => {
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);

  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showMenu, setShowMenu] = useState(false);

  // Update state when post prop changes (e.g., after refresh)
  useEffect(() => {
    console.log(`Post ${post.id} - isLikedByCurrentUser:`, post.isLikedByCurrentUser, 'likesCount:', post.likesCount);
    setIsLiked(post.isLikedByCurrentUser || false);
    setLikesCount(post.likesCount || 0);
  }, [post.isLikedByCurrentUser, post.likesCount]);

  const handleLike = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ postId: post.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
        if (onLike) onLike(post.id, data.liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Error updating like', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author?.fullName || post.author?.username}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${post.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authState.token}`
          }
        });

        if (response.ok) {
          showToast('Post deleted successfully', 'success');
          if (onDelete) onDelete(post.id);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Error deleting post', 'error');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-avatar">
            {post.author?.profilePicture ? (
              <img
                src={`http://localhost:5000${post.author.profilePicture}`}
                alt={post.author.fullName}
              />
            ) : (
              <User size={24} />
            )}
          </div>
          <div className="post-user-details">
            <h4
              className="user-name-link"
              onClick={() => navigate(`/user/${post.author?.id}`)}
            >
              {post.author?.fullName || post.author?.username}
            </h4>
            <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
            {post.location && <span className="post-location">📍 {post.location}</span>}
          </div>
        </div>
        
        {authState.id === post.userId && (
          <div className="post-menu">
            <button 
              className="menu-trigger"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        {post.content && <p>{post.content}</p>}
        
        {post.images && post.images.length > 0 && (
          <div className={`post-images ${post.images.length > 1 ? 'multiple' : ''}`}>
            {post.images.map((image, index) => (
              <img 
                key={image.id || index}
                src={`http://localhost:5000${image.imageUrl}`}
                alt={image.caption || `Post image ${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}

        {post.imageUrl && (
          <div className="post-images">
            <img 
              src={`http://localhost:5000${post.imageUrl}`}
              alt="Post content"
              className="post-image"
            />
          </div>
        )}
      </div>

      <div className="post-stats">
        {likesCount > 0 && (
          <span className="likes-count">{likesCount} likes</span>
        )}
        {post.commentsCount > 0 && (
          <span className="comments-count">{post.commentsCount} comments</span>
        )}
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <Heart size={20} fill={isLiked ? '#ff3040' : 'none'} />
          <span>Like</span>
        </button>
        
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        
        <button className="action-btn" onClick={handleShare}>
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <SocialComments 
          postId={post.id}
          commentsCount={post.commentsCount}
        />
      )}
    </div>
  );
};

export default Post;
