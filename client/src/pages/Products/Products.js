import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryList from '../../components/CategoryList/CategoryList';
import SearchBar from '../../components/SearchBar/SearchBar';
import { getProducts, getProductsByCategory, searchProducts } from '../../services/product.service';
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
  const [searchQuery, setSearchQuery] = useState('');  // Get category and search from URL parameters
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
    return <div className="products-loading">Loading...</div>;
  }

  if (error) {
    return <div className="products-error">Error: {error}</div>;
  }  return (    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        {selectedCategory && (
          <p className="category-filter-info">
            Showing products in: <strong>{selectedCategory.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</strong>
          </p>
        )}
        {searchQuery && (
          <p className="category-filter-info">
            Search results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>
      
      {/* Category filter section - horizontal layout */}
      <div className="category-filter-section">
        <CategoryList 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          showAllOption={true}
        />
      </div>
        {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search products by name, description, brand..."
      />
      
      <div className="products-main">
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>        {/* Pagination */}
        {((!selectedCategory && !searchQuery) || totalPages > 1) && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
              <div className="pagination-numbers">
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
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
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
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
          <div className="products-count">
          Showing {products.length} of {totalProducts} products
          {selectedCategory && <span> in "{selectedCategory.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}"</span>}
          {searchQuery && <span> for "{searchQuery}"</span>}
        </div>
      </div>
    </div>
  );
};

export default Products;
