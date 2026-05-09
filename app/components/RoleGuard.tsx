"use client";

import { useAuthStore } from "@/stores/authStore";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * Dùng để bao bọc các thành phần/nút bấm/trang yêu cầu quyền truy cập cụ thể.
 * 
 * @param allowedRoles - Danh sách các Role được phép xem nội dung (VD: ['ADMIN', 'MANAGER'])
 * @param fallback - Component hiển thị khi không đủ quyền (mặc định là null)
 */
export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return fallback;
  }

  const userRole = user?.role || user?.roles?.[0];

  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
