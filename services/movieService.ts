import api from './api';

export type MovieStatus = "Now Showing" | "Ended" | "Coming Soon";

export interface Movie {
  id: string;
  title: string;
  duration: number;
  genre: string;
  status: MovieStatus;
  posterUrl: string;
  releaseDate?: string;
  closeDate?: string;
  description?: string;
  cast?: string;
}

export const movieService = {
  // Lấy danh sách phim
  getAll: async () => {
    const response = await api.get('/movies');
    return response.data;
  },

  uploadPoster: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    return await response.json();
  },
  
  create: async (movieData: any) => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  // Lưu phim (Tạo mới hoặc Cập nhật)
  save: async (data: any, id?: string) => {
    if (id) {
      const response = await api.put(`/movies/${id}`, data);
      return response.data;
    } else {
      const response = await api.post('/movies', data);
      return response.data;
    }
  },

  // Xóa phim
  delete: async (id: string) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  }
};