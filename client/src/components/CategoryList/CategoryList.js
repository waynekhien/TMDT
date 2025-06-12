import React, { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../../services/product.service';
import './CategoryList.css';

const CategoryList = ({ selectedCategory, onCategoryChange, showAllOption = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      setError('Không thể tải danh mục');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryName) => {
    if (onCategoryChange) {
      onCategoryChange(categoryName);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatCategoryName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="category-list-container">
        <div className="category-loading">
          <div className="category-spinner"></div>
          <span>Đang tải danh mục...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-list-container">
        <div className="category-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchCategories} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="category-list-container">
      <div className="category-header">
        <h3 className="category-title">Danh mục sản phẩm</h3>
        <button 
          className="category-toggle-btn"
          onClick={toggleExpanded}
          aria-label={isExpanded ? "Thu gọn danh mục" : "Mở rộng danh mục"}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="category-list">
          {showAllOption && (
            <button
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategoryClick('')}
            >
              <span className="category-name">Tất cả</span>
              <span className="category-count">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            </button>
          )}
          
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <span className="category-name">
                {formatCategoryName(category.name)}
              </span>
              <span className="category-count">{category.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
