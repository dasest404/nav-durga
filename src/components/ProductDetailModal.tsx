import React, { useState } from 'react';
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit2,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onQuickUpdatePrice: (productId: string, newPrice: number, reason: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onQuickUpdatePrice,
}) => {
  const [quickPrice, setQuickPrice] = useState<number>(product?.currentPrice || 0);
  const [reason, setReason] = useState<string>('Daily market revision');
  const [showQuickForm, setShowQuickForm] = useState(false);

  if (!isOpen || !product) return null;

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrice <= 0) return;
    onQuickUpdatePrice(product.id, quickPrice, reason);
    setShowQuickForm(false);
  };

  const isPriceUp = product.priceChange > 0;
  const isPriceDown = product.priceChange < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {product.code}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    product.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grade: <strong className="text-slate-800">{product.grade}</strong> • Category: {product.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 font-medium">Current Price</div>
              <div className="text-xl font-extrabold text-blue-900 mt-1">
                ₹{product.currentPrice.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500"> /{product.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {isPriceUp ? (
                  <span className="text-red-600 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +₹{product.priceChange}
                  </span>
                ) : isPriceDown ? (
                  <span className="text-emerald-600 font-bold flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -₹{Math.abs(product.priceChange)}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium flex items-center">
                    <Minus className="w-3.5 h-3.5 mr-0.5" /> No change
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 font-medium">Previous Price</div>
              <div className="text-lg font-bold text-slate-700 mt-1">
                ₹{product.previousPrice.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500"> /{product.unit}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Benchmark baseline</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 font-medium">Min Order Qty (MOQ)</div>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {product.minOrderQty} {product.unit}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Trailer / Bundle lot</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 font-medium">Stock Status</div>
              <div className="flex items-center gap-1.5 mt-1">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Booking Open
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Rolling stock available</div>
            </div>
          </div>

          {/* Industrial Specifications & Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Industrial Specifications & Description
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
              {product.description || 'Standard technical profile meeting BIS conformance standards for structural engineering and fabrication.'}
            </p>
          </div>

          {/* Rate Breakdown Components */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Multi-Component Pricing Structure
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Source: {product.rateSource || 'NAV DURGA ISPAT PVT. LTD.'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Size & Grade</span>
                <span className="font-extrabold text-slate-900">
                  {product.size || ''} ({product.grade || product.gaugeType || 'Medium'})
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Base Rate</span>
                <span className="font-bold text-slate-900">
                  ₹{(product.baseRate || 40211).toLocaleString('en-IN')}/MT
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-blue-700 font-bold block text-[11px]">Gauge Difference</span>
                <span className="font-extrabold text-blue-900">
                  +₹{(product.gaugeDifference || 0).toLocaleString('en-IN')}/MT
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Loading & Insurance</span>
                <span className="font-bold text-slate-900">
                  ₹{(product.loadingCharge || 365) + (product.insuranceCharge || 30)}/MT
                </span>
              </div>
            </div>
          </div>

          {/* Quick Price Update Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revise Today&apos;s Price</h3>
                <p className="text-xs text-slate-500">
                  Update current price and append entry to the official price audit log.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickPrice(product.currentPrice);
                  setShowQuickForm(!showQuickForm);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {showQuickForm ? 'Cancel' : 'Update Price Now'}
              </button>
            </div>

            {showQuickForm && (
              <form onSubmit={handlePriceSubmit} className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Rate (₹ / {product.unit})
                  </label>
                  <input
                    type="number"
                    required
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Market Revision Reason
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Billet rate surge in Raipur"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Save & Log Price
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Price History Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Historical Price Audit Log</h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Recorded Price</th>
                    <th className="py-2.5 px-3">Revision Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.priceHistory && product.priceHistory.length > 0 ? (
                    product.priceHistory.map((hist, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{hist.date}</td>
                        <td className="py-2.5 px-3 font-extrabold text-blue-950 font-mono">
                          ₹{hist.price.toLocaleString('en-IN')} /{product.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{hist.changeReason || 'Market adjustment'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        No historical records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
