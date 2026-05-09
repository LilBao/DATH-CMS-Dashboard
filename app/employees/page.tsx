"use client";

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, CalendarClock, MoreVertical, X, Filter, ChevronLeft, ChevronRight, Edit, Trash2, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3001/employees';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  salary?: number;
  manager?: string;
  avatarUrl?: string;
  theme?: 'lavender' | 'mint' | 'blue';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRole === 'All Roles' || emp.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [employees, searchQuery, selectedRole]);

  const getThemeStyles = (role: string) => {
    if (role.includes("Manager")) return 'bg-[#d4a6ff] text-[#52008e]';
    if (role.includes("Projectionist")) return 'bg-[#6ffbbe] text-[#005e3f]';
    return 'bg-[#babbff] text-[#221eb5]';
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employeeData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      branchId: formData.get('branchId') as string,
      salary: Number(formData.get('salary')),
      manager: formData.get('manager') as string,
      avatarUrl: selectedEmployee?.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    try {
      const method = selectedEmployee ? 'PUT' : 'POST';
      const url = selectedEmployee ? `${API_URL}/${selectedEmployee.id}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });

      if (res.ok) {
        toast.success(selectedEmployee ? "Cập nhật thành công!" : "Thêm nhân viên thành công!");
        fetchEmployees();
        setIsDrawerOpen(false);
      }
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees(employees.filter(e => e.id !== id));
        toast.success("Đã xóa nhân viên");
        setOpenMenuId(null);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa nhân viên");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-10">
      
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Personnel</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tight leading-tight">Employees</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/employees/workshift" className="bg-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm border border-gray-100 font-semibold hover:bg-gray-50 transition-colors">
            <CalendarClock className="w-5 h-5" /> Work Shifts
          </Link>
          <button onClick={() => { setSelectedEmployee(null); setIsDrawerOpen(true); }} className="bg-[#4a4bd7] hover:bg-blue-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-100">
            <Plus className="w-5 h-5" /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Staff</p>
          <span className="text-3xl font-black text-[#2d3337]">{employees.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[120px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branches</p>
          <span className="text-3xl font-black text-[#2d3337]">8</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" placeholder="Search name or ID..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
          </div>
          <div className="flex gap-4">
             <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold outline-none">
                <option>All Roles</option>
                <option>Manager</option>
                <option>Supervisor</option>
                <option>Cashier</option>
              </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Branch ID</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">Đang tải dữ liệu...</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{emp.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">ID: #{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getThemeStyles(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{emp.branchId}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs text-gray-500 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {emp.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 shadow-sm">
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === emp.id && (
                      <div className="absolute right-12 top-10 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95">
                        <button onClick={() => { setSelectedEmployee(emp); setIsDrawerOpen(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Form */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-800">{selectedEmployee ? 'Edit Staff' : 'Add Staff'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input name="name" type="text" required defaultValue={selectedEmployee?.name} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <input name="email" type="email" required defaultValue={selectedEmployee?.email} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</label>
                  <select name="role" defaultValue={selectedEmployee?.role} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
                    <option>Manager</option>
                    <option>Supervisor</option>
                    <option>Cashier</option>
                    <option>Projectionist</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch ID</label>
                  <input name="branchId" type="text" defaultValue={selectedEmployee?.branchId} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="BR-001" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Salary ($)</label>
                <input name="salary" type="number" defaultValue={selectedEmployee?.salary} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
              </div>
              
              <div className="pt-10 flex gap-4">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {selectedEmployee ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}