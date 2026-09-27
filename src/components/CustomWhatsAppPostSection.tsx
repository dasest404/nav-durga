import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Users,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Eye,
  FileText,
  Calendar,
  Send,
  MessageSquare,
} from 'lucide-react';
import {
  Customer,
  CompanySettings,
  CustomWhatsAppPost,
  CustomPostRecipient,
} from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { CustomPostDetailModal } from './CustomPostDetailModal';

interface CustomWhatsAppPostSectionProps {
  customers: Customer[];
  company: CompanySettings;
  onNavigateToCustomer?: (customerId: string) => void;
}

const MESSAGE_TEMPLATES = [
  {
    label: '🕉️ Ganesh Chaturthi',
    category: 'Festival Greeting',
    text: `Happy Ganesh Chaturthi from Nav Durga Ispat.\n\nWishing you and your family happiness, prosperity, and great success in all your construction and steel projects.\n\nWarm regards,\nNav Durga Ispat, Raipur`,
  },
  {
    label: '🪔 Diwali Wishes',
    category: 'Festival Greeting',
    text: `✨ Wishing You & Your Family A Very Happy and Prosperous Diwali!\n\nMay this festival of lights illuminate your path with joy, good health, and immense business growth.\n\nWarm greetings,\nNav Durga Ispat, Raipur\nPlot No. 42-45, Phase II, Urla Industrial Complex`,
  },
  {
    label: '🎨 Holi Wishes',
    category: 'Festival Greeting',
    text: `Happy Holi from Nav Durga Ispat!\n\nWishing you and your family vibrant colors of joy, peace, and abundance.\n\nBest wishes,\nTeam Nav Durga Ispat, Raipur`,
  },
  {
    label: '🇮🇳 Independence Day',
    category: 'National Day',
    text: `Happy Independence Day! 🇮🇳\n\nProud to build the nation's infrastructure with high-strength Fe 500D TMT and structural steel.\n\nNav Durga Ispat, Raipur`,
  },
  {
    label: '🇮🇳 Republic Day',
    category: 'National Day',
    text: `Saluting the spirit of India on Republic Day! 🇮🇳\n\nCommitted to national growth and industrial excellence with quality steel solutions.\n\nNav Durga Ispat, Raipur`,
  },
  {
    label: '⚡ Special Steel Offer',
    category: 'Special Offer',
    text: `⚡ SPECIAL FACTORY DISPATCH OFFER — NAV DURGA ISPAT\n\nDear Partner,\nPrime Fe 500D TMT Rebars (8mm - 32mm) & MS Angles available at special volume rates for immediate dispatch from Urla, Raipur.\n\nTo lock your booking rates, reply directly to this message.\n📞 Hotline: +91 771 4208900 | 📱 WhatsApp: +91 97521 83053`,
  },
  {
    label: '📢 Price Announcement',
    category: 'Price Announcement',
    text: `📢 STEEL MARKET UPDATE — NAV DURGA ISPAT\n\nDear Customer,\nPlease find our updated steel price list ex-factory Urla Raipur attached.\nFor detailed project quotations and test certificates, reply here.\n\nNav Durga Ispat`,
  },
  {
    label: '💼 Recruitment Post',
    category: 'Recruitment',
    text: `WE ARE HIRING! 📢\nNav Durga Ispat is inviting dynamic candidates for Sales & Dispatch operations at Urla, Raipur.\n\nSend your resume or reply directly to this number.\nNav Durga Ispat, Raipur`,
  },
];

