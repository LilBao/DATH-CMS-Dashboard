"use client"

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import svgPaths from "./imports/svg-pftphcbr1j";
import imgMoviePoster from "./imports/693faa473f27747a26199d53fbdd83da54af2322.png";
import imgMoviePoster1 from "./imports/8438a0d6694b198f9903cc656aa29f254f51c7f3.png";
import imgMoviePoster2 from "./imports/4476fcf216e10f8cee92560cbcbef0e3d2962f33.png";
import { movieService, MovieResponse } from '@/services/movieService';
import { orderService, OrderResponse } from '@/services/orderService';
import { customerService, CustomerResponse } from '@/services/customerService';
import { reportService, DailyRevenueResponse, OccupancyResponse, DashboardOverviewResponse } from '@/services/reportService';
import { branchService, BranchResponse } from '@/services/branchService';
import { useAuthStore } from '@/stores/authStore';
import { useSystemStore } from '@/stores/systemStore';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { 
  DollarSign, 
  Ticket, 
  Users, 
  Film, 
  MessageSquare, 
  Star,
  TrendingUp
} from 'lucide-react';

// --- COMPONENTS ---

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="flex flex-col font-bold justify-center leading-[55px] text-[#2d3337] text-[44px] tracking-[-1.1px] w-full">
        <p>Dashboard Overview</p>
      </div>
    </div>
  );
}

