'use client';

import { createContext, useContext, useState } from 'react';

interface ErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
    const [error, setError] = useState(null);
    
    const showError = (message : any) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const clearError = () => setError(null);

    return (
        <ErrorContext.Provider value={{ error, showError, clearError }}>
            {children}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <span className="block sm:inline">{error}</span>
                    <button 
                        onClick={clearError}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />
                        </svg>
                    </button>
                </div>
            )}
        </ErrorContext.Provider>
    );
}

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}; 