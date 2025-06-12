import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { updateComment, deleteComment } from '../../services/comment.service';
import { Star, Edit3, Trash2, Save, X } from 'lucide-react';
import './Comment.css';

const Comment = ({ comment, onCommentUpdate, onCommentDelete }) => {
  const { authState } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editRating, setEditRating] = useState(comment.rating || 0);
  const [loading, setLoading] = useState(false);

  const isOwner = authState.status && authState.id === comment.userId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setEditRating(comment.rating || 0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditRating(comment.rating || 0);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('Nội dung bình luận không được để trống');
      return;
    }

    try {
      setLoading(true);
      const updatedComment = await updateComment(comment.id, {
        content: editContent.trim(),
        rating: editRating || null
      });
      
      onCommentUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Không thể cập nhật bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteComment(comment.id);
      onCommentDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Không thể xóa bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="comment-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  const renderEditStars = () => {
    return (
      <div className="edit-rating">
        <span>Đánh giá:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= editRating ? 'star-filled star-clickable' : 'star-empty star-clickable'}
            onClick={() => setEditRating(star)}
          />
        ))}
        <button 
          type="button" 
          onClick={() => setEditRating(0)}
          className="clear-rating"
        >
          Xóa đánh giá
        </button>
      </div>
    );
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <div className="comment-user">
          <span className="username">
            {comment.User?.fullName || comment.User?.username || 'Người dùng ẩn danh'}
          </span>
          {renderStars(comment.rating)}
        </div>
        <div className="comment-meta">
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
          {isOwner && !isEditing && (
            <div className="comment-actions">
              <button onClick={handleEdit} className="edit-btn" disabled={loading}>
                <Edit3 size={14} />
              </button>
              <button onClick={handleDelete} className="delete-btn" disabled={loading}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="comment-content">
        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
              rows="3"
              maxLength="1000"
              disabled={loading}
            />
            {renderEditStars()}
            <div className="edit-actions">
              <button 
                onClick={handleSaveEdit} 
                className="save-btn"
                disabled={loading || !editContent.trim()}
              >
                <Save size={14} />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="cancel-btn"
                disabled={loading}
              >
                <X size={14} />
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p>{comment.content}</p>
        )}
      </div>
    </div>
  );
};

export default Comment;
