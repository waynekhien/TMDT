import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Stories from '../../components/Social/Stories/Stories';
import Share from '../../components/Social/Share/Share';
import Post from '../../components/Social/Post/Post';
import { RefreshCw } from 'lucide-react';
import './SocialFeed.css';

const SocialFeed = () => {
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedType, setFeedType] = useState('all'); // 'all' or 'following'

  useEffect(() => {
    fetchPosts();
  }, [feedType]);

  const fetchPosts = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      if (pageNum > 1) setLoadingMore(true);

      const endpoint = feedType === 'following'
        ? `http://localhost:5000/api/posts/feed?page=${pageNum}&limit=10`
        : `http://localhost:5000/api/posts?page=${pageNum}&limit=10`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1 || refresh) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        
        setHasMore(data.currentPage < data.totalPages);
        setPage(pageNum);
      } else {
        showToast('Error loading posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Error loading posts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    setPage(1);
    setHasMore(true);
    setPosts([]);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(page + 1);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostLiked = (postId, liked) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLikedByCurrentUser: liked,
          likesCount: liked ? post.likesCount + 1 : post.likesCount - 1
        };
      }
      return post;
    }));
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore]);

  if (loading) {
    return (
      <div className="social-feed">
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="social-feed">
      <div className="feed-header">
        <div className="feed-title-section">
          <h1>{feedType === 'all' ? 'Discover Posts' : 'Following'}</h1>
          <div className="feed-toggle">
            <button
              className={`toggle-btn ${feedType === 'all' ? 'active' : ''}`}
              onClick={() => handleFeedTypeChange('all')}
            >
              All Posts
            </button>
            <button
              className={`toggle-btn ${feedType === 'following' ? 'active' : ''}`}
              onClick={() => handleFeedTypeChange('following')}
            >
              Following
            </button>
          </div>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stories Section */}
      <Stories />

      {/* Share Section */}
      <Share onPostCreated={handlePostCreated} />

      {/* Posts Feed */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <h3>No posts yet!</h3>
            <p>Be the first to share something with the community. Create your first post above!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onLike={handlePostLiked}
                onDelete={handlePostDeleted}
              />
            ))}
            
            {loadingMore && (
              <div className="loading-more">
                <div className="loading-spinner small"></div>
                <p>Loading more posts...</p>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="end-of-feed">
                <p>You've seen all posts!</p>
                <button onClick={handleRefresh} className="refresh-feed-btn">
                  Refresh to see new posts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
