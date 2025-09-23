import React from 'react';

interface UnpublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  festivalName: string;
  isLoading?: boolean;
}

const UnpublishConfirmModal: React.FC<UnpublishConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  festivalName,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content unpublish-modal">
        <div className="modal-header">
          <h2 className="modal-title">お祭りの非公開設定</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">👁️‍🗨️</div>
          <p className="warning-message">
            <strong>「{festivalName}」</strong>を非公開にしますか？
          </p>
          <p className="warning-detail">
            非公開にすると、一般ユーザーはこのお祭りを見ることができなくなります。
            後から再度公開することも可能です。
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
            className="modal-button unpublish-button" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '設定中...' : '非公開にする'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnpublishConfirmModal;
