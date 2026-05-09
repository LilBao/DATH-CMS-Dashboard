"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { ShowtimeResponse } from '@/services/showtimeService';
import { MovieResponse } from '@/services/movieService';
import { roomService, ScreenRoomResponse } from '@/services/roomService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedShowtime: ShowtimeResponse | null;
  movies: MovieResponse[];
  selectedDate: string;
  selectedBranch: string;
  onSave: (e: React.FormEvent<HTMLFormElement>, payload: any) => void;
  onDelete: () => void;
}

export default function ShowtimeFormDrawer({ 
  isOpen, onClose, selectedShowtime, movies, selectedDate, selectedBranch, onSave, onDelete 
}: Props) {
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState<number | ''>('');
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  const [rooms, setRooms] = useState<ScreenRoomResponse[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Khôi phục dữ liệu khi mở Drawer
  useEffect(() => {
    if (selectedShowtime) {
      const movie = movies.find(m => m.movieId === selectedShowtime.movieId);
      setMovieSearchQuery(movie?.mName || '');
      setSelectedMovieId(selectedShowtime.movieId);
    } else {
      setMovieSearchQuery('');
      setSelectedMovieId('');
    }

    // Load rooms for the selected branch
    const loadRooms = async () => {
      try {
        const allRooms = await roomService.getAll();
        const branchRooms = allRooms.filter(r => String(r.branchId) === selectedBranch);
        setRooms(branchRooms);
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    };
    if (isOpen) loadRooms();
  }, [selectedShowtime, isOpen, movies, selectedBranch]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMovieDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMovies = movies.filter(m => 
    (m.mName || '').toLowerCase().includes(movieSearchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-30 animate-in fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{selectedShowtime ? 'Edit Showtime' : 'Add New Showtime'}</h2>
            <p className="text-xs text-gray-500 font-medium">Update screening details</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form 
          onSubmit={(e) => onSave(e, { movieId: selectedMovieId, movieTitle: movieSearchQuery })} 
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Movie Selection - Chức năng Click để mở danh sách[cite: 5] */}
            <div ref={dropdownRef}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Movie Selection</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={movieSearchQuery}
                  onChange={(e) => {
                    setMovieSearchQuery(e.target.value);
                    setIsMovieDropdownOpen(true);
                  }}
                  onFocus={() => setIsMovieDropdownOpen(true)} // Tự động mở khi bấm vào[cite: 5]
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all" 
                  placeholder="Search or select a movie..." 
                  autoComplete="off"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                {isMovieDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {filteredMovies.length > 0 ? (
                      filteredMovies.map((movie, i) => (
                        <div 
                          key={movie.movieId || i}
                          onClick={() => {
                            setMovieSearchQuery(movie.mName);
                            setSelectedMovieId(movie.movieId);
                            setIsMovieDropdownOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between border-b last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-800">{movie.mName}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase mt-0.5">{movie.genres?.[0]}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm font-medium text-gray-400">No movies found.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                <input name="date" type="date" required defaultValue={selectedShowtime?.day || selectedDate} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Time</label>
                <input name="startTime" type="time" required defaultValue={selectedShowtime?.startTime} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room</label>
              <select name="room" defaultValue={selectedShowtime?.roomId} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none">
                {rooms.length > 0 ? (
                  rooms.map(room => (
                    <option key={room.roomId} value={room.roomId}>{room.rType} - Room {room.roomId}</option>
                  ))
                ) : (
                  <option value="">No rooms available</option>
                )}
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-3">
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm">
              {selectedShowtime ? 'Save Showtime Changes' : 'Add Showtime'}
            </button>
            {selectedShowtime && (
              <button type="button" onClick={onDelete} className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors">
                Remove Screening
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}