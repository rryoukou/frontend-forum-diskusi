import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import './ModerationModal.css';

export type ModerationActionType = 'warn' | 'ban' | 'unban';

interface ModerationModalProps {
  isOpen: boolean;
  type: ModerationActionType;
  username: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const PREDEFINED_REASONS = {
  warn: [
    'Minor harassment / unfriendly behavior',
    'Spam / Low quality content',
    'Off-topic content in serious categories',
    'NSFW content where not allowed',
  ],
  ban: [
    'Severe harassment / Hate speech',
    'Repeated spamming after warnings',
    'Compromised account / Bot activity',
    'Explicit NSFW / Illegal content',
    'Circumventing previous moderation',
  ],
  unban: [
    'Appeal accepted',
    'Ban period expired',
    'False positive / Identification error',
  ],
};

const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  type,
  username,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setSelectedPredefined(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleConfirm = () => {
    const finalReason = selectedPredefined 
      ? `${selectedPredefined}${reason ? `: ${reason}` : ''}`
      : reason;
    
    setSubmitting(true);
    onConfirm(finalReason);
  };

  const getThemeData = () => {
    switch (type) {
      case 'warn':
        return {
          title: 'Warn User',
          subtitle: `Send a formal warning to @${username}`,
          icon: <AlertTriangle size={18} />,
          color: 'var(--warning, #f59e0b)',
          btnClass: 'warn-btn',
          actionLabel: 'Send Warning',
        };
      case 'ban':
        return {
          title: 'Ban User',
          subtitle: `Permanently restrict @${username}'s access`,
          icon: <ShieldAlert size={18} />,
          color: 'var(--danger, #ef4444)',
          btnClass: 'ban-btn',
          actionLabel: 'Ban User',
        };
      case 'unban':
        return {
          title: 'Unban User',
          subtitle: `Restore access for @${username}`,
          icon: <ShieldCheck size={18} />,
          color: 'var(--success, #10b981)',
          btnClass: 'unban-btn',
          actionLabel: 'Unban User',
        };
    }
  };

  const theme = getThemeData();
  const reasons = PREDEFINED_REASONS[type];

  return (
    <div className="mod-modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="mod-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="mod-modal-header">
          <div className="mod-modal-header-left">
            <div className="mod-modal-icon" style={{ 
              background: `${theme.color}20`, 
              color: theme.color,
              border: `1px solid ${theme.color}40`
            }}>
              {theme.icon}
            </div>
            <div>
              <h2 className="mod-modal-title">{theme.title}</h2>
              <p className="mod-modal-subtitle">{theme.subtitle}</p>
            </div>
          </div>
          <button className="mod-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="mod-modal-body">
          <div className="mod-section">
            <label className="mod-label">Select a reason</label>
            <div className="mod-reasons-grid">
              {reasons.map((r) => (
                <button
                  key={r}
                  className={`mod-reason-chip ${selectedPredefined === r ? 'active' : ''}`}
                  onClick={() => setSelectedPredefined(r === selectedPredefined ? null : r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mod-section">
            <label className="mod-label">
              {selectedPredefined ? 'Additional details' : 'Reason details'} 
              <span className="mod-optional">(optional)</span>
            </label>
            <textarea
              className="mod-textarea"
              placeholder="Provide more context for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={400}
            />
            <div className="mod-textarea-footer">
              <span className="mod-info">
                <Info size={12} />
                This reason will be visible to the user.
              </span>
              <span className="mod-charcount">{reason.length}/400</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mod-modal-footer">
          <button className="mod-btn-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className={`mod-btn-confirm ${theme.btnClass}`}
            onClick={handleConfirm}
            disabled={submitting || (!selectedPredefined && !reason.trim())}
            style={{ backgroundColor: theme.color }}
          >
            {submitting ? 'Processing...' : theme.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationModal;
