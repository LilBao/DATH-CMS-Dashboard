"use client";

import { useEffect, useState } from "react";
import { ProductResponse, FoodDrinkRequest, MerchandiseRequest } from "@/services/productService";
import { X, Package, Loader2, DollarSign, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/movie_dialog";
import { toast } from "sonner";
import FileUpload from "./FileUpload";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FoodDrinkRequest | MerchandiseRequest>) => Promise<void>;
  initialData: ProductResponse | null;
}

export default function ProductFormModal({ isOpen, onClose, onSave, initialData }: ProductFormModalProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    type: "Food",
    description: "",
    imageUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      const isMerch = 'merchName' in initialData;
      setFormData({
        name: isMerch ? (initialData as any).merchName : (initialData as any).pName,
        category: isMerch ? '' : (initialData as any).pType,
        price: initialData.price,
        quantity: isMerch ? (initialData as any).availNum : (initialData as any).quantity,
        type: isMerch ? "Merchandise" : "Food",
        description: "",
        imageUrl: initialData.imgUrl || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        price: 0,
        quantity: 0,
        type: "Food",
        description: "",
        imageUrl: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let requestData: any;
      if (formData.type === 'Food') {
        requestData = {
          pName: formData.name,
          pType: formData.category || 'Combo',
          price: formData.price,
          quantity: formData.quantity,
          imgUrl: formData.imageUrl
        };
      } else {
        requestData = {
          merchName: formData.name,
          price: formData.price,
          availNum: formData.quantity,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          imgUrl: formData.imageUrl
        };
      }
      await onSave(requestData);
      onClose();
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin sản phẩm.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Left Column: Image Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh sản phẩm</label>
            <FileUpload
              folderName="products"
              initialPreviewUrl={formData.imageUrl}
              onUploadSuccess={(url) => setFormData((prev: any) => ({ ...prev, imageUrl: url }))}
              className="aspect-square rounded-3xl"
            />
          </div>

          {/* Right Column: Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên sản phẩm</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Bắp rang bơ phô mai"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Loại
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                >
                  <option value="Food">Food & Drink</option>
                  <option value="Merchandise">Merchandise</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh mục</label>
                <input
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Combo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Giá bán
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số lượng tồn</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả sản phẩm</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Mô tả ngắn về sản phẩm..."
              />
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {initialData ? "Cập nhật sản phẩm" : "Thêm vào kho hàng"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
