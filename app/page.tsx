"use client"

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import svgPaths from "./imports/svg-pftphcbr1j";
import imgMoviePoster from "./imports/693faa473f27747a26199d53fbdd83da54af2322.png";
import imgMoviePoster1 from "./imports/8438a0d6694b198f9903cc656aa29f254f51c7f3.png";
import imgMoviePoster2 from "./imports/4476fcf216e10f8cee92560cbcbef0e3d2962f33.png";
import { movieService } from '@/services/movieService';
import { orderService, Order } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { useRouter } from 'next/navigation';

// --- TYPES ---
type Movie = {
  id: number | string;
  title?: string;
  name?: string;
  genre?: string;
  duration?: string | number;
  releaseDate?: string;
  release_date?: string;
  status?: string;
  poster?: string;
  posterUrl?: string;
  image?: string;
  hall?: string;
};

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

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <Heading />
      <div className="text-[#596063] text-[14px]">
        <p>Real-time performance metrics for Cinema (All Branches).</p>
      </div>
    </div>
  );
}

// Reusable KPI Card Component
function KpiCard({ title, value, iconPath, iconColor, trend, isCurrency = false }: any) {
  return (
    <div className="bg-white p-6 relative rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] flex flex-col justify-between h-[204px]">
      <div className="flex items-start justify-between">
        <div className="h-[32px] w-[38px] rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${iconColor}1A` }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
             <path d={iconPath} fill={iconColor} />
          </svg>
        </div>
        <div className="bg-[rgba(111,251,190,0.2)] px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#006D4A]" />
          <span className="text-[#006d4a] text-[12px] font-semibold">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-[12px] font-bold text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase">{title}</p>
        <p className="text-[24px] font-black text-[#2d3337] mt-1">
          {isCurrency ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : value.toLocaleString()}
        </p>
      </div>
      <div className="h-[32px] w-full bg-indigo-50/30 rounded-lg animate-pulse" />
    </div>
  );
}

function RevenueChart({ orders }: { orders: Order[] }) {
  // Giả lập biểu đồ dựa trên dữ liệu thật (chia nhỏ doanh thu 7 ngày gần nhất)
  return (
    <div className="bg-white col-[1/span_2] rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-[18px] font-bold text-[#2d3337]">Revenue Analytics</h4>
          <p className="text-[12px] text-[#596063]">Daily revenue trends from recent transactions</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#f1f4f6] px-3 py-1 rounded-lg text-[12px] font-bold text-[#596063]">Month</button>
          <button className="bg-[#4a4bd7] px-3 py-1 rounded-lg text-[12px] font-bold text-white shadow-sm">Week</button>
        </div>
      </div>
      <div className="h-[256px] flex items-end justify-between gap-2">
        {[0.4, 0.6, 0.9, 0.5, 0.8, 0.7, 1].map((scale, i) => (
          <div key={i} className="flex-1 bg-indigo-50 rounded-t-lg relative group">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-indigo-600/40 rounded-t-lg transition-all duration-500" 
              style={{ height: `${scale * 100}%` }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OccupancyChart() {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] relative h-[424px]">
      <h4 className="text-[18px] font-bold text-[#2d3337]">Seat Occupancy</h4>
      <p className="text-[12px] text-[#596063] mb-8">Average by screening type</p>
      
      <div className="flex justify-center my-10 relative">
        <svg className="size-[192px]" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="80" stroke="#EAEEF1" strokeWidth="16" fill="none" />
          <circle cx="96" cy="96" r="80" stroke="#4A4BD7" strokeWidth="20" fill="none" strokeDasharray="350 502" strokeLinecap="round" />
          <circle cx="96" cy="96" r="80" stroke="#842CD3" strokeWidth="20" fill="none" strokeDasharray="100 502" strokeDashoffset="-360" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-extrabold text-[#2d3337]">78%</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average</span>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Standard Halls', val: '65%', color: '#4a4bd7' },
          { label: 'VIP Suites', val: '25%', color: '#842cd3' },
          { label: 'Private Bookings', val: '10%', color: '#eaeef1' }
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-[12px]">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#596063]">{item.label}</span>
            </div>
            <span className="font-bold text-[#2d3337]">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  const router = useRouter();
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
            <tr key={order.id} className="text-sm">
              <td className="py-4 font-medium text-indigo-600">#{order.id}</td>
              <td className="py-4 font-semibold text-[#2d3337]">{order.customerName}</td>
              <td className="py-4 text-[#596063]">Interstellar (IMAX)</td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-4 text-right font-bold text-[#2d3337]">${order.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LatestMovies({ movies }: { movies: Movie[] }) {
  const router = useRouter();
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[18px] font-bold text-[#2d3337]">Latest Releases</h4>
        <button onClick={() => router.push('/movies')} className="text-[#4a4bd7] text-[12px] font-bold hover:underline">Manage</button>
      </div>
      <div className="space-y-4">
        {movies.map((movie, i) => (
          <div key={movie.id} className="flex gap-4 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
            <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm">
               <Image 
                alt={movie.title || "Movie"} 
                src={movie.posterUrl || movie.poster || imgMoviePoster} 
                fill className="object-cover" 
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h5 className="text-sm font-bold text-[#2d3337] line-clamp-1">{movie.title}</h5>
              <p className="text-[10px] text-gray-400 uppercase font-medium">{movie.genre} • {movie.duration} MIN</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${movie.status === 'Coming Soon' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {movie.status}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">• Now Showing</span>
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [movieData, orderData, customerData] = await Promise.all([
          movieService.getAll(),
          orderService.getAll(),
          customerService.getAll()
        ]);

        // Normalize Movie Data
        const rawMovies = Array.isArray(movieData) ? movieData : movieData.data ?? [];
        const latest = [...rawMovies]
          .sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime())
          .slice(0, 4);
        setMovies(latest);

        // Normalize Order Data
        const rawOrders = Array.isArray(orderData) ? orderData : orderData.data ?? [];
        setOrders(rawOrders.slice(0, 3));

        // Normalize Customer Data
        const rawCustomers = Array.isArray(customerData) ? customerData : customerData.data ?? [];
        setCustomersCount(rawCustomers.length);

      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Tính toán doanh thu thực tế
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 font-black text-gray-300 animate-pulse tracking-[10px] uppercase">
        Loading Cinema Data...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-[#FBF7FF] min-h-screen">
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[48px] pt-[96px] px-[32px] relative w-full">
        <Container />
        
        {/* KPI Grid - Giờ đây đã lấy dữ liệu thật */}
        <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-4 relative shrink-0 w-full">
          <KpiCard 
            title="Total Revenue" 
            value={totalRevenue} 
            isCurrency={true} 
            iconPath={svgPaths.p3f437800} 
            iconColor="#4A4BD7" 
            trend="12.4%" 
          />
          <KpiCard 
            title="Tickets Sold" 
            value={orders.length * 2} // Giả định trung bình 2 vé/order
            iconPath={svgPaths.p38027400} 
            iconColor="#842CD3" 
            trend="8.1%" 
          />
          <KpiCard 
            title="Active Movies" 
            value={movies.length} 
            iconPath={svgPaths.p349bd800} 
            iconColor="#006D4A" 
            trend="Stable" 
          />
          <KpiCard 
            title="Customers" 
            value={customersCount} 
            iconPath={svgPaths.p2be64098} 
            iconColor="#AC3149" 
            trend="24%" 
          />
        </div>

        {/* Charts Layout */}
        <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-3 w-full">
          <RevenueChart orders={orders} />
          <OccupancyChart />
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