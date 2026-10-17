// Thêm vào util/fetchClient.ts hoặc util/auth.ts
export const getUserRoleFromToken = (): string | null => {
    if (typeof window === 'undefined') return null; // Đảm bảo chỉ chạy trên Client (Browser)

    const token = sessionStorage.getItem('accessToken');
    if (!token) return null;

    try {
        // JWT có dạng: header.payload.signature -> Tách lấy phần payload ở index 1
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);

        // Tùy thuộc vào Spring Boot của em cấu hình nhét Role vào key nào.
        // Thường là 'role', 'roles', hoặc 'authorities'.
        return decoded.role || decoded.authorities || null;

    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};