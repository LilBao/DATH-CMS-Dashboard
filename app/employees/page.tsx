"use client";

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Plus, Search, CalendarClock, MoreVertical, X, Filter, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  branch: string;
  salary: number;
  manager: string;
  avatarUrl: string;
  theme: 'lavender' | 'mint' | 'blue';
}

const mockEmployees: Employee[] = [
  { id: 'EMP-4291', name: 'Elena Rodriguez', role: 'Senior Manager', branch: 'Downtown Plaza', salary: 5400, manager: 'Alex Rivera', avatarUrl: 'https://i.pravatar.cc/150?u=4291', theme: 'lavender' },
  { id: 'EMP-3108', name: 'Marcus Chen', role: 'Projectionist', branch: 'Eastside Mall', salary: 3200, manager: 'Elena Rodriguez', avatarUrl: 'https://i.pravatar.cc/150?u=3108', theme: 'mint' },
  { id: 'EMP-1922', name: 'Sarah Jenkins', role: 'Box Office', branch: 'Harbor View', salary: 2800, manager: 'David Kim', avatarUrl: 'https://i.pravatar.cc/150?u=1922', theme: 'blue' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedBranch, setSelectedBranch] = useState('All Locations');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRole === 'All Roles' || emp.role === selectedRole;
      const matchBranch = selectedBranch === 'All Locations' || emp.branch === selectedBranch;
      return matchSearch && matchRole && matchBranch;
    });
  }, [employees, searchQuery, selectedRole, selectedBranch]);

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'lavender': return 'bg-[#d4a6ff] text-[#52008e]';
      case 'mint': return 'bg-[#6ffbbe] text-[#005e3f]';
      case 'blue': return 'bg-[#babbff] text-[#221eb5]';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const handleSaveForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const branch = formData.get('branch') as string;
    const salary = Number(formData.get('salary'));
    const manager = formData.get('manager') as string;

    if (!name || !salary) {
      toast.error('Name and Salary are required!');
      return;
    }

    const newEmp: Employee = {
      id: selectedEmployee ? selectedEmployee.id : `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name, role, branch, salary, manager,
      avatarUrl: selectedEmployee ? selectedEmployee.avatarUrl : `https://i.pravatar.cc/150?u=${Date.now()}`,
      theme: selectedEmployee ? selectedEmployee.theme : 'mint'
    };

    if (selectedEmployee) {
      setEmployees(employees.map(e => e.id === newEmp.id ? newEmp : e));
      toast.success("Employee updated successfully!");
    } else {
      setEmployees([newEmp, ...employees]);
      toast.success("Employee added successfully!");
    }
    setIsDrawerOpen(false);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen">
      
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tight leading-tight">Employees</h1>
          <p className="text-lg text-[#596063]">Manage your cinema staff across all branches.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/employees/workshift"
            className="bg-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm border border-gray-100 font-semibold text-[#2d3337] hover:bg-gray-50 transition-colors"
          >
            <CalendarClock className="w-5 h-5" /> Work Shifts
          </Link>
          <button 
            onClick={() => { setSelectedEmployee(null); setIsDrawerOpen(true); }}
            className="bg-[#4a4bd7] shadow-[0_10px_15px_-3px_#c7d2fe] hover:bg-blue-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
          >
            <Plus className="w-5 h-5" /> Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-between h-[128px]">
          <p className="text-xs font-bold text-[#596063] uppercase tracking-wider">Total Staff</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-[#2d3337]">124</span>
            <span className="bg-[#6ffbbe] text-[#006d4a] text-xs font-bold px-3 py-1 rounded-full">+4 this month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-between h-[128px]">
          <p className="text-xs font-bold text-[#596063] uppercase tracking-wider">Active Now</p>
          <div className="flex items-end justify-between w-full">
            <span className="text-3xl font-black text-[#2d3337]">42</span>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://i.pravatar.cc/150?u=${i}`} alt="Active" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">+12</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-between h-[128px]">
          <p className="text-xs font-bold text-[#596063] uppercase tracking-wider">Branches</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-[#2d3337]">8</span>
            <span className="bg-[#d4a6ff] text-[#842cd3] text-xs font-bold px-3 py-1 rounded-full">All Operational</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-between h-[128px]">
          <p className="text-xs font-bold text-[#596063] uppercase tracking-wider">Monthly Payroll</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-[#2d3337]">$284k</span>
            <span className="text-xs font-medium text-[#596063] mb-1">Est. Payout</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-20">
        
        <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" placeholder="Search employees..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500">Branch:</span>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="text-sm font-bold text-gray-800 outline-none bg-transparent cursor-pointer">
                <option>All Locations</option>
                <option>Downtown Plaza</option>
                <option>Eastside Mall</option>
                <option>Harbor View</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500">Role:</span>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="text-sm font-bold text-gray-800 outline-none bg-transparent cursor-pointer">
                <option>All Roles</option>
                <option>Senior Manager</option>
                <option>Projectionist</option>
                <option>Box Office</option>
              </select>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            <Filter className="w-4 h-4" /> More Filters
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-gray-600">#{emp.id}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatarUrl} alt={emp.name} className="w-9 h-9 rounded-full object-cover bg-gray-100 border border-gray-200" />
                      <span className="text-sm font-bold text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getThemeStyles(emp.theme)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-medium text-gray-600">{emp.branch}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-gray-900">${emp.salary.toLocaleString()}/mo</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-medium text-gray-600">{emp.manager}</span>
                  </td>
                  <td className="px-8 py-4 relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === emp.id && (
                      <div className="absolute right-12 top-10 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => { setOpenMenuId(null); setSelectedEmployee(emp); setIsDrawerOpen(true); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setEmployees(employees.filter(e => e.id !== emp.id));
                            setOpenMenuId(null);
                            toast.success("Employee deleted.");
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    No employees found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50/50 border-t border-gray-100 p-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">1-{filteredEmployees.length}</span> of <span className="font-bold text-gray-900">{employees.length}</span> employees
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-500 hover:text-gray-900 font-bold flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Prev</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 font-bold hover:bg-gray-200">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 font-bold hover:bg-gray-200">3</button>
            <button className="p-2 text-gray-500 hover:text-gray-900 font-bold flex items-center gap-1">Next <ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.08)] z-50 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="px-10 py-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">
                  {selectedEmployee ? 'Edit Profile' : 'Add Employee'}
                </h2>
                <p className="text-sm text-gray-500">Manage staff information</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-10 space-y-8 custom-scrollbar pb-10">
                
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all overflow-hidden group">
                    {selectedEmployee ? (
                      <img src={selectedEmployee.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mb-1 text-gray-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upload</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input name="name" type="text" defaultValue={selectedEmployee?.name} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" placeholder="e.g. Robert Smith" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                      <select name="role" defaultValue={selectedEmployee?.role || "Cashier"} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer">
                        <option>Senior Manager</option>
                        <option>Manager</option>
                        <option>Projectionist</option>
                        <option>Box Office</option>
                        <option>Cashier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Branch</label>
                      <select name="branch" defaultValue={selectedEmployee?.branch || "Downtown Plaza"} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer">
                        <option>Downtown Plaza</option>
                        <option>Eastside Mall</option>
                        <option>Harbor View</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Salary ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                      <input name="salary" type="number" defaultValue={selectedEmployee?.salary} className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" placeholder="0.00" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Assigned Manager</label>
                    <select name="manager" defaultValue={selectedEmployee?.manager || "Alex Rivera"} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer">
                      <option>Alex Rivera</option>
                      <option>Elena Rodriguez</option>
                      <option>David Kim</option>
                      <option>Unassigned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-white border-t border-gray-100 flex gap-4 mt-auto">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                  {selectedEmployee ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>

          </div>
        </>
      )}
    </div>
  );
}