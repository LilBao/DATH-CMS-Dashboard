import api from './api';

export interface EmployeeRequest {
  eUserId: string;
  eName: string;
  sex?: string;
  phoneNumber?: string;
  email?: string;
  ePassword?: string;
  salary: number;
  userType: string;
  branchId: number;
  managerId?: string;
  avatarUrl: string;
}

export interface EmployeeResponse {
  eUserId: string;
  eName: string;
  sex?: string;
  phoneNumber?: string;
  email?: string;
  salary: number;
  userType: string;
  isActive: boolean;
  avatarUrl: string;
  branchId: number;
  branchName?: string;
  managerId?: string;
  managerName?: string;
  createdAt: string;
  updatedAt: string;
}

export const employeeService = {
  // Lấy danh sách tất cả nhân viên
  getAll: async (): Promise<EmployeeResponse[]> => {
    const response = await api.get('/employees');
    return response.data;
  },

  getByBranch: async (branchId: number): Promise<EmployeeResponse[]> => {
    const response = await api.get(`/employees/branch/${branchId}`);
    return response.data;
  },

  // Lưu thông tin nhân viên
  save: async (data: EmployeeRequest, id?: string): Promise<EmployeeResponse> => {
    if (id) return (await api.put(`/employees/${id}`, data)).data;
    return (await api.post('/employees', data)).data;
  },

  // Xóa thông tin nhân viên
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Ngừng kích hoạt tài khoản
  deactivate: async (id: string): Promise<void> => {
    await api.patch(`/employees/${id}/deactivate`);
  },

  // Kích hoạt tài khoản
  activate: async (id: string): Promise<void> => {
    await api.patch(`/employees/${id}/activate`);
  },

  // Phân ca làm việc cho nhân viên
  assignWorkShifts: async (id: string, requests: any[]): Promise<void> => {
    await api.put(`/employees/${id}/work-shifts`, requests);
  },

  // Gỡ ca làm việc của nhân viên
  unassignWorkShift: async (id: string, startTime: string, endTime: string, wDate: number): Promise<void> => {
    await api.delete(`/employees/${id}/work-shifts`, {
      params: { startTime, endTime, wDate }
    });
  }
};