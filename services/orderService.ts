import api from './api';

export interface TicketRequest {
  showtimeId: number;
  branchId: number;
  roomId: number;
  sRow: number;
  sColumn: number;
  tPrice: number;
}

export interface AddonItemRequest {
  productId: number;
  pType: string;
  pName: string;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  paymentMethod: string;
  couponId?: number;
  tickets: TicketRequest[];
  addons?: AddonItemRequest[];
}

export interface TicketResponse {
  ticketId: number;
  movieName: string;
  screenRoomName: string;
  branchName: string;
  seatName: string;
  showtime: string;
  price: number;
}

export interface AddonResponse {
  productId: number;
  pName: string;
  quantity: number;
  price: number;
  itemType: string;
}

export interface OrderResponse {
  orderId: number;
  orderTime: string;
  paymentMethod: string;
  originalTotal: number;
  discountAmount: number;
  total: number;
  orderStatus: string; // 'PAID' | 'CANCELLED' | 'PENDING'
  paymentUrl?: string | null;
  ticketDetails: TicketResponse[];
  addonDetails: AddonResponse[];
}

export const orderService = {
  // Lấy danh sách toàn bộ hóa đơn/vé
  getAll: async (branchId?: number): Promise<OrderResponse[]> => {
    const response = await api.get('/orders', { params: { branchId } });
    return response.data;
  },

  // Lấy chi tiết một hóa đơn cụ thể
  getById: async (id: number): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Tạo hóa đơn mới
  create: async (data: OrderRequest): Promise<OrderResponse> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Xử lý hoàn tiền hoặc thay đổi trạng thái
  updateStatus: async (id: number, status: string): Promise<OrderResponse> => {
    const response = await api.patch(`/orders/${id}`, { orderStatus: status });
    return response.data;
  },

  // Cập nhật thông tin chung
  update: async (id: number, data: Partial<OrderRequest>): Promise<OrderResponse> => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  // Xóa hóa đơn
  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};