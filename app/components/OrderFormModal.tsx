"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  X, Save, Loader2, Ticket, Popcorn,
  CreditCard, ChevronRight, ChevronLeft,
  Search, Film, Armchair, ShoppingBag,
  CheckCircle2, Info,
  User, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { orderService, OrderResponse, OrderRequest, TicketRequest, AddonItemRequest } from '@/services/orderService';
import { showtimeService, ShowtimeResponse } from '@/services/showtimeService';
import { roomService, SeatResponse } from '@/services/roomService';
import { productService, ProductResponse } from '@/services/productService';
import { branchService, BranchResponse } from '@/services/branchService';
import { useAuthStore } from '@/stores/authStore';
import { CustomerResponse, customerService } from '@/services/customerService';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: OrderResponse | null;
}

type Step = 'showtime' | 'seats' | 'addons' | 'customer' | 'checkout';

export default function OrderFormModal({ isOpen, onClose, onSuccess, initialData }: OrderFormModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('showtime');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selection State
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatResponse[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<{ product: ProductResponse, quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [searchMovie, setSearchMovie] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCreatedOrder(initialData);
        // Map dữ liệu cũ vào state để hiển thị ở bước Checkout (Detail)
        setSelectedCustomer(initialData.customer || null);

        // Map vé (tickets)
        if (initialData.ticketDetails && initialData.ticketDetails.length > 0) {
          const firstTicket = initialData.ticketDetails[0];
          // Giả lập selectedShowtime để hiển thị thông tin phim/suất chiếu
          setSelectedShowtime({
            timeId: 0,
            movieId: 0,
            movieName: firstTicket.movieName,
            branchId: 0,
            branchName: firstTicket.branchName,
            roomId: 0,
            screenRoomName: firstTicket.screenRoomName,
            startTime: firstTicket.showtime,
            endTime: '',
            date: '',
            formatName: '',
            rPrice: 0 // Giá vé đã gộp vào ticket.price
          } as any);

          const mappedSeats: SeatResponse[] = initialData.ticketDetails.map(t => {
            // Cố gắng tách Row và Col từ seatName (ví dụ "A1" -> Row 1, Col 1)
            const rowMatch = t.seatName.match(/[A-Z]+/);
            const colMatch = t.seatName.match(/\d+/);
            const row = rowMatch ? rowMatch[0].charCodeAt(0) - 64 : 0;
            const col = colMatch ? parseInt(colMatch[0]) : 0;

            return {
              branchId: 0,
              roomId: 0,
              sRow: row,
              sColumn: col,
              sType: 1,
              sPrice: t.price,
              sStatus: true,
              isBooked: true
            };
          });
          setSelectedSeats(mappedSeats);
        }

        // Map addons
        if (initialData.addonDetails) {
          const mappedAddons = initialData.addonDetails.map(a => ({
            product: {
              productId: a.productId,
              pName: a.pName,
              price: a.price,
              pType: a.itemType,
              quantity: a.quantity // This is a bit tricky as product usually doesn't have quantity
            } as any,
            quantity: a.quantity
          }));
          setSelectedAddons(mappedAddons);
        }

        // Logic phân loại hiển thị theo trạng thái
        if (initialData.orderStatus === 'PENDING' && (initialData.paymentMethod === 'MOMO' || initialData.paymentMethod === 'VNPAY')) {
          setCreatedOrder(initialData);
        } else {
          setCreatedOrder(null);
          setStep('checkout'); // Hiển thị chi tiết (Summary) cho PAID/CANCELLED
        }
      } else {
        setCreatedOrder(null);
        setStep('showtime');
        loadInitialData();
      }
    }
  }, [isOpen, initialData]);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);
      const [stData, pData, bData] = await Promise.all([
        (user?.role === 'MANAGER' && user?.branchId)
          ? showtimeService.getByBranch(user.branchId.toString())
          : showtimeService.getAll(),
        productService.getAll(),
        branchService.getAll()
      ]);
      setShowtimes(stData);
      setProducts(pData);
      setBranches(bData);

      if (user?.role === 'MANAGER' && user?.branchId !== undefined) {
        setSelectedBranchId(user.branchId);
      } else if (bData.length > 0) {
        setSelectedBranchId(bData[0].branchId);
      }
    } catch (err) {
      toast.error("Không thể nạp dữ liệu khởi tạo.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadSeats = async (showtime: ShowtimeResponse) => {
    try {
      setIsLoadingData(true);
      const data = await roomService.getSeats(showtime.branchId, showtime.roomId);
      setSeats(data);
    } catch (err) {
      toast.error("Không thể nạp sơ đồ ghế.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSelectShowtime = (st: ShowtimeResponse) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
    loadSeats(st);
    setStep('seats');
  };

  const toggleSeat = (seat: SeatResponse) => {
    if (seat.isBooked) return;
    const isSelected = selectedSeats.some(s => s.sRow === seat.sRow && s.sColumn === seat.sColumn);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => !(s.sRow === seat.sRow && s.sColumn === seat.sColumn)));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const updateAddon = (product: ProductResponse, delta: number) => {
    const existing = selectedAddons.find(a => a.product.productId === product.productId);
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        setSelectedAddons(selectedAddons.filter(a => a.product.productId !== product.productId));
      } else {
        setSelectedAddons(selectedAddons.map(a => a.product.productId === product.productId ? { ...a, quantity: newQty } : a));
      }
    } else if (delta > 0) {
      setSelectedAddons([...selectedAddons, { product, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    const seatTotal = selectedSeats.reduce((sum, s) => sum + (selectedShowtime?.rPrice || 0) + s.sPrice, 0);
    const addonTotal = selectedAddons.reduce((sum, a) => sum + (a.product.price * a.quantity), 0);
    return seatTotal + addonTotal;
  };

  const calculateTotalDisplay = () => {
    if (initialData) return initialData.total;
    return calculateTotal();
  };

  const checkCustomer = async () => {
    if (!customerPhone) return;
    try {
      setIsCheckingCustomer(true);
      const customer = await customerService.getByPhone(customerPhone);
      setSelectedCustomer(customer);
      toast.success(`Đã tìm thấy khách hàng: ${customer.cName}`);
    } catch (err) {
      // Nếu không tìm thấy, tự động tạo mới theo yêu cầu
      try {
        const newCustomer = await customerService.create({
          fullName: `Khách hàng ${customerPhone}`,
          phoneNumber: customerPhone,
          email: `${customerPhone}@cinema.com`,
          password: 'password123', // Mật khẩu mặc định cho khách tạo nhanh
          sex: 'M', // Backend chỉ chấp nhận M hoặc F
          isActive: true
        });
        setSelectedCustomer(newCustomer);
        toast.success(`Đã tạo mới tài khoản khách hàng: ${newCustomer.cName}`);
      } catch (createErr) {
        setSelectedCustomer(null);
        toast.error("Không tìm thấy và không thể tạo mới khách hàng.");
      }
    } finally {
      setIsCheckingCustomer(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    setIsSubmitting(true);
    const payload: OrderRequest = {
      paymentMethod,
      customerId: selectedCustomer?.cUserId,
      branchId: selectedBranchId || undefined,
      tickets: selectedSeats.map(s => ({
        showtimeId: selectedShowtime.timeId,
        branchId: selectedShowtime.branchId,
        roomId: selectedShowtime.roomId,
        sRow: s.sRow,
        sColumn: s.sColumn,
        tPrice: selectedShowtime.rPrice + s.sPrice
      })),
      addons: selectedAddons.map(a => ({
        productId: a.product.productId,
        pType: a.product.itemType === 'FOOD_DRINK' ? (a.product as any).pType : 'MERCHANDISE',
        pName: a.product.itemType === 'FOOD_DRINK' ? (a.product as any).pName : (a.product as any).merchName,
        quantity: a.quantity,
        price: a.product.price
      }))
    };

    try {
      const response = await orderService.create(payload);
      toast.success("Hóa đơn đã được tạo thành công!");
      onSuccess();

      // Nếu là thanh toán Online, giữ modal lại để hiện QR hoặc chuyển hướng
      if (response.paymentUrl || (paymentMethod !== 'CASH' && paymentMethod !== 'CREDIT_CARD')) {
        setCreatedOrder(response);
      } else {
        onClose();
        resetState();
      }
    } catch (err) {
      toast.error("Giao dịch thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setStep('showtime');
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedAddons([]);
    setSelectedCustomer(null);
    setCustomerPhone('');
  };

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st =>
      st.movieName.toLowerCase().includes(searchMovie.toLowerCase()) &&
      (!selectedBranchId || st.branchId === selectedBranchId)
    );
  }, [showtimes, searchMovie, selectedBranchId]);

  // Group showtimes by movie
  const groupedMovies = useMemo(() => {
    const groups: Record<number, { movieId: number, movieName: string, showtimes: ShowtimeResponse[] }> = {};
    filteredShowtimes.forEach(st => {
      if (!groups[st.movieId]) {
        groups[st.movieId] = { movieId: st.movieId, movieName: st.movieName, showtimes: [] };
      }
      groups[st.movieId].showtimes.push(st);
    });
    return Object.values(groups);
  }, [filteredShowtimes]);

  if (!isOpen) return null;

  if (createdOrder) {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100]" onClick={onClose} />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-[40px] shadow-2xl z-[110] p-10 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Đợi thanh toán</h3>
            <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-widest">Hóa đơn #{createdOrder.orderId} - ${createdOrder.total.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-inner border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
            {createdOrder.paymentUrl ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(createdOrder.paymentUrl || '')}`}
                alt="Payment QR Code"
                className="w-48 h-48 rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center p-4 gap-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Info className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Chưa có mã thanh toán</p>
                  <button
                    onClick={() => toast.info("Tính năng tạo lại mã thanh toán đang được cập nhật.")}
                    className="text-[9px] font-black text-indigo-500 underline uppercase"
                  >
                    Tạo lại mã QR
                  </button>
                </div>
              </div>
            )}
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[4px]">Scan to pay</p>
          </div>

          <div className="w-full space-y-3">
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
              Mời khách hàng quét mã QR để hoàn tất thanh toán qua {createdOrder.paymentMethod}. Hệ thống sẽ tự động cập nhật trạng thái sau khi thành công.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => { setCreatedOrder(null); onClose(); }}
                className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-[10px] text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-gray-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
              >
                <Printer className="w-4 h-4" /> In hóa đơn tạm
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] transition-all" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] max-h-[90vh] bg-white rounded-[40px] shadow-2xl z-[110] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Progress Header */}
        <div className="px-10 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h2 className="font-black text-gray-800 text-xl uppercase tracking-tighter">
              {initialData ? 'Chi tiết hóa đơn' : 'POS Terminal'}
            </h2>
            {!initialData && (
              <div className="flex items-center gap-4">
                {[
                  { id: 'showtime', label: 'Suất chiếu', icon: <Film className="w-4 h-4" /> },
                  { id: 'seats', label: 'Chọn ghế', icon: <Armchair className="w-4 h-4" /> },
                  { id: 'addons', label: 'Bắp nước', icon: <Popcorn className="w-4 h-4" /> },
                  { id: 'customer', label: 'Khách hàng', icon: <User className="w-4 h-4" /> },
                  { id: 'checkout', label: 'Thanh toán', icon: <CreditCard className="w-4 h-4" /> }
                ].map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                      idx < ['showtime', 'seats', 'addons', 'customer', 'checkout'].indexOf(step) ? 'text-emerald-600 font-bold' : 'text-gray-400 font-bold'
                      }`}>
                      {idx < ['showtime', 'seats', 'addons', 'customer', 'checkout'].indexOf(step) ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                      <span className="text-[10px] uppercase tracking-widest">{s.label}</span>
                    </div>
                    {idx < 4 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </div>
                ))}
              </div>
            )}
            {initialData && (
              <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Mã hóa đơn: #{initialData.orderId}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
          {isLoadingData ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Fetching Inventory...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* STEP 1: SHOWTIME */}
              {step === 'showtime' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Chọn phim & Suất chiếu</h3>
                      <p className="text-gray-400 font-bold text-xs mt-1">Hệ thống đang hiển thị các phim và lịch chiếu khả dụng.</p>
                    </div>
                    <div className="flex gap-4 flex-1 justify-end">
                      {user?.role === 'ADMIN' && (
                        <select
                          value={selectedBranchId || ''}
                          onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                          className="bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-64"
                        >
                          <option value="">Chọn chi nhánh...</option>
                          {branches.map(b => (
                            <option key={b.branchId} value={b.branchId}>{b.bName}</option>
                          ))}
                        </select>
                      )}
                      <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm tên phim..."
                          value={searchMovie}
                          onChange={(e) => setSearchMovie(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {groupedMovies.length > 0 ? groupedMovies.map(movie => (
                      <div key={movie.movieId} className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Film className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{movie.movieName}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Đang có {movie.showtimes.length} suất chiếu</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          {movie.showtimes.map(st => (
                            <button
                              key={st.timeId}
                              onClick={() => handleSelectShowtime(st)}
                              className="p-5 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left space-y-3 group"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{st.formatName}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">P.{st.roomId}</span>
                              </div>
                              <p className="text-lg font-black text-gray-800 group-hover:text-indigo-600 transition-colors">{st.startTime}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{st.branchName}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto text-gray-300">
                          <Search className="w-10 h-10" />
                        </div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Không tìm thấy phim hoặc suất chiếu phù hợp</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SEATS */}
              {step === 'seats' && selectedShowtime && (
                <div className="space-y-10 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between">
                    <button onClick={() => setStep('showtime')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                      <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">{selectedShowtime.movieName}</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Phòng {selectedShowtime.roomId} &bull; {selectedShowtime.startTime}</p>
                    </div>
                    <div className="w-20" />
                  </div>

                  <div className="w-full max-w-2xl bg-gray-50 p-10 rounded-[48px] border border-gray-100">
                    {/* Screen */}
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-20 relative">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-400 uppercase tracking-[6px]">Màn hình</span>
                    </div>

                    {/* Seat Grid (Simple implementation) */}
                    <div className="grid gap-3 justify-center" style={{ gridTemplateColumns: `repeat(10, minmax(0, 1fr))` }}>
                      {seats.map((seat, idx) => {
                        const isSelected = selectedSeats.some(s => s.sRow === seat.sRow && s.sColumn === seat.sColumn);
                        return (
                          <button
                            key={idx}
                            disabled={seat.isBooked}
                            onClick={() => toggleSeat(seat)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${seat.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                              isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' :
                                'bg-white text-gray-400 border-2 border-gray-100 hover:border-indigo-300 hover:text-indigo-400'
                              }`}
                          >
                            {String.fromCharCode(64 + seat.sRow)}{seat.sColumn}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-16 flex justify-center gap-8 border-t border-gray-200/50 pt-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white border-2 border-gray-200 rounded-md" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Trống</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-md" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Đang chọn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-200 rounded-md" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Đã đặt</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghế đã chọn</p>
                      <p className="text-sm font-black text-indigo-600">
                        {selectedSeats.length > 0 ? selectedSeats.map(s => `${String.fromCharCode(64 + s.sRow)}${s.sColumn}`).join(', ') : 'Chưa chọn ghế'}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep('addons')}
                      disabled={selectedSeats.length === 0}
                      className="bg-gray-800 hover:bg-black text-white px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-2"
                    >
                      Tiếp tục <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ADDONS */}
              {step === 'addons' && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setStep('seats')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                      <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Bắp nước & Combo</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Tăng doanh số với các dịch vụ bổ trợ</p>
                    </div>
                    <button
                      onClick={() => setStep('customer')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      Tiếp theo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {products.map(p => {
                      const selected = selectedAddons.find(a => a.product.productId === p.productId);
                      return (
                        <div key={p.productId} className="bg-gray-50/50 border border-gray-100 p-6 rounded-[32px] flex flex-col items-center text-center space-y-4 hover:border-indigo-200 transition-all group">
                          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-105 transition-transform">
                            {p.itemType === 'FOOD_DRINK' ? <Popcorn className="w-10 h-10" /> : <ShoppingBag className="w-10 h-10" />}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-800 uppercase tracking-tight text-sm">{(p as any).pName || (p as any).merchName}</h4>
                            <p className="text-indigo-600 font-black text-xs mt-1">${p.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-inner border border-gray-100">
                            <button onClick={() => updateAddon(p, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-500 font-bold">-</button>
                            <span className="w-6 text-sm font-black text-gray-800">{selected?.quantity || 0}</span>
                            <button onClick={() => updateAddon(p, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 font-bold">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: CUSTOMER */}
              {step === 'customer' && (
                <div className="space-y-10 flex flex-col items-center max-w-xl mx-auto">
                  <div className="w-full flex items-center justify-between">
                    <button onClick={() => setStep('addons')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                      <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Thông tin khách hàng</h3>
                    <div className="w-20" />
                  </div>

                  <div className="w-full bg-gray-50 p-10 rounded-[40px] border border-gray-100 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại khách hàng</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập SĐT để kiểm tra thành viên..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                        />
                        <button
                          onClick={checkCustomer}
                          disabled={isCheckingCustomer || !customerPhone}
                          className="px-8 bg-gray-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30"
                        >
                          {isCheckingCustomer ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kiểm tra'}
                        </button>
                      </div>
                    </div>

                    {selectedCustomer ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 uppercase font-black">
                            {selectedCustomer.cName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-emerald-900 uppercase">{selectedCustomer.cName}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Hạng {selectedCustomer.membershipTier} &bull; {selectedCustomer.totalPoints} Điểm</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
                        <Info className="w-5 h-5 text-indigo-400 mt-1" />
                        <p className="text-[11px] font-bold text-indigo-700 leading-relaxed">
                          Nếu khách hàng chưa có tài khoản, hệ thống sẽ <strong>tự động tạo mới tài khoản</strong> bằng số điện thoại khi bạn nhấn "Kiểm tra".
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                  >
                    Tiếp tục thanh toán
                  </button>
                </div>
              )}

              {/* STEP 5: CHECKOUT / DETAIL */}
              {step === 'checkout' && (
                <div className={initialData ? "max-w-2xl mx-auto" : "grid grid-cols-2 gap-12"}>
                  {!initialData && (
                    <div className="space-y-8">
                      <div>
                        <button onClick={() => setStep('customer')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all mb-4">
                          <ChevronLeft className="w-4 h-4" /> Quay lại
                        </button>
                        <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-tight">Xác nhận giao dịch & Thanh toán</h3>
                        <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-[2px]">Mã phiên làm việc: POS-{Date.now().toString().slice(-6)}</p>
                      </div>

                      <div className="space-y-5">
                        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <CreditCard className="w-3 h-3" /> Phương thức thanh toán
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { id: 'CASH', label: 'Tiền mặt' },
                                { id: 'MOMO', label: 'Momo' },
                                { id: 'VNPAY', label: 'VNPay' },
                                { id: 'CREDIT_CARD', label: 'Thẻ tín dụng' }
                              ].map(method => (
                                <button
                                  key={method.id}
                                  onClick={() => setPaymentMethod(method.id)}
                                  className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${paymentMethod === method.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-100'
                                    }`}
                                >
                                  {method.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 pt-4 border-t border-gray-200/50">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <Ticket className="w-3 h-3" /> Mã giảm giá (Nếu có)
                            </label>
                            <div className="flex gap-2">
                              <input type="text" placeholder="Nhập mã ưu đãi..." className="flex-1 px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" />
                              <button className="px-6 bg-gray-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Áp dụng</button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Info className="w-5 h-5" />
                          </div>
                          <p className="text-[11px] font-bold text-indigo-700 leading-relaxed">
                            Nhấn <strong>Hoàn tất</strong> để ghi nhận doanh thu vào hệ thống. Hành động này sẽ gửi vé điện tử đến email khách hàng (nếu được cung cấp).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                      {/* Summary Sidebar / Detail Content */}
                      <div className={`bg-gray-900 rounded-[48px] p-10 text-white flex flex-col shadow-2xl ${initialData ? 'w-full' : 'h-full'}`}>
                        <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Chi tiết hóa đơn</span>
                            {initialData && (
                              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                initialData.orderStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 
                                initialData.orderStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {initialData.orderStatus}
                              </div>
                            )}
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Thanh toán</p>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-black uppercase">
                                  {initialData ? (
                                    initialData.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                                    initialData.paymentMethod === 'MOMO' ? 'Ví Momo' : 
                                    initialData.paymentMethod === 'VNPAY' ? 'Cổng VNPay' : 'Thẻ tín dụng'
                                  ) : (
                                    paymentMethod === 'CASH' ? 'Tiền mặt' : 
                                    paymentMethod === 'MOMO' ? 'Ví Momo' : 
                                    paymentMethod === 'VNPAY' ? 'Cổng VNPay' : 'Thẻ tín dụng'
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Thời gian</p>
                              <p className="text-xs font-black uppercase">
                                {initialData ? initialData.orderTime : new Date().toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Customer Info */}
                          {selectedCustomer && (
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-xs font-black">
                                  {selectedCustomer.cName[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase">{selectedCustomer.cName}</p>
                                  <p className="text-[10px] font-bold text-white/40">{selectedCustomer.phoneNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Hạng</p>
                                <p className="text-[10px] font-black text-indigo-400 uppercase">{selectedCustomer.membershipTier}</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-6">
                            {/* Tickets */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/10 pb-2">Vé xem phim</p>
                              {selectedSeats.map((seat, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs font-black uppercase">{selectedShowtime?.movieName}</p>
                                    <p className="text-[10px] font-bold text-white/40">{selectedShowtime?.branchName} &bull; Ghế {String.fromCharCode(64 + seat.sRow)}{seat.sColumn}</p>
                                  </div>
                                  <span className="text-xs font-black">${((selectedShowtime?.rPrice || 0) + seat.sPrice).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Addons */}
                            {selectedAddons.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/10 pb-2">Bắp nước & Dịch vụ</p>
                                {selectedAddons.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <div>
                                      <p className="text-xs font-black uppercase">{(item.product as any).pName || (item.product as any).merchName}</p>
                                      <p className="text-[10px] font-bold text-white/40">Số lượng: {item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-black">${(item.product.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/10 space-y-6">
                          <div className="space-y-3">
                            {initialData && initialData.discountAmount > 0 && (
                              <>
                                <div className="flex justify-between items-center text-xs text-white/50">
                                  <span>Giá gốc</span>
                                  <span className="line-through">${initialData.originalTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-rose-400">
                                  <span>Giảm giá</span>
                                  <span>-${initialData.discountAmount.toLocaleString()}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                              <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Tổng thanh toán</span>
                              <span className="text-4xl font-black text-indigo-400 tracking-tighter">${calculateTotalDisplay().toLocaleString()}</span>
                            </div>
                          </div>
                          {!initialData && (
                            <button
                              onClick={handleSubmit}
                              disabled={isSubmitting || !selectedCustomer}
                              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-[4px] shadow-2xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                              {!selectedCustomer ? 'Vui lòng chọn khách hàng' : 'Hoàn tất & In vé'}
                            </button>
                          )}

                          {initialData && (
                            <button
                              onClick={onClose}
                              className="w-full bg-gray-800 hover:bg-black text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-[4px] transition-all flex items-center justify-center gap-3"
                            >
                              Đóng chi tiết
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
      </div>
      </>
      );
}