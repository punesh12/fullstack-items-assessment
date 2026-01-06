import React, { createContext, useContext } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  // Context now mainly provides the API base URL
  // Items are managed locally in components for better control
  // Using relative URL since Vite proxy handles /api -> http://localhost:4001
  const value = {
    apiBaseUrl: '/api'
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);