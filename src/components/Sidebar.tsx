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
  ChevronRight,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingEnquiriesCount: number;
  pendingFollowUpsCount: number;
  todayOrdersCount: number;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeText?: string;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingEnquiriesCount,
  pendingFollowUpsCount,
  todayOrdersCount,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      category: 'MAIN',
    },
    {
      id: 'ai-assistant',
      label: 'Nav Durga AI Assistant',
      icon: Sparkles,
      badgeText: 'AI',
      badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[9px] px-1.5 py-0.5 shadow-2xs',
      category: 'MAIN',
    },
    {
      id: 'products',
      label: 'Products & Grades',
      icon: Package,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'daily-rates',
      label: 'Daily Rate Management',
      icon: Calendar,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'gauge-master',
      label: 'Gauge Difference Master',
      icon: Layers,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'daily-updates',
      label: 'Daily Price Updates',
      icon: TrendingUp,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'whatsapp-center',
      label: 'WhatsApp Center',
      icon: MessageSquare,
      badge: 1, // Indicates active manual broadcast ready
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'MARKETING & COMM',
    },
    {
      id: 'customers',
      label: 'Customers Directory',
      icon: Users,
      category: 'COMMERCIAL',
    },
    {
      id: 'enquiries',
      label: 'Sales Enquiries',
      icon: HelpCircle,
      badge: pendingEnquiriesCount,
      badgeColor: 'bg-orange-100 text-orange-800 font-bold',
      category: 'COMMERCIAL',
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: FileText,
      category: 'COMMERCIAL',
    },
    {
      id: 'orders',
      label: 'Sales Orders',
      icon: ShoppingCart,
      badge: todayOrdersCount,
      badgeColor: 'bg-blue-100 text-blue-800',
      category: 'COMMERCIAL',
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: pendingFollowUpsCount,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'COMMERCIAL',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      category: 'SYSTEM',
    },
    {
      id: 'settings',
      label: 'ERP Settings',
      icon: Settings,
      category: 'SYSTEM',
    },
  ];

  let currentCategory = '';

  return (
    <aside className="w-56 lg:w-64 bg-white border border-slate-200 rounded-2xl shrink-0 hidden md:flex flex-col justify-between py-4 px-2.5 lg:px-3 shadow-xs select-none self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isCategoryChange = item.category && item.category !== currentCategory;
          if (isCategoryChange) {
            currentCategory = item.category || '';
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {isCategoryChange && (
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border-l-3 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(item.badgeText || (item.badge !== undefined && item.badge > 0)) && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badgeText || item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Industrial Plant Info Box at bottom of sidebar */}
      <div className="mt-4 pt-3 border-t border-slate-200 px-2 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
            <span>Nav Durga Ispat</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              Urla Mill
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Raipur, Chhattisgarh (493221)
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
            <span>Powered by</span>
            <span className="font-semibold text-blue-600">Klyia Tech</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
