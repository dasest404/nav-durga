import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Share2,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  MessageSquare,
  Users,
  Building2,
  Palette,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';
import {
  Product,
  DailyUpdate,
  Customer,
  SalesEnquiry,
  SalesOrder,
  CompanySettings,
  RateHistoryRecord,
  CompanyGradeBasicRates,
  CategoryBasicRates,
  AIAssistantMessage,
  RateUpdateProposalData,
  RateComparisonData,
  PricePostGeneratorData,
  AIAssistantAuditEntry,
  WhatsAppThemeName,
  ActiveTab,
  RateChargesConfig,
  SmartDropdownCategory,
  SmartDropdownAction,
} from '../types';
import { AIAssistantService, AssistantContext } from '../services/aiAssistantService';
import { PosterRenderer, POSTER_THEMES, PosterThemeDefinition } from '../services/posterRenderer';
import { WhatsAppService } from '../services/whatsappService';
import { AIWhatsAppOrderCard } from './AIWhatsAppOrderCard';
import { SmartDropdownMenu } from './SmartDropdownMenu';
import {
  CATEGORY_CONFIGS,
  DROPDOWN_ACTIONS,
  executeStructuredDropdownAction,
} from '../utils/aiDropdownHelper';

interface AIAssistantViewProps {
  products: Product[];
  rateHistory: RateHistoryRecord[];
  dailyUpdates: DailyUpdate[];
  company: CompanySettings;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  rateCharges?: RateChargesConfig;
  customers: Customer[];
  enquiries: SalesEnquiry[];
  orders: SalesOrder[];
  whatsAppConfig?: any;
  onApplyRateBatch: (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    newCharges?: RateChargesConfig,
    updatedGradeBasicRates?: CompanyGradeBasicRates,
    updatedCategoryBasicRates?: CategoryBasicRates
  ) => void;
  onSaveDailyUpdate: (update: DailyUpdate) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenDailyRatesForSection?: (
    category: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL',
    search?: string
  ) => void;
  onLogWhatsAppMessage?: (record: any) => void;
  onAddEnquiry?: (enquiry: Partial<SalesEnquiry>) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  products,
  rateHistory,
  dailyUpdates,
  company,
  categoryBasicRates,
  gradeBasicRates,
  rateCharges,
  customers,
  enquiries,
  orders,
  whatsAppConfig,
  onApplyRateBatch,
  onSaveDailyUpdate,
  onNavigateTab,
  onOpenDailyRatesForSection,
  onLogWhatsAppMessage,
  onAddEnquiry,
}) => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          `👋 **Namaste Virendra ji! I am the Nav Durga AI Assistant.**\n\n` +
          `I am directly connected to the Nav Durga Ispat ERP database. You can manage steel rates, generate WhatsApp price posters, compare market rates, or ask queries in **English or Hinglish**.\n\n` +
          `Use the **Smart Suggestions Menu** on the left to select any section (Medium, SL, Light, 5 KG, 8 KG) and perform daily rate operations, or type your instructions below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'general_chat',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileSmartMenu, setShowMobileSmartMenu] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AIAssistantAuditEntry[]>(() =>
    AIAssistantService.getAuditLogs()
  );
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Context bundle passed to AI service
  const assistantContext: AssistantContext = useMemo(
    () => ({
      products,
      rateHistory,
      dailyUpdates,
      company,
      categoryBasicRates,
      gradeBasicRates,
      customers,
      enquiries,
      orders,
    }),
    [
      products,
      rateHistory,
      dailyUpdates,
      company,
      categoryBasicRates,
      gradeBasicRates,
      customers,
      enquiries,
      orders,
    ]
  );

  // Send User Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isProcessing) return;

    const userMsg: AIAssistantMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await AIAssistantService.processMessage(
        text,
        [...messages, userMsg],
        assistantContext
      );
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('AI Assistant execution error:', err);
      const errorMsg: AIAssistantMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ An error occurred while processing your request. Please try again or rephrase your command.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Smart Dropdown Action Handler (Medium, SL, Light, 5 KG, 8 KG)
  const handleSelectSmartDropdownAction = (
    category: SmartDropdownCategory,
    action: SmartDropdownAction
  ) => {
    const meta = CATEGORY_CONFIGS[category];
    const actionObj = DROPDOWN_ACTIONS.find((a) => a.key === action);
    const userPrompt = `${meta.label} → ${actionObj?.label || action}`;

    const userMsg: AIAssistantMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantResponse = executeStructuredDropdownAction(
      category,
      action,
      assistantContext
    );

    setMessages((prev) => [...prev, userMsg, assistantResponse]);

    // Functionality: Enter Today's Price
    // When the user clicks [Category] → Enter Today's Price, open the existing Daily Price Update workflow with the section preselected
    if (action === 'ENTER_TODAYS_PRICE') {
      let searchParam = '';
      if (category === 'SL') searchParam = 'SL';
      else if (category === '5 KG') searchParam = '5 KG';
      else if (category === '8 KG') searchParam = '8 KG';

      if (onOpenDailyRatesForSection) {
        onOpenDailyRatesForSection(meta.section, searchParam);
      } else {
        onNavigateTab('daily-rates');
      }
    }
  };

  // Rate Update Proposal Confirmation Handler
  const handleConfirmRateUpdate = (messageId: string, proposal: RateUpdateProposalData) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    // 1. Build updated products list
    const updatedProducts: Product[] = products.map((prod) => {
      const match = proposal.previewItems.find((item) => item.id === prod.id);
      if (match) {
        const prevPrice = prod.currentPrice;
        const newPrice = match.proposedRate;
        const diff = newPrice - prevPrice;
        return {
          ...prod,
          baseRate: proposal.proposedBaseRate,
          finalRate: newPrice,
          currentPrice: newPrice,
          previousPrice: prevPrice,
          priceChange: diff,
          priceHistory: [
            {
              date: today,
              price: newPrice,
              changeReason: `AI Assistant Revision: ${proposal.section} set to ₹${proposal.proposedBaseRate}/MT`,
            },
            ...(prod.priceHistory || []),
          ],
        };
      }
      return prod;
    });

    // 2. Build Rate History Records
    const newHistoryRecords: RateHistoryRecord[] = proposal.previewItems.map((item) => ({
      id: `rh-${Date.now()}-${item.id}`,
      date: today,
      effectiveFrom: today,
      rateSource: proposal.companyUnit,
      productId: item.id,
      productCategory: item.name.split(' ')[0] || 'MS Steel',
      productName: item.name,
      size: item.size,
      gaugeType: item.grade,
      section: proposal.section,
      baseRate: proposal.proposedBaseRate,
      gaugeDifference: item.gaugeDifference,
      loadingCharge: 365,
      insuranceCharge: 30,
      otherCharges: 0,
      previousRate: item.currentPrice,
      finalRate: item.proposedRate,
      priceDifference: item.change,
      updatedBy: 'Nav Durga AI Assistant (Admin)',
      timestamp,
    }));

    // 3. Update Category & Grade Basic Rates
    const updatedCategoryRates: CategoryBasicRates = {
      ...(categoryBasicRates || {}),
      [proposal.section]: proposal.proposedBaseRate,
    };

    const updatedGradeRates: CompanyGradeBasicRates = {
      ...(gradeBasicRates || {}),
      [proposal.companyUnit]: {
        ...(gradeBasicRates?.[proposal.companyUnit] || {}),
        Medium: proposal.proposedBaseRate,
      },
    };

    // 4. Create Daily Update record
    const newDailyUpdate: DailyUpdate = {
      id: `upd-ai-${Date.now()}`,
      date: today,
      title: `${proposal.section} AI Rate Revision (${proposal.affectedProductsCount} items)`,
      remarks: `Automated price revision via Nav Durga AI Assistant. Basic rate set to ₹${proposal.proposedBaseRate.toLocaleString('en-IN')}/MT.`,
      status: 'Published',
      createdAt: timestamp,
      createdBy: 'Nav Durga AI Assistant',
      items: proposal.previewItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        grade: item.grade,
        price: item.proposedRate,
        previousPrice: item.currentPrice,
        unit: 'MT',
        availability: 'Available',
        changeNote:
          item.change > 0
            ? `+₹${item.change}/MT`
            : item.change < 0
            ? `-₹${Math.abs(item.change)}/MT`
            : 'Unchanged',
      })),
    };

    // 5. Apply to ERP state
    onApplyRateBatch(
      updatedProducts,
      newHistoryRecords,
      rateCharges,
      updatedGradeRates,
      updatedCategoryRates
    );
    onSaveDailyUpdate(newDailyUpdate);

    // 6. Record in persistent AI Audit Log
    const auditEntry = AIAssistantService.recordAudit({
      action: `Rate Update: ${proposal.section}`,
      initiatedBy: 'Virendra Patel (Admin)',
      section: proposal.section,
      details: `Basic Rate updated to ₹${proposal.proposedBaseRate.toLocaleString('en-IN')}/MT across ${proposal.affectedProductsCount} items.`,
      affectedCount: proposal.affectedProductsCount,
      status: 'Success',
    });
    setAuditLogs(AIAssistantService.getAuditLogs());

    // 7. Update message status to confirmed
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.rateProposal
          ? {
              ...msg,
              rateProposal: {
                ...msg.rateProposal,
                status: 'confirmed',
                auditId: auditEntry.id,
              },
            }
          : msg
      )
    );
  };

  // Rate Update Cancel Handler
  const handleCancelRateUpdate = (messageId: string, proposal: RateUpdateProposalData) => {
    AIAssistantService.recordAudit({
      action: `Rate Update Cancelled: ${proposal.section}`,
      initiatedBy: 'Virendra Patel (Admin)',
      section: proposal.section,
      details: `User declined proposed rate of ₹${proposal.proposedBaseRate.toLocaleString('en-IN')}/MT.`,
      affectedCount: proposal.affectedProductsCount,
      status: 'Cancelled',
    });
    setAuditLogs(AIAssistantService.getAuditLogs());

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.rateProposal
          ? {
              ...msg,
              rateProposal: {
                ...msg.rateProposal,
                status: 'cancelled',
              },
            }
          : msg
      )
    );
  };

  // Clear Chat History
  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. How may I assist you with Nav Durga ERP operations today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'general_chat',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-h-[960px] bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Nav Durga AI Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ERP Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">
              Natural Language Voice & Text Controls • English &amp; Hinglish • Raipur Steel Market
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audit Log Trigger */}
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="View AI Audit Log"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
              {auditLogs.length}
            </span>
          </button>

          {/* Help Guide */}
          <button
            type="button"
            onClick={() => setShowHelpGuide(!showHelpGuide)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Command Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Reset Chat */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Dropdown Suggestion Menu, Right Chat Stream */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Left Desktop Sidebar: Smart Dropdown Suggestion Menu (5 Categories Vertically Stacked, Accordion) */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto">
          <SmartDropdownMenu
            products={products}
            onSelectAction={handleSelectSmartDropdownAction}
            disabled={isProcessing}
          />
        </div>

        {/* Right Panel: Chat Stream & Controls */}
        <div className="flex-1 flex flex-col min-w-0 bg-white min-h-0">
          {/* Mobile / Tablet Compact Collapsible Smart Dropdown Menu */}
          <div className="lg:hidden border-b border-slate-200 bg-slate-50 p-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileSmartMenu((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Smart Section Suggestions (5 Categories)</span>
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[10px] font-bold">{showMobileSmartMenu ? 'Hide' : 'Open Menu'}</span>
                {showMobileSmartMenu ? (
                  <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>
            {showMobileSmartMenu && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 max-h-80 overflow-y-auto">
                <SmartDropdownMenu
                  products={products}
                  onSelectAction={(cat, act) => {
                    setShowMobileSmartMenu(false);
                    handleSelectSmartDropdownAction(cat, act);
                  }}
                  disabled={isProcessing}
                  isCompactHeader
                />
              </div>
            )}
          </div>

      {/* Collapsible Help Guide */}
      {showHelpGuide && (
        <div className="bg-blue-50/70 border-b border-blue-200 px-4 py-3 text-xs text-blue-900 shrink-0 animate-in slide-in-from-top-2">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h3 className="font-bold flex items-center gap-1.5 text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Nav Durga AI Assistant Natural Language Guide
              </h3>
              <p className="text-blue-800 mt-1">
                You can speak or type naturally in English and Hinglish. Common workflows:
              </p>
              <ul className="mt-1.5 space-y-1 list-disc list-inside text-blue-800">
                <li>
                  <strong>Rate Updates:</strong> &quot;Update Medium all products to 56922&quot; or &quot;Medium section ka rate 57000 kar do&quot;
                </li>
                <li>
                  <strong>Comparisons:</strong> &quot;Aaj aur kal ke rate mein kya difference hai?&quot; or &quot;Compare Medium and SL prices&quot;
                </li>
                <li>
                  <strong>WhatsApp Post:</strong> &quot;Create a price update post for 600 rupees increase per MT&quot;
                </li>
                <li>
                  <strong>Product &amp; ERP Queries:</strong> &quot;Show today&apos;s SL rates&quot; or &quot;Show all products whose prices changed today&quot;
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpGuide(false)}
              className="self-start text-blue-700 hover:text-blue-950 font-bold underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 max-w-4xl ${
              message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-300'
              }`}
            >
              {message.role === 'user' ? 'VP' : <Bot className="w-5 h-5 text-amber-300" />}
            </div>

            {/* Bubble */}
            <div
              className={`flex flex-col space-y-2 max-w-[88%] sm:max-w-[80%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {/* Render formatted text content */}
                <div className="whitespace-pre-wrap font-sans">
                  {renderFormattedMarkdown(message.content)}
                </div>
              </div>

              {/* Quick Choice Options if prompted */}
              {message.quickOptions && message.quickOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {message.quickOptions.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSendMessage(opt.actionText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
                    >
                      {opt.tag && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          {opt.tag}
                        </span>
                      )}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 font-medium px-1">
                {message.timestamp}
              </span>

              {/* INTERACTIVE CARD 1: Rate Update Proposal */}
              {message.rateProposal && (
                <RateUpdateProposalCard
                  messageId={message.id}
                  proposal={message.rateProposal}
                  onConfirm={(proposal) => handleConfirmRateUpdate(message.id, proposal)}
                  onCancel={(proposal) => handleCancelRateUpdate(message.id, proposal)}
                  onViewDailyRates={() => onNavigateTab('daily-rates')}
                />
              )}

              {/* INTERACTIVE CARD 2: Rate Comparison Report */}
              {message.comparisonData && (
                <RateComparisonCard comparison={message.comparisonData} />
              )}

              {/* INTERACTIVE CARD 3: AI Price Post Generator */}
              {message.pricePostData && (
                <AIPricePostCard
                  postData={message.pricePostData}
                  company={company}
                  customers={customers}
                  whatsAppConfig={whatsAppConfig}
                  onLogWhatsAppMessage={onLogWhatsAppMessage}
                  onNavigateToWhatsApp={() => onNavigateTab('whatsapp-center')}
                />
              )}

              {/* INTERACTIVE CARD 4: Phase 3 AI WhatsApp Customer Order & Enquiry Card */}
              {message.whatsAppOrderEnquiry && (
                <AIWhatsAppOrderCard
                  parsed={message.whatsAppOrderEnquiry}
                  company={company}
                  customers={customers}
                  products={products}
                  onSelectClarification={(actionText) => handleSendMessage(actionText)}
                  onCreateEnquiry={(enq) => {
                    if (onAddEnquiry) {
                      onAddEnquiry(enq);
                    }
                  }}
                  onNavigateToEnquiries={() => onNavigateTab('enquiries')}
                  onNavigateToOrders={() => onNavigateTab('orders')}
                  onNavigateToWhatsApp={() => onNavigateTab('whatsapp-center')}
                />
              )}

              {/* INTERACTIVE CARD 5: Tabular Query Results */}
              {message.queryResults && (
                <QueryResultsCard
                  results={message.queryResults}
                  onViewProducts={() => onNavigateTab('products')}
                  onViewCustomers={() => onNavigateTab('customers')}
                />
              )}
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-3 max-w-4xl mr-auto animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-200"></div>
              <span className="text-xs text-slate-500 font-medium ml-1">
                Analyzing ERP product &amp; price records...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask in English or Hinglish: e.g. Update Medium all products to 56922..."
              disabled={isProcessing}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Session: Virendra Patel (Admin). Bulk operations require confirmation.</span>
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
        </div>
      </div>

      {/* AUDIT LOG MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nav Durga AI Assistant Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable security log of all natural-language rate updates and operations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No AI-initiated rate changes recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Initiated by: {log.initiatedBy}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: Rate Update Proposal Card (Explicit Confirmation)
// =============================================================================
interface RateUpdateProposalCardProps {
  messageId: string;
  proposal: RateUpdateProposalData;
  onConfirm: (proposal: RateUpdateProposalData) => void;
  onCancel: (proposal: RateUpdateProposalData) => void;
  onViewDailyRates: () => void;
}

const RateUpdateProposalCard: React.FC<RateUpdateProposalCardProps> = ({
  proposal,
  onConfirm,
  onCancel,
  onViewDailyRates,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (proposal.status === 'confirmed') {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-xs mt-2 animate-in fade-in">
        <div className="flex items-center gap-2.5 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-emerald-950">
              Rate Update Confirmed &amp; Applied to ERP!
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Updated <strong>{proposal.affectedProductsCount} products</strong> in{' '}
              <strong>{proposal.section}</strong> to Basic Rate ₹
              {proposal.proposedBaseRate.toLocaleString('en-IN')}/MT.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-xs">
          <span className="text-emerald-700 text-[11px]">
            Audit ID: <code className="font-mono">{proposal.auditId || 'Recorded'}</code>
          </span>
          <button
            type="button"
            onClick={onViewDailyRates}
            className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline text-[11px]"
          >
            <span>View in Daily Rate Management</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  if (proposal.status === 'cancelled') {
    return (
      <div className="w-full bg-slate-100 border border-slate-300 rounded-2xl p-4 shadow-xs mt-2 text-slate-600 text-xs flex items-center gap-2">
        <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Rate revision cancelled by user. No database modifications were made.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-2 border-blue-600/40 rounded-2xl shadow-md overflow-hidden mt-2 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-300" />
          <span className="font-extrabold text-xs tracking-wider uppercase">
            {proposal.section} • {proposal.companyUnit}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
          Awaiting Approval
        </span>
      </div>

      {/* KPI Highlights */}
      <div className="p-4 bg-blue-50/40 border-b border-blue-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Target Section
          </span>
          <span className="text-sm font-extrabold text-slate-900">{proposal.section}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Proposed Basic Rate
          </span>
          <span className="text-base font-extrabold text-blue-700">
            ₹{proposal.proposedBaseRate.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-slate-500">/ MT</span>
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Affected Products
          </span>
          <span className="text-sm font-extrabold text-emerald-700">
            {proposal.affectedProductsCount} items
          </span>
        </div>
      </div>

      {/* Itemized Table Preview */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Itemized Final Rate Calculations (Final Rate = Basic Rate + Gauge Diff)
          </h5>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
          >
            <span>
              {isExpanded ? 'Collapse' : `Show all ${proposal.previewItems.length} products`}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2 px-3">Product / Size</th>
                <th className="py-2 px-2 text-right">Gauge Diff</th>
                <th className="py-2 px-2 text-right">Current Rate</th>
                <th className="py-2 px-3 text-right text-blue-800">New Final Rate</th>
                <th className="py-2 px-3 text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {(isExpanded ? proposal.previewItems : proposal.previewItems.slice(0, 4)).map(
                (item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.size} • {item.grade}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-600">
                      ₹{item.gaugeDifference.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-600">
                      ₹{item.currentPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-blue-700">
                      ₹{item.proposedRate.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        item.change > 0
                          ? 'text-emerald-700'
                          : item.change < 0
                          ? 'text-rose-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.change > 0
                        ? `+₹${item.change.toLocaleString('en-IN')}`
                        : item.change < 0
                        ? `-₹${Math.abs(item.change).toLocaleString('en-IN')}`
                        : '₹0'}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Security Warning Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Explicit Approval Mandated:</strong> Clicking &quot;Confirm &amp; Apply Rates to ERP&quot;
            will update live product records, append to Rate History, and create a published Daily Rate
            Revision entry.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onConfirm(proposal)}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm &amp; Apply Rates to ERP</span>
          </button>
          <button
            type="button"
            onClick={() => onCancel(proposal)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: Rate Comparison Card
// =============================================================================
interface RateComparisonCardProps {
  comparison: RateComparisonData;
}

const RateComparisonCard: React.FC<RateComparisonCardProps> = ({ comparison }) => {
  const [filterType, setFilterType] = useState<'all' | 'increased' | 'decreased'>('all');

  const filteredItems = useMemo(() => {
    if (filterType === 'increased') return comparison.items.filter((i) => i.difference > 0);
    if (filterType === 'decreased') return comparison.items.filter((i) => i.difference < 0);
    return comparison.items;
  }, [comparison.items, filterType]);

  const increasedCount = comparison.items.filter((i) => i.difference > 0).length;
  const decreasedCount = comparison.items.filter((i) => i.difference < 0).length;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mt-2">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="font-extrabold text-xs tracking-tight">{comparison.title}</h4>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
            +{increasedCount} Up
          </span>
          <span className="px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300">
            -{decreasedCount} Down
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products ({comparison.items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('increased')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'increased'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Increased ({increasedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('decreased')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'decreased'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Decreased ({decreasedCount})
          </button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2 px-3">Product Name &amp; Size</th>
                <th className="py-2 px-2 text-right">Yesterday / Benchmark</th>
                <th className="py-2 px-2 text-right">Today / Current</th>
                <th className="py-2 px-3 text-right">Difference (₹/MT)</th>
                <th className="py-2 px-3 text-right">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.size} {item.section ? `• ${item.section}` : ''}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    ₹{item.previousPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    ₹{item.currentPrice.toLocaleString('en-IN')}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-extrabold ${
                      item.difference > 0
                        ? 'text-emerald-700'
                        : item.difference < 0
                        ? 'text-rose-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.difference > 0
                      ? `+₹${item.difference.toLocaleString('en-IN')}`
                      : item.difference < 0
                      ? `-₹${Math.abs(item.difference).toLocaleString('en-IN')}`
                      : '₹0'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.percentChange > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.percentChange < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.percentChange > 0 ? `+${item.percentChange}%` : `${item.percentChange}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: AI Price Post Generator Card (Interactive Canvas & Themes)
// =============================================================================
interface AIPricePostCardProps {
  postData: PricePostGeneratorData;
  company: CompanySettings;
  customers: Customer[];
  whatsAppConfig?: any;
  onLogWhatsAppMessage?: (record: any) => void;
  onNavigateToWhatsApp?: () => void;
}

const AIPricePostCard: React.FC<AIPricePostCardProps> = ({
  postData,
  company,
  customers,
  whatsAppConfig,
  onLogWhatsAppMessage,
  onNavigateToWhatsApp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<WhatsAppThemeName>(postData.defaultTheme);
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5');
  const [layoutMode, setLayoutMode] = useState<'auto-split' | 'single-master'>('auto-split');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [tableFilter, setTableFilter] = useState<'current-page' | 'all'>('current-page');

  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadAllSuccess, setDownloadAllSuccess] = useState(false);

  // WhatsApp Broadcast state
  const [showBroadcastPanel, setShowBroadcastPanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Map previewItems into Product objects with finalRate = proposedPrice
  const mockProducts: Product[] = useMemo(() => {
    return postData.previewItems.map((item) => ({
      id: item.id,
      name: item.name,
      code: `P-${item.id}`,
      category: item.name.split(' ')[0] || 'MS Steel',
      grade: item.grade,
      unit: 'MT',
      currentPrice: item.proposedPrice,
      previousPrice: item.currentPrice,
      priceChange: item.change,
      minOrderQty: 10,
      description: 'Structural Steel',
      inStock: true,
      status: 'Active',
      size: item.size,
      gaugeDifference: item.gaugeDifference,
      finalRate: item.proposedPrice,
      baseRate: item.basicRate || postData.proposedBaseRate,
      rateSource: postData.companyUnit,
      section: item.section || postData.section,
      priceHistory: [],
    }));
  }, [postData]);

  // Compute pages for pagination
  const partitioned = useMemo(() => {
    return PosterRenderer.partitionProductsForPages(mockProducts, layoutMode, aspectRatio);
  }, [mockProducts, layoutMode, aspectRatio]);

  const totalPages = layoutMode === 'single-master' ? 1 : partitioned.pages.length;

  // Reset page index if out of bounds
  useEffect(() => {
    if (currentPageIndex >= totalPages) {
      setCurrentPageIndex(0);
    }
  }, [totalPages, currentPageIndex]);

  // Re-render poster canvas whenever theme, ratio, page, or products change
  useEffect(() => {
    if (canvasRef.current) {
      PosterRenderer.render(canvasRef.current, mockProducts, company, selectedTheme, {
        dateStr: postData.dateStr,
        aspectRatio,
        layoutMode,
        pageIndex: currentPageIndex,
        totalPages,
        sectionTitle: postData.section,
      });
    }
  }, [mockProducts, company, selectedTheme, aspectRatio, layoutMode, currentPageIndex, totalPages, postData]);

  // Download Current Canvas Image
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const pageSuffix = totalPages > 1 ? `_Page_${currentPageIndex + 1}_of_${totalPages}` : '';
    a.download = `NavDurga_${postData.section.replace(/\s+/g, '_')}${pageSuffix}_${postData.dateStr}.png`;
    a.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Download All Pages Sequentially
  const handleDownloadAllPages = async () => {
    setDownloadAllSuccess(true);
    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      const tempCanvas = document.createElement('canvas');
      PosterRenderer.render(tempCanvas, mockProducts, company, selectedTheme, {
        dateStr: postData.dateStr,
        aspectRatio,
        layoutMode,
        pageIndex: pIdx,
        totalPages,
        sectionTitle: postData.section,
      });
      const url = tempCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `NavDurga_${postData.section.replace(/\s+/g, '_')}_Page_${pIdx + 1}_of_${totalPages}_${postData.dateStr}.png`;
      a.click();
      await new Promise((r) => setTimeout(r, 350));
    }
    setTimeout(() => setDownloadAllSuccess(false), 3000);
  };

  // WhatsApp Broadcast Message Text
  const messageText = useMemo(() => {
    let msg = `*${company.companyName.toUpperCase()}*\n_${company.tagline}_\n\n`;
    msg += `📊 *DAILY STEEL PRICE UPDATE — ${postData.section}*\n`;
    msg += `📅 *Date:* ${postData.dateStr}\n`;
    if (postData.priceDelta > 0) {
      msg += `*BASIC RATE:* ₹${postData.proposedBaseRate.toLocaleString('en-IN')}/MT (+₹${postData.priceDelta.toLocaleString('en-IN')}/MT Revision)\n\n`;
    } else {
      msg += `*APPROVED BENCHMARK RATE:* ₹${postData.proposedBaseRate.toLocaleString('en-IN')}/MT\n\n`;
    }

    const itemsToList = postData.previewItems;
    itemsToList.forEach((item, idx) => {
      const gaugeStr = item.gaugeDifference > 0 ? ` (+₹${item.gaugeDifference.toLocaleString('en-IN')})` : '';
      msg += `${idx + 1}. *${item.name} (${item.size})*${gaugeStr}\n   👉 *₹${item.proposedPrice.toLocaleString('en-IN')}/MT*\n`;
    });

    msg += `\n📍 *Plant:* Urla Industrial Complex, Raipur, CG\n`;
    msg += `📞 *Hotline:* 9009544333 | 7000923464 | 9713144333\n`;
    msg += `_GST 18% Extra • Ex-Plant Urla • Single Source ERP Master_`;
    return msg;
  }, [company, postData]);

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Filter recipients
  const recipients = useMemo(() => {
    if (selectedGroup === 'wholesalers') {
      return customers.filter((c) => c.customerType === 'Wholesaler');
    }
    if (selectedGroup === 'contractors') {
      return customers.filter((c) => c.customerType === 'Contractor' || c.customerType === 'Builder');
    }
    if (selectedGroup === 'test') {
      return customers.filter((c) => c.customerType === 'Test Customer' || c.id === 'cust-test-01');
    }
    return customers;
  }, [customers, selectedGroup]);

  // Send WhatsApp Broadcast
  const handleBroadcastWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      recipients.forEach((cust) => {
        if (onLogWhatsAppMessage) {
          onLogWhatsAppMessage({
            id: `msg-broad-${Date.now()}-${cust.id}`,
            customerId: cust.id,
            customerName: cust.companyName,
            whatsappNumber: cust.whatsapp || cust.mobile,
            type: 'sent',
            message: messageText,
            timestamp: new Date().toISOString(),
            status: 'sent',
            source: 'api',
            context: `AI Price Broadcast: ${postData.section}`,
          });
        }
      });
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 5000);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Items to display in the table
  const currentPageItems = useMemo(() => {
    if (tableFilter === 'all' || layoutMode === 'single-master') {
      return postData.previewItems;
    }
    const currentProds = partitioned.pages[currentPageIndex] || [];
    return postData.previewItems.filter((item) => currentProds.some((p) => p.id === item.id));
  }, [tableFilter, layoutMode, postData.previewItems, partitioned.pages, currentPageIndex]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden mt-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <div>
            <h4 className="font-extrabold text-xs tracking-tight">
              AI Price Post Generator • {postData.section}
            </h4>
            <p className="text-[10px] text-slate-300">
              {postData.companyUnit} • {postData.previewItems.length} Products Loaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {postData.isConfirmedRates ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              ERP Approved Rates
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Proposed Revision (+₹{postData.priceDelta}/MT)
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Approved Themes Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Approved Corporate Steel Theme (7 Enterprise Designs):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POSTER_THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setSelectedTheme(th.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTheme === th.id
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{th.name.split('—')[1] || th.name}</span>
                  {selectedTheme === th.id && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{th.tagline}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Multi-Page Layout Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          {/* Aspect Ratio */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Aspect Ratio:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setAspectRatio('4:5')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  aspectRatio === '4:5'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4:5 Mobile Portrait
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1:1 Square Card
              </button>
            </div>
          </div>

          {/* Layout Mode (Auto-Split vs Single Page) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Pagination Mode:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setLayoutMode('auto-split')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'auto-split'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Auto-Split ({totalPages} Pages)
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('single-master')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'single-master'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Page
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Page Navigation Bar (when totalPages > 1) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-950">
                Multi-Page Preview: Page {currentPageIndex + 1} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-blue-900 border border-blue-300 hover:bg-blue-100 disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              {partitioned.pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    currentPageIndex === idx
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPageIndex === totalPages - 1}
                onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-blue-900 border border-blue-300 hover:bg-blue-100 disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Live Canvas Preview */}
        <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative max-w-sm sm:max-w-md w-full shadow-2xl rounded-xl overflow-hidden border border-slate-700">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block bg-slate-800"
              style={{ maxHeight: '440px', objectFit: 'contain' }}
            />
          </div>
          {totalPages > 1 && (
            <span className="text-[11px] font-bold text-slate-400 mt-2">
              Viewing Page {currentPageIndex + 1} of {totalPages} • Total {postData.previewItems.length} Products
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Downloaded!' : totalPages > 1 ? `Download Page ${currentPageIndex + 1}` : 'Download PNG'}</span>
          </button>

          {totalPages > 1 && (
            <button
              type="button"
              onClick={handleDownloadAllPages}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadAllSuccess ? 'Downloading All...' : `Download All ${totalPages} Pages`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'Copied Message!' : 'Copy WhatsApp Text'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBroadcastPanel(!showBroadcastPanel)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Broadcast WhatsApp</span>
          </button>
        </div>

        {/* Product Table Breakdown Section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
          <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              Product Master Rate Breakdown ({currentPageItems.length} items)
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTableFilter('current-page')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    tableFilter === 'current-page'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page {currentPageIndex + 1} Only
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('all')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    tableFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({postData.previewItems.length})
                </button>
              </div>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3 w-12 text-center">S.No.</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3 text-right">Gauge Difference</th>
                  <th className="py-2 px-3 text-right">Final Rate (₹/MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {currentPageItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500 font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{item.size}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {item.gaugeDifference > 0
                          ? `+₹${item.gaugeDifference.toLocaleString('en-IN')}`
                          : item.gaugeDifference < 0
                          ? `-₹${Math.abs(item.gaugeDifference).toLocaleString('en-IN')}`
                          : 'Base Rate'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-blue-900">
                      ₹{item.proposedPrice.toLocaleString('en-IN')}/MT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inline WhatsApp Broadcast Panel */}
        {showBroadcastPanel && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Select Recipient Customer Group for Broadcast
              </h5>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                {recipients.length} Recipients
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                  selectedGroup === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                All Customers ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup('wholesalers')}
                className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                  selectedGroup === 'wholesalers'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Wholesalers ({customers.filter((c) => c.customerType === 'Wholesaler').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup('contractors')}
                className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                  selectedGroup === 'contractors'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Contractors ({customers.filter((c) => c.customerType === 'Contractor' || c.customerType === 'Builder').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup('test')}
                className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                  selectedGroup === 'test'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Test Contact (1)
              </button>
            </div>

            {broadcastSent && (
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Price post dispatched to {recipients.length} recipients via WhatsApp!</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isSendingWhatsApp || recipients.length === 0}
                onClick={handleBroadcastWhatsApp}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Confirm &amp; Broadcast to {recipients.length} Contacts</span>
              </button>
              {onNavigateToWhatsApp && (
                <button
                  type="button"
                  onClick={onNavigateToWhatsApp}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-100 border border-emerald-300 cursor-pointer"
                >
                  Open WhatsApp Center
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: Tabular Query Results Card
// =============================================================================
interface QueryResultsCardProps {
  results: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
    totalCount: number;
  };
  onViewProducts: () => void;
  onViewCustomers: () => void;
}

const QueryResultsCard: React.FC<QueryResultsCardProps> = ({
  results,
  onViewProducts,
  onViewCustomers,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mt-2">
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
        <span className="font-extrabold text-xs">{results.title}</span>
        <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
          {results.totalCount} records
        </span>
      </div>

      <div className="border-t border-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
            <tr>
              {results.columns.map((col, idx) => (
                <th key={idx} className="py-2 px-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {results.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3 text-slate-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =============================================================================
// Helper: Simple Markdown Formatter
// =============================================================================
function renderFormattedMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Bold parsing
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={idx} className={line === '' ? 'h-2' : ''}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-extrabold text-slate-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={pIdx} className="italic text-slate-700">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        })}
      </div>
    );
  });
}
