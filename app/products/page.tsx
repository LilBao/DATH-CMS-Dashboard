"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Package, 
  ShoppingCart, AlertTriangle, Edit, Trash2, 
  Loader2, UtensilsCrossed, Gift, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { toast } from 'sonner';
import { productService, ProductResponse, FoodDrinkResponse, MerchandiseResponse } from '@/services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'FOOD_DRINK' | 'MERCHANDISE'>('FOOD_DRINK');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '', 
    imgUrl: '',
    startDate: '', 
    endDate: ''    
  });

  // Data fetching
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast.error("Vui lòng điền đầy đủ các trường thông tin bắt buộc.");
      return;
    }

    try {
      setIsSubmitting(true);
      let payload: any = {};

      if (activeTab === 'FOOD_DRINK') {
        payload = {
          pName: newProduct.name,
          pType: newProduct.category || "Snacks",
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity),
          imgUrl: newProduct.imgUrl || undefined
        };
      } else {
        if (!newProduct.startDate || !newProduct.endDate) {
          toast.error("Hàng lưu niệm yêu cầu nhập ngày bắt đầu và kết thúc chiến dịch.");
          setIsSubmitting(false);
          return;
        }
        payload = {
          merchName: newProduct.name,
          price: parseFloat(newProduct.price),
          availNum: parseInt(newProduct.quantity),
          startDate: newProduct.startDate,
          endDate: newProduct.endDate,
          imgUrl: newProduct.imgUrl || undefined
        };
      }

      await productService.create(payload);
      toast.success("Thêm sản phẩm mới thành công!");
      
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', quantity: '', category: '', imgUrl: '', startDate: '', endDate: '' });
      fetchProducts();
    } catch (error) {
      toast.error("Không thể thêm sản phẩm mới. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product logic
  const handleDeleteProduct = async (id: number, type: 'FOOD_DRINK' | 'MERCHANDISE') => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await productService.delete(id, type);
      toast.success("Xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error) {
      toast.error("Không thể xóa sản phẩm này.");
    }
  };

  // Export CSV logic
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error("Không có dữ liệu trong danh mục này để xuất file.");
      return;
    }

    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeTab === 'FOOD_DRINK') {
      headers = ["Product ID", "Tên Sản Phẩm", "Phân Loại", "Đơn Giá ($)", "Số Lượng Tồn", "Kiểu Mặt Hàng"];
      rows = filteredProducts.map(p => {
        const item = p as FoodDrinkResponse;
        return [item.productId, item.pName, item.pType, item.price, item.quantity, item.itemType];
      });
    } else {
      headers = ["Product ID", "Tên Mặt Hàng", "Đơn Giá ($)", "Số Lượng Có Sẵn", "Ngày Bắt Đầu", "Ngày Kết Thúc", "Kiểu Mặt Hàng"];
      rows = filteredProducts.map(p => {
        const item = p as MerchandiseResponse;
        return [item.productId, item.merchName, item.price, item.availNum, item.startDate, item.endDate, item.itemType];
      });
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(","))
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CGV_${activeTab}_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Xuất file danh sách ${activeTab === 'FOOD_DRINK' ? 'Bắp nước' : 'Quà lưu niệm'} thành công!`);
  };

  // Analytics & Filters
  const stats = useMemo(() => {
    const totalItems = products.length;
    const merchandiseCount = products.filter(p => p.itemType === 'MERCHANDISE').length;
    
    const lowStockAlerts = products.filter(p => {
      if (p.itemType === 'FOOD_DRINK') {
        return (p as FoodDrinkResponse).quantity <= 15;
      } else {
        return (p as MerchandiseResponse).availNum <= 15;
      }
    }).length;

    return {
      totalItems: totalItems.toLocaleString(),
      merchandiseCount: merchandiseCount.toLocaleString(),
      lowStockAlerts
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.itemType !== activeTab) return false;
      
      const name = p.itemType === 'FOOD_DRINK' 
        ? (p as FoodDrinkResponse).pName 
        : (p as MerchandiseResponse).merchName;
      
      const idStr = p.productId.toString();
      
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             idStr.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [products, activeTab, searchQuery]);

  const getStockStatus = (p: ProductResponse) => {
    const qty = p.itemType === 'FOOD_DRINK' ? (p as FoodDrinkResponse).quantity : (p as MerchandiseResponse).availNum;
    if (qty === 0) return { text: 'Out of Stock', style: 'text-rose-600 bg-rose-50', dot: 'bg-rose-500' };
    if (qty <= 15) return { text: 'Low Stock', style: 'text-amber-600 bg-amber-50', dot: 'bg-amber-500' };
    return { text: 'In Stock', style: 'text-emerald-600 bg-emerald-50', dot: 'bg-emerald-500' };
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
      
      {/* Header section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mb-1 block">Inventory</span>
          <h1 className="text-[44px] font-black text-[#2d3337] tracking-tighter leading-tight uppercase">Products</h1>
          <p className="text-gray-500 font-medium">Quản lý kho hàng từ bắp nước đến các vật phẩm sưu tầm.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#4a4bd7] hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Plus className="w-5 h-5" /> Thêm sản phẩm
        </button>
      </div>

      {/* Overview stats cards */}
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

      {/* Product controls & table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="flex border-b border-gray-100 px-6 pt-4 bg-gray-50/30">
          <button 
            onClick={() => setActiveTab('FOOD_DRINK')}
            className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'FOOD_DRINK' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Food & Drinks
          </button>
          <button 
            onClick={() => setActiveTab('MERCHANDISE')}
            className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'MERCHANDISE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
          >
            <Gift className="w-4 h-4" /> Merchandise
          </button>
        </div>

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
            <button 
              onClick={handleExportCSV}
              className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5">Product ID</th>
                <th className="px-8 py-5">Chi tiết sản phẩm</th>
                <th className="px-8 py-5">Danh mục / Thời hạn</th>
                <th className="px-8 py-5">Đơn giá</th>
                <th className="px-8 py-5">Số lượng tồn</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                const statusInfo = getStockStatus(p);
                const isFd = p.itemType === 'FOOD_DRINK';
                const pName = isFd ? (p as FoodDrinkResponse).pName : (p as MerchandiseResponse).merchName;
                const qty = isFd ? (p as FoodDrinkResponse).quantity : (p as MerchandiseResponse).availNum;

                return (
                  <tr key={p.productId} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                    <td className="px-8 py-5">
                      <span className="font-mono font-black text-indigo-600 text-xs bg-indigo-50 px-3 py-1 rounded-lg">#{p.productId}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner shrink-0">
                          {p.imgUrl ? (
                            <img src={p.imgUrl} alt={pName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tighter">{pName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {isFd ? (
                        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase">{(p as FoodDrinkResponse).pType}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-purple-600 block leading-tight">
                          {(p as MerchandiseResponse).startDate} ➜ {(p as MerchandiseResponse).endDate}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-gray-800">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-gray-700">
                      {qty} pcs
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase px-3 py-1 rounded-full w-fit ${statusInfo.style}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.text}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.productId, p.itemType)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Không tìm thấy sản phẩm nào trong danh mục này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination section */}
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

      {/* Add product modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-1">Thêm sản phẩm</h3>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">Thêm mặt hàng mới vào danh mục {activeTab === 'FOOD_DRINK' ? 'Food & Drinks' : 'Merchandise'}</p>

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên sản phẩm *</label>
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder={activeTab === 'FOOD_DRINK' ? "Ví dụ: Bắp rang phô mai XL" : "Ví dụ: Ly nước Avengers Limited"}
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'FOOD_DRINK' ? (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phân loại Combo *</label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner cursor-pointer"
                    >
                      <option value="Snacks">Snacks (Bắp rang)</option>
                      <option value="Drinks">Drinks (Nước uống)</option>
                      <option value="Combo">Combo lớn</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ngày bắt đầu chiến dịch *</label>
                    <input 
                      type="date"
                      name="startDate"
                      required
                      value={newProduct.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Đơn giá ($) *</label>
                  <input 
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Số lượng nhập kho *</label>
                  <input 
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    placeholder="Số lượng nhập"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>

                {activeTab === 'MERCHANDISE' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ngày kết thúc chiến dịch *</label>
                    <input 
                      type="date"
                      name="endDate"
                      required
                      value={newProduct.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Đường dẫn ảnh mặt hàng (URL)</label>
                <input 
                  type="text"
                  name="imgUrl"
                  placeholder="https://images.unsplash.com/... (Để trống nếu không có)"
                  value={newProduct.imgUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#4a4bd7] hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý
                    </>
                  ) : (
                    "Xác nhận thêm"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}