import React, { createContext, useContext, useState } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, Info, X, Trash2 } from 'lucide-react';

interface ConfirmOptions {
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmConfig {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  alertType?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  resolve: (value: boolean) => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (title: string, message: string, options?: ConfirmOptions) => Promise<boolean>;
  alert: (title: string, message: string, type?: 'success' | 'error' | 'info') => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  const confirm = (title: string, message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        variant: options?.variant,
      });
    });
  };

  const alert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success'): Promise<void> => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        type: 'alert',
        alertType: type,
        title,
        message,
        resolve: () => resolve(),
      });
    });
  };

  const handleClose = (value: boolean) => {
    if (config) {
      config.resolve(value);
      setConfig(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {config && config.isOpen && (
        <div className="custom-dialog-overlay" onClick={() => handleClose(false)}>
          <div className="custom-dialog-box" onClick={(e) => e.stopPropagation()}>
            <button className="custom-dialog-close" onClick={() => handleClose(false)} aria-label="Tutup">
              <X size={16} />
            </button>
            
            <div className="custom-dialog-header">
              <div className={`custom-dialog-icon custom-dialog-icon--${config.type === 'confirm' ? (config.variant === 'danger' ? 'error' : 'confirm') : config.alertType}`}>
                {config.type === 'confirm' && config.variant === 'danger' && <Trash2 size={22} />}
                {config.type === 'confirm' && config.variant !== 'danger' && <HelpCircle size={22} />}
                {config.type === 'alert' && config.alertType === 'success' && <CheckCircle2 size={22} />}
                {config.type === 'alert' && config.alertType === 'error' && <AlertTriangle size={22} />}
                {config.type === 'alert' && config.alertType === 'info' && <Info size={22} />}
              </div>
              <h3 className="custom-dialog-title">{config.title}</h3>
            </div>

            <div className="custom-dialog-body">
              <p>{config.message}</p>
            </div>

            <div className="custom-dialog-footer">
              {config.type === 'confirm' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => handleClose(false)}>
                    {config.cancelText || 'Batal'}
                  </button>
                  <button className={`btn ${config.variant === 'danger' ? 'btn-danger' : 'btn-primary'} btn-logout-action`} onClick={() => handleClose(true)}>
                    {config.confirmText || 'Konfirmasi'}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => handleClose(true)}>
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmProvider');
  return context;
};
