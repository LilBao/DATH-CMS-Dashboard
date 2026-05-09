import api from './api';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  type: 'Food' | 'Merchandise';
  description?: string;
  imageUrl?: string;
}

export const productService = {
  // Lấy toàn bộ danh sách sản phẩm
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Lấy chi tiết một sản phẩm
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  create: async (data: Partial<Product>) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Cập nhật thông tin sản phẩm (bao gồm cả số lượng tồn kho)
  update: async (id: string, data: Partial<Product>) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  // Xóa sản phẩm
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};