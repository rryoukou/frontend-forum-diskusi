import React from 'react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  title: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, title }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', position: 'sticky', top: 0, backgroundColor: 'white', padding: 'var(--spacing-4) 0', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0 }}>{title} History</h2>
          <button onClick={onClose} className="btn btn-outline" style={{ border: 'none', fontSize: '1.5rem' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No previous versions found.</p>
          ) : (
            history.map((item, index) => (
              <div key={item.id} style={{ paddingBottom: 'var(--spacing-4)', borderBottom: index < history.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Version {history.length - index}</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                {item.title && <h4 style={{ margin: '0 0 var(--spacing-2) 0' }}>{item.title}</h4>}
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{item.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
