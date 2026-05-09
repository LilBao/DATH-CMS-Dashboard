import api from './api';

export interface MovieRequest {
  mName: string;
  descript?: string;
  runTime: number;
  isDub?: boolean;
  isSub?: boolean;
  releaseDate: string;
  closingDate: string;
  ageRating: string;
  posterUrl?: string;
  trailerUrl?: string;
  genreIds?: string[];
  formatIds?: string[];
  actorIds?: string[];
}

export interface MovieResponse {
  movieId: number;
  mName: string;
  descript?: string;
  runTime: number;
  isDub: boolean;
  isSub: boolean;
  slug: string;
  releaseDate: string;
  closingDate: string;
  ageRating: string;
  posterUrl?: string;
  trailerUrl?: string;
  genres: string[];
  formats: string[];
  actors: string[];
  avgRating?: number;
  reviewCount?: number;
}

export interface ReviewRequest {
  movieId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export const movieService = {
  // Lấy danh sách phim
  getAll: async (): Promise<MovieResponse[]> => {
    const response = await api.get('/movies');
    return response.data;
  },

  // Lấy danh sách đánh giá của phim
  getReviews: async (movieId: number): Promise<ReviewResponse[]> => {
    const response = await api.get(`/movies/${movieId}/reviews`);
    return response.data;
  },

  // Gửi đánh giá mới
  addReview: async (review: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post('/reviews', review);
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
  
  create: async (movieData: MovieRequest): Promise<MovieResponse> => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  // Lưu phim (Tạo mới hoặc Cập nhật)
  save: async (data: MovieRequest, id?: string): Promise<MovieResponse> => {
    if (id) {
      const response = await api.put(`/movies/${id}`, data);
      return response.data;
    } else {
      const response = await api.post('/movies', data);
      return response.data;
    }
  },

  // Xóa phim
  delete: async (id: string): Promise<void> => {
    await api.delete(`/movies/${id}`);
  }
};