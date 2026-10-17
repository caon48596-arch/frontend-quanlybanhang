"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Lưu thông tin đăng ký vào session và chuyển hướng tới trang xác nhận OTP
        sessionStorage.setItem('pendingAuthData', JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
        }));
        
        setIsLoading(false);
        router.push('/verify-otp?action=register');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Đăng Ký Tài Khoản</h2>

                {error && (
                    <div className="p-3 rounded-md mb-4 text-sm font-medium bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                            placeholder="Tên của bạn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email hoặc Số điện thoại</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                            placeholder="Nhập email hoặc số điện thoại..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                            placeholder="Nhập lại mật khẩu..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 mt-4 rounded-lg text-white font-bold transition-all ${isLoading ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                            }`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}