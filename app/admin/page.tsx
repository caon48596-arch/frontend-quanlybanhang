"use client";

import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchClient } from "../../util/fetchClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    newOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    dailyRevenue: [] as any[],
    recentOrders: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchClient("/dashboard/stats");
        if (response && response.data) {
          setDashboardData({
            totalRevenue: response.data.totalRevenue || 0,
            newOrders: response.data.newOrders || 0,
            totalProducts: response.data.totalProducts || 0,
            totalCustomers: response.data.totalCustomers || 0,
            dailyRevenue: response.data.dailyRevenue || [],
            recentOrders: response.data.recentOrders || []
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { name: "Tổng Doanh Thu", value: `${dashboardData.totalRevenue.toLocaleString()} ₫`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { name: "Tổng Số Đơn", value: dashboardData.newOrders.toString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Sản Phẩm", value: dashboardData.totalProducts.toString(), icon: Package, color: "text-amber-600", bg: "bg-amber-100" },
    { name: "Khách Hàng", value: dashboardData.totalCustomers.toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div></div>;
  }

  // Format data for chart
  const chartData = dashboardData.dailyRevenue.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    Revenue: item.revenue
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
         <h3 className="text-lg font-bold text-gray-800 mb-6">Doanh số theo ngày</h3>
         <div className="h-[350px] w-full">
           {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#64748b', fontSize: 12}}
                   tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                 />
                 <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                 />
                 <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">
               Chưa có dữ liệu doanh thu
             </div>
           )}
         </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="pb-3 font-semibold">Mã ĐH</th>
                <th className="pb-3 font-semibold">Khách hàng</th>
                <th className="pb-3 font-semibold">Ngày đặt</th>
                <th className="pb-3 font-semibold">Tổng tiền</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dashboardData.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào</td>
                </tr>
              ) : (
                dashboardData.recentOrders.map((order: any, idx: number) => (
                  <tr key={order.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-gray-900 font-medium">#{order.id}</td>
                    <td className="py-4 text-gray-600">
                      {order.user?.username || order.user?.email || "Khách vô danh"}
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(order.orderDate).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 text-emerald-700 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status === 'APPROVED' ? 'Đã Duyệt' : order.status === 'CANCELLED' ? 'Đã Hủy' : 'Chờ Duyệt'}
                      </span>
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
