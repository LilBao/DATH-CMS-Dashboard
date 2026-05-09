"use client";

import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Ticket, DollarSign, Popcorn, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { orderService, OrderResponse, OrderRequest } from '@/services/orderService';
import { ConfirmModal } from './ui/confirm-modal';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: OrderResponse | null;
}

export default function OrderFormModal({ isOpen, onClose, onSuccess, initialData }: OrderFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const payload: OrderRequest = {
      paymentMethod: formData.get('paymentMethod') as string,
      tickets: [],
    };

    try {
      if (initialData) {
        await orderService.update(initialData.orderId, payload);
        toast.success("Đã cập nhật thông tin hóa đơn.");
        onSuccess();
        onClose();
      } else {
        await orderService.create(payload);
        toast.success("Đã tạo hóa đơn POS thành công.");
        onSuccess();
        setIsPrintConfirmOpen(true);
      }
    } catch (error) {
      toast.error("Thao tác thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintConfirm = async () => {
    handlePrintInvoice();
    onClose();
  };

  const handlePrintInvoice = () => {
    toast.success("Đang kết nối máy in và chuẩn bị hóa đơn...");
    setTimeout(() => {
      window.print();
    }, 1000);
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
            <input name="customerName" defaultValue={"Khách Hàng"} required className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input name="customerEmail" defaultValue={"khachhang@mail.com"} required type="email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="ticketQuantity" defaultValue={initialData?.ticketDetails?.length || 0} required type="number" placeholder="Số vé" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
            <input name="total" defaultValue={initialData?.total || 0} required type="number" placeholder="Tổng tiền" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thanh toán</label>
            <select name="paymentMethod" defaultValue={initialData?.paymentMethod || "Cash"} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
              <option value="Cash">Cash (Tại quầy)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>

          {/* Ticket and Addon Details (View Mode) */}
          {initialData && (
            <div className="space-y-4 border-t pt-4">
              {initialData.ticketDetails.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vé xem phim</label>
                  <div className="space-y-2">
                    {initialData.ticketDetails.map((ticket) => (
                      <div key={ticket.ticketId} className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-gray-800 uppercase">{ticket.movieName}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{ticket.branchName} - {ticket.screenRoomName} - Ghế {ticket.seatName}</p>
                        </div>
                        <p className="text-xs font-black text-indigo-600">${ticket.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {initialData.addonDetails.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bắp nước & Phụ kiện</label>
                  <div className="space-y-2">
                    {initialData.addonDetails.map((addon, idx) => (
                      <div key={idx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-gray-800 uppercase">{addon.pName}</p>
                          <p className="text-[10px] text-gray-500 font-bold">Số lượng: {addon.quantity} | {addon.itemType}</p>
                        </div>
                        <p className="text-xs font-black text-amber-600">${(addon.price * addon.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!initialData && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bắp nước & Phụ kiện</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <input type="checkbox" id="popcorn" className="w-4 h-4 text-indigo-600" />
                  <label htmlFor="popcorn" className="text-xs font-bold text-gray-600">Combo Bắp + Nước</label>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <input type="checkbox" id="snack" className="w-4 h-4 text-indigo-600" />
                  <label htmlFor="snack" className="text-xs font-bold text-gray-600">Snack / Kẹo</label>
                </div>
              </div>
            </div>
          )}


          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={isPrintConfirmOpen}
        onClose={onClose}
        onConfirm={handlePrintConfirm}
        title="In hóa đơn"
        description="Giao dịch thành công! Bạn có muốn in hóa đơn ngay bây giờ không?"
        confirmText="In hóa đơn"
        cancelText="Để sau"
        variant="info"
      />
    </>
  );
}