import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookie
  const token = request.cookies.get('accessToken')?.value;

  // 1. LOẠI TRỪ CÁC TÀI NGUYÊN HỆ THỐNG VÀ TĨNH (Cực kỳ quan trọng)
  // Nếu là file tĩnh (có dấu chấm như .js, .css, .png) hoặc thư mục nội bộ của Next.js thì cho qua luôn
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. CHUẨN HÓA ĐƯỜNG DẪN (Xử lý trailing slash)
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  const isLoginPage = normalizedPath === '/login';

  // Định nghĩa các route cần bảo vệ (Dùng startsWith để bao quát các trang con)
  const protectedPrefixes = ['/dashboard', '/orders', '/branches', '/movies', '/showtimes'];
  const isProtectedRoute = protectedPrefixes.some(prefix => normalizedPath.startsWith(prefix));

  // 3. LOGIC ĐIỀU HƯỚNG

  // Vào trang gốc "/"
  if (normalizedPath === '/') {
    const target = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Đã login mà cố vào trang login -> Về Dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Chưa login mà vào trang cấm -> Ra Login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Có thể thêm callback url để sau khi login xong quay lại đúng trang đang vào
    // loginUrl.searchParams.set('from', normalizedPath); 
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 4. CẤU HÌNH MATCHER TỐI ƯU
export const config = {
  /*
   * Bắt tất cả các request TRỪ:
   * 1. api (API routes)
   * 2. _next/static (static files)
   * 3. _next/image (image optimization files)
   * 4. favicon.ico (favicon file)
   * 5. Các file có đuôi mở rộng (png, jpg, etc.)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};