"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { fetchClient } from '@/util/fetchClient';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponMessage({ text: 'Đang kiểm tra...', isError: false });
        try {
            const res = await fetchClient(`/coupons/validate/${couponCode}`);
            if (res && res.id) {
                setAppliedCoupon(res);
                setCouponMessage({ text: 'Áp dụng mã giảm giá thành công!', isError: false });
            } else {
                setAppliedCoupon(null);
                setCouponMessage({ text: 'Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.', isError: true });
            }
        } catch (err) {
            setAppliedCoupon(null);
            setCouponMessage({ text: 'Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.', isError: true });
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setIsProcessing(true);
        try {
            // Build the items array as expected by the Spring Boot backend
            const items = cartItems.map(item => ({
                product: { id: item.id },
                quantity: item.quantity,
                Price: item.price
            }));

            // Generate a random Order ID for demo purposes
            const orderId = Math.floor(Math.random() * 1000000);
            const { getUserNameFromToken } = await import('@/util/fetchClient');
            const email = getUserNameFromToken();

            await fetchClient('/orders/CreateAndSum', {
                method: 'POST',
                body: JSON.stringify({
                    id: orderId,
                    items: items,
                    couponCode: appliedCoupon ? appliedCoupon.code : null,
                    email: email
                })
            });

            alert('Thanh toán thành công!');
            clearCart();
            router.push('/');
        } catch (error: any) {
            console.error('Lỗi thanh toán:', error);
            alert(error.message || 'Thanh toán thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const finalTotal = appliedCoupon ? Math.max(0, cartTotal - appliedCoupon.discountAmount) : cartTotal;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-2xl shadow-sm border text-center max-w-md w-full">
                    <ShoppingBag className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
                    <p className="text-slate-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                    <Link
                        href="/"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-8 rounded-full transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-10 min-h-[calc(100vh-80px)]">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="text-slate-400 hover:text-emerald-700 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900">Giỏ hàng của bạn</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Product List */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-800 mb-1 truncate" title={item.name}>
                                    {item.name}
                                </h3>
                                <p className="text-emerald-700 font-bold">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="w-10 text-center font-semibold text-slate-700 text-sm">
                                        {item.quantity}
                                    </div>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Xóa sản phẩm"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary & Checkout */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Tổng quan đơn hàng</h2>

                        <div className="space-y-4 text-slate-600 mb-6 pb-6 border-b border-dashed border-slate-200">
                            <div className="flex justify-between">
                                <span>Tổng số lượng sản phẩm:</span>
                                <span className="font-semibold text-slate-900">{cartCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tạm tính:</span>
                                <span className="font-semibold text-slate-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span className="font-semibold text-emerald-600">Miễn phí</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-emerald-600 mt-2">
                                    <span>Giảm giá ({appliedCoupon.code}):</span>
                                    <span className="font-semibold">
                                        - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appliedCoupon.discountAmount)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Mã giảm giá */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mã giảm giá</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Nhập mã..."
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={appliedCoupon != null}
                                />
                                {appliedCoupon ? (
                                    <button
                                        onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponCode('');
                                            setCouponMessage({ text: '', isError: false });
                                        }}
                                        className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 bg-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-200 transition-colors"
                                    >
                                        Áp dụng
                                    </button>
                                )}
                            </div>
                            {couponMessage.text && (
                                <p className={`text-sm mt-2 ${couponMessage.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {couponMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
                            <span className="text-3xl font-extrabold text-emerald-700">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg ${
                                isProcessing 
                                ? 'bg-emerald-400 cursor-not-allowed shadow-none' 
                                : 'bg-emerald-700 hover:bg-emerald-800 hover:shadow-emerald-900/20 hover:-translate-y-0.5'
                            }`}
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
