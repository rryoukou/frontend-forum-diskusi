import React, { useState, useEffect, useRef } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import './DeleteModal.css';

interface DeleteModalProps {
  isOpen: boolean;
  targetType: 'post' | 'comment';
  showReason?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, targetType, showReason, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleConfirm = () => {
    setSubmitting(true);
    onConfirm(showReason ? reason : undefined);
  };

  const targetLabel = targetType === 'post' ? 'Post' : 'Comment';

  return (
    <div className="delete-modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-modal-header-left">
            <div className="delete-modal-icon">
              <Trash2 size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="delete-modal-title" className="delete-modal-title">
                Delete {targetLabel}
              </h2>
              <p className="delete-modal-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="delete-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="delete-modal-body">
          <div className="delete-modal-warning">
            <AlertTriangle size={14} strokeWidth={2.5} />
            <span>Are you sure you want to permanently delete this {targetType}?</span>
          </div>

          {showReason && (
            <div className="delete-modal-reason">
              <label className="delete-modal-reason-label">
                Reason for deletion <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(required)</span>
              </label>
              <textarea
                className="delete-modal-textarea"
                placeholder="Provide a reason for this moderation action..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                maxLength={300}
              />
              <span className="delete-modal-charcount">{reason.length}/300</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="delete-modal-footer">
          <button className="btn btn-outline delete-modal-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn delete-modal-confirm-btn delete-modal-btn"
            onClick={handleConfirm}
            disabled={submitting || (showReason && !reason.trim())}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
