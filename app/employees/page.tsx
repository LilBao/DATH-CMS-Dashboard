"use client";

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, CalendarClock, MoreVertical, X, 
  Edit, Trash2, Mail, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { employeeService, Employee } from '@/services/employeeService';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch dữ liệu thực từ Backend
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getAll();
      // Đảm bảo data là mảng, xử lý trường hợp API trả về object bọc data
      const rawData = Array.isArray(data) ? data : data.data ?? [];
      setEmployees(rawData);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên từ máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.toString().toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRole === 'All Roles' || emp.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [employees, searchQuery, selectedRole]);

  // Màu sắc badge dựa trên Role
  const getThemeStyles = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("manager")) return 'bg-purple-100 text-purple-700';
    if (r.includes("projectionist")) return 'bg-emerald-100 text-emerald-700';
    if (r.includes("supervisor")) return 'bg-amber-100 text-amber-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    // Thu thập dữ liệu từ Form
    const employeeData: Partial<Employee> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      branchId: formData.get('branchId') as string,
      salary: Number(formData.get('salary')),
      // Avatar tự động tạo theo tên nếu chưa có ảnh thực tế
      avatarUrl: selectedEmployee?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('name')}`
    };

    try {
      await employeeService.save(employeeData, selectedEmployee?.id);
      toast.success(selectedEmployee ? "Cập nhật hồ sơ thành công!" : "Đã đăng ký nhân viên mới!");
      await fetchEmployees();
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin vào hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa nhân viên này khỏi hệ thống?")) return;
    try {
      await employeeService.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success("Đã xóa nhân viên");
      setOpenMenuId(null);
    } catch (error) {
      toast.error("Lỗi khi thực hiện lệnh xóa");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-10">
      {/* Menu Overlay */}
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <div className="flex items-end justify-between mb-10 px-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Personnel</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Employees</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/employees/workshift" className="bg-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm border border-gray-100 font-black hover:bg-gray-50 transition-all text-sm">
            <CalendarClock className="w-5 h-5 text-indigo-500" /> QUẢN LÝ CA LÀM
          </Link>
          <button onClick={() => { setSelectedEmployee(null); setIsDrawerOpen(true); }} className="bg-[#4a4bd7] hover:bg-indigo-700 flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white transition-all shadow-lg shadow-indigo-100 text-sm">
            <Plus className="w-5 h-5" /> THÊM NHÂN VIÊN
          </button>
        </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 px-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px] border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng nhân sự</p>
          <span className="text-4xl font-black text-[#2d3337]">{employees.length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px] border-l-4 border-purple-500 transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí công việc</p>
          <span className="text-4xl font-black text-[#2d3337]">{Array.from(new Set(employees.map(e => e.role))).length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mx-4">
        <div className="bg-gray-50/30 border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="relative w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" placeholder="Tìm theo tên hoặc ID nhân viên..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" 
            />
          </div>
          <select 
            value={selectedRole} 
            onChange={e => setSelectedRole(e.target.value)} 
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option>All Roles</option>
            <option>Manager</option>
            <option>Supervisor</option>
            <option>Cashier</option>
            <option>Projectionist</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Nhân sự</th>
                <th className="px-8 py-5">Vai trò</th>
                <th className="px-8 py-5 text-center">Chi nhánh</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td></tr>
              ) : filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{emp.name}</p>
                        <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Mã NV: #{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getThemeStyles(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-600 text-center">{emp.branchId}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                       <Mail className="w-3.5 h-3.5 text-gray-300"/> {emp.email}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)} 
                      className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === emp.id && (
                      <div className="absolute right-12 top-10 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in zoom-in-95 origin-top-right">
                        <button 
                          onClick={() => { setSelectedEmployee(emp); setIsDrawerOpen(true); setOpenMenuId(null); }} 
                          className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-gray-700 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> SỬA HỒ SƠ
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)} 
                          className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors border-t border-gray-50"
                        >
                          <Trash2 className="w-4 h-4" /> XÓA NHÂN VIÊN
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy nhân sự</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer Form */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                  {selectedEmployee ? 'Cập nhật hồ sơ' : 'Đăng ký nhân sự'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mt-1">Phòng quản lý nguồn nhân lực</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors shadow-sm"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên khai sinh</label>
                <input name="name" type="text" required defaultValue={selectedEmployee?.name} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="VD: Vũ Như Đại" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email công việc</label>
                <input name="email" type="email" required defaultValue={selectedEmployee?.email} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="email@cinema.com" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vị trí đảm nhiệm</label>
                  <select name="role" defaultValue={selectedEmployee?.role} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer">
                    <option>Manager</option>
                    <option>Supervisor</option>
                    <option>Cashier</option>
                    <option>Projectionist</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mã chi nhánh</label>
                  <input name="branchId" type="text" defaultValue={selectedEmployee?.branchId} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="BR-XXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lương cơ bản ($)</label>
                <input name="salary" type="number" defaultValue={selectedEmployee?.salary} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="3000" />
              </div>
              
              <div className="pt-10 flex gap-4">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase text-[11px] tracking-widest">Hủy bỏ</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-[#4a4bd7] text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedEmployee ? 'Lưu thay đổi' : 'Hoàn tất đăng ký')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}