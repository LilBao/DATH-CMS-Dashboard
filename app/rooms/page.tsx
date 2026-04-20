"use client";

import { useState } from 'react';
import { Download, Plus, RotateCcw, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Now Playing' | 'Cleaning' | 'Reserved' | 'Idle';
  capacity: number;
  system: string;
}

const mockRooms: Room[] = [
  { id: 'r1', name: 'Hall 04', type: 'IMAX', location: 'Main Building, Floor 2', status: 'Now Playing', capacity: 100, system: 'Laser 4K' },
  { id: 'r2', name: 'Hall 01', type: 'Standard', location: 'Main Building, Floor 1', status: 'Cleaning', capacity: 80, system: 'Standard' },
  { id: 'r3', name: 'Hall 02', type: '4DX', location: 'West Wing, Ground', status: 'Reserved', capacity: 64, system: 'Sensory+' },
  { id: 'r4', name: 'Hall 03', type: 'VIP', location: 'North Suite, Penthouse', status: 'Idle', capacity: 24, system: 'Atmos Pro' },
];

type SeatStatus = 'available' | 'selected' | 'disabled';

interface Seat {
  id: string;
  row: string;
  col: number;
  status: SeatStatus;
}

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const generateInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];
  rows.forEach(row => {
    for (let col = 1; col <= 10; col++) {
      let status: SeatStatus = 'available';
      if (row === 'A' && (col === 5 || col === 6)) status = 'disabled';
      if (row === 'C' && (col === 1 || col === 2 || col === 9 || col === 10)) status = 'selected';
      seats.push({ id: `${row}${col}`, row, col, status });
    }
  });
  return seats;
};

const generateBlankSeats = (): Seat[] => {
  const seats: Seat[] = [];
  rows.forEach(row => {
    for (let col = 1; col <= 10; col++) {
      seats.push({ id: `${row}${col}`, row, col, status: 'available' });
    }
  });
  return seats;
};

