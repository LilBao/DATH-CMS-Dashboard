"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, User, CalendarDays, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  branchId: string;
}

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
  { day: 'Mon', date: '04', fullDate: '2026-05-04', isToday: true }, 
  { day: 'Tue', date: '05', fullDate: '2026-05-05' }, 
  { day: 'Wed', date: '06', fullDate: '2026-05-06' }, 
  { day: 'Thu', date: '07', fullDate: '2026-05-07' }, 
  { day: 'Fri', date: '08', fullDate: '2026-05-08' }, 
  { day: 'Sat', date: '09', fullDate: '2026-05-09' }, 
  { day: 'Sun', date: '10', fullDate: '2026-05-10' }
];

const hours = Array.from({ length: 16 }, (_, i) => i + 8);
const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dbEmployees, setDbEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('Grand Plaza');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = 'http://localhost:3001/shifts';
  const EMP_API = 'http://localhost:3001/employees';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftRes, empRes] = await Promise.all([fetch(API_URL), fetch(EMP_API)]);
        const shiftData = await shiftRes.json();
        const empData = await empRes.json();
        setShifts(Array.isArray(shiftData) ? shiftData : []);
        setDbEmployees(Array.isArray(empData) ? empData : []);
      } catch (err) {
        toast.error('Failed to connect to API server at port 3001');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => s.branch.includes(selectedBranch));
  }, [shifts, selectedBranch]);

  const filteredEmployees = dbEmployees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const getStyleForShift = (startTime: string, endTime: string) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const gridStartMins = 8 * 60; 
    const topPixel = ((startMins - gridStartMins) / 60) * 64;
    const heightPixel = ((endMins - startMins) / 60) * 64;
    return { top: `${topPixel}px`, height: `${heightPixel}px`, left: '4px', right: '4px' };
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'lavender': return 'bg-[#d4a6ff]/30 border-l-4 border-[#842cd3] text-[#52008e] hover:bg-[#d4a6ff]/50';
      case 'mint': return 'bg-[#6ffbbe]/30 border-l-4 border-[#006d4a] text-[#005e3f] hover:bg-[#6ffbbe]/50';
      case 'blue': return 'bg-[#babbff]/30 border-l-4 border-[#4a4bd7] text-[#221eb5] hover:bg-[#babbff]/50';
      default: return 'bg-gray-100 border-l-4 border-gray-400 text-gray-700';
    }
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newShiftData = {
      employeeName: employeeSearchQuery,
      role: formData.get('role'),
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      branch: selectedBranch,
      theme: selectedShift?.theme || 'lavender'
    };

    try {
      const method = selectedShift ? 'PUT' : 'POST';
      const url = selectedShift ? `${API_URL}/${selectedShift.id}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShiftData)
      });

      if (res.ok) {
        toast.success("Schedule saved successfully!");
        const updatedRes = await fetch(API_URL);
        setShifts(await updatedRes.json());
        setIsDrawerOpen(false);
      }
    } catch (err) {
      toast.error('API Error: Could not save shift.');
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift || !confirm("Delete this shift?")) return;
    try {
      await fetch(`${API_URL}/${selectedShift.id}`, { method: 'DELETE' });
      setShifts(shifts.filter(s => s.id !== selectedShift.id));
      toast.success("Shift removed.");
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('API Error: Could not delete.');
    }
  };

  if (isLoading) return <div className="w-full h-screen flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-widest">Initialising Schedule...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-10">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight">Work Shifts</h1>
          <p className="text-sm text-[#596063] font-medium uppercase tracking-wider">Weekly coverage for {selectedBranch}</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedBranch} 
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold outline-none shadow-sm"
          >
            <option value="Grand Plaza">Grand Plaza</option>
            <option value="Starlight">Starlight Cinema</option>
          </select>
          <button 
            onClick={() => { setSelectedShift(null); setEmployeeSearchQuery(''); setIsDrawerOpen(true); }}
            className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Shift
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[700px]">
        {/* Day Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 sticky top-0 z-20">
          <div className="w-20 shrink-0 border-r border-gray-100 flex items-end justify-center pb-2">
            <span className="text-[10px] font-black text-gray-300">GMT+7</span>
          </div>
          {daysOfWeek.map((d, i) => (
            <div key={i} className={`flex-1 border-r border-gray-100 py-4 flex flex-col items-center ${d.isToday ? 'bg-indigo-50/30' : ''}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d.isToday ? 'text-indigo-600' : 'text-gray-400'}`}>{d.day}</span>
              <span className={`text-xl font-black ${d.isToday ? 'bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl rotate-3' : 'text-gray-700'}`}>
                {d.date}
              </span>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex relative min-h-[1024px]">
            <div className="w-20 shrink-0 border-r border-gray-100 bg-gray-50/10">
              {hours.map(hour => (
                <div key={hour} className="h-[64px] border-b border-gray-50 flex justify-center py-2 relative">
                  <span className="text-[10px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative flex">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex-1 border-r border-gray-50 relative">
                  {filteredShifts.filter(s => s.date === d.fullDate).map((shift) => (
                    <div 
                      key={shift.id} 
                      style={getStyleForShift(shift.startTime, shift.endTime)}
                      onClick={() => { setSelectedShift(shift); setEmployeeSearchQuery(shift.employeeName); setIsDrawerOpen(true); }}
                      className={`absolute rounded-xl p-3 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden z-10 shadow-sm border ${getThemeClasses(shift.theme)}`}
                    >
                      <p className="font-black text-xs leading-tight">{shift.employeeName}</p>
                      <p className="font-bold text-[9px] opacity-70">{shift.startTime} - {shift.endTime}</p>
                      <p className="mt-auto text-[8px] font-black uppercase tracking-widest bg-white/40 w-fit px-1.5 py-0.5 rounded">{shift.role}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Form[cite: 2] */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{selectedShift ? 'Edit Schedule' : 'Assign New Shift'}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Staff Coordination</p>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div ref={employeeDropdownRef}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Employee</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    value={employeeSearchQuery}
                    onChange={(e) => { setEmployeeSearchQuery(e.target.value); setIsEmployeeDropdownOpen(true); }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Staff name..." 
                  />
                  {isEmployeeDropdownOpen && employeeSearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                      {filteredEmployees.map(emp => (
                        <div key={emp.id} onClick={() => { setEmployeeSearchQuery(emp.name); setIsEmployeeDropdownOpen(false); }} className="p-3 hover:bg-indigo-50 cursor-pointer font-bold text-sm text-gray-700">
                          {emp.name} <span className="text-[10px] text-gray-400 ml-2">({emp.role})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role</label>
                  <select name="role" defaultValue={selectedShift?.role} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none">
                    <option>Manager</option>
                    <option>Projectionist</option>
                    <option>Cashier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                  <input name="date" type="date" defaultValue={selectedShift?.date || "2026-05-04"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start</label>
                  <input name="startTime" type="time" defaultValue={selectedShift?.startTime || "09:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End</label>
                  <input name="endTime" type="time" defaultValue={selectedShift?.endTime || "17:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" />
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Changes</button>
                {selectedShift && (
                  <button type="button" onClick={handleDeleteShift} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all">Delete Shift</button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}