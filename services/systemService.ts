import api from './api';

export interface SystemSettings {
  emailNotification: boolean;
  orderExpirationMinutes: number;
  autoCancelEnabled: boolean;
  seatSyncInterval: number;
  primaryColor: string;
  currency: 'USD' | 'VND';
  currencyFormat: string;
  cinemaName: string;
  cinemaAddress: string;
  cinemaPhone: string;
}

export const systemService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get<SystemSettings>('/system/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put<SystemSettings>('/system/settings', settings);
    return response.data;
  },

  // Gửi email xác nhận & nhắc lịch (Manual trigger if needed)
  triggerEmailReminder: async (orderId: string) => {
    const response = await api.post(`/system/emails/remind/${orderId}`);
    return response.data;
  },

  // Đồng bộ ghế thời gian thực (Trigger sync)
  syncSeats: async (showtimeId: string) => {
    const response = await api.post(`/system/sync-seats/${showtimeId}`);
    return response.data;
  }
};
