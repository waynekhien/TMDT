import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../../services/profile.service';
import Notification from '../../components/Notification/Notification';
import { 
  Edit3, 
  Save, 
  X, 
  Lock, 
  User, 
  Shield
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { authState } = useContext(AuthContext);  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      setProfile({
        username: profileData.username || '',
        email: profileData.email || '',
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''
      });
    } catch (error) {
      showNotification('Lỗi khi tải thông tin profile: ' + (error.error || error.message), 'error');    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(profile);
      setIsEditing(false);
      showNotification('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      showNotification('Lỗi khi cập nhật thông tin: ' + (error.error || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
      }

      setSaving(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      showNotification('Đổi mật khẩu thành công!', 'success');
    } catch (error) {
      showNotification('Lỗi khi đổi mật khẩu: ' + (error.error || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(false);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="profile-container">        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              <User size={32} />
            </div>
          </div><div className="profile-title">
            <h1>Thông tin cá nhân</h1>
            <p>Quản lý thông tin profile của bạn</p>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={18} />
                Chỉnh sửa
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={18} />
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Thông tin cơ bản</h3>
            <div className="profile-grid">
              <div className="form-group">
                <label>Tên đăng nhập</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">{profile.username || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">{profile.email || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <div className="form-display">{profile.fullName || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="form-display">{profile.phone || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Nhập địa chỉ"
                    rows="3"
                  />
                ) : (
                  <div className="form-display">{profile.address || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Ngày sinh</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Chưa cập nhật'}
                  </div>
                )}
              </div>
            </div>
          </div>          <div className="profile-section">
            <h3>Thông tin tài khoản</h3>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">ID tài khoản:</span>
                <span className="info-value">#{authState.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loại tài khoản:</span>
                <span className="info-value">Người dùng</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value status-active">Hoạt động</span>
              </div>
            </div>
          </div>          <div className="profile-section">
            <div className="section-header">
              <h3>Bảo mật</h3>
              <button 
                className="change-password-btn"
                onClick={() => setShowChangePassword(true)}
              >
                <Lock size={18} />
                Đổi mật khẩu
              </button>
            </div>
            <p className="section-description">
              Thay đổi mật khẩu để bảo vệ tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="modal-overlay">            <div className="modal-content">
              <div className="modal-header">
                <h3><Shield size={20} /> Đổi mật khẩu</h3>
                <button 
                  className="modal-close"
                  onClick={handleCancelPasswordChange}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={handleCancelPasswordChange}
                  disabled={saving}
                >
                  <X size={18} />
                  Hủy
                </button>
                <button 
                  className="save-btn"
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  <Lock size={18} />
                  {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
