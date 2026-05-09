"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Clock, User, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shiftService, WorkShift } from '@/services/shiftService';
import { employeeService, EmployeeResponse } from '@/services/employeeService';
import { branchService, BranchResponse } from '@/services/branchService';
import { useAuthStore } from '@/stores/authStore';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';
import { ConfirmModal } from '@/app/components/ui/confirm-modal';

// Tạo mảng 7 ngày trong tuần dựa trên ngày hiện tại
const generateWorkWeek = (baseDate: Date) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      day: format(date, 'EEE'),
      date: format(date, 'dd'),
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

const areShiftsOverlapping = (s1: WorkShift, s2: WorkShift) => {
  const start1 = timeToMinutes(s1.startTime);
  const end1 = timeToMinutes(s1.endTime);
  const start2 = timeToMinutes(s2.startTime);
  const end2 = timeToMinutes(s2.endTime);
  return start1 < end2 && start2 < end1;
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [dbEmployees, setDbEmployees] = useState<EmployeeResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');

  const { user } = useAuthStore();
  const rawRole = user?.role || "";
  const isManager = rawRole.toUpperCase() === 'MANAGER' || rawRole.toUpperCase() === 'ROLE_MANAGER';
  const managerBranchId = user?.branchId;

  useEffect(() => {
    console.log("Workshift - Role:", rawRole);
    console.log("Workshift - Branch ID:", managerBranchId);
  }, [rawRole, managerBranchId]);

  // State quản lý ngày hiển thị (Mặc định là tuần hiện tại)
  const [currentDate] = useState(new Date());
  const daysOfWeek = useMemo(() => generateWorkWeek(currentDate), [currentDate]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  // State cho Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  // Load dữ liệu thực từ Backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [shiftRes, empRes, branchRes] = await Promise.all([
        (isManager && managerBranchId !== undefined && managerBranchId !== null) 
          ? shiftService.getByBranch(managerBranchId)
          : shiftService.getAll(),
        (isManager && managerBranchId !== undefined && managerBranchId !== null)
          ? employeeService.getByBranch(managerBranchId)
          : employeeService.getAll(),
        branchService.getAll()
      ]);
      setShifts(Array.isArray(shiftRes) ? shiftRes : []);
      setDbEmployees(empRes);
      setBranches(branchRes);

      if (isManager && (managerBranchId !== undefined && managerBranchId !== null)) {
        setSelectedBranchId(managerBranchId);
      } else if (branchRes.length > 0 && selectedBranchId === '') {
        setSelectedBranchId(branchRes[0].branchId);
      }
    } catch (err) {
      toast.error('Không thể kết nối với máy chủ API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload shifts when branch changes (for Admin)
  useEffect(() => {
    if (!isManager && selectedBranchId !== '' && selectedBranchId !== undefined) {
      const reloadShifts = async () => {
        try {
          const shiftRes = await shiftService.getByBranch(selectedBranchId as number);
          setShifts(Array.isArray(shiftRes) ? shiftRes : []);
        } catch (e) {
          console.error("Failed to reload shifts for branch:", selectedBranchId);
        }
      };
      reloadShifts();
    }
  }, [selectedBranchId, isManager]);

  const filteredShifts = useMemo(() => {
    return shifts; // Backend trả về toàn bộ ca, UI sẽ tự phân bổ theo wDate
  }, [shifts]);

  const filteredEmployees = dbEmployees.filter(emp =>
    emp.eName.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const getStyleForShift = (startTime: string, endTime: string, colIndex: number, totalCols: number) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const gridStartMins = 8 * 60;
    const topPixel = ((startMins - gridStartMins) / 60) * 64;
    const heightPixel = ((endMins - startMins) / 60) * 64;
    
    const width = 100 / totalCols;
    const left = colIndex * width;

    return { 
      top: `${topPixel}px`, 
      height: `${heightPixel}px`,
      left: `${left}%`,
      width: `calc(${width}% - 2px)`
    };
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

    const dateStr = formData.get('date') as string;
    const dateObj = new Date(dateStr);
    const jsDay = dateObj.getDay();
    const wDate = jsDay === 0 ? 7 : jsDay; // 1 (Mon) -> 7 (Sun)

    const payload: WorkShift = {
      startTime: formData.get('startTime') as string + ":00",
      endTime: formData.get('endTime') as string + ":00",
      wDate: wDate,
      work: `${employeeSearchQuery} (${formData.get('role')})` // Tạm thời lưu thông tin vào 'work'
    };

    try {
      if (selectedShift) {
        await shiftService.update(selectedShift.startTime, selectedShift.endTime, selectedShift.wDate, payload);
      } else {
        // Sử dụng API phân ca cho nhân viên cụ thể
        const targetEmployee = dbEmployees.find(e => e.eUserId === employeeSearchQuery);
        if (targetEmployee) {
          await employeeService.assignWorkShifts(targetEmployee.eUserId, [payload]);
        } else {
          // Fallback nếu không chọn nhân viên
          await shiftService.create(payload);
        }
      }
      toast.success("Lịch làm việc đã được cập nhật!");
      await loadData();
      setIsDrawerOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi lưu ca làm việc';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShift = () => {
    if (!selectedShift) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedShift) return;
    try {
      // Nếu có nhân viên được chọn (employeeSearchQuery đang giữ ID), thực hiện unassign
      if (employeeSearchQuery) {
        await employeeService.unassignWorkShift(
          employeeSearchQuery, 
          selectedShift.startTime, 
          selectedShift.endTime, 
          selectedShift.wDate
        );
        toast.success("Đã gỡ nhân viên khỏi ca làm.");
      } else {
        // Nếu không có nhân viên cụ thể, xóa ca làm chung (nếu Backend cho phép)
        await shiftService.delete(selectedShift.startTime, selectedShift.endTime, selectedShift.wDate);
        toast.success("Đã xóa ca làm.");
      }
      
      await loadData();
      setIsDrawerOpen(false);
      setIsConfirmOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Không thể thực hiện yêu cầu xóa/gỡ ca';
      toast.error(errorMsg);
      throw err;
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
            {format(currentDate, 'MMMM yyyy')} &bull; {branches.find(b => b.branchId === selectedBranchId)?.bName}
          </p>
        </div>
        <div className="flex gap-3">
          {!isManager && (
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(Number(e.target.value))}
              className="bg-white border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {branches.map(br => (
                <option key={br.branchId} value={br.branchId}>{br.bName}</option>
              ))}
            </select>
          )}
          {isManager && (
            <div className="bg-indigo-50 px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 border border-indigo-100 flex items-center">
              {branches.find(b => b.branchId === selectedBranchId)?.bName}
            </div>
          )}
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
              {daysOfWeek.map((d, i) => {
                const jsDay = new Date(d.fullDate).getDay();
                const wDate = jsDay === 0 ? 7 : jsDay;
                return (
                  <div key={i} className="flex-1 border-r border-gray-50 relative group">
                    {(() => {
                      const dayShifts = filteredShifts.filter(s => s.wDate === wDate);
                      const sorted = [...dayShifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
                      const columns: WorkShift[][] = [];

                      sorted.forEach(shift => {
                        let placed = false;
                        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                          const lastInCol = columns[colIdx][columns[colIdx].length - 1];
                          if (!areShiftsOverlapping(lastInCol, shift)) {
                            columns[colIdx].push(shift);
                            placed = true;
                            break;
                          }
                        }
                        if (!placed) columns.push([shift]);
                      });

                      return columns.flatMap((col, colIndex) => 
                        col.map((shift, idx) => (
                          <div
                            key={`${shift.wDate}-${shift.startTime}-${colIndex}-${idx}`}
                            style={getStyleForShift(shift.startTime, shift.endTime, colIndex, columns.length)}
                            onClick={() => { 
                              setSelectedShift(shift); 
                              const empInfo = shift.work.split(' (')[0];
                              const targetEmp = dbEmployees.find(e => e.eName === empInfo);
                              setEmployeeSearchQuery(targetEmp?.eUserId || ''); 
                              setIsDrawerOpen(true); 
                            }}
                            className={`absolute rounded-xl p-3 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden z-10 shadow-sm border ${getThemeClasses('blue')}`}
                          >
                            <p className="font-black text-[10px] leading-tight truncate">
                              {shift.employees && shift.employees.length > 0 
                                ? shift.employees.map(e => e.eName).join(', ')
                                : shift.work}
                            </p>
                            <p className="font-bold text-[9px] opacity-70">{shift.startTime.substring(0,5)} - {shift.endTime.substring(0,5)}</p>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                );
              })}
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
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Chọn nhân viên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 z-10" />
                  <select
                    value={employeeSearchQuery}
                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {dbEmployees.map((emp) => (
                      <option key={emp.eUserId} value={emp.eUserId}>
                        {emp.eName} ({emp.userType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vị trí</label>
                  <select name="role" defaultValue={selectedShift?.work.split(' (')[1]?.replace(')', '') || "STAFF"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none uppercase">
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ngày làm việc</label>
                  <input name="date" type="date" defaultValue={
                    selectedShift 
                      ? daysOfWeek.find(d => {
                          const jsDay = new Date(d.fullDate).getDay();
                          return (jsDay === 0 ? 7 : jsDay) === selectedShift.wDate;
                        })?.fullDate 
                      : format(new Date(), 'yyyy-MM-dd')
                  } className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bắt đầu</label>
                  <input name="startTime" type="time" defaultValue={selectedShift?.startTime.substring(0, 5) || "09:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kết thúc</label>
                  <input name="endTime" type="time" defaultValue={selectedShift?.endTime.substring(0, 5) || "17:00"} className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" required />
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
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa ca làm"
        description={`Bạn có chắc chắn muốn gỡ ca làm này (${selectedShift?.startTime} - ${selectedShift?.endTime}) khỏi lịch không?`}
      />
    </div>
  );
}