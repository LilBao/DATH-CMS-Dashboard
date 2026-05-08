import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

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
    // Lấy token từ trạng thái lưu ở Zustand Store
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Vì base API đều có chung ApiResponse -> Có thể chủ động return response hoặc response.data tuỳ kiến trúc
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

    return Promise.reject(error);
  }
);

export default api;
