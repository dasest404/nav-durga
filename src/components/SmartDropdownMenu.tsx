import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  ArrowLeftRight,
  Eye,
  Clock,
  History,
  Building2,
  Sparkles,
} from 'lucide-react';
import { SmartDropdownCategory, SmartDropdownAction, Product } from '../types';
import {
  CATEGORY_CONFIGS,
  DROPDOWN_ACTIONS,
  getProductsForDropdownCategory,
} from '../utils/aiDropdownHelper';

interface SmartDropdownMenuProps {
  onSelectAction: (
    category: SmartDropdownCategory,
    action: SmartDropdownAction
  ) => void;
  products: Product[];
  disabled?: boolean;
  className?: string;
  isCompactHeader?: boolean;
}

export const SmartDropdownMenu: React.FC<SmartDropdownMenuProps> = ({
  onSelectAction,
  products,
  disabled = false,
  className = '',
  isCompactHeader = false,
}) => {
  // Only one category may remain expanded at a time (accordion style)
  const [expandedCategory, setExpandedCategory] = useState<SmartDropdownCategory | null>('MEDIUM');

  const categories: SmartDropdownCategory[] = ['MEDIUM', 'SL', 'LIGHT', '5 KG', '8 KG'];

  const toggleCategory = (cat: SmartDropdownCategory) => {
    if (disabled) return;
    setExpandedCategory((prev) => (prev === cat ? null : cat));
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Edit3':
        return <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Eye':
        return <Eye className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'History':
        return <History className="w-4 h-4 text-purple-600 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Menu Header */}
      {!isCompactHeader && (
        <div className="pb-1 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              AI ASSISTANT
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              5 Sections
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-1">
            Choose a category:
          </p>
        </div>
      )}

      {/* Vertically Stacked Categories (No Horizontal Scrolling) */}
      <div className="flex flex-col space-y-2 w-full">
        {categories.map((catKey) => {
          const config = CATEGORY_CONFIGS[catKey];
          const isExpanded = expandedCategory === catKey;
          const count = getProductsForDropdownCategory(catKey, products).length;

          return (
            <div
              key={catKey}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-blue-300 bg-blue-50/20 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Category Header Button (Direct Toggle) */}
              <button
                type="button"
                onClick={() => toggleCategory(catKey)}
                disabled={disabled}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left select-none cursor-pointer focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      catKey === 'MEDIUM' || catKey === 'SL'
                        ? 'bg-blue-600'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>{config.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {count} items
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {config.company}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isExpanded ? 'Collapse' : 'Actions'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Category Actions directly below heading */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-1 border-t border-blue-100/80 bg-white/70 rounded-b-xl flex flex-col space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {DROPDOWN_ACTIONS.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => onSelectAction(catKey, action.key)}
                      disabled={disabled}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-colors group cursor-pointer focus:outline-none border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                          {getActionIcon(action.iconName)}
                        </div>
                        <div className="truncate">
                          <span className="block truncate font-bold text-slate-800 group-hover:text-blue-900">
                            {action.label}
                          </span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-blue-600/80 truncate">
                            {action.shortDesc}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
