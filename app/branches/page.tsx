"use client";

import { useState, useEffect } from 'react';
import {
  ChevronRight, Save, Trash2, Building2, Loader2, MapPin, Phone, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { branchService, BranchResponse, BranchRequest } from '@/services/branchService';
import BranchAddModal from '../components/BranchAddModal';
import { ConfirmModal } from '../components/ui/confirm-modal';

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State cho Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getAll();
      setBranches(data);

      if (data.length > 0 && !selectedBranch) {
        setSelectedBranch(data[0]);
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
      const updateData: BranchRequest = {
        bName: selectedBranch.bName,
        bAddress: selectedBranch.bAddress,
        phoneNumbers: selectedBranch.phoneNumbers,
        managerId: selectedBranch.managerId,
      };
      const updated = await branchService.update(selectedBranch.branchId, updateData);
      toast.success(`Đã cập nhật chi nhánh: ${selectedBranch.bName}`);

      // Cập nhật lại danh sách local để đồng bộ UI
      setBranches(prev => prev.map(b => b.branchId === selectedBranch.branchId ? { ...selectedBranch, ...updated } : b));
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin lên hệ thống.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý Xóa chi nhánh
  const handleDelete = () => {
    if (!selectedBranch) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBranch) return;
    try {
      setIsUpdating(true);
      await branchService.delete(selectedBranch.branchId);
      toast.success(`Đã xóa chi nhánh ${selectedBranch.bName}`);
      const updatedBranches = branches.filter(b => b.branchId !== selectedBranch.branchId);
      setBranches(updatedBranches);
      if (updatedBranches.length > 0) {
        setSelectedBranch(updatedBranches[0]);
      } else {
        setSelectedBranch(null);
      }
    } catch (error) {
      toast.error("Không thể xóa chi nhánh. Vui lòng thử lại.");
      throw error;
    } finally {
      setIsUpdating(false);
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
              {branches.length > 0 ? branches.map((branch, i) => (
                <tr
                  key={branch.branchId || i}
                  onClick={() => setSelectedBranch(branch)}
                  className={`hover:bg-indigo-50/30 cursor-pointer transition-all ${selectedBranch?.branchId === branch.branchId ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-8 py-5 text-sm font-bold text-indigo-600 text-center">#{branch.branchId}</td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tighter">{branch.bName}</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">{branch.managerName || 'Chưa có quản lý'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedBranch?.branchId === branch.branchId ? 'translate-x-1 text-indigo-500' : 'text-gray-300'}`} />
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
                    value={selectedBranch.bName}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, bName: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ vật lý</label>
                  <textarea
                    rows={3} required
                    value={selectedBranch.bAddress}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, bAddress: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trạng thái</label>
                    <select
                      value="Active"
                      disabled
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-gray-800 outline-none opacity-60 cursor-not-allowed"
                    >
                      <option value="Active">Active</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Liên hệ (SĐT)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="text" required
                        value={selectedBranch.phoneNumbers?.[0] || ''}
                        onChange={(e) => setSelectedBranch({ ...selectedBranch, phoneNumbers: [e.target.value] })}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quản lý phụ trách</label>
                  <input
                    type="text" required
                    value={selectedBranch.managerName || ''}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, managerName: e.target.value })}
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa chi nhánh"
        description={`Bạn có chắc chắn muốn xóa chi nhánh ${selectedBranch?.bName}? Toàn bộ dữ liệu liên quan đến chi nhánh này sẽ bị ảnh hưởng.`}
      />
    </div>
  );
}