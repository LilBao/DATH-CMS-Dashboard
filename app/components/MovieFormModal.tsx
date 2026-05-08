"use client";

import { useEffect, useState } from "react";
import { Movie } from "@/services/movieService";
import { fileService } from "@/services/fileService";
import { X, Upload, Loader2, Film, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/movie_dialog";
import { toast } from "sonner";

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData: Movie | null;
  existingMovies: Movie[];
}

export default function MovieFormModal({ isOpen, onClose, onSave, initialData }: MovieFormModalProps) {
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: "",
    duration: 0,
    genre: "",
    status: "Now Showing",
    posterUrl: "",
    releaseDate: "",
    description: "",
    cast: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        duration: 0,
        genre: "",
        status: "Now Showing",
        posterUrl: "",
        releaseDate: "",
        description: "",
        cast: "",
      });
    }
  }, [initialData, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Upload vào folder movies
      const url = await fileService.uploadFile(file, "movies");
      setFormData(prev => ({ ...prev, posterUrl: url }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
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
            <div className="relative aspect-[2/3] rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
              {formData.posterUrl ? (
                <>
                  <img src={formData.posterUrl} className="w-full h-full object-cover" alt="Poster" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-xl font-bold text-xs">Thay đổi ảnh</label>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /> : <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />}
                  <p className="text-xs font-bold text-gray-400">Click để tải lên ảnh Poster</p>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
            </div>
          </div>

          {/* Cột phải: Thông tin phim */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên phim</label>
              <input 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
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
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                >
                  <option value="Now Showing">Đang chiếu</option>
                  <option value="Coming Soon">Sắp chiếu</option>
                  <option value="Ended">Đã kết thúc</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thể loại</label>
              <input 
                placeholder="Hành động, Viễn tưởng..."
                value={formData.genre}
                onChange={e => setFormData({...formData, genre: e.target.value})}
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
                onChange={e => setFormData({...formData, releaseDate: e.target.value})}
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
                onChange={e => setFormData({...formData, cast: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả phim</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
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
              disabled={isSaving || isUploading}
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