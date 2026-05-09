"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Download, Popcorn, MessageSquare, 
  DollarSign, Ticket, Users, Activity, Loader2,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Calendar, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { reportService, DailyRevenueResponse, MovieRevenueResponse, OccupancyResponse } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format } from 'date-fns';

type TimeRange = '30days' | 'quarterly' | 'custom';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    daily: DailyRevenueResponse[];
    movie: MovieRevenueResponse[];
    occupancy: OccupancyResponse[];
  }>({
    daily: [],
    movie: [],
    occupancy: []
  });

  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const branchId = isManager ? user?.branchId : undefined;

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data based on role
      const [dailyRev, movieRev, occupancy] = await Promise.all([
        reportService.getDailyRevenue(undefined, undefined, branchId),
        reportService.getMovieRevenue(undefined, undefined, branchId),
        reportService.getOccupancyRate(branchId?.toString())
      ]);
      
      setData({
        daily: Array.isArray(dailyRev) ? dailyRev : [],
        movie: Array.isArray(movieRev) ? movieRev : [],
        occupancy: Array.isArray(occupancy) ? occupancy : []
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Không thể nạp dữ liệu báo cáo từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [branchId]);

  const stats = useMemo(() => {
    const totalRevenue = data.daily.reduce((sum, item) => sum + item.revenue, 0);
    const totalTickets = data.daily.reduce((sum, item) => sum + item.ticketCount, 0);
    const avgOccupancy = data.occupancy.length > 0 
      ? data.occupancy.reduce((sum, item) => sum + item.occupancyRate, 0) / data.occupancy.length 
      : 0;
    const topMovie = data.movie.length > 0 
      ? data.movie.sort((a, b) => b.revenue - a.revenue)[0].movieName 
      : 'N/A';

    return [
      { 
        title: 'Tổng doanh thu', 
        value: `${totalRevenue.toLocaleString()} ₫`, 
        trend: '+12.5%', 
        isPositive: true, 
        icon: <DollarSign className="w-5 h-5" />,
        color: 'indigo'
      },
      { 
        title: 'Vé đã bán', 
        value: totalTickets.toLocaleString(), 
        trend: '+8.2%', 
        isPositive: true, 
        icon: <Ticket className="w-5 h-5" />,
        color: 'emerald'
      },
      { 
        title: 'Tỷ lệ lấp đầy TB', 
        value: `${avgOccupancy.toFixed(1)}%`, 
        trend: '+4.1%', 
        isPositive: true, 
        icon: <Users className="w-5 h-5" />,
        color: 'purple'
      },
      { 
        title: 'Phim hot nhất', 
        value: topMovie, 
        trend: 'Thịnh hành', 
        isPositive: true, 
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'rose'
      }
    ];
  }, [data]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2.2px] mb-1 block">Analytics Dashboard</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-500 font-medium">
            {isManager ? `Dữ liệu tại chi nhánh của bạn` : 'Toàn bộ hệ thống CMS Cinema'}
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between h-[180px] transition-all hover:shadow-md group">
            <div className="flex items-center justify-between w-full">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <span className="text-2xl font-black text-gray-800 tracking-tighter truncate block">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        {/* Doanh thu hàng ngày */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Biểu đồ doanh thu</h3>
              <p className="text-sm text-gray-400 font-medium">Thống kê doanh thu theo từng ngày</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dữ liệu thực tế</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  tickFormatter={(str) => format(new Date(str), 'dd/MM')}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Phim theo doanh thu */}
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[450px]">
          <h3 className="text-xl font-black text-gray-800 mb-6 tracking-tight uppercase">Top phim doanh thu</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.movie} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="movieName" 
                  type="category" 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#4b5563' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" radius={[0, 10, 10, 0]}>
                  {data.movie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Occupancy Detail Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Chi tiết tỷ lệ lấp đầy</h3>
            <p className="text-sm text-gray-400 font-medium">Thống kê hiệu suất theo từng suất chiếu</p>
          </div>
          <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
            <Filter className="w-3 h-3" /> Lọc suất chiếu
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phim / Suất chiếu</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Phòng</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vé đã bán</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tỷ lệ lấp đầy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.occupancy.slice(0, 10).map((occ, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">{occ.movieName}</span>
                      <span className="text-[10px] font-bold text-indigo-500">{occ.startTime}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-500">{format(new Date(occ.day), 'dd/MM/yyyy')}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black text-gray-600 uppercase">Room {occ.roomId}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-gray-800">{occ.ticketsSold}</span>
                      <span className="text-[9px] font-bold text-gray-400">/ {occ.capacity || 'N/A'} ghế</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${occ.occupancyRate > 70 ? 'bg-emerald-500' : occ.occupancyRate > 30 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                          style={{ width: `${occ.occupancyRate}%` }} 
                        />
                      </div>
                      <span className="text-xs font-black text-gray-700 w-10">{occ.occupancyRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.occupancy.length > 10 && (
            <div className="p-4 text-center">
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                Xem thêm {data.occupancy.length - 10} suất chiếu khác
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}