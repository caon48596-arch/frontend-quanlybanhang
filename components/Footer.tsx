import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-700 text-slate-300 py-12 mt-auto">
            <div className="max-w-[1400px] mx-auto px-4 flex flex-col items-center space-y-6">
                <Link href="/" className="text-2xl font-bold tracking-widest text-emerald-400">
                    LUXE
                </Link>
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm font-medium">
                    <Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
                    <Link href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
                    <Link href="#" className="hover:text-white transition-colors">Liên hệ</Link>
                    <Link href="#" className="hover:text-white transition-colors">Hệ thống cửa hàng</Link>
                </div>
                <div className="w-16 h-px bg-slate-600"></div>
                <p className="text-sm text-slate-400">
                    © 2026 LUXE Ecommerce. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </footer>
    );
}
