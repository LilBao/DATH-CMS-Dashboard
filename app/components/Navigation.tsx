"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Film, CalendarDays, MapPin, 
  Armchair, Users, User, Receipt, Ticket, 
  ShoppingBag, BarChart, Settings, LogOut 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [employee, setEmployee] = useState({
    name: "Loading...",
    role: "Staff",
    avatar: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setEmployee({
          name: userData.name || "Unknown User",
          role: userData.role || "Employee",
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    window.location.href = '/login';
  };

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
      className="fixed flex flex-col h-screen items-start left-0 overflow-hidden p-[16px] shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] top-0 w-[256px] z-50 border-r border-gray-100/50" 
      style={{ 
        backgroundImage: "linear-gradient(rgba(238, 242, 255, 0.1) 0%, rgba(250, 245, 255, 0.1) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)",
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Profile Section */}
      <div className="mb-8 w-full px-2 py-4 flex items-center gap-3 border-b border-gray-100/50">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm bg-white shrink-0">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-black text-gray-800 truncate leading-tight">
            {employee.name}
          </span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            {employee.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-[4px] w-full flex-1 overflow-y-auto custom-scrollbar pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[12px] transition-all duration-200 ${
                  isActive
                    ? 'bg-[#eef2ff] text-[#4338ca] font-bold shadow-sm'
                    : 'text-[#64748b] hover:bg-white/50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="w-full pt-4 mt-auto border-t border-gray-100/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-[12px] w-full px-[16px] py-[12px] rounded-[12px] text-rose-500 hover:bg-rose-50 transition-all duration-200 font-bold group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[14px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}