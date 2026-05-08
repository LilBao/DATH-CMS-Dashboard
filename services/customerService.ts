import api from './api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership: 'Premium' | 'Normal' | 'VIP';
  points: number;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  registeredDate: string;
}

export const customerService = {
  // Lấy danh sách tất cả khách hàng
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Lấy chi tiết một khách hàng
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Cập nhật thông tin khách hàng
  update: async (id: string, data: Partial<Customer>) => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  // Vô hiệu hóa tài khoản (Thay đổi status)
  disableAccount: async (id: string) => {
    const response = await api.patch(`/customers/${id}`, { status: 'Inactive' });
    return response.data;
  }
};