import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Save,
  CheckCircle2,
  Layers,
  Search,
  Share2,
  History,
  SlidersHorizontal,
  Check,
  Tag,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  RateChargesConfig,
  RateHistoryRecord,
  CompanyGradeBasicRates,
  CategoryBasicRates,
} from '../types';
import {
  calculateSimpleFinalRate,
  getGaugeBadgeStyles,
  normalizeGrade,
  resolveProductCategoryBasicRate,
  resolveCategoryBasicRate,
} from '../utils/rateCalculator';
import { RateHistoryModal } from './RateHistoryModal';

interface DailyRateUpdateViewProps {
  products: Product[];
  rateCharges: RateChargesConfig;
  rateHistory: RateHistoryRecord[];
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  initialCategory?: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL';
  initialSearch?: string;
  onSaveRates: (
    updatedProducts: Product[],
    newHistoryRecords: RateHistoryRecord[],
    newCharges?: RateChargesConfig,
    updatedGradeBasicRates?: CompanyGradeBasicRates,
    updatedCategoryBasicRates?: CategoryBasicRates
  ) => void;
  onOpenWhatsAppBroadcast?: (
    products: Product[],
    date: string,
    categoryBasicRates?: CategoryBasicRates
  ) => void;
  onOpenGaugeMaster?: () => void;
}

const DEFAULT_CATEGORY_BASIC_RATES: CategoryBasicRates = {
  'MEDIUM SECTION': 49711,
  'LIGHT SECTION': 42211,
};

