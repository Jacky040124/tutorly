"use client"

import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
    const [loadingStates, setLoadingStates] = useState({});
    
    const setIsLoading = (key, value) => {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const isLoading = (...keys) => {
        if (keys.length === 0) {
            return Object.values(loadingStates).some(state => state);
        }
        return keys.some(key => loadingStates[key]);
    };

    return (
      <LoadingContext.Provider value={{ loadingStates, setIsLoading, isLoading }}>
        {children}
        {isLoading() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
      </LoadingContext.Provider>
    );
}

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}; 