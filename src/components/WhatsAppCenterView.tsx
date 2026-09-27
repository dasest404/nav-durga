import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Eye,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Package,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import {
  DailyUpdate,
  Customer,
  Product,
  CompanySettings,
  WhatsAppConfig,
  WhatsAppMessageRecord,
  SalesEnquiry,
  WhatsAppTestActivity,
  WhatsAppOrderEnquiryParsed,
  ActiveTab,
} from '../types';
import { WhatsAppService, InboundParsedData } from '../services/whatsappService';
import { WhatsAppTestActivityTable } from './WhatsAppTestActivityTable';
import { CustomWhatsAppPostSection } from './CustomWhatsAppPostSection';
import { AIWhatsAppOrderCard } from './AIWhatsAppOrderCard';
import { parseWhatsAppCustomerMessage, buildSalesEnquiryFromWhatsAppParsed } from '../utils/whatsappOrderHelper';
import { NAV_DURGA_TEST_CUSTOMER } from '../data/demoData';

interface WhatsAppCenterViewProps {
  dailyUpdates: DailyUpdate[];
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  preselectedUpdateId?: string;
  onLogMessage: (record: WhatsAppMessageRecord) => void;
  onCreateEnquiryFromWebhook: (enquiry: SalesEnquiry) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const WhatsAppCenterView: React.FC<WhatsAppCenterViewProps> = ({
  dailyUpdates,
  customers,
  products,
  company,
  whatsAppConfig,
  preselectedUpdateId,
  onLogMessage,
  onCreateEnquiryFromWebhook,
  onNavigateToCustomer,
  onNavigateTab,
}) => {
  // Step navigation: ai-orders (Phase 3), manual-test, custom-post, 1. Create Message, 2. Select Customers, 3. Preview & Manual Share, 4. Inbound Webhook Simulator
  const [activeStep, setActiveStep] = useState<
    'ai-orders' | 'manual-test' | 'custom-post' | 'create' | 'select' | 'share' | 'simulator'
  >('ai-orders');

  // Phase 3 AI Order Management State
  const [aiOrderSelectedCustomerId, setAiOrderSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [aiOrderSenderPhone, setAiOrderSenderPhone] = useState<string>(customers[0]?.whatsapp || '+91 97521 83053');
  const [aiOrderUseCustomPhone, setAiOrderUseCustomPhone] = useState<boolean>(false);
  const [aiOrderMessage, setAiOrderMessage] = useState<string>('MS Channel 125x65 Medium 20 MT chahiye');
  const [aiOrderParsed, setAiOrderParsed] = useState<WhatsAppOrderEnquiryParsed | null>(() => {
    return parseWhatsAppCustomerMessage({
      rawText: 'MS Channel 125x65 Medium 20 MT chahiye',
      senderPhone: customers[0]?.whatsapp || '+91 97521 83053',
      preselectedCustomerId: customers[0]?.id,
      customers,
      products,
      company,
    });
  });

  // Test Customer & Manual Test State
  const testCustomer = WhatsAppService.getTestCustomer(customers);
  const [testActivities, setTestActivities] = useState<WhatsAppTestActivity[]>(() =>
    WhatsAppService.getActivities()
  );
  const [testCopied, setTestCopied] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [manualTestType, setManualTestType] = useState<'daily-update' | 'product-update' | 'custom'>('daily-update');
  const [manualTestCustomText, setManualTestCustomText] = useState(
    `*NAV DURGA ISPAT — MANUAL TEST*\n\nHello ${testCustomer.name},\nThis is a manual test message verifying WhatsApp communication integration for Nav Durga Business ERP.\n\n*Product Line:* Fe 500D TMT, MS Angles, Channels, Billets\n*Dispatch Hub:* Raipur, Chhattisgarh\n*Hotline:* ${company.phone}`
  );

  // Message Type Selection
  const [messageType, setMessageType] = useState<'daily-update' | 'product-update' | 'custom'>('daily-update');
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>(
    preselectedUpdateId || dailyUpdates[0]?.id || ''
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customMessage, setCustomMessage] = useState(
    `*NAV DURGA ISPAT — SPECIAL OFFER*\n\nPrime tested TMT Fe 500D available for immediate trailer dispatch ex-Urla plant.\n\nContact +91 98261 45890 for best bulk project rates.`
  );

  // Customer selection state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(() => {
    return customers.filter((c) => c.status === 'Active').map((c) => c.id);
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilterType, setCustomerFilterType] = useState('All');
  const [customerFilterCity, setCustomerFilterCity] = useState('All');
  const [customerFilterProduct, setCustomerFilterProduct] = useState('All');

  // Canvas ref for image preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  // Simulator State
  const [simCustomer, setSimCustomer] = useState<string>(customers[0]?.id || '');
  const [simMessageText, setSimMessageText] = useState('Need 20 ton Fe500D at Naya Raipur site #4');
  const [parsedData, setParsedData] = useState<InboundParsedData | null>(null);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const selectedUpdate = dailyUpdates.find((u) => u.id === selectedUpdateId) || dailyUpdates[0];
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Synchronize test activity logs
  useEffect(() => {
    const handleActivityLogged = () => {
      setTestActivities(WhatsAppService.getActivities());
    };
    window.addEventListener('navdurga_whatsapp_activity_logged', handleActivityLogged);
    return () => window.removeEventListener('navdurga_whatsapp_activity_logged', handleActivityLogged);
  }, []);

  // Derive manual test message
  let manualTestMessage = '';
  if (manualTestType === 'daily-update' && selectedUpdate) {
    manualTestMessage = WhatsAppService.formatDailyUpdate(selectedUpdate, company, testCustomer.name);
  } else if (manualTestType === 'product-update' && selectedProduct) {
    manualTestMessage = `*${company.companyName.toUpperCase()} — STEEL SPECIFICATION*\nDear ${testCustomer.name},\n\n▫️ *${selectedProduct.name} - ${selectedProduct.grade}*\n   Rate: ₹${selectedProduct.currentPrice.toLocaleString('en-IN')} / ${selectedProduct.unit}\n   Specification: ${selectedProduct.description}\n   Min Order: ${selectedProduct.minOrderQty} ${selectedProduct.unit}\n\n📍 Plant: ${company.address}, ${company.city}\n📞 Contact: ${company.phone} | ${company.whatsapp}`;
  } else {
    manualTestMessage = manualTestCustomText;
  }

  const handleManualTestOpenWhatsApp = () => {
    WhatsAppService.openChat(
      testCustomer.whatsapp || testCustomer.mobile,
      manualTestMessage,
      testCustomer.name
    );
    setTestFeedback(`Opened WhatsApp chat for ${testCustomer.name} (${testCustomer.whatsapp}).`);
    setTimeout(() => setTestFeedback(null), 5000);
  };

  const handleManualTestCopy = async () => {
    const success = await WhatsAppService.copyMessage(
      manualTestMessage,
      testCustomer.name,
      testCustomer.whatsapp || testCustomer.mobile
    );
    if (success) {
      setTestCopied(true);
      setTestFeedback('Test message copied to clipboard! Paste it into WhatsApp.');
      setTimeout(() => setTestCopied(false), 2500);
      setTimeout(() => setTestFeedback(null), 5000);
    }
  };

  const handleClearActivities = () => {
    WhatsAppService.clearActivities();
    setTestActivities([]);
  };

  // Derive message text
  let finalMessageText = '';
  if (messageType === 'daily-update' && selectedUpdate) {
    finalMessageText = WhatsAppService.formatDailyUpdateMessage(selectedUpdate, company);
  } else if (messageType === 'product-update' && selectedProduct) {
    finalMessageText = `*${company.companyName.toUpperCase()} — PRODUCT UPDATE*\n\n▫️ *${selectedProduct.name} - ${selectedProduct.grade}*\n   Rate: ₹${selectedProduct.currentPrice.toLocaleString('en-IN')} / ${selectedProduct.unit}\n   Specification: ${selectedProduct.description}\n   Min Order: ${selectedProduct.minOrderQty} ${selectedProduct.unit}\n\n📍 Plant: ${company.address}, ${company.city}\n📞 Contact: ${company.phone} | ${company.whatsapp}`;
  } else {
    finalMessageText = customMessage;
  }

  // Render canvas preview when on preview/share step
  useEffect(() => {
    if (selectedUpdate && canvasRef.current) {
      WhatsAppService.renderPostToCanvas(canvasRef.current, selectedUpdate, company, 'industrial-blue');
    }
  }, [selectedUpdate, company, activeStep]);

  // Handle select all / clear all
  const handleSelectAll = (filteredList: Customer[]) => {
    setSelectedCustomerIds(filteredList.map((c) => c.id));
  };

  const handleClearSelection = () => {
    setSelectedCustomerIds([]);
  };

  const toggleCustomerSelection = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter((cid) => cid !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesType = customerFilterType === 'All' || c.customerType === customerFilterType;
    const matchesCity = customerFilterCity === 'All' || c.city === customerFilterCity;
    const matchesProduct =
      customerFilterProduct === 'All' ||
      (c.interestedProducts && c.interestedProducts.some((p) => p.includes(customerFilterProduct)));

    return matchesSearch && matchesType && matchesCity && matchesProduct;
  });

