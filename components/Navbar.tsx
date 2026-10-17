"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getUserRoleFromToken, getUserNameFromToken } from '@/util/fetchClient';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ dob: '', phone: '', email: '' });
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        try {
            const token = sessionStorage.getItem('accessToken');
            setIsLoggedIn(!!token);
            if (token) {
                const role = getUserRoleFromToken();
                setUserRole(role);
                const name = getUserNameFromToken();
                setUserName(name);
            } else {
                setUserRole(null);
                setUserName(null);
            }
        } catch (error) {
            console.error("[Navbar] Lỗi đọc token từ sessionStorage:", error);
            setIsLoggedIn(false);
            setUserRole(null);
            setUserName(null);
        }
    }, [pathname]);

    const handleLogout = () => {
        try {
            sessionStorage.removeItem('accessToken');
            setIsLoggedIn(false);
            setUserRole(null);
            setUserName(null);
            router.push('/login');
        } catch (error) {
            console.error("[Navbar] Lỗi khi đăng xuất:", error);
        }
    };

    const handleOpenSettings = async () => {
        setIsSettingsOpen(true);
        if (userName) {
            try {
                const res = await fetch(`https://project1-production-6826.up.railway.app/api/users/profile?email=${userName}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        setSettingsForm({
                            email: data.data.email || '',
                            phone: data.data.phone || '',
                            dob: data.data.dob || ''
                        });
                    }
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin profile:", err);
            }
        }
    };

    const handleSettingsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingSettings(true);
        try {
            const token = sessionStorage.getItem('accessToken');
            const res = await fetch('https://project1-production-6826.up.railway.app/api/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    email: userName, // Email hiện tại lấy từ token
                    dob: settingsForm.dob,
                    phone: settingsForm.phone,
                    ...(settingsForm.email ? { email: settingsForm.email } : {}) // Nếu đổi email
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');
            alert('Cập nhật thành công!');
            setIsSettingsOpen(false);
            if (settingsForm.email && settingsForm.email !== userName) {
                handleLogout(); // Yêu cầu đăng nhập lại nếu đổi email
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm relative">
            <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-20">
                {/* Left side: Logo & Links */}
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link href="/" className="text-3xl font-extrabold text-emerald-900 tracking-tighter">
                        LUXE
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8 font-medium text-slate-700">
                        <Link
                            href="/"
                            className={`transition-colors ${pathname === '/' ? 'text-emerald-800 border-b-2 border-emerald-800 pb-1 font-semibold' : 'hover:text-emerald-800 pb-1 border-b-2 border-transparent'}`}
                        >
                            Trang chủ
                        </Link>
                        {(userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') && (
                            <>
                                <Link
                                    href="/products/create"
                                    className={`transition-colors ${pathname === '/products/create' ? 'text-emerald-800 border-b-2 border-emerald-800 pb-1 font-semibold' : 'hover:text-emerald-800 pb-1 border-b-2 border-transparent'}`}
                                >
                                    Thêm sản phẩm
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`transition-colors ${pathname.startsWith('/admin') ? 'text-emerald-800 border-b-2 border-emerald-800 pb-1 font-semibold' : 'hover:text-emerald-800 pb-1 border-b-2 border-transparent'}`}
                                >
                                    Quản lý & Doanh thu
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <div className="relative hidden sm:block">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm text-slate-700 placeholder-slate-400 transition-all hover:bg-white"
                        />
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Cart Dropdown wrapper */}
                    {userRole !== 'ROLE_ADMIN' && userRole !== 'ADMIN' && (
                        <div className="relative">
                            <button
                                className="text-slate-700 hover:text-emerald-800 relative transition-colors flex items-center justify-center p-2"
                                onClick={() => setIsCartOpen(!isCartOpen)}
                            >
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isCartOpen && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">Order Items</h3>
                                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                            {cartCount} sản phẩm
                                        </span>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {cartItems.length === 0 ? (
                                            <p className="text-center text-slate-500 py-8 text-sm">Giỏ hàng trống.</p>
                                        ) : (
                                            cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group">
                                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-lg overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain mix-blend-multiply"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Lỗi';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Ảnh</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="text-sm font-semibold text-slate-800 truncate" title={item.name}>{item.name}</p>
                                                        <p className="text-xs text-emerald-700 font-bold mb-1">
                                                            {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                                        </p>

                                                        {/* Bộ đếm số lượng */}
                                                        <div className="flex items-center bg-slate-100 rounded border border-slate-200 w-fit">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                                                                disabled={item.quantity <= 1}
                                                                className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="text-xs font-semibold px-2 min-w-[20px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                                                                className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {cartItems.length > 0 && (
                                        <div className="p-4 border-t border-slate-100 bg-white">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-semibold text-slate-600">Tổng tiền:</span>
                                                <span className="text-lg font-bold text-emerald-700">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                                                </span>
                                            </div>
                                            <Link
                                                href="/orders"
                                                onClick={() => setIsCartOpen(false)}
                                                className="block w-full text-center bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                                            >
                                                Xem giỏ hàng
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User */}
                    {isLoggedIn ? (
                        <div className="relative group">
                            <button className="text-emerald-700 bg-emerald-50 p-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center justify-center">
                                <User size={20} />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="px-4 py-2 border-b border-gray-50 text-sm text-gray-500 font-semibold">
                                    {userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'
                                        ? `Xin chào, Admin ${userName || ''}`
                                        : `Xin chào, Client ${userName || ''}`}
                                </div>
                                <Link
                                    href="/my-orders"
                                    className="block w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 font-medium transition-colors"
                                >
                                    Đơn hàng của tôi
                                </Link>
                                <button
                                    onClick={handleOpenSettings}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cài đặt
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                >
                                    Đăng Xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-full transition-colors">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay to close cart when clicking outside */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
                            <h3 className="font-bold text-emerald-900 text-lg">Cài Đặt Tài Khoản</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSettingsUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email mới (nếu muốn đổi)</label>
                                <input
                                    type="email"
                                    value={settingsForm.email}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                                    placeholder={userName || 'Email...'}
                                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    value={settingsForm.dob}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, dob: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={settingsForm.phone}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                                    placeholder="Ví dụ: 0987654321"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingSettings}
                                    className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all shadow-md ${isUpdatingSettings ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                >
                                    {isUpdatingSettings ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}