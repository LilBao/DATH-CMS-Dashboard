import api from './api';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  time: string;
  ticketQuantity: number;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export const orderService = {
  // Lấy danh sách toàn bộ hóa đơn/vé
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Lấy chi tiết một hóa đơn cụ thể
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Tạo hóa đơn mới
  create: async (data: Partial<Order>) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Xử lý hoàn tiền hoặc thay đổi trạng thái
  updateStatus: async (id: string, status: Order['status']) => {
    const response = await api.patch(`/orders/${id}`, { status });
    return response.data;
  },

  // Cập nhật thông tin chung (Sửa tên khách, email...)
  update: async (id: string, data: Partial<Order>) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  // Xóa hóa đơn
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};