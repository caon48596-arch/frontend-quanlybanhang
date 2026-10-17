"use client";

import React, { useEffect, useState } from 'react';
import { fetchClient } from '@/util/fetchClient';
import Link from 'next/link';
import { Smartphone, Laptop, Headphones, Watch, Speaker, ChevronRight, ShoppingCart, Trash2, Edit2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getUserRoleFromToken, getValidMediaUrl } from '@/util/fetchClient';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    stock?: number;
    imageUrl?: string;
    image_url?: string;
    videoUrl?: string;
    video_url?: string;
    [key: string]: any;
}

interface Category {
    id: number;
    name: string;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setUserRole(getUserRoleFromToken());
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await fetchClient('/categories');
                setCategories(data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const url = selectedCategoryId === 'all' 
                    ? '/products' 
                    : `/products/category/${selectedCategoryId}`;
                const data = await fetchClient(url);
                setProducts(data);
            } catch (err: any) {
                console.error("[HomePage] Lỗi tải sản phẩm:", err);
                setError(err.message || 'Không thể kết nối đến máy chủ để tải sản phẩm.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategoryId]);

    const handleAddToCart = (product: Product) => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        const fallbackImages = [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
            'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&q=80',
            'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=500&q=80',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
            'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500&q=80'
        ];
        const rawImageUrl = product.imageUrl && product.imageUrl.trim() !== '' 
            ? product.imageUrl 
            : (product.image_url || product.image || product.img || fallbackImages[product.id % fallbackImages.length]);
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: getValidMediaUrl(rawImageUrl)
        });
    };

    const handleDeleteProduct = async (id: number, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
        try {
            await fetchClient(`/products/${id}`, { method: 'DELETE' });
            setProducts(products.filter(p => p.id !== id));
            alert("Xóa sản phẩm thành công!");
        } catch (err: any) {
            console.error("Lỗi xóa sản phẩm:", err);
            alert("Lỗi khi xóa sản phẩm: " + err.message);
        }
    };

    const getCategoryIcon = (name: string, isSelected: boolean) => {
        const lowerName = name.toLowerCase();
        const className = `opacity-50 ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`;
        if (lowerName.includes('điện thoại')) return <Smartphone size={20} className={className} />;
        if (lowerName.includes('laptop') || lowerName.includes('máy tính')) return <Laptop size={20} className={className} />;
        if (lowerName.includes('tai nghe') || lowerName.includes('phụ kiện')) return <Headphones size={20} className={className} />;
        if (lowerName.includes('đồng hồ')) return <Watch size={20} className={className} />;
        if (lowerName.includes('loa')) return <Speaker size={20} className={className} />;
        return <ChevronRight size={20} className={className} />;
    };

    return (
        <div className="flex-1 w-full bg-slate-50 py-10">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-10">
                
                {/* Sidebar (Danh mục) */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-28">
                        <h2 className="text-2xl font-bold text-emerald-950 mb-1">Danh mục</h2>
                        <p className="text-sm text-slate-500 mb-6">Khám phá sản phẩm</p>
                        
                        <ul className="space-y-2">
                            <li>
                                <button 
                                    onClick={() => setSelectedCategoryId('all')}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all ${
                                        selectedCategoryId === 'all' 
                                        ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20' 
                                        : 'text-slate-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm border border-transparent hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone size={20} />
                                        <span>Tất cả</span>
                                    </div>
                                    {selectedCategoryId === 'all' && <ChevronRight size={18} className="text-emerald-200" />}
                                </button>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button 
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all ${
                                            selectedCategoryId === cat.id 
                                            ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20' 
                                            : 'text-slate-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm border border-transparent hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {getCategoryIcon(cat.name, selectedCategoryId === cat.id)}
                                            <span>{cat.name}</span>
                                        </div>
                                        {selectedCategoryId === cat.id && <ChevronRight size={18} className="text-emerald-200" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Content (Sản phẩm mới nhất) */}
                <main className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Sản phẩm mới nhất</h1>
                        <p className="text-lg text-slate-600">Khám phá những công nghệ đột phá vừa ra mắt.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center font-medium shadow-sm">
                            {error}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có sản phẩm</h3>
                            <p className="text-slate-500">Hệ thống chưa có sản phẩm nào. Hãy thêm mới từ trang quản lý!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, index) => {
                                const fallbackImages = [
                                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', // phone
                                    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&q=80', // camera
                                    'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=500&q=80', // phone 2
                                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80', // watch
                                    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500&q=80' // speaker
                                ];
                                const rawImageUrl = product.imageUrl && product.imageUrl.trim() !== '' 
                                    ? product.imageUrl 
                                    : (product.image_url || product.image || product.img || fallbackImages[product.id % fallbackImages.length]);
                                const rawVideoUrl = product.videoUrl || product.video_url || product.video;
                                
                                const mediaUrl = getValidMediaUrl(rawVideoUrl || rawImageUrl);
                                const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i) || !!rawVideoUrl;
                                
                                // Random badge logic for demo visual matching
                                const badges = ['Mới', 'Bán chạy', null, null];
                                const badge = badges[index % badges.length];
                                const badgeColor = badge === 'Mới' ? 'bg-red-600' : 'bg-emerald-700';

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col group cursor-pointer relative"
                                    >
                                        {/* Hình ảnh */}
                                        <div className="relative w-full aspect-square bg-white border-b border-slate-100 overflow-hidden p-4 flex items-center justify-center group-hover:bg-slate-50/50 transition-colors">
                                            {badge && (
                                                <span className={`absolute top-3 left-3 ${badgeColor} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10 shadow-sm`}>
                                                    {badge}
                                                </span>
                                            )}
                                            {isVideo ? (
                                                <video
                                                    src={mediaUrl}
                                                    controls
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    muted
                                                    loop
                                                />
                                            ) : mediaUrl ? (
                                                <img
                                                    src={mediaUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        // Tránh lặp vô hạn nếu ảnh lỗi cũng bị lỗi
                                                        if (!target.src.startsWith('data:image')) {
                                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmMWY1ZjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaMO0bmcgdGjhu4MgdOG6o2kg4bqjbmg8L3RleHQ+PC9zdmc+';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                                                    Không có ảnh hoặc video
                                                </div>
                                            )}
                                        </div>

                                        {/* Thông tin */}
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1 group-hover:text-emerald-800 transition-colors" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] mb-2">
                                                {product.description || 'Chưa có mô tả chi tiết.'}
                                            </p>
                                            
                                            <div className="mb-2">
                                                {product.stock !== undefined ? (
                                                    product.stock > 0 ? (
                                                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                                                            Còn lại: {product.stock}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-md">
                                                            Hết hàng
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-xs font-semibold bg-slate-50 text-slate-500 px-2 py-1 rounded-md">
                                                        Số lượng: N/A
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
                                                <p className="text-emerald-800 font-extrabold text-xl">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                </p>
                                                
                                                {userRole !== 'ROLE_ADMIN' && userRole !== 'ADMIN' ? (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                                        disabled={product.stock !== undefined && product.stock <= 0}
                                                        className={`p-2.5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                                            product.stock !== undefined && product.stock <= 0 
                                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                                                : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600'
                                                        }`}
                                                        title="Thêm vào giỏ hàng"
                                                    >
                                                        <ShoppingCart size={20} />
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Link 
                                                            href={`/products/edit/${product.id}`}
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                            className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-500 p-2.5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                                                            title="Sửa sản phẩm"
                                                        >
                                                            <Edit2 size={20} />
                                                        </Link>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id, product.name); }}
                                                            className="bg-red-50 hover:bg-red-600 hover:text-white text-red-500 p-2.5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}