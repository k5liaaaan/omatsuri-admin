import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  festivalName: string;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  festivalName,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2 className="modal-title">お祭りの削除</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">⚠️</div>
          <p className="warning-message">
            <strong>「{festivalName}」</strong>を削除しますか？
          </p>
          <p className="warning-detail">
            この操作は取り消すことができません。お祭りの情報とスケジュールが完全に削除されます。
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-button cancel-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button 
            className="modal-button delete-button" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
