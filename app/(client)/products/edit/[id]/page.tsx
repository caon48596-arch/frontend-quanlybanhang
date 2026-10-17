"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchClient, getUserRoleFromToken } from '@/util/fetchClient';

interface ProductFormData {
    name: string;
    price: number | '';
    description: string;
    stock: number | '';
    imageUrl: string;
    videoUrl: string;
    category: {
        id: number | '';
    };
}

interface Category {
    id: number;
    name: string;
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id; // Lấy ID từ URL

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        price: '',
        description: '',
        stock: '',
        imageUrl: '',
        videoUrl: '',
        category: { id: '' }
    });

    const [categories, setCategories] = useState<Category[]>([]);

    const [isFetching, setIsFetching] = useState<boolean>(true); // Trạng thái đang tải dữ liệu cũ
    const [isSaving, setIsSaving] = useState<boolean>(false);    // Trạng thái đang bấm nút Lưu
    const [error, setError] = useState<string | null>(null);

    const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const role = getUserRoleFromToken();
        setIsAdmin(role === 'ROLE_ADMIN' || role === 'ADMIN');
        setIsCheckingRole(false);
        
        const fetchCategories = async () => {
            try {
                const data = await fetchClient('/categories');
                setCategories(data);
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    // 1. Tự động lấy dữ liệu cũ đổ vào Form khi vừa vào trang
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const data = await fetchClient(`/products/${productId}`);
                setFormData({
                    name: data.name || '',
                    price: data.price !== undefined ? data.price : '',
                    description: data.description || '',
                    stock: data.stock !== undefined ? data.stock : '',
                    imageUrl: data.imageUrl || data.image_url || '',
                    videoUrl: data.videoUrl || data.video_url || '',
                    category: { id: data.category?.id || '' }
                });
            } catch (err: any) {
                console.error("[EditProduct] Lỗi lấy dữ liệu:", err);
                setError('Không thể tải thông tin sản phẩm. Có thể ID không tồn tại.');
            } finally {
                setIsFetching(false);
            }
        };

        if (productId) fetchProductDetail();
    }, [productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            setFormData(prev => ({
                ...prev,
                category: { id: value === '' ? '' : Number(value) }
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stock') ? (value === '' ? '' : Number(value)) : value
        }));
    };

    // 2. Gửi dữ liệu mới lên Server để cập nhật
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await fetchClient(`/products/${productId}`, {
                method: 'PUT', // Dùng PUT để cập nhật
                body: JSON.stringify(formData)
            });

            alert("Cập nhật sản phẩm thành công!");
            router.push('/products'); // Xong việc thì quay lại danh sách
        } catch (err: any) {
            console.error("[EditProduct] Lỗi cập nhật:", err);
            setError(err.message || 'Lỗi khi cập nhật sản phẩm.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isCheckingRole) {
        return <div className="text-center py-20 text-gray-500 font-medium">Đang kiểm tra quyền truy cập...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="text-center py-20 text-red-500 font-bold text-xl">
                Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới được thực hiện chức năng này.
            </div>
        );
    }

    if (isFetching) {
        return (
            <div className="text-center py-20 text-gray-500 font-medium">
                Đang tải thông tin sản phẩm...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cập Nhật Sản Phẩm</h1>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                        <input
                            type="number"
                            name="price"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select
                            name="categoryId"
                            value={formData.category.id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho (Stock)</label>
                        <input
                            type="number"
                            name="stock"
                            min="0"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Hình ảnh (Image URL)</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Video (Video URL)</label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/video.mp4"
                        />
                    </div>

                    {/* KHUNG XEM TRƯỚC (LIVE PREVIEW) MEDIA */}
                    {(formData.imageUrl || formData.videoUrl) && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <span className="block text-xs font-semibold text-gray-500 uppercase mb-2">Xem trước Media:</span>
                            <div className="flex flex-col md:flex-row gap-4">
                                {formData.imageUrl && (
                                    <div className="flex-1 h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                                        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Ảnh đại diện</span>
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview Image"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Link+Ảnh+Không+Hợp+Lệ';
                                            }}
                                        />
                                    </div>
                                )}
                                {formData.videoUrl && (
                                    <div className="flex-1 h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                                        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">Video minh họa</span>
                                        <video
                                            src={formData.videoUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-lg text-white font-bold transition-all ${isSaving ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-md'
                                }`}
                        >
                            {isSaving ? 'Đang lưu...' : 'Cập Nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}