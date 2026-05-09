import api from './api';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  salary?: number;
  manager?: string;
  avatarUrl?: string;
}

export const employeeService = {
  // Lấy danh sách tất cả nhân viên
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Lưu thông tin nhân viên
  save: async (data: Partial<Employee>, id?: string) => {
    if (id) return (await api.put(`/employees/${id}`, data)).data;
    return (await api.post('/employees', data)).data;
  },

  // Xóa thông tin nhân viên
  delete: async (id: string) => {
    return (await api.delete(`/employees/${id}`)).data;
  },
};