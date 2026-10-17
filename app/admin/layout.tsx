import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            LUXE Admin
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Package size={20} /> <span>Sản phẩm</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ShoppingCart size={20} /> <span>Đơn hàng & Khách hàng</span>
          </Link>
          <Link href="/admin/coupons" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Package size={20} /> <span>Mã giảm giá</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <LogOut size={20} /> <span>Về trang chủ</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">Quản trị viên</h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
