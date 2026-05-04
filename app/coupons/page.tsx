"use client";

import { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Search, Filter, Calendar, 
  CheckCircle2, Clock, Trash2, Edit, MoreVertical,
  Activity, DollarSign, Percent, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Available' | 'Used' | 'Expired' | 'Disabled';
  usageLimit?: number;
}

const API_URL = 'http://localhost:3001/coupons';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to fetch coupons from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-12">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Promotion</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight">Coupons</h1>
          <p className="text-gray-500 font-medium">Manage promotional vouchers and discounts</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
          <Plus className="w-5 h-5" /> Create Coupon
        </button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Active Now", val: "1,248", color: "border-emerald-500", icon: <Activity className="text-emerald-500" /> },
          { label: "Total Discounted", val: "$12.4k", color: "border-purple-500", icon: <DollarSign className="text-purple-500" /> },
          { label: "Redemption Rate", val: "64%", color: "border-indigo-500", icon: <Percent className="text-indigo-500" /> },
          { label: "Expiring Soon", val: "12", color: "border-amber-500", icon: <AlertCircle className="text-amber-500" /> }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl border-l-4 ${stat.color} shadow-sm flex justify-between items-center`}>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-gray-800 mt-1">{stat.val}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-lg font-black text-gray-800">Voucher Inventory</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search code..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-gray-100">
              {["All", "Available", "Used"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === tab ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-4">Coupon Info</th>
              <th className="px-8 py-4">Discount</th>
              <th className="px-8 py-4">Validity Period</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs">
                      {coupon.code.substring(0, 3)}
                    </div>
                    <div>
                      <p className="font-black text-gray-800 tracking-tight">{coupon.code}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{coupon.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-lg font-black text-indigo-600">{coupon.discount}%</span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-bold text-gray-700">{coupon.startDate}</p>
                  <p className="text-[10px] text-gray-400 font-medium">to {coupon.endDate}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit
                    ${coupon.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${coupon.status === 'Available' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {coupon.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-300 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50/50 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </div>
      </div>
    </div>
  );
}