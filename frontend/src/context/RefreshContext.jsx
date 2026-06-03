import React, { createContext, useState, useCallback, useContext } from 'react';

const RefreshContext = createContext(null);

export const RefreshProvider = ({ children }) => {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const signalRefresh = useCallback(() => {
    setRefreshSignal(prev => prev + 1);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshSignal, signalRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error('useRefresh must be used within RefreshProvider');
  return ctx;
};
