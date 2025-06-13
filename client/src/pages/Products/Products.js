import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryList from '../../components/CategoryList/CategoryList';
import SearchBar from '../../components/SearchBar/SearchBar';
import { Loading } from '../../components/UI';
import { getProducts, getProductsByCategory, searchProducts } from '../../services/product.service';
import { searchService } from '../../services/search.service';
import './Products.css';

const PRODUCTS_PER_PAGE = 20;

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { page } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(page) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('name'); // name, price, rating
  const [filterOpen, setFilterOpen] = useState(false);  // Get category and search from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [location.search]);const fetchProducts = useCallback(async (page, category = '', search = '') => {
    try {
      setLoading(true);
      setError(null);
        let data;
      if (search) {
        data = await searchProducts(search);
        setTotalPages(1);
      } else if (category) {
        const categoryData = await getProductsByCategory(category);
        data = {
          products: categoryData.products || [],
          total: categoryData.total || 0
        };
        setTotalPages(1);
      } else {
        data = await getProducts({
          page: page,
          limit: PRODUCTS_PER_PAGE
        });
        setTotalPages(Math.ceil((data.total || 0) / PRODUCTS_PER_PAGE));
      }
      
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
    }  }, []);

  useEffect(() => {
    if (location.pathname === '/products') {
      navigate('/products/page/1');
      return;
    }
    
    const pageNumber = parseInt(page) || 1;
    setCurrentPage(pageNumber);
    fetchProducts(pageNumber, selectedCategory, searchQuery);
  }, [page, location.pathname, navigate, fetchProducts, selectedCategory, searchQuery]);  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentPage(1);
    
    const urlParams = new URLSearchParams();
    if (category) urlParams.set('category', category);
    
    const newPath = category 
      ? `/products/page/1?${urlParams.toString()}`
      : '/products/page/1';
    
    navigate(newPath);
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory('');
    setCurrentPage(1);
    
    const urlParams = new URLSearchParams();
    if (query.trim()) urlParams.set('search', query.trim());
    
    const newPath = query.trim() 
      ? `/products/page/1?${urlParams.toString()}`
      : '/products/page/1';
    
    navigate(newPath);
  };
  const handlePageChange = (pageNumber) => {
    const urlParams = new URLSearchParams();
    
    if (selectedCategory) {
      urlParams.set('category', selectedCategory);
    }
    if (searchQuery) {
      urlParams.set('search', searchQuery);
    }
    
    const newPath = (selectedCategory || searchQuery)
      ? `/products/page/${pageNumber}?${urlParams.toString()}`
      : `/products/page/${pageNumber}`;
    
    navigate(newPath);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="modern-products-page">
        <Loading size="lg" text="Đang tải sản phẩm..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-products-page">
        <div className="error-container">
          <AlertCircle className="error-icon" size={48} />
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }  return (
    <div className="modern-products-page">
      {/* Header Section */}
      <motion.div
        className="products-header-modern"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              {selectedCategory ?
                selectedCategory.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                : searchQuery ?
                `Kết quả tìm kiếm: "${searchQuery}"`
                : 'Tất cả sản phẩm'
              }
            </h1>
            <p className="page-subtitle">
              {totalProducts > 0 ? `${totalProducts} sản phẩm` : 'Không có sản phẩm nào'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="header-search">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Tìm kiếm sản phẩm..."
              data={products}
              showSuggestions={true}
              maxSuggestions={8}
              className="modern-search"
            />
          </div>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        className="products-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="controls-left">
          {/* Category Filter */}
          <div className="category-filter-modern">
            <CategoryList
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              showAllOption={true}
              className="modern-categories"
            />
          </div>
        </div>

        <div className="controls-right">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        className="products-main-modern"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchQuery}-${currentPage}`}
            className={`products-grid-modern ${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {products.length > 0 ? (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} viewMode={viewMode} />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="no-products"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="no-products-content">
                  <Search size={64} className="no-products-icon" />
                  <h3>Không tìm thấy sản phẩm</h3>
                  <p>Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
                  <button
                    className="clear-filters-btn"
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchQuery('');
                      navigate('/products/page/1');
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>        {/* Modern Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="pagination-modern"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn prev"
            >
              <ChevronLeft size={20} />
              <span>Trước</span>
            </button>

            <div className="pagination-numbers-modern">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(currentPage - page) <= 2
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      className={`pagination-number-modern ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn next"
            >
              <span>Sau</span>
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Products Count */}
        <motion.div
          className="products-count-modern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Hiển thị {products.length} trong tổng số {totalProducts} sản phẩm
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Products;
