import React, { useState } from 'react';
import './SearchBar.css';
import { SearchIcon, CloseIcon } from '../Icons/Icons';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm sản phẩm..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
          />          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="search-clear-btn"
              aria-label="Xóa tìm kiếm"
            >
              <CloseIcon size={16} />
            </button>
          )}          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Tìm kiếm"
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
