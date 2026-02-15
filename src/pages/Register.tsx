import { useState } from 'react';
import { UserPlus, Mail, Lock, User, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/register', { name, email, password });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-base)]">
            <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-[3rem] p-10 border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                            <UserPlus className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[var(--text-primary)]">Join the Club</h1>
                        <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">Create your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-4">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm text-[var(--text-primary)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm text-[var(--text-primary)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm text-[var(--text-primary)]"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-xs font-bold leading-tight">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg uppercase italic tracking-tighter rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ChevronRight className="w-5 h-5 stroke-[4]" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-[var(--text-secondary)]">
                        Already have an account? {' '}
                        <Link to="/login" className="text-amber-500 hover:underline">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
