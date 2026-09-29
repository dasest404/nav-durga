import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react';
import { SalesEnquiry, Customer, Product } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface EnquiriesViewProps {
  enquiries: SalesEnquiry[];
  customers: Customer[];
  products: Product[];
  onAddEnquiry: (enquiryData: Partial<SalesEnquiry>) => void;
  onUpdateStatus: (enquiryId: string, newStatus: SalesEnquiry['status']) => void;
  onConvertToQuotation: (enquiry: SalesEnquiry) => void;
  onConvertToOrder: (enquiry: SalesEnquiry) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  enquiries,
  customers,
  products,
  onAddEnquiry,
  onUpdateStatus,
  onConvertToQuotation,
  onConvertToOrder,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name || 'TMT Steel Rebar');
  const [grade, setGrade] = useState(products[0]?.grade || 'Fe 500D');
  const [quantity, setQuantity] = useState<number>(20);
  const [unit, setUnit] = useState('MT');
  const [quotedPrice, setQuotedPrice] = useState<number>(58500);
  const [source, setSource] = useState<SalesEnquiry['source']>('WhatsApp');
  const [notes, setNotes] = useState('Immediate requirement for ongoing slab pouring.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-19');

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.enquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || e.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    onAddEnquiry({
      enquiryNumber: `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.companyName,
      product: selectedProduct,
      grade,
      quantity,
      unit,
      quotedPrice,
      source,
      status: 'New',
      notes,
      followUpDate,
      date: new Date().toISOString().split('T')[0],
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Enquiries & Lead Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {enquiries.length} Inquiries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Capture incoming purchase inquiries from WhatsApp broadcasts, phone, or direct visits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Enquiry</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by enquiry #, customer name, grade..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Quoted">Quoted</option>
              <option value="Won">Won (Converted)</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Lead Sources</option>
              <option value="WhatsApp">WhatsApp Inbound</option>
              <option value="Phone">Phone</option>
              <option value="Direct">Direct / Walk-in</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3.5 px-4">Enquiry ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Requirement</th>
                <th className="py-3.5 px-4">Quoted Rate</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Convert / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq) => {
                  const cust = customers.find((c) => c.id === enq.customerId);
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {enq.enquiryNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{enq.date}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onSelectCustomer(enq.customerId)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {enq.customerName}
                        </div>
                        {cust && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {cust.mobile}
                          </div>
                        )}
                      </td>

                      {/* Requirement */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {enq.product} — <span className="text-blue-900">{enq.grade}</span>
                        </div>
                        <div className="text-xs font-extrabold text-slate-700">
                          Qty: {enq.quantity} {enq.unit}
                        </div>
                        {enq.whatsappMessage && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1 line-clamp-1">
                            &ldquo;{enq.whatsappMessage}&rdquo;
                          </div>
                        )}
                      </td>

                      {/* Quoted Rate */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{enq.quotedPrice ? enq.quotedPrice.toLocaleString('en-IN') : 'Pending'}
                        {enq.quotedPrice && (
                          <span className="text-[11px] font-normal text-slate-500"> /{enq.unit}</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit ${
                            enq.source === 'WhatsApp'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enq.source === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                          {enq.source}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={enq.status}
                          onChange={(e) =>
                            onUpdateStatus(enq.id, e.target.value as SalesEnquiry['status'])
                          }
                          className={`text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer ${
                            enq.status === 'Won'
                              ? 'bg-emerald-100 text-emerald-800'
                              : enq.status === 'New'
                              ? 'bg-blue-100 text-blue-800'
                              : enq.status === 'Quoted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Convert Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onConvertToQuotation(enq)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="Convert to Quotation"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Quotation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onConvertToOrder(enq)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Convert Directly to Order"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Order</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-sm">
                    No enquiries found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Enquiry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl lg:max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-base font-bold text-slate-900">Log New Sales Enquiry</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name} — {c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const p = products.find((prod) => prod.name === e.target.value);
                      if (p) {
                        setGrade(p.grade);
                        setQuotedPrice(p.currentPrice);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Spec</label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="Kg">Kg</option>
                    <option value="Piece">Piece</option>
                    <option value="Bundle">Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quoted Rate (₹/{unit})</label>
                  <input
                    type="number"
                    required
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold text-blue-900 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as SalesEnquiry['source'])}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="WhatsApp">WhatsApp Inbound</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Direct">Direct Visit</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
