import { useState, useEffect } from 'react';
import { User, Mail, Clock, ShieldCheck, UserMinus } from 'lucide-react';
import api from '../api/api';

interface UserData {
    Id: number;
    Name: string;
    Email: string;
    User_role: string;
    Created_at?: string;
}

export default function UserAdmin() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 transition-colors duration-300">
            <div className="mb-10">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[var(--text-primary)]">User Management</h1>
                <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">Manage accounts and authorization levels</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                    <div key={u.Id} className="bg-[var(--bg-surface)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest ${u.User_role === 'admin' ? 'bg-amber-500 text-black' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {u.User_role}
                        </div>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-20 h-20 bg-[var(--bg-base)] rounded-3xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                {u.User_role === 'admin' ? <ShieldCheck className="w-10 h-10 text-amber-500" /> : <User className="w-10 h-10 text-emerald-500" />}
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-[var(--text-primary)]">{u.Name}</h3>
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mt-1">
                                <Mail className="w-3 h-3" />
                                <span>{u.Email}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[8px] font-black uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                <span>ID: {u.Id}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(u.Id)}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl font-black uppercase italic tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                                <UserMinus className="w-3 h-3" />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
