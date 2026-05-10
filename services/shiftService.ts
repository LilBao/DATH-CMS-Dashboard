import api from './api';

export interface WorkShift {
  startTime: string;
  endTime: string;
  wDate: number;
  work: string;
  employees?: any[]; // Danh sách nhân viên trong ca
}

export const shiftService = {
  // Lấy danh sách tất cả ca làm việc
  getAll: async (): Promise<WorkShift[]> => {
    const response = await api.get('/work-shifts');
    return response.data;
  },

  // Lấy ca làm theo chi nhánh
  getByBranch: async (branchId: number): Promise<WorkShift[]> => {
    const response = await api.get(`/work-shifts/branch/${branchId}`);
    return response.data;
  },

  // Lấy thông tin ca làm việc cụ thể
  getById: async (startTime: string, endTime: string, wDate: number): Promise<WorkShift> => {
    const response = await api.get(`/work-shifts/detail`, {
      params: { startTime, endTime, wDate }
    });
    return response.data;
  },

  // Tạo mới ca làm việc
  create: async (data: WorkShift): Promise<WorkShift> => {
    const response = await api.post('/work-shifts', data);
    return response.data;
  },

  // Cập nhật ca làm việc
  update: async (startTime: string, endTime: string, wDate: number, data: WorkShift): Promise<WorkShift> => {
    const response = await api.put(`/work-shifts`, data, {
      params: { startTime, endTime, wDate }
    });
    return response.data;
  },

  // Xóa ca làm việc
  delete: async (startTime: string, endTime: string, wDate: number): Promise<void> => {
    await api.delete(`/work-shifts`, {
      params: { startTime, endTime, wDate }
    });
  },
};
