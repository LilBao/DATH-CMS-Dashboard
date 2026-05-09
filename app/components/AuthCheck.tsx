"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

/**
 * AuthCheck Component
 * Đảm bảo người dùng phải đăng nhập mới có thể truy cập các trang nội bộ.
 */
export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname !== "/login" && !isAuthenticated()) {
      router.push("/login");
    }
  }, [pathname, isAuthenticated, router, mounted]);

  // Render loading state during hydration to match server output
  if (!mounted || (pathname !== "/login" && !isAuthenticated())) {
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
