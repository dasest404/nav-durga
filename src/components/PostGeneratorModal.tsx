import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Send,
  Calendar,
  Building2,
  ImageIcon,
  Upload,
  Plus,
  Trash2,
  Layers,
  Filter,
  CheckCircle2,
  Palette,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DailyUpdate, CompanySettings, Product, CommonProductImage, WhatsAppThemeName, CompanyGradeBasicRates, CategoryBasicRates } from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { PosterRenderer, POSTER_THEMES, PosterThemeDefinition } from '../services/posterRenderer';
import { normalizeGrade } from '../utils/rateCalculator';

interface PostGeneratorModalProps {
  update: DailyUpdate;
  company: CompanySettings;
  products?: Product[];
  commonProductImages?: CommonProductImage[];
  gradeBasicRates?: CompanyGradeBasicRates;
  categoryBasicRates?: CategoryBasicRates;
  onSaveCommonProductImages?: (images: CommonProductImage[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToWhatsAppCenter?: (updateId: string) => void;
  onOpenSendTest?: (update: DailyUpdate) => void;
}

const THEMES: PosterThemeDefinition[] = POSTER_THEMES;

export const PostGeneratorModal: React.FC<PostGeneratorModalProps> = ({
  update,
  company,
  products = [],
  commonProductImages = [],
  gradeBasicRates,
  categoryBasicRates,
  onSaveCommonProductImages,
  isOpen,
  onClose,
  onNavigateToWhatsAppCenter,
  onOpenSendTest,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<WhatsAppThemeName>('premium-industrial');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5');
  const [layoutMode, setLayoutMode] = useState<'multi-post' | 'single-master'>('multi-post');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Common Product Images manager state
  const [showCommonImageDrawer, setShowCommonImageDrawer] = useState(false);
  const [commonImages, setCommonImages] = useState<CommonProductImage[]>(commonProductImages);
  const [newImageProduct, setNewImageProduct] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Date and Rate Source selection
  const [postDate, setPostDate] = useState<string>(
    update.date || new Date().toISOString().split('T')[0]
  );
  const [selectedMill, setSelectedMill] = useState<string>('All');

  // Keep commonImages synchronized with props
  useEffect(() => {
    if (commonProductImages && commonProductImages.length > 0) {
      setCommonImages(commonProductImages);
    }
  }, [commonProductImages]);

  // ALL active products with latest dynamic prices from Daily Rate Management
  const activePostProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.filter((p) => {
        const isActive = p.status === 'Active' || (p as any).isActive !== false;
        const matchesMill =
          selectedMill === 'All' ||
          (p.rateSource || 'NAV DURGA ISPAT PVT. LTD.') === selectedMill;
        return isActive && matchesMill;
      });
    }

    // Fallback if products not passed: construct from update.items
    return (update.items || []).map((item, idx) => {
      const anyItem = item as any;
      const sizeStr = anyItem.size || item.grade || '';
      const normG = normalizeGrade(item.grade || anyItem.gaugeType);
      const isLight =
        normG === 'SL' ||
        normG === '5 KG' ||
        normG === '8 KG' ||
        sizeStr.includes('70') ||
        sizeStr.includes('75');
      const rateVal = item.price || anyItem.rate || 40000;
      return {
        id: item.productId || `upd-${idx}`,
        code: `ND-${idx}`,
        name: item.productName,
        productName: item.productName,
        productCategory: anyItem.productCategory || item.productName,
        category: anyItem.productCategory || item.productName,
        size: sizeStr,
        grade: normG,
        gaugeType: normG,
        section: (anyItem.section ||
          (isLight ? 'LIGHT SECTION' : 'MEDIUM SECTION')) as
          | 'MEDIUM SECTION'
          | 'LIGHT SECTION',
        rateSource: anyItem.rateSource || 'NAV DURGA ISPAT PVT. LTD.',
        baseRate: rateVal,
        gaugeDifference: 0,
        loadingCharge: 0,
        insuranceCharge: 0,
        otherCharges: 0,
        finalRate: rateVal,
        currentPrice: rateVal,
        previousPrice: item.previousPrice || rateVal,
        priceChange: rateVal - (item.previousPrice || rateVal),
        unit: item.unit || 'MT',
        minOrderQty: 10,
        hsnCode: '7214',
        taxRate: 18,
        status: 'Active' as const,
        effectiveFrom: update.date,
        description: anyItem.specification || '',
        inStock: item.availability !== 'Out of Stock',
        priceHistory: [],
      };
    });
  }, [products, update, selectedMill]);

