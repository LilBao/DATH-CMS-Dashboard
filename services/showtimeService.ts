import api from './api';

export interface ShowtimeRequest {
  movieId: number;
  branchId: number;
  roomId: number;
  formatName?: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface ShowtimeResponse {
  timeId: number;
  movieId: number;
  movieName: string;
  branchId: number;
  branchName: string;
  roomId: number;
  rType: string;
  rPrice: number;
  formatName: string;
  day: string;
  startTime: string;
  endTime: string;
  status: string;
}

export const showtimeService = {
  // Lấy toàn bộ danh sách suất chiếu
  getAll: async (): Promise<ShowtimeResponse[]> => {
    const response = await api.get('/showtimes');
    return response.data;
  },

  // Lấy danh sách suất chiếu theo chi nhánh
  getByBranch: async (branchId: string): Promise<ShowtimeResponse[]> => {
    const response = await api.get(`/showtimes?branchId=${branchId}`);
    return response.data;
  },

  // Tạo mới một suất chiếu
  create: async (data: ShowtimeRequest): Promise<ShowtimeResponse> => {
    const response = await api.post('/showtimes', data);
    return response.data;
  },

  // Cập nhật suất chiếu hiện có
  update: async (id: number, data: Partial<ShowtimeRequest>): Promise<ShowtimeResponse> => {
    const response = await api.put(`/showtimes/${id}`, data);
    return response.data;
  },

  // Xóa suất chiếu
  delete: async (id: number): Promise<void> => {
    await api.delete(`/showtimes/${id}`);
  }
};