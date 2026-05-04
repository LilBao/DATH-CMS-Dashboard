"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Edit,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import MovieFormModal from "../components/MovieFormModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/movie_dialog";

const API_URL = "http://localhost:3001/movies";

type MovieStatus = "Now Showing" | "Ended" | "Coming Soon";

interface Movie {
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

type MoviePayload = Partial<Movie> & {
  id?: string | number;
  title?: string;
  name?: string;
  movieName?: string;
  duration?: number | string;
  genre?: string | string[];
  genres?: string[];
  status?: string;
  posterUrl?: string;
  poster?: string;
  imageUrl?: string;
  releaseDate?: string;
  closeDate?: string;
  closingDate?: string;
  description?: string;
  cast?: string;
};

const normalizeStatus = (status?: string, releaseDate?: string, closeDate?: string): MovieStatus => {
  if (status === "Now Showing" || status === "Ended" || status === "Coming Soon") {
    return status;
  }

  const today = new Date().toISOString().split("T")[0];

  if (releaseDate && releaseDate > today) return "Coming Soon";
  if (closeDate && closeDate < today) return "Ended";

  return "Now Showing";
};

const normalizeMovie = (movie: MoviePayload): Movie => {
  const releaseDate = movie.releaseDate ?? "";
  const closeDate = movie.closeDate ?? movie.closingDate ?? "";
  const genre = Array.isArray(movie.genre)
    ? movie.genre.join(", ")
    : movie.genre ?? movie.genres?.join(", ") ?? "Unknown";

  return {
    id: String(movie.id ?? crypto.randomUUID()),
    title: movie.title ?? movie.name ?? movie.movieName ?? "Untitled Movie",
    duration: Number(movie.duration ?? 0),
    genre,
    status: normalizeStatus(movie.status, releaseDate, closeDate),
    posterUrl: movie.posterUrl ?? movie.poster ?? movie.imageUrl ?? "",
    releaseDate,
    closeDate,
    description: movie.description,
    cast: movie.cast,
  };
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MovieStatus | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const result: MoviePayload[] | { data?: MoviePayload[]; content?: MoviePayload[] } = await response.json();
      const rawMovies = Array.isArray(result) ? result : result.data ?? result.content ?? [];
      setMovies(rawMovies.map(normalizeMovie));
    } catch (error) {
      console.error(error);
      toast.error("Could not load movies from server.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesKeyword =
        !keyword ||
        movie.title.toLowerCase().includes(keyword) ||
        movie.genre.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "All" || movie.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [movies, searchQuery, statusFilter]);

  const getStatusColor = (status: MovieStatus) => {
    switch (status) {
      case "Now Showing":
        return "bg-green-100 text-green-700";
      case "Coming Soon":
        return "bg-blue-100 text-blue-700";
      case "Ended":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSaveMovie = async (movieData: MoviePayload) => {
    try {
      const isEdit = Boolean(movieToEdit);
      const url = isEdit ? `${API_URL}/${movieToEdit?.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error("Failed to save movie");
      }

      const savedMovie = normalizeMovie(await response.json());

      setMovies((currentMovies) =>
        isEdit
          ? currentMovies.map((movie) => (movie.id === savedMovie.id ? savedMovie : movie))
          : [savedMovie, ...currentMovies],
      );
      toast.success(`"${savedMovie.title}" has been ${isEdit ? "updated" : "added"} successfully!`);
      setIsModalOpen(false);
      setMovieToEdit(null);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the movie.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;

    try {
      const response = await fetch(`${API_URL}/${movieToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete movie");
      }

      setMovies((currentMovies) => currentMovies.filter((movie) => movie.id !== movieToDelete.id));
      toast.success(`"${movieToDelete.title}" has been deleted successfully.`);
      setMovieToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the movie.");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto relative">
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

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

      <Dialog open={Boolean(movieToDelete)} onOpenChange={(open) => !open && setMovieToDelete(null)}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-gray-900">Delete Movie</DialogTitle>
            <DialogDescription className="text-[14px] text-gray-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-800">&quot;{movieToDelete?.title}&quot;</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setMovieToDelete(null)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movies Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage movie information, posters, and screening status.</p>
        </div>
        <button
          type="button"
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-[300px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or genre..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-gray-50 text-sm text-gray-700 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as MovieStatus | "All")}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors outline-none bg-white"
          >
            <option value="All">All Status</option>
            <option value="Now Showing">Now Showing</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-500 font-medium">
          Loading catalog...
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-500 font-medium">
          No movies found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col"
            >
              <div className="aspect-[2/3] w-full overflow-hidden relative bg-gray-100 shrink-0">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">
                    No poster available
                  </div>
                )}

                <div
                  className={`absolute top-2 right-2 transition-opacity z-20 ${
                    openMenuId === movie.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuId(openMenuId === movie.id ? null : movie.id);
                    }}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                    aria-label={`Open actions for ${movie.title}`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === movie.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId(null);
                          setMovieToEdit(movie);
                          setIsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
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

                <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-3">{movie.genre}</p>

                <div className="flex items-center justify-between mt-auto gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(movie.status)}`}>
                    {movie.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {movie.duration || "--"} min
                  </span>
                </div>

                {(movie.releaseDate || movie.closeDate) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                    {movie.releaseDate && <p>Release: {movie.releaseDate}</p>}
                    {movie.closeDate && <p>Close: {movie.closeDate}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}