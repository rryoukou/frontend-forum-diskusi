import React, { useEffect, useRef } from 'react';
import { Clock, X, History } from 'lucide-react';
import './HistoryModal.css';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  title: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, title }) => {
  const backdropRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="history-modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-modal-header-left">
            <div className="history-modal-icon">
              <History size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="history-modal-title" className="history-modal-title">
                {title} History
              </h2>
              <p className="history-modal-subtitle">
                {history.length} revision{history.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button className="history-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="history-modal-body">
          {history.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">
                <Clock size={20} strokeWidth={2} />
              </div>
              No previous versions found.
            </div>
          ) : (
            <div className="history-timeline">
              {history.map((item, index) => (
                <div key={item.id ?? index} className="history-item">
                  <div className="history-item-dot" />
                  <div className="history-item-header">
                    <span className="history-item-version">
                      Version {history.length - index}
                    </span>
                    <span className="history-item-date">
                      <Clock size={11} strokeWidth={2} />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  {item.title && (
                    <h4 className="history-item-title">{item.title}</h4>
                  )}
                  <p className="history-item-body">{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
