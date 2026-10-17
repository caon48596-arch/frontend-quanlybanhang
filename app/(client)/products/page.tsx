"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchClient } from '@/util/fetchClient';
import { getUserRoleFromToken } from '@/util/fetchClient'; // Nhớ đảm bảo hàm này đã được viết trong fetchClient.ts

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const loadProducts = async () => {
        try {
            const data = await fetchClient('/products');
            setProducts(data);
        } catch (err: any) {
            console.error("[Products] Lỗi tải dữ liệu:", err);
            setError(err.message || 'Không thể tải danh sách sản phẩm.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Lấy role ngay khi trang vừa load
        const role = getUserRoleFromToken();
        setUserRole(role);

        loadProducts();
    }, []);

    const handleEdit = (id: number) => {
        router.push(`/products/edit?id=${id}`);
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) {
            try {
                await fetchClient(`/products/${id}`, {
                    method: 'DELETE',
                });
                alert("Xóa sản phẩm thành công!");
                loadProducts(); // Load lại danh sách sau khi xóa
            } catch (err: any) {
                console.error("[Products] Lỗi khi xóa:", err);
                alert(err.message || 'Lỗi hệ thống khi xóa sản phẩm.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20 text-gray-500 font-medium">
                Đang tải dữ liệu sản phẩm...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4 mt-8 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                <p className="font-bold">Lỗi truy xuất</p>
                <p>{error}</p>
            </div>
        );
    }

    // Spring Boot thường thêm tiền tố ROLE_, nên ta check ROLE_ADMIN. 
    // Nếu BE của em trả về ADMIN thì em sửa lại chuỗi này nhé.
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Danh sách Sản phẩm</h1>

                {/* CHỈ HIỆN NÚT NÀY NẾU ROLE LÀ ADMIN */}
                {isAdmin && (
                    <Link
                        href="/products/create"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        + Thêm Mới
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-white rounded-lg border text-gray-500">
                        Chưa có sản phẩm nào trong hệ thống.
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800 line-clamp-1" title={product.name}>
                                    {product.name}
                                </h3>
                                <p className="text-blue-600 font-bold mt-2 text-xl">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                </p>
                                <p className="text-sm text-gray-500 mt-3 line-clamp-3 min-h-[4rem]">
                                    {product.description}
                                </p>
                            </div>

                            {/* CHỈ HIỆN NHÓM NÚT SỬA/XÓA NẾU ROLE LÀ ADMIN */}
                            {isAdmin && (
                                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product.id)}
                                        className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-1.5 rounded-md font-medium text-sm transition-colors"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-md font-medium text-sm transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}