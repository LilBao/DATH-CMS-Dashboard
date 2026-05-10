import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SystemSettings, systemService } from '@/services/systemService';

interface SystemState {
  settings: SystemSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      settings: {
        emailNotification: true,
        orderExpirationMinutes: 15,
        autoCancelEnabled: true,
        seatSyncInterval: 5,
        primaryColor: '#4a4bd7',
        currency: 'VND',
        currencyFormat: 'vi-VN',
        cinemaName: 'CineFlow Premium',
        cinemaAddress: '123 Movie Lane, HCM City',
        cinemaPhone: '0123456789'
      },
      isLoading: false,
      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const settings = await systemService.getSettings();
          set({ settings, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch settings", error);
          set({ isLoading: false });
        }
      },
      updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const updated = { ...currentSettings, ...newSettings };
        set({ settings: updated });
        try {
          await systemService.updateSettings(updated);
        } catch (error) {
          console.error("Failed to sync settings with server", error);
        }
      },
      formatCurrency: (amount) => {
        const { currency, currencyFormat } = get().settings;
        return new Intl.NumberFormat(currencyFormat, {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: 0
        }).format(amount);
      }
    }),
    {
      name: 'system-settings',
    }
  )
);
