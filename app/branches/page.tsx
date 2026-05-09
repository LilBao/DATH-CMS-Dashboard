"use client";

import { useState, useEffect } from 'react';
import { 
  ChevronRight, Save, Trash2, Building2, Loader2, MapPin, Phone, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { branchService, Branch } from '@/services/branchService';
import BranchAddModal from '../components/BranchAddModal';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch dữ liệu từ JSON Server (Cổng 8080)
  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getAll();
      const rawData = Array.isArray(data) ? data : data.data ?? [];
      setBranches(rawData);
      
      // Mặc định chọn chi nhánh đầu tiên nếu chưa có chi nhánh nào được chọn
      if (rawData.length > 0 && !selectedBranch) {
        setSelectedBranch(rawData[0]);
      }
    } catch (error) {
      toast.error("Không thể nạp danh sách chi nhánh từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // Xử lý cập nhật thông tin chi nhánh
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setIsUpdating(true);
    try {
      await branchService.update(selectedBranch.id, selectedBranch);
      toast.success(`Đã cập nhật chi nhánh: ${selectedBranch.name}`);
      
      // Cập nhật lại danh sách local để đồng bộ UI
      setBranches(prev => prev.map(b => b.id === selectedBranch.id ? selectedBranch : b));
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin lên hệ thống.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý Xóa chi nhánh
  const handleDelete = async () => {
    if (!selectedBranch) return;

    // Hiển thị hộp thoại xác nhận
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh ${selectedBranch.name}? Thao tác này không thể hoàn tác.`);
    
    if (confirmDelete) {
      try {
        setIsUpdating(true); // Dùng loading spinner trong lúc xóa
        await branchService.delete(selectedBranch.id);
        
        toast.success(`Đã xóa chi nhánh ${selectedBranch.name}`);
        
        // Cập nhật lại danh sách: Loại bỏ chi nhánh đã xóa
        const updatedBranches = branches.filter(b => b.id !== selectedBranch.id);
        setBranches(updatedBranches);
        
        // Chọn lại chi nhánh đầu tiên trong danh sách mới
        if (updatedBranches.length > 0) {
          setSelectedBranch(updatedBranches[0]);
        } else {
          setSelectedBranch(null);
        }
      } catch (error) {
        toast.error("Không thể xóa chi nhánh. Vui lòng thử lại.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4 relative">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 pt-8">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Network</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Branches</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý mạng lưới chi nhánh rạp phim trên toàn quốc.</p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5" /> Thêm chi nhánh
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Side: Table List */}
        <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Danh sách chi nhánh</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4 text-center">Mã CN</th>
                <th className="px-8 py-4">Tên chi nhánh</th>
                <th className="px-8 py-4">Trạng thái</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branches.length > 0 ? branches.map((branch) => (
                <tr 
                  key={branch.id} 
                  onClick={() => setSelectedBranch(branch)}
                  className={`hover:bg-indigo-50/30 cursor-pointer transition-all ${selectedBranch?.id === branch.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-8 py-5 text-sm font-bold text-indigo-600 text-center">#{branch.id}</td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tighter">{branch.name}</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">{branch.manager}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      branch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedBranch?.id === branch.id ? 'translate-x-1 text-indigo-500' : 'text-gray-300'}`} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">Không tìm thấy chi nhánh nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Detail & Edit Form */}
        <aside className="w-[450px] sticky top-8">
          {selectedBranch ? (
            <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-100/20 border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Chi tiết vận hành</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiệu chỉnh chi nhánh</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleUpdate}>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên chi nhánh</label>
                  <input 
                    type="text" required
                    value={selectedBranch.name} 
                    onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ vật lý</label>
                  <textarea 
                    rows={3} required
                    value={selectedBranch.address}
                    onChange={(e) => setSelectedBranch({...selectedBranch, address: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trạng thái</label>
                    <select 
                      value={selectedBranch.status}
                      onChange={(e) => setSelectedBranch({...selectedBranch, status: e.target.value as any})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Liên hệ (SĐT)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="text" required
                        value={selectedBranch.phone}
                        onChange={(e) => setSelectedBranch({...selectedBranch, phone: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quản lý phụ trách</label>
                  <input 
                    type="text" required
                    value={selectedBranch.manager}
                    onChange={(e) => setSelectedBranch({...selectedBranch, manager: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" disabled={isUpdating}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu thay đổi
                  </button>
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="flex-1 p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 border border-transparent hover:border-rose-200 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-6 h-6 mx-auto" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-300 font-black uppercase tracking-[5px] border-4 border-dashed border-gray-100 rounded-[32px]">
              <Building2 className="w-16 h-16 mb-4 opacity-10" />
              Chọn chi nhánh
            </div>
          )}
        </aside>
      </div>

      {/* Modal Add Branch */}
      <BranchAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        existingBranches={branches}
        onSuccess={(newBranch) => {
          setBranches(prev => [...prev, newBranch]);
          setSelectedBranch(newBranch);
        }} 
      />

    </div>
  );
}