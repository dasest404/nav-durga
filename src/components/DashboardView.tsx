import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Users,
  ShoppingCart,
  HelpCircle,
  Clock,
  Plus,
  ArrowUpRight,
  Send,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  Product,
  Customer,
  DailyUpdate,
  SalesEnquiry,
  SalesOrder,
  FollowUp,
  WhatsAppMessageRecord,
  ActiveTab,
} from '../types';

interface DashboardViewProps {
  products: Product[];
  customers: Customer[];
  dailyUpdates: DailyUpdate[];
  enquiries: SalesEnquiry[];
  orders: SalesOrder[];
  followUps: FollowUp[];
  whatsAppMessages: WhatsAppMessageRecord[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenCreateUpdate: () => void;
  onOpenCreateEnquiry: () => void;
  onOpenCreateOrder: () => void;
  onOpenAddCustomer: () => void;
  onOpenAddProduct: () => void;
  onViewCustomerDetail: (customerId: string) => void;
  onViewProductDetail: (productId: string) => void;
  onGeneratePostForUpdate: (update: DailyUpdate) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  customers,
  dailyUpdates,
  enquiries,
  orders,
  followUps,
  whatsAppMessages,
  onNavigate,
  onOpenCreateUpdate,
  onOpenCreateEnquiry,
  onOpenCreateOrder,
  onOpenAddCustomer,
  onOpenAddProduct,
  onViewCustomerDetail,
  onViewProductDetail,
  onGeneratePostForUpdate,
}) => {
  const latestUpdate = dailyUpdates[0];

  // Calculated metrics
  const todayEnquiries = enquiries.filter((e) => e.date === '2026-09-18');
  const pendingEnquiries = enquiries.filter(
    (e) => e.status === 'New' || e.status === 'Contacted' || e.status === 'Negotiation'
  );

  const todaySalesTotal = orders
    .filter((o) => o.orderDate === '2026-09-17' || o.orderDate === '2026-09-18')
    .reduce((sum, o) => sum + o.total, 0);

  const newOrdersCount = orders.filter(
    (o) => o.orderStatus === 'New' || o.orderStatus === 'Processing'
  ).length;

  const pendingFollowUps = followUps.filter((f) => f.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Today's Steel Market Ticker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Nav Durga Ispat Operations
              </span>
              <span className="text-xs text-slate-500 font-medium">18 September 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Industrial Steel ERP Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Urla Mill & Raipur Market commercial operations, pricing broadcasts, and customer pipeline.
            </p>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateUpdate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ Daily Price Update</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('whatsapp-center')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Broadcast</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateEnquiry}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Enquiry</span>
            </button>
          </div>
        </div>

        {/* Live Steel Rates Ribbon */}
        {latestUpdate && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Today&apos;s Benchmark Prices ({latestUpdate.date}):
                </span>
              </div>
              <button
                type="button"
                onClick={() => onGeneratePostForUpdate(latestUpdate)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>Generate WhatsApp Post</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {latestUpdate.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate('daily-updates')}
                  className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-xl p-2.5 cursor-pointer transition-colors"
                >
                  <div className="text-[11px] font-bold text-slate-600 truncate">{item.grade}</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    ₹{item.price.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">/{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {item.changeNote?.includes('+') ? (
                      <span className="text-[10px] font-bold text-red-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> {item.changeNote}
                      </span>
                    ) : item.changeNote?.includes('-') ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> {item.changeNote}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 flex items-center">
                        <Minus className="w-3 h-3 mr-0.5" /> Stable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8 Clickable Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Today's Enquiries */}
        <div
          onClick={() => onNavigate('enquiries')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{todayEnquiries.length}</span>
            <span className="text-xs text-blue-600 font-medium">New requests</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Click to view incoming leads</p>
        </div>

        {/* Card 2: Recent Sales Volume */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent Sales (₹)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ₹{(todaySalesTotal / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-emerald-600 font-medium">{orders.length} orders</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active order pipeline</p>
        </div>

        {/* Card 3: Pending Enquiries */}
        <div
          onClick={() => onNavigate('enquiries')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingEnquiries.length}</span>
            <span className="text-xs text-orange-600 font-medium">Action needed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting rate or quotation</p>
        </div>

        {/* Card 4: Today's Product Updates */}
        <div
          onClick={() => onNavigate('daily-updates')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily Price Updates
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{dailyUpdates.length}</span>
            <span className="text-xs text-slate-600 font-medium">Sheets published</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Latest: 18 September 2026</p>
        </div>

        {/* Card 5: Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{customers.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Active directory</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contractors & Wholesalers</p>
        </div>

        {/* Card 6: WhatsApp Communication Count */}
        <div
          onClick={() => onNavigate('whatsapp-center')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              WhatsApp Activity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{whatsAppMessages.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Logged interactions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Broadcasts & incoming replies</p>
        </div>

        {/* Card 7: New Orders Processing */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In-Process Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{newOrdersCount}</span>
            <span className="text-xs text-blue-600 font-medium">Rolling & loading</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Trailer dispatch pending</p>
        </div>

        {/* Card 8: Pending Follow-ups */}
        <div
          onClick={() => onNavigate('follow-ups')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Follow-ups
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingFollowUps.length}</span>
            <span className="text-xs text-amber-700 font-medium">Scheduled today</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customer call & quotation check</p>
        </div>
      </div>

      {/* Business Activity Section: Recent Enquiries, Recent Orders, Recent WhatsApp Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Recent Enquiries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Enquiries</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('enquiries')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View all ({enquiries.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-2">
              {enquiries.slice(0, 4).map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => onNavigate('enquiries')}
                  className="pt-2 flex items-start justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{enq.customerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                        {enq.source}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {enq.product} ({enq.grade}) • <span className="font-semibold">{enq.quantity} {enq.unit}</span>
                    </div>
                    {enq.whatsappMessage && (
                      <p className="text-[10px] text-emerald-700 italic line-clamp-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                        &ldquo;{enq.whatsappMessage}&rdquo;
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      enq.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : enq.status === 'Won'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onOpenCreateEnquiry}
              className="w-full py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
            >
              + Add New Sales Enquiry
            </button>
          </div>
        </div>

        {/* Section B: Recent Sales Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View all ({orders.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-2">
              {orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onNavigate('orders')}
                  className="pt-2 flex items-start justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{ord.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ord.orderNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Total: <span className="font-extrabold text-slate-900">₹{ord.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                      📍 {ord.deliveryLocation}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{ord.orderDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
            >
              + Create New Sales Order
            </button>
          </div>
        </div>

        {/* Section C: Recent WhatsApp Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('whatsapp-center')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Open Center
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-2">
              {whatsAppMessages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigate('whatsapp-center')}
                  className="pt-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">{msg.customerName}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        msg.type === 'received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {msg.type === 'received' ? 'Inbound Reply' : 'Price Broadcast'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{msg.whatsappNumber}</span>
                    <span>Status: {msg.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => onNavigate('whatsapp-center')}
              className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
            >
              Broadcast Daily Price via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
