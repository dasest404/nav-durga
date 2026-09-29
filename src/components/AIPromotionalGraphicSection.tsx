import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Building2,
  Layers,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Square,
  Phone,
} from 'lucide-react';
import {
  Customer,
  CompanySettings,
  AIGraphicRecipe,
  AIGeneratedGraphicHistoryItem,
} from '../types';
import { AIGraphicService } from '../services/aiGraphicService';
import { AIGraphicRenderer } from '../services/aiGraphicRenderer';
import { WhatsAppService } from '../services/whatsappService';

interface AIPromotionalGraphicSectionProps {
  customers: Customer[];
  company: CompanySettings;
  onLogWhatsAppActivity?: (action: string, customerName: string, phone: string, details?: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    label: '💥 Festive Mega Offer',
    text: 'Nav Durga Special Festive Offer: MS Channel 125x65 and MS Angle 50x50 at ₹48,500/MT only. Ex-Plant Urla, Raipur. Immediate loading for orders above 20 MT. Limited stock, book today on WhatsApp!',
  },
  {
    label: '⚡ Price Drop Alert',
    text: 'Raipur Steel Price Drop Alert: Heavy MS Channels and Beams reduced by ₹500/MT today! Prime IS 2062 commercial grade. Available for instant trailer dispatch from Urla Mill. Call +91 97521 83053.',
  },
  {
    label: '🏗️ Structural Steel Booking',
    text: 'Nav Durga Rolling Mill Weekend Booking: MS Angles (50x50 to 130x130) and Channels (75x40 to 200x75) ready for dispatch. High-strength prime steel ex-plant Urla, Raipur. Test certificates provided.',
  },
  {
    label: '🚚 Immediate Loading Deal',
    text: 'Urgent Dispatch Notice: Fe 500D TMT Rebar and Prime MS Billets ready for immediate mill loading at Urla. Flat discount for spot payments. Call or message us for bulk quotes.',
  },
];

