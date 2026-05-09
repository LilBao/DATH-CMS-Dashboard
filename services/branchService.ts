import api from './api';

export interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  status: 'Active' | 'Maintenance' | 'Closed';
}

export const branchService = {
  // Lấy danh sách chi nhánh
  getAll: async () => {
    const response = await api.get('/branches');
    return response.data;
  },

  // Thêm chi nhánh
  create: async (data: Partial<Branch>) => {
    const response = await api.post('/branches', data);
    return response.data;
  },

  // Cập nhật chi nhánh
  update: async (id: string, data: Branch) => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  // Xóa chi nhánh
  delete: async (id: string) => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  }
};