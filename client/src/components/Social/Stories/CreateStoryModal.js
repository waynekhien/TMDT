import React, { useState, useRef } from 'react';
import { X, Image, Type, Palette } from 'lucide-react';
import './Stories.css';

const CreateStoryModal = ({ onClose, onSubmit }) => {
  const [storyType, setStoryType] = useState('text'); // 'text', 'image', 'video'
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1877f2');
  const [textColor, setTextColor] = useState('#ffffff');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const backgroundColors = [
    '#1877f2', '#42b883', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedMedia(file);
    setMediaPreview(URL.createObjectURL(file));
    
    if (file.type.startsWith('image/')) {
      setStoryType('image');
    } else if (file.type.startsWith('video/')) {
      setStoryType('video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (storyType === 'text' && !content.trim()) {
      alert('Please add some text content');
      return;
    }
    
    if ((storyType === 'image' || storyType === 'video') && !selectedMedia) {
      alert('Please select a media file');
      return;
    }

    setIsSubmitting(true);

    const storyData = {
      content: content.trim(),
      backgroundColor,
      textColor,
      media: selectedMedia
    };

    try {
      await onSubmit(storyData);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToText = () => {
    setStoryType('text');
    setSelectedMedia(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  };

  return (
    <div className="story-modal" onClick={onClose}>
      <div className="create-story-modal" onClick={e => e.stopPropagation()}>
        <div className="create-story-header">
          <h3>Create Story</h3>
          <button className="story-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="create-story-content">
          {/* Story Type Selector */}
          <div className="story-type-selector">
            <button
              className={`type-btn ${storyType === 'text' ? 'active' : ''}`}
              onClick={resetToText}
            >
              <Type size={20} />
              <span>Text</span>
            </button>
            
            <button
              className={`type-btn ${storyType === 'image' || storyType === 'video' ? 'active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
              <span>Photo/Video</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />

          {/* Story Preview */}
          <div className="story-preview">
            <div 
              className="story-preview-content"
              style={{ 
                backgroundColor: storyType === 'text' ? backgroundColor : '#000',
                color: textColor
              }}
            >
              {storyType === 'text' && (
                <div className="story-text-preview">
                  {content || 'Your text will appear here...'}
                </div>
              )}
              
              {storyType === 'image' && mediaPreview && (
                <img src={mediaPreview} alt="Story preview" />
              )}
              
              {storyType === 'video' && mediaPreview && (
                <video src={mediaPreview} controls muted />
              )}
            </div>
          </div>

          {/* Story Form */}
          <form onSubmit={handleSubmit} className="story-form">
            {/* Text Content */}
            <div className="form-group">
              <textarea
                placeholder="Add text to your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength="500"
                rows="3"
                className="story-text-input"
              />
              <div className="character-count">{content.length}/500</div>
            </div>

            {/* Color Customization for Text Stories */}
            {storyType === 'text' && (
              <>
                <div className="form-group">
                  <label>
                    <Palette size={16} />
                    Background Color
                  </label>
                  <div className="color-picker">
                    {backgroundColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${backgroundColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setBackgroundColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Text Color</label>
                  <div className="color-picker">
                    <button
                      type="button"
                      className={`color-option ${textColor === '#ffffff' ? 'selected' : ''}`}
                      style={{ backgroundColor: '#ffffff', border: '2px solid #ddd' }}
                      onClick={() => setTextColor('#ffffff')}
                    />
                    <button
                      type="button"
                      className={`color-option ${textColor === '#000000' ? 'selected' : ''}`}
                      style={{ backgroundColor: '#000000' }}
                      onClick={() => setTextColor('#000000')}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || (storyType === 'text' && !content.trim())}
              >
                {isSubmitting ? 'Creating...' : 'Share Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
