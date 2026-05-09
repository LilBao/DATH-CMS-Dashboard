"use client";

import { useEffect, useState } from "react";
import { MovieResponse, MovieRequest } from "@/services/movieService";
import { fileService } from "@/services/fileService";
import { X, Upload, Loader2, Film, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/movie_dialog";
import { toast } from "sonner";
import FileUpload from "./FileUpload";

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData: MovieResponse | null;
  existingMovies: MovieResponse[];
}

export default function MovieFormModal({ isOpen, onClose, onSave, initialData }: MovieFormModalProps) {
  const [formData, setFormData] = useState<any>({
    title: "",
    duration: 0,
    genre: "",
    posterUrl: "",
    releaseDate: "",
    description: "",
    cast: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.mName,
        duration: initialData.runTime,
        genre: initialData.genres?.join(", ") || "",
        posterUrl: initialData.posterUrl || "",
        releaseDate: initialData.releaseDate || "",
        description: initialData.descript || "",
        cast: initialData.actors?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        duration: 0,
        genre: "",
        posterUrl: "",
        releaseDate: "",
        description: "",
        cast: "",
      });
    }
  }, [initialData, isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const requestData: MovieRequest = {
        mName: formData.title,
        descript: formData.description,
        runTime: formData.duration,
        releaseDate: formData.releaseDate || new Date().toISOString().split("T")[0],
        closingDate: formData.releaseDate || new Date().toISOString().split("T")[0],
        ageRating: "T13",
        posterUrl: formData.posterUrl,
        genreIds: formData.genre.split(",").map((s: string) => s.trim()).filter(Boolean),
        actorIds: formData.cast.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      await onSave(requestData);
      onClose();
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-600" />
            {initialData ? "Cập nhật phim" : "Thêm phim mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8 mt-6">
          {/* Cột trái: Upload Poster */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Poster phim</label>
            <FileUpload
              folderName="movies"
              initialPreviewUrl={formData.posterUrl}
              onUploadSuccess={(url) => setFormData((prev: any) => ({ ...prev, posterUrl: url }))}
              className="aspect-[2/3] rounded-3xl"
              aspect="none"
            />
          </div>

          {/* Cột phải: Thông tin phim */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên phim</label>
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái (Tự động)</label>
                <input
                  disabled
                  value="Tính theo ngày chiếu"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thể loại</label>
              <input
                placeholder="Hành động, Viễn tưởng..."
                value={formData.genre}
                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ngày khởi chiếu
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
              />
            </div>
          </div>

          {/* Hàng dưới: Diễn viên & Mô tả */}
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dàn diễn viên</label>
              <input
                value={formData.cast}
                onChange={e => setFormData({ ...formData, cast: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả phim</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {initialData ? "Cập nhật phim" : "Thêm vào Catalog"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}