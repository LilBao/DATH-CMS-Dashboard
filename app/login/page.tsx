"use client";

import { useState } from "react";
import { authService, LoginPayload } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, logout, setTokens, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      toast.info("Tự động đăng xuất để chuyển đổi tài khoản.");
      logout();
    }
  }, [isAuthenticated, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Chuẩn bị dữ liệu theo Interface LoginPayload
    const payload: LoginPayload = {
      provider: 'LOCAL',
      email: email,
      password: password
    };

    try {
      // Gọi API Login
      const loginResponse = await authService.login(payload);
      const { accessToken, refreshToken } = loginResponse;

      setTokens(accessToken, refreshToken);

      const userRes = await authService.getMe();
      const userData = userRes;

      setUser({
        name: userData.fullName || userData.name,
        role: userData.role || "Staff",
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName || userData.name}`,
        email: userData.email,
        id: userData.id,
        branchId: userData.branchId
      });

      toast.success("Đăng nhập thành công!");

      // Điều hướng dựa trên vai trò
      if (userData.role?.toUpperCase() === 'STAFF') {
        router.push("/orders");
      } else {
        router.push("/");
      }

    } catch (error: any) {
      // Xử lý lỗi từ Axios
      const message = error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Cinema Login
          </CardTitle>
          <CardDescription>Sử dụng tài khoản hệ thống để truy cập</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Email</Label>
              <Input
                type="email"
                placeholder="admin@cinema.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl py-6 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Mật khẩu</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl py-6 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-all shadow-lg"
            >
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}