export const DailyRateUpdateView: React.FC<DailyRateUpdateViewProps> = ({
  products,
  rateCharges,
  rateHistory,
  categoryBasicRates = DEFAULT_CATEGORY_BASIC_RATES,
  gradeBasicRates,
  initialCategory = 'MEDIUM SECTION',
  initialSearch = '',
  onSaveRates,
  onOpenWhatsAppBroadcast,
  onOpenGaugeMaster,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Active Category / Section view tab: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL'
  const [activeCategoryTab, setActiveCategoryTab] = useState<
    'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL'
  >(initialCategory);

  // Category Basic Rates state:
  // MEDIUM SECTION: 49,711 / MT (NAVDURGA ISPAT PVT. LTD.)
  // LIGHT SECTION: 42,211 / MT (UNIT-2 - NS ISPAT (I) PVT. LTD.)
  const [localCategoryRates, setLocalCategoryRates] = useState<CategoryBasicRates>(() => ({
    'MEDIUM SECTION':
      categoryBasicRates?.['MEDIUM SECTION'] !== undefined
        ? categoryBasicRates['MEDIUM SECTION']
        : 49711,
    'LIGHT SECTION':
      categoryBasicRates?.['LIGHT SECTION'] !== undefined
        ? categoryBasicRates['LIGHT SECTION']
        : 42211,
  }));

  // Selected product IDs for bulk operations or presets
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkRateInput, setBulkRateInput] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategoryTab(initialCategory);
    }
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialCategory, initialSearch]);

  // Update a category's basic rate
  // Changing the Basic Rate in one category does NOT change the Basic Rate of another category
  const handleCategoryBasicRateChange = (category: 'MEDIUM SECTION' | 'LIGHT SECTION', val: string) => {
    const num = parseInt(val, 10);
    const validVal = isNaN(num) ? 0 : num;
    setLocalCategoryRates((prev) => ({
      ...prev,
      [category]: validVal,
    }));
  };

  // Helper: Get product's category Basic Rate
  const getProductBasicRate = (p: Product): number => {
    return resolveProductCategoryBasicRate(p, localCategoryRates);
  };

  // Helper: Get product's Gauge Difference (automatically fetched from Gauge Difference Master)
  const getProductGaugeDiff = (p: Product): number => {
    return p.gaugeDifference !== undefined ? p.gaugeDifference : 0;
  };

  // Helper: Automatic Final Rate Formula:
  // FINAL RATE = CATEGORY BASIC RATE + GAUGE DIFFERENCE
  const getProductFinalRate = (p: Product): number => {
    const basic = getProductBasicRate(p);
    const diff = getProductGaugeDiff(p);
    return calculateSimpleFinalRate(basic, diff);
  };

  // Split products into Medium Section and Light Section
  const mediumSectionProducts = useMemo(() => {
    return products.filter((p) => {
      const isMed =
        p.section === 'MEDIUM SECTION' ||
        (!p.section && !p.rateSource?.includes('NS ISPAT'));
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.size || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isMed && matchesSearch;
    });
  }, [products, searchTerm]);

  const lightSectionProducts = useMemo(() => {
    return products.filter((p) => {
      const isLight =
        p.section === 'LIGHT SECTION' ||
        (!p.section && p.rateSource?.includes('NS ISPAT'));
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.size || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isLight && matchesSearch;
    });
  }, [products, searchTerm]);

  // Section Preset (Auto-select) button:
  // MEDIUM SECTION selects all 13 products
  // LIGHT SECTION selects all 9 products
  const handleSectionPreset = (sec: 'MEDIUM SECTION' | 'LIGHT SECTION') => {
    setActiveCategoryTab(sec);
    const targetProds = sec === 'MEDIUM SECTION' ? mediumSectionProducts : lightSectionProducts;
    setSelectedProductIds(new Set(targetProds.map((p) => p.id)));
    setSuccessMsg(`Auto-selected all ${targetProds.length} products in ${sec}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Toggle single product selection
  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all in active category
  const handleToggleSelectAllCategory = (catProducts: Product[]) => {
    const allSelected = catProducts.every((p) => selectedProductIds.has(p.id));
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        catProducts.forEach((p) => next.delete(p.id));
      } else {
        catProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  // Direct manual rate override for selected items
  const handleUpdateRateForSelected = () => {
    const num = parseInt(bulkRateInput, 10);
    if (isNaN(num) || num <= 0 || selectedProductIds.size === 0) return;

    // Apply to selected products
    const updated = products.map((p) => {
      if (selectedProductIds.has(p.id)) {
        return {
          ...p,
          finalRate: num,
          currentPrice: num,
          priceChange: num - (p.previousPrice || num),
        };
      }
      return p;
    });

    onSaveRates(
      updated,
      [],
      rateCharges,
      gradeBasicRates,
      localCategoryRates
    );
    setSuccessMsg(
      `Updated final rate to ₹${num.toLocaleString('en-IN')}/MT for ${selectedProductIds.size} selected products.`
    );
    setBulkRateInput('');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Save and Publish Daily Rates
  const handleSaveRates = () => {
    const today = selectedDate;
    const newHistoryRecords: RateHistoryRecord[] = [];

    const updatedProducts: Product[] = products.map((p) => {
      const basicRate = getProductBasicRate(p);
      const gaugeDiff = getProductGaugeDiff(p);
      const finalRate = calculateSimpleFinalRate(basicRate, gaugeDiff);
      const prevPrice = p.currentPrice || finalRate;
      const priceDiff = finalRate - prevPrice;

      if (priceDiff !== 0) {
        newHistoryRecords.push({
          id: `rh-${Date.now()}-${p.id}`,
          date: today,
          effectiveFrom: today,
          rateSource: p.rateSource || 'NAV DURGA ISPAT PVT. LTD.',
          productId: p.id,
          productCategory: p.productCategory || p.category,
          productName: p.productName || p.name,
          size: p.size || '',
          gaugeType: p.gaugeType || p.grade,
          baseRate: basicRate,
          gaugeDifference: gaugeDiff,
          loadingCharge: 0,
          insuranceCharge: 0,
          otherCharges: 0,
          previousRate: prevPrice,
          finalRate: finalRate,
          priceDifference: priceDiff,
          updatedBy: 'Admin',
          timestamp: new Date().toISOString(),
        });
      }

      return {
        ...p,
        baseRate: basicRate,
        gaugeDifference: gaugeDiff,
        finalRate: finalRate,
        currentPrice: finalRate,
        previousPrice: prevPrice,
        priceChange: priceDiff,
        priceHistory: [
          {
            date: today,
            price: finalRate,
            changeReason: `Daily rate update (Category Basic: ₹${basicRate.toLocaleString('en-IN')}, Gauge Diff: ₹${gaugeDiff.toLocaleString('en-IN')})`,
          },
          ...(p.priceHistory || []),
        ],
      };
    });

    onSaveRates(
      updatedProducts,
      newHistoryRecords,
      rateCharges,
      gradeBasicRates,
      localCategoryRates
    );
    setSuccessMsg('Daily Rate Card published and saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Render a Category Daily Rate Card (Section 4 Design)
  const renderCategoryRateCard = (
    companyName: string,
    categoryName: 'MEDIUM SECTION' | 'LIGHT SECTION',
    cardProducts: Product[],
    accentColor: 'blue' | 'amber'
  ) => {
    const basicRate = localCategoryRates[categoryName] || (categoryName === 'MEDIUM SECTION' ? 49711 : 42211);
    const isBlue = accentColor === 'blue';

    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden mb-6 transition-all hover:border-slate-300">
        {/* Card Header: Company Name, Category / Section, and Editable Basic Rate Input */}
        <div
          className={`p-5 border-b ${
            isBlue
              ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white border-blue-700'
              : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white border-amber-700'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className={`w-4 h-4 ${isBlue ? 'text-blue-300' : 'text-amber-400'}`} />
                <span className="text-xs uppercase font-black tracking-widest text-slate-300">
                  {companyName}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Category: {categoryName}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/20 text-white">
                  {cardProducts.length} Products
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Formula: <strong className="text-white font-extrabold">FINAL RATE = BASIC RATE + GAUGE DIFFERENCE</strong>.
                Rates calculate automatically from Gauge Difference Master.
              </p>
            </div>

            {/* Editable Basic Rate Input for this Category */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-200 block">
                  BASIC RATE (₹/MT):
                </label>
                <div className="text-[10px] text-slate-300">Category-wise Basic Rate</div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={basicRate}
                  onChange={(e) => handleCategoryBasicRateChange(categoryName, e.target.value)}
                  step="100"
                  placeholder={categoryName === 'MEDIUM SECTION' ? '49711' : '42211'}
                  className="w-36 sm:w-44 pl-7 pr-12 py-2 text-base sm:text-lg font-black font-mono text-slate-900 bg-white rounded-xl border-2 border-white focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  / MT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table: S.N. | PRODUCT | SIZE | GRADE | GAUGE DIFF. | FINAL RATE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      cardProducts.length > 0 &&
                      cardProducts.every((p) => selectedProductIds.has(p.id))
                    }
                    onChange={() => handleToggleSelectAllCategory(cardProducts)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-12 text-center">S.N.</th>
                <th className="py-3 px-4">PRODUCT</th>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">GRADE</th>
                <th className="py-3 px-4 text-right">GAUGE DIFF.</th>
                <th className="py-3 px-4 text-right">FINAL RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cardProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No products found in this category.
                  </td>
                </tr>
              ) : (
                cardProducts.map((p, index) => {
                  const isSelected = selectedProductIds.has(p.id);
                  const normGrade = normalizeGrade(p.grade || p.gaugeType);
                  const badgeStyle = getGaugeBadgeStyles(normGrade);
                  const gaugeDiff = getProductGaugeDiff(p);
                  const finalRate = calculateSimpleFinalRate(basicRate, gaugeDiff);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isSelected ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(p.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        {p.productName || p.name}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-blue-900">
                        {p.size || p.grade}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {normGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-700">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span className="font-mono text-slate-900">
                            ₹{gaugeDiff.toLocaleString('en-IN')}
                          </span>
                          <span
                            className="text-[10px] text-slate-400 font-normal hidden sm:inline"
                            title="Auto-fetched from Gauge Difference Master"
                          >
                            (Master)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-blue-700 text-sm sm:text-base">
                        ₹{finalRate.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-400 block">
                          (₹{basicRate.toLocaleString('en-IN')} + ₹{gaugeDiff.toLocaleString('en-IN')})
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer Banner */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            <strong className="font-black text-slate-800">{categoryName} Summary:</strong> Basic Rate ₹{basicRate.toLocaleString('en-IN')}/MT • {cardProducts.length} Products
          </div>
          <div className="text-[11px] text-slate-500">
            Formula: <span className="font-mono font-bold text-slate-700">FINAL RATE = ₹{basicRate.toLocaleString('en-IN')} + GAUGE DIFFERENCE</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daily Rate Card
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
              Ex-Plant Urla, Raipur
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Category-wise Basic Rate configuration. Automatic formula:{' '}
            <span className="font-black text-slate-800">
              FINAL RATE = CATEGORY BASIC RATE + GAUGE DIFFERENCE
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Rate History</span>
          </button>

          {onOpenGaugeMaster && (
            <button
              type="button"
              onClick={onOpenGaugeMaster}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 shadow-xs transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Gauge Master</span>
            </button>
          )}

          {onOpenWhatsAppBroadcast && (
            <button
              type="button"
              onClick={() => {
                // Prepare active products with newly calculated rates
                const prepared = products.map((p) => {
                  const basic = getProductBasicRate(p);
                  const diff = getProductGaugeDiff(p);
                  const final = calculateSimpleFinalRate(basic, diff);
                  return {
                    ...p,
                    baseRate: basic,
                    gaugeDifference: diff,
                    finalRate: final,
                    currentPrice: final,
                  };
                });
                onOpenWhatsAppBroadcast(prepared, selectedDate, localCategoryRates);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Post</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveRates}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Publish Rates</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Category Tabs & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('MEDIUM SECTION')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'MEDIUM SECTION'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>MEDIUM SECTION<span className="hidden sm:inline"> — NAVDURGA ISPAT</span> (13)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab('LIGHT SECTION')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'LIGHT SECTION'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>LIGHT SECTION<span className="hidden sm:inline"> — UNIT-2 NS ISPAT</span> (9)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeCategoryTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ALL CATEGORIES (22)
            </button>
          </div>

          {/* Rate Date Picker */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 flex-wrap">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Rate Card Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Section Presets & Quick Tools */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Section Preset:</span>
            <button
              type="button"
              onClick={() => handleSectionPreset('MEDIUM SECTION')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 cursor-pointer"
            >
              Auto-Select MEDIUM SECTION (13)
            </button>
            <button
              type="button"
              onClick={() => handleSectionPreset('LIGHT SECTION')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              Auto-Select LIGHT SECTION (9)
            </button>
            {selectedProductIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedProductIds(new Set())}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 underline ml-1 cursor-pointer"
              >
                Clear Selection ({selectedProductIds.size})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, size..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CATEGORY DAILY RATE CARDS                                                 */}
      {/* ========================================================================= */}
      {(activeCategoryTab === 'MEDIUM SECTION' || activeCategoryTab === 'ALL') &&
        renderCategoryRateCard(
          'NAVDURGA ISPAT PVT. LTD.',
          'MEDIUM SECTION',
          mediumSectionProducts,
          'blue'
        )}

      {(activeCategoryTab === 'LIGHT SECTION' || activeCategoryTab === 'ALL') &&
        renderCategoryRateCard(
          'UNIT-2 — NS ISPAT (I) PVT. LTD.',
          'LIGHT SECTION',
          lightSectionProducts,
          'amber'
        )}

      {/* History Modal */}
      {showHistoryModal && (
        <RateHistoryModal
          isOpen={showHistoryModal}
          rateHistory={rateHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};
