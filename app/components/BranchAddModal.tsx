"use client";

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branchService, BranchResponse, BranchRequest } from '@/services/branchService';
import { employeeService } from '@/services/employeeService';
import { useEffect } from 'react';

interface BranchAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBranch: BranchResponse) => void;
  existingBranches: BranchResponse[]; // Nhận danh sách hiện tại để tính mã ID
}

export default function BranchAddModal({ isOpen, onClose, onSuccess, existingBranches }: BranchAddModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await employeeService.getAll();
        // Lọc những nhân viên có role là MANAGER
        const filtered = data.filter(emp => emp.userType.toUpperCase().includes('MANAGER'));
        setManagers(filtered);
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    };
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  const generateNextId = () => {
    if (existingBranches.length === 0) return 1;

    // Tìm mã ID lớn nhất hiện tại
    const ids = existingBranches.map(b => b.branchId || 0);

    const maxId = Math.max(...ids);
    return maxId + 1;
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdding(true);
    const formData = new FormData(e.currentTarget);
    
    const newBranchData: BranchRequest = {
      bName: formData.get('name') as string,
      bAddress: formData.get('address') as string,
      managerId: formData.get('managerId') as string,
      phoneNumbers: [formData.get('phone') as string],
      isActive: true, // Mặc định là true khi tạo mới
    };

    try {
      const created = await branchService.create(newBranchData);
      onSuccess(created);
      onClose();
      toast.success(`Đã tạo chi nhánh mới thành công!`);
    } catch (error) {
      toast.error("Không thể thêm chi nhánh.");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-black text-gray-800 uppercase tracking-tight">Thêm chi nhánh mới</h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Mã dự kiến: {generateNextId()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleCreate} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên chi nhánh</label>
            <input name="name" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VD: Cinema Grand Plaza" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ</label>
            <input name="address" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Số 123, Đường..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SĐT</label>
              <input name="phone" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="024..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quản lý phụ trách</label>
              <select 
                name="managerId" 
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Chọn quản lý...</option>
                {managers.map(m => (
                  <option key={m.eUserId} value={m.eUserId}>
                    {m.eName} (ID: {m.eUserId})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Hủy bỏ</button>
            <button 
              type="submit" disabled={isAdding}
              className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tạo chi nhánh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}