  // Extract hero benchmark rates
  const { mediumPrice, slPrice } = useMemo(() => {
    return PosterRenderer.extractBenchmarkRates(activePostProducts);
  }, [activePostProducts]);

  // Total pages based on mode
  const totalPages = useMemo(() => {
    if (layoutMode === 'single-master') return 1;
    // In multi-post mode: Page 1 = Medium & SL, Page 2 = Light & Allied
    return 2;
  }, [layoutMode]);

  // Ensure current page does not exceed total pages
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  // Formatted WhatsApp text with strictly logical order & prominent benchmark rates
  const formattedText = useMemo(() => {
    return WhatsAppService.formatCompleteSteelRatePostText(
      activePostProducts,
      company,
      postDate,
      gradeBasicRates,
      categoryBasicRates
    );
  }, [activePostProducts, company, postDate, gradeBasicRates, categoryBasicRates]);

  // Rerender Canvas whenever Theme, Products, Date, Aspect Ratio, Page, or Common Product Images change
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      PosterRenderer.render(
        canvasRef.current,
        activePostProducts,
        company,
        selectedTheme,
        {
          dateStr: postDate,
          remarks: update.remarks,
          aspectRatio,
          layoutMode,
          pageIndex: currentPage,
          totalPages,
          commonProductImages: commonImages,
        }
      );
    }
  }, [
    isOpen,
    activePostProducts,
    company,
    selectedTheme,
    postDate,
    aspectRatio,
    layoutMode,
    currentPage,
    totalPages,
    commonImages,
    update.remarks,
  ]);

  if (!isOpen) return null;

  // Unique product sizes for common image assignment
  const availableProductSizes = Array.from(
    new Set(
      (products.length > 0 ? products : activePostProducts).map(
        (p) => `${p.productName || p.name} ${p.size}`
      )
    )
  ).sort();

  const handleDownload = (pageToDownload?: number) => {
    const targetPage = pageToDownload !== undefined ? pageToDownload : currentPage;
    const tempCanvas = document.createElement('canvas');
    PosterRenderer.render(
      tempCanvas,
      activePostProducts,
      company,
      selectedTheme,
      {
        dateStr: postDate,
        remarks: update.remarks,
        aspectRatio,
        layoutMode,
        pageIndex: targetPage,
        totalPages,
        commonProductImages: commonImages,
      }
    );

    try {
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      const sanitizedDate = postDate.replace(/[^a-zA-Z0-9]/g, '_');
      const pageSuffix = totalPages > 1 ? `_Part${targetPage + 1}of${totalPages}` : '';
      link.download = `NavDurga_${selectedTheme}_${sanitizedDate}${pageSuffix}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDownloadAllPosts = () => {
    for (let p = 0; p < totalPages; p++) {
      setTimeout(() => {
        handleDownload(p);
      }, p * 400);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleManualWhatsAppShare = () => {
    handleDownload();
    const shareUrl = WhatsAppService.buildWhatsAppWebUrl('', formattedText);
    try {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Direct popup prevented by sandbox:', e);
    }
    setShareFeedback(
      'WhatsApp opened! Daily rate poster image downloaded to attach.'
    );
    setTimeout(() => setShareFeedback(null), 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setNewImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCommonImage = () => {
    if (!newImageProduct.trim() || !newImageUrl.trim()) return;

    const existingIndex = commonImages.findIndex(
      (img) => img.name.toLowerCase() === newImageProduct.trim().toLowerCase()
    );

    let updated: CommonProductImage[];
    if (existingIndex >= 0) {
      updated = commonImages.map((img, i) =>
        i === existingIndex
          ? { ...img, imageUrl: newImageUrl, uploadedAt: new Date().toISOString() }
          : img
      );
    } else {
      const newImg: CommonProductImage = {
        id: `cimg-${Date.now()}`,
        category: newImageProduct.split(' ')[0] || 'MS Channel',
        name: newImageProduct.trim(),
        imageUrl: newImageUrl,
        uploadedAt: new Date().toISOString(),
      };
      updated = [newImg, ...commonImages];
    }

    setCommonImages(updated);
    onSaveCommonProductImages?.(updated);
    setNewImageUrl('');
    setUploadSuccessMsg(
      `Image saved for "${newImageProduct}"! Automatically applied to all its grades.`
    );
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  const handleDeleteCommonImage = (id: string) => {
    const updated = commonImages.filter((img) => img.id !== id);
    setCommonImages(updated);
    onSaveCommonProductImages?.(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  WhatsApp Post & Image Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                  {activePostProducts.length} Products Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate high-resolution 1080×1080 square rate cards with grade separation and instant broadcast.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCommonImageDrawer(!showCommonImageDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                showCommonImageDrawer
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Common Images ({commonImages.length})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* COMMON PRODUCT IMAGES DRAWER / COLLAPSIBLE PANEL */}
        {showCommonImageDrawer && (
          <div className="p-4 bg-blue-50/70 border-b border-blue-100 shrink-0 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Common Product Images (Upload Once, Reused Across All Grades)
                </h3>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Upload an image for a product (e.g. &quot;MS Channel 75 × 40 mm&quot;). It is automatically reused across all grades (Medium, SL, 5 KG, 8 KG).
                </p>
              </div>

              {uploadSuccessMsg && (
                <div className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {uploadSuccessMsg}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Product Size Selector / Input */}
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Product & Size
                </label>
                <input
                  type="text"
                  list="product-sizes-list"
                  value={newImageProduct}
                  onChange={(e) => setNewImageProduct(e.target.value)}
                  placeholder="e.g. MS Channel 75 × 40 mm"
                  className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <datalist id="product-sizes-list">
                  {availableProductSizes.map((size) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
              </div>

              {/* Image URL or File Upload */}
              <div className="lg:col-span-5 flex items-center gap-2">
                <div className="grow">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Image URL or Upload
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL or choose file..."
                    className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="shrink-0 pt-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-2xs"
                    title="Upload local file"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="lg:col-span-3">
                <button
                  type="button"
                  onClick={handleSaveCommonImage}
                  disabled={!newImageProduct || !newImageUrl}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Common Image</span>
                </button>
              </div>
            </div>

            {/* Existing Common Images List Chips */}
            {commonImages.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                  Configured Images:
                </span>
                {commonImages.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 text-[11px] shadow-2xs shrink-0"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.name}
                      className="w-4 h-4 object-cover rounded"
                    />
                    <span className="font-semibold">{img.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommonImage(img.id)}
                      className="text-slate-400 hover:text-red-600 ml-1"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Benchmark Rates Quick Glance Banner */}
        <div className="bg-slate-900 text-white px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[11px] border border-blue-400/30">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              BENCHMARK RATES
            </span>
            <span className="text-slate-300 hidden sm:inline">Ex-Plant Urla, Raipur:</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">MEDIUM SECTION:</span>
              <span className="font-extrabold text-blue-400 text-sm">
                ₹{mediumPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">/MT</span>
            </div>

            <div className="h-3.5 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">SL SECTION:</span>
              <span className="font-extrabold text-amber-400 text-sm">
                ₹{slPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">/MT</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto grow">
          {/* Left Column: Canvas Preview, Theme Chooser & Page Controls */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Format & Layout Toolbar */}
            <div className="w-full mb-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {/* Aspect Ratio */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600">Ratio:</span>
                <button
                  type="button"
                  onClick={() => setAspectRatio('4:5')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    aspectRatio === '4:5'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  4:5 Mobile (1080×1350)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    aspectRatio === '1:1'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  1:1 Square (1080×1080)
                </button>
              </div>

              {/* Layout Mode */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600">Layout:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLayoutMode('multi-post');
                    setCurrentPage(0);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    layoutMode === 'multi-post'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Multi-Post Slides
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLayoutMode('single-master');
                    setCurrentPage(0);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    layoutMode === 'single-master'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Single Sheet Master
                </button>
              </div>
            </div>

            {/* Theme Selector Pills */}
            <div className="w-full mb-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  Select Professional Corporate Theme ({THEMES.length} Available):
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Active: <strong className="text-blue-600">{THEMES.find((t) => t.id === selectedTheme)?.name}</strong>
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {THEMES.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">{th.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {th.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls (for Multi-Post Mode) */}
            {totalPages > 1 && (
              <div className="w-full mb-2 flex items-center justify-between bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900">Post Slide:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(0)}
                      className={`px-2.5 py-0.5 rounded-lg font-bold text-xs transition-colors ${
                        currentPage === 0
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      Post 1: Medium & SL
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      className={`px-2.5 py-0.5 rounded-lg font-bold text-xs transition-colors ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      Post 2: Light & Allied
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className="p-1 rounded bg-white text-slate-700 border border-blue-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-blue-900 px-1">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="p-1 rounded bg-white text-slate-700 border border-blue-200 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Container */}
            <div className="w-full flex items-center justify-between mb-1.5 text-[11px] text-slate-500 font-semibold">
              <span>
                Preview ({aspectRatio === '4:5' ? 'Portrait 1080 × 1350' : 'Square 1080 × 1080'})
                {totalPages > 1 ? ` — Slide ${currentPage + 1} of ${totalPages}` : ''}
              </span>
              <span className="text-blue-600 font-bold">
                {THEMES.find((t) => t.id === selectedTheme)?.name}
              </span>
            </div>

            <div
              className={`w-full max-w-[420px] bg-slate-900/5 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative p-1 ${
                aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-xl"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Right Column: Dynamic WhatsApp Text Preview & Sharing Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div>
              {/* Mill & Date Selectors */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Rate Source / Mill
                  </label>
                  <select
                    value={selectedMill}
                    onChange={(e) => setSelectedMill(e.target.value)}
                    className="w-full py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    <option value="All">All Mills (Nav Durga + NS Ispat)</option>
                    <option value="NAV DURGA ISPAT PVT. LTD.">NAV DURGA ISPAT PVT. LTD.</option>
                    <option value="NS ISPAT (INDIA) PVT. LTD. UNIT-II">NS ISPAT (INDIA) PVT. LTD. UNIT-II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Display Date
                  </label>
                  <input
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="w-full py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Text Header with Copy Button */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Formatted WhatsApp Message
                </label>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrollable text box formatted in logical order with benchmark hero rates */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {formattedText}
              </div>

              {shareFeedback && (
                <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-lg font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{shareFeedback}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(currentPage)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>{downloadSuccess ? 'Downloaded!' : totalPages > 1 ? `Download Slide ${currentPage + 1}` : 'Download Image'}</span>
                </button>

                {totalPages > 1 ? (
                  <button
                    type="button"
                    onClick={handleDownloadAllPosts}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Download All ({totalPages})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy Message'}</span>
                  </button>
                )}
              </div>

              {/* Primary Direct Share */}
              <button
                type="button"
                onClick={handleManualWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share on WhatsApp Web / App</span>
              </button>

              {/* Test WhatsApp send */}
              {onOpenSendTest && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSendTest(update);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>Send Test WhatsApp to Nav Durga Test Customer</span>
                </button>
              )}

              {/* Broadcast route */}
              {onNavigateToWhatsAppCenter && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToWhatsAppCenter(update.id);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast to Filtered Customers in WhatsApp Center</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
