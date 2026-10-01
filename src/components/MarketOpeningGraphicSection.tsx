import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Edit3,
  Download,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Phone,
  ShieldCheck,
  Eye,
  Sliders,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  TrendingUp,
} from 'lucide-react';
import { Customer, CompanySettings, MarketOpeningRates } from '../types';
import { StorageService } from '../services/storageService';
import { MarketOpeningRenderer } from '../services/marketOpeningRenderer';
import { WhatsAppService } from '../services/whatsappService';

interface MarketOpeningGraphicSectionProps {
  customers: Customer[];
  company: CompanySettings;
  userRole?: 'Admin' | 'Sales' | 'Staff';
  onLogWhatsAppActivity?: (action: string, customerName: string, phone: string, details?: string) => void;
}

export const MarketOpeningGraphicSection: React.FC<MarketOpeningGraphicSectionProps> = ({
  customers,
  company,
  userRole = 'Admin',
  onLogWhatsAppActivity,
}) => {
  // Current active role (Allows toggling between Admin and Non-Admin for verification)
  const [activeRole, setActiveRole] = useState<'Admin' | 'Sales' | 'Staff'>(userRole);

  // Load persistent Market Opening Rates from StorageService
  const [rates, setRates] = useState<MarketOpeningRates>(() => StorageService.getMarketOpeningRates());

  // Edit Rates Modal State (Admin Only)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMediumName, setEditMediumName] = useState(rates.mediumSectionName);
  const [editMediumRate, setEditMediumRate] = useState<number>(rates.mediumSectionRate);
  const [editLightName, setEditLightName] = useState(rates.lightSectionName);
  const [editLightRate, setEditLightRate] = useState<number>(rates.lightSectionRate);

  // WhatsApp Recipient Target
  const testCustomer = WhatsAppService.getTestCustomer(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(testCustomer?.id || customers[0]?.id || '');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);

  // Feedback Notifications
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Canvas Reference & Template Load State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);

  // Preload base template image on component mount
  useEffect(() => {
    MarketOpeningRenderer.preloadImage(() => {
      setIsTemplateLoaded(true);
      if (canvasRef.current) {
        MarketOpeningRenderer.renderToCanvas(canvasRef.current, rates);
      }
    });
  }, [rates]);

  // Render graphic to canvas whenever rates change
  const renderGraphic = useCallback(() => {
    if (canvasRef.current) {
      MarketOpeningRenderer.renderToCanvas(canvasRef.current, rates, () => {
        setIsTemplateLoaded(true);
      });
    }
  }, [rates]);

  useEffect(() => {
    renderGraphic();
  }, [renderGraphic]);

  // Open Edit Modal with current values
  const handleOpenEditModal = () => {
    if (activeRole !== 'Admin') return; // Strict security check
    setEditMediumName(rates.mediumSectionName);
    setEditMediumRate(rates.mediumSectionRate);
    setEditLightName(rates.lightSectionName);
    setEditLightRate(rates.lightSectionRate);
    setIsEditModalOpen(true);
  };

  // Save rates (Persists to storage architecture and immediately updates graphic)
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Admin') return;

    const updatedRates: MarketOpeningRates = {
      mediumSectionName: editMediumName.trim() || 'MEDIUM SECTION',
      mediumSectionRate: Number(editMediumRate) || 49711,
      lightSectionName: editLightName.trim() || 'LIGHT SECTION',
      lightSectionRate: Number(editLightRate) || 42211,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin',
    };

    // 1. Persist to storage
    StorageService.saveMarketOpeningRates(updatedRates);

    // 2. Update component state (triggers instant canvas re-render)
    setRates(updatedRates);
    setIsEditModalOpen(false);

    setStatusMessage('Market Opening Rates saved successfully! Graphic updated immediately.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Reset to original reference image rates
  const handleResetToDefault = () => {
    setEditMediumName('MEDIUM SECTION');
    setEditMediumRate(49711);
    setEditLightName('LIGHT SECTION');
    setEditLightRate(42211);
  };

  // Download Graphic as PNG (1536 × 1024)
  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `NavDurga_Market_Opening_Graphic_${dateStr}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);

      const targetCust = customers.find((c) => c.id === selectedCustomerId);
      if (onLogWhatsAppActivity) {
        onLogWhatsAppActivity(
          'Image Downloaded',
          targetCust?.name || 'Admin',
          targetCust?.whatsapp || targetCust?.mobile || '',
          `Downloaded Market Opening Graphic (Medium: ₹${rates.mediumSectionRate}, Light: ₹${rates.lightSectionRate})`
        );
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Build WhatsApp Share Caption
  const buildShareCaption = () => {
    return (
      `*📢 NAV DURGA — MARKET OPENINGS*\n` +
      `*✦ BEST RATES (EX-WORKS) ✦*\n\n` +
      `▫️ *${rates.mediumSectionName}:* *₹${rates.mediumSectionRate.toLocaleString('en-IN')}/MT*\n` +
      `▫️ *${rates.lightSectionName}:* *₹${rates.lightSectionRate.toLocaleString('en-IN')}/MT*\n\n` +
      `📄 *PAYMENT TERMS:*\n` +
      `• Advance Payment Basis\n` +
      `• *₹ 300/MT extra* — for next-day payment\n\n` +
      `⚠️ *IMPORTANT NOTICE:*\n` +
      `• Rates are indicative & subject to market fluctuations.\n` +
      `• Please reconfirm before booking.\n\n` +
      `🏢 *NAV DURGA GROUP*\n` +
      `📲 *Contact for Orders:*\n` +
      `WhatsApp: 9009544333 | 7000923464 | 9713144333\n` +
      `_Wishing you a very Happy & Productive Day!_`
    );
  };

  // Copy Formatted WhatsApp Caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildShareCaption());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  // Share to WhatsApp
  const handleShareToWhatsApp = () => {
    // 1. Download image automatically so user has file ready to attach
    handleDownload();

    // 2. Resolve destination phone number
    const targetCust = customers.find((c) => c.id === selectedCustomerId);
    const destinationPhone = useCustomPhone
      ? customPhone
      : targetCust?.whatsapp || targetCust?.mobile || '9009544333';

    // 3. Open WhatsApp Web or app with pre-filled rates caption
    WhatsAppService.openChat(
      destinationPhone,
      buildShareCaption(),
      targetCust?.name || 'Customer'
    );

    setStatusMessage(
      'WhatsApp opened! High-resolution Market Opening Graphic downloaded — attach it in the chat.'
    );
    setTimeout(() => setStatusMessage(null), 6000);

    if (onLogWhatsAppActivity) {
      onLogWhatsAppActivity(
        'WhatsApp Opened',
        targetCust?.name || 'Customer',
        destinationPhone,
        `Shared Market Opening Graphic (Medium: ₹${rates.mediumSectionRate}, Light: ₹${rates.lightSectionRate})`
      );
    }
  };

  const isAdmin = activeRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Top Banner: Market Opening Graphic Title & Admin Role Controller */}
      <div className="bg-gradient-to-r from-red-900 via-amber-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-amber-600/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-400 text-slate-950 shadow-2xs">
                📢 Official Base Template
              </span>
              <span className="text-xs text-amber-200 font-medium">
                Nav Durga Market Opening Graphic • Fixed Layout
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Market Opening Graphic</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Displays the exact Nav Durga promotional poster with Goddess Durga, 3D Market Openings banner, and contact numbers.
              Only the <strong>Medium Section</strong> and <strong>Light Section</strong> rates are editable by Administrators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {/* Role Verification Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-medium px-2">Role:</span>
              <button
                type="button"
                onClick={() => setActiveRole('Admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('Sales')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  !isAdmin
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sales / Staff (View Only)
              </button>
            </div>

            {/* Admin-Only "Edit Rates" Action Button */}
            {isAdmin ? (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md transition-all cursor-pointer ring-2 ring-amber-300/40"
              >
                <Edit3 className="w-4 h-4 text-slate-950" />
                <span>Edit Rates</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Rates View-Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Live Graphic Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: RATE SUMMARY, SHARING & WHATSAPP CAPTION (5 cols on lg)      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Rates Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Current Market Opening Rates</span>
              </span>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            {/* Rates Display Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    {rates.mediumSectionName}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{rates.mediumSectionRate.toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-slate-500"> / MT</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ex-Works
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    {rates.lightSectionName}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{rates.lightSectionRate.toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-slate-500"> / MT</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ex-Works
                </span>
              </div>
            </div>

            {/* Notice pill */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isAdmin
                  ? 'As an Administrator, you can update both rates and section names. The poster and storage persist immediately upon save.'
                  : 'You are viewing in Sales/Staff mode. Non-admin users can view, download and share the graphic, but cannot edit rates.'}
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Share Recipient Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Target WhatsApp Recipient</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustomPhone(false)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !useCustomPhone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  Pick from Customers ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomPhone(true)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    useCustomPhone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  Custom Mobile #
                </button>
              </div>

              {!useCustomPhone ? (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name}) • {c.whatsapp || c.mobile}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. +91 9009544333"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800"
                />
              )}
            </div>

            {/* Share / Download Toolbar */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{downloadSuccess ? 'Downloaded! ✓' : 'Download PNG'}</span>
              </button>
            </div>

            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Formatted Promotional Caption Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">WhatsApp Broadcast Text:</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-snug border border-slate-100">
              {buildShareCaption()}
            </pre>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: HIGH-RES EXACT TEMPLATE CANVAS PREVIEW (7 cols on lg)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Market Opening Graphic Live Preview</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                    1264 × 848 px • Base Template
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Fixed base template design with dynamically updated rates
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit Rates</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Canvas Preview Container */}
            <div className="w-full flex items-center justify-center bg-slate-900/5 rounded-2xl border border-slate-200/80 p-2 sm:p-4 overflow-hidden relative">
              <div className="w-full max-w-[760px] aspect-[1264/848] shadow-lg rounded-xl overflow-hidden bg-white border border-slate-300 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>

            {/* Template Information Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Base Template</span>
                <span className="font-bold text-slate-800 truncate block">
                  Nav Durga Promotional
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Medium Section</span>
                <span className="font-bold text-emerald-700 truncate block">
                  ₹{rates.mediumSectionRate} / MT
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Light Section</span>
                <span className="font-bold text-emerald-700 truncate block">
                  ₹{rates.lightSectionRate} / MT
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Hotlines</span>
                <span className="font-bold text-slate-800 truncate block">
                  9009544333 (3 Lines)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN-ONLY "EDIT RATES" MODAL                                             */}
      {/* ========================================================================= */}
      {isAdmin && isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Market Opening Rates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin Only • Updates the boxed rates inside the graphic
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Admin Mode
              </span>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4 pt-4">
              {/* Row 1: Medium Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Row 1: Medium Section
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 font-mono">
                    ₹{Number(editMediumRate || 0).toLocaleString('en-IN')} / MT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editMediumName}
                      onChange={(e) => setEditMediumName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                      placeholder="MEDIUM SECTION"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Rate (₹ / MT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={editMediumRate}
                        onChange={(e) => setEditMediumRate(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-black text-emerald-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                        placeholder="49711"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">Quick adjust:</span>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r - 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                  >
                    - ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r - 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                  >
                    - ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r + 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 cursor-pointer transition-colors"
                  >
                    + ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r + 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 cursor-pointer transition-colors"
                  >
                    + ₹1,000
                  </button>
                </div>
              </div>

              {/* Row 2: Light Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Row 2: Light Section
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 font-mono">
                    ₹{Number(editLightRate || 0).toLocaleString('en-IN')} / MT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editLightName}
                      onChange={(e) => setEditLightName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                      placeholder="LIGHT SECTION"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Rate (₹ / MT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={editLightRate}
                        onChange={(e) => setEditLightRate(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-black text-emerald-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                        placeholder="42211"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">Quick adjust:</span>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r - 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                  >
                    - ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r - 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                  >
                    - ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r + 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 cursor-pointer transition-colors"
                  >
                    + ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r + 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 cursor-pointer transition-colors"
                  >
                    + ₹1,000
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset to Original (₹49711 / ₹42211)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
