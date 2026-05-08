"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Clock, User, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { shiftService, Shift } from '@/services/shiftService';
import { employeeService, Employee } from '@/services/employeeService';

// Tạo mảng 7 ngày trong tuần dựa trên ngày hiện tại
const generateWorkWeek = (baseDate: Date) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Bắt đầu từ thứ 2
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      day: format(date, 'EEE'), // Mon, Tue...
      date: format(date, 'dd'), // 01, 02...
      fullDate: format(date, 'yyyy-MM-dd'),
      isToday: isSameDay(date, new Date())
    };
  });
};

const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 -> 23:00

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dbEmployees, setDbEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Grand Plaza');
  
  // State quản lý ngày hiển thị (Mặc định là tuần hiện tại)
  const [currentDate] = useState(new Date());
  const daysOfWeek = useMemo(() => generateWorkWeek(currentDate), [currentDate]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  // Load dữ liệu thực từ Backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [shiftRes, empRes] = await Promise.all([
        shiftService.getShifts(),
        employeeService.getAll()
      ]);
      setShifts(shiftRes);
      setDbEmployees(empRes);
    } catch (err) {
      toast.error('Không thể kết nối với máy chủ API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => s.branch === selectedBranch);
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
    return { top: `${topPixel}px`, height: `${heightPixel}px` };
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'lavender': return 'bg-[#d4a6ff]/30 border-l-4 border-[#842cd3] text-[#52008e] hover:bg-[#d4a6ff]/50';
      case 'mint': return 'bg-[#6ffbbe]/30 border-l-4 border-[#006d4a] text-[#005e3f] hover:bg-[#6ffbbe]/50';
      case 'blue': return 'bg-[#babbff]/30 border-l-4 border-[#4a4bd7] text-[#221eb5] hover:bg-[#babbff]/50';
      default: return 'bg-orange-100/50 border-l-4 border-orange-500 text-orange-800';
    }
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      employeeName: employeeSearchQuery,
      role: formData.get('role') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      branch: selectedBranch,
      theme: selectedShift?.theme || (['blue', 'mint', 'lavender', 'orange'][Math.floor(Math.random() * 4)] as "blue" | "mint" | "lavender" | "orange")
    };

    try {
      await shiftService.saveShift(payload, selectedShift?.id);
      toast.success("Lịch làm việc đã được cập nhật!");
      await loadData();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('Lỗi khi lưu ca làm việc');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift || !confirm("Xóa ca làm này khỏi lịch?")) return;
    try {
      await shiftService.deleteShift(selectedShift.id);
      setShifts(prev => prev.filter(s => s.id !== selectedShift.id));
      toast.success("Đã xóa ca làm.");
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('Không thể xóa dữ liệu');
    }
  };

  if (isLoading) return <div className="w-full h-screen flex items-center justify-center font-black text-gray-300 animate-pulse tracking-[5px]">INITIALIZING REAL-TIME SCHEDULE...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-10">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight uppercase">Shift Planner</h1>
          <p className="text-sm text-[#596063] font-bold uppercase tracking-widest">
            {format(currentDate, 'MMMM yyyy')} &bull; {selectedBranch}
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedBranch} 
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-white border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Grand Plaza">Grand Plaza</option>
            <option value="Starlight">Starlight Cinema</option>
          </select>
          <button 
            onClick={() => { setSelectedShift(null); setEmployeeSearchQuery(''); setIsDrawerOpen(true); }}
            className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Giao ca mới
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[750px]">
        {/* Header Day */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 sticky top-0 z-20">
          <div className="w-20 shrink-0 border-r border-gray-100 flex items-end justify-center pb-2">
            <span className="text-[10px] font-black text-gray-300">GMT+7</span>
          </div>
          {daysOfWeek.map((d, i) => (
            <div key={i} className={`flex-1 border-r border-gray-100 py-5 flex flex-col items-center ${d.isToday ? 'bg-indigo-50/40' : ''}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d.isToday ? 'text-indigo-600' : 'text-gray-400'}`}>{d.day}</span>
              <span className={`text-xl font-black ${d.isToday ? 'bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-md' : 'text-gray-700'}`}>
                {d.date}
              </span>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex relative min-h-[1024px]">
            <div className="w-20 shrink-0 border-r border-gray-100 bg-gray-50/5">
              {hours.map(hour => (
                <div key={hour} className="h-[64px] border-b border-gray-50 flex justify-center py-2 relative">
                  <span className="text-[10px] font-bold text-gray-400 -mt-5">{hour.toString().padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative flex">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex-1 border-r border-gray-50 relative group">
                  {filteredShifts.filter(s => s.date === d.fullDate).map((shift) => (
                    <div 
                      key={shift.id} 
                      style={getStyleForShift(shift.startTime, shift.endTime)}
                      onClick={() => { setSelectedShift(shift); setEmployeeSearchQuery(shift.employeeName); setIsDrawerOpen(true); }}
                      className={`absolute left-1 right-1 rounded-xl p-3 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden z-10 shadow-sm border ${getThemeClasses(shift.theme)}`}
                    >
                      <p className="font-black text-xs leading-tight truncate">{shift.employeeName}</p>
                      <p className="font-bold text-[9px] opacity-70">{shift.startTime} - {shift.endTime}</p>
                      <p className="mt-auto text-[8px] font-black uppercase tracking-widest bg-white/50 w-fit px-1.5 py-0.5 rounded">{shift.role}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Form */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{selectedShift ? 'Cập nhật ca' : 'Phân ca mới'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X /></button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tìm nhân viên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    value={employeeSearchQuery}
                    onChange={(e) => { setEmployeeSearchQuery(e.target.value); setIsEmployeeDropdownOpen(true); }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Gõ tên để tìm..." 
                    required
                  />
                  {isEmployeeDropdownOpen && employeeSearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vị trí</label>
                  <select name="role" defaultValue={selectedShift?.role || "Staff"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none">
                    <option value="Manager">Manager</option>
                    <option value="Projectionist">Projectionist</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ngày làm việc</label>
                  <input name="date" type="date" defaultValue={selectedShift?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bắt đầu</label>
                  <input name="startTime" type="time" defaultValue={selectedShift?.startTime || "09:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kết thúc</label>
                  <input name="endTime" type="time" defaultValue={selectedShift?.endTime || "17:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận phân ca"}
                </button>
                {selectedShift && (
                  <button type="button" onClick={handleDeleteShift} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all">Gỡ khỏi lịch</button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}