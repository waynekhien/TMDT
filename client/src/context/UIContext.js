import React, { createContext, useContext, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { ToastContainer, useToast } from '../components/Toast/Toast';

const UIContext = createContext();

export { UIContext };

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmButtonStyle: 'primary',
    onConfirm: () => {},
    onCancel: () => {},
    isLoading: false
  });

  const toastManager = useToast();

  // Confirm Modal Functions
  const showConfirm = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    type = 'confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonStyle = 'primary'
  }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        confirmButtonStyle,
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
        isLoading: false
      });
    });
  };

  const showDeleteConfirm = (itemName = 'this item') => {
    return showConfirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger'
    });
  };

  const showWarning = (title, message) => {
    return showConfirm({
      title,
      message,
      type: 'warning',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      confirmButtonStyle: 'warning'
    });
  };

  const setConfirmLoading = (isLoading) => {
    setConfirmModal(prev => ({ ...prev, isLoading }));
  };

  // Toast Functions (from hook)
  const { 
    toasts, 
    showToast, 
    showSuccess, 
    showError, 
    showWarning: showToastWarning, 
    showInfo, 
    removeToast 
  } = toastManager;

  const value = {
    // Confirm Modal
    showConfirm,
    showDeleteConfirm,
    showWarning,
    setConfirmLoading,
    
    // Toast Notifications
    showToast,
    showSuccess,
    showError,
    showWarning: showToastWarning,
    showInfo,
    
    // Legacy alert replacement
    alert: showError, // For backwards compatibility
    success: showSuccess,
    
    // Convenience methods
    confirmDelete: showDeleteConfirm,
    toast: {
      success: showSuccess,
      error: showError,
      warning: showToastWarning,
      info: showInfo
    }
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        confirmButtonStyle={confirmModal.confirmButtonStyle}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        isLoading={confirmModal.isLoading}
      />
      
      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        position="top-right"
      />
    </UIContext.Provider>
  );
};

export default UIProvider;
