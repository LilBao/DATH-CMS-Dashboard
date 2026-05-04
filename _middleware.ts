import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Cửa sổ reset là 1 phút
const MAX_REQUESTS_PER_WINDOW = 60; // Số requests tối đa mỗi phút (Ví dụ: 60)

export function middleware(request: NextRequest) {
  // 1. Logic Rate Limiting -------------
  // Cố gắng parse IP client (thông qua HTTP Headers 'x-forwarded-for')
  const ip = request.headers.get('x-forwarded-for') || 'anonymous_ip';

  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  if (!windowData || (now - windowData.lastReset > RATE_LIMIT_WINDOW_MS)) {
    // Reset lại nếu chưa có hay đã quá thời gian reset window
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else {
    // Tăng đếm + xét mức độ Limit
    windowData.count += 1;
    if (windowData.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          status: 429,
          message: 'Too Many Requests from this IP, please try again later.',
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 429 } // Mã lỗi HTTP 429: Too Many Requests
      );
    }
  }

  // 2. Auth Logic / Headers Check (Nếu muốn filter API)
  // Nếu có API mà cần bắt buộc yêu cầu token có thể triển khai check header 'Authorization' ở đây 

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Các endpoint nào sẽ phải chịu route này? 
    // Chúng ta có thể set rate limit middleware này trỏ đến một số route, chẳng hạn api hoặc trang đăng nhập
    '/api/:path*',
    '/auth/:path*', // Nếu frontend call qua Next.js handler
  ],
};
