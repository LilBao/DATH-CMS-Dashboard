"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock, Edit, Filter, MoreVertical,
  Plus, Search, Trash2, Loader2, Film,
} from "lucide-react";
import { toast } from "sonner";
import MovieFormModal from "../components/MovieFormModal";
import { movieService, MovieResponse, MovieRequest } from "@/services/movieService";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/movie_dialog";

export default function MoviesPage() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<MovieResponse | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<MovieResponse | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStatus = (m: MovieResponse) => {
    const today = new Date().toISOString().split("T")[0];
    if (m.releaseDate && m.releaseDate > today) return "Coming Soon";
    if (m.closingDate && m.closingDate < today) return "Ended";
    return "Now Showing";
  };

  // Fetch dữ liệu từ MovieService
  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getAll();
      setMovies(data);
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ phim.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return movies.filter((movie) => {
      const genresStr = movie.genres?.join(", ").toLowerCase() || "";
      const matchesKeyword = !keyword ||
        movie.mName.toLowerCase().includes(keyword) ||
        genresStr.includes(keyword);
      const matchesStatus = statusFilter === "All" || getStatus(movie) === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [movies, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Now Showing": return "bg-emerald-100 text-emerald-700";
      case "Coming Soon": return "bg-amber-100 text-amber-700";
      case "Ended": return "bg-slate-100 text-slate-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleSaveMovie = async (movieData: any) => {
    try {
      const savedData = await movieService.save(movieData, movieToEdit?.movieId.toString());

      setMovies((prev) =>
        movieToEdit
          ? prev.map((m) => (m.movieId === savedData.movieId ? savedData : m))
          : [savedData, ...prev],
      );

      toast.success(`Phim "${savedData.mName}" đã được lưu!`);
      setIsModalOpen(false);
      setMovieToEdit(null);
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin phim.");
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCreateMovie = async (formData: any) => {
    try {
      let posterUrl = "/posters/default.jpg"; // Ảnh mặc định nếu không up ảnh

      // 1. Nếu có chọn file, tiến hành upload lên server Next.js trước
      if (selectedFile) {
        const uploadRes = await movieService.uploadPoster(selectedFile);
        if (uploadRes.success) {
          posterUrl = uploadRes.url;
        } else {
          toast.error("Không thể upload ảnh, sử dụng ảnh mặc định.");
        }
      }

      // 2. Sau khi có URL ảnh, mới gửi dữ liệu phim sang JSON Server
      const movieData = {
        ...formData,
        poster: posterUrl, // Đây là chuỗi "/posters/abc.jpg"
        createdAt: new Date().toISOString()
      };

      await movieService.create(movieData);
      toast.success("Thêm phim mới thành công!");
      // Refresh dữ liệu...
    } catch (error) {
      toast.error("Lỗi khi thêm phim.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await movieService.delete(movieToDelete.movieId.toString());
      setMovies((prev) => prev.filter((m) => m.movieId !== movieToDelete.movieId));
      toast.success("Đã xóa phim thành công.");
      setMovieToDelete(null);
    } catch (error) {
      toast.error("Lỗi khi thực hiện xóa.");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-12 relative px-4">
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
        <DialogContent className="bg-white sm:max-w-md p-8 rounded-[32px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              Bạn có chắc muốn gỡ bỏ phim <span className="font-bold text-gray-800 tracking-tight">"{movieToDelete?.mName}"</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex justify-end gap-3">
            <button onClick={() => setMovieToDelete(null)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Hủy</button>
            <button onClick={handleConfirmDelete} className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">Xóa vĩnh viễn</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Catalog</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Movies</h1>
          <p className="text-gray-500 font-medium">Hệ thống quản lý kho phim và trạng thái công chiếu rạp.</p>
        </div>
        <button
          type="button"
          onClick={() => { setMovieToEdit(null); setIsModalOpen(true); }}
          className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Plus className="w-5 h-5" /> Thêm phim mới
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc thể loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 text-sm font-bold text-gray-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-xs font-black text-gray-600 hover:bg-gray-50 transition-all outline-none cursor-pointer uppercase tracking-tighter"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Now Showing">Đang chiếu</option>
            <option value="Coming Soon">Sắp chiếu</option>
            <option value="Ended">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-100 py-32 text-center">
          <Film className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Danh sách phim hiện tại đang trống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredMovies.map((movie, i) => (
            <div key={movie.movieId || i} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group relative flex flex-col">
              <div className="aspect-[2/3] w-full overflow-hidden relative bg-gray-50 shrink-0">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.mName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-black px-4 text-center uppercase tracking-tighter">No Poster Image</div>
                )}

                <div className={`absolute top-4 right-4 transition-opacity z-20 ${openMenuId === movie.movieId ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button onClick={() => setOpenMenuId(openMenuId === movie.movieId ? null : movie.movieId)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:text-indigo-600 shadow-xl transition-all border border-transparent hover:border-indigo-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === movie.movieId && (
                    <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                      <button onClick={() => { setOpenMenuId(null); setMovieToEdit(movie); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors uppercase tracking-widest"><Edit className="w-4 h-4" /> Hiệu chỉnh</button>
                      <button onClick={() => { setOpenMenuId(null); setMovieToDelete(movie); }} className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black text-rose-600 hover:bg-rose-50 transition-colors border-t border-gray-50 uppercase tracking-widest"><Trash2 className="w-4 h-4" /> Gỡ bỏ</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-7 flex flex-col flex-1">
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1 line-clamp-2 uppercase tracking-tighter">{movie.mName}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">{movie.genres?.join(", ") || "Unknown"}</p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(getStatus(movie))}`}>
                    {getStatus(movie)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase">
                    <Clock className="w-4 h-4" />
                    {movie.runTime || "--"} MIN
                  </div>
                </div>

                {movie.releaseDate && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khởi chiếu: <span className="text-gray-700 ml-1">{movie.releaseDate}</span></p>
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