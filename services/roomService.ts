import api from './api';

export interface Seat {
  id: string;
  row: string;
  col: number;
  status: 'available' | 'selected' | 'disabled';
}

export interface Room {
  id: string;
  name: string;
  type: string;
  status: 'Now Playing' | 'Cleaning' | 'Reserved' | 'Idle';
  capacity: number;
  branchId: string;
  layout?: Seat[];
}

export const roomService = {
  getAll: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },
  
  updateLayout: async (id: string, layout: Seat[], capacity: number) => {
    return await api.patch(`/rooms/${id}`, { 
        layout: layout, 
        capacity: capacity 
    });
  },

  create: async (data: Partial<Room>) => {
    const response = await api.post('/rooms', data);
    return response.data;
  }
};