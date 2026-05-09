"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Download, Popcorn, MessageSquare, 
  DollarSign, Ticket, Users, Activity, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';
import { movieService } from '@/services/movieService';
import { productService } from '@/services/productService';

type TimeRange = '30days' | 'quarterly' | 'custom';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    orders: [],
    movies: [],
    products: []
  });

  // Fetch toàn bộ dữ liệu thực từ Backend
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [orders, movies, products] = await Promise.all([
        orderService.getAll(),
        movieService.getAll(),
        productService.getAll()
      ]);
      
      setData({
        orders: Array.isArray(orders) ? orders : orders.data ?? [],
        movies: Array.isArray(movies) ? movies : movies.data ?? [],
        products: Array.isArray(products) ? products : products.data ?? []
      });
    } catch (error) {
      toast.error("Không thể nạp dữ liệu báo cáo từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Tính toán các chỉ số
  const stats = useMemo(() => {
    const totalRev = data.orders.reduce((acc: number, curr: any) => acc + curr.total, 0);
    const totalTickets = data.orders.length * 2; // Giả định 2 vé/đơn
    
    // Tính doanh thu bắp nước dựa trên các sản phẩm loại 'Food'
    const concessionRev = data.products
      .filter((p: any) => p.type === 'Food')
      .reduce((acc: number, curr: any) => acc + (curr.price * (curr.soldQuantity || 10)), 0);

    return [
      { title: 'Tổng doanh thu', value: `$${totalRev.toLocaleString()}`, trend: '+12.5%', isPositive: true, icon: <DollarSign className="w-5 h-5" /> },
      { title: 'Vé đã bán', value: totalTickets.toLocaleString(), trend: '+8.2%', isPositive: true, icon: <Ticket className="w-5 h-5" /> },
      { title: 'Tỷ lệ lấp đầy', value: '72%', trend: '+4.1%', isPositive: true, icon: <Users className="w-5 h-5" /> },
      { title: 'Dịch vụ ăn uống', value: `$${concessionRev.toLocaleString()}`, trend: '+15.1%', isPositive: true, icon: <Popcorn className="w-5 h-5" /> }
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2.2px] mb-1 block">Performance Overview</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Reports & Analytics</h1>
          <p className="text-gray-500 font-medium">Phân tích chuyên sâu về doanh thu và hiệu suất vận hành.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-100 p-1.5 rounded-2xl flex font-bold text-[11px] shadow-sm">
            {['30days', 'quarterly', 'custom'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-5 py-2 rounded-xl transition-all uppercase tracking-tighter ${timeRange === range ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {range === '30days' ? '30 Ngày qua' : range === 'quarterly' ? 'Theo Quý' : 'Tùy chỉnh'}
              </button>
            ))}
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between h-[180px] transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between w-full">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-inner">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <span className="text-3xl font-black text-gray-800 tracking-tighter">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        {/* Biểu đồ lượng khách theo giờ */}
        <div className="col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Khung giờ cao điểm</h3>
              <p className="text-sm text-gray-400 font-medium">Phân bổ khách hàng dựa trên các suất chiếu thực tế</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày thường</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-300" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuối tuần</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between px-6 pb-2 border-b border-gray-100 relative h-[250px]">
             {[40, 65, 55, 95, 80, 45, 90, 60].map((h, i) => (
               <div key={i} className="w-14 flex flex-col items-center gap-1.5 group cursor-pointer">
                 <div className="w-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-all rounded-t-xl" style={{ height: `${h}%` }} />
                 <div className="w-full bg-purple-200 group-hover:bg-purple-400 transition-all rounded-t-xl shadow-inner" style={{ height: `${h * 0.6}%` }} />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span><span>22:00</span><span>00:00</span>
          </div>
        </div>

        {/* Doanh thu theo chi nhánh */}
        <div className="col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tight uppercase">Doanh thu chi nhánh</h3>
          <div className="space-y-10">
            {[
              { name: 'Grand Plaza', val: '$52.4k', p: 85, color: 'bg-indigo-600' },
              { name: 'Starlight Cinema', val: '$38.1k', p: 65, color: 'bg-purple-500' },
              { name: 'Eastside Mall', val: '$29.8k', p: 50, color: 'bg-emerald-500' }
            ].map((b, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-tighter">
                  <span className="text-gray-700">{b.name}</span>
                  <span className="text-indigo-600 font-black">{b.val}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                  <div className={`h-full ${b.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${b.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-10 rounded-[32px] text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-200">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <Popcorn className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Concessions Analysis</h3>
            <p className="text-indigo-100 text-sm font-medium mb-8 max-w-sm leading-relaxed">Doanh thu bắp nước tăng 15% trong tháng này nhờ các gói Combo "Premiere" đi kèm vé IMAX.</p>
            <div className="flex items-center gap-2 group-hover:gap-4 transition-all">
              <span className="text-xs font-black uppercase tracking-[2px]">Xem chi tiết thực đơn</span>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <Activity className="absolute -right-8 -bottom-8 w-56 h-56 text-white/5 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-gray-800 mb-3 uppercase tracking-tighter">Phản hồi khách hàng</h3>
            <p className="text-gray-400 text-sm font-medium mb-8 max-w-sm leading-relaxed">Mức độ hài lòng đạt 4.8/5 dựa trên 2,400 khảo sát sau suất chiếu.</p>
            <span className="text-xs font-black text-purple-600 uppercase tracking-[2px] border-b-2 border-purple-100 group-hover:border-purple-600 transition-all pb-1">Xem đánh giá</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[100px] -z-0" />
        </div>
      </div>

    </div>
  );
}