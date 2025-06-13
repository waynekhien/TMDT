import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';
import { 
  Image, 
  MapPin, 
  Users, 
  X,
  User
} from 'lucide-react';
import './Share.css';

const Share = ({ onPostCreated }) => {
  const { authState } = useContext(AuthContext);
  const { showToast } = useUI();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && selectedImages.length === 0) {
      showToast('Please add some content or images', 'error');
      return;
    }

    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (location.trim()) {
        formData.append('location', location.trim());
      }

      selectedImages.forEach((image) => {
        formData.append('images', image.file);
      });

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        },
        body: formData
      });

      if (response.ok) {
        const newPost = await response.json();
        showToast('Post created successfully!', 'success');
        
        // Reset form
        setContent('');
        setLocation('');
        selectedImages.forEach(image => URL.revokeObjectURL(image.preview));
        setSelectedImages([]);
        
        if (onPostCreated) {
          onPostCreated(newPost);
        }
      } else {
        const error = await response.json();
        showToast(error.message || 'Error creating post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="share-container">
      <form onSubmit={handleSubmit} className="share-form">
        <div className="share-header">
          <div className="user-avatar">
            {authState.profilePicture ? (
              <img src={`http://localhost:5000${authState.profilePicture}`} alt={authState.username} />
            ) : (
              <User size={24} />
            )}
          </div>
          <textarea
            placeholder={`What's on your mind, ${authState.username}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="share-input"
            rows="3"
            maxLength="2000"
          />
        </div>

        {selectedImages.length > 0 && (
          <div className="selected-images">
            {selectedImages.map((image, index) => (
              <div key={index} className="image-preview">
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {location && (
          <div className="location-display">
            <MapPin size={16} />
            <span>{location}</span>
            <button
              type="button"
              className="remove-location"
              onClick={() => setLocation('')}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="share-actions">
          <div className="action-buttons">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            <button
              type="button"
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedImages.length >= 5}
            >
              <Image size={20} />
              <span>Photo</span>
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={() => {
                const newLocation = prompt('Add location:');
                if (newLocation) setLocation(newLocation);
              }}
            >
              <MapPin size={20} />
              <span>Location</span>
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={() => showToast('Tag friends feature coming soon!', 'info')}
            >
              <Users size={20} />
              <span>Tag Friends</span>
            </button>
          </div>

          <button
            type="submit"
            className="share-btn"
            disabled={isPosting || (!content.trim() && selectedImages.length === 0)}
          >
            {isPosting ? 'Posting...' : 'Share'}
          </button>
        </div>

        {content.length > 0 && (
          <div className="character-count">
            {content.length}/2000
          </div>
        )}
      </form>
    </div>
  );
};

export default Share;
