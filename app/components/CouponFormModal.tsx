"use client";

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Ticket, 
  Calendar, 
  Percent, 
  Hash, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  Gift
} from 'lucide-react';
import { CouponResponse, CouponRequest } from '@/services/couponService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/movie_dialog';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CouponRequest) => Promise<void>;
  initialData: CouponResponse | null;
}

export default function CouponFormModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: CouponFormModalProps) {
  const [formData, setFormData] = useState<CouponRequest>({
    startDate: '',
    endDate: '',
    saleOff: 0,
    releaseNum: 100,
    availNum: 100,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        startDate: initialData.startDate.split('T')[0],
        endDate: initialData.endDate.split('T')[0],
        saleOff: initialData.saleOff,
        releaseNum: initialData.releaseNum,
        availNum: initialData.availNum,
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        saleOff: 10,
        releaseNum: 100,
        availNum: 100,
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving coupon:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[32px] overflow-hidden p-0 animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                  {initialData ? "Cập nhật Voucher" : "Tạo mã giảm giá"}
                </DialogTitle>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Hệ thống ưu đãi khách hàng</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ngày bắt đầu
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ngày kết thúc
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Percent className="w-3 h-3" /> Tỷ lệ giảm giá (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.saleOff}
                onChange={e => setFormData({ ...formData, saleOff: Number(e.target.value) })}
                className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
                placeholder="VD: 10"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Số lượng phát hành
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.releaseNum}
                onChange={e => setFormData({ ...formData, releaseNum: Number(e.target.value), availNum: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Ticket className="w-3 h-3" /> Số lượng còn lại
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.availNum}
                onChange={e => setFormData({ ...formData, availNum: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
                placeholder="100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div>
              <p className="text-xs font-black text-indigo-900 uppercase">Trạng thái kích hoạt</p>
              <p className="text-[10px] text-indigo-500/70 font-bold uppercase tracking-tight mt-0.5">Cho phép khách hàng sử dụng ngay</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className="transition-transform active:scale-90"
            >
              {formData.isActive ? (
                <ToggleRight className="w-10 h-10 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-300" />
              )}
            </button>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              {initialData ? 'Cập nhật ngay' : 'Phát hành Voucher'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
