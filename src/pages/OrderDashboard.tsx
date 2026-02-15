import { useState, useEffect } from 'react';
import { Package, Clock, ChevronRight, CheckCircle, XCircle, AlertCircle, ShoppingBag, Trash2, Truck, Check } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
    Id: number;
    Product_name: string;
    Quantity: number;
    Price: number;
}

interface Order {
    Id: number;
    User_name: string;
    Status: string;
    Total_price: number;
    Items: OrderItem[];
    Created_at?: string;
}

export default function OrderDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                const allOrders = res.data.orders || [];
                setOrders(allOrders);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleOrderClick = async (order: Order) => {
        setSelectedOrder(order);
        setDetailsLoading(true);
        try {
            const res = await api.get(`/orders/${order.Id}`);
            if (res.data.order) {
                setSelectedOrder(res.data.order);
            }
        } catch (err) {
            console.error('Failed to fetch order details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const updateOrderStatus = async (id: number, newStatus: string) => {
        if (newStatus === 'cancelled') {
            if (!window.confirm('Are you sure you want to cancel this order? Items will be returned to stock.')) return;
        }
        setDetailsLoading(true);
        try {
            await api.put(`/orders/${id}`, { Status: newStatus });
            // Update local state
            setOrders(prev => prev.map(o => o.Id === id ? { ...o, Status: newStatus } : o));
            if (selectedOrder && selectedOrder.Id === id) {
                setSelectedOrder({ ...selectedOrder, Status: newStatus });
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            alert('Failed to update order status');
        } finally {
            setDetailsLoading(false);
        }
    };

    const deleteOrder = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        setDetailsLoading(true);
        try {
            await api.delete(`/orders/${id}`);
            setOrders(prev => prev.filter(o => o.Id !== id));
            setSelectedOrder(null);
        } catch (err) {
            console.error('Failed to delete order:', err);
            alert('Failed to delete order');
        } finally {
            setDetailsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-emerald-500 bg-emerald-500/10';
            case 'pending': return 'text-amber-500 bg-amber-500/10';
            case 'cancelled': return 'text-rose-500 bg-rose-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto p-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[var(--text-primary)]">My Orders</h1>
                    <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">Track and manage your orders</p>
                </div>
                <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-full self-start border border-amber-500/20">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{orders.length} Orders Total</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.length === 0 ? (
                    <div className="lg:col-span-2 py-20 bg-[var(--bg-surface)] rounded-[3rem] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-[var(--bg-base)] rounded-full flex items-center justify-center mb-6">
                            <Package className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic text-[var(--text-primary)]">No Orders Yet</h3>
                        <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-2">Time to grab some tasty buffet snacks!</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div
                            key={order.Id}
                            onClick={() => handleOrderClick(order)}
                            className="bg-[var(--bg-item)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-[var(--shadow-color)]"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[var(--bg-base)] rounded-2xl flex items-center justify-center">
                                        <Package className="w-5 sm:w-6 h-5 sm:h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Order #{order.Id}</h3>
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            <span>{order.User_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest shadow-sm ${getStatusColor(order.Status)}`}>
                                    {order.Status}
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest block mb-1">Total Amount</span>
                                    <span className="text-2xl sm:text-3xl font-black text-amber-500 italic tracking-tighter">${order.Total_price.toFixed(2)}</span>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-black flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:scale-110">
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative w-full sm:max-w-2xl bg-[var(--bg-surface)] rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl h-[100dvh] sm:h-auto overflow-hidden animate-slide-up border border-[var(--border-subtle)]">
                        <div className="p-6 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">Order Details</h2>
                                    <p className="text-[var(--text-secondary)] text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Ref: #{selectedOrder.Id}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--bg-base)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                    <XCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 mb-8">
                                {detailsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-50">
                                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fetching Items...</span>
                                    </div>
                                ) : (
                                    selectedOrder.Items && selectedOrder.Items.length > 0 ? (
                                        selectedOrder.Items.map(item => (
                                            <div key={item.Id} className="flex items-center justify-between p-4 sm:p-6 bg-[var(--bg-item)] rounded-2xl sm:rounded-[2rem] border border-[var(--border-subtle)]">
                                                <div className="flex items-center gap-4 sm:gap-5">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                        <Package className="w-5 sm:w-6 h-5 sm:h-6 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black uppercase italic tracking-tight text-sm sm:text-base">{item.Product_name}</h4>
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{item.Quantity} x ${item.Price.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <span className="text-md sm:text-lg font-black italic tracking-tighter">${(item.Quantity * item.Price).toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 opacity-30">
                                            <span className="text-xs font-bold uppercase tracking-widest">No detailed items found</span>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="pt-8 border-t border-[var(--border-subtle)]">
                                <div className="flex items-end justify-between mb-6 sm:mb-8">
                                    <div>
                                        <span className="text-[var(--text-secondary)] text-[10px] sm:text-xs font-black uppercase tracking-widest block mb-1">Final Total</span>
                                        <span className="text-3xl sm:text-5xl font-black text-amber-500 italic tracking-tighter">${selectedOrder.Total_price.toFixed(2)}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-black uppercase italic tracking-widest text-[10px] sm:text-sm ${getStatusColor(selectedOrder.Status)}`}>
                                        {selectedOrder.Status === 'completed' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        {selectedOrder.Status}
                                    </div>
                                </div>

                                {user?.User_role === 'admin' && (
                                    <div className="bg-[var(--bg-base)] rounded-[2.5rem] p-6 border border-amber-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Admin Controls</h4>
                                            <button
                                                onClick={() => deleteOrder(selectedOrder.Id)}
                                                className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Order</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <button
                                                onClick={() => updateOrderStatus(selectedOrder.Id, 'confirmed')}
                                                disabled={selectedOrder.Status === 'confirmed' || detailsLoading}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-item)] border border-[var(--border-subtle)] hover:border-amber-500/50 transition-all disabled:opacity-30"
                                            >
                                                <Check className="w-5 h-5 text-amber-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Confirm</span>
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(selectedOrder.Id, 'shipping')}
                                                disabled={selectedOrder.Status === 'shipping' || detailsLoading}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-item)] border border-[var(--border-subtle)] hover:border-amber-500/50 transition-all disabled:opacity-30"
                                            >
                                                <Truck className="w-5 h-5 text-blue-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Ship</span>
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(selectedOrder.Id, 'completed')}
                                                disabled={selectedOrder.Status === 'completed' || detailsLoading}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-item)] border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-all disabled:opacity-30"
                                            >
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Complete</span>
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(selectedOrder.Id, 'cancelled')}
                                                disabled={selectedOrder.Status === 'cancelled' || detailsLoading}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-item)] border border-[var(--border-subtle)] hover:border-rose-500/50 transition-all disabled:opacity-30"
                                            >
                                                <XCircle className="w-5 h-5 text-rose-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-amber-500 p-6 text-center">
                            <button onClick={() => setSelectedOrder(null)} className="text-black font-black uppercase italic tracking-widest text-xs">Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
