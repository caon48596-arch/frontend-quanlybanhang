"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { fetchClient } from "../../../util/fetchClient";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountAmount: 0, quantity: 1, expirationDate: "" });

  const fetchCoupons = async () => {
    try {
      const data = await fetchClient("/coupons");
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Lỗi khi tải mã giảm giá:", err);
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchClient("/coupons", {
        method: "POST",
        body: JSON.stringify(newCoupon)
      });
      alert("Thêm thành công!");
      setShowAdd(false);
      setNewCoupon({ code: "", discountAmount: 0, quantity: 1, expirationDate: "" });
      fetchCoupons();
    } catch (err) {
      alert("Lỗi khi thêm mã giảm giá.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã này?")) return;
    try {
      await fetchClient(`/coupons/${id}`, { method: "DELETE" });
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      alert("Lỗi khi xóa.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Mã Giảm Giá</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Thêm Mã Mới
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-lg mb-4">Thêm Mã Giảm Giá Mới</h3>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Mã (Code)</label>
              <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="border rounded-lg px-3 py-2" placeholder="VD: SALE50K" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số tiền giảm (VND)</label>
              <input required type="number" min="0" value={newCoupon.discountAmount} onChange={e => setNewCoupon({...newCoupon, discountAmount: Number(e.target.value)})} className="border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input required type="number" min="1" value={newCoupon.quantity} onChange={e => setNewCoupon({...newCoupon, quantity: Number(e.target.value)})} className="border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hết hạn (Không bắt buộc)</label>
              <input type="datetime-local" value={newCoupon.expirationDate} onChange={e => setNewCoupon({...newCoupon, expirationDate: e.target.value})} className="border rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg h-[42px]">Lưu</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-sm">
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Mã</th>
                <th className="pb-3 font-semibold">Giảm giá</th>
                <th className="pb-3 font-semibold">Lượt còn lại</th>
                <th className="pb-3 font-semibold">Hạn sử dụng</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Chưa có mã giảm giá nào.</td></tr>
              ) : (
                coupons.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 text-gray-900">#{item.id}</td>
                    <td className="py-4 font-bold text-emerald-700">{item.code}</td>
                    <td className="py-4 text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountAmount)}
                    </td>
                    <td className="py-4 text-gray-900 font-medium">{item.quantity}</td>
                    <td className="py-4 text-gray-500 text-sm">
                      {item.expirationDate ? new Date(item.expirationDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td className="py-4">
                      {item.active && item.quantity > 0 && (!item.expirationDate || new Date(item.expirationDate) > new Date()) ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Hoạt động</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Hết hạn/Hết lượt</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 size={16} />
                      </button>
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
