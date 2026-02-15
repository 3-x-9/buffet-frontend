import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
    Id: number;
    Name: string;
    Email: string;
    User_role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [{ user, token }, setAuthState] = useState<{ user: User | null; token: string | null }>(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser && savedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Basic validation to ensure we have the new PascalCase object
                if (parsedUser && typeof parsedUser.Id === 'number') {
                    return { user: parsedUser, token: savedToken };
                }
            } catch (err) {
                console.error('Error parsing saved user:', err);
            }
        }
        // If anything is missing or invalid, clear everything to be safe
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { user: null, token: null };
    });

    const login = (newToken: string, newUser: User) => {
        setAuthState({ user: newUser, token: newToken });
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setAuthState({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!token;
    const isAdmin = user?.User_role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
