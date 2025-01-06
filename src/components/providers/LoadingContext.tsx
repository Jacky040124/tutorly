"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  loadingStates: Record<string, boolean>;
  setIsLoading: (key: string, value: boolean) => void;
  isLoading: (...keys: string[]) => boolean;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    
    const setIsLoading = (key: string, value: boolean) => {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const isLoading = (...keys: string[]) => {
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