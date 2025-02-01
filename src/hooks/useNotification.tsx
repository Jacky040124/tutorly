import { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface NotificationContextType {
  notification: Notification | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null);
    
    const showSuccess = (message: string) => {
        setNotification({ type: 'success', message });
        setTimeout(() => setNotification(null), 5000);
    };

    const showError = (message: string) => {
        setNotification({ type: 'error', message });
        setTimeout(() => setNotification(null), 5000);
    };

    const clearNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={{ notification, showSuccess, showError, clearNotification }}>
            {children}
            {notification && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded ${
                    notification.type === 'success' 
                        ? 'bg-green-100 border border-green-400 text-green-700' 
                        : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                    <span className="block sm:inline">{notification.message}</span>
                    <button 
                        onClick={clearNotification}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />
                        </svg>
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 