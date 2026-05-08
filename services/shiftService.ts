import api from './api';

export interface Shift {
  id: string;
  employeeName: string;
  role: string;
  branch: string;
  date: string;
  startTime: string;
  endTime: string;
  theme: 'blue' | 'mint' | 'lavender' | 'orange';
}

export const shiftService = {
  // Lấy danh sách ca làm việc
  getShifts: async () => {
    const response = await api.get('/shifts');
    return response.data;
  },

  // Lưu thông tin ca làm việc
  saveShift: async (data: Partial<Shift>, id?: string) => {
    if (id) return (await api.put(`/shifts/${id}`, data)).data;
    return (await api.post('/api/v1/shifts', data)).data;
  },

  // Xóa ca làm việc
  deleteShift: async (id: string) => {
    return (await api.delete(`/shifts/${id}`)).data;
  }
}
