import React from 'react';
import { X, Calculator, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { Product, RateChargesConfig } from '../types';
import { calculateFinalRate, getGaugeBadgeStyles, normalizeGaugeType } from '../utils/rateCalculator';

interface RateBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  rateCharges: RateChargesConfig;
}

export const RateBreakdownModal: React.FC<RateBreakdownModalProps> = ({
  isOpen,
  onClose,
  product,
  rateCharges,
}) => {
  if (!isOpen || !product) return null;

  const baseRate = product.baseRate || rateCharges.defaultBaseRate;
  const gaugeDiff = product.gaugeDifference || 0;
  const loading = product.loadingCharge !== undefined ? product.loadingCharge : rateCharges.loadingCharge;
  const insurance = product.insuranceCharge !== undefined ? product.insuranceCharge : rateCharges.insuranceCharge;
  const randomLen = (product.randomLengthDeduction || 0);
  const isRandom = randomLen > 0;
  const specLen = (product.specialLengthCharge || 0);
  const isSpec = specLen > 0;
  const payAdj = (product.paymentAdjustment || 0);
  const isPay = payAdj > 0;
  const other = product.otherCharges || 0;

  const breakdown = calculateFinalRate(
    {
      baseRate,
      gaugeDifference: gaugeDiff,
      loadingCharge: loading,
      insuranceCharge: insurance,
      isRandomLength: isRandom,
      randomLengthDeduction: randomLen,
      isSpecialLength: isSpec,
      specialLengthCharge: specLen,
      isNextDayPayment: isPay,
      paymentAdjustment: payAdj,
      otherCharges: other,
    },
    rateCharges
  );

  const gaugeBadge = getGaugeBadgeStyles(product.gaugeType || 'Medium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rate Calculation Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Transparent component-wise pricing for this specification
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

        {/* Product Spec Banner */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
              {product.rateSource || 'NAV DURGA ISPAT PVT. LTD.'}
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {product.productName || product.name} - {product.size || product.grade}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${gaugeBadge.bg} ${gaugeBadge.text} ${gaugeBadge.border}`}>
            {normalizeGaugeType(product.gaugeType)}
          </span>
        </div>

        {/* Calculation Table */}
        <div className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
            <div className="flex justify-between items-center py-2.5 px-3.5 bg-white">
              <span className="text-slate-600 font-medium">Base Rate</span>
              <span className="font-bold text-slate-900">₹{baseRate.toLocaleString('en-IN')}/MT</span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-3.5 bg-white">
              <span className="text-slate-600 font-medium">
                Gauge / Size Difference ({normalizeGaugeType(product.gaugeType)})
              </span>
              <span className="font-bold text-blue-700">+ ₹{gaugeDiff.toLocaleString('en-IN')}/MT</span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-3.5 bg-white">
              <span className="text-slate-600 font-medium">Loading Charge</span>
              <span className="font-bold text-slate-800">+ ₹{loading.toLocaleString('en-IN')}/MT</span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-3.5 bg-white">
              <span className="text-slate-600 font-medium">Insurance Charge</span>
              <span className="font-bold text-slate-800">+ ₹{insurance.toLocaleString('en-IN')}/MT</span>
            </div>

            {isRandom && (
              <div className="flex justify-between items-center py-2.5 px-3.5 bg-amber-50/50">
                <span className="text-amber-800 font-medium">Random Length Deduction</span>
                <span className="font-bold text-amber-700">- ₹{randomLen.toLocaleString('en-IN')}/MT</span>
              </div>
            )}

            {isSpec && (
              <div className="flex justify-between items-center py-2.5 px-3.5 bg-indigo-50/50">
                <span className="text-indigo-800 font-medium">Special Length Charge</span>
                <span className="font-bold text-indigo-700">+ ₹{specLen.toLocaleString('en-IN')}/MT</span>
              </div>
            )}

            {isPay && (
              <div className="flex justify-between items-center py-2.5 px-3.5 bg-purple-50/50">
                <span className="text-purple-800 font-medium">Next Day Payment Adjustment</span>
                <span className="font-bold text-purple-700">+ ₹{payAdj.toLocaleString('en-IN')}/MT</span>
              </div>
            )}

            {other !== 0 && (
              <div className="flex justify-between items-center py-2.5 px-3.5 bg-white">
                <span className="text-slate-600 font-medium">Other Applicable Charges</span>
                <span className="font-bold text-slate-800">+ ₹{other.toLocaleString('en-IN')}/MT</span>
              </div>
            )}
          </div>

          {/* Formula summary */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Calculation: </span>
            {breakdown.formulaString}
          </div>

          {/* Final Rate Total Box */}
          <div className="p-4 bg-blue-600 text-white rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-blue-100 font-semibold block">
                Calculated Final Rate
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                ₹{breakdown.finalRate.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-blue-200"> / MT</span>
              </span>
            </div>
            <div className="text-right text-[11px] text-blue-100">
              <span>Standard Unit: MT</span>
              <span className="block text-white font-bold">GST Extra as applicable</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
