import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

// Cấu hình BaseURL của BE. Tuỳ vào môi trường sẽ dùng .env thích hợp.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Thay đổi đường dẫn gốc tuỳ server logic
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor nạp Auto AccessToken lên headers của axios
api.interceptors.request.use(
  (config) => {
    // Lấy token và user từ trạng thái lưu ở Zustand Store
    const state = useAuthStore.getState();
    const token = state.accessToken;
    const user = state.user;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tự động nạp branchId nếu là MANAGER hoặc STAFF và chưa có branchId trong params
    const role = user?.role?.toUpperCase();
    if ((role?.includes('MANAGER') || role?.includes('STAFF')) && (user?.branchId !== undefined && user?.branchId !== null)) {
      config.params = {
        ...config.params,
        branchId: config.params?.branchId ?? user.branchId
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response, có thể can thiệp lúc hết hạn Token (401)
api.interceptors.response.use(
  (response) => {
    const apiRes = response.data;

    if (apiRes && typeof apiRes === 'object' && apiRes.message) {
      if (response.config.method !== 'get' || (apiRes.message.toLowerCase() !== 'success' && apiRes.message !== 'OK')) {
        toast.success(apiRes.message);
      }
    }

    if (apiRes && typeof apiRes === 'object' && 'success' in apiRes && 'data' in apiRes) {
      response.data = apiRes.data;
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu mã lỗi là 401 thì gọi refresh API để xin token mới bằng refreshToken
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (refreshToken) {
          // Gọi API làm mới access token
          const refreshRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'}/auth/refresh`, {
            refreshToken
          });

          // Lấy mã Token mới đổ vào store qua hàm thay đổi bên Zustand
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data.data;

          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

          // Cập nhật lại headers cho Request bị miss ban đầu do thiếu quyền và gọi lại
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh thất bại -> xóa token cũ + đưa về trang home/login
        useAuthStore.getState().logout();
        window.location.href = '/login'; // Chuyển về trang đăng nhập
        return Promise.reject(refreshError);
      }
    }

    // Hiển thị lỗi thông qua toast (trừ trường hợp 401 đã xử lý ở trên hoặc đang refresh)
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã có lỗi xảy ra';

    // Chỉ hiển thị toast nếu không phải là lỗi 401 (đã được xử lý chuyển hướng hoặc refresh)
    if (error.response?.status !== 401) {
      toast.error('Lỗi hệ thống', {
        description: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);

// BỘ NHỚ CACHE IN-MEMORY DÀNH CHO DASHBOARD
// Áp dụng: Cache tất cả API GET, tự động xoá cache (Cache Busting) khi có hành động POST/PUT/DELETE/PATCH
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 phút (thời gian sống của cache)

// @ts-ignore
const originalGet = api.get;
// @ts-ignore
api.get = async function (url: string, config?: any) {
  // Bỏ qua cache nếu URL có chứa query force reload hoặc disable cache
  const isNoCache = config?.headers?.['Cache-Control'] === 'no-cache';
  
  if (!isNoCache) {
    const key = url + JSON.stringify(config?.params || {});
    const cached = cache.get(key);
    
    // Nếu có cache và chưa hết hạn thì trả về cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CACHE HIT] ${url}`);
      return Promise.resolve({ data: cached.data } as any);
    }
  }

  // Nếu không có cache hoặc hết hạn, gọi API thật
  const response = (await originalGet.call(this, url, config)) as any;
  
  // Lưu kết quả vào cache
  if (!isNoCache && response?.data !== undefined) {
    const key = url + JSON.stringify(config?.params || {});
    cache.set(key, { data: response.data, timestamp: Date.now() });
  }
  
  return response;
};

// Ghi đè các method thay đổi dữ liệu để tự động xoá toàn bộ cache
const clearCache = () => {
  if (cache.size > 0) {
    console.log(`[CACHE CLEARED] Xoá ${cache.size} mục khỏi bộ nhớ cache do có thay đổi dữ liệu.`);
    cache.clear();
  }
};

// @ts-ignore
const originalPost = api.post;
// @ts-ignore
api.post = async function (url: string, data?: any, config?: any) {
  clearCache();
  return originalPost.call(this, url, data, config);
};

// @ts-ignore
const originalPut = api.put;
// @ts-ignore
api.put = async function (url: string, data?: any, config?: any) {
  clearCache();
  return originalPut.call(this, url, data, config);
};

// @ts-ignore
const originalPatch = api.patch;
// @ts-ignore
api.patch = async function (url: string, data?: any, config?: any) {
  clearCache();
  return originalPatch.call(this, url, data, config);
};

// @ts-ignore
const originalDelete = api.delete;
// @ts-ignore
api.delete = async function (url: string, config?: any) {
  clearCache();
  return originalDelete.call(this, url, config);
};

export default api;
