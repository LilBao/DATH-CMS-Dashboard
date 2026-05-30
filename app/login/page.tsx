"use client";

import { useState } from "react";
import { authService, LoginPayload } from "@/services/authService"; 
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore"; // Import store

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Lấy các hàm từ Zustand Store
  const { setTokens, setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: LoginPayload = {
      provider: 'LOCAL',
      email: email,
      password: password
    };

    try {
      // 1. Gọi API Login
      const loginResponse = await authService.login(payload);
      
      /**
       * KHỚP DỮ LIỆU BE: 
       * Dựa trên ApiResponse.java và JwtResponse.java của bạn:
       * Cấu trúc: loginResponse.data (ApiResponse) -> .data (JwtResponse) -> .accessToken
       */
      const authData = loginResponse.data?.data || loginResponse.data || loginResponse;
      const accessToken = authData.accessToken;
      const refreshToken = authData.refreshToken;
      
      if (accessToken) {
        // 2. Lưu vào Store (Hàm này trong Store của Đại đã tự gọi Cookies.set('accessToken', ...))
        // Rất quan trọng để Middleware đọc được đúng tên 'accessToken'
        setTokens(accessToken, refreshToken || "");

        // 3. Lấy thông tin chi tiết User từ API /auth/me
        const userRes = await authService.getMe();
        const userData = userRes.data?.data || userRes.data;

        // 4. Lưu vào Zustand (nó sẽ tự persist xuống localStorage cho Đại)
        setUser({
          name: userData.fullName || userData.name || "Admin",
          role: userData.role || "Staff",
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
          email: userData.email
        });

        toast.success("Đăng nhập thành công!");
        
        // 5. Điều hướng bằng replace để xóa lịch sử trang login và kích hoạt Middleware kiểm tra lại Cookie
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 100);
      } else {
        toast.error("Không nhận được mã xác thực từ máy chủ.");
      }
      
    } catch (error: any) {
      const message = error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(message);
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[32px] overflow-hidden">
        <CardHeader className="space-y-1 text-center pt-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-2xl">C</span>
          </div>
          <CardTitle className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Cinema Admin
          </CardTitle>
          <CardDescription className="font-medium">Hệ thống quản lý rạp chiếu phim</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                Email tài khoản
              </Label>
              <Input
                type="email"
                placeholder="admin@cinema.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl py-7 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                Mật khẩu
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl py-7 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs mt-4"
            >
              {isLoading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}