import api from './api';

export interface CouponRequest {
  startDate: string;
  endDate: string;
  saleOff: number;
  releaseNum: number;
  availNum: number;
  isActive?: boolean;
}

export interface CouponResponse {
  couponId: number;
  startDate: string;
  endDate: string;
  saleOff: number;
  releaseNum: number;
  availNum: number;
  isActive: boolean;
}

export const couponService = {
  // Lấy toàn bộ mã giảm giá
  getAll: async (): Promise<CouponResponse[]> => {
    const response = await api.get('/coupons');
    return response.data;
  },

  // Tạo mã mới
  create: async (data: CouponRequest): Promise<CouponResponse> => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  // Cập nhật mã
  update: async (id: number, data: Partial<CouponRequest>): Promise<CouponResponse> => {
    const response = await api.patch(`/coupons/${id}`, data);
    return response.data;
  },

  // Xóa mã
  delete: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  }
};