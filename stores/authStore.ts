import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    branchId?: number;
  } | null;
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
        
        // Giải mã token để lấy thông tin cơ bản nếu cần
        let decodedUser = null;
        try {
          const decoded: any = jwtDecode(accessToken);
          console.log("DEBUG: Decoded JWT:", decoded);
          decodedUser = {
            id: decoded.userId || decoded.sub,
            email: decoded.sub,
            role: decoded.role,
            branchId: decoded.branchId ?? decoded.branch_id
          };
        } catch (e) {
          console.error("Failed to decode token", e);
        }

        // Đồng thời lưu vào Zustand state
        set((state) => ({ 
          accessToken, 
          refreshToken,
          user: decodedUser ? { ...state.user, ...decodedUser } : state.user 
        }));
      },

      setUser: (user) => set((state) => {
        // Chỉ cập nhật các trường có giá trị hợp lệ, tránh ghi đè bằng undefined/null
        const updates = Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v !== undefined && v !== null)
        );
        return { 
          user: { ...state.user, ...updates } 
        };
      }),

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
      // Chỉ partialize (lưu) `user`, `accessToken`, `refreshToken` xuống localStorage
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
    }
  )
);
