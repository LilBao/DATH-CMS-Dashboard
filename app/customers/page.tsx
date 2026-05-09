"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, MoreVertical, 
  Trash2, Edit, User, Mail, Phone, 
  Star, Clock, ChevronRight, X, Shield,
  Key, LogOut, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership: 'Premium' | 'Normal' | 'VIP';
  points: number;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  registeredDate: string;
}

const API_URL = 'http://localhost:3001/customers';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to load customers from API.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20 relative">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">CRM</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight">Customer Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage profiles, membership ranks, and customer loyalty.</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Directory
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all">
              <Filter className="w-4 h-4" /> Membership Rank
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Membership</th>
                <th className="px-8 py-5 text-center">Orders</th>
                <th className="px-8 py-5">Total Spent</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{customer.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${customer.membership === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                        customer.membership === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {customer.membership}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-gray-700 text-sm">
                    {customer.totalOrders}
                  </td>
                  <td className="px-8 py-5 font-black text-gray-800 text-sm">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${customer.status === 'Active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {customer.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer: Customer Profile */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedCustomer(null)} />
          <aside className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="font-black text-gray-800 text-lg">Customer Profile</h2>
              </div>
              <div className="flex gap-2">
                <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">Edit</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Profile Header */}
              <div className="p-8 text-center bg-gradient-to-b from-indigo-50/50 to-transparent">
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-gray-800">{selectedCustomer.name}</h3>
                <p className="text-gray-400 font-medium text-sm mt-1">{selectedCustomer.membership} Member since {selectedCustomer.registeredDate}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</p>
                    <p className="text-lg font-black text-indigo-600 mt-1">{selectedCustomer.points.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spent</p>
                    <p className="text-lg font-black text-emerald-600 mt-1">${selectedCustomer.totalSpent}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                    <p className="text-lg font-black text-gray-800 mt-1">{selectedCustomer.totalOrders}</p>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
                      <div>
                        <p className="text-gray-400 text-[11px] mb-1 uppercase">Email Address</p>
                        <p className="text-gray-700">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] mb-1 uppercase">Phone Number</p>
                        <p className="text-gray-700">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Security & Access</h4>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-gray-50 hover:bg-indigo-50 text-gray-700 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-indigo-100">
                        <Key className="w-4 h-4" /> Reset Password
                      </button>
                      <button className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-rose-200">
                        <Shield className="w-4 h-4" /> Disable Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Save Profile Changes
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}