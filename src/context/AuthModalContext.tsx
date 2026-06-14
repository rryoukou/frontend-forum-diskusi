import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthModalTab = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  activeTab: AuthModalTab;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  switchTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [activeTab, setActiveTab] = useState<AuthModalTab>('login');

  const openLogin    = useCallback(() => { setActiveTab('login');    setIsOpen(true); }, []);
  const openRegister = useCallback(() => { setActiveTab('register'); setIsOpen(true); }, []);
  const closeModal   = useCallback(() => setIsOpen(false), []);
  const switchTab    = useCallback((tab: AuthModalTab) => setActiveTab(tab), []);

  return (
    <AuthModalContext.Provider value={{ isOpen, activeTab, openLogin, openRegister, closeModal, switchTab }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextValue => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider');
  return ctx;
};
