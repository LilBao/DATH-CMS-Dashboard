"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Activity, DollarSign, Percent,
  Edit, Trash2, Loader2, Ticket, Clock, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { couponService, CouponResponse, CouponRequest } from '@/services/couponService';
import { ConfirmModal } from '../components/ui/confirm-modal';
import CouponFormModal from '../components/CouponFormModal';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponService.getAll();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách mã giảm giá.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter(c => c.isActive).length;
    const usedCount = coupons.reduce((sum, c) => sum + (c.releaseNum - c.availNum), 0);
    const releaseCount = coupons.reduce((sum, c) => sum + c.releaseNum, 0);
    const redemptionRate = releaseCount > 0 ? Math.round((usedCount / releaseCount) * 100) : 0;
    const expiringSoon = coupons.filter(c => {
      const daysLeft = (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return c.isActive && daysLeft >= 0 && daysLeft < 7;
    }).length;

    return { active, redemptionRate, expiringSoon };
  }, [coupons]);

  const handleSaveCoupon = async (data: CouponRequest) => {
    try {
      setIsSaving(true);
      if (selectedCoupon) {
        await couponService.update(selectedCoupon.couponId, data);
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        await couponService.create(data);
        toast.success("Đã tạo mã giảm giá mới!");
      }
      await fetchCoupons();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Lỗi khi lưu mã giảm giá.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (couponToDelete === null) return;
    try {
      await couponService.delete(couponToDelete);
      toast.success("Đã xóa mã giảm giá");
      setCoupons(prev => prev.filter(c => c.couponId !== couponToDelete));
    } catch (error) {
      toast.error("Lỗi khi xóa mã giảm giá.");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.couponId.toString().includes(searchQuery);
      const matchesStatus = filterStatus === "All" || 
        (filterStatus === "Active" && c.isActive) || 
        (filterStatus === "Inactive" && !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchQuery, filterStatus]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Đang tải dữ liệu voucher...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4">
      {/* Horizontal Header */}
      <div className="flex items-end justify-between mb-10 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2.2px] mb-1 block">Promotion & Rewards</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Coupons</h1>
        </div>
        <button 
          onClick={() => { setSelectedCoupon(null); setIsModalOpen(true); }}
          className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest"
        >
          <Plus className="w-5 h-5" /> TẠO MÃ VOUCHER
        </button>
      </div>

      {/* Horizontal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px] border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang hoạt động</p>
          <span className="text-4xl font-black text-[#2d3337]">{stats.active}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px] border-l-4 border-emerald-500 transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỷ lệ sử dụng</p>
          <span className="text-4xl font-black text-[#2d3337]">{stats.redemptionRate}%</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px] border-l-4 border-amber-500 transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sắp hết hạn</p>
          <span className="text-4xl font-black text-[#2d3337]">{stats.expiringSoon}</span>
        </div>
      </div>

      {/* Integrated Filters & Main Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="bg-gray-50/30 border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="relative w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo ID voucher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-2xl items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400 ml-3 mr-1" />
              {["All", "Active", "Inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã Voucher</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mức giảm</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Đã dùng</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                <tr key={coupon.couponId} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="font-black text-gray-800 text-sm tracking-tight">#{coupon.couponId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-lg font-black text-indigo-600">-{coupon.saleOff}%</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-700">{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase">đến {new Date(coupon.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-sm font-black text-gray-800">{coupon.releaseNum - coupon.availNum} / {coupon.releaseNum}</p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 mx-auto overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.round(((coupon.releaseNum - coupon.availNum) / coupon.releaseNum) * 100)}%` }} 
                      />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setSelectedCoupon(coupon); setIsModalOpen(true); }}
                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-gray-100 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setCouponToDelete(coupon.couponId); setIsConfirmOpen(true); }}
                        className="p-3 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-gray-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-300 font-bold uppercase tracking-[4px] text-xs">
                    Không tìm thấy mã voucher nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CouponFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCoupon}
        initialData={selectedCoupon}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa Voucher"
        description={`Bạn có chắc chắn muốn xóa mã giảm giá #${couponToDelete}? Hành động này sẽ gỡ bỏ vĩnh viễn voucher khỏi hệ thống.`}
      />
    </div>
  );
}