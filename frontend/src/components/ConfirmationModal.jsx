import React from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    message, 
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = "bg-red-600 hover:bg-red-700",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
                <div className="mb-6">
                    <p className="text-gray-800 text-center">
                        {message}
                    </p>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${confirmButtonClass}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
