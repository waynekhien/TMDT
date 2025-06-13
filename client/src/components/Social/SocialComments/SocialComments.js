import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { Send, Heart, Reply, User, MoreHorizontal } from 'lucide-react';
import './SocialComments.css';

const SocialComments = ({ postId, commentsCount }) => {
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/social-comments/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('Error loading comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/social-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim()
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        showToast('Comment added!', 'success');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Error adding comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/social-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          postId,
          parentId: replyingTo.id,
          content: replyText.trim()
        })
      });

      if (response.ok) {
        const reply = await response.json();
        
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => {
          if (comment.id === replyingTo.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
              repliesCount: comment.repliesCount + 1
            };
          }
          return comment;
        }));

        setReplyText('');
        setReplyingTo(null);
        showToast('Reply added!', 'success');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast('Error adding reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await fetch('http://localhost:5000/api/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ commentId })
      });

      if (response.ok) {
        const data = await response.json();
        // Update comment likes in state
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likesCount: data.liked ? comment.likesCount + 1 : comment.likesCount - 1,
              isLiked: data.liked
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="social-comments">
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="social-comments">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="add-comment-form">
        <div className="comment-input-container">
          <div className="comment-avatar">
            {authState.profilePicture ? (
              <img src={`http://localhost:5000${authState.profilePicture}`} alt="Your avatar" />
            ) : (
              <User size={20} />
            )}
          </div>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
            disabled={submitting}
          />
          <button
            type="submit"
            className="send-comment-btn"
            disabled={!newComment.trim() || submitting}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-content">
              <div className="comment-avatar">
                {comment.author?.profilePicture ? (
                  <img src={`http://localhost:5000${comment.author.profilePicture}`} alt={comment.author.fullName} />
                ) : (
                  <User size={20} />
                )}
              </div>
              
              <div className="comment-body">
                <div className="comment-bubble">
                  <div className="comment-author">
                    {comment.author?.fullName || comment.author?.username}
                  </div>
                  <div className="comment-text">{comment.content}</div>
                </div>
                
                <div className="comment-actions">
                  <button
                    className={`comment-action-btn ${comment.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <Heart size={12} fill={comment.isLiked ? '#ff3040' : 'none'} />
                    {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                  </button>
                  
                  <button
                    className="comment-action-btn"
                    onClick={() => setReplyingTo(comment)}
                  >
                    <Reply size={12} />
                    <span>Reply</span>
                  </button>
                  
                  <span className="comment-time">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <div className="comment-avatar">
                          {reply.author?.profilePicture ? (
                            <img src={`http://localhost:5000${reply.author.profilePicture}`} alt={reply.author.fullName} />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        
                        <div className="comment-body">
                          <div className="comment-bubble">
                            <div className="comment-author">
                              {reply.author?.fullName || reply.author?.username}
                            </div>
                            <div className="comment-text">{reply.content}</div>
                          </div>
                          
                          <div className="comment-actions">
                            <button
                              className={`comment-action-btn ${reply.isLiked ? 'liked' : ''}`}
                              onClick={() => handleLikeComment(reply.id)}
                            >
                              <Heart size={12} fill={reply.isLiked ? '#ff3040' : 'none'} />
                              {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                            </button>
                            
                            <span className="comment-time">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo && replyingTo.id === comment.id && (
                  <form onSubmit={handleSubmitReply} className="reply-form">
                    <div className="comment-input-container">
                      <div className="comment-avatar">
                        {authState.profilePicture ? (
                          <img src={`http://localhost:5000${authState.profilePicture}`} alt="Your avatar" />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={`Reply to ${comment.author?.fullName || comment.author?.username}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="comment-input"
                        disabled={submitting}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="send-comment-btn"
                        disabled={!replyText.trim() || submitting}
                      >
                        <Send size={14} />
                      </button>
                      <button
                        type="button"
                        className="cancel-reply-btn"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="no-comments">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default SocialComments;
