"use client";

import { useEffect, useState } from "react";
import { MovieResponse, MovieRequest } from "@/services/movieService";
import { fileService } from "@/services/fileService";
import { catalogService, Genre, Actor, Format } from "@/services/catalogService";
import { X, Upload, Loader2, Film, Clock, Calendar, Plus, Trash2, Layers } from "lucide-react";
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
    genreIds: [] as string[],
    formatIds: [] as string[],
    posterUrl: "",
    trailerUrl: "",
    releaseDate: "",
    closingDate: "",
    ageRating: "T13",
    description: "",
    actorIds: [] as string[],
    isDub: false,
    isSub: true,
  });
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [allActors, setAllActors] = useState<Actor[]>([]);
  const [allFormats, setAllFormats] = useState<Format[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoadingCatalog(true);
        const [genres, actors, formats] = await Promise.all([
          catalogService.getAllGenres(),
          catalogService.getAllActors(),
          catalogService.getAllFormats()
        ]);
        setAllGenres(genres);
        setAllActors(actors);
        setAllFormats(formats);
      } catch (e) {
        console.error("Failed to fetch catalog");
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    if (isOpen) fetchCatalog();

    if (initialData) {
      setFormData({
        title: initialData.mName,
        duration: initialData.runTime,
        genreIds: initialData.genres || [],
        formatIds: initialData.formats || [],
        posterUrl: initialData.posterUrl || "",
        trailerUrl: initialData.trailerUrl || "",
        releaseDate: initialData.releaseDate || "",
        closingDate: initialData.closingDate || "",
        ageRating: initialData.ageRating || "T13",
        description: initialData.descript || "",
        actorIds: initialData.actors || [],
        isDub: initialData.isDub || false,
        isSub: initialData.isSub || false,
      });
    } else {
      setFormData({
        title: "",
        duration: 0,
        genreIds: [],
        formatIds: [],
        posterUrl: "",
        trailerUrl: "",
        releaseDate: "",
        closingDate: "",
        ageRating: "T13",
        description: "",
        actorIds: [],
        isDub: false,
        isSub: true,
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
        isDub: formData.isDub,
        isSub: formData.isSub,
        releaseDate: formData.releaseDate || new Date().toISOString().split("T")[0],
        closingDate: formData.closingDate || new Date().toISOString().split("T")[0],
        ageRating: formData.ageRating,
        posterUrl: formData.posterUrl,
        trailerUrl: formData.trailerUrl,
        genreIds: formData.genreIds,
        formatIds: formData.formatIds,
        actorIds: formData.actorIds,
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân loại tuổi</label>
                <select
                  value={formData.ageRating}
                  onChange={e => setFormData({ ...formData, ageRating: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="K">K (Mọi lứa tuổi)</option>
                  <option value="T13">T13 (Trên 13 tuổi)</option>
                  <option value="T16">T16 (Trên 16 tuổi)</option>
                  <option value="T18">T18 (Trên 18 tuổi)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase">Lồng tiếng</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isDub: !formData.isDub })}
                  className={`w-10 h-5 rounded-full relative transition-all ${formData.isDub ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isDub ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase">Phụ đề</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isSub: !formData.isSub })}
                  className={`w-10 h-5 rounded-full relative transition-all ${formData.isSub ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isSub ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Layers className="w-3 h-3" /> Định dạng phim
              </label>
              <CatalogSelector
                items={allFormats.map(f => f.fName)}
                selectedItems={formData.formatIds}
                onSelect={(id: any) => setFormData({ ...formData, formatIds: [...formData.formatIds, id] })}
                onRemove={(id: any) => setFormData({ ...formData, formatIds: formData.formatIds.filter((fid: string) => fid !== id) })}
                onCreate={async (val: any) => {
                  const newFormat = await catalogService.createFormat(val);
                  setAllFormats([...allFormats, newFormat]);
                  setFormData({ ...formData, formatIds: [...formData.formatIds, newFormat.fName] });
                }}
                onDelete={async (val: any) => {
                  await catalogService.deleteFormat(val);
                  setAllFormats(allFormats.filter(f => f.fName !== val));
                  setFormData({ ...formData, formatIds: formData.formatIds.filter((fid: string) => fid !== val) });
                }}
                placeholder="2D, 3D, IMAX..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thể loại</label>
              <CatalogSelector
                items={allGenres.map(g => g.genre)}
                selectedItems={formData.genreIds}
                onSelect={(id: any) => setFormData({ ...formData, genreIds: [...formData.genreIds, id] })}
                onRemove={(id: any) => setFormData({ ...formData, genreIds: formData.genreIds.filter((gid: string) => gid !== id) })}
                onCreate={async (val: any) => {
                  const newGenre = await catalogService.createGenre(val);
                  setAllGenres([...allGenres, newGenre]);
                  setFormData({ ...formData, genreIds: [...formData.genreIds, newGenre.genre] });
                }}
                onDelete={async (val: any) => {
                  await catalogService.deleteGenre(val);
                  setAllGenres(allGenres.filter(g => g.genre !== val));
                  setFormData({ ...formData, genreIds: formData.genreIds.filter((gid: string) => gid !== val) });
                }}
                placeholder="Chọn hoặc thêm thể loại..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={e => setFormData({ ...formData, closingDate: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trailer URL (Youtube)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.trailerUrl}
                onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Hàng dưới: Diễn viên & Mô tả */}
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dàn diễn viên</label>
              <CatalogSelector
                items={allActors.map(a => a.fullName)}
                selectedItems={formData.actorIds}
                onSelect={(id: any) => setFormData({ ...formData, actorIds: [...formData.actorIds, id] })}
                onRemove={(id: any) => setFormData({ ...formData, actorIds: formData.actorIds.filter((aid: string) => aid !== id) })}
                onCreate={async (val: any) => {
                  const newActor = await catalogService.createActor(val);
                  setAllActors([...allActors, newActor]);
                  setFormData({ ...formData, actorIds: [...formData.actorIds, newActor.fullName] });
                }}
                onDelete={async (val: any) => {
                  await catalogService.deleteActor(val);
                  setAllActors(allActors.filter(a => a.fullName !== val));
                  setFormData({ ...formData, actorIds: formData.actorIds.filter((aid: string) => aid !== val) });
                }}
                placeholder="Chọn hoặc thêm diễn viên..."
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

function CatalogSelector({ items, selectedItems, onSelect, onRemove, onCreate, onDelete, placeholder }: any) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = items.filter((item: string) =>
    item.toLowerCase().includes(query.toLowerCase()) && !selectedItems.includes(item)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map((item: string) => (
          <span key={item} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 border border-indigo-100">
            {item}
            <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove(item)} />
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {isOpen && (query || filtered.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.map((item: string) => (
              <div
                key={item}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition-colors"
                onClick={() => { onSelect(item); setQuery(""); setIsOpen(false); }}
              >
                <span className="text-sm font-bold text-gray-600">{item}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded-lg text-rose-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {query && !items.includes(query) && (
              <div
                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-2 text-indigo-600 transition-colors"
                onClick={() => { onCreate(query); setQuery(""); setIsOpen(false); }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-black italic">Thêm mới: "{query}"</span>
              </div>
            )}
            {filtered.length === 0 && !query && (
              <div className="px-4 py-8 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                Không còn lựa chọn nào
              </div>
            )}
          </div>
        )}
      </div>
      {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />}
    </div>
  );
}