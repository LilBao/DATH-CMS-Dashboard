import api from './api';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Available' | 'Used' | 'Expired' | 'Disabled';
  usageLimit?: number;
}

export const couponService = {
  // Lấy toàn bộ mã giảm giá
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },

  // Tạo mã mới
  create: async (data: Omit<Coupon, 'id'>) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  // Cập nhật mã
  update: async (id: string, data: Partial<Coupon>) => {
    const response = await api.patch(`/coupons/${id}`, data);
    return response.data;
  },

  // Xóa mã
  delete: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  }
};