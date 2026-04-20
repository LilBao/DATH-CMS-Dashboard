"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, User, CalendarDays, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  branch: string;
  salary: number;
  manager: string;
  avatarUrl: string;
  theme: 'lavender' | 'mint' | 'blue';
}

const mockEmployees: Employee[] = [
  { id: 'EMP-4291', name: 'Elena Rodriguez', role: 'Manager', branch: 'Downtown Plaza', salary: 5400, manager: 'Alex Rivera', avatarUrl: 'https://i.pravatar.cc/150?u=4291', theme: 'lavender' },
  { id: 'EMP-3108', name: 'Marcus Chen', role: 'Projectionist', branch: 'Downtown Plaza', salary: 3200, manager: 'Elena Rodriguez', avatarUrl: 'https://i.pravatar.cc/150?u=3108', theme: 'mint' },
  { id: 'EMP-1922', name: 'Sarah Jenkins', role: 'Box Office', branch: 'Downtown Plaza', salary: 2800, manager: 'David Kim', avatarUrl: 'https://i.pravatar.cc/150?u=1922', theme: 'blue' },
  { id: 'EMP-1123', name: 'David Kim', role: 'Cashier', branch: 'Downtown Plaza', salary: 2500, manager: 'Elena Rodriguez', avatarUrl: 'https://i.pravatar.cc/150?u=1123', theme: 'lavender' },
  { id: 'EMP-5512', name: 'Alex Rivera', role: 'Box Office', branch: 'Downtown Plaza', salary: 2900, manager: 'David Kim', avatarUrl: 'https://i.pravatar.cc/150?u=5512', theme: 'mint' },
];

interface Shift {
  id: string;
  employeeName: string;
  role: string;
  branch: string;
  date: string;
  startTime: string;
  endTime: string;
  theme: 'blue' | 'mint' | 'lavender' | 'orange';
}

const daysOfWeek = [
  { day: 'Mon', date: '23', fullDate: '2023-10-23' }, 
  { day: 'Tue', date: '24', fullDate: '2023-10-24' }, 
  { day: 'Wed', date: '25', fullDate: '2023-10-25', isToday: true }, 
  { day: 'Thu', date: '26', fullDate: '2023-10-26' }, 
  { day: 'Fri', date: '27', fullDate: '2023-10-27' }, 
  { day: 'Sat', date: '28', fullDate: '2023-10-28' }, 
  { day: 'Sun', date: '29', fullDate: '2023-10-29' }
];

const hours = Array.from({ length: 16 }, (_, i) => i + 8);

/* ==================== LOGIC FUNCTIONS ==================== */