export const AIPromotionalGraphicSection: React.FC<AIPromotionalGraphicSectionProps> = ({
  customers,
  company,
  onLogWhatsAppActivity,
}) => {
  // Input Text
  const [promptText, setPromptText] = useState<string>(
    'Nav Durga Special Offer: MS Channel 125x65 and MS Angle 50x50 at ₹48,500/MT only. Ex-Plant Urla, Raipur. Immediate loading for orders above 20 MT. Book now on WhatsApp +91 97521 83053!'
  );

  // Aspect Ratio: 1:1 Square (WhatsApp status/post) or 4:5 Portrait (mobile chat)
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5'>('1:1');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentRecipe, setCurrentRecipe] = useState<AIGraphicRecipe | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [historyItems, setHistoryItems] = useState<AIGeneratedGraphicHistoryItem[]>([]);

  // Customer Target for WhatsApp share
  const testCustomer = WhatsAppService.getTestCustomer(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(testCustomer?.id || customers[0]?.id || '');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);

  // Feedback notifications
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate or Regenerate Graphic
  const handleGenerate = useCallback(
    async (seedOverride?: number) => {
      if (!promptText.trim()) return;

      setIsGenerating(true);
      setStatusFeedback(null);

      try {
        const seed = seedOverride !== undefined ? seedOverride : Date.now() + Math.floor(Math.random() * 10000);
        const recipe = await AIGraphicService.generateGraphic(promptText, seed, aspectRatio);

        setCurrentRecipe(recipe);
        setGenerationCount((c) => c + 1);

        // Render to canvas
        setTimeout(() => {
          if (canvasRef.current) {
            AIGraphicRenderer.renderToCanvas(canvasRef.current, recipe);
            const dataUrl = canvasRef.current.toDataURL('image/png');

            // Add to session history
            setHistoryItems((prev) => [
              {
                id: recipe.generationId,
                promptText,
                recipe,
                dataUrl,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                aspectRatio,
              },
              ...prev.slice(0, 7), // Keep last 8
            ]);
          }
          setIsGenerating(false);
        }, 150);
      } catch (err: any) {
        console.error('Failed to generate AI graphic:', err);
        setStatusFeedback('Error generating graphic. Please try again.');
        setIsGenerating(false);
      }
    },
    [promptText, aspectRatio]
  );

  // Trigger initial graphic generation on mount if none exists
  useEffect(() => {
    if (!currentRecipe && !isGenerating) {
      handleGenerate();
    }
  }, []);

  // Re-render when aspect ratio toggles
  const handleToggleAspectRatio = (ratio: '1:1' | '4:5') => {
    setAspectRatio(ratio);
    if (currentRecipe) {
      const updated = { ...currentRecipe, aspectRatio: ratio };
      setCurrentRecipe(updated);
      setTimeout(() => {
        if (canvasRef.current) {
          AIGraphicRenderer.renderToCanvas(canvasRef.current, updated);
        }
      }, 50);
    }
  };

  // Download High-Resolution Graphic
  const handleDownload = () => {
    if (!canvasRef.current || !currentRecipe) return;

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const datePart = new Date().toISOString().split('T')[0];
      link.download = `NavDurga_AI_Promotional_Graphic_${datePart}_${currentRecipe.generationId}.png`;
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
          `Downloaded AI promotional graphic ${currentRecipe.generationId}`
        );
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Copy Formatted WhatsApp Caption Text
  const handleCopyCaption = async () => {
    if (!currentRecipe) return;

    try {
      await navigator.clipboard.writeText(currentRecipe.formattedShareText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  // Share to WhatsApp
  const handleShareToWhatsApp = () => {
    if (!currentRecipe) return;

    // 1. Download image automatically so the user has the high-res file ready to attach
    handleDownload();

    // 2. Resolve destination phone number
    const targetCust = customers.find((c) => c.id === selectedCustomerId);
    const destinationPhone = useCustomPhone
      ? customPhone
      : targetCust?.whatsapp || targetCust?.mobile || '+91 97521 83053';

    // 3. Open WhatsApp Web or mobile app with pre-filled promotional caption
    WhatsAppService.openChat(
      destinationPhone,
      currentRecipe.formattedShareText,
      targetCust?.name || 'Customer'
    );

    setStatusFeedback(
      'WhatsApp opened! High-resolution promotional rate poster downloaded — attach it in the chat.'
    );
    setTimeout(() => setStatusFeedback(null), 6000);

    if (onLogWhatsAppActivity) {
      onLogWhatsAppActivity(
        'WhatsApp Opened',
        targetCust?.name || 'Direct Recipient',
        destinationPhone,
        `Shared AI graphic ${currentRecipe.generationId} with caption`
      );
    }
  };

  // Restore previous graphic from history
  const handleRestoreFromHistory = (item: AIGeneratedGraphicHistoryItem) => {
    setCurrentRecipe(item.recipe);
    setAspectRatio(item.aspectRatio);
    setPromptText(item.promptText);
    setTimeout(() => {
      if (canvasRef.current) {
        AIGraphicRenderer.renderToCanvas(canvasRef.current, item.recipe);
      }
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Feature Intro Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-blue-700/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-400 text-slate-950 shadow-2xs">
                ✨ Zero-Template AI Graphic Engine
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Indian Steel Promotional Standard • 1080×1080 High-Res
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>AI Promotional Graphic Generator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Enter <strong>only promotional text</strong>. The AI generates a <strong>completely new, random graphic</strong> every time: dynamic background, custom color harmonies, 3D steel sections, bold prices, and official Nav Durga mill branding.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating AI Graphic...' : 'Regenerate (New Random Style)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Input & Controls | Right Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: TEXT INPUT & GENERATION CONTROLS (5 cols on lg)              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Text Input Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Enter Promotional Text (Admin Text Input)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {promptText.length} characters
              </span>
            </div>

            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Nav Durga Special Offer: MS Channel 125x65 and MS Angle 50x50 at ₹48,500/MT only. Ex-Plant Urla, Raipur. Immediate loading for orders above 20 MT. Call +91 97521 83053!"
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 font-medium text-slate-900 leading-relaxed resize-y"
            />

            {/* Quick Inspiration Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                Quick 1-Click Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(sample.text);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Sizing Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Graphic Aspect Ratio:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggleAspectRatio('1:1')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    aspectRatio === '1:1'
                      ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>1:1 Square (1080×1080)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAspectRatio('4:5')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    aspectRatio === '4:5'
                      ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>4:5 Portrait</span>
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !promptText.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'Generating...' : 'Generate AI Graphic'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !promptText.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer disabled:opacity-50"
                title="Generates another completely random layout, color palette & 3D composition"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
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
                  placeholder="e.g. +91 97521 83053"
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

            {statusFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusFeedback}</span>
              </div>
            )}
          </div>

          {/* Formatted Promotional Text Caption */}
          {currentRecipe && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Generated WhatsApp Caption:</span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-snug border border-slate-100">
                {currentRecipe.formattedShareText}
              </pre>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: HIGH-RES LIVE GRAPHIC PREVIEW (7 cols on lg)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>AI Graphic Live Preview</span>
                  {currentRecipe && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                      #{currentRecipe.generationId}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {aspectRatio === '1:1' ? '1080 × 1080 px Square' : '1080 × 1350 px Portrait (4:5)'} • Generated randomly on demand
                </p>
              </div>

              <div className="flex items-center gap-2">
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
              {isGenerating && (
                <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold">Synthesizing AI Steel Promotional Graphic...</span>
                </div>
              )}

              <div
                className={`w-full max-w-[540px] shadow-lg rounded-xl overflow-hidden bg-slate-900 border border-slate-300 transition-all ${
                  aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>

            {/* Dynamic AI Recipe Breakdown Pills */}
            {currentRecipe && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Layout Style</span>
                  <span className="font-bold text-slate-800 capitalize truncate block">
                    {currentRecipe.layoutStyle.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Color Palette</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {currentRecipe.colorPalette.name}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">3D Steel Visuals</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {currentRecipe.productVisuals.length} Sections Extruded
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Background Pattern</span>
                  <span className="font-bold text-slate-800 capitalize truncate block">
                    {currentRecipe.backgroundDecor.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Session History Gallery */}
          {historyItems.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Session Variations ({historyItems.length})
                </span>
                <span className="text-[11px] text-slate-400">Click any variation to load</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {historyItems.map((item, idx) => (
                  <div
                    key={item.id + idx}
                    onClick={() => handleRestoreFromHistory(item)}
                    className={`shrink-0 w-24 rounded-xl border p-1 cursor-pointer transition-all hover:scale-105 ${
                      currentRecipe?.generationId === item.id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/30'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.id}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="mt-1 text-[10px] font-mono text-center text-slate-500 truncate">
                      #{item.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
