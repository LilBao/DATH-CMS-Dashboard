import api from './api';

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface MovieRevenue {
  movieTitle: string;
  revenue: number;
  ticketsSold: number;
}

export interface OccupancyRate {
  roomName: string;
  branchName: string;
  occupancyRate: number; // percentage
}

export const reportService = {
  getDailyRevenue: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/reports/revenue/daily', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getMovieRevenue: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/reports/revenue/movie', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getOccupancyRate: async (branchId?: string) => {
    const response = await api.get('/reports/occupancy', {
      params: { branchId }
    });
    return response.data;
  },

  getGeneralStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};
