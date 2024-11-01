"use client";

import { useState, createContext, useContext, useEffect } from 'react';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);


const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log(children);
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserProvider };