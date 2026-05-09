"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

/**
 * AuthCheck Component
 * Đảm bảo người dùng phải đăng nhập mới có thể truy cập các trang nội bộ.
 */
export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Nếu không phải trang login và chưa đăng nhập -> Chuyển về login
    if (pathname !== "/login" && !isAuthenticated()) {
      router.push("/login");
    }
  }, [pathname, isAuthenticated, router]);

  // Nếu chưa đăng nhập và không phải trang login, ẩn nội dung để tránh nháy giao diện
  if (pathname !== "/login" && !isAuthenticated()) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-indigo-500 font-black uppercase tracking-[4px] text-xs">
          Authenticating...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
