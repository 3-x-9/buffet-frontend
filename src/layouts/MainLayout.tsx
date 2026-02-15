import type { ReactNode } from 'react';
import { LogIn, LogOut, User as UserIcon, LayoutDashboard, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function MainLayout({ children }: { children: ReactNode }) {
    const { logout, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans relative transition-colors duration-300">

            {/* App Header */}
            <header className="sticky top-0 z-40 bg-[var(--bg-header)]/95 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-amber-500 shadow-xl transition-colors duration-300">
                <Link to="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
                    <img src="/image.png" alt="Buffet Logo" className="h-8 sm:h-10 w-auto object-contain" />
                    <div className="flex flex-col border-l border-[var(--border-subtle)] pl-2 sm:pl-4">
                        <span className="text-[8px] sm:text-[10px] text-amber-500 font-black uppercase tracking-widest whitespace-nowrap">Piar Point</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <nav className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-4 border-r border-[var(--border-subtle)] pr-2 sm:pr-4">
                                <Link to="/orders" title="My Orders" className={`p-1.5 sm:p-2 rounded-xl transition-all ${location.pathname === '/orders' ? 'bg-amber-500 text-black' : 'hover:bg-amber-500/10 text-amber-500'}`}>
                                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link to="/inventory" title="Inventory" className={`p-1.5 sm:p-2 rounded-xl transition-all ${location.pathname === '/inventory' ? 'bg-amber-500 text-black' : 'hover:bg-amber-500/10 text-amber-500'}`}>
                                            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </Link>
                                        <Link to="/admin" title="User Management" className={`p-1.5 sm:p-2 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-amber-500 text-black' : 'hover:bg-amber-500/10 text-amber-500'}`}>
                                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </Link>
                                    </>
                                )}
                            </nav>

                            <button
                                onClick={logout}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-full font-black text-[10px] sm:text-xs uppercase transition-all hover:bg-rose-500 hover:text-white"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link
                                to="/register"
                                className="px-3 sm:px-5 py-2 text-[var(--text-secondary)] font-black text-[10px] sm:text-xs uppercase hover:text-[var(--text-primary)] whitespace-nowrap"
                            >
                                Register
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-amber-500 text-black rounded-full font-black text-[10px] sm:text-xs uppercase transition-transform active:scale-95 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                            >
                                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Sign In</span>
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {children}
            </div>

        </div>
    );
}
