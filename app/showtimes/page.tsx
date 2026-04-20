"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface MovieDB {
  id: string;
  title: string;
  format: string;
}

const mockMoviesDB: MovieDB[] = [
  { id: 'm1', title: 'Dune: Part Two', format: 'IMAX' },
  { id: 'm2', title: 'Oppenheimer', format: 'Standard' },
  { id: 'm3', title: 'Barbie', format: 'Standard' },
  { id: 'm4', title: 'The Marvels', format: '4DX' },
  { id: 'm5', title: 'Killers of the Flower Moon', format: 'Atmos' },
  { id: 'm6', title: 'John Wick: Chapter 4', format: 'Standard' },
  { id: 'm7', title: 'Avatar: The Way of Water', format: 'IMAX' },
  { id: 'm8', title: 'Spider-Man: Across the Spider-Verse', format: 'Standard' },
];

interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  format: string;
  branch: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  theme: 'mint' | 'lavender' | 'blue' | 'red';
  isConflict?: boolean;
}

const mockShowtimes: Showtime[] = [
  { id: 's1', movieId: 'm1', movieTitle: 'Dune: Part Two', format: 'IMAX', branch: 'Central Mall', room: 'Room 04', date: '2023-10-23', startTime: '10:30', endTime: '13:15', theme: 'mint' },
  { id: 's2', movieId: 'm2', movieTitle: 'Oppenheimer', format: 'Standard', branch: 'Central Mall', room: 'Room 12', date: '2023-10-24', startTime: '14:30', endTime: '17:00', theme: 'lavender' },
  { id: 's3', movieId: 'm4', movieTitle: 'The Marvels', format: '4DX', branch: 'Central Mall', room: 'Room 04', date: '2023-10-25', startTime: '12:15', endTime: '14:00', theme: 'red', isConflict: true },
  { id: 's5', movieId: 'm6', movieTitle: 'John Wick: Chapter 4', format: 'Standard', branch: 'Central Mall', room: 'Room 02', date: '2023-10-25', startTime: '15:00', endTime: '18:00', theme: 'blue' },
  { id: 's4', movieId: 'm5', movieTitle: 'Killers of the Flower Moon', format: 'Atmos', branch: 'Central Mall', room: 'Room 01', date: '2023-10-27', startTime: '17:15', endTime: '20:30', theme: 'blue' },
  { id: 's6', movieId: 'm1', movieTitle: 'Dune: Part Two', format: 'IMAX', branch: 'Westside Plaza', room: 'Room 01', date: '2023-10-25', startTime: '09:00', endTime: '12:00', theme: 'mint' },
];

const daysOfWeek = [
  { day: 'Mon', date: '23', fullDate: '2023-10-23' }, { day: 'Tue', date: '24', fullDate: '2023-10-24' }, 
  { day: 'Wed', date: '25', fullDate: '2023-10-25', active: true }, { day: 'Thu', date: '26', fullDate: '2023-10-26' }, 
  { day: 'Fri', date: '27', fullDate: '2023-10-27' }, { day: 'Sat', date: '28', fullDate: '2023-10-28' }, 
  { day: 'Sun', date: '29', fullDate: '2023-10-29' }
];

const hours = Array.from({ length: 16 }, (_, i) => i + 8);

const generateMonthGrid = () => {
  const grid = [];
  let currentDay = 25; 
  for (let i = 0; i < 7; i++) {
    grid.push({ date: currentDay++, isCurrentMonth: false, fullDate: `2023-09-${currentDay-1}` });
  }
  currentDay = 1;
  for (let i = 0; i < 35; i++) {
    const dayStr = String(currentDay).padStart(2, '0');
    grid.push({ date: currentDay, isCurrentMonth: currentDay <= 31, fullDate: `2023-10-${dayStr}` });
    currentDay = currentDay >= 31 ? 1 : currentDay + 1;
  }
  return grid;
};

