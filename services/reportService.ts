import api from './api';

export interface BranchRevenueResponse {
  branchId: number;
  branchName: string;
  revenue: number;
  ticketCount: number;
}

export interface DailyRevenueResponse {
  date: string;
  revenue: number;
  ticketCount: number;
}

export interface MovieRevenueResponse {
  movieId: number;
  movieName: string;
  revenue: number;
  ticketCount: number;
}

export interface OccupancyResponse {
  showtimeId: number;
  movieName: string;
  branchName: string;
  roomId: number;
  day: string;
  startTime: string;
  capacity: number;
  ticketsSold: number;
  occupancyRate: number;
}

export const reportService = {
  getDailyRevenue: async (startDate?: string, endDate?: string, branchId?: number): Promise<DailyRevenueResponse[]> => {
    const response = await api.get('/statistics/revenue/daily', {
      params: { startDate, endDate, branchId }
    });
    return response.data;
  },

  getMovieRevenue: async (startDate?: string, endDate?: string, branchId?: number): Promise<MovieRevenueResponse[]> => {
    const response = await api.get('/statistics/revenue/movie', {
      params: { startDate, endDate, branchId }
    });
    return response.data;
  },

  getBranchRevenue: async (startDate?: string, endDate?: string): Promise<BranchRevenueResponse[]> => {
    const response = await api.get('/statistics/revenue/branch', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getOccupancyRate: async (branchId?: string): Promise<OccupancyResponse[]> => {
    const response = await api.get('/statistics/occupancy', {
      params: { branchId }
    });
    return response.data;
  },

  getGeneralStats: async () => {
    const response = await api.get('/statistics/stats');
    return response.data;
  }
};
