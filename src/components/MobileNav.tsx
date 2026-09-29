import React from 'react';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  MessageSquare,
  Users,
  HelpCircle,
  FileText,
  ShoppingCart,
  CalendarCheck,
  BarChart3,
  Settings,
  X,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, CompanySettings } from '../types';

interface MobileNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingEnquiriesCount: number;
  company: CompanySettings;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingEnquiriesCount,
  company,
}) => {
  const allTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'Nav Durga AI Assistant', icon: Sparkles },
    { id: 'products', label: 'Products & Grades', icon: Package },
    { id: 'daily-rates', label: 'Daily Rate Management', icon: Calendar },
    { id: 'gauge-master', label: 'Gauge Difference Master', icon: Layers },
    { id: 'daily-updates', label: 'Daily Price Updates', icon: TrendingUp },
    { id: 'whatsapp-center', label: 'WhatsApp Center', icon: MessageSquare },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'enquiries', label: 'Enquiries', icon: HelpCircle, badge: pendingEnquiriesCount },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'orders', label: 'Sales Orders', icon: ShoppingCart },
    { id: 'follow-ups', label: 'Follow-ups', icon: CalendarCheck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Quick primary items for bottom navigation bar
  const bottomItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI ERP', icon: Sparkles },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'daily-updates', label: 'Updates', icon: TrendingUp },
    { id: 'whatsapp-center', label: 'WhatsApp', icon: MessageSquare },
    { id: 'customers', label: 'Clients', icon: Users },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Side Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ND
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm truncate">{company.companyName}</h2>
              <p className="text-[10px] text-slate-500 truncate">Nav Durga Business ERP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {allTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div>Powered by <span className="font-semibold text-blue-600">{company.poweredBy}</span></div>
          <div className="text-[11px] text-slate-400 mt-0.5">Urla, Raipur (Chhattisgarh)</div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-lg no-print">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-0.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400'}`} />
              <span className="mt-0.5 truncate w-full text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