const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkConflict = (newShowtime: Showtime, existingShowtimes: Showtime[]) => {
  const newStart = timeToMinutes(newShowtime.startTime);
  const newEnd = timeToMinutes(newShowtime.endTime);

  return existingShowtimes.some(existing => {
    if (existing.id === newShowtime.id) return false;
    const isSameLocationAndDate = 
      existing.branch === newShowtime.branch &&
      existing.date === newShowtime.date &&
      existing.room === newShowtime.room;
    if (!isSameLocationAndDate) return false;
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    return (newStart < existingEnd) && (newEnd > existingStart);
  });
};

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>(mockShowtimes);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState('2023-10-25');
  const [selectedBranch, setSelectedBranch] = useState('Central Mall');

  const [formBranch, setFormBranch] = useState('Central Mall');
  
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMovieDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedShowtime) {
      setFormBranch(selectedShowtime.branch);
      setMovieSearchQuery(selectedShowtime.movieTitle);
      setSelectedMovieId(selectedShowtime.movieId);
    } else {
      setFormBranch(selectedBranch);
      setMovieSearchQuery('');
      setSelectedMovieId('');
    }
  }, [selectedShowtime, selectedBranch, isDrawerOpen]);

  const monthGrid = generateMonthGrid();
  const currentBranchShowtimes = showtimes.filter(st => st.branch === selectedBranch);
  
  const filteredMovies = mockMoviesDB.filter(movie => 
    movie.title.toLowerCase().includes(movieSearchQuery.toLowerCase())
  );

  const getStyleForShowtime = (startTime: string, endTime: string, dayIndex: number, mode: 'day' | 'week') => {
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startMinutes = (startParts[0] - 8) * 60 + startParts[1];
    const endMinutes = (endParts[0] - 8) * 60 + endParts[1];
    
    const topPixel = (startMinutes / 60) * 64;
    const heightPixel = ((endMinutes - startMinutes) / 60) * 64;
    
    const leftPercent = mode === 'week' ? (dayIndex / 7) * 100 : 0;
    const widthCalc = mode === 'week' ? 'calc(14.28% - 8px)' : 'calc(100% - 16px)';
    const leftCalc = mode === 'week' ? `calc(${leftPercent}% + 4px)` : '8px';

    return { top: `${topPixel}px`, height: `${heightPixel}px`, left: leftCalc, width: widthCalc };
  };

  const getThemeClasses = (theme: string, isConflict?: boolean) => {
    if (isConflict) return 'bg-[#F76A80]/60 border-l-4 border-[#AC3149] shadow-[0_0_0_2px_white,0_0_0_4px_#AC3149]';
    switch (theme) {
      case 'mint': return 'bg-[#6FFBBE]/60 border-l-4 border-[#006D4A]';
      case 'lavender': return 'bg-[#D4A6FF]/60 border-l-4 border-[#842CD3]';
      case 'blue': return 'bg-[#BABBFF]/60 border-l-4 border-[#4A4BD7]';
      case 'red': return 'bg-[#F76A80]/40 border-l-4 border-[#AC3149]';
      default: return 'bg-gray-100 border-l-4 border-gray-400';
    }
  };

  const getTextColor = (theme: string, isConflict?: boolean) => {
    if (isConflict) return 'text-[#AC3149]';
    switch (theme) {
      case 'mint': return 'text-[#005E3F]';
      case 'lavender': return 'text-[#52008E]';
      case 'blue': return 'text-[#221EB5]';
      case 'red': return 'text-[#AC3149]';
      default: return 'text-gray-700';
    }
  };

  const getHeaderTitle = () => {
    if (viewMode === 'week') return "Oct 23 - Oct 29, 2023";
    if (viewMode === 'month') return "October 2023";
    const dateObj = new Date(selectedDate);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ==================== RENDER VIEWS ==================== */

  const renderDayView = () => {
    const dayShowtimes = currentBranchShowtimes.filter(st => st.date === selectedDate);
    const dayInfo = daysOfWeek.find(d => d.fullDate === selectedDate) || { day: 'Wed', date: '25' };

    return (
      <>
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
          <div className="w-[80px] shrink-0 border-r border-gray-100 flex items-center justify-center bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 tracking-wider">GMT+7</span>
          </div>
          <div className="flex-1 py-3 flex flex-col items-center bg-blue-50/30">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{dayInfo.day}</span>
            <span className="text-xl font-extrabold mt-1 text-blue-600">{dayInfo.date}</span>
          </div>
        </div>
        <div className="flex relative">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {hours.map(hour => (
              <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                <span className="text-[11px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {hours.map(hour => (
                <div key={hour} className="h-[64px] border-b border-gray-100 border-dashed w-full" />
              ))}
            </div>
            {dayShowtimes.map((st) => {
              const style = getStyleForShowtime(st.startTime, st.endTime, 0, 'day');
              const textColor = getTextColor(st.theme, st.isConflict);
              return (
                <div key={st.id} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                  className={`absolute rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses(st.theme, st.isConflict)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-sm leading-tight mb-2 ${textColor}`}>{st.movieTitle}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-white/50 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{st.format}</span>
                        <span className={`text-xs font-medium ${textColor} opacity-80`}>{st.room}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xs ${textColor}`}>{st.startTime} - {st.endTime}</p>
                      {st.isConflict && <p className="text-[10px] font-bold text-[#AC3149] mt-1 bg-white/50 px-2 py-0.5 rounded">⚠️ Schedule Conflict</p>}
                    </div>
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
          <div className="w-[80px] shrink-0 border-r border-gray-100 flex items-center justify-center bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 tracking-wider">GMT+7</span>
          </div>
          {daysOfWeek.map((d, i) => {
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
        <div className="flex relative">
          <div className="w-[80px] shrink-0 border-r border-gray-100 bg-gray-50/50">
            {hours.map(hour => (
              <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                <span className="text-[11px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex pointer-events-none">
              {daysOfWeek.map((_, i) => <div key={i} className="flex-1 border-r border-gray-100 border-dashed" />)}
            </div>
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {hours.map(hour => <div key={hour} className="h-[64px] border-b border-gray-100 border-dashed w-full" />)}
            </div>
            {currentBranchShowtimes.map((st) => {
              const dayIndex = daysOfWeek.findIndex(d => d.fullDate === st.date);
              if (dayIndex === -1) return null;
              const style = getStyleForShowtime(st.startTime, st.endTime, dayIndex, 'week');
              const textColor = getTextColor(st.theme, st.isConflict);

              return (
                <div key={st.id} style={style} onClick={() => { setSelectedShowtime(st); setIsDrawerOpen(true); }}
                  className={`absolute rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all group ${getThemeClasses(st.theme, st.isConflict)}`}
                >
                  <div>
                    <h3 className={`font-bold text-xs leading-tight mb-1.5 line-clamp-2 ${textColor}`}>{st.movieTitle}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-white/50 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{st.format}</span>
                      <span className={`text-[10px] font-medium ${textColor} opacity-80`}>{st.room}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`font-bold text-[10px] ${textColor}`}>{st.startTime} - {st.endTime}</p>
                    {st.isConflict && <p className="text-[9px] font-bold text-[#AC3149] mt-0.5">⚠️ Conflict</p>}
                  </div>
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
        <div className="grid grid-cols-7 bg-white border-b border-gray-200 sticky top-0 z-10">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">{day}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200">
          {monthGrid.map((cell, index) => {
            const dayShowtimes = currentBranchShowtimes.filter(st => st.date === cell.fullDate);
            const isSelected = cell.fullDate === selectedDate;
            
            return (
              <div key={index} onClick={() => { if(cell.isCurrentMonth) setSelectedDate(cell.fullDate); }}
                className={`bg-white p-2 min-h-[100px] overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors ${!cell.isCurrentMonth ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{cell.date}</span>
                  {dayShowtimes.length > 0 && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">{dayShowtimes.length}</span>}
                </div>
                <div className="space-y-1.5">
                  {dayShowtimes.map(st => (
                    <div key={st.id} onClick={(e) => { e.stopPropagation(); setSelectedShowtime(st); setIsDrawerOpen(true); }}
                      className={`text-[10px] px-1.5 py-1 rounded truncate font-bold border-l-2 cursor-pointer hover:brightness-95 ${getThemeClasses(st.theme, st.isConflict)}`}
                    >
                      {st.startTime} - {st.movieTitle}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  /* ==================== ACTION LOGIC ==================== */

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const movieId = formData.get('movieId') as string;
    const movieTitle = formData.get('movieTitle') as string;
    const branch = formData.get('branch') as string;
    const room = formData.get('room') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;

    if (!movieId || !startTime || !date) {
      toast.error('Movie Selection, Date, and Start Time are required!');
      return;
    }

    const startMins = timeToMinutes(startTime);
    const endMins = startMins + 185; 
    const endHours = Math.floor(endMins / 60);
    const endMinutesStr = String(endMins % 60).padStart(2, '0');
    const endTime = `${String(endHours).padStart(2, '0')}:${endMinutesStr}`;

    const newShowtime: Showtime = {
      id: selectedShowtime ? selectedShowtime.id : `s${Date.now()}`,
      movieId: movieId,
      movieTitle: movieTitle,
      format: mockMoviesDB.find(m => m.id === movieId)?.format || 'Standard',
      branch: branch,
      room: room,
      date: date,
      startTime: startTime,
      endTime: endTime,
      theme: selectedShowtime ? selectedShowtime.theme : 'blue',
      isConflict: false 
    };

    if (checkConflict(newShowtime, showtimes)) {
      toast.error("Schedule conflict! Please choose a different time or room.");
      return;
    }

    if (selectedShowtime) {
      setShowtimes(showtimes.map(s => s.id === newShowtime.id ? newShowtime : s));
      toast.success("Showtime updated successfully!");
    } else {
      setShowtimes([...showtimes, newShowtime]);
      toast.success("Showtime added successfully!");
    }
    
    setIsDrawerOpen(false);
  };

  /* ==================== MAIN RENDER ==================== */

  return (
    <div className="relative w-full h-[calc(100vh-100px)] overflow-hidden bg-[#f7f9fb] flex rounded-2xl border border-gray-200">
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
          <div>
            <div className="relative flex items-center gap-2 text-sm text-gray-500 font-bold tracking-wider mb-1 cursor-pointer hover:text-blue-600 group">
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="Central Mall">CENTRAL MALL BRANCH</option>
                <option value="Westside Plaza">WESTSIDE PLAZA BRANCH</option>
              </select>
              <span className="uppercase">{selectedBranch} BRANCH</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{getHeaderTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-xl flex font-medium text-sm">
              <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-lg font-bold transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Day</button>
              <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-lg font-bold transition-all ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Week</button>
              <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-lg font-bold transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Month</button>
            </div>
            <button onClick={() => { setSelectedShowtime(null); setIsDrawerOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Showtime
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white relative custom-scrollbar">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-30" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedShowtime ? 'Edit Showtime' : 'Add New Showtime'}</h2>
                <p className="text-xs text-gray-500 font-medium">Update screening details</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div ref={dropdownRef}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Movie Selection</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    <input type="hidden" name="movieId" value={selectedMovieId} />
                    <input type="hidden" name="movieTitle" value={movieSearchQuery} />
                    
                    <input 
                      type="text" 
                      value={movieSearchQuery}
                      onChange={(e) => {
                        setMovieSearchQuery(e.target.value);
                        setIsMovieDropdownOpen(true);
                        setSelectedMovieId('');
                      }}
                      onFocus={() => setIsMovieDropdownOpen(true)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all" 
                      placeholder="Search or select a movie..." 
                      autoComplete="off"
                    />
                    
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    {isMovieDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {filteredMovies.length > 0 ? (
                          filteredMovies.map(movie => (
                            <div 
                              key={movie.id}
                              onClick={() => {
                                setMovieSearchQuery(movie.title);
                                setSelectedMovieId(movie.id);
                                setIsMovieDropdownOpen(false);
                              }}
                              className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{movie.title}</p>
                                <p className="text-[10px] font-medium text-gray-400 uppercase mt-0.5">{movie.format}</p>
                              </div>
                              {selectedMovieId === movie.id && (
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-sm font-medium text-gray-400">
                            No movies found matching "{movieSearchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Branch</label>
                    <select name="branch" value={formBranch} onChange={(e) => setFormBranch(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer">
                      <option value="Central Mall">Central Mall</option>
                      <option value="Westside Plaza">Westside Plaza</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Room</label>
                    <select name="room" defaultValue={selectedShowtime?.room} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer">
                      <option>Room 01</option>
                      <option>Room 02</option>
                      <option>Room 04</option>
                      <option>Room 12</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="date" type="date" defaultValue={selectedShowtime?.date || selectedDate} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="startTime" type="time" defaultValue={selectedShowtime?.startTime} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1">Estimated End Time</p>
                    <p className="text-[10px] text-gray-500">Based on 165min duration + 20min cleaning</p>
                  </div>
                  <span className="text-base font-extrabold text-blue-700">{selectedShowtime ? selectedShowtime.endTime : '13:15'}</span>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-3">
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                  {selectedShowtime ? 'Save Showtime Changes' : 'Add Showtime'}
                </button>
                {selectedShowtime && (
                  <button 
                    type="button"
                    onClick={() => {
                      setShowtimes(showtimes.filter(s => s.id !== selectedShowtime.id));
                      toast.success("Showtime removed.");
                      setIsDrawerOpen(false);
                    }}
                    className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
                  >
                    Remove Screening
                  </button>
                )}
              </div>
            </form>

          </div>
        </>
      )}
    </div>
  );
}