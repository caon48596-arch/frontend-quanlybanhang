"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get('action'); // 'login' or 'register'
    
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRequestingOtp, setIsRequestingOtp] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [authData, setAuthData] = useState<any>(null);

    useEffect(() => {
        const storedData = sessionStorage.getItem('pendingAuthData');
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setAuthData(parsed);
            if (parsed.email) {
                setIdentifier(parsed.email);
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleRequestOtp = async () => {
        if (!identifier) {
            setError(`Vui lòng nhập Email`);
            return;
        }
        setIsRequestingOtp(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('http://localhost:8081/api/users/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: identifier, type: action === 'register' ? 'REGISTER' : 'LOGIN' })
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy mã OTP.');
            }
            setSuccessMessage(data.message || 'Mã OTP đã được gửi!');
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối máy chủ.');
        } finally {
            setIsRequestingOtp(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (action === 'register') {
                const payload = {
                    ...authData,
                    email: identifier,
                    otp: otp
                };

                const response = await fetch('http://localhost:8081/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const text = await response.text();
                const data = text ? JSON.parse(text) : {};

                if (!response.ok) {
                    throw new Error(data.message || 'Đăng ký thất bại!');
                }

                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                sessionStorage.removeItem('pendingAuthData');
                router.push('/login');

            } else {
                // Login
                const payload = {
                    email: identifier,
                    password: authData.password,
                    otp: otp
                };

                const response = await fetch('http://localhost:8081/api/users/login-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const text = await response.text();
                const data = text ? JSON.parse(text) : {};

                if (!response.ok) {
                    throw new Error(data.message || 'Xác thực OTP thất bại!');
                }

                if (data.data && data.data.token) {
                    sessionStorage.setItem('accessToken', data.data.token);
                    sessionStorage.removeItem('pendingAuthData');
                    
                    const token = data.data.token;
                    try {
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        const decoded = JSON.parse(jsonPayload);
                        const userRole = decoded.role;

                        if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
                            alert("Đăng nhập Admin thành công!");
                            router.push('/admin');
                        } else {
                            alert("Đăng nhập thành công!");
                            router.push('/');
                        }
                    } catch (e) {
                        alert("Đăng nhập thành công!");
                        router.push('/');
                    }
                } else {
                    throw new Error('Không nhận được Token từ Server');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối máy chủ.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Xác thực OTP</h2>
                
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Mã xác thực đã được gửi, vui lòng kiểm tra hộp thư của bạn.
                </p>

                {error && (
                    <div className="p-3 rounded-md mb-4 text-sm font-medium bg-red-100 text-red-700">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 rounded-md mb-4 text-sm font-medium bg-green-100 text-green-700">
                        {successMessage}
                    </div>
                )}



                <form onSubmit={handleVerify} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ Email
                        </label>
                        <input
                            type="email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Nhập email..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                placeholder="Nhập mã OTP..."
                            />
                            <button
                                type="button"
                                onClick={handleRequestOtp}
                                disabled={isRequestingOtp}
                                className={`px-4 py-2 rounded-lg text-white font-bold transition-all whitespace-nowrap ${isRequestingOtp ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                            >
                                {isRequestingOtp ? 'Đang gửi...' : 'Lấy OTP'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 mt-4 rounded-lg text-white font-bold transition-all ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Xác thực & Hoàn tất'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
