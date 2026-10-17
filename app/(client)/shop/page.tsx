"use client";

import React from 'react';

// 1. MOCK DATA: Dữ liệu giả lập thay thế cho API Backend
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Laptop Dell XPS 15 2026",
        price: 35990000,
        description: "Màn hình OLED 4K, RAM 32GB, SSD 1TB. Tuyệt tác công nghệ dành cho dân lập trình và đồ họa.",
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80"
    },
    {
        id: 2,
        name: "Bàn phím cơ Keychron Q1 Pro",
        price: 4500000,
        description: "Bàn phím cơ custom vỏ nhôm nguyên khối, kết nối không dây, switch Banana siêu êm.",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"
    },
    {
        id: 3,
        name: "Chuột Logitech MX Master 3S",
        price: 2450000,
        description: "Chuột công thái học cao cấp, cảm biến 8000 DPI, cuộn siêu tốc MagSpeed.",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80"
    },
    {
        id: 4,
        name: "Màn hình LG UltraFine 27 inch",
        price: 11200000,
        description: "Độ phân giải 4K sắc nét, độ phủ màu 99% sRGB, kết nối Type-C tiện lợi.",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"
    }
];

export default function ShopPage() {
    // Hàm xử lý giả lập khi bấm "Thêm vào giỏ hàng"
    const handleAddToCart = (productName: string) => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }
        alert(`Đã thêm "${productName}" vào giỏ hàng!`);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Phần Header của trang mua sắm */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Cửa Hàng Công Nghệ
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Khám phá những thiết bị công nghệ đỉnh cao giúp tăng 200% năng suất viết code của bạn.
                    </p>
                </div>

                {/* Lưới sản phẩm (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MOCK_PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100"
                        >
                            {/* Ảnh sản phẩm */}
                            <div className="h-48 overflow-hidden relative bg-gray-200">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Thông tin sản phẩm */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1" title={product.name}>
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                    {product.description}
                                </p>

                                <div className="mt-auto">
                                    <p className="text-xl font-black text-blue-600 mb-4">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </p>
                                    <button
                                        onClick={() => handleAddToCart(product.name)}
                                        className="w-full bg-gray-900 hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-colors"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}