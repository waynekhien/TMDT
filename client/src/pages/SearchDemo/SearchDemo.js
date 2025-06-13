import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../../components/SearchBar/SearchBar';
import { searchService } from '../../services/search.service';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import './SearchDemo.css';

const SearchDemo = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  // Fetch sample products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=100');
        const data = await response.json();
        setAllProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsLoading(true);
    setSearchQuery(query);

    try {
      const result = await searchService.searchProducts(query, {
        limit: 20,
        sortBy: 'relevance'
      });
      
      setSearchResults(result.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-demo-page">
      <div className="demo-container">
        {/* Header */}
        <motion.div 
          className="demo-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Advanced Search Demo</h1>
          <p>Test the new search functionality with real-time suggestions and advanced scoring</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="demo-search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SearchBar
            onSearch={handleSearch}
            placeholder="Tìm kiếm sản phẩm (thử: iPhone, laptop, Nike...)"
            data={allProducts}
            showSuggestions={true}
            maxSuggestions={8}
            className="demo-search"
          />
        </motion.div>

        {/* Search Info */}
        {searchQuery && (
          <motion.div 
            className="search-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Kết quả tìm kiếm cho: "{searchQuery}"</h3>
            <p>{searchResults.length} sản phẩm được tìm thấy</p>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <motion.div 
            className="demo-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner"></div>
            <p>Đang tìm kiếm...</p>
          </motion.div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <motion.div 
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="results-grid">
              {searchResults.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="result-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="card-image">
                    <img src={product.thumbnail} alt={product.title} />
                    <div className="card-overlay">
                      <button className="quick-view-btn">
                        <Eye size={16} />
                        Quick View
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <h4 className="card-title">{product.title}</h4>
                      <p className="card-brand">{product.brand}</p>
                    </div>
                    
                    <div className="card-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={`star ${i < Math.floor(product.rating || 4) ? 'filled' : ''}`}
                          fill={i < Math.floor(product.rating || 4) ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span className="rating-text">({product.rating || 4.0})</span>
                    </div>
                    
                    <div className="card-price">
                      <span className="current-price">${product.price}</span>
                      {product.discountPercentage > 0 && (
                        <span className="discount">-{product.discountPercentage}%</span>
                      )}
                    </div>
                    
                    <div className="card-actions">
                      <button className="add-to-cart-btn">
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                    
                    {/* Search Score (for demo) */}
                    {product._searchScore && (
                      <div className="search-score">
                        Score: {(product._searchScore * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>Không tìm thấy sản phẩm nào</h3>
            <p>Thử tìm kiếm với từ khóa khác</p>
          </motion.div>
        )}

        {/* Search Tips */}
        {!searchQuery && (
          <motion.div 
            className="search-tips"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>Tính năng tìm kiếm nâng cao:</h3>
            <ul>
              <li>🔍 <strong>Real-time suggestions</strong> - Gợi ý sản phẩm khi gõ</li>
              <li>🎯 <strong>Smart scoring</strong> - Kết quả được sắp xếp theo độ liên quan</li>
              <li>📝 <strong>Multi-field search</strong> - Tìm theo tên, thương hiệu, danh mục</li>
              <li>💾 <strong>Recent searches</strong> - Lưu lịch sử tìm kiếm</li>
              <li>⚡ <strong>Fuzzy matching</strong> - Tìm kiếm gần đúng</li>
              <li>🏷️ <strong>Price matching</strong> - Tìm theo giá (thử: 100, 500, 1000)</li>
            </ul>
            
            <div className="demo-examples">
              <h4>Thử tìm kiếm:</h4>
              <div className="example-tags">
                {['iPhone', 'Samsung Galaxy', 'Nike shoes', 'laptop', 'headphones', 'watch'].map(term => (
                  <button 
                    key={term}
                    className="example-tag"
                    onClick={() => handleSearch(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchDemo;
