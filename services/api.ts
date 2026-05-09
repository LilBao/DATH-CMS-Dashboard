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

    // Tự động nạp branchId nếu là MANAGER và chưa có branchId trong params
    if (user?.role?.toUpperCase().includes('MANAGER') && (user?.branchId !== undefined && user?.branchId !== null)) {
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

export default api;
