"use client";

import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import AuthCheck from "./components/AuthCheck";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Kiểm tra nếu đang ở trang login
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-[#f7f9fb] text-gray-900 antialiased`}>
        <AuthCheck>
          <div className="flex min-h-screen relative">
            
            {/* Chỉ hiển thị Navigation nếu không phải trang login */}
            {!isLoginPage && <Navigation />}
            
            <main className={cn(
              "flex-1 p-8 transition-all duration-300",
              isLoginPage ? "ml-0" : "ml-[256px]" 
            )}>
              {children}
            </main>
          </div>
        </AuthCheck>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}