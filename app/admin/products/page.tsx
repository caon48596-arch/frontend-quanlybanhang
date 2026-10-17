"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { fetchClient, getUserRoleFromToken, getValidMediaUrl } from "../../../util/fetchClient";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Kiem tra quyen admin
    const role = getUserRoleFromToken();
    if (role === "ADMIN" || role === "ROLE_ADMIN") {
      setIsAdmin(true);
    }

    const fetchProducts = async () => {
      try {
        const res = await fetchClient("/products");
        if (res && Array.isArray(res)) {
          setProducts(res);
        } else if (res && typeof res === 'object' && res.data) {
          // just in case backend wraps in ResponseDTO
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetchClient("/categories");
        if (res && Array.isArray(res)) {
          setCategories(res);
        }
      } catch (error) {
        console.error("Lỗi khi fetch danh mục:", error);
      }
    };

    Promise.all([fetchProducts(), fetchCategories()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await fetchClient(`/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
      alert("Đã xóa sản phẩm thành công");
    } catch (error: any) {
      alert("Lỗi khi xóa sản phẩm: " + error.message);
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category?.id?.toString() === selectedCategory);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
        {isAdmin && (
          <Link href="/admin/products/create" className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} />
            <span>Thêm Sản Phẩm</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <select 
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id?.toString()}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-sm">
                <th className="pb-3 font-semibold">Tên sản phẩm</th>
                <th className="pb-3 font-semibold">Danh mục</th>
                <th className="pb-3 font-semibold">Giá</th>
                <th className="pb-3 font-semibold">Số lượng</th>
                <th className="pb-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {product.imageUrl && product.imageUrl.trim() !== '' ? (
                            product.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video 
                                src={getValidMediaUrl(product.imageUrl)} 
                                className="w-full h-full object-cover rounded" 
                                muted 
                              />
                            ) : (
                              <img 
                                  src={getValidMediaUrl(product.imageUrl)} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover rounded" 
                                  onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (!target.src.startsWith('data:image')) {
                                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmMWY1ZjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5M4buXaTwvdGV4dD48L3N2Zz4=';
                                      }
                                  }}
                              />
                            )
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">Trống</span>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium line-clamp-1">{product.name || "Chưa có tên"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                            {product.category?.name || "Chưa phân loại"}
                        </span>
                    </td>
                    <td className="py-4 text-gray-900 font-medium">
                      {product.price ? product.price.toLocaleString() : "0"} ₫
                    </td>
                    <td className="py-4 text-gray-600">
                      {product.stock || 0}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
