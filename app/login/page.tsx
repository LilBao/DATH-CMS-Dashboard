"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/employees?email=${email}`);
      const employees = await response.json();

      if (employees.length > 0) {
        const user = employees[0];

        if (user.password === password) {
          const userData = {
            name: user.name,
            role: user.role || "Staff",
            avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
            email: user.email
          };

          localStorage.setItem("user", JSON.stringify(userData));

          toast.success(`Chào mừng trở lại, ${user.name}!`);

          window.location.href = "/";
        } else {
          toast.error("Mật khẩu không chính xác");
        }
      } else {
        toast.error("Email không tồn tại trong hệ thống");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Lỗi kết nối đến máy chủ (Kiểm tra JSON Server)");
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
          <CardDescription>Nhập tài khoản nhân viên để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">
                Email Nhân Viên
              </Label>
              <Input
                type="email"
                placeholder="name@cinema.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl py-6 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase text-gray-400">
                  Mật Khẩu
                </Label>
              </div>
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
              className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100"
            >
              {isLoading ? "Đang xác thực..." : "Đăng Nhập"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">
               Quên mật khẩu? Vui lòng liên hệ Quản lý chi nhánh.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}