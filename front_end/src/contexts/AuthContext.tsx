import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getUser, getAccessToken, clearTokens } from '../services/api';

interface AuthUser {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    role?: 'student' | 'instructor' | 'admin';
}

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        if (getAccessToken()) {
            const stored = getUser();
            if (stored) setUser(stored);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const data = await authApi.login(username, password);
        if (data.user) setUser(data.user);
    };

    const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
        await authApi.register(username, email, password, firstName, lastName);
    };


    const logout = () => {
        clearTokens();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
