import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import './Stories.css';

const StoryModal = ({ userStories, initialIndex = 0, onClose, onNext, allStories }) => {
  const { authState } = useContext(AuthContext);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = userStories.stories[currentStoryIndex];
  const totalStories = userStories.stories.length;

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStoryIndex, isPaused, currentStory]);

  useEffect(() => {
    // Mark story as viewed
    if (currentStory && !currentStory.hasViewed) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory]);

  const markStoryAsViewed = async (storyId) => {
    try {
      await fetch(`http://localhost:5000/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Move to next user's stories
      const currentUserIndex = allStories.findIndex(user => user.user.id === userStories.user.id);
      const nextUserStories = allStories[currentUserIndex + 1];
      onNext(nextUserStories);
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Move to previous user's stories
      const currentUserIndex = allStories.findIndex(user => user.user.id === userStories.user.id);
      const prevUserStories = allStories[currentUserIndex - 1];
      if (prevUserStories) {
        onNext(prevUserStories);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now - storyDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!currentStory) return null;

  return (
    <div className="story-modal" onClick={onClose}>
      <div className="story-modal-content" onClick={e => e.stopPropagation()}>
        {/* Story Header */}
        <div className="story-header">
          {/* Progress bars */}
          <div className="story-progress">
            {userStories.stories.map((_, index) => (
              <div key={index} className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: index < currentStoryIndex ? '100%' : 
                           index === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="story-user-info">
            <div className="story-user-avatar">
              {userStories.user.profilePicture ? (
                <img src={userStories.user.profilePicture} alt={userStories.user.fullName} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="story-user-details">
              <h4>{userStories.user.fullName || userStories.user.username}</h4>
              <span className="story-time">{formatTimeAgo(currentStory.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button className="story-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Story content */}
        <div 
          className="story-content"
          style={{ backgroundColor: currentStory.backgroundColor || '#000' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {currentStory.imageUrl && (
            <img 
              src={`http://localhost:5000${currentStory.imageUrl}`}
              alt="Story content"
            />
          )}
          
          {currentStory.videoUrl && (
            <video 
              src={`http://localhost:5000${currentStory.videoUrl}`}
              autoPlay
              muted
              loop
            />
          )}
          
          {currentStory.content && !currentStory.imageUrl && !currentStory.videoUrl && (
            <div 
              className="story-text-content"
              style={{ color: currentStory.textColor || '#fff' }}
            >
              {currentStory.content}
            </div>
          )}

          {/* Navigation areas */}
          <div className="story-navigation story-nav-prev" onClick={handlePrevious} />
          <div className="story-navigation story-nav-next" onClick={handleNext} />
        </div>

        {/* Navigation arrows for desktop */}
        {currentStoryIndex > 0 || allStories.findIndex(user => user.user.id === userStories.user.id) > 0 ? (
          <button className="story-nav-arrow story-nav-arrow-left" onClick={handlePrevious}>
            <ChevronLeft size={24} />
          </button>
        ) : null}
        
        {currentStoryIndex < totalStories - 1 || 
         allStories.findIndex(user => user.user.id === userStories.user.id) < allStories.length - 1 ? (
          <button className="story-nav-arrow story-nav-arrow-right" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default StoryModal;
