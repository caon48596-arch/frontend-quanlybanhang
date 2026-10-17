"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchClient, getUserRoleFromToken } from '@/util/fetchClient';

interface ProductFormData {
    name: string;
    price: number | '';
    description: string;
    imageUrl: string;
    videoUrl: string;
    category: {
        id: number | '';
    }
}

interface Category {
    id: number;
    name: string;
}

export default function CreateProductPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        videoUrl: '',
        category: {
            id: ''
        }
    });

    const [categories, setCategories] = useState<Category[]>([]);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    React.useEffect(() => {
        const role = getUserRoleFromToken();
        setIsAdmin(role === 'ROLE_ADMIN' || role === 'ADMIN');
        setIsCheckingRole(false);

        // Lấy danh sách danh mục
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            setFormData(prev => ({
                ...prev,
                category: {
                    id: value === '' ? '' : Number(value)
                }
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await fetchClient(`/products`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            alert("Thêm sản phẩm thành công!");
            router.push('/products');
        } catch (err: any) {
            console.error("[CreateProduct] Lỗi thêm mới:", err);
            setError(err.message || 'Lỗi khi thêm mới sản phẩm.');
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

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Thêm Mới Sản Phẩm</h1>
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
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Nhập tên sản phẩm..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                        <select
                            name="categoryId"
                            value={formData.category.id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
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
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ví dụ: 1500000"
                        />
                    </div>

                    {/* Ô NHẬP LINK HÌNH ẢNH */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Hình ảnh (Image URL)</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Ô NHẬP LINK VIDEO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Video (Video URL)</label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
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
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Nhập thông tin mô tả chi tiết sản phẩm..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-lg text-white font-bold transition-all ${isSaving ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
                                }`}
                        >
                            {isSaving ? 'Đang lưu...' : 'Thêm Mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}