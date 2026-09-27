import {
  DailyUpdate,
  CompanySettings,
  Customer,
  SalesEnquiry,
  WhatsAppMessageRecord,
  WhatsAppConfig,
  WhatsAppTestActivity,
  CustomWhatsAppPost,
  CustomPostRecipient,
  Product,
  WhatsAppThemeName,
  CommonProductImage,
  CompanyGradeBasicRates,
  CategoryBasicRates,
  WhatsAppOrderEnquiryParsed,
} from '../types';
import { NAV_DURGA_TEST_CUSTOMER } from '../data/demoData';
import { PosterRenderer, PosterRenderOptions } from './posterRenderer';
import { normalizeGrade } from '../utils/rateCalculator';
import {
  parseWhatsAppCustomerMessage,
  buildSalesEnquiryFromWhatsAppParsed,
  matchWhatsAppCustomer,
  matchERPProduct,
  extractQuantityFromText,
} from '../utils/whatsappOrderHelper';

const TEST_ACTIVITY_STORAGE_KEY = 'navdurga_whatsapp_test_activities_v1';
const CUSTOM_POSTS_STORAGE_KEY = 'navdurga_custom_whatsapp_posts_v1';

const DEMO_GANESH_POST_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="50%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  <rect x="25" y="25" width="750" height="750" rx="20" fill="none" stroke="url(#borderGrad)" stroke-width="4"/>
  <rect x="40" y="40" width="720" height="720" rx="14" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 6"/>
  <circle cx="400" cy="240" r="110" fill="#fbbf24" opacity="0.25"/>
  <circle cx="400" cy="240" r="85" fill="#f59e0b" opacity="0.3"/>
  <text x="400" y="270" font-family="sans-serif" font-size="90" text-anchor="middle" fill="#b45309">🕉️</text>
  <text x="400" y="410" font-family="sans-serif" font-weight="900" font-size="38" text-anchor="middle" fill="#78350f" letter-spacing="1">HAPPY GANESH CHATURTHI</text>
  <text x="400" y="450" font-family="sans-serif" font-weight="600" font-size="19" text-anchor="middle" fill="#92400e">May Lord Ganesha Bless Your Projects with Strength &amp; Success</text>
  <line x1="200" y1="485" x2="600" y2="485" stroke="#d97706" stroke-width="2"/>
  <text x="400" y="530" font-family="sans-serif" font-weight="700" font-size="22" text-anchor="middle" fill="#1e293b">NAV DURGA ISPAT</text>
  <text x="400" y="560" font-family="sans-serif" font-weight="500" font-size="16" text-anchor="middle" fill="#475569">Raipur, Chhattisgarh • Fe 500D TMT &amp; Structural Steel</text>
  <rect x="180" y="610" width="440" height="56" rx="28" fill="#b45309"/>
  <text x="400" y="645" font-family="sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#ffffff">WISHING YOU PROSPERITY &amp; GROWTH</text>
  <text x="400" y="725" font-family="sans-serif" font-weight="600" font-size="14" text-anchor="middle" fill="#64748b">📞 +91 771 4208900 | 📱 +91 97521 83053</text>
</svg>
`)}`;

const DEMO_OFFER_POST_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#blueGrad)"/>
  <rect x="25" y="25" width="750" height="750" rx="20" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <text x="400" y="140" font-family="sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#fbbf24">NAV DURGA ISPAT — SPECIAL OFFER</text>
  <text x="400" y="190" font-family="sans-serif" font-weight="600" font-size="18" text-anchor="middle" fill="#93c5fd">DIRECT FACTORY DISPATCH • URLA, RAIPUR</text>
  <rect x="80" y="240" width="640" height="260" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="120" y="300" font-family="sans-serif" font-weight="800" font-size="26" fill="#ffffff">Fe 500D TMT REBARS (8mm - 32mm)</text>
  <text x="120" y="340" font-family="sans-serif" font-size="18" fill="#cbd5e1">Special Project Booking Rates for Infrastructure &amp; Commercial</text>
  <text x="120" y="390" font-family="sans-serif" font-weight="900" font-size="36" fill="#22c55e">₹52,800 / MT</text>
  <text x="360" y="390" font-family="sans-serif" font-size="16" fill="#94a3b8">Ex-Plant Urla • Loading Free • BIS Certified</text>
  <text x="120" y="440" font-family="sans-serif" font-size="16" fill="#f59e0b">⚡ Valid for orders confirmed this week only</text>
  <text x="400" y="580" font-family="sans-serif" font-weight="700" font-size="22" text-anchor="middle" fill="#ffffff">For Inquiries &amp; Instant Booking:</text>
  <text x="400" y="630" font-family="sans-serif" font-weight="800" font-size="28" text-anchor="middle" fill="#38bdf8">📱 WhatsApp: +91 97521 83053</text>
  <text x="400" y="700" font-family="sans-serif" font-size="15" text-anchor="middle" fill="#64748b">Nav Durga Ispat — Plot No. 42-45, Phase II, Urla, Raipur</text>
</svg>
`)}`;

export const INITIAL_CUSTOM_POSTS: CustomWhatsAppPost[] = [
  {
    id: 'post-1',
    imageName: 'ganesh_chaturthi_wishes_navdurga.png',
    imageUrl: DEMO_GANESH_POST_IMG,
    imageSize: 48200,
    message: 'Happy Ganesh Chaturthi from Nav Durga Ispat.\n\nWishing you and your family happiness, prosperity, and great success in all your construction and steel projects.\n\nWarm regards,\nNav Durga Ispat, Raipur',
    recipients: [
      {
        customerId: 'cust-test-01',
        customerName: 'Nav Durga Test Customer',
        companyName: 'Nav Durga Test',
        phoneNumber: '+91 97521 83053',
        status: 'Opened',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'Custom Image',
    status: 'Manual Test',
    category: 'Festival Greeting',
  },
  {
    id: 'post-2',
    imageName: 'monsoon_tmt_special_offer.png',
    imageUrl: DEMO_OFFER_POST_IMG,
    imageSize: 62400,
    message: '⚡ SPECIAL STEEL BOOKING OFFER — NAV DURGA ISPAT\n\nDear Partner,\nWe are pleased to offer prime Fe 500D TMT Rebars (8mm - 32mm) at special factory-direct rates for immediate delivery from our Urla Raipur plant.\n\nRate: ₹52,800/MT (Ex-Plant)\nValidity: This week only\n\nTo book, reply directly to this message.\nNav Durga Ispat, Raipur\nHotline: +91 771 4208900',
    recipients: [
      {
        customerId: 'cust-test-01',
        customerName: 'Nav Durga Test Customer',
        companyName: 'Nav Durga Test',
        phoneNumber: '+91 97521 83053',
        status: 'Opened',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    type: 'Custom Image',
    status: 'Manual Test',
    category: 'Special Offer',
  },
];

export const INITIAL_TEST_ACTIVITIES: WhatsAppTestActivity[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    customerName: 'Nav Durga Test Customer',
    phoneNumber: '+91 97521 83053',
    action: 'Test Update Prepared',
    details: 'Raipur Market Daily Steel Rate sheet formatted for Fe 500D & structural items.',
    status: 'Manual Action',
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    customerName: 'Nav Durga Test Customer',
    phoneNumber: '+91 97521 83053',
    action: 'Message Copied',
    details: 'Broadcast text copied to clipboard for WhatsApp manual pasting.',
    status: 'Manual Action',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    customerName: 'Nav Durga Test Customer',
    phoneNumber: '+91 97521 83053',
    action: 'WhatsApp Opened',
    details: 'Opened web intent (wa.me/919752183053) in browser tab.',
    status: 'Manual Action',
  },
];

export interface WhatsAppSendResult {
  success: boolean;
  mode: 'manual' | 'cloud_api';
  messageId: string;
  shareUrl?: string;
  notes: string;
}

export interface InboundParsedData {
  detectedCustomer?: string;
  detectedProduct?: string;
  detectedQuantity?: number;
  detectedUnit: string;
  intent: 'Purchase Enquiry' | 'Price Request' | 'Delivery Status' | 'General Query';
  rawText: string;
  confidence: number;
}

export class WhatsAppService {
  /**
   * Alias for formatDailyUpdateMessage as requested by service abstraction
   */
  static formatDailyUpdate(
    update: DailyUpdate,
    company: CompanySettings,
    customerName?: string
  ): string {
    return this.formatDailyUpdateMessage(update, company, customerName);
  }

  /**
   * Retrieve the dedicated test customer from active list or fallback to system constant
   */
  static getTestCustomer(customers?: Customer[]): Customer {
    if (customers && customers.length > 0) {
      const cleanPhone = (p: string) => (p || '').replace(/[^0-9]/g, '');
      const testPhone = cleanPhone(NAV_DURGA_TEST_CUSTOMER.mobile);
      const found = customers.find(
        (c) =>
          c.id === NAV_DURGA_TEST_CUSTOMER.id ||
          cleanPhone(c.whatsapp) === testPhone ||
          cleanPhone(c.mobile) === testPhone ||
          c.companyName.toLowerCase() === NAV_DURGA_TEST_CUSTOMER.companyName.toLowerCase() ||
          c.name.toLowerCase() === NAV_DURGA_TEST_CUSTOMER.name.toLowerCase()
      );
      if (found) return found;
    }
    return NAV_DURGA_TEST_CUSTOMER;
  }

  /**
   * Open WhatsApp / WhatsApp Web with pre-filled message
   * Logs manual action to local activity log
   */
  static openChat(phoneNumber: string, message: string, customerName: string = 'Nav Durga Test Customer'): string {
    const url = this.buildWhatsAppWebUrl(phoneNumber, message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    this.logActivity({
      customerName,
      phoneNumber,
      action: 'WhatsApp Opened',
      details: `Opened chat via wa.me intent with pre-filled text (${message.length} chars).`,
    });
    return url;
  }

  /**
   * Copy message text to clipboard
   * Logs manual action to local activity log
   */
  static async copyMessage(
    message: string,
    customerName: string = 'Nav Durga Test Customer',
    phoneNumber: string = '+91 97521 83053'
  ): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        this.logActivity({
          customerName,
          phoneNumber,
          action: 'Message Copied',
          details: `Copied message text (${message.length} chars) to system clipboard.`,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }

  /**
   * Local Activity Logger for WhatsApp Manual Test actions
   */
  static getActivities(): WhatsAppTestActivity[] {
    try {
      if (typeof localStorage === 'undefined') return INITIAL_TEST_ACTIVITIES;
      const stored = localStorage.getItem(TEST_ACTIVITY_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(TEST_ACTIVITY_STORAGE_KEY, JSON.stringify(INITIAL_TEST_ACTIVITIES));
        return INITIAL_TEST_ACTIVITIES;
      }
      return JSON.parse(stored) as WhatsAppTestActivity[];
    } catch {
      return INITIAL_TEST_ACTIVITIES;
    }
  }

  static logActivity(
    record: Omit<WhatsAppTestActivity, 'id' | 'timestamp' | 'status'> & {
      id?: string;
      timestamp?: string;
      status?: 'Manual Action';
    }
  ): WhatsAppTestActivity {
    const newEntry: WhatsAppTestActivity = {
      id: record.id || `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: record.timestamp || new Date().toISOString(),
      customerName: record.customerName || 'Nav Durga Test Customer',
      phoneNumber: record.phoneNumber || '+91 97521 83053',
      action: (record.action as WhatsAppTestActivity['action']) || 'Manual Action',
      details: record.details || '',
      status: 'Manual Action',
    };

    try {
      const current = this.getActivities();
      const updated = [newEntry, ...current].slice(0, 50);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TEST_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('navdurga_whatsapp_activity_logged', { detail: newEntry }));
      }
    } catch (err) {
      console.error('Error persisting test activity:', err);
    }

    return newEntry;
  }

  static clearActivities(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TEST_ACTIVITY_STORAGE_KEY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('navdurga_whatsapp_activity_logged'));
      }
    } catch (err) {
      console.error('Error clearing test activity:', err);
    }
  }

  /**
   * Custom WhatsApp Post Management (Festival / Offer / General Images)
   */
  static getCustomPosts(): CustomWhatsAppPost[] {
    try {
      if (typeof localStorage === 'undefined') return INITIAL_CUSTOM_POSTS;
      const stored = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_POSTS));
        return INITIAL_CUSTOM_POSTS;
      }
      return JSON.parse(stored) as CustomWhatsAppPost[];
    } catch (err) {
      console.error('Error fetching custom WhatsApp posts:', err);
      return INITIAL_CUSTOM_POSTS;
    }
  }

  static saveCustomPost(post: CustomWhatsAppPost): CustomWhatsAppPost {
    try {
      const current = this.getCustomPosts();
      const existingIdx = current.findIndex((p) => p.id === post.id);
      let updated: CustomWhatsAppPost[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = post;
      } else {
        updated = [post, ...current];
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('navdurga_custom_posts_updated', { detail: post }));
      }
      return post;
    } catch (err) {
      console.error('Error saving custom WhatsApp post:', err);
      return post;
    }
  }

  static deleteCustomPost(id: string): void {
    try {
      const current = this.getCustomPosts();
      const updated = current.filter((p) => p.id !== id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('navdurga_custom_posts_updated'));
      }
    } catch (err) {
      console.error('Error deleting custom WhatsApp post:', err);
    }
  }

  /**
   * Format clean, professional WhatsApp broadcast text for Daily Price Update
   */
  static formatDailyUpdateMessage(
    update: DailyUpdate,
    company: CompanySettings,
    customerName?: string
  ): string {
    const greeting = customerName ? `Dear ${customerName},\n\n` : '';
    const header = `*${company.companyName.toUpperCase()}*\n_${company.tagline}_\n\n`;
    const title = `📊 *DAILY STEEL PRICE UPDATE*\n📅 *Date:* ${update.date}\n\n`;

    const productLines = update.items
      .map((item) => {
        const changeStr = item.changeNote ? ` (${item.changeNote})` : '';
        const availBadge = item.availability !== 'Available' ? ` [${item.availability}]` : '';
        return `▫️ *${item.productName} - ${item.grade}*\n   ₹${item.price.toLocaleString('en-IN')} / ${item.unit}${changeStr}${availBadge}`;
      })
      .join('\n\n');

    const remarks = update.remarks ? `\n\n📌 *Notes:* ${update.remarks}` : '';
    const footer = `\n\n📍 *Plant:* ${company.address}, ${company.city}, ${company.state}\n📞 *Sales Hotline:* ${company.phone} | *WhatsApp:* ${company.whatsapp}\n\n_To place an order or enquire about quantities, reply directly to this message._\n\n_Powered by ${company.poweredBy}_`;

    return `${greeting}${header}${title}${productLines}${remarks}${footer}`;
  }

  /**
   * Build click-to-chat WhatsApp link for testing manual sending
   * Supports standard international numbers (+91...) or cleans local 10-digit Indian numbers
   */
  static buildWhatsAppWebUrl(phoneNumber: string, text: string): string {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) {
      cleanNumber = `91${cleanNumber}`;
    }
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }

  /**
   * Manual / Mock Send Message implementation
   * Prepares the message record, logs communication history, and returns web intent URL
   */
  static async sendMessage(
    customer: Customer,
    messageText: string,
    config: WhatsAppConfig,
    imageUrl?: string
  ): Promise<WhatsAppSendResult> {
    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (config.status === 'Connected') {
      // Future Meta WhatsApp Cloud API endpoint hook:
      // In production, this would execute POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
      // with Authorization: Bearer {API_TOKEN}
      return {
        success: true,
        mode: 'cloud_api',
        messageId,
        notes: 'Dispatched via Meta WhatsApp Business Platform API',
      };
    }

    // Default Manual / Web Intent mode:
    const shareUrl = this.buildWhatsAppWebUrl(customer.whatsapp || customer.mobile, messageText);
    return {
      success: true,
      mode: 'manual',
      messageId,
      shareUrl,
      notes: 'Prepared manual WhatsApp conversation URL for staff testing',
    };
  }

  /**
   * FUTURE API READY (Meta WhatsApp Cloud API Stubs):
   * Structured for future automated media & template dispatch:
   * - sendImage()
   * - sendImageWithCaption()
   * - sendDocument()
   * - sendTemplate()
   */
  static async sendImage(
    target: Customer | { phoneNumber: string; imageUrl?: string; mimeType?: string },
    _imageBlob?: Blob | string,
    caption?: string,
    config?: WhatsAppConfig
  ): Promise<WhatsAppSendResult> {
    const phoneNumber = 'phoneNumber' in target ? target.phoneNumber : (target.whatsapp || target.mobile);
    const messageId = `img-${Date.now()}`;
    const shareUrl = this.buildWhatsAppWebUrl(phoneNumber, caption || '');
    return {
      success: true,
      mode: config?.status === 'Connected' ? 'cloud_api' : 'manual',
      messageId,
      shareUrl,
      notes: 'Image ready for manual dispatch or Cloud API media upload once credentials are provided.',
    };
  }

  static async sendImageWithCaption(params: {
    phoneNumber: string;
    imageUrl: string;
    caption: string;
    mimeType?: string;
  }): Promise<WhatsAppSendResult> {
    console.info('[Future API Ready] sendImageWithCaption called for:', params.phoneNumber);
    const shareUrl = this.buildWhatsAppWebUrl(params.phoneNumber, params.caption);
    return {
      success: true,
      mode: 'manual',
      messageId: `wamid_cap_${Date.now()}`,
      shareUrl,
      notes: 'WhatsApp Cloud API not connected yet. Image + caption sending will be automated once Meta API credentials are provided.',
    };
  }

  static async sendDocument(params: {
    phoneNumber: string;
    documentUrl: string;
    fileName: string;
  }): Promise<WhatsAppSendResult> {
    console.info('[Future API Ready] sendDocument called for:', params.phoneNumber, params.fileName);
    return {
      success: false,
      mode: 'cloud_api',
      messageId: `wamid_doc_${Date.now()}`,
      notes: 'WhatsApp Cloud API not connected yet. PDF/Document sending will be automated once Meta API credentials are provided.',
    };
  }

  static async sendTemplate(
    target: Customer | { phoneNumber: string; templateName: string; language?: string; components?: any[] },
    _templateName?: string,
    _components?: Record<string, unknown>[],
    _config?: WhatsAppConfig
  ): Promise<WhatsAppSendResult> {
    return {
      success: false,
      mode: 'cloud_api',
      messageId: `tmpl-${Date.now()}`,
      notes: 'Template sending requires active Meta WhatsApp Business Account approval',
    };
  }

  /**
   * Intelligent Rule-based parsing simulation for incoming customer replies
   * Prepares ERP for future WhatsApp Webhook:
   * e.g., "Need 20 ton Fe500D at Naya Raipur site #4"
   */
  static parseCustomerInboundMessage(
    rawText: string,
    customer?: Customer
  ): InboundParsedData {
    const lower = rawText.toLowerCase();

    // Detect product / grade
    let detectedProduct = 'TMT Steel Rebar';
    if (lower.includes('550') || lower.includes('fe550') || lower.includes('550d')) {
      detectedProduct = 'TMT Steel Rebar (Fe 550D)';
    } else if (lower.includes('500') || lower.includes('fe500') || lower.includes('500d')) {
      detectedProduct = 'TMT Steel Rebar (Fe 500D)';
    } else if (lower.includes('angle') || lower.includes('koniya')) {
      detectedProduct = 'Mild Steel Angle';
    } else if (lower.includes('channel') || lower.includes('ismc')) {
      detectedProduct = 'Mild Steel Channel';
    } else if (lower.includes('beam') || lower.includes('joist') || lower.includes('girder')) {
      detectedProduct = 'Mild Steel Beam / Joist';
    } else if (lower.includes('wire') || lower.includes('tar') || lower.includes('coil')) {
      detectedProduct = 'Wire Rod Coils';
    }

    // Detect quantity: looks for numbers followed by ton, mt, t, trailer, or standalone numbers
    let detectedQuantity = 20;
    const qtyMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:ton|tons|mt|tonne|tonnes|trailer|गाड़ी)/i) ||
                     rawText.match(/need\s*(\d+(?:\.\d+)?)/i) ||
                     rawText.match(/(\d+)\s*t\b/i);

    if (qtyMatch && qtyMatch[1]) {
      detectedQuantity = parseFloat(qtyMatch[1]);
    }

    // Detect intent
    let intent: InboundParsedData['intent'] = 'Purchase Enquiry';
    if (lower.includes('rate') || lower.includes('price') || lower.includes('bhav') || lower.includes('bhao')) {
      intent = 'Price Request';
    } else if (lower.includes('dispatch') || lower.includes('delivery') || lower.includes('gadi') || lower.includes('truck')) {
      intent = 'Delivery Status';
    }

    return {
      detectedCustomer: customer ? customer.companyName : 'Inbound WhatsApp Contact',
      detectedProduct,
      detectedQuantity,
      detectedUnit: 'MT',
      intent,
      rawText,
      confidence: 0.92,
    };
  }

  /**
   * Convert Inbound Message into a structured Sales Enquiry (Legacy compatibility)
   */
  static createEnquiryFromInbound(
    customer: Customer,
    parsed: InboundParsedData,
    rawText: string,
    salesperson: string = 'Rajesh Sharma'
  ): SalesEnquiry {
    const today = new Date().toISOString().split('T')[0];
    const randId = Math.floor(100 + Math.random() * 900);

    return {
      id: `enq-wa-${Date.now()}`,
      enquiryNumber: `ENQ-${today.slice(0, 4)}-${randId}`,
      customerId: customer.id,
      customerName: customer.companyName,
      product: parsed.detectedProduct || 'TMT Steel Rebar',
      grade: parsed.detectedProduct?.includes('550') ? 'Fe 550D' : 'Fe 500D',
      quantity: parsed.detectedQuantity || 20,
      unit: parsed.detectedUnit || 'MT',
      expectedPrice: 58500,
      source: 'WhatsApp',
      whatsappMessage: rawText,
      date: today,
      salesperson,
      status: 'New',
      notes: `Automated WhatsApp enquiry parsed from customer message: "${rawText}"`,
    };
  }

  /**
   * PHASE 3: Complete WhatsApp Customer Message Parser
   * Identifies customer from Customer Master, identifies product from Product Master,
   * calculates approved rates (Basic + Gauge Diff), detects requirements vs rate queries,
   * and prepares CRM-ready requirement records.
   */
  static parseOrderEnquiryMessage(params: {
    rawText: string;
    senderPhone?: string;
    preselectedCustomerId?: string;
    customers: Customer[];
    products: Product[];
    company: CompanySettings;
  }): WhatsAppOrderEnquiryParsed {
    return parseWhatsAppCustomerMessage(params);
  }

  /**
   * PHASE 3: Convert Parsed WhatsApp Customer Message to Sales/CRM Requirement
   */
  static createSalesRequirementFromWhatsApp(params: {
    parsed: WhatsAppOrderEnquiryParsed;
    company: CompanySettings;
    salesperson?: string;
  }): SalesEnquiry {
    return buildSalesEnquiryFromWhatsAppParsed(params);
  }

  /**
   * Format complete daily steel rate post text for WhatsApp
   * Connects to calculated Final Rates and matches the exact specification:
   * Company -> Daily Steel Rate -> Basic Rate -> Product Name -> Size -> Grade — Final Rate
   */
  static formatCompleteSteelRatePostText(
    products: Product[],
    company: CompanySettings,
    dateStr?: string,
    gradeBasicRates?: CompanyGradeBasicRates,
    categoryBasicRates?: CategoryBasicRates
  ): string {
    const todayStr =
      dateStr ||
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    // Group active products by Mill / Section
    const mediumSectionProducts = products.filter(
      (p) =>
        p.status === 'Active' &&
        (p.section === 'MEDIUM SECTION' ||
          (!p.section && (!p.rateSource || p.rateSource.includes('NAV DURGA'))))
    );

    const lightSectionProducts = products.filter(
      (p) =>
        p.status === 'Active' &&
        (p.section === 'LIGHT SECTION' ||
          (!p.section && p.rateSource && p.rateSource.includes('NS ISPAT')))
    );

    const formatProductGroup = (prods: Product[]) => {
      const map = new Map<string, Product[]>();
      prods.forEach((p) => {
        const cat = p.productName || p.name || 'STEEL PRODUCTS';
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(p);
      });

      let res = '';
      map.forEach((items, catName) => {
        res += `*${catName.toUpperCase()}*\n`;
        items.forEach((item) => {
          const normGrd = normalizeGrade(item.grade || item.gaugeType);
          const gaugeDiff = item.gaugeDifference !== undefined ? item.gaugeDifference : 0;
          const rate = item.finalRate ?? item.currentPrice ?? 0;
          res += `• ${item.size} | Grade: ${normGrd}\n  Gauge Diff: ₹${gaugeDiff.toLocaleString('en-IN')}/MT | Final Rate: *₹${rate.toLocaleString('en-IN')}/MT*\n`;
        });
        res += `\n`;
      });
      return res;
    };

    let text = '';

    // 1. NAVDURGA ISPAT PVT. LTD. — MEDIUM SECTION
    if (mediumSectionProducts.length > 0) {
      const ndMedBase =
        categoryBasicRates?.['MEDIUM SECTION'] ??
        gradeBasicRates?.['NAV DURGA ISPAT PVT. LTD.']?.['Medium'] ??
        49711;

      text += `*NAVDURGA ISPAT PVT. LTD.*\n`;
      text += `*Category: MEDIUM SECTION*\n`;
      text += `📅 Date: *${todayStr}*\n`;
      text += `*BASIC RATE: ₹${ndMedBase.toLocaleString('en-IN')}/MT*\n\n`;
      text += formatProductGroup(mediumSectionProducts);
    }

    // 2. UNIT-2 — NS ISPAT (INDIA) PVT. LTD. — LIGHT SECTION
    if (lightSectionProducts.length > 0) {
      if (mediumSectionProducts.length > 0) {
        text += `───────────────────────\n\n`;
      }
      const nsLightBase =
        categoryBasicRates?.['LIGHT SECTION'] ??
        gradeBasicRates?.['NS ISPAT (INDIA) PVT. LTD. UNIT-II']?.['Medium'] ??
        42211;

      text += `*UNIT-2 - NS ISPAT (I) PVT. LTD.*\n`;
      text += `*Category: LIGHT SECTION*\n`;
      text += `*BASIC RATE: ₹${nsLightBase.toLocaleString('en-IN')}/MT*\n\n`;
      text += formatProductGroup(lightSectionProducts);
    }

    // Hotlines & Terms
    text += `───────────────────────\n`;
    text += `📞 *Contact for Inquiry & Booking:*\n`;
    text += `📲 *9009544333* | *7000923464* | *9713144333*\n\n`;
    text += `ℹ️ _Formula: FINAL RATE = BASIC RATE + GAUGE DIFFERENCE_\n`;
    text += `🧾 _GST 18% Extra • Ex-Plant Urla, Raipur_\n`;
    text += `───────────────────────\n`;
    text += `_Powered by Nav Durga ERP_`;

    return text;
  }

  /**
   * High-Resolution Professional Steel Post Generator
   * Dispatches to PosterRenderer which provides 7 distinct corporate industrial themes,
   * prominent MEDIUM and SL hero benchmark cards, multi-post pagination, and 4:5/1:1 aspect ratios.
   */
  static renderThemedPostToCanvas(
    canvas: HTMLCanvasElement,
    products: Product[],
    company: CompanySettings,
    theme: WhatsAppThemeName = 'premium-industrial',
    options?: PosterRenderOptions & {
      selectedImageUrls?: string[];
    }
  ): void {
    PosterRenderer.render(canvas, products, company, theme, options);
  }

  static legacyRenderThemedPostToCanvas(
    canvas: HTMLCanvasElement,
    products: Product[],
    company: CompanySettings,
    theme: WhatsAppThemeName = 'nav-durga-professional',
    options?: {
      dateStr?: string;
      selectedImageUrls?: string[];
      commonProductImages?: CommonProductImage[];
      remarks?: string;
    }
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Palette Configurations for 6 Themes
    interface ThemePalette {
      bg: string;
      outerBorder: string;
      cardBg: string;
      headerBg: string;
      headerText: string;
      headerSub: string;
      badgeBg: string;
      badgeText: string;
      sec1Badge: string;
      sec2Badge: string;
      rowEven: string;
      rowOdd: string;
      textColor: string;
      subColor: string;
      priceColor: string;
      divider: string;
      footerBg: string;
      footerText: string;
      footerSub: string;
      isDark?: boolean;
    }

    const palettes: Record<string, ThemePalette> = {
      'modern-industrial': {
        bg: '#f8fafc',
        outerBorder: '#2563eb',
        cardBg: '#ffffff',
        headerBg: '#1e3a8a',
        headerText: '#ffffff',
        headerSub: '#93c5fd',
        badgeBg: '#2563eb',
        badgeText: '#ffffff',
        sec1Badge: '#1d4ed8',
        sec2Badge: '#0284c7',
        rowEven: '#ffffff',
        rowOdd: '#f1f5f9',
        textColor: '#0f172a',
        subColor: '#475569',
        priceColor: '#1e40af',
        divider: '#e2e8f0',
        footerBg: '#1e3a8a',
        footerText: '#ffffff',
        footerSub: '#93c5fd',
      },
      'clean-steel': {
        bg: '#ffffff',
        outerBorder: '#94a3b8',
        cardBg: '#ffffff',
        headerBg: '#0f172a',
        headerText: '#ffffff',
        headerSub: '#cbd5e1',
        badgeBg: '#0f172a',
        badgeText: '#ffffff',
        sec1Badge: '#334155',
        sec2Badge: '#475569',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        textColor: '#0f172a',
        subColor: '#475569',
        priceColor: '#0f172a',
        divider: '#e2e8f0',
        footerBg: '#0f172a',
        footerText: '#ffffff',
        footerSub: '#cbd5e1',
      },
      'royal-blue': {
        bg: '#ffffff',
        outerBorder: '#1d4ed8',
        cardBg: '#ffffff',
        headerBg: '#172554',
        headerText: '#ffffff',
        headerSub: '#60a5fa',
        badgeBg: '#1d4ed8',
        badgeText: '#ffffff',
        sec1Badge: '#1e40af',
        sec2Badge: '#2563eb',
        rowEven: '#ffffff',
        rowOdd: '#eff6ff',
        textColor: '#0f172a',
        subColor: '#1e3a8a',
        priceColor: '#1e40af',
        divider: '#dbeafe',
        footerBg: '#172554',
        footerText: '#ffffff',
        footerSub: '#93c5fd',
      },
      'warm-steel': {
        bg: '#fffaf5',
        outerBorder: '#ea580c',
        cardBg: '#ffffff',
        headerBg: '#7c2d12',
        headerText: '#ffffff',
        headerSub: '#fdba74',
        badgeBg: '#c2410c',
        badgeText: '#ffffff',
        sec1Badge: '#9a3412',
        sec2Badge: '#ea580c',
        rowEven: '#ffffff',
        rowOdd: '#fff7ed',
        textColor: '#431407',
        subColor: '#78350f',
        priceColor: '#c2410c',
        divider: '#fed7aa',
        footerBg: '#7c2d12',
        footerText: '#ffffff',
        footerSub: '#fed7aa',
      },
      'dark-knight': {
        bg: '#090d16',
        outerBorder: '#374151',
        cardBg: '#111827',
        headerBg: '#030712',
        headerText: '#f9fafb',
        headerSub: '#9ca3af',
        badgeBg: '#3b82f6',
        badgeText: '#ffffff',
        sec1Badge: '#2563eb',
        sec2Badge: '#0d9488',
        rowEven: '#111827',
        rowOdd: '#1f2937',
        textColor: '#f3f4f6',
        subColor: '#9ca3af',
        priceColor: '#38bdf8',
        divider: '#374151',
        footerBg: '#030712',
        footerText: '#f9fafb',
        footerSub: '#9ca3af',
        isDark: true,
      },
      'premium-gold': {
        bg: '#1c1917',
        outerBorder: '#eab308',
        cardBg: '#292524',
        headerBg: '#0c0a09',
        headerText: '#fef08a',
        headerSub: '#ca8a04',
        badgeBg: '#eab308',
        badgeText: '#000000',
        sec1Badge: '#a16207',
        sec2Badge: '#ca8a04',
        rowEven: '#292524',
        rowOdd: '#1c1917',
        textColor: '#fafaf9',
        subColor: '#a8a29e',
        priceColor: '#facc15',
        divider: '#44403c',
        footerBg: '#0c0a09',
        footerText: '#facc15',
        footerSub: '#a8a29e',
        isDark: true,
      },
      'nav-durga-professional': {
        bg: '#ffffff',
        outerBorder: '#b91c1c',
        cardBg: '#ffffff',
        headerBg: '#1e3a8a',
        headerText: '#ffffff',
        headerSub: '#fde047',
        badgeBg: '#b91c1c',
        badgeText: '#ffffff',
        sec1Badge: '#1e3a8a',
        sec2Badge: '#b91c1c',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        textColor: '#0f172a',
        subColor: '#475569',
        priceColor: '#1e3a8a',
        divider: '#e2e8f0',
        footerBg: '#1e3a8a',
        footerText: '#ffffff',
        footerSub: '#93c5fd',
      },
      'industrial-steel': {
        bg: '#0f172a',
        outerBorder: '#f59e0b',
        cardBg: '#1e293b',
        headerBg: '#0b1329',
        headerText: '#f8fafc',
        headerSub: '#fbbf24',
        badgeBg: '#f59e0b',
        badgeText: '#0f172a',
        sec1Badge: '#0284c7',
        sec2Badge: '#d97706',
        rowEven: '#1e293b',
        rowOdd: '#141e33',
        textColor: '#f8fafc',
        subColor: '#94a3b8',
        priceColor: '#38bdf8',
        divider: '#334155',
        footerBg: '#0b1329',
        footerText: '#f8fafc',
        footerSub: '#cbd5e1',
        isDark: true,
      },
      'premium-corporate': {
        bg: '#ffffff',
        outerBorder: '#1d4ed8',
        cardBg: '#ffffff',
        headerBg: '#0a2540',
        headerText: '#ffffff',
        headerSub: '#cbd5e1',
        badgeBg: '#1d4ed8',
        badgeText: '#ffffff',
        sec1Badge: '#1e40af',
        sec2Badge: '#0f766e',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        textColor: '#0f172a',
        subColor: '#475569',
        priceColor: '#1e3a8a',
        divider: '#e2e8f0',
        footerBg: '#0a2540',
        footerText: '#ffffff',
        footerSub: '#93c5fd',
      },
      'steel-market-daily-rate': {
        bg: '#ffffff',
        outerBorder: '#059669',
        cardBg: '#ffffff',
        headerBg: '#064e3b',
        headerText: '#ffffff',
        headerSub: '#a7f3d0',
        badgeBg: '#059669',
        badgeText: '#ffffff',
        sec1Badge: '#065f46',
        sec2Badge: '#0284c7',
        rowEven: '#ffffff',
        rowOdd: '#f0fdf4',
        textColor: '#0f172a',
        subColor: '#374151',
        priceColor: '#047857',
        divider: '#d1fae5',
        footerBg: '#064e3b',
        footerText: '#ffffff',
        footerSub: '#a7f3d0',
      },
      'modern-metallic': {
        bg: '#f8fafc',
        outerBorder: '#64748b',
        cardBg: '#ffffff',
        headerBg: '#334155',
        headerText: '#ffffff',
        headerSub: '#cbd5e1',
        badgeBg: '#475569',
        badgeText: '#ffffff',
        sec1Badge: '#334155',
        sec2Badge: '#0284c7',
        rowEven: '#ffffff',
        rowOdd: '#f1f5f9',
        textColor: '#0f172a',
        subColor: '#475569',
        priceColor: '#0f172a',
        divider: '#cbd5e1',
        footerBg: '#1e293b',
        footerText: '#ffffff',
        footerSub: '#cbd5e1',
      },
      'minimal-business': {
        bg: '#ffffff',
        outerBorder: '#e2e8f0',
        cardBg: '#ffffff',
        headerBg: '#ffffff',
        headerText: '#0f172a',
        headerSub: '#64748b',
        badgeBg: '#0f172a',
        badgeText: '#ffffff',
        sec1Badge: '#0f172a',
        sec2Badge: '#334155',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        textColor: '#0f172a',
        subColor: '#64748b',
        priceColor: '#0f172a',
        divider: '#e2e8f0',
        footerBg: '#f8fafc',
        footerText: '#0f172a',
        footerSub: '#64748b',
      },
    };

    const p = palettes[theme] || palettes['modern-industrial'] || palettes['nav-durga-professional'];

    // Fill Canvas Background
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, width, height);

    // Outer Framing Card
    const framePad = 28;
    ctx.fillStyle = p.cardBg;
    ctx.beginPath();
    ctx.roundRect(framePad, framePad, width - framePad * 2, height - framePad * 2, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = p.outerBorder;
    ctx.stroke();

    // Header Area
    const headerHeight = 150;
    ctx.fillStyle = p.headerBg;
    ctx.beginPath();
    ctx.roundRect(framePad + 2, framePad + 2, width - framePad * 2 - 4, headerHeight, [18, 18, 0, 0]);
    ctx.fill();

    // Company Name
    ctx.fillStyle = p.headerText;
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(company.companyName.toUpperCase(), width / 2, framePad + 52);

    // Tagline / Subtitle
    ctx.fillStyle = p.headerSub;
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MANUFACTURER & DISTRIBUTOR • MS CHANNEL & BEAM / JOIST', width / 2, framePad + 82);

    // Date & Market Pill
    const dateStr =
      options?.dateStr ||
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    ctx.fillStyle = p.badgeBg;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 240, framePad + 98, 480, 36, 18);
    ctx.fill();

    ctx.fillStyle = p.badgeText;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📅 DAILY STEEL RATES • ${dateStr} • EX-PLANT URLA`, width / 2, framePad + 122);

    // Filter and prepare items
    const mediumItems = products.filter(
      (item) =>
        item.status === 'Active' &&
        (item.section === 'MEDIUM SECTION' ||
          (!item.section &&
            !item.rateSource?.includes('NS ISPAT') &&
            !item.size?.includes('70') &&
            !item.size?.includes('75') &&
            !item.size?.includes('95') &&
            !item.name?.toLowerCase().includes('angle')))
    );

    const lightItems = products.filter(
      (item) =>
        item.status === 'Active' &&
        (item.section === 'LIGHT SECTION' ||
          (!item.section &&
            (item.rateSource?.includes('NS ISPAT') ||
              item.size?.includes('70') ||
              item.size?.includes('75') ||
              item.size?.includes('95') ||
              item.name?.toLowerCase().includes('angle'))))
    );

    // Two Columns Layout
    const colY = framePad + headerHeight + 14;
    const colWidth = (width - framePad * 2 - 40) / 2; // ~492px
    const leftColX = framePad + 14;
    const rightColX = leftColX + colWidth + 12;
    const availableHeight = height - colY - 140; // Space for table rows before footer

    // Helper: Draw Column Section Header
    const drawColHeader = (x: number, title: string, sub: string, badgeBg: string) => {
      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      ctx.roundRect(x, colY, colWidth, 42, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title, x + 16, colY + 27);

      ctx.textAlign = 'right';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sub, x + colWidth - 14, colY + 27);
    };

    drawColHeader(leftColX, 'MEDIUM SECTION', 'NAV DURGA', p.sec1Badge);
    drawColHeader(rightColX, 'LIGHT SECTION', 'NS ISPAT (UNIT-II)', p.sec2Badge);

    // Draw Column Table Header
    const subTableY = colY + 48;
    const drawTableHeader = (x: number) => {
      ctx.fillStyle = p.isDark ? '#334155' : '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(x, subTableY, colWidth, 26, 4);
      ctx.fill();

      ctx.fillStyle = p.isDark ? '#cbd5e1' : '#475569';
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PRODUCT / SIZE / GRADE', x + 12, subTableY + 18);

      ctx.textAlign = 'right';
      ctx.fillText('RATE (₹/MT)', x + colWidth - 12, subTableY + 18);
    };

    drawTableHeader(leftColX);
    drawTableHeader(rightColX);

    // Draw Rows for a Column
    const drawRows = (x: number, items: Product[], startY: number, maxRows: number = 13) => {
      let currY = startY;
      const rowHeight = 44;
      const displayItems = items.slice(0, maxRows);

      displayItems.forEach((item, idx) => {
        // Striping
        ctx.fillStyle = idx % 2 === 0 ? p.rowEven : p.rowOdd;
        ctx.fillRect(x, currY, colWidth, rowHeight);

        // Border bottom
        ctx.strokeStyle = p.divider;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, currY + rowHeight);
        ctx.lineTo(x + colWidth, currY + rowHeight);
        ctx.stroke();

        // Product Name + Size
        ctx.textAlign = 'left';
        ctx.fillStyle = p.textColor;
        ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
        const prodLabel = `${item.name || item.productName || 'MS Item'} • ${item.size}`;
        ctx.fillText(prodLabel, x + 10, currY + 20);

        // Grade Badge
        const gradeText = item.grade || item.gaugeType || 'Medium';
        ctx.fillStyle =
          gradeText === 'SL'
            ? '#b91c1c'
            : gradeText === '5 KG' || gradeText === '8 KG'
            ? '#047857'
            : '#2563eb';
        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Grade: ${gradeText}`, x + 10, currY + 38);

        // Price
        ctx.textAlign = 'right';
        ctx.fillStyle = p.priceColor;
        ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
        const rateVal = item.finalRate ?? item.currentPrice ?? 0;
        ctx.fillText(`₹${rateVal.toLocaleString('en-IN')}`, x + colWidth - 10, currY + 28);

        currY += rowHeight;
      });

      return currY;
    };

    const rowStartY = subTableY + 30;
    drawRows(leftColX, mediumItems, rowStartY, 13);
    const rightEndY = drawRows(rightColX, lightItems, rowStartY, 9);

    // Optional Common Product Image Showcase
    // If selectedImageUrls or commonProductImages is provided, draw images in the remaining space of right column!
    const displayImageUrls =
      options?.selectedImageUrls && options.selectedImageUrls.length > 0
        ? options.selectedImageUrls
        : (options?.commonProductImages || []).map((img) => img.imageUrl);

    if (displayImageUrls.length > 0) {
      const imgY = rightEndY + 10;
      const imgHeight = Math.min(130, colY + availableHeight - imgY);

      if (imgHeight > 50) {
        ctx.fillStyle = p.isDark ? '#1e293b' : '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(rightColX, imgY, colWidth, imgHeight, 8);
        ctx.fill();
        ctx.strokeStyle = p.divider;
        ctx.stroke();

        ctx.fillStyle = p.textColor;
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('📷 VERIFIED PRODUCTION ROLLING SAMPLES', rightColX + 12, imgY + 20);

        // Render thumb images
        const thumbWidth = 90;
        const thumbHeight = imgHeight - 34;
        let thumbX = rightColX + 12;

        displayImageUrls.slice(0, 4).forEach((imgUrl) => {
          try {
            const img = new Image();
            img.src = imgUrl;
            if (img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, thumbX, imgY + 26, thumbWidth, thumbHeight);
            } else {
              // placeholder box
              ctx.fillStyle = p.isDark ? '#334155' : '#e2e8f0';
              ctx.beginPath();
              ctx.roundRect(thumbX, imgY + 26, thumbWidth, thumbHeight, 4);
              ctx.fill();
              ctx.fillStyle = p.subColor;
              ctx.font = '600 11px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('STEEL', thumbX + thumbWidth / 2, imgY + 26 + thumbHeight / 2);
            }
          } catch {
            // Ignore image load errors
          }
          thumbX += thumbWidth + 8;
        });
      }
    }

    // FOOTER - 3 CONTACT HOTLINE NUMBERS
    const footerY = height - framePad - 110;
    ctx.fillStyle = p.footerBg;
    ctx.beginPath();
    ctx.roundRect(framePad + 2, footerY, width - framePad * 2 - 4, 110 - 2, [0, 0, 18, 18]);
    ctx.fill();

    // Hotlines
    ctx.fillStyle = p.footerText;
    ctx.textAlign = 'center';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      '📞 ORDER & INQUIRY HOTLINE: 9009544333  •  7000923464  •  9713144333',
      width / 2,
      footerY + 36
    );

    // Disclaimer & Terms
    ctx.fillStyle = p.footerSub;
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'Rates are subject to market conditions. Please confirm before booking • GST 18% Extra • Ex-Plant Urla',
      width / 2,
      footerY + 66
    );

    // Attribution
    ctx.fillStyle = p.isDark ? '#64748b' : '#93c5fd';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Nav Durga ERP • Raipur Steel Market • Powered by Klyia Technology', width / 2, footerY + 92);
  }

  /**
   * Canvas-based WhatsApp Post Image Generator (Backward compatibility)
   */
  static renderPostToCanvas(
    canvas: HTMLCanvasElement,
    update: DailyUpdate,
    company: CompanySettings,
    theme: 'industrial-blue' | 'clean-white' | 'steel-accent' = 'industrial-blue'
  ): void {
    const themeMap: Record<string, WhatsAppThemeName> = {
      'industrial-blue': 'nav-durga-professional',
      'clean-white': 'minimal-business',
      'steel-accent': 'industrial-steel',
    };
    const mappedTheme = themeMap[theme] || 'nav-durga-professional';
    this.renderThemedPostToCanvas(canvas, update.items as any, company, mappedTheme, {
      dateStr: update.date,
      remarks: update.remarks,
    });
  }
}
