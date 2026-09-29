import React, { useState } from 'react';
import {
  Layers,
  Search,
  Save,
  CheckCircle2,
  Building2,
  Tag,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Product, RateChargesConfig, CompanyGradeBasicRates, CategoryBasicRates } from '../types';
import {
  getGaugeBadgeStyles,
  normalizeGrade,
  calculateSimpleFinalRate,
  resolveProductBasicRate,
  resolveProductCategoryBasicRate,
} from '../utils/rateCalculator';

interface GaugeDifferenceMasterViewProps {
  products: Product[];
  rateCharges: RateChargesConfig;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  onUpdateProducts: (updated: Product[]) => void;
  onAddNewVariation?: () => void;
  onOpenDailyRates?: () => void;
}

export const GaugeDifferenceMasterView: React.FC<GaugeDifferenceMasterViewProps> = ({
  products,
  rateCharges,
  categoryBasicRates,
  gradeBasicRates,
  onUpdateProducts,
  onOpenDailyRates,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 'Medium' | 'SL' | '5 KG' | '8 KG'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingDiffs, setEditingDiffs] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Available mills / companies
  const rateSources = [
    'All',
    'NAVDURGA ISPAT PVT. LTD.',
    'UNIT-2 - NS ISPAT (I) PVT. LTD.',
  ];

  // Filter products for gauge master
  const filteredProducts = products.filter((p) => {
    const source = p.rateSource || 'NAVDURGA ISPAT PVT. LTD.';
    const size = p.size || '';
    const normGrade = normalizeGrade(p.grade || p.gaugeType);

    const matchesSource =
      selectedSource === 'All' ||
      (selectedSource === 'NAVDURGA ISPAT PVT. LTD.' &&
        (source.includes('NAVDURGA') || source.includes('NAV DURGA') || p.section === 'MEDIUM SECTION')) ||
      (selectedSource === 'UNIT-2 - NS ISPAT (I) PVT. LTD.' &&
        (source.includes('NS ISPAT') || source.includes('UNIT-2') || p.section === 'LIGHT SECTION'));
    const matchesGrade = selectedGrade === 'ALL' || normGrade === selectedGrade;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.section || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSource && matchesGrade && matchesSearch;
  });

  const handleDiffChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setEditingDiffs((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveAllDiffs = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated = products.map((p) => {
      if (editingDiffs[p.id] !== undefined) {
        const newDiff = editingDiffs[p.id];
        const basicRate = categoryBasicRates
          ? resolveProductCategoryBasicRate(p, categoryBasicRates)
          : resolveProductBasicRate(p, gradeBasicRates);
        const calculatedFinal = calculateSimpleFinalRate(basicRate, newDiff);

        return {
          ...p,
          gaugeDifference: newDiff,
          finalRate: calculatedFinal,
          currentPrice: calculatedFinal,
          previousPrice: p.currentPrice,
          priceChange: calculatedFinal - p.currentPrice,
          priceHistory: [
            {
              date: today,
              price: calculatedFinal,
              changeReason: `Gauge diff updated to ₹${newDiff.toLocaleString('en-IN')}/MT (Final Rate: ₹${calculatedFinal.toLocaleString('en-IN')}/MT)`,
            },
            ...(p.priceHistory || []),
          ],
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setEditingDiffs({});
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const hasUnsavedChanges = Object.keys(editingDiffs).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gauge Difference Master
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
              {filteredProducts.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store and manage product gauge difference (₹/MT). Final rates calculate automatically: <span className="font-bold text-slate-700">FINAL RATE = BASIC RATE + GAUGE DIFFERENCE</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAllDiffs}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Save Changes ({Object.keys(editingDiffs).length})</span>
            </button>
          )}

          {onOpenDailyRates && (
            <button
              type="button"
              onClick={onOpenDailyRates}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              <span>Go to Daily Rates</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Gauge differences saved successfully! All affected product Final Rates have been recalculated.</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, size (125×65, 200×75), grade..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Company Filter */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Company:</span>
            {rateSources.map((source) => {
              const label =
                source === 'All'
                  ? 'All Companies / Units'
                  : source.includes('NAVDURGA') || source.includes('NAV DURGA')
                  ? 'Navdurga Ispat (Medium Section)'
                  : 'Unit-2 NS Ispat (Light Section)';
              const isSelected = selectedSource === source;
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSelectedSource(source)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade Filter Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Grade:</span>
          {(['ALL', 'Medium', 'SL', '5 KG', '8 KG'] as const).map((grd) => {
            const isSelected = selectedGrade === grd;
            return (
              <button
                key={grd}
                type="button"
                onClick={() => setSelectedGrade(grd)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grd}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gauge Difference Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-800">
              GAUGE DIFFERENCE MASTER SPECIFICATIONS
            </span>
          </div>
          <span className="text-slate-500 font-medium">
            Each product stores its individual Gauge Difference. Final Rate = Basic Rate + Gauge Difference.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">S.N.</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Company / Unit</th>
                <th className="py-3 px-4 text-right">Gauge Difference (₹/MT)</th>
                <th className="py-3 px-4 text-right">Basic Rate</th>
                <th className="py-3 px-4 text-right">Calculated Final Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const normGrade = normalizeGrade(p.grade || p.gaugeType);
                  const badgeStyle = getGaugeBadgeStyles(normGrade);
                  const currentDiff =
                    editingDiffs[p.id] !== undefined
                      ? editingDiffs[p.id]
                      : p.gaugeDifference !== undefined
                      ? p.gaugeDifference
                      : 0;
                  const isModified =
                    editingDiffs[p.id] !== undefined &&
                    editingDiffs[p.id] !== (p.gaugeDifference || 0);

                  const basicRate = categoryBasicRates
                    ? resolveProductCategoryBasicRate(p, categoryBasicRates)
                    : resolveProductBasicRate(p, gradeBasicRates);
                  const finalCalculated = calculateSimpleFinalRate(basicRate, currentDiff);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isModified ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.productName || p.name}
                      </td>
                      <td className="py-3 px-4 font-black text-blue-900">
                        {p.size || p.grade}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {normGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {p.section || (p.rateSource?.includes('NS ISPAT') ? 'LIGHT SECTION' : 'MEDIUM SECTION')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]" title={p.rateSource}>
                            {p.rateSource || 'NAV DURGA ISPAT PVT. LTD.'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span className="text-slate-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={currentDiff}
                            onChange={(e) => handleDiffChange(p.id, e.target.value)}
                            step="100"
                            className={`w-28 text-right py-1.5 px-2 text-xs font-black rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              isModified
                                ? 'border-amber-400 bg-amber-50 text-amber-900'
                                : 'border-slate-200 bg-white text-slate-800'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500">
                        ₹{basicRate.toLocaleString('en-IN')}/MT
                      </td>
                      <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">
                        ₹{finalCalculated.toLocaleString('en-IN')}/MT
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Formula: <strong className="text-slate-700 font-bold">FINAL RATE = BASIC RATE + GAUGE DIFFERENCE</strong>. Do not manually enter final rates.
          </span>
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAllDiffs}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
            >
              Save {Object.keys(editingDiffs).length} pending modifications now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
