import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Search, X, Save, Layers } from 'lucide-react';
import api from '../api/api';
import type { Product, Category } from '../types';

export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'products' | 'categories'>('products');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState<Partial<Product>>({
        Name: '',
        Description: '',
        Price: 0,
        Stock: 0,
        Category_id: 0
    });
    const [categoryForm, setCategoryForm] = useState({ Name: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
            setProducts(pRes.data.products || []);
            setCategories(cRes.data.categories || []);
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Product) => {
        setEditingId(item.Id);
        setEditForm(item);
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await api.put(`/products/${editingId}`, editForm);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this ${view === 'products' ? 'product' : 'category'}?`)) return;
        try {
            if (view === 'products') {
                await api.delete(`/products/${id}`);
            } else {
                await api.delete(`/categories/${id}`);
            }
            fetchData();
        } catch (err) {
            alert(`Failed to delete ${view === 'products' ? 'product' : 'category'}`);
        }
    };

    const handleAdd = async () => {
        try {
            if (view === 'products') {
                if (!addForm.Name) return alert('Name is required');
                await api.post('/products', addForm);
            } else {
                if (!categoryForm.Name) return alert('Category name is required');
                await api.post('/categories', categoryForm);
            }
            setIsAddModalOpen(false);
            setAddForm({ Name: '', Description: '', Price: 0, Stock: 0, Category_id: categories[0]?.Id || 0 });
            setCategoryForm({ Name: '' });
            fetchData();
        } catch (err) {
            alert(`Failed to add ${view === 'products' ? 'product' : 'category'}`);
        }
    };

    const filteredProducts = products.filter(p =>
        p.Name.toLowerCase().includes(search.toLowerCase()) ||
        p.Description.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex-1 flex items-center justify-center transition-colors duration-300"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[var(--text-primary)]">Stock & Menu</h1>
                    <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">Manage your catalog and inventory</p>
                </div>

                <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
                    <button
                        onClick={() => setView('products')}
                        className={`px-6 py-2.5 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all ${view === 'products' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setView('categories')}
                        className={`px-6 py-2.5 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all ${view === 'categories' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Categories
                    </button>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-[3rem] border border-[var(--border-subtle)] shadow-xl overflow-hidden mb-10">
                <div className="p-4 sm:p-8 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                            type="text"
                            placeholder={`Search ${view}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (view === 'products') {
                                setAddForm(prev => ({ ...prev, Category_id: categories[0]?.Id || 0 }));
                            }
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase italic tracking-tighter shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5 stroke-[3]" />
                        <span>Add New {view === 'products' ? 'Product' : 'Category'}</span>
                    </button>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-base)]/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500">ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500">Name</th>
                                {view === 'products' && (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500 text-right">Price</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500 text-center">Stock</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500 text-center">Category</th>
                                    </>
                                )}
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {view === 'products' ? filteredProducts.map(p => (
                                <tr key={p.Id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-xs opacity-50">#{p.Id}</td>
                                    <td className="px-8 py-5">
                                        {editingId === p.Id ? (
                                            <input
                                                className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-sm w-full text-[var(--text-primary)]"
                                                value={editForm.Name || ''}
                                                onChange={e => setEditForm({ ...editForm, Name: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase italic tracking-tight">{p.Name}</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] truncate max-w-[200px]">{p.Description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right font-black italic text-amber-500">
                                        {editingId === p.Id ? (
                                            <input
                                                type="number"
                                                className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-sm w-20 text-right text-[var(--text-primary)]"
                                                value={editForm.Price || 0}
                                                onChange={e => setEditForm({ ...editForm, Price: parseFloat(e.target.value) })}
                                            />
                                        ) : `$${p.Price.toFixed(2)}`}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {editingId === p.Id ? (
                                            <input
                                                type="number"
                                                className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-sm w-20 text-center text-[var(--text-primary)]"
                                                value={editForm.Stock || 0}
                                                onChange={e => setEditForm({ ...editForm, Stock: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${p.Stock < 5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {p.Stock} In Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {editingId === p.Id ? (
                                            <select
                                                className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-xs text-[var(--text-primary)] focus:outline-none"
                                                value={editForm.Category_id || 0}
                                                onChange={e => setEditForm({ ...editForm, Category_id: parseInt(e.target.value) })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 bg-amber-500/5 px-3 py-1 rounded-lg">
                                                {categories.find(c => c.Id === p.Category_id)?.Name || 'Uncategorized'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingId === p.Id ? (
                                                <>
                                                    <button onClick={handleSave} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"><Save className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(p)} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(p.Id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : categories.map(c => (
                                <tr key={c.Id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-xs opacity-50">#{c.Id}</td>
                                    <td className="px-8 py-5 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                            <Layers className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <span className="font-black uppercase italic tracking-tight">{c.Name}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleDelete(c.Id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {view === 'products' ? filteredProducts.map(p => (
                        <div key={p.Id} className="bg-[var(--bg-base)]/50 rounded-3xl p-5 border border-[var(--border-subtle)] space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase italic tracking-tight text-sm">
                                            {editingId === p.Id ? (
                                                <input
                                                    className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-xs w-full text-[var(--text-primary)]"
                                                    value={editForm.Name || ''}
                                                    onChange={e => setEditForm({ ...editForm, Name: e.target.value })}
                                                />
                                            ) : p.Name}
                                        </p>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">#{p.Id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black italic text-amber-500">
                                        {editingId === p.Id ? (
                                            <input
                                                type="number"
                                                className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-xs w-16 text-right text-[var(--text-primary)]"
                                                value={editForm.Price || 0}
                                                onChange={e => setEditForm({ ...editForm, Price: parseFloat(e.target.value) })}
                                            />
                                        ) : `$${p.Price.toFixed(2)}`}
                                    </p>
                                </div>
                            </div>

                            {editingId === p.Id ? (
                                <textarea
                                    className="w-full bg-[var(--bg-base)] border border-amber-500 rounded-xl px-3 py-2 font-bold text-[10px] text-[var(--text-primary)] min-h-[60px]"
                                    value={editForm.Description || ''}
                                    onChange={e => setEditForm({ ...editForm, Description: e.target.value })}
                                />
                            ) : (
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] line-clamp-2">{p.Description}</p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/50">Category</span>
                                    {editingId === p.Id ? (
                                        <select
                                            className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-[10px] text-[var(--text-primary)] focus:outline-none"
                                            value={editForm.Category_id || 0}
                                            onChange={e => setEditForm({ ...editForm, Category_id: parseInt(e.target.value) })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase">{categories.find(c => c.Id === p.Category_id)?.Name || 'Uncategorized'}</span>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/50">Stock</span>
                                    {editingId === p.Id ? (
                                        <input
                                            type="number"
                                            className="bg-[var(--bg-base)] border border-amber-500 rounded px-2 py-1 font-bold text-[10px] w-14 text-center text-[var(--text-primary)]"
                                            value={editForm.Stock || 0}
                                            onChange={e => setEditForm({ ...editForm, Stock: parseInt(e.target.value) })}
                                        />
                                    ) : (
                                        <span className={`text-[10px] font-black uppercase ${p.Stock < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>{p.Stock} In Stock</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                {editingId === p.Id ? (
                                    <>
                                        <button onClick={handleSave} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] italic shadow-lg shadow-emerald-500/20"><Save className="w-4 h-4" /> Save</button>
                                        <button onClick={() => setEditingId(null)} className="px-4 py-3 bg-white/5 text-[var(--text-secondary)] rounded-xl flex items-center justify-center font-black uppercase text-[10px] italic">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(p)} className="p-3 bg-amber-500/10 text-amber-500 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(p.Id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    )) : categories.map(c => (
                        <div key={c.Id} className="bg-[var(--bg-base)]/50 rounded-3xl p-5 border border-[var(--border-subtle)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-black uppercase italic tracking-tight text-sm">{c.Name}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">#{c.Id}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(c.Id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {((view === 'products' && filteredProducts.length === 0) || (view === 'categories' && categories.length === 0)) && (
                        <div className="py-10 text-center opacity-30">
                            <span className="text-xs font-bold uppercase tracking-widest">No results found</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-[var(--bg-surface)] rounded-[3rem] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Add New {view === 'products' ? 'Product' : 'Category'}</h2>
                                    <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mt-1">Fill in the details below</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-[var(--bg-base)] rounded-2xl transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {view === 'products' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Product Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all"
                                                placeholder="Enter product name..."
                                                value={addForm.Name}
                                                onChange={e => setAddForm({ ...addForm, Name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Description</label>
                                            <textarea
                                                className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all min-h-[100px]"
                                                placeholder="Enter product description..."
                                                value={addForm.Description}
                                                onChange={e => setAddForm({ ...addForm, Description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all"
                                                    value={addForm.Price}
                                                    onChange={e => setAddForm({ ...addForm, Price: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Initial Stock</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all"
                                                    value={addForm.Stock}
                                                    onChange={e => setAddForm({ ...addForm, Stock: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Category</label>
                                            <select
                                                className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all appearance-none cursor-pointer"
                                                value={addForm.Category_id}
                                                onChange={e => setAddForm({ ...addForm, Category_id: parseInt(e.target.value) })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Category Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl focus:border-amber-500 outline-none font-bold transition-all"
                                            placeholder="Enter category name..."
                                            value={categoryForm.Name}
                                            onChange={e => setCategoryForm({ Name: e.target.value })}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleAdd}
                                    className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-amber-500/20 transition-all hover:translate-y-[-2px] active:scale-95 mt-4"
                                >
                                    Create {view === 'products' ? 'Product' : 'Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
