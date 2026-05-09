"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, FileText, Clock,
  ChevronRight, Download,
  Ticket, Printer,
  RefreshCcw, DollarSign, Loader2,
  Trash2, Edit3, QrCode, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { orderService, Order } from '@/services/orderService';
import OrderFormModal from '../components/OrderFormModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State cho Modal Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch dữ liệu từ Service
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getAll();
      const rawOrders = Array.isArray(data) ? data : data.data ?? [];
      setOrders(rawOrders);
    } catch (error) {
      toast.error("Không thể nạp danh sách hóa đơn từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Chức năng Xóa
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    try {
      await orderService.delete(id);
      toast.success("Đã xóa hóa đơn thành công.");
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      toast.error("Lỗi khi xóa hóa đơn.");
    }
  };

  // Chức năng cập nhật trạng thái nhanh
  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success("Đã cập nhật trạng thái đơn hàng.");
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalTickets = orders.reduce((sum, order) => sum + (order.ticketQuantity || 0), 0);
    return {
      revenue: totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      tickets: totalTickets,
      pending: orders.filter(o => o.status === 'Pending').length
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Syncing Transactions...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20 px-4">

      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 pt-12">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Sales</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight uppercase">Orders & Tickets</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Giám sát giao dịch thời gian thực và quản lý vé đặt.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all text-xs uppercase tracking-wider">
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
          <button
            onClick={() => { setSelectedOrder(null); setIsModalOpen(true); }}
            className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all uppercase text-xs tracking-widest active:scale-95"
          >
            <Plus className="w-5 h-5" /> Tạo hóa đơn
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Tổng doanh thu", val: stats.revenue, trend: "+12%", icon: <DollarSign className="text-indigo-600" />, bg: "bg-indigo-50" },
          { label: "Vé đã bán", val: stats.tickets, trend: "+5%", icon: <Ticket className="text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Đơn chờ xử lý", val: stats.pending, trend: "-2%", icon: <Clock className="text-amber-600" />, bg: "bg-amber-50" },
          { label: "Hoàn tiền", val: "$120.00", trend: "Ổn định", icon: <RefreshCcw className="text-rose-600" />, bg: "bg-rose-50" }
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

      {/* Table Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Giao dịch gần đây</h2>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo ID hoặc tên khách..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="px-8 py-5 text-center">ID</th>
                <th className="px-8 py-5">Khách hàng</th>
                <th className="px-8 py-5">Tổng tiền</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Thanh toán</th>
                <th className="px-8 py-5">Thời gian</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                  <td className="px-8 py-5 text-center">
                    <span className="font-mono font-black text-indigo-600 text-xs bg-indigo-50 px-3 py-1 rounded-lg">#{order.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-indigo-100 uppercase">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{order.customerName}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800">
                    {order.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 bg-gray-100 w-fit px-3 py-1.5 rounded-lg border border-gray-200/50">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                    {order.time}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsModalOpen(true); }}
                        className="p-2.5 bg-white shadow-sm rounded-xl text-indigo-600 hover:bg-indigo-50 border border-indigo-100" title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                        className="p-2.5 bg-white shadow-sm rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-100" title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OrderFormModal */}
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
        onSuccess={fetchOrders}
        initialData={selectedOrder}
      />
    </div>
  );
}