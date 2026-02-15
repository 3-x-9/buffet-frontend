import { useState, useEffect } from 'react'
import { ShoppingCart, Package, ChevronRight, X, Plus, Minus, CheckCircle, Zap, ArrowLeft } from 'lucide-react'
import api from '../api/api'
import type { Product, Category, OrderItemInput } from '../types'
import { useAuth } from '../context/AuthContext'

function Store() {
    const { user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [cart, setCart] = useState<(Product & { quantity: number })[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [cartStep, setCartStep] = useState<'cart' | 'preview'>('cart')

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ])
            const fetchedProducts = prodRes.data.products || []
            const fetchedCategories = catRes.data.categories || []
            setProducts(fetchedProducts)
            setCategories(fetchedCategories)

            if (fetchedCategories.length > 0 && !selectedCategory) {
                setSelectedCategory(fetchedCategories[0].Id)
            }
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const addToCart = (product: Product) => {
        const inCart = cart.find(item => item.Id === product.Id)?.quantity || 0

        if (inCart + 1 > product.Stock) {
            alert(`Sorry, you've reached the limit for ${product.Name}. Only ${product.Stock} available in stock.`)
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.Id === product.Id)
            if (existing) {
                return prev.map(item =>
                    item.Id === product.Id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (id: number, delta: number) => {
        const product = products.find(p => p.Id === id)
        if (!product) return

        const currentItem = cart.find(item => item.Id === id)
        if (!currentItem) return

        if (delta > 0 && currentItem.quantity + delta > product.Stock) {
            alert(`Sorry, you've reached the limit for ${product.Name}. Only ${product.Stock} available in stock.`)
            return
        }

        setCart(prev => prev.map(item => {
            if (item.Id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const subtotal = cart.reduce((sum, item) => sum + item.Price * item.quantity, 0)
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

    const handleCheckout = async () => {
        setOrderStatus('loading')
        try {
            if (!user) {
                setOrderStatus('error')
                alert('Please sign in to place an order.')
                return
            }

            const items: OrderItemInput[] = cart.map(item => ({
                product_id: item.Id,
                quantity: item.quantity
            }))

            await api.post('/orders', {
                user_id: user.Id,
                items
            })

            setOrderStatus('success')
            setTimeout(() => {
                setCart([])
                setCartStep('cart')
                setIsCartOpen(false)
                setOrderStatus('idle')
                fetchData() // Refresh stock data after order
            }, 2000)

        } catch (err) {
            console.error('Order failed:', err)
            setOrderStatus('error')
            setTimeout(() => setOrderStatus('idle'), 3000)
            alert('Order failed. Please check stock availability or your connection.')
        }
    }

    const filteredProducts = selectedCategory
        ? products.filter(p => p.Category_id === selectedCategory)
        : products

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-amber-500 font-bold tracking-widest uppercase text-xs">Loading Menu...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col transition-colors duration-300">
            {/* Horizontal Category Nav */}
            <nav className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-lg overflow-x-auto custom-scrollbar no-scrollbar py-3 px-4 flex items-center gap-3 transition-colors duration-300">
                {categories.map(cat => (
                    <button
                        key={cat.Id}
                        onClick={() => setSelectedCategory(cat.Id)}
                        className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl transition-all flex items-center gap-2 sm:gap-3 active:scale-95 ${selectedCategory === cat.Id
                            ? 'bg-amber-500 text-black font-black shadow-md'
                            : 'bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-amber-500/10 hover:text-amber-500'
                            }`}
                    >
                        <Package className={`w-4 h-4 ${selectedCategory === cat.Id ? 'text-black' : 'text-amber-500'}`} />
                        <span className="text-xs uppercase font-bold tracking-tight">
                            {cat.Name}
                        </span>
                    </button>
                ))}
            </nav>

            <main className="flex-1 w-full max-w-6xl mx-auto p-6 pb-40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                        {categories.find(c => c.Id === selectedCategory)?.Name || "Our Menu"}
                        <span className="text-amber-500 ml-1">.</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-[var(--border-subtle)] px-4 py-2 rounded-full self-start">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">We are open</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProducts.map(product => {
                        const inCart = cart.find(item => item.Id === product.Id)?.quantity || 0
                        const effectiveStock = product.Stock - inCart

                        return (
                            <button
                                key={product.Id}
                                onClick={() => addToCart(product)}
                                disabled={effectiveStock <= 0}
                                className="group relative bg-[var(--bg-item)] rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col text-left transition-all active:scale-[0.98] border border-[var(--border-subtle)] hover:border-amber-500/30 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--shadow-color)]"
                            >
                                <div className="relative aspect-square w-full mb-6 bg-[var(--bg-base)] rounded-[2rem] flex items-center justify-center overflow-hidden">
                                    <Package className="w-12 h-12 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                                    {effectiveStock < 5 && effectiveStock > 0 && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase italic rounded-full shadow-lg">
                                            {effectiveStock} Left
                                        </div>
                                    )}
                                    {effectiveStock === 0 && (
                                        <div className="absolute inset-0 bg-[var(--bg-base)]/60 backdrop-blur-sm flex items-center justify-center">
                                            <span className="text-xs font-black uppercase opacity-60 tracking-widest">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-[var(--text-primary)]">{product.Name}</h3>
                                        <span className="text-xl font-black text-amber-500 italic tracking-tighter">${product.Price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] font-medium mb-8 line-clamp-2">
                                        {product.Description || 'A customer favorite, prepared fresh to order.'}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-subtle)]">
                                            <Plus className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-500/70">
                                            {effectiveStock > 0 ? `${effectiveStock} Available` : 'Sold Out'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </main>

            {/* STICKY BOTTOM ORDER BAR */}
            <footer className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg h-20 bg-amber-500 text-black rounded-full flex items-center px-4 gap-4 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.5)] transform transition-all duration-500 ease-out z-50 ${totalItems > 0 ? 'translate-y-0 scale-100' : 'translate-y-32 scale-90'}`}>
                <div className="bg-black text-amber-500 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black italic tracking-tighter leading-none">${subtotal.toFixed(2)}</span>
                        <span className="text-[10px] font-black uppercase opacity-60">Total</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight opacity-80">{totalItems} items in bag</span>
                </div>

                <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-black text-white h-12 px-6 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform"
                >
                    <span>Order</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
            </footer>

            {/* MOBILE DRAWER: View Order */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>

                    <div className="relative w-full sm:max-w-xl mx-auto bg-[var(--bg-header)] rounded-t-[2rem] sm:rounded-t-[3rem] shadow-2xl flex flex-col h-full sm:h-auto max-h-[100vh] sm:max-h-[85vh] animate-slide-up overflow-hidden border-t border-[var(--border-subtle)]">
                        <div className="h-1.5 w-12 bg-[var(--text-secondary)]/20 rounded-full mx-auto my-3 sm:hidden"></div>

                        <div className="px-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {cartStep === 'preview' && (
                                    <button
                                        onClick={() => setCartStep('cart')}
                                        className="p-2 hover:bg-[var(--bg-base)] rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
                                    {cartStep === 'cart' ? 'My Bag' : 'Preview Order'}
                                </h3>
                            </div>
                            <button onClick={() => { setIsCartOpen(false); setCartStep('cart'); }} className="text-[var(--text-secondary)]"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 no-scrollbar">
                            {cartStep === 'cart' ? (
                                cart.map(item => (
                                    <div key={item.Id} className="flex items-center gap-5 bg-[var(--bg-item)] p-5 rounded-[2rem] border border-[var(--border-subtle)]">
                                        <div className="h-16 w-16 bg-[var(--bg-base)] rounded-2xl flex items-center justify-center">
                                            <Package className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-md font-black uppercase italic leading-tight text-[var(--text-primary)]">{item.Name}</h4>
                                            <span className="text-amber-500 font-bold text-sm">${item.Price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-[var(--bg-base)] rounded-full p-1.5 border border-[var(--border-subtle)]">
                                            <button onClick={() => updateQuantity(item.Id, -1)} className="p-2 text-[var(--text-primary)]"><Minus className="w-4 h-4" /></button>
                                            <span className="w-4 text-center font-black text-[var(--text-primary)]">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.Id, 1)}
                                                disabled={item.quantity >= item.Stock}
                                                className="p-2 text-[var(--text-primary)] disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 px-2">Order Items</h4>
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.Id} className="flex justify-between items-center px-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black uppercase italic text-[var(--text-primary)]">{item.Name}</span>
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">QTY: {item.quantity}</span>
                                                    </div>
                                                    <span className="font-black text-[var(--text-primary)]">${(item.Price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-4 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                            <span>Service Fee</span>
                                            <span>$0.00</span>
                                        </div>
                                        <div className="h-px bg-[var(--border-subtle)] w-full"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-[var(--bg-base)] border-t border-[var(--border-subtle)]">
                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-lg font-black text-[var(--text-secondary)] uppercase italic tracking-widest">Total to Pay</span>
                                <span className="text-4xl font-black italic tracking-tighter text-amber-500">${subtotal.toFixed(2)}</span>
                            </div>

                            {orderStatus === 'success' ? (
                                <div className="py-6 flex flex-col items-center gap-4 text-emerald-500 animate-in bounce-in">
                                    <CheckCircle className="w-16 h-16" />
                                    <h4 className="text-2xl font-black uppercase italic">Order Sent!</h4>
                                </div>
                            ) : (
                                <button
                                    onClick={cartStep === 'cart' ? () => setCartStep('preview') : handleCheckout}
                                    disabled={cart.length === 0 || orderStatus === 'loading'}
                                    className="w-full py-5 rounded-3xl bg-amber-500 text-black font-black text-lg uppercase italic tracking-tighter active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
                                >
                                    {orderStatus === 'loading' ? (
                                        <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>{cartStep === 'cart' ? 'Review Order' : 'Confirm & Place Order'}</span>
                                            <ChevronRight className={`w-6 h-6 stroke-[3] transition-transform ${cartStep === 'preview' ? 'translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    )
}

export default Store
