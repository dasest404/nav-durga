import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Share2,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  History,
  Layers,
  ChevronDown,
  Check,
  X,
  IndianRupee,
} from 'lucide-react';
import { Product, DailyUpdate, CompanySettings, RateHistoryRecord } from '../types';
import {
  getAvailableSections,
  getAvailableTypes,
  doesProductMatchSection,
  doesProductMatchType,
  doesProductMatchSectionAndType,
} from '../utils/sectionPriceHelper';

interface DailyUpdatesViewProps {
  products: Product[];
  dailyUpdates: DailyUpdate[];
  company: CompanySettings;
  rateHistory?: RateHistoryRecord[];
  onOpenCreateUpdate?: () => void;
  onGeneratePost: (update: DailyUpdate) => void;
  onNavigateToWhatsAppCenter: (updateId: string) => void;
  onSendTestWhatsApp: (update: DailyUpdate) => void;
  onUpdateSectionPrices: (
    updatedProducts: Product[],
    newHistoryRecords: RateHistoryRecord[],
    sectionName?: string
  ) => void;
}

export const DailyUpdatesView: React.FC<DailyUpdatesViewProps> = ({
  products,
  dailyUpdates,
  company,
  rateHistory = [],
  onOpenCreateUpdate,
  onGeneratePost,
  onNavigateToWhatsAppCenter,
  onSendTestWhatsApp,
  onUpdateSectionPrices,
}) => {
  // Active Company / Unit Selection (Company/Unit data preserved internally)
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');

  // Section & Rate Update Inputs (Strict Separation: Section = Group, Type = Variation)
  const [selectedSection, setSelectedSection] = useState<string>('MEDIUM SECTION');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [enteredPrice, setEnteredPrice] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Selected product IDs for multi-selection rate update
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Price Update Effective Date (default to today)
  const [updateDate, setUpdateDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Rate Sheet Filter & Search
  const [rateSheetSectionFilter, setRateSheetSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Success message notification
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    details: string;
  } | null>(null);

  // History section toggle
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Filter products by active company/unit (Company/Unit Safety)
  const unitProducts = useMemo(() => {
    return products.filter((p) => {
      if (!selectedUnit || selectedUnit === 'ALL') return true;
      if (selectedUnit === 'NAV DURGA ISPAT PVT. LTD.') {
        return (
          p.rateSource === 'NAV DURGA ISPAT PVT. LTD.' ||
          (!p.rateSource && p.section === 'MEDIUM SECTION') ||
          p.rateSource?.includes('NAV DURGA')
        );
      }
      if (selectedUnit === 'NS ISPAT (INDIA) PVT. LTD. UNIT-II') {
        return (
          p.rateSource === 'NS ISPAT (INDIA) PVT. LTD. UNIT-II' ||
          (!p.rateSource && p.section === 'LIGHT SECTION') ||
          p.rateSource?.includes('NS ISPAT')
        );
      }
      return p.rateSource === selectedUnit;
    });
  }, [products, selectedUnit]);

  // Available sections dynamically discovered from existing product master (strict section field)
  const availableSections = useMemo(() => {
    return getAvailableSections(unitProducts);
  }, [unitProducts]);

  // Available types dynamically discovered from existing product master (scoped to selected section)
  const availableTypes = useMemo(() => {
    return getAvailableTypes(unitProducts, selectedSection);
  }, [unitProducts, selectedSection]);

  // Helper to synchronize selection based on Section + Type filters
  const applyPresetSelection = (sec: string, typ: string) => {
    let matching = unitProducts;
    if (sec && sec !== 'ALL' && sec.trim() !== '') {
      matching = matching.filter((p) => doesProductMatchSection(p, sec));
    }
    if (typ && typ !== 'ALL' && typ.trim() !== '') {
      matching = matching.filter((p) => doesProductMatchType(p, typ));
    }
    setSelectedProductIds(new Set(matching.map((p) => p.id)));
  };

  // Set default selectedSection if current selection is not valid for the unit and initialize selection
  React.useEffect(() => {
    if (availableSections.length > 0) {
      const exists = availableSections.some((s) => s.key === selectedSection);
      const activeSec = exists ? selectedSection : availableSections[0].key;
      if (!exists) {
        setSelectedSection(activeSec);
      }
      // Section selection includes all product types within the selected section by default
      const matching = unitProducts.filter((p) => doesProductMatchSection(p, activeSec));
      setSelectedProductIds(new Set(matching.map((p) => p.id)));
      setSelectedType('ALL');
    } else {
      setSelectedSection('');
      setSelectedProductIds(new Set());
      setSelectedType('ALL');
    }
  }, [availableSections, selectedUnit]);

  // Handle company change - resets inputs and clear messages
  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setEnteredPrice('');
    setValidationError(null);
    setSuccessMessage(null);
    setRateSheetSectionFilter('ALL');
    setSelectedType('ALL');
  };

  // When user changes Section Preset, filter strictly by section (ignoring Type if ALL)
  const handleSectionDropdownChange = (sec: string) => {
    setSelectedSection(sec);
    setValidationError(null);
    applyPresetSelection(sec, selectedType);
  };

  // When user changes Type filter, filter independently or combined with section
  const handleTypeDropdownChange = (typ: string) => {
    setSelectedType(typ);
    setValidationError(null);
    applyPresetSelection(selectedSection, typ);
  };

  // Select ALL products belonging to the currently selected section, regardless of Type
  const handleSelectAllInSection = () => {
    let targetProds = unitProducts;
    if (selectedSection && selectedSection !== 'ALL' && selectedSection.trim() !== '') {
      targetProds = unitProducts.filter((p) => doesProductMatchSection(p, selectedSection));
    }
    setSelectedProductIds(new Set(targetProds.map((p) => p.id)));
    setValidationError(null);
  };

  // Toggle individual product selection
  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setValidationError(null);
  };

  // Products to display in Live Rate Sheet table
  const displayedRateSheetProducts = useMemo(() => {
    let list = unitProducts;

    if (rateSheetSectionFilter !== 'ALL') {
      list = list.filter((p) => doesProductMatchSection(p, rateSheetSectionFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const name = (p.productName || p.name || '').toLowerCase();
        const size = (p.size || '').toLowerCase();
        const grade = (p.grade || p.gaugeType || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        return name.includes(q) || size.includes(q) || grade.includes(q) || code.includes(q);
      });
    }

    return list;
  }, [unitProducts, rateSheetSectionFilter, searchQuery]);

  // Select / Deselect all currently displayed products in the rate sheet
  const handleToggleSelectAllDisplayed = () => {
    const allDisplayedSelected =
      displayedRateSheetProducts.length > 0 &&
      displayedRateSheetProducts.every((p) => selectedProductIds.has(p.id));

    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allDisplayedSelected) {
        displayedRateSheetProducts.forEach((p) => next.delete(p.id));
      } else {
        displayedRateSheetProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
    setValidationError(null);
  };

  // Clear product selection
  const handleClearSelection = () => {
    setSelectedProductIds(new Set());
    setValidationError(null);
  };

  // Execute Price Update immediately:
  // 1. Validate only: Empty -> "Please enter a rate."
  // 2. Validate only: Non-numeric -> "Please enter a valid numeric rate."
  // 3. Selection: At least 1 product selected
  // 4. Accept ANY valid numeric rate (small, large, negative, positive, unchanged, etc.)
  // 5. Update ALL selected products in a single save
  // 6. Only modify selected products (unselected products are untouched)
  // 7. Save immediately without blocking confirmation dialog
  const handleExecutePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Basic Technical Validation: Empty check
    if (!enteredPrice || enteredPrice.trim() === '') {
      setValidationError('Please enter a rate.');
      return;
    }

    // 2. Basic Technical Validation: Valid numeric check
    const cleanPriceStr = enteredPrice.replace(/,/g, '').trim();
    const numPrice = Number(cleanPriceStr);

    if (isNaN(numPrice) || cleanPriceStr === '') {
      setValidationError('Please enter a valid numeric rate.');
      return;
    }

    // 3. Selection check: At least one product selected
    if (selectedProductIds.size === 0) {
      setValidationError('Please select at least one product.');
      return;
    }

    // Find all selected products
    const targetProducts = products.filter((p) => selectedProductIds.has(p.id));
    if (targetProducts.length === 0) {
      setValidationError('No selected products found to update.');
      return;
    }

    // 4. Immediate Save & Apply to ALL selected products
    const now = new Date();
    const timestamp = now.toISOString();
    const newHistoryRecords: RateHistoryRecord[] = [];

    const updatedAllProducts = products.map((prod) => {
      // Respect selection: do NOT modify unselected products
      if (!selectedProductIds.has(prod.id)) {
        return prod;
      }

      const diff = numPrice - prod.currentPrice;

      // Create price history record
      newHistoryRecords.push({
        id: `rh-${Date.now()}-${prod.id}`,
        date: updateDate,
        effectiveFrom: updateDate,
        rateSource: prod.rateSource || selectedUnit,
        productId: prod.id,
        productCategory: prod.category || prod.productCategory || 'Steel',
        productName: prod.productName || prod.name,
        size: prod.size || '',
        type: prod.type || prod.grade || 'Medium',
        gaugeType: prod.gaugeType || prod.grade || 'Medium',
        grade: prod.grade || prod.gaugeType || 'Medium',
        section: prod.section,
        baseRate: prod.baseRate || numPrice,
        gaugeDifference: prod.gaugeDifference || 0,
        loadingCharge: prod.loadingCharge || 365,
        insuranceCharge: prod.insuranceCharge || 30,
        otherCharges: prod.otherCharges || 0,
        previousRate: prod.currentPrice,
        finalRate: numPrice,
        priceDifference: diff,
        updatedBy: 'Admin',
        timestamp,
      });

      return {
        ...prod,
        previousPrice: prod.currentPrice,
        currentPrice: numPrice,
        finalRate: numPrice,
        priceChange: diff,
        effectiveFrom: updateDate,
        priceHistory: [
          {
            date: updateDate,
            price: numPrice,
            changeReason: `Direct rate update (${diff >= 0 ? '+' : ''}₹${diff})`,
          },
          ...(prod.priceHistory || []),
        ],
      };
    });

    // Commit to Central Source of Truth immediately
    const sectionLabel = selectedSection ? `${selectedSection}` : 'Selected Products';
    onUpdateSectionPrices(updatedAllProducts, newHistoryRecords, sectionLabel);

    // Dynamic Success Message
    setSuccessMessage({
      title: 'Rate updated successfully.',
      details: `${targetProducts.length} product(s) updated to ₹${numPrice.toLocaleString('en-IN')}.`,
    });

    // Clear entered rate
    setEnteredPrice('');
    setValidationError(null);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  // Section price history filtered for active unit
  const unitHistory = useMemo(() => {
    return rateHistory.filter(
      (rh) => !selectedUnit || selectedUnit === 'ALL' || rh.rateSource === selectedUnit || !rh.rateSource
    );
  }, [rateHistory, selectedUnit]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Daily Price Update & Rate Sheet
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Section-wise one price update & central rate sheet for Raipur steel mills.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCreateUpdate && (
            <button
              type="button"
              onClick={onOpenCreateUpdate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Broadcast Sheet Modal</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateToWhatsAppCenter('')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Center</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs sm:text-sm shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-emerald-900">{successMessage.title}</div>
              <div className="text-emerald-700 text-xs font-semibold">{successMessage.details}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          LIVE RATE SHEET
          Displays the clean product list with the latest prices.
          NO Previous Price, NO Difference, NO Price Change comparison.
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Rate Sheet Header & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Live Rate Sheet
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold">
                {displayedRateSheetProducts.length} Products
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live mill rates retrieved directly from central product master.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Section */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <select
                value={rateSheetSectionFilter}
                onChange={(e) => setRateSheetSectionFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Sections ({unitProducts.length})</option>
                {availableSections.map((sec) => (
                  <option key={sec.key} value={sec.key}>
                    {sec.label} ({sec.count})
                  </option>
                ))}
              </select>
            </div>

            {/* In-Sheet Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product, size..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rate Sheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all displayed products"
                    checked={
                      displayedRateSheetProducts.length > 0 &&
                      displayedRateSheetProducts.every((p) => selectedProductIds.has(p.id))
                    }
                    onChange={handleToggleSelectAllDisplayed}
                    title="Select / Deselect all displayed products"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-right">Current Rate (₹/MT)</th>
                <th className="py-3 px-4 text-center">Availability</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {displayedRateSheetProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No products found matching the current filter.
                  </td>
                </tr>
              ) : (
                displayedRateSheetProducts.map((p) => {
                  const isSelected = selectedProductIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.productName || p.name}`}
                          checked={isSelected}
                          onChange={() => handleToggleProduct(p.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* 1. Product Name */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {p.productName || p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {p.id} • {p.code || 'ND-STEEL'}
                        </div>
                      </td>

                      {/* 2. Size */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                          {p.size || 'Standard'}
                        </span>
                      </td>

                      {/* 3. Type (Completely separate from Section) */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                            (p.type || p.grade || p.gaugeType || '').toLowerCase().includes('sl') ||
                            (p.type || p.grade || p.gaugeType || '').toLowerCase().includes('super light')
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : (p.type || p.grade || p.gaugeType || '').toLowerCase().includes('5 kg')
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : (p.type || p.grade || p.gaugeType || '').toLowerCase().includes('8 kg')
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {p.type || p.grade || p.gaugeType || 'Medium'}
                        </span>
                      </td>

                      {/* 4. Section (Completely separate from Type) */}
                      <td className="py-3 px-4">
                        <span className="inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          {p.section || 'MEDIUM SECTION'}
                        </span>
                      </td>

                      {/* 5. Current Rate */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-extrabold text-blue-950 font-mono text-sm sm:text-base">
                          ₹{p.currentPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          /{p.unit || 'MT'}
                        </div>
                      </td>

                      {/* 5. Availability */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.inStock ? 'Available' : 'Booking Open'}
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rate Sheet Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{displayedRateSheetProducts.length}</strong> of{' '}
            <strong className="text-slate-900">{unitProducts.length}</strong> products
            {selectedUnit && selectedUnit !== 'ALL' && (
              <>
                {' '}for <strong className="text-blue-900">{selectedUnit}</strong>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            GST 18% extra • Loading free • Ex-plant Raipur
          </div>
        </div>
      </div>

      {/* PRICE HISTORY AUDIT TRAIL ACCORDION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Price History Log{selectedUnit && selectedUnit !== 'ALL' ? ` — ${selectedUnit}` : ''}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {unitHistory.length} Records
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>{showHistory ? 'Hide History' : 'View History'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showHistory ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showHistory && (
          <div className="mt-4 overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3 text-right">Previous Rate</th>
                  <th className="py-2.5 px-3 text-right">Updated Rate</th>
                  <th className="py-2.5 px-3">Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {unitHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No price updates logged yet{selectedUnit && selectedUnit !== 'ALL' ? ` for ${selectedUnit}` : ''}.
                    </td>
                  </tr>
                ) : (
                  unitHistory.slice(0, 15).map((rh) => (
                    <tr key={rh.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {rh.date}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {rh.productName}
                      </td>
                      <td className="py-2 px-3">{rh.size}</td>
                      <td className="py-2 px-3 font-semibold text-blue-900">{rh.section || rh.gaugeType || 'Medium'}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">
                        ₹{rh.previousRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-blue-950">
                        ₹{rh.finalRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{rh.updatedBy || 'Admin'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PUBLISHED DAILY SHEETS & BROADCAST HISTORY */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Published WhatsApp Rate Sheets & Broadcasts
            </h3>
            <p className="text-xs text-slate-500">
              Historical daily price broadcasts sent to steel dealers and buyers.
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
            {dailyUpdates.length} Published
          </span>
        </div>

        <div className="space-y-4">
          {dailyUpdates.map((update) => (
            <div
              key={update.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{update.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>📅 {update.date}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {update.status || 'Published'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSendTestWhatsApp(update)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                    <span>Send Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onGeneratePost(update)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Generate Post Graphic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToWhatsAppCenter(update.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Broadcast</span>
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              <div className="mt-3.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Rates Snapshot ({update.items.length} Items)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {update.items.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Grade: <strong className="text-blue-900">{item.grade}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-blue-950 font-mono">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">/{item.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {update.items.length > 6 && (
                  <div className="text-[11px] text-slate-400 text-right mt-1 font-medium">
                    + {update.items.length - 6} more items in this rate sheet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
