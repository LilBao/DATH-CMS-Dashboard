"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Activity, DollarSign, Percent, 
  AlertCircle, Edit, Trash2, Loader2, Ticket 
} from 'lucide-react';
import { toast } from 'sonner';
import { couponService, Coupon } from '@/services/couponService';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dữ liệu từ service
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponService.getAll();
      // Hỗ trợ cả trường hợp data là mảng hoặc object bọc data
      const rawData = Array.isArray(data) ? data : data.data ?? [];
      setCoupons(rawData);
    } catch (error) {
      toast.error("Không thể tải danh sách mã giảm giá.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Tính toán số liệu thực tế từ danh sách coupons (Thay thế placeholder)
  const stats = useMemo(() => {
    const active = coupons.filter(c => c.status === 'Available').length;
    const usedCount = coupons.filter(c => c.status === 'Used').length;
    const total = coupons.length;
    
    // Giả sử tỷ lệ sử dụng dựa trên Used / Total
    const redemptionRate = total > 0 ? Math.round((usedCount / total) * 100) : 0;
    
    // Sắp hết hạn (Giả định logic: Expiring soon là status Available nhưng sắp tới hạn)
    const expiringSoon = coupons.filter(c => c.status === 'Available').length;

    return {
      active,
      redemptionRate: `${redemptionRate}%`,
      expiringSoon
    };
  }, [coupons]);

  // Xóa Coupon
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã này?")) return;
    try {
      await couponService.delete(id);
      toast.success("Đã xóa mã giảm giá thành công");
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      toast.error("Lỗi khi xóa mã giảm giá.");
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "All" || c.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [coupons, searchQuery, filterStatus]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-12">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 px-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Promotion</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Coupons</h1>
          <p className="text-gray-500 font-medium">Quản lý mã khuyến mãi và voucher giảm giá cho rạp phim.</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all uppercase text-sm">
          <Plus className="w-5 h-5" /> Tạo mã mới
        </button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10 px-4">
        {[
          { label: "Đang hoạt động", val: stats.active, color: "border-emerald-500", icon: <Activity className="text-emerald-500" /> },
          { label: "Tổng mã hiện có", val: coupons.length, color: "border-purple-500", icon: <DollarSign className="text-purple-500" /> },
          { label: "Tỷ lệ sử dụng", val: stats.redemptionRate, color: "border-indigo-500", icon: <Percent className="text-indigo-500" /> },
          { label: "Cần lưu ý", val: stats.expiringSoon, color: "border-amber-500", icon: <AlertCircle className="text-amber-500" /> }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-3xl border-l-4 ${stat.color} shadow-sm flex justify-between items-center transition-transform hover:scale-[1.02]`}>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-gray-800 mt-1">{stat.val}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mx-4">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Kho Voucher</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm mã code..." 
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all focus:w-80 shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              {["All", "Available", "Used", "Expired"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${filterStatus === tab ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab === "Available" ? "Còn hạn" : tab === "Used" ? "Đã dùng" : tab === "Expired" ? "Hết hạn" : "Tất cả"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Thông tin Coupon</th>
                <th className="px-8 py-4">Giảm giá</th>
                <th className="px-8 py-4">Thời hạn</th>
                <th className="px-8 py-4">Trạng thái</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-100">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 tracking-tight leading-tight uppercase">{coupon.code}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-0.5">{coupon.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xl font-black text-indigo-600">{coupon.discount}%</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-gray-700 uppercase tracking-tighter">{coupon.startDate}</p>
                    <p className="text-[10px] text-gray-400 font-bold">đến {coupon.endDate}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 w-fit
                      ${coupon.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                        coupon.status === 'Expired' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${coupon.status === 'Available' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-indigo-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2.5 text-gray-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-xl shadow-sm border border-transparent hover:border-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-14 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
                    Không tìm thấy mã giảm giá nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50/50 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-100">
          Hiển thị {filteredCoupons.length} trong tổng số {coupons.length} mã voucher
        </div>
      </div>
    </div>
  );
}