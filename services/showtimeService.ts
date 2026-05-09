import api from './api';

export interface Showtime {
  id: string;
  movieId: string;
  branchId: string;
  roomId: string;
  date: string;
  time: string;
  theme?: 'mint' | 'lavender' | 'blue' | 'red';
  isConflict?: boolean;
}

export const showtimeService = {
  // Lấy toàn bộ danh sách suất chiếu
  getAll: async () => {
    const response = await api.get('/showtimes');
    return response.data;
  },

  // Lấy danh sách suất chiếu theo chi nhánh
  getByBranch: async (branchId: string) => {
    const response = await api.get(`/showtimes?branchId=${branchId}`);
    return response.data;
  },

  // Tạo mới một suất chiếu
  create: async (data: Partial<Showtime>) => {
    const response = await api.post('/showtimes', data);
    return response.data;
  },

  // Cập nhật suất chiếu hiện có
  update: async (id: string, data: Partial<Showtime>) => {
    const response = await api.put(`/showtimes/${id}`, data);
    return response.data;
  },

  // Xóa suất chiếu
  delete: async (id: string) => {
    const response = await api.delete(`/showtimes/${id}`);
    return response.data;
  }
};