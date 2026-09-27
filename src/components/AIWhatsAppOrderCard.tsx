import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Package,
  Layers,
  TrendingUp,
  Copy,
  ExternalLink,
  Check,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  HelpCircle,
} from 'lucide-react';
import {
  CompanySettings,
  Customer,
  Product,
  SalesEnquiry,
  WhatsAppOrderEnquiryParsed,
} from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { buildSalesEnquiryFromWhatsAppParsed } from '../utils/whatsappOrderHelper';

interface AIWhatsAppOrderCardProps {
  parsed: WhatsAppOrderEnquiryParsed;
  company: CompanySettings;
  customers: Customer[];
  products: Product[];
  onSelectClarification?: (actionText: string) => void;
  onCreateEnquiry?: (enquiry: SalesEnquiry) => void;
  onNavigateToEnquiries?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToWhatsApp?: () => void;
}

export const AIWhatsAppOrderCard: React.FC<AIWhatsAppOrderCardProps> = ({
  parsed,
  company,
  customers,
  products,
  onSelectClarification,
  onCreateEnquiry,
  onNavigateToEnquiries,
  onNavigateToOrders,
  onNavigateToWhatsApp,
}) => {
  const [copied, setCopied] = useState(false);
  const [createdEnquiry, setCreatedEnquiry] = useState<SalesEnquiry | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const { customerMatch, productMatch, intent, quantity, unit, approvedRate, totalAmount, generatedResponse } = parsed;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(generatedResponse);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = customerMatch.customer?.whatsapp || customerMatch.customer?.mobile || customerMatch.senderPhone || '+91 97521 83053';
    WhatsAppService.openChat(phone, generatedResponse, customerMatch.customer?.name || 'Customer Lead');
  };

  const handleCreateCRMRequirement = () => {
    const enq = buildSalesEnquiryFromWhatsAppParsed({
      parsed,
      company,
    });
    setCreatedEnquiry(enq);
    if (onCreateEnquiry) {
      onCreateEnquiry(enq);
    }
    setActionFeedback(`Requirement ${enq.enquiryNumber} created in Sales/CRM!`);
  };

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-emerald-500/30 shadow-md overflow-hidden text-slate-800 my-2">
      {/* CARD HEADER */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 px-4 sm:px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-200">
                Phase 3 • AI WhatsApp Order & Enquiry Engine
              </span>
              <span className="text-[10px] bg-emerald-500/40 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                {intent === 'product_requirement' ? '📦 Purchase Requirement' : '💬 Price Enquiry'}
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              Extracted from incoming customer message using verified ERP Master Data
            </p>
          </div>
        </div>

        {/* Customer Identification Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {customerMatch.status === 'exact_match' && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>ERP Customer Verified</span>
            </span>
          )}
          {customerMatch.status === 'no_match' && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/30 text-blue-100 border border-blue-300/40 flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5 text-blue-200" />
              <span>Unregistered WhatsApp Lead</span>
            </span>
          )}
          {customerMatch.status === 'multiple_matches' && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-100 border border-amber-300/40 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
              <span>Ambiguous Match</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 text-xs">
        {/* 1. CUSTOMER IDENTIFICATION CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              1. Customer Master Identification
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Confidentiality Enforced (Private in replies)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Customer Name</div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                {customerMatch.customer?.name || 'Unregistered Contact'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Company / Firm</div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                {customerMatch.customer?.companyName || 'Prospective Buyer Lead'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">WhatsApp / Mobile</div>
              <div className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                {customerMatch.senderPhone || customerMatch.customer?.whatsapp || '+91 97521 83053'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Customer Type & ID</div>
              <div className="font-semibold text-slate-700">
                {customerMatch.customer ? (
                  <>
                    <span className="text-slate-900">{customerMatch.customer.customerType}</span>{' '}
                    <span className="text-[10px] font-mono text-slate-400">({customerMatch.customer.id})</span>
                  </>
                ) : (
                  <span className="text-blue-700 font-bold">New Lead Workflow</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRODUCT MASTER MATCHING & PRICING */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              2. ERP Product Master & Approved Rate Matching
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Single Source of Truth
            </span>
          </div>

          {/* Exact product match state */}
          {productMatch.status === 'exact_match' && productMatch.product && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Matched Product</div>
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {productMatch.product.name}
                </div>
                <div className="text-[11px] font-bold text-blue-700">
                  Size: {productMatch.product.size}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Grade & Section</div>
                <div className="font-bold text-slate-800">
                  Grade: {productMatch.product.grade || productMatch.product.gaugeType || 'Medium'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {productMatch.product.section || 'MEDIUM SECTION'} • {productMatch.product.rateSource || 'Nav Durga Ispat'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Gauge Difference</div>
                <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                  ₹{(productMatch.product.gaugeDifference || 0).toLocaleString('en-IN')}/MT
                </div>
                <div className="text-[10px] text-slate-500">
                  Base: ₹{(productMatch.product.baseRate || 49711).toLocaleString('en-IN')}/MT
                </div>
              </div>

              <div>
                <div className="text-[10px] text-emerald-800 font-semibold uppercase">Approved Final Rate</div>
                <div className="font-mono font-extrabold text-emerald-700 text-sm sm:text-base">
                  ₹{(approvedRate || 0).toLocaleString('en-IN')}
                  <span className="text-[10px] text-slate-500 font-normal"> /MT</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  Basic + Gauge Diff (Approved)
                </div>
              </div>
            </div>
          )}

          {/* Needs Clarification State (Example 3 requirement) */}
          {productMatch.status === 'needs_clarification' && (
            <div className="space-y-3 pt-1">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ambiguity Detected: Multiple matching products found for &ldquo;{productMatch.detectedSize}&rdquo;</span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  ERP rules require explicit section/type confirmation (Medium, SL, Light, 5 KG or 8 KG). Never guess or invent rates.
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Select customer&apos;s requested section/type to resolve:
                </span>
                <div className="flex flex-wrap gap-2">
                  {productMatch.clarificationOptions?.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectClarification && onSelectClarification(
                        `${opt.product.name} ${opt.product.size} ${opt.product.grade || opt.product.gaugeType} ${quantity || 20} MT chahiye`
                      )}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold text-xs transition-all shadow-2xs cursor-pointer text-left"
                    >
                      <div className="font-extrabold">{opt.product.name} {opt.product.size} • {opt.product.grade || opt.product.gaugeType}</div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Approved Rate: ₹{(opt.product.finalRate || opt.product.currentPrice || 0).toLocaleString('en-IN')}/MT ({opt.product.section})
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. ORDER REQUIREMENT SUMMARY (IF REQUIREMENT INTENT) */}
        {intent === 'product_requirement' && quantity && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2 mb-2">
              <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                3. Structured Purchase Requirement
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Ready for CRM
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Required Tonnage</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                  {quantity} {unit}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Approved Rate</span>
                <span className="font-mono font-extrabold text-emerald-800 text-sm sm:text-base">
                  ₹{(approvedRate || 0).toLocaleString('en-IN')}/MT
                </span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Estimated Value (Ex-Plant)</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                  ₹{(totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Standard Terms</span>
                <span className="text-[11px] text-slate-600 font-medium">
                  Ex-Plant Urla • GST 18% Extra
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. AI GENERATED WHATSAPP RESPONSE BUBBLE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              4. AI Generated WhatsApp Reply (Ready to Send)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Reply'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="bg-[#eef7ee] border border-emerald-200/80 rounded-2xl p-3.5 font-sans whitespace-pre-wrap text-slate-800 text-xs sm:text-sm leading-relaxed shadow-2xs">
            {generatedResponse}
          </div>
        </div>

        {/* 5. ERP ACTIONS: CREATE REQUIREMENT IN SALES/CRM */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {actionFeedback ? (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium">
              Source: <span className="font-bold text-slate-700">WhatsApp Inbound</span> • Status:{' '}
              <span className="font-bold text-emerald-700">New Requirement</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {parsed.isRequirementReadyForCRM && !createdEnquiry && (
              <button
                type="button"
                onClick={handleCreateCRMRequirement}
                className="px-4 py-2 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Requirement in Sales/CRM</span>
              </button>
            )}

            {createdEnquiry && (
              <button
                type="button"
                onClick={onNavigateToEnquiries}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>View in Enquiries ({createdEnquiry.enquiryNumber})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
