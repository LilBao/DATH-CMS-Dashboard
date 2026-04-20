import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Mặc định lấy từ Cookie nếu có lúc vừa load ứng dụng
      accessToken: Cookies.get('accessToken') || null,
      refreshToken: Cookies.get('refreshToken') || null,
      user: null,

      setTokens: (accessToken, refreshToken) => {
        // Lưu ra Cookie, set hạn tương ứng (VD: 1 ngày và 30 ngày)
        Cookies.set('accessToken', accessToken, { expires: 1, path: '/' });
        Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/' });
        // Đồng thời lưu vào Zustand state
        set({ accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        set({ accessToken: null, refreshToken: null, user: null });
      },

      isAuthenticated: () => {
        const token = get().accessToken || Cookies.get('accessToken');
        if (!token) return false;

        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            return false;
          }
          return true;
        } catch (error) {
          return false;
        }
      }
    }),
    {
      name: 'auth-storage', // Vẫn giữ localStorage để backup thông tin user
      // Chỉ partialize (lưu) `user` xuống localStorage, 
      // còn accessToken và refreshToken thì quản lý hoàn toàn qua Cookie rồi.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