  const selectedCustomersList = customers.filter((c) => selectedCustomerIds.includes(c.id));

  // Handle manual WhatsApp share for individual customer
  const handleSendToCustomer = (customer: Customer) => {
    const url = WhatsAppService.buildWhatsAppWebUrl(
      customer.whatsapp || customer.mobile,
      finalMessageText
    );
    window.open(url, '_blank', 'noopener,noreferrer');

    // Log to message history
    const record: WhatsAppMessageRecord = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.companyName,
      whatsappNumber: customer.whatsapp || customer.mobile,
      type: 'sent',
      message: finalMessageText,
      timestamp: new Date().toISOString(),
      status: 'sent',
      source: 'manual',
      context: messageType === 'daily-update' ? 'Daily Price Update' : 'Custom Announcement',
    };
    onLogMessage(record);

    setSentSuccessId(customer.id);
    setTimeout(() => setSentSuccessId(null), 3000);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(finalMessageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `NavDurga_WhatsApp_Post_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download image error:', err);
    }
  };

  // Webhook Simulator Handlers
  const handleRunSimulation = () => {
    const matchedCustomer = customers.find((c) => c.id === simCustomer);
    const parsed = WhatsAppService.parseCustomerInboundMessage(simMessageText, matchedCustomer);
    setParsedData(parsed);
  };

  const handleCreateEnquiryFromSim = () => {
    if (!parsedData) return;
    const matchedCustomer = customers.find((c) => c.id === simCustomer) || customers[0];
    const newEnquiry = WhatsAppService.createEnquiryFromInbound(
      matchedCustomer,
      parsedData,
      simMessageText
    );

    // Also log inbound message to customer's WhatsApp chat history
    const msgRecord: WhatsAppMessageRecord = {
      id: `msg-in-${Date.now()}`,
      customerId: matchedCustomer.id,
      customerName: matchedCustomer.companyName,
      whatsappNumber: matchedCustomer.whatsapp || matchedCustomer.mobile,
      type: 'received',
      message: simMessageText,
      timestamp: new Date().toISOString(),
      status: 'inbound',
      source: 'simulated',
      context: 'Customer Enquiry',
    };
    onLogMessage(msgRecord);

    onCreateEnquiryFromWebhook(newEnquiry);
    setSimulationResult(
      `Successfully created Sales Enquiry ${newEnquiry.enquiryNumber} from WhatsApp message! Check Enquiries tab.`
    );
    setTimeout(() => setSimulationResult(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              WhatsApp Communication Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Manual Mode Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create price broadcasts, filter recipient customers, preview graphics, and test inbound replies.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setActiveStep('ai-orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStep === 'ai-orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <span>🤖 AI Orders & Enquiries (Phase 3)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('manual-test')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStep === 'manual-test'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>⚡ WhatsApp Manual Test</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('custom-post')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStep === 'custom-post'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <span>🎨 Custom WhatsApp Post</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStep === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Create Message
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('select')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeStep === 'select'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>2. Select Customers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
              {selectedCustomerIds.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('share')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStep === 'share'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Preview & Share
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeStep === 'simulator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Webhook Simulator</span>
          </button>
        </div>
      </div>

      {/* WHATSAPP API STATUS BLOCK */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-base shrink-0 mt-0.5">
              🟡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  WhatsApp API Status:
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300">
                  🟡 Not Connected (Manual Mode Active)
                </span>
              </div>
              <p className="text-xs text-amber-950/80 mt-1 leading-relaxed max-w-3xl">
                The ERP currently uses direct WhatsApp links. No Meta API access is connected yet. Messages are sent manually via WhatsApp Web or WhatsApp Desktop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveStep('custom-post')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activeStep === 'custom-post'
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-white text-purple-900 border border-purple-300 hover:bg-purple-50'
              }`}
            >
              🎨 Custom Image Post
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('manual-test')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activeStep === 'manual-test'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              ⚡ Manual Test
            </button>
          </div>
        </div>
      </div>

