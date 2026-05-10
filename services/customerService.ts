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
  getByPhone: async (phone: string): Promise<CustomerResponse> => {
    const response = await api.get(`/customers/phone?phone=${phone}`);
    return response.data;
  },

  // Cập nhật thông tin khách hàng
  update: async (id: string, data: Partial<CustomerResponse>): Promise<CustomerResponse> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  // Tạo mới khách hàng
  create: async (data: any): Promise<CustomerResponse> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // Vô hiệu hóa tài khoản
  deactivate: async (id: string): Promise<void> => {
    await api.patch(`/customers/${id}/deactivate`);
  },

  // Kích hoạt tài khoản
  activate: async (id: string): Promise<void> => {
    await api.patch(`/customers/${id}/activate`);
  }
};