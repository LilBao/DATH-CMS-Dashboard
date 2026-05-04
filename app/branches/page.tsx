"use client";

import { useState, useEffect } from 'react';
import { 
  MapPin, Phone, User, Activity, Plus, Search, 
  ChevronRight, Save, Trash2, Info
} from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  status: 'Active' | 'Maintenance' | 'Closed';
}

const API_URL = 'http://localhost:3001/branches';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0]);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load branches.");
        setIsLoading(false);
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    try {
      const response = await fetch(`${API_URL}/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedBranch),
      });

      if (response.ok) {
        toast.success(`Updated branch: ${selectedBranch.name}`);
        // Cập nhật lại danh sách bên trái
        setBranches(branches.map(b => b.id === selectedBranch.id ? selectedBranch : b));
      }
    } catch (error) {
      toast.error("Error updating branch.");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Network</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight">Branch Management</h1>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Side: Table */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branches.map((branch) => (
                <tr 
                  key={branch.id} 
                  onClick={() => setSelectedBranch(branch)}
                  className={`hover:bg-indigo-50/30 cursor-pointer transition-colors ${selectedBranch?.id === branch.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-6 py-5 text-sm font-bold text-indigo-600">{branch.id}</td>
                  <td className="px-6 py-5 text-sm font-black text-gray-800">{branch.name}</td>
                  <td className="px-6 py-5 text-xs font-bold text-gray-500">{branch.status}</td>
                  <td className="px-6 py-5 text-right"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Manage Form (Sửa lỗi onChange tại đây) */}
        <aside className="w-[400px] sticky top-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-xl font-black text-gray-800 mb-8">Manage Branch</h3>

            <form className="space-y-6" onSubmit={handleUpdate}>
              {/* Branch Name Input */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Branch Name</label>
                <input 
                  type="text" 
                  value={selectedBranch?.name || ''} 
                  onChange={(e) => setSelectedBranch(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Physical Address Textarea */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Physical Address</label>
                <textarea 
                  rows={3}
                  value={selectedBranch?.address || ''}
                  onChange={(e) => setSelectedBranch(prev => prev ? { ...prev, address: e.target.value } : null)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <select 
                  value={selectedBranch?.status || 'Active'}
                  onChange={(e) => setSelectedBranch(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={selectedBranch?.phone || ''}
                  onChange={(e) => setSelectedBranch(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#4a4bd7] hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100">
                  <Save className="w-4 h-4" /> Update Branch
                </button>
                <button type="button" className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}