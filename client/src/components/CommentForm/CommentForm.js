import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { createComment } from '../../services/comment.service';
import { Star, Send } from 'lucide-react';
import './CommentForm.css';

const CommentForm = ({ productId, onCommentAdded }) => {
  const { authState } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setLoading(true);
      const newComment = await createComment({
        content: content.trim(),
        productId,
        rating: rating || null
      });
      
      onCommentAdded(newComment);
      setContent('');
      setRating(0);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="rating-input">
        <span>Đánh giá sản phẩm:</span>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              className={star <= rating ? 'star-filled star-clickable' : 'star-empty star-clickable'}
              onClick={() => setRating(star)}
            />
          ))}
          <button 
            type="button" 
            onClick={() => setRating(0)}
            className="clear-rating"
          >
            Xóa đánh giá
          </button>
        </div>
      </div>
    );
  };

  if (!authState.status) {
    return (
      <div className="comment-form-login-prompt">
        <p>Vui lòng <a href="/login">đăng nhập</a> để viết bình luận</p>
      </div>
    );
  }

  return (
    <div className="comment-form">
      <h3>Viết bình luận</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="comment-textarea"
            rows="4"
            maxLength="1000"
            disabled={loading}
            required
          />
          <div className="character-count">
            {content.length}/1000
          </div>
        </div>

        {renderStars()}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !content.trim()}
        >
          <Send size={16} />
          {loading ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
