import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Eye,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Quotation, QuotationItem, Customer, Product, CompanySettings, QuotationTerms } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface QuotationsViewProps {
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
  onAddQuotation: (quotation: Quotation) => void;
  onUpdateStatus: (id: string, status: Quotation['status']) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  customers,
  products,
  company,
  onAddQuotation,
  onUpdateStatus,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [validityDays, setValidityDays] = useState('3 Days (Subject to raw billet price changes)');
  const [paymentTerms, setPaymentTerms] = useState('100% against proforma invoice before loading');
  const [deliveryTerms, setDeliveryTerms] = useState('Ex-plant Urla, Raipur. Freight extra at actuals.');

  const initialProd = products[0] || {
    id: 'p1',
    name: 'TMT Steel Rebar',
    grade: 'Fe 500D',
    unit: 'MT',
    currentPrice: 58500,
  };

  const [items, setItems] = useState<QuotationItem[]>([
    {
      productId: initialProd.id,
      productName: initialProd.name,
      grade: initialProd.grade,
      quantity: 25,
      unit: initialProd.unit,
      rate: initialProd.currentPrice,
      amount: 25 * initialProd.currentPrice,
      unitPrice: initialProd.currentPrice,
      total: 25 * initialProd.currentPrice,
    },
  ]);

  const handleAddItem = () => {
    const prod = products[0] || initialProd;
    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        grade: prod.grade,
        quantity: 10,
        unit: prod.unit,
        rate: prod.currentPrice,
        amount: 10 * prod.currentPrice,
        unitPrice: prod.currentPrice,
        total: 10 * prod.currentPrice,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate' || field === 'unitPrice') {
      const price = Number(field === 'unitPrice' || field === 'rate' ? value : current.rate || current.unitPrice || 0);
      const qty = Number(field === 'quantity' ? value : current.quantity || 0);
      const totalAmt = qty * price;
      current.rate = price;
      current.unitPrice = price;
      current.amount = totalAmt;
      current.total = totalAmt;
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const subtotal = items.reduce((sum, it) => sum + (it.amount || it.total || 0), 0);
    const taxRate = 18; // 18% GST for steel
    const taxAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + taxAmount;

    const newQuot: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `NDI-QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.companyName,
      customerContact: cust.name,
      customerMobile: cust.mobile,
      customerGstin: cust.gstin,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
      total: grandTotal,
      terms: {
        delivery: deliveryTerms,
        payment: paymentTerms,
        validity: validityDays,
      },
      status: 'Sent',
    };

    onAddQuotation(newQuot);
    setIsCreateOpen(false);
    setPreviewQuotation(newQuot);
  };

  const getTermsText = (terms: QuotationTerms | string[] | undefined) => {
    if (!terms) return { payment: 'Standard', delivery: 'Ex-plant', validity: '3 Days' };
    if (Array.isArray(terms)) {
      return {
        payment: terms[0] || 'Standard',
        delivery: terms[1] || 'Ex-plant',
        validity: terms[2] || '3 Days',
      };
    }
    return {
      payment: terms.payment || 'Standard',
      delivery: terms.delivery || 'Ex-plant',
      validity: terms.validity || '3 Days',
    };
  };

  const handleShareOnWhatsApp = (q: Quotation) => {
    const cust = customers.find((c) => c.id === q.customerId);
    const mobile = cust?.whatsapp || cust?.mobile || q.customerMobile || '';
    const termsObj = getTermsText(q.terms);
    const totalVal = q.grandTotal ?? q.total ?? q.subtotal;
    const taxVal = q.taxAmount ?? q.gstAmount ?? Math.round(q.subtotal * 0.18);

    let text = `*OFFICIAL QUOTATION — ${company.companyName.toUpperCase()}*\n`;
    text += `Quotation No: *${q.quotationNumber}*\n`;
    text += `Date: ${q.date}\n`;
    text += `To: *${q.customerName}* (GSTIN: ${q.customerGstin || 'N/A'})\n\n`;
    text += `*ITEMS & SPECIFICATIONS:*\n`;
    q.items.forEach((it, idx) => {
      const rate = it.rate || it.unitPrice || 0;
      const amt = it.amount || it.total || 0;
      text += `${idx + 1}. *${it.productName} (${it.grade})*\n   Qty: ${it.quantity} ${it.unit} @ ₹${rate.toLocaleString('en-IN')}/${it.unit} = ₹${amt.toLocaleString('en-IN')}\n`;
    });
    text += `\nSubtotal: ₹${q.subtotal.toLocaleString('en-IN')}\n`;
    text += `GST (18%): ₹${taxVal.toLocaleString('en-IN')}\n`;
    text += `*GRAND TOTAL: ₹${totalVal.toLocaleString('en-IN')}*\n\n`;
    text += `▫️ *Terms:* ${termsObj.payment}\n`;
    text += `▫️ *Delivery:* ${termsObj.delivery}\n`;
    text += `▫️ *Validity:* ${termsObj.validity}\n\n`;
    text += `_Thank you for your business enquiry._\n${company.phone} | ${company.address}`;

    const url = WhatsAppService.buildWhatsAppWebUrl(mobile, text);
    window.open(url, '_blank');
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Commercial Quotations
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {quotations.length} Issued
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Generate formal steel proposals with GST calculation and instant WhatsApp sharing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotation #, customer company..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Accepted">Accepted</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3.5 px-4">Quotation #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4 text-right">Taxable Subtotal</th>
                <th className="py-3.5 px-4 text-right">Grand Total (Incl. GST)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((q) => {
                  const grandTotalVal = q.grandTotal ?? q.total ?? q.subtotal;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {q.quotationNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{q.date}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onSelectCustomer(q.customerId)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {q.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          GST: {q.customerGstin || 'Unregistered'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-700">
                          {q.items.map((it) => `${it.grade} (${it.quantity} ${it.unit})`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700">
                        ₹{q.subtotal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-blue-950 text-sm">
                        ₹{grandTotalVal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={q.status}
                          onChange={(e) => onUpdateStatus(q.id, e.target.value as Quotation['status'])}
                          className={`text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer ${
                            q.status === 'Accepted' || q.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'Sent'
                              ? 'bg-blue-100 text-blue-800'
                              : q.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Approved">Approved</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewQuotation(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="View / Print Quotation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareOnWhatsApp(q)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Send Quotation via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-sm">
                    No quotations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Create Commercial Quotation</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} (GSTIN: {c.gstin}) — {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quoted Products & Quantities
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Grade</th>
                        <th className="py-2.5 px-3">Qty (MT)</th>
                        <th className="py-2.5 px-3">Rate (₹/MT)</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => {
                        const price = it.rate || it.unitPrice || 0;
                        const amt = it.amount || it.total || 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={it.productName}
                                onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                                className="w-full py-1 px-2 text-xs rounded border border-slate-200 bg-white"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={it.grade}
                                onChange={(e) => handleItemChange(idx, 'grade', e.target.value)}
                                className="w-24 py-1 px-2 text-xs rounded border border-slate-200 bg-white font-medium"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={it.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                className="w-20 py-1 px-2 text-xs rounded border border-slate-200 bg-white font-bold"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={price}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                className="w-24 py-1 px-2 text-xs rounded border border-slate-200 bg-white font-mono font-bold text-blue-900"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{amt.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validity</label>
                  <input
                    type="text"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Save & Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT / VIEW QUOTATION MODAL */}
      {previewQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Top Toolbar (No-Print) */}
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">
                  Quotation Preview — {previewQuotation.quotationNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareOnWhatsApp(previewQuotation)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewQuotation(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Industrial Invoice / Quotation Sheet */}
            <div className="p-8 space-y-6 text-slate-800 bg-white">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5">
                <div>
                  <h1 className="text-2xl font-black text-blue-900 tracking-tight">
                    {company.companyName}
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                    {company.tagline}
                  </p>
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                    <div>{company.address}, {company.city} - {company.state}</div>
                    <div>Phone: {company.phone} • WhatsApp: {company.whatsapp}</div>
                    <div>GSTIN: <strong className="font-mono text-slate-900">{company.gstin}</strong></div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-800 font-black text-sm tracking-wider uppercase rounded-lg border border-blue-200">
                    Commercial Quotation
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <div>Quotation No: <strong className="font-mono text-slate-900">{previewQuotation.quotationNumber}</strong></div>
                    <div>Date: <strong className="text-slate-900">{previewQuotation.date}</strong></div>
                    <div>Validity: <strong className="text-slate-900">{getTermsText(previewQuotation.terms).validity}</strong></div>
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Customer / Consignee:
                </span>
                <div className="text-sm font-bold text-slate-900">{previewQuotation.customerName}</div>
                <div className="text-slate-600 mt-1">
                  Attn: {previewQuotation.customerContact || previewQuotation.customerName} (
                  {previewQuotation.customerMobile || previewQuotation.customerPhone || 'N/A'})
                </div>
                <div className="text-slate-600">
                  GSTIN: <strong className="font-mono text-slate-900">{previewQuotation.customerGstin || 'Unregistered'}</strong>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Description of Goods</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewQuotation.items.map((it, idx) => {
                    const rate = it.rate || it.unitPrice || 0;
                    const amt = it.amount || it.total || 0;

                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{it.productName}</td>
                        <td className="py-2 px-3 text-blue-900 font-bold">{it.grade}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">₹{rate.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">₹{amt.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Taxable Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{previewQuotation.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">IGST / CGST+SGST (18%):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{(previewQuotation.taxAmount ?? previewQuotation.gstAmount ?? Math.round(previewQuotation.subtotal * 0.18)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm font-extrabold text-blue-950 border-t-2 border-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono">
                      ₹{(previewQuotation.grandTotal ?? previewQuotation.total ?? previewQuotation.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commercial Terms & Conditions */}
              {(() => {
                const terms = getTermsText(previewQuotation.terms);
                return (
                  <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                      Terms & Conditions:
                    </div>
                    <div>1. <strong>Payment:</strong> {terms.payment}</div>
                    <div>2. <strong>Delivery:</strong> {terms.delivery}</div>
                    <div>3. <strong>Validity:</strong> {terms.validity}</div>
                    <div>4. Weight recorded at Nav Durga certified electronic weighbridge will be final and binding.</div>
                  </div>
                );
              })()}

              {/* Signatures */}
              <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs text-slate-500">
                <div>Customer Acceptance Signature</div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">For Nav Durga Ispat</div>
                  <div className="text-[11px] mt-8 font-semibold">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
