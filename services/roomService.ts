import api from './api';

export interface SeatRequest {
  branchId: number;
  roomId: number;
  sRow: number;
  sColumn: number;
  sType?: number;
  sPrice?: number;
  sStatus?: boolean;
}

export interface SeatResponse {
  branchId: number;
  roomId: number;
  sRow: number;
  sColumn: number;
  sType: number;
  sPrice: number;
  sStatus: boolean;
  isBooked: boolean;
}

export interface ScreenRoomRequest {
  branchId: number;
  roomId: number;
  rType: string;
  rCapacity: number;
  basePrice?: number;
}

export interface ScreenRoomResponse {
  branchId: number;
  roomId: number;
  rType: string;
  rCapacity: number;
  basePrice: number;
  totalSeats: number;
}

export const roomService = {
  getAll: async (): Promise<ScreenRoomResponse[]> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getSeats: async (branchId: number, roomId: number): Promise<SeatResponse[]> => {
    const response = await api.get(`/seats/branches/${branchId}/rooms/${roomId}`);
    return response.data;
  },

  getByBranch: async (branchId: number): Promise<ScreenRoomResponse[]> => {
    const response = await api.get(`/rooms?branchId=${branchId}`);
    return response.data;
  },

  updateLayout: async (branchId: number, roomId: number, layout: SeatRequest[]) => {
    const response = await api.post(`/seats/branches/${branchId}/rooms/${roomId}/bulk`, layout);
    return response.data;
  },

  syncSeats: async (branchId: number, roomId: number, layout: SeatRequest[]) => {
    const response = await api.post(`/seats/branches/${branchId}/rooms/${roomId}/bulk`, layout);
    return response.data;
  },

  create: async (data: ScreenRoomRequest): Promise<ScreenRoomResponse> => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  update: async (branchId: number, roomId: number, data: Partial<ScreenRoomRequest>): Promise<ScreenRoomResponse> => {
    const response = await api.put(`/rooms/${branchId}/${roomId}`, data);
    return response.data;
  },

  delete: async (branchId: number, roomId: number): Promise<void> => {
    await api.delete(`/rooms/${branchId}/${roomId}`);
  }
};