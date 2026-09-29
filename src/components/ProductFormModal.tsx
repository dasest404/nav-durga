import React, { useState, useEffect } from 'react';
import { X, Package, Save, Calculator } from 'lucide-react';
import { Product } from '../types';
import { normalizeGrade } from '../utils/rateCalculator';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [productCategory, setProductCategory] = useState('MS Channel');
  const [productName, setProductName] = useState('');
  const [size, setSize] = useState('');
  const [grade, setGrade] = useState('Medium');
  const [rateSource, setRateSource] = useState('NAV DURGA ISPAT PVT. LTD.');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('MT');
  const [baseRate, setBaseRate] = useState<number>(40211);
  const [gaugeDifference, setGaugeDifference] = useState<number>(400);
  const [loadingCharge, setLoadingCharge] = useState<number>(365);
  const [insuranceCharge, setInsuranceCharge] = useState<number>(30);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [minOrderQty, setMinOrderQty] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Calculate live final rate
  const liveFinalRate = baseRate + gaugeDifference + loadingCharge + insuranceCharge + otherCharges;

  useEffect(() => {
    if (product) {
      setProductCategory(product.productCategory || product.category || 'MS Channel');
      setProductName(product.productName || product.name || '');
      setSize(product.size || '');
      setGrade(product.grade || product.gaugeType || 'Medium');
      setRateSource(product.rateSource || 'NAV DURGA ISPAT PVT. LTD.');
      setCode(product.code || '');
      setUnit(product.unit || 'MT');
      setBaseRate(product.baseRate || 40211);
      setGaugeDifference(product.gaugeDifference !== undefined ? product.gaugeDifference : 400);
      setLoadingCharge(product.loadingCharge !== undefined ? product.loadingCharge : 365);
      setInsuranceCharge(product.insuranceCharge !== undefined ? product.insuranceCharge : 30);
      setOtherCharges(product.otherCharges || 0);
      setEffectiveFrom(product.effectiveFrom || new Date().toISOString().split('T')[0]);
      setMinOrderQty(product.minOrderQty || 5);
      setDescription(product.description || '');
      setInStock(product.inStock);
      setStatus(product.status);
    } else {
      setProductCategory('MS Channel');
      setProductName('MS Channel');
      setSize('');
      setGrade('SL');
      setRateSource('NS ISPAT (INDIA) PVT. LTD. UNIT-II');
      setCode(`ND-PRD-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('MT');
      setBaseRate(40211);
      setGaugeDifference(7500);
      setLoadingCharge(365);
      setInsuranceCharge(30);
      setOtherCharges(0);
      setEffectiveFrom(new Date().toISOString().split('T')[0]);
      setMinOrderQty(5);
      setDescription('');
      setInStock(true);
      setStatus('Active');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !size.trim()) {
      alert('Please fill in required fields: Product Name and Size');
      return;
    }

    const calculatedPrice = liveFinalRate;
    const prevPrice = product ? product.currentPrice : calculatedPrice;
    const normGrade = normalizeGrade(grade);
    const section =
      normGrade === 'SL' || normGrade === '5 KG' || normGrade === '8 KG' || size.includes('70') || size.includes('75')
        ? 'LIGHT SECTION'
        : 'MEDIUM SECTION';

    onSave({
      name: productName,
      productName,
      productCategory,
      category: productCategory,
      size,
      grade: normGrade,
      gaugeType: normGrade,
      section,
      rateSource,
      code,
      unit,
      baseRate,
      gaugeDifference,
      loadingCharge,
      insuranceCharge,
      otherCharges,
      finalRate: calculatedPrice,
      currentPrice: calculatedPrice,
      previousPrice: prevPrice,
      priceChange: calculatedPrice - prevPrice,
      effectiveFrom,
      minOrderQty,
      description,
      inStock,
      status,
      priceHistory: product
        ? [
            {
              date: effectiveFrom,
              price: calculatedPrice,
              changeReason: `Product rate updated (Base: ₹${baseRate} + Diff: ₹${gaugeDifference} + Charges: ₹${loadingCharge + insuranceCharge + otherCharges})`,
            },
            ...(product.priceHistory || []),
          ]
        : [
            {
              date: effectiveFrom,
              price: calculatedPrice,
              changeReason: 'Initial creation',
            },
          ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {product ? 'Edit Steel Product Specification' : 'Add Steel Product Specification'}
              </h2>
              <p className="text-xs text-slate-500">
                Category, Size, Gauge Difference & Multi-Component Rate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Section 1: Classification & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rate Source / Mill <span className="text-red-500">*</span>
              </label>
              <select
                value={rateSource}
                onChange={(e) => setRateSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="NAV DURGA ISPAT PVT. LTD.">NAV DURGA ISPAT PVT. LTD.</option>
                <option value="NS ISPAT (INDIA) PVT. LTD. UNIT-II">
                  NS ISPAT (INDIA) PVT. LTD. UNIT-II
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Category <span className="text-red-500">*</span>
              </label>
              <select
                value={productCategory}
                onChange={(e) => {
                  setProductCategory(e.target.value);
                  if (!productName || productName === 'MS Channel' || productName === 'Beam / Joist') {
                    setProductName(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="MS Channel">MS Channel</option>
                <option value="Beam / Joist">Beam / Joist</option>
                <option value="MS Angle">MS Angle</option>
                <option value="MS Flat">MS Flat</option>
                <option value="MS Round">MS Round</option>
                <option value="MS Square">MS Square</option>
                <option value="MS Plate">MS Plate</option>
                <option value="MS Pipe">MS Pipe</option>
                <option value="TMT Bars">TMT Bars</option>
                <option value="Wire & Billets">Wire & Billets</option>
                <option value="Other Steel Products">Other Steel Products</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. MS Channel"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Size, Gauge/Type, Code, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Size <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 70 × 35 mm"
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/30 text-xs font-extrabold text-blue-950 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="Medium">Medium</option>
                <option value="SL">SL</option>
                <option value="5 KG">5 KG</option>
                <option value="8 KG">8 KG</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. NS-CH-7035-SL"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="MT">MT (Metric Ton)</option>
                <option value="Kg">Kg</option>
                <option value="Piece">Piece</option>
              </select>
            </div>
          </div>

          {/* Section 3: Rate Components & Calculation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                Rate Breakdown Components (₹ / {unit})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Formula: Base + Gauge Diff + Loading + Insurance + Other = Final
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Base Rate
                </label>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-700 mb-1">
                  Gauge Diff
                </label>
                <input
                  type="number"
                  value={gaugeDifference}
                  onChange={(e) => setGaugeDifference(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 text-xs font-extrabold text-blue-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Loading
                </label>
                <input
                  type="number"
                  value={loadingCharge}
                  onChange={(e) => setLoadingCharge(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Insurance
                </label>
                <input
                  type="number"
                  value={insuranceCharge}
                  onChange={(e) => setInsuranceCharge(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Other / Adj.
                </label>
                <input
                  type="number"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Calculated Final Rate Callout */}
            <div className="p-3 bg-blue-600 text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
                  Calculated Final Rate
                </span>
                <div className="text-lg font-extrabold">
                  ₹{liveFinalRate.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-blue-200">/ {unit}</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-blue-100">
                ₹{baseRate} + ₹{gaugeDifference} + ₹{loadingCharge + insuranceCharge}
              </div>
            </div>
          </div>

          {/* Section 4: Effective Date, MOQ, Status & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min Order Qty (MOQ)
              </label>
              <input
                type="number"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, applications, tolerances..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Product Specification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
