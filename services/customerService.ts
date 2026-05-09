import api from './api';

export interface CustomerResponse {
  cUserId: string;
  cName: string;
  sex?: string;
  phoneNumber?: string;
  email: string;
  userType: string;
  authProvider?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  membershipTier: string;
  totalPoints: number;
}

export const customerService = {
  // Lấy danh sách tất cả khách hàng
  getAll: async (): Promise<CustomerResponse[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Lấy chi tiết một khách hàng
  getById: async (id: string): Promise<CustomerResponse> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Cập nhật thông tin khách hàng
  update: async (id: string, data: Partial<CustomerResponse>): Promise<CustomerResponse> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  // Vô hiệu hóa tài khoản (Thay đổi status)
  disableAccount: async (id: string): Promise<CustomerResponse> => {
    const response = await api.patch(`/customers/${id}`, { isActive: false });
    return response.data;
  }
};