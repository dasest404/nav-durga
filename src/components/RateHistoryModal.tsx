import React, { useState } from 'react';
import { X, History, Search, Calendar, Building2, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';
import { RateHistoryRecord } from '../types';
import { getGaugeBadgeStyles, normalizeGaugeType } from '../utils/rateCalculator';

interface RateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateHistory: RateHistoryRecord[];
}

export const RateHistoryModal: React.FC<RateHistoryModalProps> = ({
  isOpen,
  onClose,
  rateHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');

  if (!isOpen) return null;

  const sources = ['All', ...Array.from(new Set(rateHistory.map((r) => r.rateSource)))];

  const filteredHistory = rateHistory.filter((r) => {
    const matchesSource = selectedSource === 'All' || r.rateSource === selectedSource;
    const matchesSearch =
      searchTerm === '' ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gaugeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.date.includes(searchTerm) ||
      r.updatedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSource && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Daily Rate Audit History
              </h2>
              <p className="text-xs text-slate-500">
                Complete historical record of steel base rates and gauge differentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by size (e.g. 70×35), product, date, or user..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
          <div className="sm:col-span-5">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  Mill: {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto flex-1 p-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Rate Source</th>
                <th className="py-2.5 px-3">Product / Size</th>
                <th className="py-2.5 px-3">Gauge</th>
                <th className="py-2.5 px-3 text-right">Base Rate</th>
                <th className="py-2.5 px-3 text-right">Gauge Diff</th>
                <th className="py-2.5 px-3 text-right">Previous</th>
                <th className="py-2.5 px-3 text-right">New Final Rate</th>
                <th className="py-2.5 px-3 text-right">Change</th>
                <th className="py-2.5 px-3">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No historical rate updates logged yet.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const badge = getGaugeBadgeStyles(item.gaugeType);
                  const isUp = item.priceDifference > 0;
                  const isDown = item.priceDifference < 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]" title={item.rateSource}>
                        {item.rateSource}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.productName} - {item.size}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {item.gaugeType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                        ₹{item.baseRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                        +₹{item.gaugeDifference.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        ₹{item.previousRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-blue-800">
                        ₹{item.finalRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                        {isUp ? (
                          <span className="text-emerald-700 inline-flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +₹{item.priceDifference}
                          </span>
                        ) : isDown ? (
                          <span className="text-red-600 inline-flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            -₹{Math.abs(item.priceDifference)}
                          </span>
                        ) : (
                          <span className="text-slate-400 inline-flex items-center gap-0.5">
                            <Minus className="w-3 h-3" />
                            0
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[100px]">
                        {item.updatedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Total Logged Revisions: <strong>{filteredHistory.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
