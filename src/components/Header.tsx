import React, { useMemo } from 'react';
import {
  Menu,
  X,
  Bell,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { ActiveTab, CompanySettings } from '../types';

interface HeaderProps {
  company: CompanySettings;
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  pendingEnquiriesCount: number;
  currentUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  currentTab,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  pendingEnquiriesCount,
  currentUser,
  onSignIn,
  onSignOut,
}) => {
  // Dynamically formatted current real date using the user's local date (e.g. "29 Sept 2026")
  const formattedCurrentDate = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="w-full max-w-7xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-xs tracking-tight group-hover:bg-blue-700 transition-colors shrink-0">
                ND
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="font-bold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight leading-tight truncate">
                    {company.companyName}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                    ERP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  <span>Powered by</span>
                  <span className="text-blue-600 font-semibold truncate">
                    {company.poweredBy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Info Ticker (Dynamic Date & Raipur Market Active Status) */}
          <div className="hidden md:flex items-center text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800 whitespace-nowrap">{formattedCurrentDate}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Raipur Market Active
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick AI Assistant button */}
            <button
              type="button"
              onClick={() => onNavigate('ai-assistant')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                currentTab === 'ai-assistant'
                  ? 'bg-slate-900 text-amber-300 ring-2 ring-blue-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
              title="Open Nav Durga AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Notification Badge */}
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="View Enquiries"
            >
              <Bell className="w-5 h-5" />
              {pendingEnquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingEnquiriesCount}
                </span>
              )}
            </button>

            {/* User Profile / Firebase Auth Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  onClick={() => onNavigate('settings')}
                  className="hidden lg:flex flex-col text-left cursor-pointer hover:opacity-80"
                >
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Firebase Sync
                  </span>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="hidden sm:inline-flex text-[10px] font-bold text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {onSignIn ? (
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                    title="Sign in with Google Firebase"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Sign In</span>
                  </button>
                ) : (
                  <div
                    onClick={() => onNavigate('settings')}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                      VP
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight">Virendra Patel</span>
                      <span className="text-[10px] text-slate-500 font-medium">Administrator</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
