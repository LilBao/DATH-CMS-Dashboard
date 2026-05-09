"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Download, 
  MoreVertical, Trash2, Edit, Package, 
  ShoppingCart, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, UtensilsCrossed, Gift
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  type: 'Food' | 'Merchandise';
  description?: string;
}

const API_URL = 'http://localhost:3001/api/v1/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'Food' | 'Merchandise'>('Food');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to load products from API.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.type === activeTab && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Inventory</span>
          <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Products Management</h1>
          <p className="text-gray-500 text-sm mt-1">Control your cinema's revenue streams from popcorn to collectibles.</p>
        </div>
        <button className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
          <Plus className="w-5 h-5" /> New Product
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Items</p>
          <p className="text-3xl font-black text-gray-800 mt-1">1,248</p>
        </div>
        
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Stable</span>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Merchandise SKU</p>
          <p className="text-3xl font-black text-gray-800 mt-1">482</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-rose-100 bg-rose-50/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Critical</span>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-rose-500">Low Stock Alerts</p>
          <p className="text-3xl font-black text-gray-800 mt-1">14</p>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-4 bg-gray-50/30">
          <button 
            onClick={() => setActiveTab('Food')}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Food' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Food & Drinks
          </button>
          <button 
            onClick={() => setActiveTab('Merchandise')}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Merchandise' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <Gift className="w-4 h-4" /> Merchandise
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search product name or ID..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="px-8 py-4">Product ID</th>
                <th className="px-8 py-4">Product Details</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Stock Quantity</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-mono font-bold text-indigo-600 text-xs">{p.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 leading-tight">{p.name}</p>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-gray-800">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        defaultValue={p.quantity} 
                        className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-sm font-bold text-center outline-none"
                      />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-1.5 font-black text-[11px] uppercase ${p.status === 'In Stock' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'In Stock' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {p.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-300 hover:text-rose-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filteredProducts.length} of 24 products</p>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">1</button>
            <button className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">2</button>
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="mt-10 p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-[32px] relative overflow-hidden flex items-center justify-between shadow-xl shadow-indigo-200">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[1px]">Pro Tip</span>
          <h2 className="text-2xl font-black text-white mt-4 mb-2">Bundle Strategy Live Now</h2>
          <p className="text-white/80 text-sm font-medium">Try creating a 'Premiere Combo' with popcorn, soda, and limited merchandise to boost average order value by 15%.</p>
        </div>
        <button className="relative z-10 bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform active:scale-95">
          Configure Bundles
        </button>
        {/* Decorative Blurs */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}