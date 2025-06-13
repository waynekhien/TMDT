import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Post from '../../components/Social/Post/Post';
import {
  User,
  MapPin,
  Calendar,
  Globe,
  Users,
  Image,
  UserPlus,
  UserMinus,
  Edit3
} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Check if current user is following this user
        if (authState.id !== parseInt(userId)) {
          checkFollowStatus();
        }
      } else {
        showToast('User not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showToast('Error loading user profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        showToast('Error loading posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      showToast('Error loading posts', 'error');
    } finally {
      setPostsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/social/follow-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      console.log('Follow request - userId:', userId, 'authState.id:', authState.id);

      const requestBody = { userId: parseInt(userId) };
      console.log('Follow request body:', requestBody);

      const response = await fetch('http://localhost:5000/api/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Follow response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Follow response data:', data);

        setIsFollowing(!isFollowing);
        showToast(isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 'success');

        // Update follower count
        setUser(prev => ({
          ...prev,
          followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        }));
      } else {
        const error = await response.json();
        console.log('Follow error response:', error);
        showToast(error.message || 'Error updating follow status', 'error');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      showToast('Error updating follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
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

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="error">
          <h3>User not found</h3>
          <p>The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authState.id === user.id;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="cover-photo">
          {user.coverPhoto ? (
            <img src={`http://localhost:5000${user.coverPhoto}`} alt="Cover" />
          ) : (
            <div className="cover-placeholder"></div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="avatar">
            {user.profilePicture ? (
              <img src={`http://localhost:5000${user.profilePicture}`} alt={user.fullName} />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
          </div>
          
          <div className="user-details">
            <h1>{user.fullName || user.username}</h1>
            <p className="username">@{user.username}</p>
            
            {user.bio && <p className="bio">{user.bio}</p>}
            
            <div className="user-meta">
              {user.website && (
                <div className="meta-item">
                  <Globe size={16} />
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              
              <div className="meta-item">
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat">
                <span className="count">{user.postsCount || 0}</span>
                <span className="label">Posts</span>
              </div>
              <div className="stat">
                <span className="count">{user.followersCount || 0}</span>
                <span className="label">Followers</span>
              </div>
              <div className="stat">
                <span className="count">{user.followingCount || 0}</span>
                <span className="label">Following</span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <button
                className="edit-profile-btn"
                onClick={() => navigate('/profile')}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <div className="spinner small"></div>
                ) : isFollowing ? (
                  <>
                    <UserMinus size={16} />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="posts-section">
          <h3>
            <Image size={20} />
            Posts ({posts.length})
          </h3>
          
          {postsLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-posts">
              <Image size={48} />
              <h4>No posts yet</h4>
              <p>{isOwnProfile ? "You haven't" : `${user.fullName || user.username} hasn't`} posted anything yet.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handlePostLiked}
                  onDelete={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
