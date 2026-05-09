import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Subtitles, MicVocal, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/movie_dialog";

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movieData: any) => void;
  existingMovies: any[];
  initialData?: any | null;
}

export default function MovieFormModal({ isOpen, onClose, onSave, existingMovies, initialData }: MovieFormModalProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [cast, setCast] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action']);
  const [selectedFormat, setSelectedFormat] = useState('Standard');
  const [hasSubtitles, setHasSubtitles] = useState(true);
  const [hasDubbing, setHasDubbing] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [closingDate, setClosingDate] = useState('');

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterError, setPosterError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const maxAllowedDate = `${currentYear + 2}-12-31`;

  const genres = ['Action', 'Sci-Fi', 'Drama', 'Comedy', '+ More'];
  const formats = ['Standard', 'IMAX', '4DX'];

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || '');
      setDuration(initialData.duration ? String(initialData.duration) : '');
      setCast(initialData.cast || '');
      setDescription(initialData.description || '');
      setSelectedGenres(initialData.genre ? initialData.genre.split(', ') : ['Action']);
      setPosterPreview(initialData.posterUrl || null);
      setReleaseDate('');
      setClosingDate('');
      setPosterError('');
    } else if (isOpen && !initialData) {
      resetForm();
    }
  }, [isOpen, initialData]);

  const toggleGenre = (genre: string) => {
    if (genre === '+ More') return;
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPosterError('');

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setPosterError('Invalid format. Please upload JPG, PNG, or SVG.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setPosterError('File is too large. Maximum size is 3MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPosterPreview(previewUrl);
  };

  const removePoster = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosterPreview(null);
    setPosterError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCast('');
    setDuration('');
    setSelectedGenres(['Action']);
    setSelectedFormat('Standard');
    setReleaseDate('');
    setClosingDate('');
    setPosterPreview(null);
    setPosterError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSaveClick = () => {
    if (!title.trim()) {
      toast.error('Movie Title is required!');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required!');
      return;
    }
    if (!cast.trim()) {
      toast.error('Cast information is required!');
      return;
    }
    if (!duration || Number(duration) <= 0) {
      toast.error('Please enter a valid runtime!');
      return;
    }
    if (!posterPreview) {
      toast.error('Please upload a movie poster!');
      return;
    }
    if (!releaseDate) {
      toast.error('Release Date is required!');
      return;
    }
    if (!closingDate) {
      toast.error('Closing Date is required!');
      return;
    }

    const isDuplicateTitle = existingMovies.some(
      movie => movie.title.toLowerCase() === title.trim().toLowerCase() && movie.id !== initialData?.id
    );
    if (isDuplicateTitle) {
      toast.error('A movie with this title already exists in the catalog!');
      return;
    }

    const isDuplicateDesc = existingMovies.some(
      movie => movie.description && movie.description.toLowerCase() === description.trim().toLowerCase() && movie.id !== initialData?.id
    );
    if (isDuplicateDesc) {
      toast.error('Another movie already uses this exact description!');
      return;
    }

    const movieDataToSave = {
      id: initialData ? initialData.id : 'm' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      cast: cast.trim(),
      duration: Number(duration),
      genre: selectedGenres.join(', '),
      status: (releaseDate > today) ? "Coming Soon" : "Now Showing",
      posterUrl: posterPreview
    };

    onSave(movieDataToSave);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: any) => !open && handleClose()}>
      <DialogContent className="bg-white sm:max-w-3xl p-0 gap-0 overflow-hidden h-[90vh] flex flex-col rounded-2xl">
        <DialogHeader className="px-8 py-5 border-b border-gray-100 bg-white shrink-0 z-10">
          <DialogTitle className="text-2xl font-extrabold text-[#2d3337]">
            {initialData ? 'Edit Movie' : 'Add New Movie'}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-gray-500 mt-1">
            Configure movie details and scheduling
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Basic Information</h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Movie Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="Enter movie name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                placeholder="Brief synopsis of the movie..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cast (Actors)</label>
              <input
                type="text"
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="e.g. Timothée Chalamet, Zendaya..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Runtime (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Age Rating</label>
                <select className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer">
                  <option>P (General)</option>
                  <option>C13 (13+)</option>
                  <option>C16 (16+)</option>
                  <option>C18 (18+)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Media</h3>

            <div className="flex gap-6">
              <div className="flex flex-col gap-2">
                <label
                  className={`relative w-[160px] shrink-0 aspect-[2/3] border-2 ${posterError ? 'border-red-400 bg-red-50' : 'border-dashed border-gray-300 bg-[#f4f6f8] hover:bg-blue-50 hover:border-blue-400'} rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer text-gray-500 group overflow-hidden`}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />

                  {posterPreview ? (
                    <>
                      <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <p className="text-white text-sm font-bold">Change Image</p>
                      </div>
                      <button
                        onClick={removePoster}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImagePlus className={`w-8 h-8 mb-2 ${posterError ? 'text-red-400' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                      <p className={`text-sm font-bold ${posterError ? 'text-red-500' : 'text-gray-600 group-hover:text-blue-600'}`}>Upload Poster</p>
                    </>
                  )}
                </label>
                {posterError && <p className="text-xs text-red-500 font-medium w-[160px] text-center leading-tight">{posterError}</p>}
              </div>

              <div className="flex-1 bg-[#f4f6f8] rounded-2xl p-6 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full">Aspect ratio: 2:3</li>
                  <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full">Resolution: 800×1200 min</li>
                  <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full">Max file size: 3MB</li>
                  <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full">Format: JPG, PNG, SVG</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Classification & Details</h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedGenres.includes(genre)
                        ? 'bg-[#4338ca] text-white shadow-md'
                        : 'bg-[#f4f6f8] text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Formats</label>
              <div className="flex gap-4">
                {formats.map(format => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedFormat === format
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-transparent bg-[#f4f6f8] text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Language Options</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#f4f6f8] rounded-xl cursor-pointer" onClick={() => setHasSubtitles(!hasSubtitles)}>
                  <div className="flex items-center gap-3">
                    <Subtitles className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-800">Subtitles available</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${hasSubtitles ? 'bg-[#4338ca] justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#f4f6f8] rounded-xl cursor-pointer" onClick={() => setHasDubbing(!hasDubbing)}>
                  <div className="flex items-center gap-3">
                    <MicVocal className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-800">Dubbing available</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${hasDubbing ? 'bg-[#4338ca] justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Screening Schedule</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Release Date</label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    max={maxAllowedDate}
                    value={releaseDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val > maxAllowedDate) {
                        setReleaseDate(maxAllowedDate);
                      } else {
                        setReleaseDate(val);
                      }
                      if (closingDate && val > closingDate) {
                        setClosingDate('');
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Closing Date</label>
                <div className="relative">
                  <input
                    type="date"
                    min={releaseDate || today}
                    max={maxAllowedDate}
                    value={closingDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val > maxAllowedDate) {
                        setClosingDate(maxAllowedDate);
                      } else {
                        setClosingDate(val);
                      }
                    }}
                    disabled={!releaseDate}
                    className="w-full px-4 py-3 bg-[#f4f6f8] text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="px-8 py-5 border-t border-gray-100 bg-white shrink-0 grid grid-cols-2 gap-4">
          <button
            onClick={handleClose}
            className="w-full py-4 rounded-xl font-bold text-gray-800 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="w-full py-4 rounded-xl font-bold bg-[#4338ca] text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Save Movie
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}