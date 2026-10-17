"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { fetchClient, getUserNameFromToken } from '@/util/fetchClient';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            const email = getUserNameFromToken();
            if (!email) {
                setError("Vui lòng đăng nhập để xem đơn hàng.");
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetchClient(`/orders/my-order-items?email=${email}`);
                setOrders(Array.isArray(res) ? res : []);
            } catch (err: any) {
                setError(err.message || "Không thể tải đơn hàng.");
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { text: 'Đã Duyệt', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={18} className="text-emerald-600" /> };
            case 'CANCELLED':
                return { text: 'Đã Hủy', color: 'text-red-700 bg-red-50 border-red-200', icon: <XCircle size={18} className="text-red-600" /> };
            default:
                return { text: 'Chờ Duyệt', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <Clock size={18} className="text-amber-600" /> };
        }
    };

    if (isLoading) return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div></div>;
    
    if (error) return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/login" className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-full transition-colors font-medium">Đăng nhập</Link>
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto px-4 py-10 min-h-[calc(100vh-80px)]">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="text-slate-400 hover:text-emerald-700 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan đơn hàng</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Chưa có đơn hàng</h2>
                    <p className="text-slate-500 mb-8">Bạn chưa thực hiện bất kỳ giao dịch nào.</p>
                    <Link href="/" className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((item, idx) => {
                        const statusData = getStatusInfo(item.status || 'PENDING');
                        const product = item.product || {};
                        const order = item.order || {};
                        const itemTotal = (item.price || item.Price || product.price || 0) * (item.quantity || 1);

                        return (
                            <div key={item.id || idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                        {product.imageUrl || product.image_url ? (
                                            <img src={product.imageUrl || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="w-6 h-6 text-emerald-700" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                                            {product.name || `Sản phẩm đơn hàng #${order.id}`}
                                        </h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                                            <span className="font-medium">Số lượng:</span> {item.quantity || 1}
                                        </p>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            <Clock size={14} />
                                            {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                    <p className="text-2xl text-emerald-700 font-extrabold tracking-tight">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal)}
                                    </p>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm border ${statusData.color}`}>
                                        {statusData.icon}
                                        {statusData.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
