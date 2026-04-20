"use client";

import { useState } from 'react';
import { Search, Plus, Filter, Clock, MoreVertical, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import MovieFormModal from '../components/MovieFormModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/movie_dialog';

interface Movie {
  id: string;
  title: string;
  duration: number;
  genre: string;
  status: "Now Showing" | "Ended" | "Coming Soon";
  releaseDate: string;
  closeDate: string;
  posterUrl: string;
  description?: string;
  cast?: string;
}

const initialMockMovies: Movie[] = [
  { id: "m1", title: "Dune: Part Two", duration: 166, genre: "Action, Sci-Fi", status: "Now Showing", releaseDate: "2024-03-01", closeDate: "2024-05-30", posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg" },
  { id: "m2", title: "Oppenheimer", duration: 180, genre: "Biography, Drama", status: "Ended", releaseDate: "2023-07-21", closeDate: "2023-10-15", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: "m3", title: "Deadpool & Wolverine", duration: 127, genre: "Action, Comedy", status: "Now Showing", releaseDate: "2024-07-26", closeDate: "2024-10-31", posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
  { id: "m4", title: "Inside Out 2", duration: 96, genre: "Animation, Family", status: "Ended", releaseDate: "2024-06-14", closeDate: "2024-09-20", posterUrl: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzRxqwSy404.jpg" },
  { id: "m5", title: "Spider-Man: Across the Spider-Verse", duration: 140, genre: "Animation, Action", status: "Ended", releaseDate: "2023-06-02", closeDate: "2023-09-10", posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
  { id: "m6", title: "Avatar 3: Fire and Ash", duration: 192, genre: "Action, Adventure", status: "Coming Soon", releaseDate: "2025-12-19", closeDate: "2026-03-31", posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrHeCPu4w108r94yNlY7N1y.jpg" },
  { id: "m7", title: "John Wick: Chapter 4", duration: 169, genre: "Action, Thriller", status: "Ended", releaseDate: "2023-03-24", closeDate: "2023-06-30", posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHazJqc.jpg" },
  { id: "m8", title: "The Batman", duration: 176, genre: "Action, Crime", status: "Ended", releaseDate: "2022-03-04", closeDate: "2022-06-15", posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" },
  { id: "m9", title: "Mickey 17", duration: 139, genre: "Sci-Fi, Drama", status: "Coming Soon", releaseDate: "2025-03-07", closeDate: "2025-06-30", posterUrl: "https://image.tmdb.org/t/p/w500/ehtxXwGjOeqK73xPIfO61z1t99g.jpg" }
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>(initialMockMovies);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Now Showing': return 'bg-green-100 text-green-700';
      case 'Coming Soon': return 'bg-blue-100 text-blue-700';
      case 'Ended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSaveMovie = (movieData: any) => {
    if (movieToEdit) {
      setMovies(movies.map(m => m.id === movieData.id ? { ...m, ...movieData } : m));
      toast.success(`"${movieData.title}" has been updated successfully!`);
    } else {
      setMovies([movieData, ...movies]);
      toast.success(`"${movieData.title}" has been added to catalog!`);
    }
    setIsModalOpen(false);
    setMovieToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (movieToDelete) {
      setMovies(movies.filter(m => m.id !== movieToDelete.id));
      toast.success(`"${movieToDelete.title}" has been deleted successfully.`);
      setMovieToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto relative">
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMovieToEdit(null);
        }}
        onSave={handleSaveMovie}
        existingMovies={movies}
        initialData={movieToEdit}
      />

      <Dialog open={!!movieToDelete} onOpenChange={(open: any) => !open && setMovieToDelete(null)}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-gray-900">Delete Movie</DialogTitle>
            <DialogDescription className="text-[14px] text-gray-500 mt-2">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{movieToDelete?.title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setMovieToDelete(null)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Movies Catalog</h1>
        <button
          onClick={() => {
            setMovieToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Movie
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-[300px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 text-sm text-gray-700 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter by Status
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
            <div className="aspect-[2/3] w-full overflow-hidden relative bg-gray-100 shrink-0">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className={`absolute top-2 right-2 transition-opacity z-20 ${openMenuId === movie.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === movie.id ? null : movie.id);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openMenuId === movie.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setMovieToEdit(movie);
                        setIsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setMovieToDelete(movie);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2" title={movie.title}>
                  {movie.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {movie.duration} min
                </span>
                <span>•</span>
                <span className="truncate">{movie.genre}</span>
              </div>

              <div className="mt-auto pt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(movie.status)}`}>
                  {movie.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}