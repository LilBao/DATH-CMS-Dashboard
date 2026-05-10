"use client";

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, CalendarClock, MoreVertical, X,
  Edit, Trash2, Mail, Loader2, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { employeeService, EmployeeResponse, EmployeeRequest } from '@/services/employeeService';
import FileUpload from '../components/FileUpload';
import { ConfirmModal } from '../components/ui/confirm-modal';
import { useAuthStore } from '@/stores/authStore';
import { branchService } from '@/services/branchService';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // State cho Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const { user } = useAuthStore();
  const rawRole = user?.role || "";
  const isManager = rawRole.toUpperCase() === 'MANAGER' || rawRole.toUpperCase() === 'ROLE_MANAGER';
  const managerBranchId = user?.branchId;

  useEffect(() => {
    console.log("Full User Object from Store:", user);
    console.log("Current User Role:", rawRole);
    console.log("Is Manager:", isManager);
    console.log("Manager Branch ID:", managerBranchId);
  }, [user, rawRole, isManager, managerBranchId]);

  useEffect(() => {
    if (selectedEmployee) {
      setAvatarUrl(selectedEmployee.avatarUrl || '');
    } else {
      setAvatarUrl('');
    }
  }, [selectedEmployee]);

  // Fetch dữ liệu thực từ Backend
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);

      let data;
      // Nếu là Manager và có ID chi nhánh hợp lệ, gọi API theo chi nhánh
      if (isManager && managerBranchId !== undefined && managerBranchId !== null) {
        console.log("Fetching employees for branch:", managerBranchId);
        data = await employeeService.getByBranch(managerBranchId);
      } else {
        // Admin lấy hết, hoặc Manager chưa kịp nạp branchId (Interceptor trong api.ts sẽ tự lọc nếu là Manager)
        console.log("Fetching employees via getAll");
        data = await employeeService.getAll();
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể nạp danh sách nhân viên.");
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Fetch branches for Admin
    if (!isManager) {
      branchService.getAll().then(data => setBranches(Array.isArray(data) ? data : []));
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.eName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.eUserId.toString().toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRole === 'All Roles' || emp.userType === selectedRole;
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
    const formBranchId = formData.get('branchId') ? Number(formData.get('branchId')) : 0;

    // Ưu tiên branchId từ Store nếu là MANAGER, ngược lại lấy từ Form
    let finalBranchId = formBranchId;
    if (isManager && managerBranchId !== undefined && managerBranchId !== null) {
      finalBranchId = managerBranchId;
    }

    const employeeData: EmployeeRequest = {
      eUserId: selectedEmployee ? selectedEmployee.eUserId : `E${Date.now()}`,
      eName: formData.get('name') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      sex: formData.get('sex') as string,
      userType: formData.get('role') as string,
      branchId: finalBranchId,
      salary: Number(formData.get('salary')),
      avatarUrl: avatarUrl,
    };

    // Nếu là nhân viên mới, có thể thêm mật khẩu mặc định hoặc từ input
    if (!selectedEmployee) {
      employeeData.ePassword = formData.get('password') as string || '123456';
    }

    try {
      await employeeService.save(employeeData, selectedEmployee?.eUserId);
      toast.success(selectedEmployee ? "Cập nhật hồ sơ thành công!" : "Đã đăng ký nhân viên mới!");
      await fetchEmployees();
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin vào hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await employeeService.delete(employeeToDelete);
      setEmployees(prev => prev.filter(e => e.eUserId !== employeeToDelete));
      toast.success("Đã xóa nhân viên");
      setOpenMenuId(null);
    } catch (error) {
      toast.error("Lỗi khi thực hiện lệnh xóa");
      throw error;
    }
  };

  const handleToggleStatus = async (emp: EmployeeResponse) => {
    try {
      if (emp.isActive) {
        await employeeService.deactivate(emp.eUserId);
        toast.success(`Đã ngừng kích hoạt tài khoản ${emp.eName}`);
      } else {
        await employeeService.activate(emp.eUserId);
        toast.success(`Đã tái kích hoạt tài khoản ${emp.eName}`);
      }
      fetchEmployees();
      setOpenMenuId(null);
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái tài khoản.");
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
          <span className="text-4xl font-black text-[#2d3337]">{Array.from(new Set(employees.map(e => e.userType))).length}</span>
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
            <option>Admin</option>
            <option>Manager</option>
            <option>Staff</option>
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
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td></tr>
              ) : filteredEmployees.length > 0 ? filteredEmployees.map((emp, i) => (
                <tr key={emp.eUserId || i} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 overflow-hidden">
                        <img src={emp.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.eName}`} alt={emp.eName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{emp.eName}</p>
                        <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Mã NV: #{emp.eUserId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getThemeStyles(emp.userType)}`}>
                      {emp.userType}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-600 text-center">{emp.branchId}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-300" /> {emp.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${emp.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {emp.isActive ? 'Đang làm' : 'Đã nghỉ'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === emp.eUserId ? null : emp.eUserId)}
                      className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === emp.eUserId && (
                      <div className="absolute right-12 top-10 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in zoom-in-95 origin-top-right">
                        <button
                          onClick={() => { setSelectedEmployee(emp); setIsDrawerOpen(true); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-gray-700 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> SỬA HỒ SƠ
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`w-full flex items-center gap-3 px-5 py-4 text-xs font-black transition-colors border-t border-gray-50 ${emp.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          <Shield className="w-4 h-4" /> {emp.isActive ? 'KHÓA TÀI KHOẢN' : 'KÍCH HOẠT LẠI'}
                        </button>
                        <button
                          onClick={() => handleDelete(emp.eUserId)}
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
              <button onClick={() => setIsDrawerOpen(false)} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
              <div className="flex flex-col items-center pb-4 border-b border-gray-50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ảnh đại diện</label>
                <div className="w-24 h-24">
                  <FileUpload
                    folderName="employees"
                    initialPreviewUrl={avatarUrl}
                    onUploadSuccess={(url) => setAvatarUrl(url)}
                    className="w-full h-full rounded-full shadow-md"
                    aspect="square"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên khai sinh</label>
                  <input name="name" type="text" required defaultValue={selectedEmployee?.eName} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="VD: Vũ Như Đại" />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email công việc</label>
                  <input name="email" type="email" required defaultValue={selectedEmployee?.email} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="email@cinema.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                  <input name="phoneNumber" type="text" defaultValue={selectedEmployee?.phoneNumber} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="090..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giới tính</label>
                  <select name="sex" defaultValue={selectedEmployee?.sex || 'M'} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer">
                    <option value="M">Nam</option>
                    <option value="F">Nữ</option>
                    <option value="O">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vị trí đảm nhiệm</label>
                  <select name="role" defaultValue={selectedEmployee?.userType || "STAFF"} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer uppercase">
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chi nhánh</label>
                  {isManager ? (
                    <input
                      name="branchId"
                      type="hidden"
                      value={managerBranchId || ""}
                    />
                  ) : null}
                  <select
                    name="branchId"
                    disabled={isManager}
                    defaultValue={selectedEmployee?.branchId ?? managerBranchId ?? ""}
                    className={`w-full px-5 py-3.5 ${isManager ? 'bg-gray-100' : 'bg-gray-50'} border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer`}
                  >
                    {!isManager && <option value="">Chọn chi nhánh...</option>}
                    {isManager ? (
                      <option value={managerBranchId}>{managerBranchId} (Chi nhánh của bạn)</option>
                    ) : (
                      branches.map(b => (
                        <option key={b.branchId} value={b.branchId}>{b.bName} (ID: {b.branchId})</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lương cơ bản ($)</label>
                  <input name="salary" type="number" defaultValue={selectedEmployee?.salary} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="3000" />
                </div>

                {!selectedEmployee && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                    <input name="password" type="password" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="******" />
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-xl font-bold hover:bg-gray-100 transition-all uppercase text-[10px] tracking-widest border border-gray-100">Hủy</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedEmployee ? 'Lưu thay đổi' : 'Đăng ký ngay')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa nhân sự"
        description={`Bạn có chắc chắn muốn xóa nhân viên #${employeeToDelete}? Hồ sơ nhân sự sẽ bị gỡ bỏ khỏi hệ thống chi nhánh.`}
      />
    </div>
  );
}