export const CustomWhatsAppPostSection: React.FC<CustomWhatsAppPostSectionProps> = ({
  customers,
  company,
  onNavigateToCustomer,
}) => {
  // Identify the designated Test Customer
  const testCustomer = WhatsAppService.getTestCustomer(customers);

  // 1. Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Message State
  const [messageText, setMessageText] = useState<string>(
    `Happy Ganesh Chaturthi from Nav Durga Ispat.\n\nWishing you and your family happiness and prosperity.`
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('Festival Greeting');
  const [copiedMessage, setCopiedMessage] = useState(false);

  // 3. Customer Selection State
  // Default to selecting the Nav Durga Test Customer
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([testCustomer.id]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'test' | 'all'>('test');

  // 4. Custom Post History State
  const [historyPosts, setHistoryPosts] = useState<CustomWhatsAppPost[]>(() =>
    WhatsAppService.getCustomPosts()
  );
  const [selectedHistoryPost, setSelectedHistoryPost] = useState<CustomWhatsAppPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // User feedback toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Listen to custom post updates across the app
  useEffect(() => {
    const handleUpdate = () => {
      setHistoryPosts(WhatsAppService.getCustomPosts());
    };
    window.addEventListener('navdurga_custom_posts_updated', handleUpdate);
    return () => window.removeEventListener('navdurga_custom_posts_updated', handleUpdate);
  }, []);

  // Handle image file selection
  const processImageFile = (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setActionFeedback('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageDataUrl(result);
      setImageFile(file);
      setImageName(file.name);
      setImageSize(file.size);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;

      setActionFeedback(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB) successfully.`);
      setTimeout(() => setActionFeedback(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageDataUrl(null);
    setImageName('');
    setImageSize(0);
    setImageDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActionFeedback('Image removed.');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleDownloadImage = () => {
    if (!imageDataUrl) {
      setActionFeedback('Please upload an image first to download.');
      return;
    }
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = imageName || 'navdurga_custom_post.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    WhatsAppService.logActivity({
      customerName: selectedCustomers[0]?.name || testCustomer.name,
      phoneNumber: selectedCustomers[0]?.whatsapp || testCustomer.whatsapp,
      action: 'Image Downloaded',
      details: `Downloaded custom post image: ${imageName || 'creative.png'}`,
    });

    setActionFeedback('Image downloaded to your device! You can now manually attach it in WhatsApp.');
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleCopyMessage = async () => {
    if (!messageText.trim()) {
      setActionFeedback('Message is empty.');
      return;
    }
    const recipient = selectedCustomers[0] || testCustomer;
    const success = await WhatsAppService.copyMessage(
      messageText,
      recipient.name,
      recipient.whatsapp || recipient.mobile
    );
    if (success) {
      setCopiedMessage(true);
      setActionFeedback('Message copied to clipboard! Paste it into WhatsApp.');
      setTimeout(() => setCopiedMessage(false), 2500);
      setTimeout(() => setActionFeedback(null), 4500);
    }
  };

  // Customer search & filtering
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.tag && c.tag.toLowerCase().includes(q))
    );
  });

  const selectedCustomers = customers.filter((c) => selectedCustomerIds.includes(c.id));

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCustomers.map((c) => c.id);
    const allSelected = filteredIds.every((id) => selectedCustomerIds.includes(id));
    if (allSelected) {
      setSelectedCustomerIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedCustomerIds, ...filteredIds]));
      setSelectedCustomerIds(combined);
    }
  };

  const handleSelectTestCustomerOnly = () => {
    setSelectedCustomerIds([testCustomer.id]);
    setActiveCustomerTab('test');
    setActionFeedback(`Selected Test Customer: ${testCustomer.name} (${testCustomer.whatsapp})`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Open WhatsApp Action
  const handleOpenWhatsAppForCustomer = (cust: Customer) => {
    const phone = cust.whatsapp || cust.mobile;
    WhatsAppService.openChat(phone, messageText, cust.name);

    // Save to Custom Post History
    saveCurrentPostToHistory([cust]);

    setActionFeedback(`Opened WhatsApp chat for ${cust.name} (${phone}). Please attach your downloaded image and click send.`);
    setTimeout(() => setActionFeedback(null), 5500);
  };

  const saveCurrentPostToHistory = (recipientsList: Customer[]) => {
    if (!imageDataUrl) return;

    const recipients: CustomPostRecipient[] = recipientsList.map((c) => ({
      customerId: c.id,
      customerName: c.name,
      companyName: c.companyName,
      phoneNumber: c.whatsapp || c.mobile,
      status: 'Opened',
    }));

    const newPost: CustomWhatsAppPost = {
      id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      imageName: imageName || 'custom_creative.png',
      imageUrl: imageDataUrl,
      imageSize: imageSize || undefined,
      message: messageText,
      recipients,
      createdAt: new Date().toISOString(),
      type: 'Custom Image',
      status: 'Manual Test',
      category: selectedCategory,
    };

    WhatsAppService.saveCustomPost(newPost);
    setHistoryPosts(WhatsAppService.getCustomPosts());
  };

  const handleDeleteHistoryPost = (id: string) => {
    WhatsAppService.deleteCustomPost(id);
    setHistoryPosts(WhatsAppService.getCustomPosts());
  };

  const openHistoryDetail = (post: CustomWhatsAppPost) => {
    setSelectedHistoryPost(post);
    setIsDetailModalOpen(true);
  };

  // Primary active recipient for the preview box
  const primaryRecipient = selectedCustomers[0] || testCustomer;

  return (
    <div className="space-y-8">
      {/* 1. SECTION HEADER & STEPPER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0 font-bold border border-purple-200">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Custom WhatsApp Post
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Festival &amp; Ready-Made Creatives
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Manual Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Upload ready-made creatives (festivals, offers, announcements, price updates) and share them through the WhatsApp manual workflow with pre-filled message text.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectTestCustomerOnly}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <span>⚡ Quick Test Customer</span>
            </button>
          </div>
        </div>

        {/* 7-Step Simple UX Workflow Bar */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Simple 7-Step Manual Workflow for Staff:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
              1. Upload Image
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
              2. Write Message
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
              3. Select Customer
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
              4. Preview
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 font-bold text-emerald-800 shadow-2xs">
              5. Open WhatsApp
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-300 font-bold text-blue-800 shadow-2xs">
              6. Attach Image
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold shadow-2xs">
              7. Send Manually
            </span>
          </div>
        </div>

        {/* Global Action Feedback Alert */}
        {actionFeedback && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. MAIN CREATOR GRID: Left = Upload & Message; Right = Customer Selection & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Upload Image & Message (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: UPLOAD IMAGE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h3 className="text-base font-bold text-slate-900">Upload Image</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                JPG, JPEG, PNG, WEBP
              </span>
            </div>

            {/* Upload Area / Dropzone */}
            {!imageDataUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70 bg-slate-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag &amp; drop your image here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution festival creatives, offers, banners, or product photos.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700">
                    JPG
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700">
                    PNG
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700">
                    WEBP
                  </span>
                </div>
              </div>
            ) : (
              /* Image Preview Card */
              <div className="space-y-4">
                <div className="relative rounded-2xl border border-slate-200 bg-slate-900/5 p-3 overflow-hidden flex flex-col items-center justify-center">
                  <img
                    src={imageDataUrl}
                    alt="Preview"
                    className="max-h-96 w-auto max-w-full object-contain rounded-xl shadow-xs"
                  />
                  {imageDimensions && (
                    <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-mono">
                      {imageDimensions.width} × {imageDimensions.height} px
                    </div>
                  )}
                </div>

                {/* Image Details and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {imageName || 'custom_image'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {(imageSize / 1024).toFixed(1)} KB • Original Quality Preserved
                      </span>
                    </div>
                  </div>

                  {/* Actions: Replace, Download, Remove */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors"
                      title="Replace Image"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-2xs transition-colors"
                      title="Download to computer / phone"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-2xs transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: WHATSAPP MESSAGE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h3 className="text-base font-bold text-slate-900">WhatsApp Message</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  {messageText.length} chars
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMessage ? 'Copied!' : 'Copy Message'}</span>
                </button>
              </div>
            </div>

            {/* Template Selector Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Festive &amp; Business Templates:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MESSAGE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => {
                      setMessageText(tmpl.text);
                      setSelectedCategory(tmpl.category);
                      setActionFeedback(`Applied template: ${tmpl.label}`);
                      setTimeout(() => setActionFeedback(null), 2500);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text Area */}
            <div>
              <label htmlFor="custom-post-message-textarea" className="sr-only">WhatsApp custom message text</label>
              <textarea
                id="custom-post-message-textarea"
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your WhatsApp greeting or broadcast message here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Selection & Preview & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 3: SELECT CUSTOMER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="text-base font-bold text-slate-900">Select Customer</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {selectedCustomerIds.length} Selected
              </span>
            </div>

            {/* Quick Test Customer Highlight Card */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-amber-950">
                      ⚡ {testCustomer.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                      Test Customer
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                    {testCustomer.whatsapp}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {testCustomer.city}, {testCustomer.state}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelectTestCustomerOnly}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedCustomerIds.length === 1 && selectedCustomerIds[0] === testCustomer.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {selectedCustomerIds.length === 1 && selectedCustomerIds[0] === testCustomer.id
                    ? 'Selected ✓'
                    : 'Select Only This'}
                </button>
              </div>
            </div>

            {/* Tabs: Test Customer vs All Customers */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveCustomerTab('test')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeCustomerTab === 'test'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Target Test ({selectedCustomerIds.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCustomerTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  activeCustomerTab === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Browse All Customers ({customers.length})</span>
              </button>
            </div>

            {/* Search Customers */}
            {activeCustomerTab === 'all' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, company, city, phone..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    Showing {filteredCustomers.length} customer(s)
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    Toggle Select All
                  </button>
                </div>
              </div>
            )}

            {/* Customers Checkbox List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {(activeCustomerTab === 'test'
                ? customers.filter((c) => selectedCustomerIds.includes(c.id))
                : filteredCustomers
              ).map((c) => {
                const isSelected = selectedCustomerIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCustomerSelection(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 truncate">{c.name}</span>
                          {c.tag && (
                            <span className="text-[10px] px-1.5 rounded bg-amber-100 text-amber-800 font-bold">
                              {c.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {c.whatsapp || c.mobile} • {c.city}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {c.customerType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4 & 5: PREVIEW & WHATSAPP ACTIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  4
                </span>
                <h3 className="text-base font-bold text-slate-900">Preview &amp; Actions</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Manual Mode
              </span>
            </div>

            {/* PREVIEW SUMMARY CARD */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                    Customer
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {primaryRecipient.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                    WhatsApp
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {primaryRecipient.whatsapp || primaryRecipient.mobile}
                  </span>
                </div>
              </div>

              {/* Image Thumbnail in Preview */}
              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                  Image
                </span>
                {imageDataUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                    <img
                      src={imageDataUrl}
                      alt="Thumbnail"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-100 shrink-0"
                    />
                    <div className="truncate text-xs">
                      <span className="font-bold text-slate-800 block truncate">{imageName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {(imageSize / 1024).toFixed(1)} KB • Ready to attach
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>No image uploaded yet. (You can still send message only or upload above)</span>
                  </div>
                )}
              </div>

              {/* Message Preview snippet */}
              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                  Message
                </span>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs whitespace-pre-wrap max-h-24 overflow-y-auto leading-relaxed font-sans">
                  {messageText || '(Empty message)'}
                </div>
              </div>
            </div>

            {/* THE THREE PRIMARY ACTION BUTTONS */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Image</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
              >
                {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copiedMessage ? 'Message Copied!' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsAppForCustomer(primaryRecipient)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open WhatsApp ({primaryRecipient.whatsapp || primaryRecipient.mobile})</span>
              </button>
            </div>

            {/* Individual dispatch list if multiple customers selected */}
            {selectedCustomers.length > 1 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Individual WhatsApp Queue ({selectedCustomers.length} recipients):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800 block truncate">{cust.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{cust.whatsapp || cust.mobile}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsAppForCustomer(cust)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 shrink-0 shadow-2xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPLICIT NOTICE REQUIRED BY USER */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Manual WhatsApp mode:</strong> image attachment must be added manually. Automatic image sending will be available after WhatsApp Business API integration.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CUSTOM POST HISTORY SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Custom Post History</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {historyPosts.length} saved
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              History of custom creatives and festival greetings prepared for WhatsApp manual testing.
            </p>
          </div>
        </div>

        {historyPosts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No custom posts logged yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload an image and click Open WhatsApp to create your first history entry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openHistoryDetail(post)}
                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
              >
                {/* Header: Type & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {post.type}
                    </span>
                    {post.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {post.status}
                  </span>
                </div>

                {/* Creative thumbnail & file name */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.imageName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {post.imageName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                      Recipient: <strong>{post.recipients[0]?.customerName || 'Test Customer'}</strong>
                    </p>
                  </div>
                </div>

                {/* Message snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 italic bg-white p-2 rounded-lg border border-slate-200">
                  &ldquo;{post.message}&rdquo;
                </p>

                {/* Footer action link */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-blue-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {post.recipients.length} Recipient(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && (
        <CustomPostDetailModal
          isOpen={isDetailModalOpen}
          post={selectedHistoryPost}
          onClose={() => setIsDetailModalOpen(false)}
          onDelete={handleDeleteHistoryPost}
        />
      )}
    </div>
  );
};
