import React, { useState, useEffect } from 'react';
import { getCommentsByProduct } from '../../services/comment.service';
import Comment from '../Comment/Comment';
import CommentForm from '../CommentForm/CommentForm';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import './CommentSection.css';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const commentsPerPage = 5;

  const fetchComments = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getCommentsByProduct(productId, page, commentsPerPage);
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setTotalComments(data.totalComments);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [productId]);

  const handleCommentAdded = (newComment) => {
    // Add new comment to the beginning of the list
    setComments(prevComments => [newComment, ...prevComments]);
    setTotalComments(prev => prev + 1);
    
    // If we're not on the first page, go to first page to show the new comment
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId)
    );
    setTotalComments(prev => prev - 1);
    
    // If current page becomes empty and it's not the first page, go to previous page
    if (comments.length === 1 && currentPage > 1) {
      fetchComments(currentPage - 1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchComments(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="comment-pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <ChevronLeft size={16} />
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="pagination-btn">
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button onClick={() => handlePageChange(totalPages)} className="pagination-btn">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h2>
          <MessageCircle size={20} />
          Bình luận ({totalComments})
        </h2>
      </div>

      <CommentForm productId={productId} onCommentAdded={handleCommentAdded} />

      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Đang tải bình luận...</div>
        ) : error ? (
          <div className="comments-error">{error}</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} />
            <p>Chưa có bình luận nào</p>
            <p>Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này!</p>
          </div>
        ) : (
          <>
            {comments.map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
              />
            ))}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
