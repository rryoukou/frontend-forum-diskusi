import React, { useEffect, useRef } from 'react';
import { Clock, X, History } from 'lucide-react';
import './HistoryModal.css';

import type { EditHistory } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EditHistory[];
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
                      {new Date(item.edited_at || item.created_at).toLocaleString()}
                    </span>
                  </div>

                  {item.editor && (
                    <div className="history-item-editor">
                      <img 
                        src={item.editor.avatar_url || `https://ui-avatars.com/api/?name=${item.editor.username}&background=random`} 
                        alt={item.editor.username} 
                        className="history-editor-avatar" 
                      />
                      <span className="history-editor-name">Edited by <strong>{item.editor.username}</strong></span>
                    </div>
                  )}

                  {item.reason && (
                    <div className="history-item-reason">
                      <span className="reason-label">Reason:</span> {item.reason}
                    </div>
                  )}

                  <div className="history-diff-container">
                    {/* Title Diff */}
                    {item.title_after && (
                      <div className="history-diff-item">
                        <div className="history-diff-section before">
                          <div className="diff-label">Old Title</div>
                          <div className="diff-content">{item.title_before}</div>
                        </div>
                        <div className="history-diff-section after">
                          <div className="diff-label">New Title</div>
                          <div className="diff-content">{item.title_after}</div>
                        </div>
                      </div>
                    )}

                    {/* Body Diff */}
                    {item.body_after && (
                      <div className="history-diff-item">
                        <div className="history-diff-section before">
                          <div className="diff-label">{item.title_after ? 'Old Content' : 'Before'}</div>
                          <div className="diff-content">{item.body_before || item.body}</div>
                        </div>
                        <div className="history-diff-section after">
                          <div className="diff-label">{item.title_after ? 'New Content' : 'After'}</div>
                          <div className="diff-content">{item.body_after}</div>
                        </div>
                      </div>
                    )}
                  </div>
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
