import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic, Filter, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { searchService } from '../../services/search.service';
import './SearchBar.css';

const SearchBar = ({
  onSearch,
  placeholder = "Tìm kiếm sản phẩm, thương hiệu...",
  className = "",
  showFilters = false,
  onFilterClick,
  data = [], // Dữ liệu để tìm kiếm
  showSuggestions = true, // Hiển thị gợi ý
  maxSuggestions = 8 // Số lượng gợi ý tối đa
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Advanced search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim() === '') {
      setFilteredData([]);
      setSearchSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Use advanced search service
        const suggestions = await searchService.getSearchSuggestions(searchTerm, maxSuggestions);
        setFilteredData(suggestions);

        // Generate text suggestions
        const textSuggestions = searchService.generateSuggestions(searchTerm, data);
        setSearchSuggestions(textSuggestions);
      } catch (error) {
        console.error('Search suggestions error:', error);
        // Fallback to simple local search
        const filtered = data.filter((item) => {
          const title = item.title || item.name || '';
          const brand = item.brand || '';
          const category = item.category || '';

          return (
            title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        setFilteredData(filtered.slice(0, maxSuggestions));
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, data, maxSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm.trim());
    }
  };

  const performSearch = (query) => {
    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Perform search
    if (onSearch) {
      onSearch(query);
    }

    // Close suggestions
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredData([]);
    setSearchSuggestions([]);
    setIsLoading(false);
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      setFilteredData([]);
      setSearchSuggestions([]);
      setIsFocused(false);
      setIsLoading(false);
      e.target.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const query = suggestion.title || suggestion.name || suggestion;
    setSearchTerm(query);
    performSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <motion.div
      ref={searchRef}
      className={`modern-search-bar ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="search-form-modern">
        <div className={`search-input-container ${isFocused ? 'focused' : ''}`}>
          <Search className="search-icon" size={20} />

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="search-input-modern"
            autoComplete="off"
          />

          {searchTerm && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="search-clear-btn-modern"
              aria-label="Xóa tìm kiếm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          )}

          <div className="search-actions">
            <motion.button
              type="button"
              className="voice-search-btn"
              aria-label="Tìm kiếm bằng giọng nói"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={18} />
            </motion.button>

            <motion.button
              type="submit"
              className="search-submit-btn-modern"
              aria-label="Tìm kiếm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={18} />
            </motion.button>
          </div>
        </div>

        {showFilters && (
          <motion.button
            type="button"
            onClick={onFilterClick}
            className="filter-btn"
            aria-label="Bộ lọc"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={18} />
            <span>Lọc</span>
          </motion.button>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && showSuggestions && (
          <motion.div
            className="search-suggestions-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="suggestions-section">
                <div className="loading-suggestions">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </div>
              </div>
            )}

            {/* Search Term Suggestion */}
            {searchTerm && !isLoading && (
              <div className="suggestions-section">
                <motion.div
                  className="suggestion-item search-term-suggestion"
                  onClick={() => performSearch(searchTerm)}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                >
                  <Search size={16} className="suggestion-icon" />
                  <span>Tìm kiếm "<strong>{searchTerm}</strong>"</span>
                </motion.div>
              </div>
            )}

            {/* Text Suggestions */}
            {searchSuggestions.length > 0 && !isLoading && (
              <div className="suggestions-section">
                <div className="section-header">
                  <TrendingUp size={14} />
                  <span>Gợi ý tìm kiếm</span>
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item text-suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <Search size={16} className="suggestion-icon" />
                    <span>{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Product Suggestions */}
            {filteredData.length > 0 && !isLoading && (
              <div className="suggestions-section">
                <div className="section-header">
                  <TrendingUp size={14} />
                  <span>Sản phẩm gợi ý</span>
                </div>
                {filteredData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item product-suggestion"
                    onClick={() => handleSuggestionClick(item)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title || item.name}
                        className="suggestion-image"
                      />
                    )}
                    <div className="suggestion-content">
                      <span className="suggestion-title">
                        {item.title || item.name}
                      </span>
                      {item.brand && (
                        <span className="suggestion-brand">{item.brand}</span>
                      )}
                      {item.price && (
                        <span className="suggestion-price">${item.price}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!searchTerm && recentSearches.length > 0 && (
              <div className="suggestions-section">
                <div className="section-header">
                  <Clock size={14} />
                  <span>Tìm kiếm gần đây</span>
                  <button
                    className="clear-recent-btn"
                    onClick={clearRecentSearches}
                  >
                    Xóa tất cả
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item recent-suggestion"
                    onClick={() => handleSuggestionClick(search)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <Clock size={16} className="suggestion-icon" />
                    <span>{search}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchTerm && filteredData.length === 0 && searchSuggestions.length === 0 && !isLoading && (
              <div className="suggestions-section">
                <div className="no-results">
                  <Search size={24} className="no-results-icon" />
                  <span>Không tìm thấy sản phẩm nào</span>
                  <small>Thử tìm kiếm với từ khóa khác</small>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;
