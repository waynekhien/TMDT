import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { Plus, User } from 'lucide-react';
import StoryModal from './StoryModal';
import CreateStoryModal from './CreateStoryModal';
import './Stories.css';

const Stories = () => {
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stories/feed', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      showToast('Error loading stories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (userStories, storyIndex = 0) => {
    setSelectedStory({
      userStories,
      currentIndex: storyIndex
    });
  };

  const handleCreateStory = async (storyData) => {
    try {
      const formData = new FormData();
      if (storyData.content) formData.append('content', storyData.content);
      if (storyData.backgroundColor) formData.append('backgroundColor', storyData.backgroundColor);
      if (storyData.textColor) formData.append('textColor', storyData.textColor);
      if (storyData.media) formData.append('media', storyData.media);

      const response = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        },
        body: formData
      });

      if (response.ok) {
        showToast('Story created successfully!', 'success');
        setShowCreateModal(false);
        fetchStories(); // Refresh stories
      } else {
        const error = await response.json();
        showToast(error.message || 'Error creating story', 'error');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      showToast('Error creating story', 'error');
    }
  };

  if (loading) {
    return (
      <div className="stories-container">
        <div className="stories-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="story-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {/* Create Story Button */}
        <div className="story-item create-story" onClick={() => setShowCreateModal(true)}>
          <div className="story-avatar">
            {authState.user?.profilePicture ? (
              <img src={authState.user.profilePicture} alt="Your story" />
            ) : (
              <User size={24} />
            )}
            <div className="create-story-icon">
              <Plus size={16} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* User Stories */}
        {stories.map((userStory) => (
          <div
            key={userStory.user.id}
            className={`story-item ${userStory.hasUnviewedStories ? 'unviewed' : 'viewed'}`}
            onClick={() => handleStoryClick(userStory)}
          >
            <div className="story-avatar">
              {userStory.user.profilePicture ? (
                <img src={userStory.user.profilePicture} alt={userStory.user.fullName} />
              ) : (
                <User size={24} />
              )}
            </div>
            <span className="story-username">
              {userStory.user.fullName || userStory.user.username}
            </span>
          </div>
        ))}
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <StoryModal
          userStories={selectedStory.userStories}
          initialIndex={selectedStory.currentIndex}
          onClose={() => setSelectedStory(null)}
          onNext={(nextUserStories) => {
            if (nextUserStories) {
              setSelectedStory({
                userStories: nextUserStories,
                currentIndex: 0
              });
            } else {
              setSelectedStory(null);
            }
          }}
          allStories={stories}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateStory}
        />
      )}
    </div>
  );
};

export default Stories;