function Container({ isManager, branches, selectedBranchId, setSelectedBranchId }: any) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <Heading />
      <div className="flex items-center gap-3">
        <div className="text-[#596063] text-[14px]">
          <p>{isManager ? 'Real-time performance metrics for your branch.' : 'Real-time performance metrics for Cinema.'}</p>
        </div>
        {!isManager && (
          <select 
            value={selectedBranchId} 
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map((b: any) => (
              <option key={b.branchId} value={b.branchId}>{b.bName}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Reusable KPI Card Component
function KpiCard({ title, value, Icon, iconColor, trend, isCurrency = false }: any) {
  const formatCurrency = useSystemStore(state => state.formatCurrency);
  return (
    <div className="bg-white p-6 relative rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] flex flex-col justify-between h-[204px]">
      <div className="flex items-start justify-between">
        <div className="h-[38px] w-[38px] rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${iconColor}1A` }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div className="bg-[rgba(111,251,190,0.2)] px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#006D4A]" />
          <span className="text-[#006d4a] text-[12px] font-semibold">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-[12px] font-bold text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase">{title}</p>
        <p className="text-[24px] font-black text-[#2d3337] mt-1">
          {isCurrency ? formatCurrency(value) : value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: DailyRevenueResponse[] }) {
  const formatCurrency = useSystemStore(state => state.formatCurrency);
  
  // Fill gaps for the last 7 days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(new Date(), -i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const existing = data.find(d => d.date === dateStr);
      days.push({
        date: dateStr,
        revenue: existing?.revenue || 0,
        label: format(date, 'EEE')
      });
    }
    return days;
  }, [data]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

  return (
    <div className="bg-white col-[1/span_2] rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-[18px] font-bold text-[#2d3337]">Revenue Analytics</h4>
          <p className="text-[12px] text-[#596063]">Daily revenue trends (Last 7 Days)</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#f1f4f6] px-3 py-1 rounded-lg text-[12px] font-bold text-[#596063]">Month</button>
          <button className="bg-[#4a4bd7] px-3 py-1 rounded-lg text-[12px] font-bold text-white shadow-sm">Week</button>
        </div>
      </div>
      <div className="h-[256px] flex items-end justify-between gap-2 md:gap-4 px-2">
        {chartData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full max-w-[60px]">
            <div className="flex-1 w-full bg-indigo-50/30 rounded-t-xl relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#4a4bd7] rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-110"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2d3337] text-white text-[10px] py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20 pointer-events-none">
                  {formatCurrency(day.revenue)}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OccupancyChart({ rate, latestMovies }: { rate: number, latestMovies: MovieResponse[] }) {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] relative h-[424px]">
      <h4 className="text-[18px] font-bold text-[#2d3337]">Seat Occupancy</h4>
      <p className="text-[12px] text-[#596063] mb-8">Average across all current screenings</p>

      <div className="flex justify-center my-10 relative">
        <svg className="size-[192px]" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="80" stroke="#EAEEF1" strokeWidth="16" fill="none" />
          <circle
            cx="96" cy="96" r="80"
            stroke="#4A4BD7" strokeWidth="20" fill="none"
            strokeDasharray={`${(rate / 100) * 502} 502`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-extrabold text-[#2d3337]">{Math.round(rate)}%</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average</span>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
        {latestMovies.slice(0, 3).map((movie, i) => (
          <div key={i} className="flex justify-between items-center text-[12px]">
            <div className="flex items-center gap-2 truncate mr-2">
              <div className="size-2 shrink-0 rounded-full bg-[#4a4bd7]" />
              <span className="text-[#596063] truncate">{movie.mName}</span>
            </div>
            <span className="font-bold text-[#2d3337] shrink-0">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrders({ orders }: { orders: OrderResponse[] }) {
  const router = useRouter();
  const formatCurrency = useSystemStore(state => state.formatCurrency);
  return (
    <div className="bg-white col-[1/span_2] rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] p-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[18px] font-bold text-[#2d3337]">Recent Orders</h4>
        <button onClick={() => router.push('/orders')} className="text-[#4a4bd7] text-[12px] font-bold hover:underline">View All Orders</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="pb-4">Transaction ID</th>
            <th className="pb-4">Customer</th>
            <th className="pb-4">Movie</th>
            <th className="pb-4">Status</th>
            <th className="pb-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order, i) => (
            <tr key={order.orderId || i} className="text-sm">
              <td className="py-4 font-medium text-indigo-600">#{order.orderId}</td>
              <td className="py-4 font-semibold text-[#2d3337]">{order.customer?.cName || `Guest #${order.orderId % 1000}`}</td>
              <td className="py-4 text-[#596063] truncate max-w-[200px]">
                {order.ticketDetails?.[0]?.movieName || "Combo/Product Only"}
              </td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.orderStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.orderStatus}
                </span>
              </td>
              <td className="py-4 text-right font-bold text-[#2d3337]">{formatCurrency(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LatestMovies({ movies }: { movies: MovieResponse[] }) {
  const router = useRouter();
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[18px] font-bold text-[#2d3337]">Latest Releases</h4>
        <button onClick={() => router.push('/movies')} className="text-[#4a4bd7] text-[12px] font-bold hover:underline">Manage</button>
      </div>
      <div className="space-y-4">
        {movies.map((movie, i) => (
          <div key={movie.movieId || i} className="flex gap-4 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
            <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm">
              <Image
                alt={movie.mName || "Movie"}
                src={movie.posterUrl || imgMoviePoster}
                fill className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h5 className="text-sm font-bold text-[#2d3337] line-clamp-1">{movie.mName}</h5>
              <p className="text-[10px] text-gray-400 uppercase font-medium">{(movie.genres && movie.genres[0]) || 'Unknown'} • {movie.runTime} MIN</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${new Date(movie.releaseDate).getTime() > Date.now() ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {new Date(movie.releaseDate).getTime() > Date.now() ? 'Coming Soon' : 'Now Showing'}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">• Info</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const managerBranchId = user?.branchId;
  const activeBranchId = isManager 
    ? managerBranchId 
    : (selectedBranchId !== 'all' ? Number(selectedBranchId) : undefined);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const bData = await branchService.getAll();
        setBranches(Array.isArray(bData) ? bData : []);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    if (!isManager) {
      fetchBranches();
    }
  }, [isManager]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getOverview(activeBranchId);
        setOverview(data);
      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [activeBranchId]);

  // Tính toán doanh thu thực tế
  // Real Analytics derived from generalStats
  // Derived data from unified overview
  const totalRevenue = overview?.totalRevenue || 0;
  const totalTickets = overview?.ticketsSold || 0;
  const activeMoviesCount = overview?.activeMovies || 0;
  const totalCustomers = overview?.totalCustomers || 0;
  const totalReviews = overview?.totalReviews || 0;
  const averageRating = overview?.averageRating || 0;
  const dailyRevenue = overview?.revenueTrends || [];
  const occupancyRate = overview?.seatOccupancy || 0;
  const orders = overview?.recentOrders || [];
  const movies = overview?.latestMovies || [];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 font-black text-gray-300 animate-pulse tracking-[10px] uppercase">
        Loading Cinema Data...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-[#FBF7FF] min-h-screen">
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[48px] px-[32px] relative w-full">
        <Container isManager={isManager} branches={branches} selectedBranchId={selectedBranchId} setSelectedBranchId={setSelectedBranchId} />

        {/* KPI Grid - Giờ đây đã lấy dữ liệu thật */}
        <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 relative shrink-0 w-full">
          <KpiCard
            title="Total Revenue"
            value={totalRevenue}
            isCurrency={true}
            Icon={DollarSign}
            iconColor="#4A4BD7"
            trend="Real-time"
          />
          <KpiCard
            title="Tickets Sold"
            value={totalTickets}
            Icon={Ticket}
            iconColor="#842CD3"
            trend="Active"
          />
          <KpiCard
            title="Occupancy"
            value={`${occupancyRate}%`}
            Icon={Users}
            iconColor="#006D4A"
            trend="Efficiency"
          />
          <KpiCard
            title="Active Movies"
            value={activeMoviesCount}
            Icon={Film}
            iconColor="#ef4444"
            trend="In Theaters"
          />
          <KpiCard
            title="Total Reviews"
            value={totalReviews}
            Icon={MessageSquare}
            iconColor="#8b5cf6"
            trend="Feedback"
          />
          <KpiCard
            title="Avg. Rating"
            value={`${averageRating} / 5`}
            Icon={Star}
            iconColor="#f59e0b"
            trend="Quality"
          />
        </div>

        {/* Charts Layout */}
        <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-3 w-full">
          <RevenueChart data={dailyRevenue} />
          <OccupancyChart rate={occupancyRate} latestMovies={movies} />
        </div>

        {/* Tables & Columns */}
        <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-3 w-full">
          <RecentOrders orders={orders} />
          <LatestMovies movies={movies} />
        </div>
      </div>
    </div>
  );
}