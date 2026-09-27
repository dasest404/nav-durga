import React from 'react';
import {
  Menu,
  X,
  Bell,
  Sparkles,
  TrendingUp,
  Building2,
  Calendar,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { ActiveTab, CompanySettings, WhatsAppConfig } from '../types';

interface HeaderProps {
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  pendingEnquiriesCount: number;
  onOpenQuickUpdate: () => void;
  onOpenQuickEnquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  whatsAppConfig,
  currentTab,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  pendingEnquiriesCount,
  onOpenQuickUpdate,
  onOpenQuickEnquiry,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="w-full max-w-7xl lg:max-w-none mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs tracking-tight group-hover:bg-blue-700 transition-colors">
                ND
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight leading-tight">
                    {company.companyName}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    ERP
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Powered by</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    {company.poweredBy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Info Tickers (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-800">18 Sept 2026</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Raipur Market Active
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-600">WhatsApp:</span>
              <span
                className={`font-semibold ${
                  whatsAppConfig.status === 'Connected' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {whatsAppConfig.status === 'Connected' ? 'API Connected' : 'Manual Mode (Ready)'}
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick action buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('ai-assistant')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  currentTab === 'ai-assistant'
                    ? 'bg-slate-900 text-amber-300 ring-2 ring-blue-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
                title="Open Nav Durga AI Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Assistant</span>
              </button>

              <button
                type="button"
                onClick={onOpenQuickUpdate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                title="Create Today's Price Update"
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Price Update</span>
              </button>

              <button
                type="button"
                onClick={onOpenQuickEnquiry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
                title="Log New Customer Enquiry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Enquiry</span>
              </button>
            </div>

            {/* Notification Badge */}
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Enquiries"
            >
              <Bell className="w-5 h-5" />
              {pendingEnquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingEnquiriesCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                VP
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">Virendra Patel</span>
                <span className="text-[10px] text-slate-500 font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
