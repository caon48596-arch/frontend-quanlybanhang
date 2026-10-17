export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
    // 1. Lấy token từ túi ra
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

    // 2. Gắn token vào Header (nếu có)
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // 3. Gọi sang Spring Boot (cổng 8081)
    const response = await fetch(`https://project1-production-6826.up.railway.app/api${endpoint}`, {
        cache: 'no-store',
        ...options,
        headers
    });

    // 4. Xử lý lỗi nếu Backend trả về mã lỗi (như 403, 404, 500)
    if (!response.ok) {
        // Cố gắng đọc message lỗi từ Backend trả về
        const errorText = await response.text();
        let errorMessage = `Đã xảy ra lỗi từ máy chủ (Mã: ${response.status})`;

        try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
            // Nếu không parse được JSON thì giữ nguyên câu báo lỗi mặc định
        }

        throw new Error(errorMessage);
    }

    // 5. Trả về data cho component dùng
    // Xử lý trường hợp API Xóa (DELETE) trả về rỗng
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {};
    }

    return response.json();
};
export const getUserRoleFromToken = (): string | null => {
    if (typeof window === 'undefined') return null; // Đảm bảo chỉ chạy trên Browser

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

        // Trả về Role (Tùy theo Spring Boot của em cấu hình nhét Role vào key nào)
        return decoded.role || decoded.authorities || decoded.roles || null;

    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};

export const getUserNameFromToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = sessionStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);

        return decoded.sub || decoded.username || null;
    } catch (error) {
        console.error("Lỗi giải mã token lấy username:", error);
        return null;
    }
};

export const getValidMediaUrl = (url: string | undefined): string => {
    if (!url || url.trim() === '') return '';
    let cleanUrl = url.trim();

    // Nếu là base64 thì giữ nguyên
    if (cleanUrl.startsWith('data:')) return cleanUrl;

    // Nếu bắt đầu bằng // (ví dụ //imgur.com/...)
    if (cleanUrl.startsWith('//')) return `https:${cleanUrl}`;

    // Nếu là đường dẫn tương đối từ backend
    if (cleanUrl.startsWith('/')) return `https://project1-production-6826.up.railway.app${cleanUrl}`;

    // Nếu không có http/https, thêm https mặc định
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        return `https://${cleanUrl}`;
    }

    return cleanUrl;
};