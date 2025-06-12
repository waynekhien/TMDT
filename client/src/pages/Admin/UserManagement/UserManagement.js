import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/admin.service';
import { useUI } from '../../../context/UIContext';
import { 
  ADMIN_CONSTANTS, 
  USER_ROLE_OPTIONS,
  formatDate
} from '../../../constants/admin';
import { 
  Search, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  X, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const { showSuccess, showError, showDeleteConfirm } = useUI();
  const { page } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(page) || ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(currentPage, ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT);
      setUsers(response.users || response);
      setTotalPages(response.totalPages || Math.ceil((response.length || 0) / ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT));
    } catch (err) {
      setError('Unable to load user list');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update URL when page changes
  useEffect(() => {
    if (page && parseInt(page) !== currentPage) {
      setCurrentPage(parseInt(page));
    }
  }, [page]);

  // Navigate to new URL when page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    navigate(`/admin/users/page/${newPage}`);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    navigate('/admin/users/page/1');

    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.searchUsers(searchTerm, roleFilter, 1, ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT);
      setUsers(response.users || response);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError('Unable to search users');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
    setCurrentPage(1);
    navigate('/admin/users/page/1');
    setTimeout(() => fetchUsers(), 100);
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role
      });      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      showSuccess('User updated successfully!');
    } catch (err) {
      showError('Unable to update user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    const confirmed = await showDeleteConfirm(`user "${username}"`);
    if (!confirmed) return;    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      showSuccess('User deleted successfully!');
    } catch (err) {
      showError('Unable to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading user list...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage user accounts and permissions</p>
      </div>

      {/* Search and Filter */}
      <div className="search-section">
        <div className="search-controls">          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            {USER_ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>          <button onClick={handleSearch} className="search-btn">
            <Search size={16} />
            Tìm kiếm
          </button>
          <button onClick={clearSearch} className="reset-btn">
            <RotateCcw size={16} />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="username">{user.username}</td>
                <td>{user.email}</td>                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="actions">                  <button
                    onClick={() => handleEditUser(user)}
                    className="edit-btn"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="delete-btn"
                    title="Delete"
                    disabled={user.role === 'admin'}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>        {users.length === 0 && !loading && (
          <div className="no-data">No users found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (        <div className="pagination">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <ChevronLeft size={16} />
          </button>
            <span className="page-info">
            Page {currentPage} / {totalPages}
          </span>
            <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({
                    ...prev,
                    role: e.target.value
                  }))}
                  required
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
