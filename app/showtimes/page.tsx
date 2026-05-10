"use client";

import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// Import Services
import { showtimeService, ShowtimeResponse } from '@/services/showtimeService';
import { movieService, MovieResponse } from '@/services/movieService';
import { branchService, BranchResponse } from '@/services/branchService';

import ShowtimeFormModal from '../components/ShowtimeFormModal';
import { ConfirmModal } from '../components/ui/confirm-modal';

const timeToMinutes = (time: string) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getShowtimeRange = (st: ShowtimeResponse) => {
  const start = timeToMinutes(st.startTime);
  const endMin = timeToMinutes(st.endTime);
  // Nếu endTime là 00:00 hoặc không có, mặc định cộng 120 phút (2 tiếng)
  const end = (endMin <= start) ? start + 120 : endMin;
  return { start, end };
};

const areOverlapping = (st1: ShowtimeResponse, st2: ShowtimeResponse) => {
  const r1 = getShowtimeRange(st1);
  const r2 = getShowtimeRange(st2);
  return r1.start < r2.end && r2.start < r1.end;
};

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

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-05-04');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // State cho Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const managerBranchId = user?.branchId;

  // --- API DATA LOADING USING SERVICES ---
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stData, mvData, brData] = await Promise.all([
        showtimeService.getAll(),
        movieService.getAll(),
        branchService.getAll()
      ]);
      setShowtimes(Array.isArray(stData) ? stData : []);
      setMovies(Array.isArray(mvData) ? mvData : []);
      setBranches(Array.isArray(brData) ? brData : []);

      if (isManager && (managerBranchId !== undefined && managerBranchId !== null)) {
        setSelectedBranch(String(managerBranchId));
      } else if (Array.isArray(brData) && brData.length > 0 && !selectedBranch) {
        setSelectedBranch(String(brData[0].branchId));
      }
    } catch (err) {
      toast.error("Không thể tải dữ liệu từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentWeek = getWeekDays(selectedDate);
  const monthGrid = generateMonthGrid(selectedDate);
  const currentBranchShowtimes = showtimes.filter(st => st.branchId === Number(selectedBranch));

  // --- ACTION HANDLERS ---
  const handleSaveShowtime = async (e: React.FormEvent<HTMLFormElement>, moviePayload: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload: any = {
      movieId: moviePayload.movieId,
      branchId: Number(selectedBranch),
      roomId: Number(formData.get('room')),
      day: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: "00:00", // temp
      formatName: "2D",
    };

    try {
      if (selectedShowtime) {
        await showtimeService.update(selectedShowtime.timeId, payload);
        toast.success("Lịch chiếu đã được cập nhật thành công.");
      } else {
        await showtimeService.create(payload);
        toast.success("Lịch chiếu mới đã được tạo thành công.");
      }
      await loadData(); // Reload data to sync UI
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error("Lỗi khi lưu dữ liệu lên hệ thống.");
    }
  };

  const handleDelete = () => {
    if (!selectedShowtime) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedShowtime) return;
    try {
      await showtimeService.delete(selectedShowtime.timeId);
      setShowtimes(prev => prev.filter(s => s.timeId !== selectedShowtime.timeId));
      toast.success("Đã xóa lịch chiếu khỏi hệ thống.");
      setIsDrawerOpen(false);
      setIsConfirmOpen(false);
    } catch (err) {
      toast.error("Không thể thực hiện lệnh xóa.");
      throw err;
    }
  };

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() + direction);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() + direction);
    }
    setSelectedDate(formatDate(date));
  };

  const handleToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  // --- DISPLAY HELPERS ---
  const getStyleForShowtime = (st: ShowtimeResponse, dayIndex: number, mode: 'day' | 'week', colIndex: number, totalCols: number) => {
    const { start, end } = getShowtimeRange(st);
    const startMinutes = start; // Offset by 0 AM
    const topPixel = (startMinutes / 60) * 64;
    const heightPixel = ((end - start) / 60) * 64;

    const baseWidth = mode === 'week' ? (100 / 7) : 100;
    const itemWidth = baseWidth / totalCols;
    const leftBase = mode === 'week' ? (dayIndex * (100 / 7)) : 0;

    const leftCalc = `calc(${leftBase + (colIndex * itemWidth)}% + 4px)`;
    const widthCalc = `calc(${itemWidth}% - 8px)`;

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
    const dayShowtimes = currentBranchShowtimes.filter(st => st.day === selectedDate);
    const dayInfo = currentWeek.find(d => d.fullDate === selectedDate) || currentWeek[0];

    // Overlap logic
    const sorted = [...dayShowtimes].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const columns: ShowtimeResponse[][] = [];
    sorted.forEach(st => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const last = columns[i][columns[i].length - 1];
        if (!areOverlapping(last, st)) {
          columns[i].push(st);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([st]);
    });

    return (
      <>
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
          <div className="w-[80px] shrink-0 border-r border-gray-100 flex items-center justify-center bg-gray-50/50 text-[10px] font-black text-gray-300">GMT+7</div>
          <div className="flex-1 py-3 flex flex-col items-center bg-blue-50/30">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{dayInfo.day}</span>
            <span className="text-xl font-extrabold mt-1 text-blue-600">{dayInfo.date}</span>
          </div>
        </div>
        <div className="flex relative min-h-[1536px]">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {Array.from({ length: 24 }, (_, i) => i).map(hour => (
              <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                <span className="text-[11px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {Array.from({ length: 24 }).map((_, i) => <div key={i} className="h-[64px] border-b border-gray-100 border-dashed w-full" />)}
            </div>
            {columns.map((col, colIndex) => (
              col.map((st, i) => {
                const movie = movies.find(m => m.movieId === st.movieId);
                const textColor = getTextColor('blue', false);
                const style = getStyleForShowtime(st, 0, 'day', colIndex, columns.length);
                return (
                  <div key={st.timeId || `col-${colIndex}-${i}`} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                    className={`absolute rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses('blue', false)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="overflow-hidden">
                        <h3 className={`font-bold text-sm leading-tight mb-2 truncate ${textColor}`}>{st.movieName || movie?.mName || 'Unknown'}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-white/50 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{movie?.genres?.[0] || 'STD'}</span>
                          <span className={`text-xs font-medium ${textColor} opacity-80`}>Room {st.roomId}</span>
                        </div>
                      </div>
                      <p className={`font-bold text-xs ${textColor}`}>{st.startTime}</p>
                    </div>
                  </div>
                );
              })
            ))}
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
        <div className="flex relative min-h-[1536px]">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {Array.from({ length: 24 }, (_, i) => i).map(hour => (
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
              {Array.from({ length: 24 }).map((_, i) => <div key={i} className="h-[64px] border-b border-gray-100 border-dashed w-full" />)}
            </div>
            {currentWeek.map((day, dayIndex) => {
              const dayShowtimes = currentBranchShowtimes.filter(st => st.day === day.fullDate);
              const sorted = [...dayShowtimes].sort((a, b) => a.startTime.localeCompare(b.startTime));
              const columns: ShowtimeResponse[][] = [];
              sorted.forEach(st => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                  const last = columns[i][columns[i].length - 1];
                  if (!areOverlapping(last, st)) {
                    columns[i].push(st);
                    placed = true;
                    break;
                  }
                }
                if (!placed) columns.push([st]);
              });

              return columns.map((col, colIndex) => (
                col.map((st, i) => {
                  const movie = movies.find(m => m.movieId === st.movieId);
                  const style = getStyleForShowtime(st, dayIndex, 'week', colIndex, columns.length);
                  const textColor = getTextColor('blue', false);

                  return (
                    <div key={st.timeId || `col-${dayIndex}-${colIndex}-${i}`} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                      className={`absolute rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses('blue', false)}`}
                    >
                      <div className="overflow-hidden">
                        <h3 className={`font-bold text-[10px] leading-tight mb-1.5 line-clamp-2 ${textColor}`}>{st.movieName || movie?.mName || 'Unknown'}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-white/50 text-gray-800 text-[8px] font-bold px-1 py-0.5 rounded uppercase">{movie?.genres?.[0] || 'STD'}</span>
                          <span className={`text-[9px] font-medium ${textColor} opacity-80`}>R{st.roomId}</span>
                        </div>
                      </div>
                      <p className={`font-bold text-[9px] ${textColor}`}>{st.startTime}</p>
                    </div>
                  );
                })
              ));
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
            const dayShowtimes = currentBranchShowtimes.filter(st => st.day === cell.fullDate);
            const isSelected = cell.fullDate === selectedDate;

            return (
              <div key={index} onClick={() => { if (cell.isCurrentMonth) setSelectedDate(cell.fullDate); }}
                className={`bg-white p-2 min-h-[120px] overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors ${!cell.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>{cell.date}</span>
                  {dayShowtimes.length > 0 && <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 rounded">{dayShowtimes.length}</span>}
                </div>
                <div className="space-y-1">
                  {dayShowtimes.map((st, i) => {
                    const movie = movies.find(m => m.movieId === st.movieId);
                    return (
                      <div key={st.timeId || i} onClick={(e) => { e.stopPropagation(); setSelectedShowtime(st); setIsDrawerOpen(true); }}
                        className={`text-[9px] px-1.5 py-1 rounded truncate font-bold bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500`}
                      >
                        {st.startTime} - {st.movieName || movie?.mName || 'Movie'}
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
  if (isLoading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[4px]">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
      Syncing Cinemas...
    </div>
  );

  return (
    <div className="relative w-full h-[calc(100vh-100px)] overflow-hidden bg-[#f7f9fb] flex rounded-2xl border border-gray-200 shadow-sm">

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
          <div>
            <div className={`relative flex items-center gap-2 text-[11px] text-indigo-500 font-bold tracking-[2px] mb-1 group ${isManager ? 'opacity-80' : 'cursor-pointer'}`}>
              {!isManager && (
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                  {branches.map(br => (
                    <option key={br.branchId} value={String(br.branchId)}>{br.bName.toUpperCase()}</option>
                  ))}
                </select>
              )}
              <span className="uppercase">{branches.find(b => String(b.branchId) === selectedBranch)?.bName || 'SELECT BRANCH'}</span>
              {!isManager && <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-black text-[#2d3337] tracking-tight">
                {viewMode === 'month' ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                 viewMode === 'week' ? "Weekly Programming" : selectedDate}
              </h1>
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 ml-2">
                <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleToday} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                  Today
                </button>
                <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa suất chiếu"
        description={`Bạn có chắc chắn muốn xóa suất chiếu này? Hành động này sẽ gỡ bỏ lịch chiếu khỏi hệ thống và có thể ảnh hưởng đến các đơn hàng liên quan.`}
      />
    </div>
  );
}