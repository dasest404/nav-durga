import React from 'react';
import { Clock, ShieldCheck, Trash2, RefreshCw, MessageSquare, Phone } from 'lucide-react';
import { WhatsAppTestActivity } from '../types';

interface WhatsAppTestActivityTableProps {
  activities: WhatsAppTestActivity[];
  onClear: () => void;
  onRefresh?: () => void;
}

export const WhatsAppTestActivityTable: React.FC<WhatsAppTestActivityTableProps> = ({
  activities,
  onClear,
  onRefresh,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">WhatsApp Test Activity</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {activities.length} {activities.length === 1 ? 'Action' : 'Actions'} Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Locally tracked manual testing actions performed in this browser session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Refresh log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all local test activities?')) {
                  onClear();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No test actions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Open WhatsApp&quot;, &quot;Copy Message&quot;, or &quot;Download Image&quot; to log activity.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {activities.map((act) => {
                let actionBadgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                if (act.action === 'WhatsApp Opened') {
                  actionBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                } else if (act.action === 'Message Copied') {
                  actionBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                } else if (act.action === 'Image Downloaded') {
                  actionBadgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                }

                return (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTime(act.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="font-bold">{act.customerName}</div>
                      {act.phoneNumber && (
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{act.phoneNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${actionBadgeColor}`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        <ShieldCheck className="w-3 h-3 text-slate-500" />
                        <span>{act.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md break-words">
                      {act.details || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