export default function RoomsSeatsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [activeRoomId, setActiveRoomId] = useState<string>('r1');
  const [seats, setSeats] = useState<Seat[]>(generateInitialSeats());
  const [isBulkMode, setIsBulkMode] = useState(true);

  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);

  const selectedSeats = seats.filter(s => s.status === 'selected');

  const handleSeatClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat.id === id) {
        if (seat.status === 'disabled') {
          return { ...seat, status: 'available' };
        }
        return { ...seat, status: seat.status === 'selected' ? 'available' : 'selected' };
      }
      return seat;
    }));
  };

  const handleSeatDoubleClick = (id: string) => {
    if (!isBulkMode) return;
    setSeats(prev => prev.map(seat => {
      if (seat.id === id) {
        return { ...seat, status: 'disabled' };
      }
      return seat;
    }));
  };

  const handleReset = () => {
    setSeats(generateInitialSeats());
    toast.info("Layout resetted to default");
  };

  const handleSave = () => {
    toast.success("Grid changes saved successfully!");
  };

  const handleNewRoomClick = () => {
    setIsConfirmSaveOpen(true);
  };

  const handleConfirmSave = () => {
    handleSave();
    setIsConfirmSaveOpen(false);
    setIsNewRoomDialogOpen(true);
  };

  const handleSkipSave = () => {
    setIsConfirmSaveOpen(false);
    setIsNewRoomDialogOpen(true);
  };

  const handleCreateNewRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const capacity = Number(formData.get('capacity'));
    const system = formData.get('system') as string;

    if (!name || !capacity) {
      toast.error("Name and Capacity are required!");
      return;
    }

    const newRoom: Room = {
      id: `r${Date.now()}`,
      name,
      type,
      location,
      capacity,
      system,
      status: 'Idle'
    };

    setRooms([...rooms, newRoom]);
    setActiveRoomId(newRoom.id);
    setSeats(generateBlankSeats());
    setIsNewRoomDialogOpen(false);
    toast.success("New room created successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Now Playing': return 'bg-[#6ffbbe] text-[#005e3f] border-[#006d4a]';
      case 'Cleaning': return 'bg-[#e3e9ec] text-[#596063] border-transparent';
      case 'Reserved': return 'bg-[#d4a6ff]/30 text-[#842cd3] border-transparent';
      case 'Idle': return 'bg-[#e3e9ec] text-[#596063] border-transparent';
      default: return 'bg-gray-100 text-gray-500 border-transparent';
    }
  };

  const getSeatStyle = (status: SeatStatus) => {
    switch (status) {
      case 'available': return 'bg-[#babbff] text-[#221eb5] hover:bg-[#a5a6ff] cursor-pointer';
      case 'selected': return 'bg-[#d4a6ff] text-[#52008e] shadow-[0_0_12px_0_rgba(132,44,211,0.4)] ring-1 ring-[#842cd3] cursor-pointer scale-105 z-10';
      case 'disabled': return 'bg-[#dde3e7] text-gray-400 cursor-pointer hover:bg-gray-300';
      default: return 'bg-gray-100';
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-8 relative">
      
      <div className="flex items-end justify-between mb-6 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1.1px] mb-1 block">Assets Management</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Rooms & Seats</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white hover:bg-gray-50 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[#2d3337] transition-all shadow-sm border border-gray-100">
            <Download className="w-4 h-4" /> Export Layout
          </button>
          <button onClick={handleNewRoomClick} className="bg-[#4a4bd7] hover:bg-blue-700 shadow-[0_10px_15px_-3px_#c7d2fe] flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all">
            <Plus className="w-4 h-4" /> New Theater Room
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        <div className="w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                activeRoomId === room.id 
                  ? 'bg-white border-blue-100 shadow-[0_12px_32px_0_rgba(45,51,55,0.06)] ring-2 ring-indigo-500/10' 
                  : 'bg-white/60 border-transparent hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{room.name} &mdash; <span className={activeRoomId === room.id ? "text-indigo-600" : ""}>{room.type}</span></h3>
                  <p className="text-xs font-medium text-gray-500 mt-1">{room.location}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(room.status)}`}>
                  {room.status === 'Now Playing' && <span className="w-1.5 h-1.5 rounded-full bg-[#006d4a]"></span>}
                  {room.status}
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Capacity</p>
                  <p className="text-sm font-bold text-gray-900">{room.capacity} <span className="text-gray-500 font-medium">Seats</span></p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">System</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{room.system}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-3 h-3 rounded bg-[#babbff]"></div>
                <span className="text-xs font-bold text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-3 h-3 rounded bg-[#d4a6ff]"></div>
                <span className="text-xs font-bold text-gray-600">VIP Selection</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-3 h-3 rounded bg-[#dde3e7]"></div>
                <span className="text-xs font-bold text-gray-600">Disabled</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bulk Mode:</span>
              <div className="bg-gray-200/50 p-1 rounded-xl flex items-center">
                <button 
                  onClick={() => setIsBulkMode(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isBulkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >Modify</button>
                <button 
                  onClick={() => setIsBulkMode(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isBulkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >View Only</button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50/50 to-transparent overflow-hidden">
            
            <div className="absolute top-8 w-[60%] max-w-[600px]">
              <div className="h-2 bg-gradient-to-b from-indigo-200 to-transparent rounded-t-[100%] opacity-50 relative"></div>
              <div className="h-6 border-t-4 border-indigo-200 rounded-t-[100%] relative shadow-[0_-10px_30px_rgba(99,102,241,0.15)] flex justify-center pt-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[5px]">Screen Center</span>
              </div>
            </div>

            <div className="mt-16 w-full max-w-[800px] flex justify-center">
              <div className="grid grid-cols-10 gap-2.5">
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

            <div className="absolute bottom-8 w-full px-16 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Left Aisle</span>
              <span>Hall Center</span>
              <span>Right Aisle</span>
            </div>
          </div>

          <div className="bg-white border-t border-gray-100 p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Room Config</span>
                <div className="flex gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">{activeRoom?.type} Layout v1.0</span>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg">Auto-Pricing: ON</span>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Selection</span>
                <p className="text-sm font-bold text-gray-900">
                  {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : 'None'}
                  {selectedSeats.length > 0 && <span className="text-gray-500 font-medium ml-1">({selectedSeats.length} Seats)</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="px-6 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold text-white bg-[#4a4bd7] hover:bg-blue-700 shadow-[0_10px_15px_-3px_#c7d2fe] transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Grid Changes
              </button>
            </div>
          </div>

        </div>
      </div>

      {isConfirmSaveOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsConfirmSaveOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-2xl shadow-xl z-50 p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Save current layout?</h2>
            <p className="text-sm text-gray-500 mb-6">Do you want to save the changes made to the current room before creating a new one?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsConfirmSaveOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSkipSave} className="px-4 py-2 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100">Discard</button>
              <button onClick={handleConfirmSave} className="px-4 py-2 rounded-xl font-bold text-white bg-[#4a4bd7] hover:bg-blue-700">Save & Continue</button>
            </div>
          </div>
        </>
      )}

      {isNewRoomDialogOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsNewRoomDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-2xl shadow-xl z-50 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900">Initialize New Room</h2>
              <button onClick={() => setIsNewRoomDialogOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNewRoom} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Room Name</label>
                  <input name="name" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium transition-all" placeholder="e.g. Hall 05" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                    <select name="type" className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium appearance-none cursor-pointer transition-all">
                      <option>Standard</option>
                      <option>IMAX</option>
                      <option>4DX</option>
                      <option>VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Capacity</label>
                    <input name="capacity" type="number" required defaultValue="100" className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                  <input name="location" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium transition-all" placeholder="e.g. East Wing, Floor 3" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">System</label>
                  <input name="system" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm font-medium transition-all" placeholder="e.g. Dolby Atmos" />
                </div>
              </div>
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsNewRoomDialogOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#4a4bd7] hover:bg-blue-700 shadow-sm transition-all">Create Room</button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}