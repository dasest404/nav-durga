import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit2,
  Tag,
  Calculator,
  Layers,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Product, RateChargesConfig } from '../types';
import { getGaugeBadgeStyles, normalizeGrade } from '../utils/rateCalculator';
import { RateBreakdownModal } from './RateBreakdownModal';

interface ProductsViewProps {
  products: Product[];
  rateCharges?: RateChargesConfig;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onToggleStatus: (productId: string) => void;
  onQuickUpdatePrice: (productId: string, newPrice: number, reason: string) => void;
  onOpenDailyRates?: () => void;
  onOpenGaugeMaster?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  rateCharges,
  onAddProduct,
  onEditProduct,
  onViewProduct,
  onToggleStatus,
  onOpenDailyRates,
  onOpenGaugeMaster,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [breakdownProduct, setBreakdownProduct] = useState<Product | null>(null);

  // Extract unique categories and sources
  const categories = [
    'All',
    'MS Channel',
    'Beam / Joist',
    'MS Angle',
    'TMT Bars',
    'Structural Steel',
    'Wire & Billets',
  ];

  const sources = [
    'All',
    'NAV DURGA ISPAT PVT. LTD.',
    'NS ISPAT (INDIA) PVT. LTD. UNIT-II',
  ];

  const grades = ['All', 'Medium', 'SL', '5 KG', '8 KG'];

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const size = p.size || '';
    const grade = normalizeGrade(p.grade || p.gaugeType);
    const source = p.rateSource || 'NAV DURGA ISPAT PVT. LTD.';
    const cat = p.productCategory || p.category || '';

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
    const matchesSource = selectedSource === 'All' || source === selectedSource;
    const matchesGrade = selectedGrade === 'All' || grade === selectedGrade;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSource && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Products & Rate Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {products.length} Specifications
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Nav Durga Ispat & NS Ispat Unit-II standard profiles, gauge differentials, and calculated final rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGaugeMaster && (
            <button
              type="button"
              onClick={onOpenGaugeMaster}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Gauge Master</span>
            </button>
          )}

          {onOpenDailyRates && (
            <button
              type="button"
              onClick={onOpenDailyRates}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Rate Update</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specification</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search size (70×35, 125×65), gauge (SL, 5KG), mill..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Rate Source Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  Mill: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-blue-200 bg-blue-50/40 text-blue-900 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="All">Grade: All</option>
              <option value="Medium">Grade: Medium</option>
              <option value="SL">Grade: SL</option>
              <option value="5 KG">Grade: 5 KG</option>
              <option value="8 KG">Grade: 8 KG</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rate Source</th>
                <th className="py-3 px-4">Category & Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Gauge Diff</th>
                <th className="py-3 px-4 text-right">Base Rate</th>
                <th className="py-3 px-4 text-right">Final Rate (₹/MT)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const gradeNorm = normalizeGrade(product.grade || product.gaugeType);
                  const badge = getGaugeBadgeStyles(gradeNorm);
                  const final = product.finalRate || product.currentPrice;
                  const base = product.baseRate || 40211;
                  const diff = product.gaugeDifference || 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onViewProduct(product)}
                    >
                      {/* Rate Source */}
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span
                            className="truncate block max-w-[150px]"
                            title={product.rateSource || 'NAV DURGA ISPAT PVT. LTD.'}
                          >
                            {product.rateSource || 'NAV DURGA ISPAT PVT. LTD.'}
                          </span>
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {product.productName || product.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {product.productCategory || product.category} • {product.code}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 font-extrabold text-blue-900">
                        {product.size || ''}
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {gradeNorm}
                        </span>
                      </td>

                      {/* Gauge Diff */}
                      <td className="py-3 px-4 text-right font-bold text-blue-800">
                        +₹{diff.toLocaleString('en-IN')}
                      </td>

                      {/* Base Rate */}
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        ₹{base.toLocaleString('en-IN')}
                      </td>

                      {/* Final Rate */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-extrabold text-blue-700">
                          ₹{final.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          /{product.unit}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            product.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setBreakdownProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Formula Calculation Breakdown"
                          >
                            <Calculator className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onViewProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details & Price History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleStatus(product.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.status === 'Active'
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              product.status === 'Active'
                                ? 'Deactivate Product'
                                : 'Activate Product'
                            }
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 text-sm">
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Modal */}
      {rateCharges && (
        <RateBreakdownModal
          isOpen={!!breakdownProduct}
          onClose={() => setBreakdownProduct(null)}
          product={breakdownProduct}
          rateCharges={rateCharges}
        />
      )}
    </div>
  );
};
