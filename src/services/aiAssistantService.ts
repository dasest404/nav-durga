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
  AIAssistantIntent,
  RateUpdateProposalData,
  RateComparisonData,
  PricePostGeneratorData,
  AIAssistantAuditEntry,
  WhatsAppThemeName,
  WhatsAppOrderEnquiryParsed,
  SmartDropdownCategory,
  SmartDropdownAction,
} from '../types';
import { doesProductMatchSection, normalizeSectionKey } from '../utils/sectionPriceHelper';
import { normalizeGrade } from '../utils/rateCalculator';
import { PosterRenderer } from './posterRenderer';
import {
  parseWhatsAppCustomerMessage,
  extractSizeFromText,
} from '../utils/whatsappOrderHelper';
import { executeStructuredDropdownAction } from '../utils/aiDropdownHelper';

const AUDIT_STORAGE_KEY = 'navdurga_ai_audit_log_v1';

export interface AssistantContext {
  products: Product[];
  rateHistory: RateHistoryRecord[];
  dailyUpdates: DailyUpdate[];
  company: CompanySettings;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  customers: Customer[];
  enquiries: SalesEnquiry[];
  orders: SalesOrder[];
}

export class AIAssistantService {
  /**
   * Persistent Audit Log Management
   */
  static getAuditLogs(): AIAssistantAuditEntry[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as AIAssistantAuditEntry[];
    } catch (e) {
      console.error('Error reading AI audit logs:', e);
      return [];
    }
  }

  static recordAudit(entry: Omit<AIAssistantAuditEntry, 'id' | 'timestamp'>): AIAssistantAuditEntry {
    try {
      const fullEntry: AIAssistantAuditEntry = {
        ...entry,
        id: `ai-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
      };
      const current = this.getAuditLogs();
      const updated = [fullEntry, ...current].slice(0, 100);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      }
      return fullEntry;
    } catch (e) {
      console.error('Error recording AI audit:', e);
      return {
        id: `ai-audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };
    }
  }

  /**
   * Executes a smart dropdown action directly with verified ERP data
   */
  static executeDropdownAction(
    category: SmartDropdownCategory,
    action: SmartDropdownAction,
    context: AssistantContext
  ): AIAssistantMessage {
    return executeStructuredDropdownAction(category, action, context);
  }

  /**
   * Main Process Message Entrypoint
   * Attempts to query backend /api/assistant/chat (powered by Gemini 3.8 Flash),
   * with graceful fallback to the built-in industrial ERP semantic engine.
   */
  static async processMessage(
    userText: string,
    history: AIAssistantMessage[],
    context: AssistantContext
  ): Promise<AIAssistantMessage> {
    const trimmed = userText.trim();
    const messageId = `msg-${Date.now()}`;

    // 1. Try server-side Gemini endpoint
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: history.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            companyName: context.company.companyName,
            productsSummary: context.products.map((p) => ({
              id: p.id,
              name: p.name,
              size: p.size,
              grade: p.grade,
              section: p.section,
              currentPrice: p.currentPrice,
              previousPrice: p.previousPrice,
              gaugeDifference: p.gaugeDifference,
              rateSource: p.rateSource,
            })),
            categoryBasicRates: context.categoryBasicRates,
            rateHistoryCount: context.rateHistory.length,
            customersCount: context.customers.length,
            enquiriesCount: context.enquiries.length,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.reply) {
          // If Gemini identified an intent, combine with verified ERP data
          if (json.intent === 'rate_update_proposal' && json.proposedRate) {
            const proposal = this.buildRateUpdateProposal(
              json.section || 'MEDIUM SECTION',
              Number(json.proposedRate),
              context
            );
            return {
              id: messageId,
              role: 'assistant',
              content: json.reply,
              timestamp: new Date().toISOString(),
              intent: 'rate_update_proposal',
              rateProposal: proposal,
            };
          }

          if (json.intent === 'price_post_generator') {
            if (!json.section || json.section === 'null') {
              const delta = Number(json.priceDelta || 0);
              return {
                id: messageId,
                role: 'assistant',
                content:
                  json.reply ||
                  `🎨 **Which section would you like to create the price post for?**\n\n` +
                  `Please select an active ERP section below to retrieve approved product rates from the Product Master:`,
                timestamp: new Date().toISOString(),
                intent: 'price_post_generator',
                quickOptions: [
                  {
                    label: 'Medium Section (13 products)',
                    actionText: delta > 0 ? `Create a Medium price update post for ${delta} rupees increase per MT` : 'Create a price update post for Medium',
                    tag: 'Nav Durga',
                  },
                  {
                    label: 'SL / Super Light Section (9 products)',
                    actionText: delta > 0 ? `Create a SL price update post for ${delta} rupees increase per MT` : "Create today's SL price update post",
                    tag: 'Unit-2',
                  },
                  {
                    label: 'Medium & SL Sections (22 products)',
                    actionText: delta > 0 ? `Create today's Medium and SL price update post for ${delta} rupees increase per MT` : "Create today's Medium and SL price update post",
                    tag: 'Combined',
                  },
                  {
                    label: 'All Products Catalog',
                    actionText: 'Create a WhatsApp price update image for all products',
                    tag: 'All',
                  },
                ],
              };
            }

            const delta = Number(json.priceDelta || 0);
            const postData = this.buildPricePostData(
              json.section,
              delta,
              json.direction || (delta > 0 ? 'increase' : 'set'),
              context
            );
            return {
              id: messageId,
              role: 'assistant',
              content: json.reply,
              timestamp: new Date().toISOString(),
              intent: 'price_post_generator',
              pricePostData: postData,
            };
          }

          if (json.intent === 'rate_comparison') {
            const comp = this.buildRateComparison(trimmed, context);
            return {
              id: messageId,
              role: 'assistant',
              content: json.reply,
              timestamp: new Date().toISOString(),
              intent: 'rate_comparison',
              comparisonData: comp,
            };
          }

          if (json.intent === 'whatsapp_order_enquiry') {
            const phoneMatch = trimmed.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);
            const senderPhone = phoneMatch ? phoneMatch[0] : (context.customers[0]?.whatsapp || '+91 97521 83053');
            const parsedOrder = parseWhatsAppCustomerMessage({
              rawText: trimmed,
              senderPhone,
              customers: context.customers,
              products: context.products,
              company: context.company,
            });
            return {
              id: messageId,
              role: 'assistant',
              content: json.reply || parsedOrder.generatedResponse,
              timestamp: new Date().toISOString(),
              intent: 'whatsapp_order_enquiry',
              whatsAppOrderEnquiry: parsedOrder,
            };
          }

          if (json.serverError || json.intent === 'general_chat') {
            const localResult = this.parseLocally(trimmed, context, messageId);
            if (localResult.intent && localResult.intent !== 'general_chat') {
              return localResult;
            }
          }

          return {
            id: messageId,
            role: 'assistant',
            content: json.reply,
            timestamp: new Date().toISOString(),
            intent: json.intent || 'general_chat',
          };
        }
      }
    } catch {
      // Backend not running or unreachable: seamlessly proceed to local NLP parser
    }

    // 2. Local Industrial Rule & NLP Engine (100% reliable, zero-latency)
    return this.parseLocally(trimmed, context, messageId);
  }

  /**
   * Deterministic Semantic Engine for Nav Durga ERP (English & Hinglish)
   */
  private static parseLocally(
    query: string,
    context: AssistantContext,
    messageId: string
  ): AIAssistantMessage {
    const lower = query.toLowerCase().trim();

    // -------------------------------------------------------------------------
    // SMART DROPDOWN ACTIONS: Medium, SL, Light, 5 KG, 8 KG x 5 Actions
    // Patterns e.g. "Medium → Enter Today's Price", "ACTION = ENTER_TODAYS_PRICE SECTION = MEDIUM",
    // "SL → Compare Old vs. New Price", "Light → View Today's Price"
    // -------------------------------------------------------------------------
    let detectedDropdownCategory: SmartDropdownCategory | null = null;
    let detectedDropdownAction: SmartDropdownAction | null = null;

    // 1. Check Category
    if (lower.includes('5 kg') || lower.includes('5kg')) {
      detectedDropdownCategory = '5 KG';
    } else if (lower.includes('8 kg') || lower.includes('8kg')) {
      detectedDropdownCategory = '8 KG';
    } else if (lower.includes('super light') || (lower.includes('sl') && !lower.includes('isl'))) {
      detectedDropdownCategory = 'SL';
    } else if (lower.includes('light')) {
      detectedDropdownCategory = 'LIGHT';
    } else if (lower.includes('medium')) {
      detectedDropdownCategory = 'MEDIUM';
    }

    // 2. Check Action
    if (
      lower.includes('enter today') ||
      lower.includes('enter_todays_price') ||
      (lower.includes('enter') && lower.includes('price'))
    ) {
      detectedDropdownAction = 'ENTER_TODAYS_PRICE';
    } else if (
      lower.includes('compare old') ||
      lower.includes('old vs new') ||
      lower.includes('old vs. new') ||
      lower.includes('compare_old_new_price')
    ) {
      detectedDropdownAction = 'COMPARE_OLD_NEW_PRICE';
    } else if (
      lower.includes("view today's price") ||
      lower.includes("view todays price") ||
      lower.includes("view_todays_price") ||
      (lower.includes('view') && lower.includes('today'))
    ) {
      detectedDropdownAction = 'VIEW_TODAYS_PRICE';
    } else if (
      lower.includes('view previous') ||
      lower.includes('previous price') ||
      lower.includes('view_previous_price') ||
      lower.includes('purana rate') ||
      lower.includes('pichla rate')
    ) {
      detectedDropdownAction = 'VIEW_PREVIOUS_PRICE';
    } else if (
      lower.includes('price change history') ||
      lower.includes('view_price_change_history') ||
      (lower.includes('history') && (lower.includes('price') || lower.includes('rate')))
    ) {
      detectedDropdownAction = 'VIEW_PRICE_CHANGE_HISTORY';
    }

    if (detectedDropdownCategory && detectedDropdownAction) {
      return executeStructuredDropdownAction(detectedDropdownCategory, detectedDropdownAction, context);
    }

    // -------------------------------------------------------------------------
    // PHASE 3: AI WhatsApp Customer Order & Enquiry Management
    // Examples:
    // - "125x65 ka rate kya hai?" (Simple rate enquiry)
    // - "MS Channel 125x65 Medium 20 MT chahiye" (Product requirement)
    // - "125x65 channel 20 ton bhejna hai" (Hinglish product requirement / clarification)
    // - "100x50 channel ka bhav kya hai?"
    // - "Customer sent: 125x65 channel 20 ton bhejna hai"
    // -------------------------------------------------------------------------
    const detectedSizeInQuery = extractSizeFromText(query);
    const isCustomerWhatsAppEnquiry =
      lower.includes('ka rate kya hai') ||
      lower.includes('rate kya hai') ||
      lower.includes('kya rate hai') ||
      lower.includes('bhav kya hai') ||
      lower.includes('bhao kya hai') ||
      lower.includes('chahiye') ||
      lower.includes('bhejna hai') ||
      lower.includes('bhejna') ||
      lower.includes('customer sent') ||
      (detectedSizeInQuery &&
        (lower.includes('bhav') || lower.includes('bhao') || lower.includes('rate') || lower.includes('ton') || lower.includes('mt')) &&
        !lower.includes('update') &&
        !lower.includes('post') &&
        !lower.includes('increase'));

    if (isCustomerWhatsAppEnquiry) {
      // Extract optional phone number from query e.g. +91 97521 83053 or 9827100000
      const phoneMatch = query.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);
      const senderPhone = phoneMatch ? phoneMatch[0] : (context.customers[0]?.whatsapp || '+91 97521 83053');

      const parsedOrder = parseWhatsAppCustomerMessage({
        rawText: query,
        senderPhone,
        customers: context.customers,
        products: context.products,
        company: context.company,
      });

      // Quick options for interactive follow-up
      const quickOptions: { label: string; actionText: string; tag?: string }[] = [];

      if (parsedOrder.productMatch.status === 'needs_clarification' && parsedOrder.productMatch.clarificationOptions) {
        parsedOrder.productMatch.clarificationOptions.forEach((opt) => {
          quickOptions.push({
            label: opt.product.grade || opt.product.gaugeType || 'Option',
            actionText: `MS Channel ${opt.product.size} ${opt.product.grade || opt.product.gaugeType || 'Medium'} ${parsedOrder.quantity || 20} MT chahiye`,
            tag: opt.product.section === 'LIGHT SECTION' ? 'Unit-2' : 'Nav Durga',
          });
        });
      } else if (parsedOrder.intent === 'rate_enquiry' && parsedOrder.productMatch.product) {
        const p = parsedOrder.productMatch.product;
        quickOptions.push(
          {
            label: `Order 20 MT ${p.name} ${p.size}`,
            actionText: `${p.name} ${p.size} ${p.grade || 'Medium'} 20 MT chahiye`,
            tag: 'Order',
          },
          {
            label: `Generate Price Post for ${p.section || 'Medium'}`,
            actionText: `Create a price update post for ${p.section === 'LIGHT SECTION' ? 'SL' : 'Medium'}`,
            tag: 'Poster',
          }
        );
      }

      return {
        id: messageId,
        role: 'assistant',
        content: parsedOrder.generatedResponse,
        timestamp: new Date().toISOString(),
        intent: 'whatsapp_order_enquiry',
        whatsAppOrderEnquiry: parsedOrder,
        quickOptions: quickOptions.length > 0 ? quickOptions : undefined,
      };
    }

    // -------------------------------------------------------------------------
    // 1. Natural Language Rate Updates (e.g. "Update Medium all products to 56922", "Update all Medium products to 56922", "Medium section ka rate 57000 kar do")
    // -------------------------------------------------------------------------
    const rateUpdatePattern =
      /(?:update|change|set|karo|kar\s*do|badlo|badhao)\s+.*?(medium|light|sl|super\s*light|all).*?(?:to|pe|par|rate|price)?\s*[:=]?\s*(\d{4,6})/i;
    const rateUpdatePatternAlt =
      /(?:update|change|set)\s+(?:all\s+)?(medium|light|sl|super\s*light)?.*?products?\s+(?:to\s+)?(\d{4,6})/i;
    const rateUpdatePatternHinglish =
      /(medium|light|sl|super\s*light).*?(?:rate|price|bhav).*?(\d{4,6})\s*(?:karo|kar\s*do|set)/i;

    let updateMatch = query.match(rateUpdatePattern) || query.match(rateUpdatePatternAlt) || query.match(rateUpdatePatternHinglish);

    // If query says "Update Medium all products to 56922" or "Update all Medium products to 56922"
    if (!updateMatch) {
      const explicitNum = query.match(/(\d{5,6})/);
      if (explicitNum && (lower.includes('update') || lower.includes('kar do') || lower.includes('change'))) {
        let sec = 'MEDIUM SECTION';
        if (lower.includes('light')) sec = 'LIGHT SECTION';
        updateMatch = [query, sec, explicitNum[1]];
      }
    }

    if (updateMatch) {
      let targetSection = 'MEDIUM SECTION';
      const secCandidate = (updateMatch[1] || '').toLowerCase();
      if (secCandidate.includes('light')) {
        targetSection = 'LIGHT SECTION';
      } else if (secCandidate.includes('sl') || secCandidate.includes('super')) {
        targetSection = 'MEDIUM SECTION'; // SL products belong to Medium Section mill
      }

      const proposedRate = parseInt(updateMatch[2], 10);
      if (!isNaN(proposedRate) && proposedRate > 10000 && proposedRate < 200000) {
        const proposal = this.buildRateUpdateProposal(targetSection, proposedRate, context);

        const companyName =
          targetSection === 'LIGHT SECTION'
            ? 'UNIT-2 — NS ISPAT (I) PVT. LTD.'
            : 'NAVDURGA ISPAT PVT. LTD.';

        const content =
          `I have prepared the rate revision proposal for **${targetSection}** (${companyName}).\n\n` +
          `• **Proposed Basic Rate:** ₹${proposedRate.toLocaleString('en-IN')}/MT\n` +
          `• **Affected Products Count:** ${proposal.affectedProductsCount} items\n` +
          `• **Formula Applied:** Final Rate = Basic Rate + Gauge Difference\n\n` +
          `⚠️ **Confirmation Required:** Please review the itemized rate breakdown below. No changes will be saved until you click **Confirm & Apply Rates to ERP**.`;

        return {
          id: messageId,
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
          intent: 'rate_update_proposal',
          rateProposal: proposal,
        };
      }
    }

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // 2. AI Price Post Generator (e.g. "Create a price update post for 600 rupees increase per MT", "Medium ka rate 600 rupees increase hua hai, post banao", "Create today's Medium and SL price update post")
    // -------------------------------------------------------------------------
    const isPricePostQuery =
      (lower.includes('post') ||
        lower.includes('image') ||
        lower.includes('graphic') ||
        lower.includes('poster') ||
        lower.includes('banner') ||
        lower.includes('card')) &&
      (lower.includes('price') ||
        lower.includes('rate') ||
        lower.includes('bhav') ||
        lower.includes('increase') ||
        lower.includes('banao') ||
        lower.includes('create') ||
        lower.includes('generate') ||
        lower.includes('update') ||
        lower.includes('rupees') ||
        lower.includes('whatsapp'));

    if (isPricePostQuery) {
      // 1. Identify Section
      let targetSection: string | null = null;
      if (
        (lower.includes('medium') && (lower.includes('sl') || lower.includes('light') || lower.includes('super light'))) ||
        lower.includes('medium and sl') ||
        lower.includes('medium aur sl') ||
        lower.includes('both')
      ) {
        targetSection = 'MEDIUM & SL';
      } else if (
        lower.includes('all product') ||
        lower.includes('all products') ||
        lower.includes('sab product') ||
        lower.includes('sabhi product') ||
        lower.includes('full catalog')
      ) {
        targetSection = 'ALL PRODUCTS';
      } else if (lower.includes('medium')) {
        targetSection = 'MEDIUM SECTION';
      } else if (lower.includes('sl') || lower.includes('super light') || lower.includes('light')) {
        targetSection = 'SL / LIGHT SECTION';
      }

      // 2. Extract price delta if any
      let delta = 0;
      let direction: 'increase' | 'decrease' | 'set' = 'set';
      const deltaMatch = query.match(/(\d+)\s*(?:rupees|rs|inr|\/\s*mt|\+|increase|badh)/i);
      if (deltaMatch && parseInt(deltaMatch[1], 10) > 0 && parseInt(deltaMatch[1], 10) < 50000) {
        delta = parseInt(deltaMatch[1], 10);
        direction = lower.includes('decrease') || lower.includes('kam') || lower.includes('ghat') ? 'decrease' : 'increase';
      }

      // 3. If section is NOT specified, ask which section they want
      if (!targetSection) {
        return {
          id: messageId,
          role: 'assistant',
          content:
            `🎨 **Which section would you like to create the price post for?**\n\n` +
            `To populate the graphic using approved ERP Product Master rates${delta > 0 ? ` with the ₹${delta.toLocaleString('en-IN')}/MT increase` : ''}, please select one of the active mill sections below:`,
          timestamp: new Date().toISOString(),
          intent: 'price_post_generator',
          quickOptions: [
            {
              label: 'Medium Section (13 products)',
              actionText: delta > 0 ? `Create a Medium price update post for ${delta} rupees increase per MT` : 'Create a price update post for Medium',
              tag: 'Nav Durga',
            },
            {
              label: 'SL / Super Light Section (9 products)',
              actionText: delta > 0 ? `Create a SL price update post for ${delta} rupees increase per MT` : "Create today's SL price update post",
              tag: 'Unit-2',
            },
            {
              label: 'Medium & SL Sections (22 products)',
              actionText: delta > 0 ? `Create today's Medium and SL price update post for ${delta} rupees increase per MT` : "Create today's Medium and SL price update post",
              tag: 'Combined',
            },
            {
              label: 'All Products Catalog',
              actionText: 'Create a WhatsApp price update image for all products',
              tag: 'All',
            },
          ],
        };
      }

      // 4. Build price post data with verified ERP data
      const postData = this.buildPricePostData(targetSection, delta, direction, context);

      const content =
        `🎨 **AI Price Post Generated Successfully!**\n\n` +
        `I have created a high-resolution daily price broadcast graphic for **${postData.section}** (${postData.companyUnit})${
          delta > 0 ? ` reflecting **+₹${delta.toLocaleString('en-IN')}/MT** increase` : ` using **latest approved ERP rates**`
        }.\n\n` +
        `• **Active Products Loaded:** ${postData.previewItems.length} products directly from Product Master\n` +
        `• **Calculated Benchmark Rate:** ₹${postData.proposedBaseRate.toLocaleString('en-IN')}/MT\n` +
        `• **Theme Engine:** 7 approved corporate steel styles ready for live preview\n` +
        `• **Multi-Page Ready:** ${postData.totalPages && postData.totalPages > 1 ? `Divided into ${postData.totalPages} pages for optimal readability` : 'Single High-Definition Page'}\n\n` +
        `Preview your graphic below, select an approved theme, download PNG files, or broadcast directly via WhatsApp.`;

      return {
        id: messageId,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        intent: 'price_post_generator',
        pricePostData: postData,
      };
    }

    // -------------------------------------------------------------------------
    // 3. Rate Comparison (e.g. "Aaj aur kal ke rate mein kya difference hai?", "Compare today's and yesterday's rates", "Compare Medium and SL prices", "Show price changes for the last 7 days")
    // -------------------------------------------------------------------------
    if (
      lower.includes('difference') ||
      lower.includes('difference hai') ||
      lower.includes('compare') ||
      lower.includes('tulna') ||
      lower.includes('aaj aur kal') ||
      lower.includes('yesterday') ||
      lower.includes('last 7 days') ||
      (lower.includes('changed') && lower.includes('today'))
    ) {
      const comparison = this.buildRateComparison(query, context);

      let content = `📊 **${comparison.title}**\n\n${comparison.summary}\n\n`;
      if (comparison.isMissingData) {
        content += `ℹ️ _Note: ${comparison.missingDataReason}_\n\n`;
      }
      content += `See the full product-by-product comparison table below:`;

      return {
        id: messageId,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        intent: 'rate_comparison',
        comparisonData: comparison,
      };
    }

    // -------------------------------------------------------------------------
    // 4. Products Queries: "Show today's SL rates" / "Show all products whose prices changed today"
    // -------------------------------------------------------------------------
    if (
      (lower.includes('show') || lower.includes('dikhaye') || lower.includes('batao') || lower.includes('list')) &&
      (lower.includes('sl') || lower.includes('super light'))
    ) {
      const slItems = context.products.filter(
        (p) =>
          p.status === 'Active' &&
          (p.grade === 'SL' ||
            p.type === 'Super light' ||
            p.gaugeType === 'SL' ||
            p.name.toLowerCase().includes('sl'))
      );

      const rows = slItems.map((p) => [
        p.name,
        p.size || 'Standard',
        p.grade || 'SL',
        `₹${(p.gaugeDifference || 0).toLocaleString('en-IN')}`,
        `₹${(p.finalRate ?? p.currentPrice).toLocaleString('en-IN')}/MT`,
        p.rateSource || 'NAV DURGA ISPAT PVT. LTD.',
      ]);

      const avgRate = Math.round(
        slItems.reduce((acc, p) => acc + (p.finalRate ?? p.currentPrice), 0) / (slItems.length || 1)
      );

      return {
        id: messageId,
        role: 'assistant',
        content:
          `⚡ **Today's Super Light (SL) Rates:**\n\n` +
          `Found **${slItems.length} active SL products** from Nav Durga Ispat.\n` +
          `• **Average SL Benchmark Rate:** ₹${avgRate.toLocaleString('en-IN')}/MT\n` +
          `• **Base Gauge Diff:** Standard ₹0 to ₹300/MT offset\n\n` +
          `Here is the active price sheet for SL products:`,
        timestamp: new Date().toISOString(),
        intent: 'query_products',
        queryResults: {
          title: "Today's Super Light (SL) Rates",
          columns: ['Product Name', 'Size', 'Grade', 'Gauge Diff', 'Final Rate', 'Mill / Source'],
          rows,
          totalCount: slItems.length,
        },
      };
    }

    if (
      lower.includes('prices changed today') ||
      lower.includes('rate changed today') ||
      (lower.includes('change') && lower.includes('today'))
    ) {
      const changedItems = context.products.filter((p) => (p.priceChange || 0) !== 0);

      const rows = (changedItems.length > 0 ? changedItems : context.products.slice(0, 10)).map((p) => [
        p.name,
        p.size || '-',
        p.section || 'MEDIUM SECTION',
        `₹${(p.previousPrice || p.currentPrice).toLocaleString('en-IN')}`,
        `₹${p.currentPrice.toLocaleString('en-IN')}`,
        p.priceChange > 0
          ? `+₹${p.priceChange.toLocaleString('en-IN')}`
          : p.priceChange < 0
          ? `-₹${Math.abs(p.priceChange).toLocaleString('en-IN')}`
          : 'Stable',
      ]);

      return {
        id: messageId,
        role: 'assistant',
        content:
          changedItems.length > 0
            ? `📈 **${changedItems.length} Products Changed Price Today:**\n\nAll modifications are recorded in the ERP audit timeline.`
            : `ℹ️ **No price revisions have been recorded today yet.**\n\nShowing the current benchmark rates across active products:`,
        timestamp: new Date().toISOString(),
        intent: 'query_products',
        queryResults: {
          title: changedItems.length > 0 ? 'Products Changed Today' : 'Current Steel Price Master',
          columns: ['Product Name', 'Size', 'Section', 'Yesterday', 'Today', 'Net Change'],
          rows,
          totalCount: changedItems.length > 0 ? changedItems.length : context.products.length,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 5. Customer & Commercial Queries
    // -------------------------------------------------------------------------
    if (lower.includes('customer') || lower.includes('grahak') || lower.includes('client')) {
      const total = context.customers.length;
      const wholesalers = context.customers.filter((c) => c.customerType === 'Wholesaler').length;
      const contractors = context.customers.filter((c) => c.customerType === 'Contractor').length;

      const rows = context.customers.slice(0, 8).map((c) => [
        c.companyName,
        c.city,
        c.customerType,
        c.whatsapp || c.mobile,
        c.status,
      ]);

      return {
        id: messageId,
        role: 'assistant',
        content:
          `👥 **Customer Master Overview:**\n\n` +
          `• **Total Registered Accounts:** ${total}\n` +
          `• **Wholesalers / Stockists:** ${wholesalers}\n` +
          `• **Builders & Contractors:** ${contractors}\n` +
          `• **Test Broadcast Customer:** Nav Durga Test Customer (+91 97521 83053)\n\n` +
          `Here is a preview of the active customer directory:`,
        timestamp: new Date().toISOString(),
        intent: 'query_customers',
        queryResults: {
          title: 'Customer Directory Summary',
          columns: ['Company Name', 'City', 'Type', 'WhatsApp / Phone', 'Status'],
          rows,
          totalCount: total,
        },
      };
    }

    if (lower.includes('enquiry') || lower.includes('enquiries') || lower.includes('inquiry')) {
      const pending = context.enquiries.filter((e) => e.status === 'New' || e.status === 'Quoted');
      const rows = pending.slice(0, 6).map((e) => [
        e.enquiryNumber,
        e.customerName,
        e.product,
        `${e.quantity} ${e.unit}`,
        `₹${(e.quotedPrice || 0).toLocaleString('en-IN')}`,
        e.status,
      ]);

      return {
        id: messageId,
        role: 'assistant',
        content:
          `📋 **Sales Enquiries Status:**\n\n` +
          `• **Active / Pending Enquiries:** ${pending.length}\n` +
          `• **Total Logged Pipeline:** ${context.enquiries.length}\n\n` +
          `Here are the latest pending enquiries requiring follow-up:`,
        timestamp: new Date().toISOString(),
        intent: 'query_enquiries',
        queryResults: {
          title: 'Pending Enquiries',
          columns: ['Enquiry #', 'Customer', 'Product', 'Quantity', 'Quoted Rate', 'Status'],
          rows,
          totalCount: pending.length,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 6. General / Conversational Greeting & Capabilities
    // -------------------------------------------------------------------------
    const greetingMsg =
      `👋 **Namaste! I am the Nav Durga AI Assistant.**\n\n` +
      `I am directly connected to the Nav Durga Ispat ERP database to help you manage rates, generate marketing graphics, and analyze prices.\n\n` +
      `Here are some commands you can try:\n` +
      `1. **"Update Medium all products to 56922."** — calculates gauge diffs and prepares rate revision with confirmation.\n` +
      `2. **"Aaj aur kal ke rate mein kya difference hai?"** — compares today vs yesterday with full metrics.\n` +
      `3. **"Show today's SL rates."** — displays all Super Light products and current final rates.\n` +
      `4. **"Create a price update post for 600 rupees increase per MT."** — generates high-res WhatsApp graphics.\n` +
      `5. **"Show all products whose prices changed today."** — lists recent price revisions.\n` +
      `6. **"Compare Medium and SL prices."** — analyzes the spread between Medium and SL benchmarks.`;

    return {
      id: messageId,
      role: 'assistant',
      content: greetingMsg,
      timestamp: new Date().toISOString(),
      intent: 'general_chat',
    };
  }

  /**
   * Builds Rate Update Proposal with product breakdown and gauge difference calculations
   */
  static buildRateUpdateProposal(
    targetSection: string,
    proposedBaseRate: number,
    context: AssistantContext
  ): RateUpdateProposalData {
    const canonicalSection = normalizeSectionKey(targetSection);
    const companyUnit =
      canonicalSection === 'LIGHT SECTION'
        ? 'UNIT-2 — NS ISPAT (I) PVT. LTD.'
        : 'NAVDURGA ISPAT PVT. LTD.';

    // Filter products matching section
    const affectedProducts = context.products.filter((p) =>
      doesProductMatchSection(p, canonicalSection)
    );

    const previewItems = affectedProducts.map((p) => {
      const gaugeDiff = p.gaugeDifference !== undefined ? p.gaugeDifference : 0;
      const newFinalRate = proposedBaseRate + gaugeDiff;
      const currentRate = p.finalRate ?? p.currentPrice ?? 0;
      return {
        id: p.id,
        name: p.name,
        size: p.size || 'Standard',
        grade: p.grade || p.type || 'Medium',
        gaugeDifference: gaugeDiff,
        currentPrice: currentRate,
        proposedRate: newFinalRate,
        change: newFinalRate - currentRate,
      };
    });

    return {
      section: canonicalSection,
      companyUnit,
      proposedBaseRate,
      affectedProductsCount: previewItems.length,
      affectedProductIds: previewItems.map((i) => i.id),
      previewItems,
      status: 'pending',
    };
  }

  /**
   * Builds Rate Comparison Report using actual ERP historical records
   */
  static buildRateComparison(query: string, context: AssistantContext): RateComparisonData {
    const lower = query.toLowerCase();

    // 1. Medium vs SL Comparison
    if (lower.includes('medium and sl') || lower.includes('medium vs sl') || lower.includes('sl vs medium')) {
      const mediumItems = context.products.filter(
        (p) =>
          doesProductMatchSection(p, 'MEDIUM SECTION') &&
          (p.grade === 'Medium' || p.type === 'Medium' || !p.grade)
      );
      const slItems = context.products.filter(
        (p) =>
          p.grade === 'SL' ||
          p.type === 'Super light' ||
          p.gaugeType === 'SL' ||
          p.name.toLowerCase().includes('sl')
      );

      const medAvg = Math.round(
        mediumItems.reduce((acc, p) => acc + (p.finalRate ?? p.currentPrice), 0) /
          (mediumItems.length || 1)
      );
      const slAvg = Math.round(
        slItems.reduce((acc, p) => acc + (p.finalRate ?? p.currentPrice), 0) /
          (slItems.length || 1)
      );
      const spread = medAvg - slAvg;

      const items = slItems.slice(0, 10).map((sl) => {
        const correspondingMed = mediumItems.find((m) => m.size === sl.size) || mediumItems[0];
        const medPrice = correspondingMed ? correspondingMed.finalRate ?? correspondingMed.currentPrice : medAvg;
        const slPrice = sl.finalRate ?? sl.currentPrice;
        return {
          name: sl.name,
          size: sl.size || '-',
          section: 'MEDIUM SECTION',
          grade: 'SL vs Medium',
          previousPrice: medPrice,
          currentPrice: slPrice,
          difference: slPrice - medPrice,
          percentChange: Number((((slPrice - medPrice) / medPrice) * 100).toFixed(2)),
        };
      });

      return {
        title: 'Medium Section vs Super Light (SL) Price Spread Analysis',
        comparisonType: 'medium_vs_sl',
        summary:
          `• **Medium Section Benchmark:** ₹${medAvg.toLocaleString('en-IN')}/MT\n` +
          `• **Super Light (SL) Benchmark:** ₹${slAvg.toLocaleString('en-IN')}/MT\n` +
          `• **Market Spread:** SL is ₹${Math.abs(spread).toLocaleString('en-IN')}/MT ${spread >= 0 ? 'lower than' : 'higher than'} Medium.`,
        items,
      };
    }

    // 2. Last 7 Days Comparison
    if (lower.includes('7 days') || lower.includes('week') || lower.includes('seven days')) {
      const history = context.rateHistory || [];
      const hasHistory = history.length > 0;

      if (!hasHistory) {
        // Honesty rule from prompt: if missing historical data, clearly inform user
        const items = context.products.slice(0, 10).map((p) => ({
          name: p.name,
          size: p.size || '-',
          section: p.section || 'MEDIUM SECTION',
          previousPrice: p.previousPrice || p.currentPrice,
          currentPrice: p.currentPrice,
          difference: p.currentPrice - (p.previousPrice || p.currentPrice),
          percentChange: p.previousPrice
            ? Number((((p.currentPrice - p.previousPrice) / p.previousPrice) * 100).toFixed(2))
            : 0,
        }));

        return {
          title: '7-Day Price Movement Analysis',
          comparisonType: 'last_7_days',
          summary:
            `Historical daily rate logs for the previous 7 days are currently limited in the local storage history. Showing the current catalog variance and yesterday-to-today price adjustments.`,
          isMissingData: true,
          missingDataReason:
            'Historical archive has limited entries for >3 days ago. Full daily price logging has been active since recent revisions.',
          items,
        };
      }

      // Compute from actual history
      const items = context.products.slice(0, 12).map((p) => {
        const prodHistory = history.filter((h) => h.productId === p.id || h.productName === p.name);
        const oldest = prodHistory[prodHistory.length - 1];
        const oldPrice = oldest ? oldest.finalRate : p.previousPrice || p.currentPrice;
        const diff = p.currentPrice - oldPrice;
        return {
          name: p.name,
          size: p.size || '-',
          section: p.section,
          previousPrice: oldPrice,
          currentPrice: p.currentPrice,
          difference: diff,
          percentChange: oldPrice ? Number(((diff / oldPrice) * 100).toFixed(2)) : 0,
        };
      });

      return {
        title: '7-Day Price Movement & Volatility Report',
        comparisonType: 'last_7_days',
        summary: `Analyzed rates across ${items.length} key structural steel items over the past 7 days based on ERP rate audit records.`,
        items,
      };
    }

    // 3. Default: Today vs Yesterday ("Aaj aur kal ke rate mein kya difference hai?")
    const mediumBase = context.categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
    const lightBase = context.categoryBasicRates?.['LIGHT SECTION'] ?? 42211;

    const items = context.products.map((p) => {
      const prev = p.previousPrice || p.currentPrice;
      const curr = p.finalRate ?? p.currentPrice;
      const diff = curr - prev;
      return {
        name: p.name,
        size: p.size || '-',
        section: p.section || 'MEDIUM SECTION',
        grade: p.grade || p.type,
        previousPrice: prev,
        currentPrice: curr,
        difference: diff,
        percentChange: prev ? Number(((diff / prev) * 100).toFixed(2)) : 0,
      };
    });

    const increasedCount = items.filter((i) => i.difference > 0).length;
    const decreasedCount = items.filter((i) => i.difference < 0).length;
    const stableCount = items.filter((i) => i.difference === 0).length;

    return {
      title: "Today vs Yesterday Rate Comparison Report (आज और कल के रेट की तुलना)",
      comparisonType: 'today_vs_yesterday',
      summary:
        `• **Medium Section Base Rate:** ₹${mediumBase.toLocaleString('en-IN')}/MT\n` +
        `• **Light Section Base Rate:** ₹${lightBase.toLocaleString('en-IN')}/MT\n` +
        `• **Movement Summary:** ${increasedCount} items increased, ${decreasedCount} items decreased, ${stableCount} items stable.`,
      items,
    };
  }

  /**
   * Builds AI Price Post Generator Data
   */
  static buildPricePostData(
    section: string,
    delta: number,
    direction: 'increase' | 'decrease' | 'set',
    context: AssistantContext
  ): PricePostGeneratorData {
    let canonicalSection = 'MEDIUM SECTION';
    let companyUnit = 'NAVDURGA ISPAT PVT. LTD.';
    let currentBase = context.categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
    let sectionProducts: Product[] = [];

    const raw = (section || '').trim().toUpperCase();

    if (raw === 'ALL' || raw === 'ALL PRODUCTS' || raw.includes('ALL SECTIONS') || raw.includes('CATALOGUE')) {
      canonicalSection = 'ALL SECTIONS (FULL CATALOGUE)';
      companyUnit = 'NAVDURGA ISPAT GROUP';
      currentBase = context.categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
      sectionProducts = context.products.filter((p) => p.status === 'Active');
    } else if (raw.includes('&') || (raw.includes('MEDIUM') && (raw.includes('SL') || raw.includes('LIGHT')))) {
      canonicalSection = 'MEDIUM & SUPER LIGHT (SL) SECTIONS';
      companyUnit = 'NAVDURGA ISPAT & UNIT-2 NS ISPAT';
      currentBase = context.categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
      sectionProducts = context.products.filter(
        (p) => doesProductMatchSection(p, 'MEDIUM SECTION') || doesProductMatchSection(p, 'LIGHT SECTION')
      );
    } else if (raw.includes('SL') || raw.includes('SUPER') || raw.includes('LIGHT')) {
      canonicalSection = 'SL / SUPER LIGHT SECTION';
      companyUnit = 'UNIT-2 — NS ISPAT (I) PVT. LTD.';
      currentBase = context.categoryBasicRates?.['LIGHT SECTION'] ?? 42211;
      sectionProducts = context.products.filter((p) => doesProductMatchSection(p, 'LIGHT SECTION'));
      if (sectionProducts.length === 0) {
        sectionProducts = context.products.filter(
          (p) => p.grade === 'SL' || p.type === 'Super light' || (p.name && p.name.includes('SL'))
        );
      }
    } else {
      canonicalSection = 'MEDIUM SECTION';
      companyUnit = 'NAVDURGA ISPAT PVT. LTD.';
      currentBase = context.categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
      sectionProducts = context.products.filter((p) => doesProductMatchSection(p, 'MEDIUM SECTION'));
    }

    const isConfirmedRates = delta === 0 || direction === 'set';
    const proposedBase =
      direction === 'increase'
        ? currentBase + delta
        : direction === 'decrease'
        ? currentBase - delta
        : currentBase;

    const previewItems = sectionProducts.map((p) => {
      const cur = p.finalRate ?? p.currentPrice;
      const gaugeDiff = p.gaugeDifference !== undefined && p.gaugeDifference !== null ? p.gaugeDifference : 0;
      const prop = isConfirmedRates ? cur : proposedBase + gaugeDiff;
      const change = prop - cur;

      return {
        id: p.id,
        name: p.name || p.productName || 'MS Steel',
        size: p.size || 'Standard',
        grade: p.grade || p.type || 'Medium',
        gaugeDifference: gaugeDiff,
        basicRate: isConfirmedRates ? (p.baseRate || currentBase) : proposedBase,
        currentPrice: cur,
        proposedPrice: prop,
        change,
        section: p.section,
      };
    });

    // Partition into pages for multi-image support
    const partitioned = PosterRenderer.partitionProductsForPages(sectionProducts, 'auto-split', '4:5');
    const pages = partitioned.pages.map((pageProds: Product[], idx: number) => ({
      pageIndex: idx,
      title: partitioned.pageTitles[idx] || `PAGE ${idx + 1}`,
      items: previewItems.filter((item) => pageProds.some((p: Product) => p.id === item.id)),
    }));

    return {
      section: canonicalSection,
      companyUnit,
      priceDelta: delta,
      direction,
      proposedBaseRate: proposedBase,
      dateStr: new Date().toISOString().split('T')[0],
      previewItems,
      defaultTheme: 'premium-industrial',
      status: 'draft',
      isConfirmedRates,
      totalPages: pages.length,
      pages,
    };
  }
}
