"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Plus, FileText, CreditCard, Clock, 
  ChevronRight, MoreHorizontal, Download, 
  Filter, User, Mail, Ticket, Printer, 
  Send, RefreshCcw, TrendingUp, ShoppingBag, 
  AlertCircle, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

const API_URL = 'http://localhost:3001/orders';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders from API.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Sales</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Orders & Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor real-time transactions and manage customer bookings.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Daily Revenue", val: "$4,280.50", trend: "+12%", icon: <DollarSign className="text-indigo-600" />, bg: "bg-indigo-50" },
          { label: "Tickets Sold", val: "842", trend: "+5%", icon: <Ticket className="text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Pending Orders", val: "14", trend: "-2%", icon: <Clock className="text-amber-600" />, bg: "bg-amber-50" },
          { label: "Refunds", val: "$120.00", trend: "Stable", icon: <RefreshCcw className="text-rose-600" />, bg: "bg-rose-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-4 left-4 w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div className="mt-12">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-800 mt-1">{stat.val}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-gray-800">Recent Transactions</h2>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Payment Method</th>
                <th className="px-8 py-5">Time</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <span className="font-mono font-bold text-indigo-600 text-sm">{order.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{order.customerName}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100/50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500">
                    {order.time}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white rounded-xl shadow-sm text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-xl shadow-sm text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}