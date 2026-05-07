import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, profileApi, setUser as saveUser, getUser, getAccessToken, clearTokens } from '../services/api';

interface AuthUser {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: 'student' | 'instructor' | 'admin';
    is_earn_eligible?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        if (getAccessToken()) {
            const stored = getUser();
            if (stored) {
                setUser(stored);
            } else {
                profileApi.get().then((profile) => {
                    saveUser(profile);
                    setUser(profile);
                }).catch(() => clearTokens());
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        await authApi.login(username, password);
        const profile = await profileApi.get();
        saveUser(profile);
        setUser(profile);
    };

    const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
        await authApi.register(username, email, password, firstName, lastName);
    };


    const refreshProfile = async () => {
        try {
            const profile = await profileApi.get();
            saveUser(profile);
            setUser(profile);
        } catch {}
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
