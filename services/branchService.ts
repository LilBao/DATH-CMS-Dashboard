import api from './api';

export interface BranchRequest {
  bName: string;
  bAddress: string;
  managerId?: string;
  phoneNumbers?: string[];
  isActive?: boolean;
}

export interface BranchResponse {
  branchId: number;
  bName: string;
  bAddress: string;
  managerName?: string;
  managerId?: string;
  phoneNumbers: string[];
  totalRooms: number;
  isActive: boolean;
}

export const branchService = {
  // Lấy danh sách chi nhánh
  getAll: async (): Promise<BranchResponse[]> => {
    const response = await api.get('/branches');
    return response.data;
  },

  // Thêm chi nhánh
  create: async (data: BranchRequest): Promise<BranchResponse> => {
    const response = await api.post('/branches', data);
    return response.data;
  },

  // Cập nhật chi nhánh
  update: async (id: number, data: BranchRequest): Promise<BranchResponse> => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  // Xóa chi nhánh
  delete: async (id: number): Promise<void> => {
    await api.delete(`/branches/${id}`);
  }
};