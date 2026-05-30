"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Download, Popcorn, DollarSign, Ticket, Users, Activity, Loader2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { reportService, DashboardOverviewResponse, BranchRevenueResponse } from '@/services/reportService';
import { productService, ProductResponse } from '@/services/productService';

type TimeRange = '30days' | 'quarterly' | 'custom';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [branchRevenues, setBranchRevenues] = useState<BranchRevenueResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  // Data fetching
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (timeRange === '30days') {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        startDate = start.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      }

      const [overviewData, branchData, productsData] = await Promise.all([
        reportService.getOverview(),
        reportService.getBranchRevenue(startDate, endDate),
        productService.getAll()
      ]);
      
      setOverview(overviewData);
      setBranchRevenues(branchData);
      setProducts(productsData);
    } catch (error) {
      toast.error("Không thể nạp dữ liệu báo cáo thống kê từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Analytics calculations
  const stats = useMemo(() => {
    if (!overview) return [];

    const concessionRev = products
      .filter((p: any) => p.itemType === 'FOOD_DRINK')
      .reduce((acc, curr: any) => acc + (curr.price * curr.quantity), 0);

    return [
      { title: 'Tổng doanh thu', value: `$${overview.totalRevenue.toLocaleString()}`, trend: '+12.5%', isPositive: true, icon: <DollarSign className="w-5 h-5" /> },
      { title: 'Vé đã bán', value: overview.ticketsSold.toLocaleString(), trend: '+8.2%', isPositive: true, icon: <Ticket className="w-5 h-5" /> },
      { title: 'Tỷ lệ lấp đầy', value: `${overview.seatOccupancy}%`, trend: '+4.1%', isPositive: true, icon: <Users className="w-5 h-5" /> },
      { title: 'Dịch vụ ăn uống', value: `$${concessionRev.toLocaleString()}`, trend: '+15.1%', isPositive: true, icon: <Popcorn className="w-5 h-5" /> }
    ];
  }, [overview, products]);

  // Export CSV logic
  const handleExportCSV = async () => {
    try {
      if (!overview || !overview.revenueTrends || overview.revenueTrends.length === 0) {
        toast.error("Không có dữ liệu xu hướng doanh thu để xuất file.");
        return;
      }

      const headers = ["Ngày", "Doanh Thu ($)", "Số Vé Bán Ra"];
      const rows = overview.revenueTrends.map(item => [
        item.date,
        item.revenue,
        item.ticketCount
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
      ].join("\n");

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `CGV_Daily_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Xuất file báo cáo doanh thu CSV thành công!");
    } catch (e) {
      toast.error("Lỗi khi xuất file báo cáo.");
    }
  };

  if (isLoading || !overview) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col pb-12 px-4">
      
      {/* Header section */}
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

          <button 
            onClick={handleExportCSV}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Kanban stats grid */}
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

      {/* Graphics & visual charts row */}
      <div className="grid grid-cols-12 gap-6 mb-10">
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
             {overview.revenueTrends.slice(0, 8).map((item, i) => {
               const maxRevenue = Math.max(...overview.revenueTrends.map(t => t.revenue)) || 1;
               const heightPercent = (item.revenue / maxRevenue) * 100;
               return (
                 <div key={i} className="w-14 flex flex-col items-center gap-1.5 group cursor-pointer">
                   <div className="w-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-all rounded-t-xl" style={{ height: `${heightPercent}%` }} />
                   <div className="w-full bg-purple-200 group-hover:bg-purple-400 transition-all rounded-t-xl shadow-inner" style={{ height: `${heightPercent * 0.6}%` }} />
                 </div>
               );
             })}
          </div>
          <div className="flex justify-between mt-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {overview.revenueTrends.slice(0, 8).map((item, i) => (
              <span key={i}>{item.date.split('-')[2]}</span>
            ))}
          </div>
        </div>

        <div className="col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tight uppercase">Doanh thu chi nhánh</h3>
          <div className="space-y-10">
            {branchRevenues.map((b, i) => {
              const maxBranchRevenue = Math.max(...branchRevenues.map(br => br.revenue)) || 1;
              const percent = (b.revenue / maxBranchRevenue) * 100;
              return (
                <div key={i} className="group cursor-default">
                  <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-tighter">
                    <span className="text-gray-700">{b.branchName}</span>
                    <span className="text-indigo-600 font-black">${b.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insight analytics action card */}
      <div 
        onClick={() => setIsMenuModalOpen(true)}
        className="bg-indigo-600 p-10 rounded-[32px] text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-200"
      >
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <Popcorn className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Concessions Analysis</h3>
          <p className="text-indigo-100 text-sm font-medium mb-8 max-w-xl leading-relaxed">
            Phân tích chi tiết hiệu suất kinh doanh quầy bắp nước. Doanh thu tăng mạnh nhờ vào các combo khuyến mãi đi kèm suất chiếu IMAX cao cấp. Click để xem chi tiết kho và bảng giá mặt hàng.
          </p>
          <div className="flex items-center gap-2 group-hover:gap-4 transition-all">
            <span className="text-xs font-black uppercase tracking-[2px]">Xem chi tiết thực đơn</span>
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <Activity className="absolute -right-8 -bottom-8 w-56 h-56 text-white/5 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
      </div>

      {/* Product menu detailed modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsMenuModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Chi tiết thực đơn & Kho hàng</h3>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">Concessions Menu Products</p>
            
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
              {products.map((product: any) => {
                const isFd = product.itemType === 'FOOD_DRINK';
                const name = isFd ? product.pName : product.merchName;
                const qty = isFd ? product.quantity : product.availNum;
                return (
                  <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{isFd ? product.pType : product.itemType}</span>
                      <h4 className="font-black text-gray-800 text-base">{name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-indigo-600 block">${product.price}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${qty > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        Kho: {qty} sản phẩm
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}