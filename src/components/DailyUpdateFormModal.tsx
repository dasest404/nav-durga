import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Sparkles,
  Check,
  Building2,
  Layers,
  ChevronDown,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Product, DailyUpdate, DailyUpdateItem, RateHistoryRecord } from '../types';
import {
  getAvailableSections,
  doesProductMatchSection,
} from '../utils/sectionPriceHelper';

interface DailyUpdateFormModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (update: DailyUpdate, openPostGenerator?: boolean) => void;
  onUpdateSectionPrices?: (
    updatedProducts: Product[],
    newHistoryRecords: RateHistoryRecord[],
    sectionName?: string
  ) => void;
}

export const DailyUpdateFormModal: React.FC<DailyUpdateFormModalProps> = ({
  products,
  isOpen,
  onClose,
  onSave,
  onUpdateSectionPrices,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('NAV DURGA ISPAT PVT. LTD.');
  const [selectedSection, setSelectedSection] = useState<string>('Medium');
  const [enteredPrice, setEnteredPrice] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [date, setDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });
  const [updateDateIso, setUpdateDateIso] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [title, setTitle] = useState("Nav Durga Today's Steel Rate Sheet");
  const [remarks, setRemarks] = useState(
    'Prices ex-plant Urla, Raipur. GST 18% extra. Loading free. Contact us for bulk booking on 30+ MT.'
  );

  // Confirmation dialog state
  const [pendingConfirm, setPendingConfirm] = useState<{
    section: string;
    price: number;
    matchingProducts: Product[];
    openPostGenerator: boolean;
  } | null>(null);

  // Filter products by selected company/unit (Company / Unit Safety)
  const unitProducts = useMemo(() => {
    return products.filter((p) => {
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

  // Dynamically extract available sections
  const availableSections = useMemo(() => {
    return getAvailableSections(unitProducts);
  }, [unitProducts]);

  // Automatically load all products belonging to selected section
  const sectionProducts = useMemo(() => {
    if (!selectedSection) return [];
    return unitProducts.filter((p) => doesProductMatchSection(p, selectedSection));
  }, [unitProducts, selectedSection]);

  // Ensure default section matches available options
  React.useEffect(() => {
    if (availableSections.length > 0) {
      const exists = availableSections.some((s) => s.key === selectedSection);
      if (!exists) {
        setSelectedSection(availableSections[0].key);
      }
    } else {
      setSelectedSection('');
    }
  }, [availableSections, selectedSection]);

  if (!isOpen) return null;

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setEnteredPrice('');
    setValidationError(null);
    if (unit === 'NAV DURGA ISPAT PVT. LTD.') {
      setTitle("Nav Durga Medium Section Today's Rates");
    } else {
      setTitle("NS Ispat Light Section Today's Rates");
    }
  };

  const handleSectionChange = (sec: string) => {
    setSelectedSection(sec);
    setValidationError(null);
    setTitle(
      `${selectedUnit.includes('NAV DURGA') ? 'Nav Durga' : 'NS Ispat'} ${sec} Steel Rates`
    );
  };

  const handleInitiateSubmit = (openGenerator: boolean) => {
    setValidationError(null);

    // 1. Validate section
    if (!selectedSection || selectedSection.trim() === '') {
      setValidationError('Please select a section.');
      return;
    }

    // 2. Validate price
    if (!enteredPrice || enteredPrice.trim() === '') {
      setValidationError('Please enter a rate.');
      return;
    }

    const cleanPriceStr = enteredPrice.replace(/,/g, '').trim();
    const numPrice = Number(cleanPriceStr);

    if (isNaN(numPrice) || cleanPriceStr === '') {
      setValidationError('Please enter a valid numeric rate.');
      return;
    }

    if (sectionProducts.length === 0) {
      setValidationError('No products found in this section.');
      return;
    }

    // Open confirmation dialog
    setPendingConfirm({
      section: selectedSection,
      price: numPrice,
      matchingProducts: sectionProducts,
      openPostGenerator: openGenerator,
    });
  };

  const handleConfirmAndExecute = () => {
    if (!pendingConfirm) return;

    const { section, price, matchingProducts, openPostGenerator } = pendingConfirm;
    const matchingIds = new Set(matchingProducts.map((p) => p.id));
    const now = new Date();
    const timestamp = now.toISOString();
    const newHistoryRecords: RateHistoryRecord[] = [];
    const updateItems: DailyUpdateItem[] = [];

    const updatedAllProducts = products.map((prod) => {
      if (!matchingIds.has(prod.id)) {
        return prod;
      }

      const diff = price - prod.currentPrice;

      newHistoryRecords.push({
        id: `rh-${Date.now()}-${prod.id}`,
        date: updateDateIso,
        effectiveFrom: updateDateIso,
        rateSource: prod.rateSource || selectedUnit,
        productId: prod.id,
        productCategory: prod.category || prod.productCategory || 'Steel',
        productName: prod.productName || prod.name,
        size: prod.size || '',
        type: prod.type || prod.grade || 'Medium',
        gaugeType: prod.gaugeType || prod.grade || 'Medium',
        grade: prod.grade || prod.gaugeType || 'Medium',
        section: prod.section,
        baseRate: prod.baseRate || price,
        gaugeDifference: prod.gaugeDifference || 0,
        loadingCharge: prod.loadingCharge || 365,
        insuranceCharge: prod.insuranceCharge || 30,
        otherCharges: prod.otherCharges || 0,
        previousRate: prod.currentPrice,
        finalRate: price,
        priceDifference: diff,
        updatedBy: 'Admin',
        timestamp,
      });

      updateItems.push({
        productId: prod.id,
        productName: prod.name,
        grade: prod.grade,
        price: price,
        previousPrice: prod.currentPrice,
        unit: prod.unit || 'MT',
        availability: prod.inStock ? 'Available' : 'Booking Open',
        changeNote:
          diff > 0
            ? `+₹${diff} / ${prod.unit || 'MT'}`
            : diff < 0
            ? `-₹${Math.abs(diff)} / ${prod.unit || 'MT'}`
            : 'Stable',
      });

      return {
        ...prod,
        previousPrice: prod.currentPrice,
        currentPrice: price,
        finalRate: price,
        priceChange: diff,
        effectiveFrom: updateDateIso,
        priceHistory: [
          {
            date: updateDateIso,
            price: price,
            changeReason: `Section update (${diff >= 0 ? '+' : ''}₹${diff})`,
          },
          ...(prod.priceHistory || []),
        ],
      };
    });

    // Commit to Central Product Catalog
    if (onUpdateSectionPrices && newHistoryRecords.length > 0) {
      onUpdateSectionPrices(updatedAllProducts, newHistoryRecords, section);
    }

    // Save Daily Broadcast Sheet
    const newUpdate: DailyUpdate = {
      id: `upd-${Date.now()}`,
      date,
      title,
      remarks,
      items: updateItems,
      createdAt: timestamp,
      createdBy: 'Virendra Patel',
      status: 'Published',
    };

    onSave(newUpdate, openPostGenerator);
    setPendingConfirm(null);
    onClose();
  };

  const cleanPrice = enteredPrice.replace(/,/g, '').trim();
  const parsedPrice = Number(cleanPrice);
  const isValidPrice = cleanPrice !== '' && !isNaN(parsedPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Daily Price Update & Rate Sheet
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Section-based price update — updates central product catalog and generates WhatsApp broadcast
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Company & Section Selectors */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Company / Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Company / Unit</span>
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              >
                <option value="NAV DURGA ISPAT PVT. LTD.">NAVDURGA ISPAT (Medium Section)</option>
                <option value="NS ISPAT (INDIA) PVT. LTD. UNIT-II">UNIT-2 — NS ISPAT (Light Section)</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Update Date</span>
              </label>
              <input
                type="date"
                value={updateDateIso}
                onChange={(e) => {
                  setUpdateDateIso(e.target.value);
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) {
                    setDate(
                      d.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    );
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              />
            </div>

            {/* Sheet Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Broadcast Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Section Price Update Box */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 text-white">
            <div className="text-xs font-extrabold text-blue-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Section Price Update</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Section */}
              <div>
                <label className="block text-xs font-bold text-blue-200 mb-1">
                  Select Section *
                </label>
                <div className="relative">
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full px-3 py-2.5 pr-8 rounded-lg border border-blue-400 bg-white text-xs font-extrabold text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Section</option>
                    {availableSections.map((sec) => (
                      <option key={sec.key} value={sec.key}>
                        {sec.label} ({sec.count} products)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Enter Price */}
              <div>
                <label className="block text-xs font-bold text-blue-200 mb-1">
                  Enter Price (₹/MT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 52000"
                    value={enteredPrice}
                    onChange={(e) => {
                      setEnteredPrice(e.target.value);
                      setValidationError(null);
                    }}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-blue-400 bg-white text-xs font-black font-mono text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {selectedSection && sectionProducts.length > 0 && (
              <div className="mt-3 text-xs text-blue-200 flex items-center justify-between">
                <span>
                  All <strong>{sectionProducts.length} products</strong> in {selectedSection} Section will be set to{' '}
                  <strong className="text-emerald-300">
                    {isValidPrice ? `₹${parsedPrice.toLocaleString('en-IN')}` : 'entered price'}
                  </strong>.
                </span>
                <span className="text-[11px] text-blue-300 font-medium">
                  {selectedUnit}
                </span>
              </div>
            )}
          </div>

          {/* Section Products Live Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                Products in {selectedSection || 'Section'} ({sectionProducts.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Live Rate Sheet Preview
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Section / Type</th>
                  <th className="py-2.5 px-3 text-right">Current Rate</th>
                  <th className="py-2.5 px-3 text-right">New Rate (₹/MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sectionProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {p.productName || p.name}
                    </td>
                    <td className="py-2 px-3">{p.size}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">
                        {p.grade || p.gaugeType || selectedSection}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">
                      ₹{p.currentPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-extrabold text-blue-950">
                      {isValidPrice ? (
                        <span className="text-emerald-700">
                          ₹{parsedPrice.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹{p.currentPrice.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Terms & Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInitiateSubmit(false)}
              className="px-4 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Section Price</span>
            </button>

            <button
              type="button"
              onClick={() => handleInitiateSubmit(true)}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Update & Open Post Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Update {pendingConfirm.section} price?
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-2">
                All <strong className="text-blue-900 font-bold">{pendingConfirm.matchingProducts.length} products</strong> in{' '}
                <strong className="text-slate-900">{pendingConfirm.section} Section</strong> will be updated to{' '}
                <strong className="text-emerald-700 font-bold">₹{pendingConfirm.price.toLocaleString('en-IN')}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndExecute}
                className="px-4 py-2 text-xs font-extrabold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
