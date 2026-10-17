"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchClient, getUserRoleFromToken } from '@/util/fetchClient';

function DeleteProductContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [productName, setProductName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        // Kiểm tra quyền Admin
        const role = getUserRoleFromToken();
        if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
            setIsAdmin(false);
        } else {
            setIsAdmin(true);
        }
        setIsCheckingRole(false);

        if (!id) {
            setError("Không tìm thấy ID sản phẩm cần xóa.");
            setIsLoading(false);
            return;
        }

        // Tải thông tin sản phẩm để hiển thị tên xác nhận
        const fetchProductDetail = async () => {
            try {
                const data = await fetchClient(`/products/${id}`);
                setProductName(data.name);
            } catch (err: any) {
                console.error("[DeleteProduct] Lỗi tải thông tin:", err);
                setError(err.message || 'Không thể tải thông tin sản phẩm.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        setError(null);

        try {
            await fetchClient(`/products/${id}`, {
                method: 'DELETE'
            });

            alert("Xóa sản phẩm thành công!");
            router.push('/products');
        } catch (err: any) {
            console.error("[DeleteProduct] Lỗi khi xóa:", err);
            setError(err.message || 'Lỗi khi xóa sản phẩm.');
            setIsDeleting(false);
        }
    };

    if (isCheckingRole || isLoading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="text-center py-20 text-red-500 font-bold text-xl">
                Bạn không có quyền thực hiện chức năng này. Chỉ quản trị viên mới được phép xóa.
            </div>
        );
    }


    return (
        <div className="max-w-xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Xác Nhận Xóa Sản Phẩm</h1>
                <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
                    &larr; Quay lại
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {error && (
                    <div className="p-3 mb-4 rounded-md text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <p className="text-gray-700 mb-6">
                    Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-gray-900">"{productName || `ID: ${id}`}"</span> không? Hành động này không thể hoàn tác.
                </p>

                <div className="flex justify-end space-x-3">
                    <Link
                        href="/products"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Hủy
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`px-5 py-2 rounded-lg text-white font-bold transition-all ${isDeleting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-md'
                            }`}
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DeleteProductPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-gray-500">Đang tải trang...</div>}>
            <DeleteProductContent />
        </Suspense>
    );
}