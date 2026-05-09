"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, RotateCcw, Save, X, ChevronDown, Building2, Loader2, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { roomService, ScreenRoomResponse, SeatRequest } from '@/services/roomService';
import { branchService, BranchResponse } from '@/services/branchService';
import { useAuthStore } from '@/stores/authStore';

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

type UISeat = SeatRequest & { _id: string; _status: 'available' | 'disabled' | 'selected' };

// Helper tạo ghế mặc định
const generateSeatsByCapacity = (capacity: number, branchId: number, roomId: number): UISeat[] => {
  const seats: UISeat[] = [];
  const colsPerRow = 10;
  for (let i = 0; i < capacity; i++) {
    const rowIndex = Math.floor(i / colsPerRow);
    const colIndex = (i % colsPerRow) + 1;
    const rowLabel = rows[rowIndex] || `R${rowIndex}`;
    seats.push({ 
      branchId, roomId, sRow: rowIndex + 1, sColumn: colIndex, 
      sType: 1, sStatus: true,
      _id: `${rowLabel}${colIndex}`, _status: 'available' 
    });
  }
  return seats;
};

export default function RoomsSeatsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [rooms, setRooms] = useState<ScreenRoomResponse[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<number | ''>('');
  const [activeRoomId, setActiveRoomId] = useState<number | ''>('');
  const [seats, setSeats] = useState<UISeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);

  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const managerBranchId = user?.branchId;

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [roomData, branchData] = await Promise.all([
          roomService.getAll(),
          branchService.getAll()
        ]);
        const rawRooms = Array.isArray(roomData) ? roomData : [];
        const rawBranches = Array.isArray(branchData) ? branchData : [];
        
        setRooms(rawRooms);
        setBranches(rawBranches);
        
        if (isManager && (managerBranchId !== undefined && managerBranchId !== null)) {
          setActiveBranchId(managerBranchId);
        } else if (rawBranches.length > 0) {
          setActiveBranchId(rawBranches[0].branchId);
        }
      } catch (error) {
        toast.error("Lỗi kết nối hệ thống dữ liệu phòng.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRooms = useMemo(() => 
    rooms.filter(r => r.branchId === activeBranchId), 
  [rooms, activeBranchId]);

  useEffect(() => {
    if (filteredRooms.length > 0) setActiveRoomId(filteredRooms[0].roomId);
    else { setActiveRoomId(''); setSeats([]); }
  }, [activeBranchId, filteredRooms]);

  // Load Layout của phòng được chọn
  useEffect(() => {
    const loadSeats = async () => {
      const activeRoom = rooms.find(r => r.roomId === activeRoomId);
      if (activeRoom && activeBranchId !== '') {
        try {
          const dbSeats = await roomService.getSeats(activeBranchId as number, activeRoom.roomId);
          if (dbSeats && dbSeats.length > 0) {
            // Chuyển đổi SeatResponse sang UISeat
            const uiSeats: UISeat[] = dbSeats.map(s => {
              const rowLabel = rows[s.sRow - 1] || `R${s.sRow}`;
              let status: 'available' | 'disabled' | 'selected' = 'available';
              if (!s.sStatus) status = 'disabled';
              else if (s.sType === 2) status = 'selected'; // VIP
              else if (s.sType === 3) status = 'selected'; // Sweetbox (Dùng tạm selected UI)
              
              return {
                ...s,
                _id: `${rowLabel}${s.sColumn}`,
                _status: status
              };
            });
            setSeats(uiSeats);
          } else {
            // Nếu chưa có ghế trên DB, tạo mặc định
            setSeats(generateSeatsByCapacity(activeRoom.rCapacity, activeBranchId as number, activeRoom.roomId));
          }
        } catch (error) {
          console.error("Lỗi khi tải sơ đồ ghế:", error);
          setSeats(generateSeatsByCapacity(activeRoom.rCapacity, activeBranchId as number, activeRoom.roomId));
        }
      }
    };
    loadSeats();
  }, [activeRoomId, rooms, activeBranchId]);

  const handleSeatClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat._id === id) {
        if (seat._status === 'disabled') return { ...seat, _status: 'available', sType: 1, sStatus: true };
        
        // Cycle: Standard (1) -> VIP (2) -> Sweetbox (3) -> Standard (1)
        let nextType = 1;
        let nextStatus: 'available' | 'selected' = 'available';

        if (seat.sType === 1) { nextType = 2; nextStatus = 'selected'; }
        else if (seat.sType === 2) { nextType = 3; nextStatus = 'selected'; }
        else { nextType = 1; nextStatus = 'available'; }

        return { ...seat, _status: nextStatus, sType: nextType };
      }
      return seat;
    }));
  };

  const handleSeatDoubleClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat._id === id) return { ...seat, _status: 'disabled', sStatus: false };
      return seat;
    }));
  };

  const handleSave = async () => {
    if (!activeRoomId || !activeBranchId) {
      toast.error("Không tìm thấy ID phòng để lưu!");
      return;
    }

    setIsSaving(true);
    const finalCapacity = seats.filter(s => s._status !== 'disabled').length;

    try {
      const payload = seats.map(({ _id, _status, ...rest }) => rest);
      await roomService.updateLayout(activeBranchId as number, activeRoomId as number, payload);
      
      setRooms(prev => prev.map(r => r.roomId === activeRoomId ? { ...r, rCapacity: finalCapacity } : r));
      toast.success("Đã đồng bộ sơ đồ phòng!");
    } catch (error: any) {
      console.error("Lỗi chi tiết từ Server:", error.response?.data || error.message);
      toast.error(`Lưu thất bại: ${error.response?.data?.message || "Lỗi kết nối API"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeBranchId) return;
    const formData = new FormData(e.currentTarget);
    const cap = Number(formData.get('capacity'));
    const newRoomData = {
      rType: formData.get('type') as string,
      rCapacity: cap,
      branchId: activeBranchId as number,
      roomId: Math.floor(Math.random() * 10000), // temp
      basePrice: 50000,
      totalSeats: cap
    };
    try {
      const created = await roomService.create(newRoomData);
      setRooms(prev => [...prev, created]);
      setActiveRoomId(created.roomId);
      setIsNewRoomDialogOpen(false);
      toast.success("Thêm phòng chiếu thành công!");
    } catch (error) {
      toast.error("Không thể tạo phòng mới.");
    }
  };

  const handleDeleteRoom = async (branchId: number, roomId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng chiếu này?")) return;
    try {
      await roomService.delete(branchId, roomId);
      setRooms(prev => prev.filter(r => !(r.branchId === branchId && r.roomId === roomId)));
      if (activeRoomId === roomId) setActiveRoomId('');
      toast.success("Đã xóa phòng chiếu.");
    } catch (error) {
      toast.error("Lỗi khi xóa phòng.");
    }
  };

  if (isLoading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Mapping Theater Grid...</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <div className={`relative flex items-center gap-2 text-[11px] text-indigo-500 font-black tracking-[2px] mb-2 group bg-indigo-50 w-fit px-3 py-1 rounded-lg ${isManager ? '' : 'cursor-pointer'}`}>
            <Building2 className="w-3.5 h-3.5" />
            {!isManager && (
              <select value={activeBranchId} onChange={(e) => setActiveBranchId(Number(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                {branches.map((b, i) => <option key={b.branchId || i} value={b.branchId}>{b.bName?.toUpperCase() || `BRANCH ${b.branchId}`}</option>)}
              </select>
            )}
            <span className="uppercase">{branches.find(b => b.branchId === activeBranchId)?.bName || 'SELECT BRANCH'}</span>
            {!isManager && <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-all" />}
          </div>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Rooms & Seats</h1>
        </div>
        <button onClick={() => setIsNewRoomDialogOpen(true)} className="bg-[#4a4bd7] hover:bg-indigo-700 shadow-xl shadow-indigo-100 px-6 py-3.5 rounded-2xl font-black text-white flex items-center gap-2 transition-all text-xs uppercase tracking-widest">
          <Plus className="w-5 h-5" /> THÊM PHÒNG CHIẾU
        </button>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Sidebar - Room List */}
        <div className="w-[350px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {filteredRooms.length > 0 ? filteredRooms.map((room, i) => (
            <div key={room.roomId || i} onClick={() => setActiveRoomId(room.roomId)}
              className={`p-6 rounded-[24px] cursor-pointer transition-all border-2 group/card relative ${activeRoomId === room.roomId ? 'bg-white border-indigo-600 shadow-xl scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${activeRoomId === room.roomId ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{room.rType}</span>
                <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.branchId, room.roomId); }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-800 leading-tight mb-4 uppercase">Room {room.roomId}</h3>
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                <span className="text-[10px] font-black text-gray-400 uppercase">Sức chứa</span>
                <p className="text-sm font-black text-gray-900">{room.rCapacity} <span className="text-[10px] text-gray-500 font-bold uppercase ml-1">Ghế</span></p>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">Chi nhánh chưa có phòng</div>
          )}
        </div>

        {/* Main Seat Map Editor */}
        <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          {activeRoomId ? (
            <>
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-lg bg-indigo-500" /><span className="text-[10px] font-black text-gray-400 uppercase">Thường</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-lg bg-purple-600" /><span className="text-[10px] font-black text-gray-400 uppercase">VIP</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-lg bg-rose-500" /><span className="text-[10px] font-black text-gray-400 uppercase">Sweetbox</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-lg bg-gray-300" /><span className="text-[10px] font-black text-gray-400 uppercase">Hỏng/Khóa</span></div>
                </div>
                <div className="bg-gray-200/50 p-1.5 rounded-2xl flex items-center shadow-inner">
                  <button onClick={() => setIsBulkMode(true)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isBulkMode ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500'}`}>Chế độ Sửa</button>
                  <button onClick={() => setIsBulkMode(false)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isBulkMode ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500'}`}>Xem trước</button>
                </div>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-12 bg-gradient-to-b from-indigo-50/20 to-transparent overflow-auto custom-scrollbar">
                {/* Sơ đồ màn hình */}
                <div className="mb-16 w-full max-w-[700px] shrink-0">
                   <div className="h-2 w-full bg-indigo-600 rounded-full shadow-[0_10px_30px_rgba(74,75,215,0.4)]" />
                   <div className="text-center mt-4 text-[11px] font-black text-indigo-300 uppercase tracking-[10px]">MÀN HÌNH CHÍNH</div>
                </div>

                <div className="grid grid-cols-10 gap-4 p-8 bg-white/50 rounded-[40px] border border-white/50 backdrop-blur-sm">
                  {seats.map((seat, i) => (
                    <div 
                      key={seat._id || i}
                      onClick={() => handleSeatClick(seat._id)}
                      onDoubleClick={() => handleSeatDoubleClick(seat._id)}
                      className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center transition-all duration-300 select-none shadow-sm font-black text-xs border-2 border-white/20
                        ${seat._status === 'disabled' ? 'bg-gray-200 text-gray-400 opacity-30 cursor-not-allowed' : 
                          seat.sType === 2 ? 'bg-purple-600 text-white shadow-xl scale-110 z-10' : 
                          seat.sType === 3 ? 'bg-rose-500 text-white shadow-xl scale-110 z-10' : 
                          'bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white cursor-pointer'}`}
                    >
                      {seat._id}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white border-t border-gray-100 p-8 flex items-center justify-between shrink-0">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Đang chỉnh sửa:</span>
                  <p className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                    {seats.filter(s => s._status === 'selected').length} Ghế VIP được thiết lập
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSeats(generateSeatsByCapacity(rooms.find(r => r.roomId === activeRoomId)?.rCapacity || 0, activeBranchId as number, activeRoomId as number))} 
                    className="p-4 rounded-2xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm" title="Reset Grid">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button onClick={handleSave} disabled={isSaving} 
                    className="px-10 py-4 rounded-2xl font-black text-white bg-[#4a4bd7] hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all uppercase tracking-widest text-xs flex items-center gap-3">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Đang lưu..." : "Lưu sơ đồ ghế"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 font-black uppercase tracking-[5px] animate-pulse">
              <Monitor className="w-20 h-20 mb-6 opacity-20" />
              Vui lòng chọn một phòng chiếu
            </div>
          )}
        </div>
      </div>

      {/* New Room Modal - Bo góc 32px */}
      {isNewRoomDialogOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsNewRoomDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-[32px] shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="font-black text-gray-800 uppercase text-lg tracking-tight">Thêm phòng chiếu mới</h2>
              <button onClick={() => setIsNewRoomDialogOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateNewRoom} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên phòng (Hall)</label>
                <input name="name" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="VD: Cinema 01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại phòng</label>
                  <select name="type" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer">
                    <option value="Standard">Standard</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sức chứa (Ghế)</label>
                  <input name="capacity" type="number" required defaultValue="100" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsNewRoomDialogOpen(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs tracking-widest">Hủy</button>
                <button type="submit" className="flex-[2] py-4 rounded-2xl font-black text-white bg-[#4a4bd7] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest">Tạo phòng chiếu</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}