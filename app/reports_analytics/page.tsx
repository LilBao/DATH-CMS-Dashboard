"use client";

import { useState, useEffect } from 'react';
import { 
  Download, TrendingUp, TrendingDown, Popcorn, 
  MessageSquare, ChevronRight, CalendarDays,
  DollarSign, Ticket, Users, Activity
} from 'lucide-react';
import { toast } from 'sonner';

type TimeRange = '30days' | 'quarterly' | 'custom';

const ORDERS_API = 'http://localhost:3001/orders';
const MOVIES_API = 'http://localhost:3001/movies';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [customDate, setCustomDate] = useState({ start: '', end: '' });
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '$0.00', trend: '+0.0%', isPositive: true },
    { title: 'Tickets Sold', value: '0', trend: '+0.0%', isPositive: true },
    { title: 'Avg. Attendance', value: '0%', trend: '+0.0%', isPositive: true },
    { title: 'Concessions', value: '$0.00', trend: '+0.0%', isPositive: true }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, moviesRes] = await Promise.all([
          fetch(ORDERS_API),
          fetch(MOVIES_API)
        ]);
        const orders = await ordersRes.json();
        const movies = await moviesRes.json();

        const totalRev = orders.reduce((acc: number, curr: any) => acc + curr.total, 0);
        const totalTickets = orders.length * 2;

        setStats([
          { title: 'Total Revenue', value: `$${totalRev.toLocaleString()}`, trend: '+12.5%', isPositive: true },
          { title: 'Tickets Sold', value: totalTickets.toString(), trend: '+8.2%', isPositive: true },
          { title: 'Avg. Attendance', value: '64%', trend: '-2.4%', isPositive: false },
          { title: 'Concessions', value: '$45,820', trend: '+15.1%', isPositive: true }
        ]);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };
    fetchData();
  }, [timeRange]);

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2.2px] mb-1 block">Performance Overview</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Reports & Analytics</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-xl flex font-medium text-sm">
            {['30days', 'quarterly', 'custom'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {range === '30days' ? 'Last 30 Days' : range}
              </button>
            ))}
          </div>

          <button className="bg-[#4a4bd7] hover:bg-blue-700 shadow-lg shadow-indigo-100 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                {idx === 0 ? <DollarSign className="w-5 h-5" /> : idx === 1 ? <Ticket className="w-5 h-5" /> : idx === 2 ? <Users className="w-5 h-5" /> : <Popcorn className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <span className="text-2xl font-black text-gray-800">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-800">Peak Attendance Hours</h3>
              <p className="text-sm text-gray-400 font-medium">Visitor distribution across all showtimes</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase">Weekdays</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-300" />
                <span className="text-[10px] font-black text-gray-400 uppercase">Weekends</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-gray-100 relative">
             {/* Mock Chart Bars[cite: 3] */}
             {[40, 60, 45, 90, 75, 30, 85, 50].map((h, i) => (
               <div key={i} className="w-12 flex flex-col items-center gap-1 group">
                 <div className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all rounded-t-lg" style={{ height: `${h}%` }} />
                 <div className="w-full bg-purple-300 group-hover:bg-purple-400 transition-all rounded-t-lg" style={{ height: `${h * 0.7}%` }} />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            <span>10AM</span><span>12PM</span><span>2PM</span><span>4PM</span><span>6PM</span><span>8PM</span><span>10PM</span><span>12AM</span>
          </div>
        </div>

        <div className="col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8">Revenue by Branch</h3>
          <div className="space-y-8">
            {[
              { name: 'Grand Plaza', val: '$52.4k', p: 85, color: 'bg-indigo-600' },
              { name: 'Starlight Cinema', val: '$38.1k', p: 65, color: 'bg-purple-500' },
              { name: 'Eastside Mall', val: '$29.8k', p: 50, color: 'bg-emerald-500' }
            ].map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-black mb-2">
                  <span className="text-gray-700">{b.name}</span>
                  <span className="text-indigo-600">{b.val}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all duration-1000`} style={{ width: `${b.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards[cite: 3] */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[32px] text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-100">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Popcorn className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black mb-2">Concessions Deep Dive</h3>
            <p className="text-indigo-100 text-sm font-medium mb-6 max-w-sm">Popcorn and beverage sales increased by 15% this month due to "Movie Combo" promotion.</p>
            <span className="text-xs font-black uppercase tracking-widest border-b-2 border-white/30 pb-1 group-hover:border-white transition-all">Analyze Menu Performance</span>
          </div>
          <Activity className="absolute -right-4 -bottom-4 w-40 h-40 text-white/5 rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Customer Feedback</h3>
            <p className="text-gray-400 text-sm font-medium mb-6 max-w-sm">Average customer satisfaction is 4.8/5 based on 2,400 post-show surveys.</p>
            <span className="text-xs font-black text-purple-600 uppercase tracking-widest border-b-2 border-purple-100 pb-1 group-hover:border-purple-600 transition-all">Read Reviews</span>
          </div>
        </div>
      </div>

    </div>
  );
}