const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkConflict = (newShift: Shift, existingShifts: Shift[]) => {
  const newStart = timeToMinutes(newShift.startTime);
  const newEnd = timeToMinutes(newShift.endTime);

  return existingShifts.some(existing => {
    if (existing.id === newShift.id) return false;
    const isSameLocationDateEmployee = 
      existing.branch === newShift.branch &&
      existing.date === newShift.date &&
      existing.employeeName === newShift.employeeName;
      
    if (!isSameLocationDateEmployee) return false;
    
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    return (newStart < existingEnd) && (newEnd > existingStart);
  });
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('Downtown Plaza');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = 'http://localhost:3001/shifts';

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setShifts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load API data.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedShift) {
      setEmployeeSearchQuery(selectedShift.employeeName);
    } else {
      setEmployeeSearchQuery('');
    }
  }, [selectedShift, isDrawerOpen]);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => s.branch === selectedBranch);
  }, [shifts, selectedBranch]);

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const getStyleForShift = (startTime: string, endTime: string) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const gridStartMins = 8 * 60; 
    
    const topPixel = ((startMins - gridStartMins) / 60) * 64;
    const heightPixel = ((endMins - startMins) / 60) * 64;

    return {
      top: `${topPixel}px`,
      height: `${heightPixel}px`,
      left: '4px',
      right: '4px',
    };
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'lavender': return 'bg-[#d4a6ff]/30 border-l-4 border-[#842cd3] text-[#52008e] hover:bg-[#d4a6ff]/50';
      case 'mint': return 'bg-[#6ffbbe]/30 border-l-4 border-[#006d4a] text-[#005e3f] hover:bg-[#6ffbbe]/50';
      case 'blue': return 'bg-[#babbff]/30 border-l-4 border-[#4a4bd7] text-[#221eb5] hover:bg-[#babbff]/50';
      case 'orange': return 'bg-[#ffd3a6]/30 border-l-4 border-[#d35a00] text-[#8e3900] hover:bg-[#ffd3a6]/50';
      default: return 'bg-gray-100 border-l-4 border-gray-400 text-gray-700';
    }
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const employeeName = formData.get('employeeName') as string;
    const role = formData.get('role') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    if (!employeeName || !startTime || !endTime) {
      toast.error('Employee, Start Time, and End Time are required!');
      return;
    }

    const newShift: Shift = {
      id: selectedShift ? selectedShift.id : `sh-${Date.now()}`,
      employeeName, role, date, startTime, endTime,
      branch: selectedBranch,
      theme: selectedShift ? selectedShift.theme : 'blue'
    };

    if (checkConflict(newShift, shifts)) {
      toast.error('Schedule conflict detected for this employee!');
      return;
    }

    try {
      if (selectedShift) {
        await fetch(`${API_URL}/${selectedShift.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newShift)
        });
        setShifts(shifts.map(s => s.id === newShift.id ? newShift : s));
        toast.success("Shift updated successfully!");
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newShift)
        });
        setShifts([...shifts, newShift]);
        toast.success("Shift added successfully!");
      }
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('API Error: Could not save shift.');
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;
    try {
      await fetch(`${API_URL}/${selectedShift.id}`, { method: 'DELETE' });
      setShifts(shifts.filter(s => s.id !== selectedShift.id));
      toast.success("Shift deleted.");
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('API Error: Could not delete shift.');
    }
  };

  /* ==================== MAIN RENDER ==================== */

  if (isLoading) {
    return <div className="w-full flex items-center justify-center h-screen font-bold text-gray-400">Loading API Data...</div>;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Work Shifts</h1>
          <p className="text-base text-[#596063] mt-1">Weekly scheduling and staff coverage.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedBranch} 
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer shadow-sm"
          >
            <option>Downtown Plaza</option>
            <option>Eastside Mall</option>
            <option>Harbor View</option>
          </select>
          <button 
            onClick={() => { setSelectedShift(null); setIsDrawerOpen(true); }}
            className="bg-[#4a4bd7] shadow-[0_10px_15px_-3px_#c7d2fe] hover:bg-blue-700 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
          >
            <Plus className="w-5 h-5" /> Add Shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8 shrink-0">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Scheduled Shifts</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-gray-900">{filteredShifts.length}</span>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md">This Week</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Staff on Duty</p>
          <div className="flex items-end justify-between w-full">
            <span className="text-3xl font-black text-gray-900">{new Set(filteredShifts.map(s => s.employeeName)).size}</span>
            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-md">Active</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Hours</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-gray-900">56<span className="text-lg text-gray-400 font-bold ml-1">hrs</span></span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Est. Labor Cost</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-gray-900">$1,240</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative min-h-[600px]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">Today</button>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5"/></button>
            </div>
            <h2 className="text-xl font-bold text-gray-800 ml-2">October 2023</h2>
          </div>
          <select className="border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-bold text-gray-700 outline-none">
            <option>Week View</option>
            <option>Day View</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-white">
          
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
            <div className="w-[60px] shrink-0 border-r border-gray-100 flex items-end justify-center pb-2 bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-400">GMT+7</span>
            </div>
            {daysOfWeek.map((d, i) => (
              <div key={i} className="flex-1 border-r border-gray-100 py-3 flex flex-col items-center">
                <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${d.isToday ? 'text-blue-600' : 'text-gray-500'}`}>{d.day}</span>
                <span className={`text-2xl font-black ${d.isToday ? 'bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          <div className="flex relative min-h-[1024px]">
            
            <div className="w-[60px] shrink-0 border-r border-gray-100 bg-gray-50/50">
              {hours.map(hour => (
                <div key={hour} className="h-[64px] border-b border-gray-100 flex justify-center py-2 relative">
                  <span className="text-[10px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative flex">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex-1 border-r border-gray-100 relative">
                  <div className="absolute inset-0 pointer-events-none flex flex-col">
                    {hours.map(hour => (
                      <div key={hour} className="h-[64px] border-b border-gray-50 w-full" />
                    ))}
                  </div>

                  {filteredShifts.filter(s => s.date === d.fullDate).map((shift) => (
                    <div 
                      key={shift.id} 
                      style={getStyleForShift(shift.startTime, shift.endTime)}
                      onClick={() => { setSelectedShift(shift); setIsDrawerOpen(true); }}
                      className={`absolute rounded-lg p-2 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden z-10 ${getThemeClasses(shift.theme)}`}
                    >
                      <p className="font-bold text-xs leading-tight line-clamp-1">{shift.employeeName}</p>
                      <p className="font-medium text-[10px] leading-none opacity-80">{shift.startTime} - {shift.endTime}</p>
                      <p className="font-bold text-[9px] mt-auto uppercase tracking-wide opacity-90">{shift.role}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.08)] z-50 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="px-8 py-6 flex justify-between items-start bg-gray-50/50 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-1">
                  {selectedShift ? 'Edit Shift' : 'Add New Shift'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Assign staff to schedule</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
                
                <div ref={employeeDropdownRef}>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Employee</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="hidden" name="employeeName" value={employeeSearchQuery} />
                    <input 
                      type="text" 
                      value={employeeSearchQuery}
                      onChange={(e) => {
                        setEmployeeSearchQuery(e.target.value);
                        setIsEmployeeDropdownOpen(true);
                      }}
                      onFocus={() => setIsEmployeeDropdownOpen(true)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium transition-all" 
                      placeholder="Search or enter name..." 
                      autoComplete="off"
                    />
                    
                    {isEmployeeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map(emp => (
                            <div 
                              key={emp.id}
                              onClick={() => {
                                setEmployeeSearchQuery(emp.name);
                                setIsEmployeeDropdownOpen(false);
                              }}
                              className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{emp.name}</p>
                                <p className="text-[10px] font-medium text-gray-400 uppercase mt-0.5">{emp.role}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-sm font-medium text-gray-400">
                            No employees found matching "{employeeSearchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                  <select name="role" defaultValue={selectedShift?.role || "Box Office"} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium appearance-none cursor-pointer transition-all">
                    <option>Manager</option>
                    <option>Projectionist</option>
                    <option>Box Office</option>
                    <option>Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="date" type="date" defaultValue={selectedShift?.date || "2023-10-25"} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium cursor-pointer transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="startTime" type="time" defaultValue={selectedShift?.startTime || "09:00"} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium cursor-pointer transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">End Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="endTime" type="time" defaultValue={selectedShift?.endTime || "17:00"} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium cursor-pointer transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex flex-col gap-3 mt-auto shrink-0">
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                  {selectedShift ? 'Save Shift' : 'Assign Shift'}
                </button>
                {selectedShift && (
                  <button 
                    type="button"
                    onClick={handleDeleteShift}
                    className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
                  >
                    Delete Shift
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