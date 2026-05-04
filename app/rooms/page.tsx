"use client";

import { useState, useEffect } from 'react';
import { Plus, RotateCcw, Save, X, ChevronDown, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
}

type SeatStatus = 'available' | 'selected' | 'disabled';

interface Seat {
  id: string;
  row: string;
  col: number;
  status: SeatStatus;
}

interface Room {
  id: string;
  name: string;
  type: string;
  status: 'Now Playing' | 'Cleaning' | 'Reserved' | 'Idle';
  capacity: number;
  branchId: string;
  layout?: Seat[]; // Đảm bảo có lưu layout chi tiết
}

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

const generateSeatsByCapacity = (capacity: number): Seat[] => {
  const seats: Seat[] = [];
  const colsPerRow = 10;
  for (let i = 0; i < capacity; i++) {
    const rowIndex = Math.floor(i / colsPerRow);
    const colIndex = (i % colsPerRow) + 1;
    const rowLabel = rows[rowIndex] || `R${rowIndex}`;
    seats.push({ id: `${rowLabel}${colIndex}`, row: rowLabel, col: colIndex, status: 'available' });
  }
  return seats;
};

export default function RoomsSeatsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('');
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);

  // SỬA TẠI ĐÂY: Thêm http://localhost:3001/ để gọi đúng cổng của JSON Server
  const BASE_URL = 'http://localhost:3001';
  const ROOMS_API = `${BASE_URL}/rooms`;
  const BRANCHES_API = `${BASE_URL}/branches`;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [roomRes, branchRes] = await Promise.all([
          fetch(ROOMS_API),
          fetch(BRANCHES_API)
        ]);
        const roomData = await roomRes.json();
        const branchData = await branchRes.json();
        setRooms(Array.isArray(roomData) ? roomData : []);
        setBranches(Array.isArray(branchData) ? branchData : []);
        if (branchData.length > 0) setActiveBranchId(branchData[0].id);
      } catch (error) {
        toast.error("Failed to connect to API server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filteredRooms = rooms.filter(r => r.branchId === activeBranchId);

  useEffect(() => {
    if (filteredRooms.length > 0) {
      setActiveRoomId(filteredRooms[0].id);
    } else {
      setActiveRoomId('');
      setSeats([]);
    }
  }, [activeBranchId]);

  // Logic: Load layout riêng của từng phòng
  useEffect(() => {
    const activeRoom = rooms.find(r => r.id === activeRoomId);
    if (activeRoom) {
      if (activeRoom.layout && activeRoom.layout.length > 0) {
        setSeats(activeRoom.layout);
      } else {
        setSeats(generateSeatsByCapacity(activeRoom.capacity));
      }
    }
  }, [activeRoomId, rooms]);

  const selectedSeats = seats.filter(s => s.status === 'selected');

  const handleSeatClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat.id === id) {
        if (seat.status === 'disabled') return { ...seat, status: 'available' };
        return { ...seat, status: seat.status === 'selected' ? 'available' : 'selected' };
      }
      return seat;
    }));
  };

  const handleSeatDoubleClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat.id === id) return { ...seat, status: 'disabled' };
      return seat;
    }));
  };

  const handleSave = async () => {
    if (!activeRoomId) return;
    setIsSaving(true);
    // Tính toán lại capacity thực tế
    const finalCapacity = seats.filter(s => s.status !== 'disabled').length;
    
    try {
      const response = await fetch(`${ROOMS_API}/${activeRoomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          capacity: finalCapacity,
          layout: seats // Lưu trạng thái ghế chi tiết
        }),
      });
      if (response.ok) {
        setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, capacity: finalCapacity, layout: seats } : r));
        toast.success("Room layout synced to server!");
      }
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const capacity = Number(formData.get('capacity'));
    const initialLayout = generateSeatsByCapacity(capacity);
    
    const newRoom: Room = {
      id: `r${Date.now()}`,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      capacity: capacity,
      status: 'Idle',
      branchId: activeBranchId,
      layout: initialLayout
    };
    try {
      const response = await fetch(ROOMS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });
      if (response.ok) {
        setRooms(prev => [...prev, newRoom]);
        setActiveRoomId(newRoom.id);
        setIsNewRoomDialogOpen(false);
        toast.success("Room added to branch!");
      }
    } catch (error) {
      toast.error("Creation failed.");
    }
  };

  const getSeatStyle = (status: SeatStatus) => {
    switch (status) {
      case 'available': return 'bg-[#babbff] text-[#221eb5] hover:bg-[#a5a6ff] cursor-pointer';
      case 'selected': return 'bg-[#d4a6ff] text-[#52008e] shadow-lg ring-1 ring-[#842cd3] scale-105 z-10 cursor-pointer';
      case 'disabled': return 'bg-[#dde3e7] text-gray-400 opacity-40 cursor-pointer';
      default: return 'bg-gray-100';
    }
  };

  if (isLoading) return <div className="p-10 text-center font-black text-gray-300 animate-pulse uppercase tracking-[4px]">Syncing...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-8 relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 shrink-0">
        <div>
          <div className="relative flex items-center gap-2 text-[11px] text-indigo-500 font-bold tracking-[2px] mb-1 cursor-pointer group">
            <Building2 className="w-3 h-3" />
            <select value={activeBranchId} onChange={(e) => setActiveBranchId(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
              {branches.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
            </select>
            <span className="uppercase">{branches.find(b => b.id === activeBranchId)?.name || 'SELECT BRANCH'}</span>
            <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Rooms & Seats</h1>
        </div>
        <button onClick={() => setIsNewRoomDialogOpen(true)} className="bg-[#4a4bd7] hover:bg-blue-700 shadow-lg px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> New Theater Room
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {filteredRooms.map(room => (
            <div key={room.id} onClick={() => setActiveRoomId(room.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeRoomId === room.id ? 'bg-white border-blue-100 shadow-xl ring-2 ring-indigo-500/10' : 'bg-white/60 border-transparent hover:bg-white'}`}
            >
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{room.name} &mdash; <span className={activeRoomId === room.id ? "text-indigo-600" : ""}>{room.type}</span></h3>
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Capacity</p>
                <p className="text-sm font-bold text-gray-900">{room.capacity} <span className="text-gray-500 font-medium">Seats</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          {activeRoomId ? (
            <>
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#babbff]"></div>Standard</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#d4a6ff]"></div>VIP</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#dde3e7]"></div>Disabled</div>
                </div>
                <div className="bg-gray-200/50 p-1 rounded-xl flex items-center">
                  <button onClick={() => setIsBulkMode(true)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${isBulkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Edit</button>
                  <button onClick={() => setIsBulkMode(false)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${!isBulkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>View</button>
                </div>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50/50 to-transparent overflow-auto custom-scrollbar">
                <div className="mb-12 w-[60%] max-w-[600px] shrink-0 border-t-4 border-indigo-200 rounded-t-[100%] flex justify-center pt-2 text-[10px] font-bold text-indigo-400 uppercase tracking-[5px]">Screen</div>
                <div className="grid grid-cols-10 gap-3">
                  {seats.map((seat) => (
                    <div 
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      onDoubleClick={() => handleSeatDoubleClick(seat.id)}
                      className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all duration-200 select-none ${getSeatStyle(seat.status)}`}
                    >
                      <span className="text-[11px] font-bold">{seat.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border-t border-gray-100 p-6 flex items-center justify-between shrink-0">
                <div className="text-sm font-bold text-gray-900 flex gap-2 items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Selection:</span>
                  {selectedSeats.length > 0 ? `${selectedSeats.length} VIP Seats` : 'None'}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSeats(generateSeatsByCapacity(rooms.find(r => r.id === activeRoomId)?.capacity || 0))} className="p-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold text-white bg-[#4a4bd7] hover:bg-blue-700 shadow-lg">{isSaving ? "Saving..." : "Save Grid"}</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 font-black uppercase tracking-widest"><Building2 className="w-16 h-16 mb-4 opacity-20" />Select a room</div>
          )}
        </div>
      </div>

      {isNewRoomDialogOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsNewRoomDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50/50 font-black text-gray-900 uppercase text-sm tracking-tight">New Room <button onClick={() => setIsNewRoomDialogOpen(false)}><X className="w-4 h-4" /></button></div>
            <form onSubmit={handleCreateNewRoom} className="p-6 space-y-5">
              <input name="name" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" placeholder="Hall Name" />
              <div className="grid grid-cols-2 gap-4">
                <select name="type" className="p-3 bg-gray-50 rounded-xl"><option>Standard</option><option>IMAX</option><option>VIP</option></select>
                <input name="capacity" type="number" required defaultValue="100" className="p-3 bg-gray-50 rounded-xl" />
              </div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsNewRoomDialogOpen(false)} className="px-5 py-2.5 font-bold text-gray-500">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#4a4bd7]">Create</button></div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}