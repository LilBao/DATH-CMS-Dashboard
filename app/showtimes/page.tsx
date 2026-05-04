"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import ShowtimeFormModal from '../components/ShowtimeFormModal';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getWeekDays = (currentDate: string) => {
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(date.setDate(diff));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: String(d.getDate()).padStart(2, '0'),
      fullDate: formatDate(d)
    };
  });
};

const generateMonthGrid = (currentDate: string) => {
  const date = new Date(currentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const grid = [];
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startOffset);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    grid.push({
      date: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      fullDate: formatDate(d)
    });
  }
  return grid;
};

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
}

interface Showtime {
  id: string;
  movieId: string;
  branchId: string;
  roomId: string;
  date: string;
  time: string;
  theme?: 'mint' | 'lavender' | 'blue' | 'red';
  isConflict?: boolean;
}

const SHOWTIMES_API = 'http://localhost:3001/showtimes';
const MOVIES_API = 'http://localhost:3001/movies';

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-05-04');
  const [selectedBranch, setSelectedBranch] = useState('BR-001');
  const [isLoading, setIsLoading] = useState(true);

  // --- API DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stRes, mvRes] = await Promise.all([fetch(SHOWTIMES_API), fetch(MOVIES_API)]);
        const stData = await stRes.json();
        const mvData = await mvRes.json();
        setShowtimes(Array.isArray(stData) ? stData : []);
        setMovies(Array.isArray(mvData) ? mvData : []);
      } catch (err) {
        toast.error("Không thể tải dữ liệu từ API server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const currentWeek = getWeekDays(selectedDate);
  const monthGrid = generateMonthGrid(selectedDate);
  const currentBranchShowtimes = showtimes.filter(st => st.branchId === selectedBranch);

  // --- ACTION HANDLERS ---
  const handleSaveShowtime = async (e: React.FormEvent<HTMLFormElement>, moviePayload: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      movieId: moviePayload.movieId,
      branchId: selectedBranch,
      roomId: formData.get('room'),
      date: formData.get('date'),
      time: formData.get('startTime'),
    };

    const method = selectedShowtime ? 'PUT' : 'POST';
    const url = selectedShowtime ? `${SHOWTIMES_API}/${selectedShowtime.id}` : SHOWTIMES_API;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Lịch chiếu đã được cập nhật thành công.");
        const updated = await fetch(SHOWTIMES_API);
        setShowtimes(await updated.json());
        setIsDrawerOpen(false);
      }
    } catch (err) {
      toast.error("Lỗi khi đồng bộ dữ liệu.");
    }
  };

  const handleDelete = async () => {
    if (!selectedShowtime) return;
    if (!confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) return;
    try {
      const res = await fetch(`${SHOWTIMES_API}/${selectedShowtime.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowtimes(prev => prev.filter(s => s.id !== selectedShowtime.id));
        toast.success("Đã xóa lịch chiếu khỏi hệ thống.");
        setIsDrawerOpen(false);
      }
    } catch (err) {
      toast.error("Không thể thực hiện lệnh xóa.");
    }
  };

  // --- DISPLAY HELPERS ---
  const getStyleForShowtime = (time: string, dayIndex: number, mode: 'day' | 'week') => {
    if (!time) return {};
    const [h, m] = time.split(':').map(Number);
    const startMinutes = (h - 8) * 60 + m;
    const topPixel = (startMinutes / 60) * 64;
    const heightPixel = (120 / 60) * 64; 
    
    const leftPercent = mode === 'week' ? (dayIndex / 7) * 100 : 0;
    const widthCalc = mode === 'week' ? 'calc(14.28% - 8px)' : 'calc(100% - 16px)';
    const leftCalc = mode === 'week' ? `calc(${leftPercent}% + 4px)` : '8px';

    return { top: `${topPixel}px`, height: `${heightPixel}px`, left: leftCalc, width: widthCalc };
  };

  const getThemeClasses = (theme: string = 'blue', isConflict?: boolean) => {
    if (isConflict) return 'bg-[#F76A80]/60 border-l-4 border-[#AC3149] shadow-lg ring-2 ring-[#AC3149]';
    switch (theme) {
      case 'mint': return 'bg-[#6FFBBE]/60 border-l-4 border-[#006D4A]';
      case 'lavender': return 'bg-[#D4A6FF]/60 border-l-4 border-[#842CD3]';
      case 'red': return 'bg-[#F76A80]/40 border-l-4 border-[#AC3149]';
      default: return 'bg-[#BABBFF]/60 border-l-4 border-[#4A4BD7]';
    }
  };

  const getTextColor = (theme: string = 'blue', isConflict?: boolean) => {
    if (isConflict) return 'text-[#AC3149]';
    switch (theme) {
      case 'mint': return 'text-[#005E3F]';
      case 'lavender': return 'text-[#52008E]';
      case 'red': return 'text-[#AC3149]';
      default: return 'text-[#221EB5]';
    }
  };

  // --- VIEW RENDERING ---
  const renderDayView = () => {
    const dayShowtimes = currentBranchShowtimes.filter(st => st.date === selectedDate);
    const dayInfo = currentWeek.find(d => d.fullDate === selectedDate) || currentWeek[0];

    return (
      <>
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
          <div className="w-[80px] shrink-0 border-r border-gray-100 flex items-center justify-center bg-gray-50/50 text-[10px] font-black text-gray-300">GMT+7</div>
          <div className="flex-1 py-3 flex flex-col items-center bg-blue-50/30">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{dayInfo.day}</span>
            <span className="text-xl font-extrabold mt-1 text-blue-600">{dayInfo.date}</span>
          </div>
        </div>
        <div className="flex relative min-h-[1024px]">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {Array.from({ length: 16 }, (_, i) => i + 8).map(hour => (
              <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                <span className="text-[11px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="h-[64px] border-b border-gray-100 border-dashed w-full" />)}
            </div>
            {dayShowtimes.map((st) => {
              const movie = movies.find(m => m.id === st.movieId);
              const style = getStyleForShowtime(st.time, 0, 'day');
              const textColor = getTextColor(st.theme, st.isConflict);
              return (
                <div key={st.id} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                  className={`absolute rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses(st.theme, st.isConflict)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-sm leading-tight mb-2 ${textColor}`}>{movie?.title || 'Unknown'}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-white/50 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{movie?.genre || 'STD'}</span>
                        <span className={`text-xs font-medium ${textColor} opacity-80`}>{st.roomId}</span>
                      </div>
                    </div>
                    <p className={`font-bold text-xs ${textColor}`}>{st.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderWeekView = () => {
    return (
      <>
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
          <div className="w-[80px] shrink-0 border-r border-gray-100 flex items-center justify-center bg-gray-50/50 text-[10px] font-black text-gray-300">GMT+7</div>
          {currentWeek.map((d, i) => {
            const isActive = d.fullDate === selectedDate;
            return (
              <div key={i} onClick={() => setSelectedDate(d.fullDate)}
                className={`flex-1 border-r border-gray-100 py-3 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50/30' : ''}`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{d.day}</span>
                <span className={`text-xl font-extrabold mt-1 ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>{d.date}</span>
              </div>
            )
          })}
        </div>
        <div className="flex relative min-h-[1024px]">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {Array.from({ length: 16 }, (_, i) => i + 8).map(hour => (
              <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                <span className="text-[11px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative flex">
            <div className="absolute inset-0 flex pointer-events-none">
              {currentWeek.map((_, i) => <div key={i} className="flex-1 border-r border-gray-100 border-dashed" />)}
            </div>
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="h-[64px] border-b border-gray-100 border-dashed w-full" />)}
            </div>
            {currentBranchShowtimes.map((st) => {
              const dayIndex = currentWeek.findIndex(d => d.fullDate === st.date);
              if (dayIndex === -1) return null;
              const movie = movies.find(m => m.id === st.movieId);
              const style = getStyleForShowtime(st.time, dayIndex, 'week');
              const textColor = getTextColor(st.theme, st.isConflict);

              return (
                <div key={st.id} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                  className={`absolute rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses(st.theme, st.isConflict)}`}
                >
                  <div>
                    <h3 className={`font-bold text-xs leading-tight mb-1.5 line-clamp-2 ${textColor}`}>{movie?.title || 'Unknown'}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-white/50 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{movie?.genre || 'STD'}</span>
                      <span className={`text-[10px] font-medium ${textColor} opacity-80`}>{st.roomId}</span>
                    </div>
                  </div>
                  <p className={`font-bold text-[10px] ${textColor}`}>{st.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="flex flex-col h-full bg-gray-100">
        <div className="grid grid-cols-7 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200">
          {monthGrid.map((cell, index) => {
            const dayShowtimes = currentBranchShowtimes.filter(st => st.date === cell.fullDate);
            const isSelected = cell.fullDate === selectedDate;
            
            return (
              <div key={index} onClick={() => { if(cell.isCurrentMonth) setSelectedDate(cell.fullDate); }}
                className={`bg-white p-2 min-h-[120px] overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors ${!cell.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>{cell.date}</span>
                  {dayShowtimes.length > 0 && <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 rounded">{dayShowtimes.length}</span>}
                </div>
                <div className="space-y-1">
                  {dayShowtimes.map(st => {
                    const movie = movies.find(m => m.id === st.movieId);
                    return (
                      <div key={st.id} onClick={(e) => { e.stopPropagation(); setSelectedShowtime(st); setIsDrawerOpen(true); }}
                        className={`text-[9px] px-1.5 py-1 rounded truncate font-bold bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500`}
                      >
                        {st.time} - {movie?.title || 'Movie'}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // --- FINAL RENDER ---
  if (isLoading) return <div className="w-full h-screen flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[4px]">Syncing Cinemas...</div>;

  return (
    <div className="relative w-full h-[calc(100vh-100px)] overflow-hidden bg-[#f7f9fb] flex rounded-2xl border border-gray-200 shadow-sm">
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
          <div>
            <div className="relative flex items-center gap-2 text-[11px] text-indigo-500 font-bold tracking-[2px] mb-1 cursor-pointer group">
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                <option value="BR-001">GRAND PLAZA BRANCH</option>
                <option value="BR-002">STARLIGHT BRANCH</option>
              </select>
              <span className="uppercase">{selectedBranch} BRANCH</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <h1 className="text-2xl font-black text-[#2d3337] tracking-tight">{viewMode === 'week' ? "Weekly Programming" : selectedDate}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-sm shadow-inner">
              {['day', 'week', 'month'].map((m) => (
                <button key={m} onClick={() => setViewMode(m as any)} className={`px-5 py-1.5 rounded-lg transition-all capitalize ${viewMode === m ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={() => { setSelectedShowtime(null); setIsDrawerOpen(true); }} className="bg-[#4a4bd7] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> Add Showtime
            </button>
          </div>
        </div>

        {/* CALENDAR CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white relative custom-scrollbar">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </div>
      </div>

      {/* FORM MODAL COMPONENT */}
      <ShowtimeFormModal 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedShowtime={selectedShowtime}
        movies={movies}
        selectedDate={selectedDate}
        selectedBranch={selectedBranch}
        onSave={handleSaveShowtime}
        onDelete={handleDelete}
      />

    </div>
  );
}