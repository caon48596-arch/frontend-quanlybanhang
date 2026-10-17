"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { fetchClient } from "../../../util/fetchClient";

export default function AdminOrdersAndUsers() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);

  const fetchOrderItems = async () => {
    try {
      const res = await fetchClient("/orders/ReadAll");
      const data = Array.isArray(res) ? res : (res?.data || []);
      setOrderItems(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách đơn hàng:", err);
      setError("Không thể tải dữ liệu đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này khỏi đơn hàng?")) return;
    try {
      await fetchClient(`/order-items/${id}`, { method: 'DELETE' });
      setOrderItems(orderItems.filter(item => item.id !== id));
      alert("Đã xóa thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity || 1);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await fetchClient(`/order-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: editQuantity })
      });
      alert("Cập nhật thành công!");
      setEditingId(null);
      fetchOrderItems(); // reload data
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật.");
    }
  };

  const handleUpdateStatus = async (itemId: number, status: string) => {
    try {
      await fetchClient(`/orders/item/${itemId}/status?status=${status}`, {
        method: 'PUT'
      });
      alert("Cập nhật trạng thái thành công!");
      fetchOrderItems();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng & Khách hàng</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-sm">
                <th className="pb-3 font-semibold">Mã ĐH</th>
                <th className="pb-3 font-semibold">Khách hàng</th>
                <th className="pb-3 font-semibold">Mã SP</th>
                <th className="pb-3 font-semibold">Sản phẩm</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold">Thời gian mua</th>
                <th className="pb-3 font-semibold">Số lượng</th>
                <th className="pb-3 font-semibold">Tổng</th>
                <th className="pb-3 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : orderItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                </tr>
              ) : (
                orderItems.map((item: any, idx: number) => {
                  const order = item.order || {};
                  const user = order.user || {};
                  const product = item.product || {};
                  const price = item.Price || item.price || product.price || 0;
                  const qty = item.quantity || 1;
                  const total = price * qty;

                  return (
                    <tr key={item.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-900 font-medium">#{order.id || "?"}</td>
                      <td className="py-4 text-gray-900">
                        <div className="font-medium text-emerald-700">{user.username || "Khách vô danh"}</div>
                        <div className="text-xs text-gray-500">{user.email || ""}</div>
                      </td>
                      <td className="py-4 text-gray-500 font-mono text-xs">SP-{product.id || "?"}</td>
                      <td className="py-4 text-gray-800 line-clamp-1" title={product.name}>{product.name || "Sản phẩm không rõ"}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status === 'APPROVED' ? 'Đã Duyệt' : item.status === 'CANCELLED' ? 'Đã Hủy' : 'Chờ Duyệt'}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{formatDate(order.orderDate)}</td>
                      <td className="py-4 text-gray-900">
                        {editingId === item.id ? (
                           <input 
                              type="number" 
                              min="1" 
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(Number(e.target.value))}
                              className="w-16 border rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                           />
                        ) : (
                           qty
                        )}
                      </td>
                      <td className="py-4 text-emerald-700 font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex flex-col gap-1 items-center justify-center">
                           {(item.status === 'PENDING' || !item.status) && item.id && (
                             <div className="flex gap-1 mb-1">
                               <button onClick={() => handleUpdateStatus(item.id, 'APPROVED')} className="text-[10px] px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold">Duyệt</button>
                               <button onClick={() => handleUpdateStatus(item.id, 'CANCELLED')} className="text-[10px] px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold">Từ chối</button>
                             </div>
                           )}
                           <div className="flex items-center justify-center gap-2">
                             {editingId === item.id ? (
                                <>
                                   <button onClick={() => handleSaveEdit(item.id)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold bg-emerald-100 px-2 py-1 rounded">Lưu</button>
                                   <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">Hủy</button>
                                </>
                             ) : (
                                <>
                                   <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa số lượng"><Edit size={16} /></button>
                                   <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={16} /></button>
                                </>
                             )}
                           </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
