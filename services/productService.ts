import api from './api';

export interface FoodDrinkRequest {
  pType: string;
  pName: string;
  price: number;
  quantity: number;
  imgUrl?: string;
}

export interface FoodDrinkResponse {
  productId: number;
  pType: string;
  pName: string;
  price: number;
  quantity: number;
  itemType: 'FOOD_DRINK';
  imgUrl?: string;
}

export interface MerchandiseRequest {
  merchName: string;
  price: number;
  availNum: number;
  startDate: string;
  endDate: string;
  imgUrl?: string;
}

export interface MerchandiseResponse {
  productId: number;
  merchName: string;
  price: number;
  availNum: number;
  startDate: string;
  endDate: string;
  itemType: 'MERCHANDISE';
  imgUrl?: string;
}

export type ProductRequest = FoodDrinkRequest | MerchandiseRequest;
export type ProductResponse = FoodDrinkResponse | MerchandiseResponse;

export const productService = {
  // Lấy toàn bộ danh sách sản phẩm (tổng hợp từ cả 2 API)
  getAll: async (): Promise<ProductResponse[]> => {
    const [foodDrinks, merchandise] = await Promise.all([
      api.get('/food-drinks'),
      api.get('/merchandise')
    ]);
    
    // Đảm bảo mỗi item có itemType để phân biệt nếu BE chưa trả về
    const fd = (foodDrinks.data as FoodDrinkResponse[]).map(item => ({ ...item, itemType: 'FOOD_DRINK' as const }));
    const mc = (merchandise.data as MerchandiseResponse[]).map(item => ({ ...item, itemType: 'MERCHANDISE' as const }));
    
    return [...fd, ...mc];
  },

  // Lấy danh sách Food & Drinks
  getFoodDrinks: async (): Promise<FoodDrinkResponse[]> => {
    const response = await api.get('/food-drinks');
    return (response.data as FoodDrinkResponse[]).map(item => ({ ...item, itemType: 'FOOD_DRINK' as const }));
  },

  // Lấy danh sách Merchandise
  getMerchandise: async (): Promise<MerchandiseResponse[]> => {
    const response = await api.get('/merchandise');
    return (response.data as MerchandiseResponse[]).map(item => ({ ...item, itemType: 'MERCHANDISE' as const }));
  },

  // Lấy chi tiết một sản phẩm (cần biết type để gọi đúng API)
  getById: async (id: number, type: 'FOOD_DRINK' | 'MERCHANDISE'): Promise<ProductResponse> => {
    const endpoint = type === 'FOOD_DRINK' ? '/food-drinks' : '/merchandise';
    const response = await api.get(`${endpoint}/${id}`);
    return { ...response.data, itemType: type };
  },

  // Tạo sản phẩm mới
  create: async (data: ProductRequest): Promise<ProductResponse> => {
    const isMerch = 'merchName' in data;
    const endpoint = isMerch ? '/merchandise' : '/food-drinks';
    const response = await api.post(endpoint, data);
    return { ...response.data, itemType: isMerch ? 'MERCHANDISE' : 'FOOD_DRINK' };
  },

  // Cập nhật thông tin sản phẩm
  update: async (id: number, data: Partial<ProductRequest>, type: 'FOOD_DRINK' | 'MERCHANDISE'): Promise<ProductResponse> => {
    const endpoint = type === 'FOOD_DRINK' ? '/food-drinks' : '/merchandise';
    const response = await api.put(`${endpoint}/${id}`, data);
    return { ...response.data, itemType: type };
  },

  // Xóa sản phẩm
  delete: async (id: number, type: 'FOOD_DRINK' | 'MERCHANDISE'): Promise<void> => {
    const endpoint = type === 'FOOD_DRINK' ? '/food-drinks' : '/merchandise';
    await api.delete(`${endpoint}/${id}`);
  }
};