      {/* PHASE 3: AI WHATSAPP ORDER & ENQUIRY MANAGEMENT */}
      {activeStep === 'ai-orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    AI-Powered WhatsApp Customer Order & Enquiry Management
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                  Intelligently parses natural-language WhatsApp messages in English and Hinglish. Automatically identifies customer records from ERP Customer Master, matches canonical products from the Product Master, calculates approved rates, and pushes structured requirements into Sales/CRM.
                </p>
              </div>

              <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Phase 3 Engine Active</span>
              </span>
            </div>

            {/* Inbound Simulator Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sender & Message Inputs */}
              <div className="lg:col-span-6 space-y-4">
                {/* Sender selector */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      1. Inbound WhatsApp Sender
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAiOrderUseCustomPhone(false)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all ${
                          !aiOrderUseCustomPhone
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Registered Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiOrderUseCustomPhone(true)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all ${
                          aiOrderUseCustomPhone
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        New Lead (Custom #)
                      </button>
                    </div>
                  </div>

                  {!aiOrderUseCustomPhone ? (
                    <div>
                      <select
                        value={aiOrderSelectedCustomerId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setAiOrderSelectedCustomerId(cId);
                          const cust = customers.find((c) => c.id === cId);
                          const phone = cust?.whatsapp || cust?.mobile || '+91 97521 83053';
                          setAiOrderSenderPhone(phone);
                          // Auto re-parse
                          setAiOrderParsed(
                            parseWhatsAppCustomerMessage({
                              rawText: aiOrderMessage,
                              senderPhone: phone,
                              preselectedCustomerId: cId,
                              customers,
                              products,
                              company,
                            })
                          );
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName} • {c.name} ({c.whatsapp || c.mobile}) [{c.customerType}]
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={aiOrderSenderPhone}
                        onChange={(e) => {
                          setAiOrderSenderPhone(e.target.value);
                          setAiOrderParsed(
                            parseWhatsAppCustomerMessage({
                              rawText: aiOrderMessage,
                              senderPhone: e.target.value,
                              customers,
                              products,
                              company,
                            })
                          );
                        }}
                        placeholder="e.g. +91 94252 11223"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Incoming messages from numbers not in Customer Master automatically initiate the Lead Workflow.
                      </span>
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    2. Incoming WhatsApp Message Text
                  </label>
                  <textarea
                    rows={3}
                    value={aiOrderMessage}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setAiOrderMessage(txt);
                      setAiOrderParsed(
                        parseWhatsAppCustomerMessage({
                          rawText: txt,
                          senderPhone: aiOrderSenderPhone,
                          preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                          customers,
                          products,
                          company,
                        })
                      );
                    }}
                    placeholder='e.g. "MS Channel 125x65 Medium 20 MT chahiye" or "125x65 ka rate kya hai?"'
                    className="w-full p-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Preset Prompt Examples */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
                    Quick Test Messages (from Phase 3 Specification):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = '125x65 ka rate kya hai?';
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: aiOrderSenderPhone,
                            preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="text-emerald-700 font-mono">Ex 1:</span> &ldquo;125x65 ka rate kya hai?&rdquo;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = 'MS Channel 125x65 Medium 20 MT chahiye';
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: aiOrderSenderPhone,
                            preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="text-emerald-700 font-mono">Ex 2:</span> &ldquo;MS Channel 125x65 Medium 20 MT chahiye&rdquo;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = '125x65 channel 20 ton bhejna hai';
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: aiOrderSenderPhone,
                            preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="text-emerald-700 font-mono">Ex 3:</span> &ldquo;125x65 channel 20 ton bhejna hai&rdquo;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = '100x50 channel ka bhav kya hai?';
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: aiOrderSenderPhone,
                            preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      &ldquo;100x50 channel ka bhav kya hai?&rdquo;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = 'MS Joist 150x75 40 MT order karna hai';
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: aiOrderSenderPhone,
                            preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      &ldquo;Joist 150x75 40 MT order&rdquo;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = '75x40 channel 15 ton chahiye Raipur';
                        setAiOrderUseCustomPhone(true);
                        setAiOrderSenderPhone('+91 94252 11223');
                        setAiOrderMessage(msg);
                        setAiOrderParsed(
                          parseWhatsAppCustomerMessage({
                            rawText: msg,
                            senderPhone: '+91 94252 11223',
                            customers,
                            products,
                            company,
                          })
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      <span>New Lead: &ldquo;75x40 channel 15 ton&rdquo; (+91 94252 11223)</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAiOrderParsed(
                      parseWhatsAppCustomerMessage({
                        rawText: aiOrderMessage,
                        senderPhone: aiOrderSenderPhone,
                        preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                        customers,
                        products,
                        company,
                      })
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Parse & Extract WhatsApp Order Data</span>
                </button>
              </div>

              {/* Extraction Output Panel */}
              <div className="lg:col-span-6 space-y-4">
                {aiOrderParsed ? (
                  <AIWhatsAppOrderCard
                    parsed={aiOrderParsed}
                    company={company}
                    customers={customers}
                    products={products}
                    onSelectClarification={(actionText) => {
                      setAiOrderMessage(actionText);
                      setAiOrderParsed(
                        parseWhatsAppCustomerMessage({
                          rawText: actionText,
                          senderPhone: aiOrderSenderPhone,
                          preselectedCustomerId: aiOrderUseCustomPhone ? undefined : aiOrderSelectedCustomerId,
                          customers,
                          products,
                          company,
                        })
                      );
                    }}
                    onCreateEnquiry={(enq) => {
                      onCreateEnquiryFromWebhook(enq);
                      onLogMessage({
                        id: `msg-${Date.now()}`,
                        customerId: enq.customerId,
                        customerName: enq.customerName,
                        whatsappNumber: aiOrderSenderPhone,
                        type: 'received',
                        message: aiOrderMessage,
                        timestamp: new Date().toISOString(),
                        status: 'inbound',
                        source: 'simulated',
                        context: `AI WhatsApp Order Engine: ${enq.enquiryNumber}`,
                      });
                    }}
                    onNavigateToEnquiries={() => onNavigateTab && onNavigateTab('enquiries')}
                    onNavigateToOrders={() => onNavigateTab && onNavigateTab('orders')}
                    onNavigateToWhatsApp={() => {}}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs text-center">
                    Enter or select an incoming customer WhatsApp message on the left to view real-time NLP extraction.
                  </div>
                )}
              </div>
            </div>

            {/* Architecture & Verification Reference */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Nav Durga ERP Core Integration Rules (Phase 3 Verified)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">ERP Pricing Formula</div>
                  <div className="text-emerald-700 font-mono font-semibold mt-0.5">
                    Final Rate = Basic Rate + Gauge Difference
                  </div>
                  <div className="text-slate-500 mt-1">Single source of truth. Zero rate hallucination.</div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">Canonical Sections Count</div>
                  <div className="text-slate-800 font-semibold mt-0.5">
                    Medium: 13 products • Light: 9 products
                  </div>
                  <div className="text-slate-500 mt-1">Preserves 22 canonical active ERP products.</div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">Ambiguity Discipline</div>
                  <div className="text-slate-800 font-semibold mt-0.5">
                    Prompt Clarification Before Quoting
                  </div>
                  <div className="text-slate-500 mt-1">If section is unspecified (e.g. 125x65), asks Medium vs SL.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: WHATSAPP MANUAL TEST */}
      {activeStep === 'manual-test' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>WhatsApp Manual Test</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Test Target
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Safely test WhatsApp messaging formatting, click-to-chat links, and clipboard actions without customer impact.
                </p>
              </div>

              {/* Message preset selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Test Message:</span>
                <select
                  value={manualTestType}
                  onChange={(e) => setManualTestType(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="daily-update">Daily Price Update (Latest)</option>
                  <option value="product-update">Product Rate Sheet</option>
                  <option value="custom">Custom Test Message</option>
                </select>
              </div>
            </div>

            {/* Test Customer Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Test Customer</span>
                <span className="text-[11px] font-normal text-slate-400">Recipient used for all manual verification</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                    {testCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-slate-900">
                        {testCustomer.name}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {testCustomer.customerType}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        🏷️ {testCustomer.tag || 'WhatsApp Test'}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {testCustomer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 mt-2">
                      <div>
                        Company Name: <strong className="text-slate-800">{testCustomer.companyName}</strong>
                      </div>
                      <div className="flex items-center gap-1 font-mono font-bold text-emerald-800">
                        <span>WhatsApp Number: {testCustomer.whatsapp}</span>
                      </div>
                      <div>
                        Mobile Number: <strong className="font-mono text-slate-800">{testCustomer.mobile}</strong>
                      </div>
                      <div>
                        Location: <strong className="text-slate-800">{testCustomer.city}, {testCustomer.state}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToCustomer(testCustomer.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs"
                  >
                    View Customer Detail
                  </button>
                  <button
                    type="button"
                    onClick={handleManualTestOpenWhatsApp}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Message Preview and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Message Preview */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Message Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {manualTestMessage.length} characters
                    </span>
                    <button
                      type="button"
                      onClick={handleManualTestCopy}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      {testCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{testCopied ? 'Copied!' : 'Copy Message'}</span>
                    </button>
                  </div>
                </div>

                {manualTestType === 'custom' ? (
                  <textarea
                    rows={8}
                    value={manualTestCustomText}
                    onChange={(e) => setManualTestCustomText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 leading-relaxed shadow-2xs focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter custom test message here..."
                  />
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs h-72 overflow-y-auto">
                    {manualTestMessage}
                  </div>
                )}

                {/* Feedback Toast */}
                {testFeedback && (
                  <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{testFeedback}</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleManualTestOpenWhatsApp}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleManualTestCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors"
                  >
                    {testCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>Copy Message</span>
                  </button>
                </div>
              </div>

              {/* Right: Help note and summary */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-950 leading-relaxed">
                      <strong className="block text-blue-900 font-bold mb-1">Help Note:</strong>
                      This is a manual test using your browser or WhatsApp app. No automated messages are sent.
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    How Manual Testing Works
                  </span>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Click <strong>Open WhatsApp</strong> to launch a chat tab to <strong>+91 97521 83053</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>The message text is passed directly via WhatsApp URL intent.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Alternatively, click <strong>Copy Message</strong> and paste it into any chat.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: WHATSAPP TEST ACTIVITY */}
          <WhatsAppTestActivityTable
            activities={testActivities}
            onClear={handleClearActivities}
            onRefresh={() => setTestActivities(WhatsAppService.getActivities())}
          />
        </div>
      )}

      {/* SECTION: CUSTOM WHATSAPP POST (FESTIVALS, OFFERS, MARKETING & READY-MADE CREATIVES) */}
      {activeStep === 'custom-post' && (
        <CustomWhatsAppPostSection
          customers={customers}
          company={company}
          onNavigateToCustomer={onNavigateToCustomer}
        />
      )}

      {/* STEP 1: CREATE MESSAGE */}
      {activeStep === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 1: Select Broadcast Message Content</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the daily price update sheet, single product highlight, or custom message.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setMessageType('daily-update')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                messageType === 'daily-update'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Daily Price Update</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Full market rate sheet with post graphic generator for WhatsApp.
              </p>
            </div>

            <div
              onClick={() => setMessageType('product-update')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                messageType === 'product-update'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Single Product Update</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Specific steel product, grade, and technical specifications.
              </p>
            </div>

            <div
              onClick={() => setMessageType('custom')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                messageType === 'custom'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Custom Announcement</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Plant holiday, trailer booking notice, or custom rate discount.
              </p>
            </div>
          </div>

          {/* Conditional Options */}
          {messageType === 'daily-update' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Daily Price Sheet
              </label>
              <select
                value={selectedUpdateId}
                onChange={(e) => setSelectedUpdateId(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              >
                {dailyUpdates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.date} — {u.title} ({u.items.length} Products)
                  </option>
                ))}
              </select>
            </div>
          )}

          {messageType === 'product-update' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Product to Highlight
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.grade}) — ₹{p.currentPrice.toLocaleString('en-IN')}/{p.unit}
                  </option>
                ))}
              </select>
            </div>
          )}

          {messageType === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Message Text
              </label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300"
              />
            </div>
          )}

          {/* Preview Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Generated WhatsApp Text Preview
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {finalMessageText}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep('select')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <span>Next: Select Recipients ({selectedCustomerIds.length} selected)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT CUSTOMERS */}
      {activeStep === 'select' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Filter & Select Customers</h2>
              <p className="text-xs text-slate-500">
                Target contractors, builders, or wholesalers interested in steel grades.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(filteredCustomers)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Select All Filtered ({filteredCustomers.length})
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search firm, name, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            <div>
              <select
                value={customerFilterType}
                onChange={(e) => setCustomerFilterType(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700"
              >
                <option value="All">All Customer Types</option>
                <option value="Contractor">Contractor</option>
                <option value="Builder">Builder</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Fabricator">Fabricator</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>

            <div>
              <select
                value={customerFilterCity}
                onChange={(e) => setCustomerFilterCity(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700"
              >
                <option value="All">All Cities</option>
                <option value="Raipur">Raipur</option>
                <option value="Bhilai">Bhilai</option>
                <option value="Bilaspur">Bilaspur</option>
              </select>
            </div>

            <div>
              <select
                value={customerFilterProduct}
                onChange={(e) => setCustomerFilterProduct(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700"
              >
                <option value="All">Interested: All Products</option>
                <option value="TMT">Interested in TMT</option>
                <option value="Angle">Interested in Angles</option>
                <option value="Channel">Interested in Channels</option>
                <option value="Beam">Interested in Beams</option>
              </select>
            </div>
          </div>

          {/* Customers Selection Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">Select</th>
                  <th className="py-2.5 px-3">Company & Contact</th>
                  <th className="py-2.5 px-3">WhatsApp Number</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Interested Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCustomerIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => toggleCustomerSelection(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{c.companyName}</div>
                        <div className="text-[11px] text-slate-500">{c.name}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-700">
                        {c.whatsapp || c.mobile}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{c.customerType}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.city}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.interestedProducts?.slice(0, 2).map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep('create')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Back to Message
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('share')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <span>Proceed to Preview & Manual Share ({selectedCustomerIds.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & MANUAL SHARING */}
      {activeStep === 'share' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Step 3: Preview & Manual WhatsApp Broadcast
              </h2>
              <p className="text-xs text-slate-500">
                Test and send broadcast to {selectedCustomerIds.length} selected customers using WhatsApp web intent.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Graphic</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Testing Notice Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <span className="font-bold block mb-1">
              📱 Testing & Manual Workflow Active (No WhatsApp API Required):
            </span>
            Click <strong>&ldquo;Open WhatsApp&rdquo;</strong> next to any customer below to launch WhatsApp Web or Mobile click-to-chat with the pre-formatted rate sheet. The post image can be attached directly in chat. Every dispatched message is automatically logged into the customer&apos;s history.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Graphic & Text Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Square Post Image (1080 × 1080)
                </span>
                <div className="aspect-square max-w-[340px] mx-auto bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden shadow-xs p-1">
                  <canvas ref={canvasRef} className="w-full h-full object-contain rounded-xl" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  WhatsApp Message Body
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {finalMessageText}
                </div>
              </div>
            </div>

            {/* Right: Selected Customers Sharing Queue */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Customer Queue ({selectedCustomersList.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Click to open individual WhatsApp chat
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                {selectedCustomersList.length > 0 ? (
                  selectedCustomersList.map((customer) => {
                    const isSent = sentSuccessId === customer.id;
                    return (
                      <div
                        key={customer.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {customer.companyName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Rep: {customer.name} • {customer.city}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">
                            {customer.whatsapp || customer.mobile}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Logged
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSendToCustomer(customer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No customers selected. Go back to Step 2 to select recipients.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INBOUND WEBHOOK SIMULATOR */}
      {activeStep === 'simulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Future WhatsApp Customer Reply → ERP Webhook Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate customer WhatsApp replies (e.g. &ldquo;Need 20 ton Fe500D&rdquo;) converting into verified Sales Enquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Simulation Box */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Simulated Inbound Customer
                </label>
                <select
                  value={simCustomer}
                  onChange={(e) => setSimCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name} — {c.whatsapp})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Simulated WhatsApp Incoming Message Text
                </label>
                <textarea
                  rows={3}
                  value={simMessageText}
                  onChange={(e) => setSimMessageText(e.target.value)}
                  placeholder='e.g. "Need 20 ton Fe500D at Naya Raipur site #4"'
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300"
                />
              </div>

              {/* Preset quick test phrases */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Quick Test Messages:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSimMessageText('Need 20 ton Fe500D at Naya Raipur site #4')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    20 ton Fe500D
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessageText('Please quote for 35 ton Fe 550D trailer dispatch')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    35 ton Fe550D
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessageText('Checking 12 ton MS Angle 50x50x6 availability for Bilaspur')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    12 ton MS Angle
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Cpu className="w-4 h-4" />
                <span>Simulate Webhook & Parse Message</span>
              </button>
            </div>

            {/* Output Parsed Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Webhook Extraction Engine Output
              </span>

              {parsedData ? (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Identified Customer:</span>
                      <strong className="text-slate-900">{parsedData.detectedCustomer}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Identified Product:</span>
                      <strong className="text-blue-900">{parsedData.detectedProduct}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Identified Quantity:</span>
                      <strong className="text-slate-900 font-mono">
                        {parsedData.detectedQuantity} {parsedData.detectedUnit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Detected Intent:</span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 text-[10px]">
                        {parsedData.intent}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Parser Confidence:</span>
                      <span className="text-emerald-700 font-bold">{(parsedData.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateEnquiryFromSim}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Auto-Create Sales Enquiry in ERP</span>
                  </button>

                  {simulationResult && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-medium">
                      {simulationResult}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Click &ldquo;Simulate Webhook & Parse Message&rdquo; to test automated NLP / regex extraction.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
