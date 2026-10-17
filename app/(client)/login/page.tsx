"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     if (!formData.email || !formData.password) {
    //         setError("Vui lòng nhập đầy đủ thông tin");
    //         return;
    //     }

    //     setIsLoading(true);
    //     setError(null);

    //     sessionStorage.setItem('pendingAuthData', JSON.stringify({
    //         email: formData.email,
    //         password: formData.password
    //     }));

    //     setIsLoading(false);
    //     router.push('/verify-otp?action=login');
    // };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                'https://project1-production-6826.up.railway.app/api/users/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password
                    })
                }
            );

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Đăng nhập thất bại"
                );
            }

            // Lấy JWT từ phản hồi Backend
            const token = data?.data?.token ?? data?.token;

            if (!token) {
                throw new Error("Không nhận được token từ máy chủ");
            }

            // Lưu token theo cách ứng dụng hiện đang sử dụng
            sessionStorage.setItem('accessToken', token);
            sessionStorage.removeItem('pendingAuthData');

            // Xác định quyền người dùng từ JWT
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');

                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) =>
                            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                        )
                        .join('')
                );

                const decoded = JSON.parse(jsonPayload);
                const userRole = decoded.role;

                if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } catch {
                // Nếu không đọc được role, chuyển về trang chủ
                router.push('/');
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể kết nối máy chủ"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Đăng Nhập</h2>

                {error && (
                    <div className="p-3 rounded-md mb-4 text-sm font-medium bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email hoặc Số điện thoại</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 mt-4 rounded-lg text-white font-bold transition-all ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                            }`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
                    </button>
                </form>
            </div>
        </div>
    );
}