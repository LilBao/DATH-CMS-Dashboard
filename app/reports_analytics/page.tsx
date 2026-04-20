"use client";

import { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Popcorn, MessageSquare, ChevronRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

type TimeRange = '30days' | 'quarterly' | 'custom';

const dataSets = {
  '30days': {
    stats: [
      { title: 'Total Revenue', value: '$142,500.00', trend: '+12.5%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' },
      { title: 'Tickets Sold', value: '12,408', trend: '+8.2%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' },
      { title: 'Avg. Attendance', value: '64%', trend: '-2.4%', isPositive: false, theme: 'bg-rose-100 text-rose-700' },
      { title: 'Concessions Revenue', value: '$45,820', trend: '+15.1%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' }
    ],
    branches: [
      { name: 'Downtown Cineplex', revenue: '$52.4k', percent: 85, color: 'bg-[#4a4bd7]' },
      { name: 'Northside Plaza', revenue: '$38.1k', percent: 65, color: 'bg-[#4a4bd7]/80' },
      { name: 'West End Galleria', revenue: '$29.8k', percent: 50, color: 'bg-[#4a4bd7]/60' },
      { name: 'East Gate Mall', revenue: '$22.2k', percent: 35, color: 'bg-[#4a4bd7]/40' }
    ],
    movies: [
      { title: 'Neon Paradox', gross: '$42,800', capacity: '92%', isTop: true, img: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
      { title: 'Stellar Voyage', gross: '$38,150', capacity: '88%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg' },
      { title: 'Midnight Shadows', gross: '$27,400', capacity: '75%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg' },
      { title: 'Aetheria Rising', gross: '$21,900', capacity: '62%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/fdZpvZCGvW0CRjqFfpAmsW4zO4P.jpg' }
    ],
    chart: {
      weekdays: [20, 35, 45, 80, 60, 15],
      weekends: [40, 60, 75, 95, 85, 30]
    }
  },
  'quarterly': {
    stats: [
      { title: 'Total Revenue', value: '$485,200.00', trend: '+18.4%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' },
      { title: 'Tickets Sold', value: '42,150', trend: '+14.2%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' },
      { title: 'Avg. Attendance', value: '72%', trend: '+5.1%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' },
      { title: 'Concessions Revenue', value: '$156,300', trend: '+22.5%', isPositive: true, theme: 'bg-emerald-100 text-emerald-700' }
    ],
    branches: [
      { name: 'Downtown Cineplex', revenue: '$185.2k', percent: 92, color: 'bg-[#4a4bd7]' },
      { name: 'Northside Plaza', revenue: '$120.4k', percent: 75, color: 'bg-[#4a4bd7]/80' },
      { name: 'West End Galleria', revenue: '$98.1k', percent: 60, color: 'bg-[#4a4bd7]/60' },
      { name: 'East Gate Mall', revenue: '$81.5k', percent: 45, color: 'bg-[#4a4bd7]/40' }
    ],
    movies: [
      { title: 'Dune: Part Two', gross: '$145,200', capacity: '96%', isTop: true, img: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc905.jpg' },
      { title: 'Oppenheimer', gross: '$112,800', capacity: '89%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
      { title: 'Neon Paradox', gross: '$95,400', capacity: '82%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
      { title: 'Aetheria Rising', gross: '$64,100', capacity: '68%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/fdZpvZCGvW0CRjqFfpAmsW4zO4P.jpg' }
    ],
    chart: {
      weekdays: [25, 45, 60, 90, 75, 25],
      weekends: [50, 75, 90, 100, 95, 45]
    }
  },
  'custom': {
    stats: [
      { title: 'Total Revenue', value: '$85,600.00', trend: '-5.2%', isPositive: false, theme: 'bg-rose-100 text-rose-700' },
      { title: 'Tickets Sold', value: '7,840', trend: '-2.1%', isPositive: false, theme: 'bg-rose-100 text-rose-700' },
      { title: 'Avg. Attendance', value: '58%', trend: '-8.5%', isPositive: false, theme: 'bg-rose-100 text-rose-700' },
      { title: 'Concessions Revenue', value: '$26,100', trend: '-1.4%', isPositive: false, theme: 'bg-rose-100 text-rose-700' }
    ],
    branches: [
      { name: 'Downtown Cineplex', revenue: '$32.1k', percent: 78, color: 'bg-[#4a4bd7]' },
      { name: 'Northside Plaza', revenue: '$24.5k', percent: 62, color: 'bg-[#4a4bd7]/80' },
      { name: 'West End Galleria', revenue: '$18.2k', percent: 45, color: 'bg-[#4a4bd7]/60' },
      { name: 'East Gate Mall', revenue: '$10.8k', percent: 25, color: 'bg-[#4a4bd7]/40' }
    ],
    movies: [
      { title: 'Stellar Voyage', gross: '$28,400', capacity: '85%', isTop: true, img: 'https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg' },
      { title: 'Midnight Shadows', gross: '$22,100', capacity: '78%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg' },
      { title: 'Dune: Part Two', gross: '$19,500', capacity: '72%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc905.jpg' },
      { title: 'Neon Paradox', gross: '$15,600', capacity: '60%', isTop: false, img: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' }
    ],
    chart: {
      weekdays: [15, 25, 35, 65, 50, 10],
      weekends: [30, 45, 60, 85, 70, 20]
    }
  }
};

const chartHours = ['10AM', '1PM', '4PM', '7PM', '10PM', '1AM'];

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [customDate, setCustomDate] = useState({ start: '', end: '' });

  const currentData = dataSets[timeRange];

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateChange = (field: 'start' | 'end', val: string) => {
    const year = val.split('-')[0];
    if (year && year.length > 4) return;
    setCustomDate(prev => ({ ...prev, [field]: val }));
  };

  const handleDateBlur = (field: 'start' | 'end') => {
    const val = customDate[field];
    if (!val) return;
    
    const selectedDate = new Date(val);
    const minDate = new Date('2000-01-01');
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (selectedDate < minDate) {
      setCustomDate(prev => ({ ...prev, [field]: '2000-01-01' }));
      toast.info("Đã đưa ngày về giới hạn tối thiểu (01/01/2000)");
    } else if (selectedDate > todayDate) {
      setCustomDate(prev => ({ ...prev, [field]: getTodayString() }));
      toast.info("Không thể chọn ngày tương lai. Đã tự động đưa về hôm nay.");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-12">
      
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2.2px] mb-1 block">Performance Overview</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Reports & Analytics</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-xl flex font-medium text-sm">
            <button 
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg transition-all ${timeRange === '30days' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeRange('quarterly')}
              className={`px-4 py-2 rounded-lg transition-all ${timeRange === 'quarterly' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'}`}
            >
              Quarterly
            </button>
            <button 
              onClick={() => setTimeRange('custom')}
              className={`px-4 py-2 rounded-lg transition-all ${timeRange === 'custom' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'}`}
            >
              Custom Range
            </button>
          </div>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                min="2000-01-01"
                max={getTodayString()}
                value={customDate.start} 
                onChange={(e) => handleDateChange('start', e.target.value)}
                onBlur={() => handleDateBlur('start')}
                className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer" 
              />
              <span className="text-gray-400 font-medium">-</span>
              <input 
                type="date"
                min="2000-01-01"
                max={getTodayString()}
                value={customDate.end} 
                onChange={(e) => handleDateChange('end', e.target.value)}
                onBlur={() => handleDateBlur('end')}
                className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer" 
              />
            </div>
          )}

          <button className="bg-[#4a4bd7] hover:bg-blue-700 shadow-[0_10px_15px_-3px_#c7d2fe] flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6 shrink-0">
        {currentData.stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[158px] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
                {stat.isPositive ? <TrendingUp className="w-5 h-5 text-gray-400" /> : <TrendingDown className="w-5 h-5 text-gray-400" />}
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.theme}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.title}</p>
              <span className="text-2xl font-black text-[#2d3337]">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6 shrink-0">
        
        <div className="col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[396px]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Peak Attendance Hours</h3>
              <p className="text-sm text-gray-500">Real-time visitor distribution per showtime</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4a4bd7]"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Weekdays</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4a6ff]"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Weekends</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end relative mt-10">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {chartHours.map((_, idx) => (
                <div key={idx} className="w-[40px] h-full flex items-end gap-1 group">
                  <div 
                    className="w-full bg-[#4a4bd7]/20 hover:bg-[#4a4bd7]/40 rounded-t-md transition-all duration-500 relative"
                    style={{ height: `${currentData.chart.weekdays[idx]}%` }}
                  ></div>
                  <div 
                    className="w-full bg-[#d4a6ff]/40 hover:bg-[#d4a6ff]/60 rounded-t-md transition-all duration-500 relative"
                    style={{ height: `${currentData.chart.weekends[idx]}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 pt-4 mt-2 border-t border-gray-100 z-10">
              {chartHours.map((hour, idx) => (
                <span key={idx} className="text-[10px] font-medium text-gray-500 w-[40px] text-center">{hour}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[396px]">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Revenue by Branch</h3>
          <div className="flex flex-col gap-6">
            {currentData.branches.map((branch, idx) => (
              <div key={idx} className="w-full animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-800">{branch.name}</span>
                  <span className="text-xs font-bold text-[#4a4bd7]">{branch.revenue}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${branch.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${branch.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Top Performing Movies</h3>
            <p className="text-sm text-gray-500">Ranked by gross revenue and seat occupancy</p>
          </div>
          <button className="text-sm font-bold text-[#4a4bd7] hover:text-blue-800 flex items-center gap-1">
            View All Listing <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {currentData.movies.map((movie, idx) => (
            <div key={idx} className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden relative bg-gray-100 shadow-sm group cursor-pointer">
                <img src={movie.img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60"></div>
                {movie.isTop && (
                  <div className="absolute top-3 right-3 bg-emerald-700 text-emerald-50 text-[10px] font-black px-2 py-1 rounded shadow-lg tracking-wider">
                    #1 SELLER
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2 truncate">{movie.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{movie.gross} Gross</span>
                  <span className="text-[11px] font-bold text-emerald-700">{movie.capacity} Capacity</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 shrink-0">
        <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100 flex items-center justify-between relative overflow-hidden group cursor-pointer">
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div>
            <h3 className="text-xl font-bold text-indigo-700 mb-2">Concessions Deep Dive</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-[80%]">Popcorn and beverage sales increased by 15% this month due to "Movie Combo" promotion.</p>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[1.2px] border-b-2 border-indigo-200 pb-1">Analyze Menu Performance</span>
          </div>
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 z-10">
            <Popcorn className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-purple-50/50 p-8 rounded-2xl border border-purple-100 flex items-center justify-between relative overflow-hidden group cursor-pointer">
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">Customer Feedback</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-[80%]">Average customer satisfaction is 4.8/5 based on 2,400 post-show surveys.</p>
            <span className="text-xs font-black text-purple-600 uppercase tracking-[1.2px] border-b-2 border-purple-200 pb-1">Read Reviews</span>
          </div>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0 z-10">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

    </div>
  );
}