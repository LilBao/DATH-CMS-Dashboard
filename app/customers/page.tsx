"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Download, X, Shield,
  Key, Save, ChevronRight, Loader2, User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { customerService, Customer } from '@/services/customerService';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch dữ liệu thực tế từ Backend
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getAll();
      // Hỗ trợ cả trường hợp API trả về mảng thô hoặc object bọc data
      const rawData = Array.isArray(data) ? data : data.data ?? [];
      setCustomers(rawData);
    } catch (error) {
      toast.error("Không thể nạp danh sách khách hàng từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Xử lý cập nhật Profile thông qua Service
  const handleUpdateProfile = async () => {
    if (!selectedCustomer) return;
    setIsSaving(true);
    try {
      await customerService.update(selectedCustomer.id, selectedCustomer);
      toast.success(`Hồ sơ khách hàng ${selectedCustomer.name} đã được cập nhật!`);
      // Cập nhật lại danh sách local, tránh fetch lại toàn bộ
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? selectedCustomer : c));
      setSelectedCustomer(null);
    } catch (error) {
      toast.error("Lỗi khi lưu thay đổi hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  // Logic lọc khách hàng
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      
      const matchMembership = membershipFilter === "All" || c.membership === membershipFilter;
      
      return matchSearch && matchMembership;
    });
  }, [customers, searchQuery, membershipFilter]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20 relative px-4">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">CRM</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Customers</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý hồ sơ chi tiết, hạng thành viên và hành vi tiêu dùng.</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 uppercase text-xs">
          <Download className="w-4 h-4" /> Xuất danh sách
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, email, hoặc số điện thoại..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase tracking-tighter"
            >
              <option value="All">Tất cả hạng thẻ</option>
              <option value="Normal">Normal</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP Member</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5">Khách hàng</th>
                <th className="px-8 py-5">Hạng thẻ</th>
                <th className="px-8 py-5 text-center">Đơn hàng</th>
                <th className="px-8 py-5">Tổng chi tiêu</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className={`hover:bg-indigo-50/30 transition-colors group cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-100">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tighter">{customer.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-1">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                      ${customer.membership === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                        customer.membership === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {customer.membership}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-gray-700 text-sm">
                    {customer.totalOrders}
                  </td>
                  <td className="px-8 py-5 font-black text-gray-800 text-sm">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customer.totalSpent)}
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${customer.status === 'Active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {customer.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 text-gray-300 group-hover:text-indigo-600 transition-all bg-transparent group-hover:bg-white rounded-xl shadow-none group-hover:shadow-sm border border-transparent group-hover:border-indigo-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Không tìm thấy dữ liệu khách hàng.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50/50 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-100">
          Hiển thị {filteredCustomers.length} khách hàng trong cơ sở dữ liệu
        </div>
      </div>

      {/* Side Drawer: Customer Profile */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedCustomer(null)} />
          <aside className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col transition-all animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCustomer(null)} className="p-2.5 bg-white border border-gray-200 rounded-xl transition-all text-gray-400 hover:text-indigo-600 shadow-sm">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="font-black text-gray-800 text-xl uppercase tracking-tight">Hồ sơ khách hàng</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-10 text-center bg-gradient-to-b from-indigo-50/50 to-transparent">
                <div className="w-28 h-28 rounded-[32px] bg-indigo-600 mx-auto mb-5 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-100">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">{selectedCustomer.name}</h3>
                <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-[2px]">
                   {selectedCustomer.membership} &bull; Thành viên từ {selectedCustomer.registeredDate}
                </p>
              </div>

              <div className="p-10 space-y-10">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-3 gap-5">
                  <div className="bg-gray-50 p-5 rounded-3xl text-center border border-transparent hover:border-indigo-100 transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm tích lũy</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">{selectedCustomer.points.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-3xl text-center border border-transparent hover:border-emerald-100 transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã chi tiêu</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">${selectedCustomer.totalSpent}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-3xl text-center border-l-4 border-indigo-500 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn hàng</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{selectedCustomer.totalOrders}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Thông tin liên lạc</h4>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div className="bg-gray-50 px-5 py-4 rounded-2xl border-none">
                        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Họ và tên</p>
                        <input 
                          value={selectedCustomer.name}
                          onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                          className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0"
                        />
                      </div>
                      <div className="bg-gray-50 px-5 py-4 rounded-2xl border-none">
                        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Email liên hệ</p>
                        <p className="text-sm font-bold text-gray-800">{selectedCustomer.email}</p>
                      </div>
                      <div className="bg-gray-50 px-5 py-4 rounded-2xl border-none">
                        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Số điện thoại</p>
                        <p className="text-sm font-bold text-gray-800">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Quản trị tài khoản</h4>
                    <div className="flex gap-4">
                      <button className="flex-1 bg-gray-50 hover:bg-indigo-50 text-gray-700 py-4 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 border border-transparent hover:border-indigo-100 uppercase tracking-widest">
                        <Key className="w-4 h-4" /> Đặt lại Pass
                      </button>
                      <button 
                        onClick={() => setSelectedCustomer({...selectedCustomer, status: 'Inactive'})}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-4 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 border border-transparent hover:border-rose-200 uppercase tracking-widest"
                      >
                        <Shield className="w-4 h-4" /> Khóa thẻ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-white">
              <button 
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[24px] font-black shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Cập nhật thông tin khách hàng
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}