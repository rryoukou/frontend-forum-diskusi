import React, { useState, useEffect, useRef } from 'react';
import { Flag, X, AlertTriangle, ChevronRight } from 'lucide-react';
import './ReportModal.css';

const REPORT_REASONS = [
  { id: 'spam',         label: 'Spam',                   desc: 'Repetitive, irrelevant, or promotional content' },
  { id: 'harassment',  label: 'Harassment or Hate',      desc: 'Bullying, threats, or discriminatory language' },
  { id: 'misinfor',    label: 'Misinformation',          desc: 'False or misleading information' },
  { id: 'nsfw',        label: 'Inappropriate Content',   desc: 'Sexual, violent, or graphic material' },
  { id: 'off_topic',   label: 'Off-Topic',               desc: 'Unrelated to the discussion category' },
  { id: 'copyright',   label: 'Copyright Violation',     desc: 'Stolen or plagiarised content' },
  { id: 'other',       label: 'Other',                   desc: 'Describe your reason below' },
];

interface ReportModalProps {
  isOpen:     boolean;
  targetType: 'post' | 'comment';
  targetId:   string;
  onClose:    () => void;
  onSubmit:   (reason: string) => Promise<void>;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, targetType, onClose, onSubmit }) => {
  const [selected,    setSelected]    = useState('');
  const [customText,  setCustomText]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelected(''); setCustomText(''); setSubmitting(false);
      setSubmitted(false); setError('');
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSubmit = async () => {
    if (!selected) { setError('Please select a reason.'); return; }
    const finalReason = selected === 'other'
      ? (customText.trim() || 'Other')
      : REPORT_REASONS.find(r => r.id === selected)!.label + (customText.trim() ? `: ${customText.trim()}` : '');

    setSubmitting(true); setError('');
    try {
      await onSubmit(finalReason);
      setSubmitted(true);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">

        {/* ── Header ── */}
        <div className="report-modal-header">
          <div className="report-modal-header-left">
            <div className="report-modal-icon">
              <Flag size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="report-modal-title" className="report-modal-title">
                Report {targetType === 'post' ? 'Post' : 'Comment'}
              </h2>
              <p className="report-modal-subtitle">Help us keep the community safe</p>
            </div>
          </div>
          <button className="report-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="report-modal-success">
            <div className="report-success-icon">✓</div>
            <h3>Report Submitted</h3>
            <p>Thanks for helping keep our community safe. Our moderation team will review your report.</p>
            <button className="btn btn-primary report-modal-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="report-modal-body">
            <p className="report-modal-prompt">What's the issue with this {targetType}?</p>

            <div className="report-reasons-list">
              {REPORT_REASONS.map(reason => (
                <button
                  key={reason.id}
                  className={`report-reason-item${selected === reason.id ? ' selected' : ''}`}
                  onClick={() => { setSelected(reason.id); setError(''); }}
                >
                  <div className="report-reason-text">
                    <span className="report-reason-label">{reason.label}</span>
                    <span className="report-reason-desc">{reason.desc}</span>
                  </div>
                  <div className={`report-reason-radio${selected === reason.id ? ' checked' : ''}`}>
                    {selected === reason.id && <ChevronRight size={12} strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Additional details textarea */}
            <div className="report-modal-extra">
              <label className="report-modal-extra-label">
                Additional details <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                className="report-modal-textarea"
                placeholder="Provide more context to help our team review this report..."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <span className="report-modal-charcount">{customText.length}/500</span>
            </div>

            {error && (
              <div className="report-modal-error">
                <AlertTriangle size={13} strokeWidth={2.5} /> {error}
              </div>
            )}

            <div className="report-modal-footer">
              <button className="btn btn-outline report-modal-btn" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn report-modal-submit-btn report-modal-btn"
                onClick={handleSubmit}
                disabled={!selected || submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
