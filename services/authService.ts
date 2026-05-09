import api from './api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  sex?: 'M' | 'F';
}

export interface LoginPayload {
  provider: 'LOCAL' | 'GOOGLE';
  email?: string;
  password?: string;
  idToken?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  sex?: string;
  birthday?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

// Bọc các api/service tuỳ chỉnh theo các endpoints
export const authService = {
  // Đăng ký mới
  register: async (data: RegisterPayload) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  // Đăng nhập
  login: async (data: LoginPayload) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  // Đăng xuất
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  // Lấy thông tin user hiện tại
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};
