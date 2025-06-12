import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/admin.service';
import { ADMIN_CONSTANTS } from '../../../constants/admin';
import { useUI } from '../../../context/UIContext';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import './ProductManagement.css';

const ProductManagement = () => {
  const { showSuccess, showError, showDeleteConfirm } = useUI();
  const { page } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(page) || ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    discountPercentage: '0',
    rating: '0',
    stock: '',
    brand: '',
    category: '',
    thumbnail: '',
    images: []
  });  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getProducts(currentPage, 10, searchTerm);
      setProducts(response.products || response);
      setTotalPages(response.totalPages || Math.ceil((response.length || 0) / 10));    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error loading product list');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when page changes
  useEffect(() => {
    if (page && parseInt(page) !== currentPage) {
      setCurrentPage(parseInt(page));
    }
  }, [page]);

  // Navigate to new URL when page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    navigate(`/admin/products/page/${newPage}`);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    navigate('/admin/products/page/1');
    fetchProducts();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    navigate('/admin/products/page/1');
    setTimeout(() => fetchProducts(), 100);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        discountPercentage: parseFloat(newProduct.discountPercentage),
        rating: parseFloat(newProduct.rating),
        stock: parseInt(newProduct.stock)
      });
      
      setShowCreateModal(false);
      setNewProduct({
        title: '',
        description: '',
        price: '',
        discountPercentage: '0',
        rating: '0',
        stock: '',
        brand: '',
        category: '',
        thumbnail: '',
        images: []      });
      
      fetchProducts();
      showSuccess('Product created successfully!');
    } catch (err) {
      console.error('Error creating product:', err);
      showError(err.message || 'Error creating product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      price: product.price?.toString() || '',
      discountPercentage: product.discountPercentage?.toString() || '0',
      rating: product.rating?.toString() || '0',
      stock: product.stock?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateProduct(editingProduct.id, {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        discountPercentage: parseFloat(editingProduct.discountPercentage),
        rating: parseFloat(editingProduct.rating),
        stock: parseInt(editingProduct.stock)
      });
        setShowEditModal(false);
      setEditingProduct(null);
      
      fetchProducts();
      showSuccess('Product updated successfully!');
    } catch (err) {
      console.error('Error updating product:', err);
      showError(err.message || 'Error updating product');
    }
  };
    const handleDeleteProduct = async (productId) => {
    const confirmed = await showDeleteConfirm('this product');
    if (confirmed) {
      try {
        await adminService.deleteProduct(productId);
                fetchProducts();
        showSuccess('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        showError(err.message || 'Error deleting product');
      }
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showError('Please select at least one product to delete');
      return;
    }

    const confirmed = await showDeleteConfirm(`${selectedProducts.length} selected products`);
    if (confirmed) {
      try {
        await adminService.bulkDeleteProducts(selectedProducts);
        setSelectedProducts([]);
        fetchProducts();
        showSuccess('Products deleted successfully!');
      } catch (err) {
        console.error('Error bulk deleting products:', err);
        showError(err.message || 'Error deleting products');
      }
    }
  };

  const handleSelectProduct = (productId, isChecked) => {
    if (isChecked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedProducts(products.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };
  if (loading && products.length === 0) {
    return <div className="product-management-loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      {/* Header */}      <div className="product-management-header">
        <h1>Product Management</h1>        <button 
          className="create-product-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Search and Actions */}
      <div className="product-controls">        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">
            <Search size={16} />
            Tìm kiếm
          </button>
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search-btn">
              <RotateCcw size={16} />
              Xóa
            </button>
          )}
        </div>

        <div className="bulk-actions">
          {selectedProducts.length > 0 && (            <button 
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {error && (        <div className="error-message">
          {error}
          <button onClick={fetchProducts} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  />
                </td>
                <td>
                  <img 
                    src={product.thumbnail || '/placeholder-image.png'} 
                    alt={product.title}
                    className="product-thumbnail"
                  />
                </td>
                <td className="product-title">{product.title}</td>
                <td className="product-price">
                  {adminService.formatCurrency(product.price)}
                </td>
                <td className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                  {product.stock}
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td className="product-actions">                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="edit-btn"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>        {products.length === 0 && !loading && (
          <div className="no-products">
            No products found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} / {totalPages}
          </span>
            <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newProduct.discountPercentage}
                    onChange={(e) => setNewProduct({...newProduct, discountPercentage: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newProduct.thumbnail}
                  onChange={(e) => setNewProduct({...newProduct, thumbnail: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editingProduct.discountPercentage}
                    onChange={(e) => setEditingProduct({...editingProduct, discountPercentage: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={editingProduct.thumbnail}
                  onChange={(e) => setEditingProduct({...editingProduct, thumbnail: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
