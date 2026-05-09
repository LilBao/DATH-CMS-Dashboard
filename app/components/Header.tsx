import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-[64px] bg-white/80 backdrop-blur-md flex items-center justify-between px-[32px] border-b border-gray-100 sticky top-0 z-40">
      <div className="flex-1 max-w-[448px] relative">
        <div className="absolute inset-y-0 left-[12px] flex items-center pointer-events-none">
          <Search className="w-[18px] h-[18px] text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search movies, customers, or reports..."
          className="w-full bg-[#f1f4f6] text-[14px] text-gray-700 rounded-full py-[10px] pl-[40px] pr-[16px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-[16px]">
        <button className="p-[8px] rounded-full hover:bg-gray-100 relative transition-colors">
          <Bell className="w-[20px] h-[20px] text-gray-600" />
          <span className="absolute top-[8px] right-[8px] w-[8px] h-[8px] bg-red-600 border-2 border-white rounded-full"></span>
        </button>
        <button className="p-[8px] rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-[20px] h-[20px] text-gray-600" />
        </button>
        
        <div className="w-px h-[32px] bg-gray-200 mx-[8px]"></div>

        <div className="flex items-center gap-[12px] cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-gray-900 leading-none mb-1">Alex Rivera</span>
            <span className="text-[10px] text-gray-500 leading-none">Cinema Manager</span>
          </div>
          <div className="w-[32px] h-[32px] rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
            <span className="text-[12px] font-bold text-blue-700">AR</span>
          </div>
        </div>
      </div>
    </header>
  );
}