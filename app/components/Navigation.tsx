"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Film, CalendarDays, MapPin, 
  Armchair, Users, User, Receipt, Ticket, 
  ShoppingBag, BarChart, Settings 
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies', path: '/movies', label: 'Movies', icon: Film },
    { id: 'showtimes', path: '/showtimes', label: 'Showtimes', icon: CalendarDays },
    { id: 'branches', path: '/branches', label: 'Branches', icon: MapPin },
    { id: 'rooms', path: '/rooms', label: 'Rooms & Seats', icon: Armchair },
    { id: 'customers', path: '/customers', label: 'Customers', icon: Users },
    { id: 'employees', path: '/employees', label: 'Employee', icon: User },
    { id: 'orders', path: '/orders', label: 'Orders', icon: Receipt },
    { id: 'coupons', path: '/coupons', label: 'Coupons', icon: Ticket },
    { id: 'products', path: '/products', label: 'Products', icon: ShoppingBag },
    { id: 'reports', path: '/reports_analytics', label: 'Reports', icon: BarChart },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className="absolute backdrop-blur-[12px] flex flex-col h-screen items-start left-0 overflow-hidden p-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] top-0 w-[256px] z-50" 
      style={{ backgroundImage: "linear-gradient(rgba(238, 242, 255, 0.1) 0%, rgba(250, 245, 255, 0.1) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.7) 100%)" }}
    >
      <div className="mb-8 px-4 py-2">
        <h1 className="text-xl font-extrabold text-blue-700">Cinema Admin</h1>
      </div>

      <nav className="flex flex-col gap-[4px] w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] transition-all duration-200 ${
                  isActive
                    ? 'bg-[#eef2ff] text-[#4338ca] font-semibold shadow-sm'
                    : 'text-[#64748b] hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}