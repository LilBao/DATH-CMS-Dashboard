import api from './api';

export interface Genre {
  genre: string;
}

export interface Format {
  fName: string;
}

export interface Actor {
  fullName: string;
}

export const catalogService = {
  // Genres
  getAllGenres: async (): Promise<Genre[]> => {
    const response = await api.get('/catalog/genres');
    return response.data;
  },
  createGenre: async (genre: string): Promise<Genre> => {
    const response = await api.post('/catalog/genres', null, { params: { genre } });
    return response.data;
  },
  deleteGenre: async (genre: string): Promise<void> => {
    await api.delete(`/catalog/genres/${genre}`);
  },

  // Formats
  getAllFormats: async (): Promise<Format[]> => {
    const response = await api.get('/catalog/formats');
    return response.data;
  },
  createFormat: async (fName: string): Promise<Format> => {
    const response = await api.post('/catalog/formats', null, { params: { fName } });
    return response.data;
  },
  deleteFormat: async (fName: string): Promise<void> => {
    await api.delete(`/catalog/formats/${fName}`);
  },

  // Actors
  getAllActors: async (): Promise<Actor[]> => {
    const response = await api.get('/catalog/actors');
    return response.data;
  },
  createActor: async (fullName: string): Promise<Actor> => {
    const response = await api.post('/catalog/actors', null, { params: { fullName } });
    return response.data;
  },
  deleteActor: async (fullName: string): Promise<void> => {
    await api.delete(`/catalog/actors/${fullName}`);
  }
};
