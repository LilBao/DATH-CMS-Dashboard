"use client";

import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Ticket, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { orderService, Order } from '@/services/orderService';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Order | null;
}

export default function OrderFormModal({ isOpen, onClose, onSuccess, initialData }: OrderFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      total: Number(formData.get('total')),
      ticketQuantity: Number(formData.get('ticketQuantity')),
      paymentMethod: formData.get('paymentMethod') as string,
    };

    try {
      if (initialData) {
        await orderService.update(initialData.id, payload);
        toast.success("Đã cập nhật thông tin hóa đơn.");
      } else {
        await orderService.create({
          ...payload,
          status: 'Pending',
          time: new Date().toLocaleTimeString() + ' - Today'
        });
        toast.success("Đã tạo hóa đơn mới.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Thao tác thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-[32px] shadow-2xl z-[110] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-black text-gray-800 uppercase tracking-tight">{initialData ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn mới"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khách hàng</label>
            <input name="customerName" defaultValue={initialData?.customerName} required className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input name="customerEmail" defaultValue={initialData?.customerEmail} required type="email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="ticketQuantity" defaultValue={initialData?.ticketQuantity} required type="number" placeholder="Số vé" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
            <input name="total" defaultValue={initialData?.total} required type="number" placeholder="Tổng tiền" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thanh toán</label>
            <select name="paymentMethod" defaultValue={initialData?.paymentMethod || "Cash"} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </div>
    </>
  );
}