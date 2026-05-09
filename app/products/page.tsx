"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Package, 
  ShoppingCart, AlertTriangle, Edit, Trash2, 
  Loader2, UtensilsCrossed, Gift, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { productService, Product } from '@/services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'Food' | 'Merchandise'>('Food');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dữ liệu thực tế
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      const rawData = Array.isArray(data) ? data : data.data ?? [];
      setProducts(rawData);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tính toán số liệu thống kê
  const stats = useMemo(() => {
    const totalItems = products.length;
    const merchandiseCount = products.filter(p => p.type === 'Merchandise').length;
    const lowStockAlerts = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    return {
      totalItems: totalItems.toLocaleString(),
      merchandiseCount: merchandiseCount.toLocaleString(),
      lowStockAlerts
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.type === activeTab && 
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, activeTab, searchQuery]);

  const getStatusStyle = (status: Product['status']) => {
    switch (status) {
      case 'In Stock': return 'text-emerald-600 bg-emerald-50';
      case 'Low Stock': return 'text-amber-600 bg-amber-50';
      case 'Out of Stock': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20 px-4">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Inventory</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Products</h1>
          <p className="text-gray-500 font-medium">Quản lý kho hàng từ bắp nước đến các vật phẩm sưu tầm.</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 uppercase text-xs">
          <Plus className="w-5 h-5" /> Thêm sản phẩm
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Inventory</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng mặt hàng</p>
          <p className="text-4xl font-black text-gray-800 mt-1">{stats.totalItems}</p>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg uppercase">Merch</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm lưu niệm</p>
          <p className="text-4xl font-black text-gray-800 mt-1">{stats.merchandiseCount}</p>
        </div>

        <div className={`bg-white p-6 rounded-[32px] shadow-sm border transition-transform hover:scale-[1.02] ${stats.lowStockAlerts > 0 ? 'border-rose-100 bg-rose-50/10' : 'border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${stats.lowStockAlerts > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            {stats.lowStockAlerts > 0 && <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase animate-pulse">Cảnh báo</span>}
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${stats.lowStockAlerts > 0 ? 'text-rose-500' : 'text-gray-400'}`}>Sắp hết hàng</p>
          <p className="text-4xl font-black text-gray-800 mt-1">{stats.lowStockAlerts}</p>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-4 bg-gray-50/30">
          <button 
            onClick={() => setActiveTab('Food')}
            className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Food' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Food & Drinks
          </button>
          <button 
            onClick={() => setActiveTab('Merchandise')}
            className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Merchandise' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <Gift className="w-4 h-4" /> Merchandise
          </button>
        </div>

        {/* Controls */}
        <div className="p-8 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã sản phẩm..." 
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-gray-50 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5">Product ID</th>
                <th className="px-8 py-5">Chi tiết sản phẩm</th>
                <th className="px-8 py-5">Danh mục</th>
                <th className="px-8 py-5">Đơn giá</th>
                <th className="px-8 py-5">Số lượng tồn</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <span className="font-mono font-black text-indigo-600 text-xs bg-indigo-50 px-3 py-1 rounded-lg">#{p.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tighter">{p.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-1 line-clamp-1 italic">{p.description || "Chưa có mô tả"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        defaultValue={p.quantity} 
                        className="w-20 bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase px-3 py-1 rounded-full w-fit ${getStatusStyle(p.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'In Stock' ? 'bg-emerald-500' : p.status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      {p.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Không tìm thấy sản phẩm nào trong danh mục này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Hiển thị {filteredProducts.length} trên tổng số {products.length} sản phẩm
          </p>
          <div className="flex gap-2">
            <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100">1</button>
            <button className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-xl font-black text-xs hover:bg-gray-50 transition-all">2</button>
            <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}