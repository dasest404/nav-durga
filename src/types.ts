export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  grade: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  minOrderQty: number;
  description: string;
  inStock: boolean;
  status: 'Active' | 'Inactive';
  image?: string;
  // Enhanced Steel Product Variation Fields
  productCategory?: string;
  productName?: string;
  size?: string;
  type?: string;
  gaugeType?: string;
  gaugeDifference?: number;
  baseRate?: number;
  loadingCharge?: number;
  insuranceCharge?: number;
  randomLengthDeduction?: number;
  specialLengthCharge?: number;
  paymentAdjustment?: number;
  otherCharges?: number;
  finalRate?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  rateSource?: string;
  section?: 'MEDIUM SECTION' | 'LIGHT SECTION' | string;
  priceHistory: {
    date: string;
    price: number;
    changeReason?: string;
  }[];
}

export type WhatsAppThemeName =
  | 'premium-industrial'
  | 'modern-steel'
  | 'corporate-b2b'
  | 'engineering-grid'
  | 'dark-industrial'
  | 'clean-white-steel'
  | 'market-bulletin'
  | 'modern-industrial'
  | 'clean-steel'
  | 'royal-blue'
  | 'warm-steel'
  | 'dark-knight'
  | 'premium-gold'
  | 'Industrial Steel'
  | 'Premium Corporate'
  | 'Steel Market Daily Rate'
  | 'Modern Metallic'
  | 'Minimal Business'
  | 'Nav Durga Professional'
  | string;

export interface CommonProductImage {
  id: string;
  category: string;
  name: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface RateChargesConfig {
  loadingCharge: number; // default ₹365/MT
  insuranceCharge: number; // default ₹30/MT
  randomLengthDeduction: number; // default ₹300/MT
  specialLengthCharge: number; // default ₹500/MT
  nextDayPaymentAdjustment: number; // default ₹300/MT
  defaultBaseRate: number; // e.g. ₹40,211/MT
  rateSources: string[];
  gaugeTypes: string[];
  productCategories: string[];
}

export interface RateHistoryRecord {
  id: string;
  date: string;
  effectiveFrom: string;
  rateSource: string;
  productId: string;
  productCategory: string;
  productName: string;
  size: string;
  type?: string;
  gaugeType: string;
  grade?: string;
  section?: string;
  baseRate: number;
  gaugeDifference: number;
  loadingCharge: number;
  insuranceCharge: number;
  otherCharges: number;
  previousRate: number;
  finalRate: number;
  priceDifference: number;
  updatedBy: string;
  timestamp: string;
}

export interface GaugeDifferenceMasterItem {
  id: string;
  rateSource: string;
  productCategory: string;
  productName: string;
  size: string;
  gaugeType: string;
  gaugeDifference: number;
  effectiveFrom: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface DailyUpdateItem {
  productId: string;
  productName: string;
  grade: string;
  price: number;
  previousPrice?: number;
  unit: string;
  availability: 'Available' | 'Limited Stock' | 'Booking Open' | 'Out of Stock';
  changeNote?: string;
}

export interface DailyUpdate {
  id: string;
  date: string;
  title: string;
  remarks: string;
  items: DailyUpdateItem[];
  createdAt: string;
  createdBy: string;
  status?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  customerType: 'Wholesaler' | 'Contractor' | 'Builder' | 'Retailer' | 'Fabricator' | 'Infrastructure' | 'Test Customer' | string;
  tag?: string;
  tags?: string[];
  interestedProducts: string[];
  notes: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  createdDate: string;
  creditDays?: number;
}

export interface WhatsAppTestActivity {
  id: string;
  timestamp: string;
  customerName: string;
  phoneNumber: string;
  action: 'WhatsApp Opened' | 'Message Copied' | 'Image Downloaded' | 'Test Update Prepared' | string;
  details?: string;
  status: 'Manual Action';
}

export interface CustomPostRecipient {
  customerId: string;
  customerName: string;
  companyName?: string;
  phoneNumber: string;
  status?: 'Pending' | 'Opened' | 'Copied';
}

export interface CustomWhatsAppPost {
  id: string;
  imageName: string;
  imageUrl: string;
  imageSize?: number;
  message: string;
  recipients: CustomPostRecipient[];
  createdAt: string;
  type: 'Custom Image';
  status: 'Manual Test';
  category?: string;
}

export interface WhatsAppMessageRecord {
  id: string;
  customerId: string;
  customerName: string;
  whatsappNumber: string;
  type: 'sent' | 'received';
  message: string;
  imageUrl?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'inbound' | 'pending';
  source: 'manual' | 'api' | 'simulated';
  context?: string;
}

export interface SalesEnquiry {
  id: string;
  enquiryNumber: string;
  customerId: string;
  customerName: string;
  product: string;
  grade: string;
  quantity: number;
  unit: string;
  expectedPrice?: number;
  quotedPrice?: number;
  source: 'WhatsApp' | 'Phone' | 'Website' | 'Manual' | 'Referral' | 'Direct' | 'Other';
  whatsappMessage?: string;
  date: string;
  salesperson?: string;
  followUpDate?: string;
  status: 'New' | 'Contacted' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Follow-up' | 'Quoted';
  notes: string;
}

export interface OrderProductItem {
  productId: string;
  productName: string;
  grade: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  unitPrice?: number;
  total?: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  products?: OrderProductItem[];
  items?: OrderProductItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  deliveryLocation: string;
  orderDate: string;
  expectedDelivery?: string;
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
  orderStatus: 'New' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  vehicleNumber?: string;
  driverContact?: string;
  notes?: string;
}

export interface QuotationItem {
  productId: string;
  productName: string;
  grade: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  unitPrice?: number;
  total?: number;
}

export interface QuotationTerms {
  delivery?: string;
  payment?: string;
  validity?: string;
  [key: string]: string | undefined;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerContact?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerMobile?: string;
  customerPhone?: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  freightLoading?: number;
  grandTotal?: number;
  total?: number;
  terms: QuotationTerms | string[];
  validUntil?: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  referenceType: 'enquiry' | 'order' | 'general';
  referenceId?: string;
  followUpDate: string;
  followUpTime: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Rescheduled';
  salesperson: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
}

export interface StandardTerms {
  paymentTerms: string;
  deliveryTerms: string;
  validityTerms: string;
  weighbridgeTerms: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  brandName?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone: string;
  whatsapp: string;
  email: string;
  gstin: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
  website?: string;
  poweredBy: string;
  bankDetails?: BankDetails;
  standardTerms?: StandardTerms;
}

export interface WhatsAppConfig {
  status?: 'Not Connected' | 'Connected';
  mode?: 'manual' | 'cloud-api';
  provider?: 'Meta WhatsApp Cloud API' | 'Manual / Web Intent';
  phoneNumberId?: string;
  businessAccountId?: string;
  wabaId?: string;
  apiToken?: string;
  webhookVerifyToken?: string;
  webhookUrl?: string;
  apiUrl?: string;
  autoEnquiryParsing?: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  role: 'Admin' | 'Sales' | 'Staff';
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface CompanyGradeBasicRates {
  [companyOrUnit: string]: {
    Medium?: number;
    SL?: number;
    '5 KG'?: number;
    '8 KG'?: number;
    [grade: string]: number | undefined;
  };
}

export interface CategoryBasicRates {
  'MEDIUM SECTION'?: number;
  'LIGHT SECTION'?: number;
  [categoryOrSection: string]: number | undefined;
}

export type ActiveTab =
  | 'dashboard'
  | 'ai-assistant'
  | 'products'
  | 'daily-rates'
  | 'gauge-master'
  | 'daily-updates'
  | 'whatsapp'
  | 'whatsapp-center'
  | 'customers'
  | 'enquiries'
  | 'quotations'
  | 'orders'
  | 'follow-ups'
  | 'reports'
  | 'settings';

export type SmartDropdownCategory = 'MEDIUM' | 'SL' | 'LIGHT' | '5 KG' | '8 KG';

export type SmartDropdownAction =
  | 'ENTER_TODAYS_PRICE'
  | 'COMPARE_OLD_NEW_PRICE'
  | 'VIEW_TODAYS_PRICE'
  | 'VIEW_PREVIOUS_PRICE'
  | 'VIEW_PRICE_CHANGE_HISTORY'
  | 'CREATE_WHATSAPP_PRICE_IMAGE';

export type AIAssistantIntent =
  | 'rate_update_proposal'
  | 'rate_comparison'
  | 'price_post_generator'
  | 'whatsapp_order_enquiry'
  | 'query_products'
  | 'query_customers'
  | 'query_enquiries'
  | 'enter_todays_price'
  | 'compare_old_new_price'
  | 'view_todays_price'
  | 'view_previous_price'
  | 'view_price_change_history'
  | 'create_whatsapp_price_image'
  | 'general_chat';

export type AIDesignThemeId =
  | 'premium-steel'
  | 'modern-corporate'
  | 'steel-factory'
  | 'rate-sheet'
  | 'medium-sl'
  | 'festival-rate';

export type AIDesignStyle =
  | 'Premium Industrial'
  | 'Modern Steel'
  | 'Corporate'
  | 'Minimal'
  | 'Festival + Price'
  | 'Custom';

export interface AIDesignTemplate {
  id: string;
  name: string;
  style: AIDesignStyle;
  themeId: AIDesignThemeId;
  prompt: string;
  backgroundUrl?: string;
  referenceImageUrl?: string;
  section: 'MEDIUM' | 'SL' | 'COMBINED';
  enabledFields: {
    companyName: boolean;
    date: boolean;
    productName: boolean;
    size: boolean;
    grade: boolean;
    basicRate: boolean;
    gaugeDiff: boolean;
    finalRate: boolean;
    gst: boolean;
    dispatch: boolean;
    contact: boolean;
  };
  isActive: boolean;
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RateUpdateProposalData {
  section: string;
  companyUnit: string;
  proposedBaseRate: number;
  affectedProductsCount: number;
  affectedProductIds: string[];
  previewItems: {
    id: string;
    name: string;
    size: string;
    grade: string;
    gaugeDifference: number;
    currentPrice: number;
    proposedRate: number;
    change: number;
  }[];
  status: 'pending' | 'confirmed' | 'cancelled';
  auditId?: string;
}

export interface RateComparisonData {
  title: string;
  comparisonType: 'today_vs_yesterday' | 'medium_vs_sl' | 'last_7_days' | 'custom';
  summary: string;
  isMissingData?: boolean;
  missingDataReason?: string;
  items: {
    name: string;
    size: string;
    section?: string;
    grade?: string;
    previousPrice: number;
    currentPrice: number;
    difference: number;
    percentChange: number;
  }[];
}

export interface PricePostItem {
  id: string;
  name: string;
  size: string;
  grade: string;
  gaugeDifference: number;
  basicRate: number;
  currentPrice: number;
  proposedPrice: number;
  change: number;
  section?: string;
}

export interface PricePostGeneratorData {
  section: string;
  companyUnit: string;
  priceDelta: number;
  direction: 'increase' | 'decrease' | 'set';
  proposedBaseRate: number;
  dateStr: string;
  previewItems: PricePostItem[];
  defaultTheme: WhatsAppThemeName;
  status: 'draft' | 'approved' | 'broadcasted';
  isConfirmedRates?: boolean;
  totalPages?: number;
  pages?: {
    pageIndex: number;
    title: string;
    items: PricePostItem[];
  }[];
}

export interface AIAssistantQuickOption {
  label: string;
  actionText: string;
  tag?: string;
}

export interface WhatsAppCustomerMatch {
  status: 'exact_match' | 'no_match' | 'multiple_matches';
  customer?: Customer;
  candidates?: Customer[];
  senderPhone: string;
  isUnregisteredLead?: boolean;
}

export interface WhatsAppProductMatch {
  status: 'exact_match' | 'needs_clarification' | 'no_match';
  product?: Product;
  candidates?: Product[];
  detectedSize?: string;
  detectedCategory?: string;
  detectedSection?: string;
  detectedGrade?: string;
  clarificationOptions?: {
    label: string;
    product: Product;
  }[];
}

export interface WhatsAppOrderEnquiryParsed {
  customerMatch: WhatsAppCustomerMatch;
  productMatch: WhatsAppProductMatch;
  intent: 'rate_enquiry' | 'product_requirement' | 'general';
  rawText: string;
  quantity?: number;
  unit: string;
  approvedRate?: number;
  totalAmount?: number;
  generatedResponse: string;
  isRequirementReadyForCRM: boolean;
  clarificationQuestion?: string;
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: AIAssistantIntent;
  rateProposal?: RateUpdateProposalData;
  comparisonData?: RateComparisonData;
  pricePostData?: PricePostGeneratorData;
  whatsAppOrderEnquiry?: WhatsAppOrderEnquiryParsed;
  dropdownAction?: {
    action: SmartDropdownAction;
    category: SmartDropdownCategory;
  };
  quickOptions?: AIAssistantQuickOption[];
  queryResults?: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
    totalCount: number;
  };
}

export interface AIAssistantAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  initiatedBy: string;
  section?: string;
  details: string;
  affectedCount: number;
  status: 'Success' | 'Cancelled' | 'Failed';
}

// ============================================================================
// AI PROMOTIONAL GRAPHIC GENERATOR TYPES (WhatsApp Center)
// ============================================================================

export type AIGraphicLayoutStyle =
  | 'diagonal_power'
  | 'center_gold_seal'
  | 'bold_split_poster'
  | 'industrial_bento'
  | 'dynamic_speed_angles'
  | 'executive_steel_sheet'
  | 'radiant_burst_deal'
  | 'heavy_structural_grid';

export type AIGraphicBackgroundDecor =
  | 'particles_molten'
  | 'hex_mesh_steel'
  | 'radial_sunburst'
  | 'diagonal_slashes'
  | 'blueprint_cad'
  | 'layered_slabs'
  | 'sparks_and_flares';

export type AISteelProduct3DType =
  | 'channel'
  | 'angle'
  | 'beam'
  | 'tmt_bundle'
  | 'billet_stack';

export interface AIGraphicColorPalette {
  name: string;
  bgGradient: [string, string, string];
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  textLight: string;
  textDark: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  goldTrim: string;
}

export interface AISteelProductVisual {
  type: AISteelProduct3DType;
  xRatio: number;
  yRatio: number;
  scale: number;
  rotationDeg: number;
  highlightText?: string;
}

export interface AIGraphicRecipe {
  headline: string;
  subheadline: string;
  badge: string;
  price: string | null;
  priceLabel: string | null;
  features: string[];
  cta: string;
  products: { name: string; tag?: string }[];
  layoutStyle: AIGraphicLayoutStyle;
  colorPalette: AIGraphicColorPalette;
  backgroundDecor: AIGraphicBackgroundDecor;
  productVisuals: AISteelProductVisual[];
  decorations: {
    hasGoldSeal: boolean;
    hasUrlaBadge: boolean;
    hasPrimeQualityShield: boolean;
    hasRibbon: boolean;
    hasSparks: boolean;
    hasCornerTechBrackets: boolean;
  };
  aspectRatio: '1:1' | '4:5';
  seed: number;
  generationId: string;
  formattedShareText: string;
}

export interface AIGeneratedGraphicHistoryItem {
  id: string;
  promptText: string;
  recipe: AIGraphicRecipe;
  dataUrl: string;
  timestamp: string;
  aspectRatio: '1:1' | '4:5';
}

export interface MarketOpeningRates {
  mediumSectionName: string;
  mediumSectionRate: number;
  lightSectionName: string;
  lightSectionRate: number;
  lastUpdated?: string;
  updatedBy?: string;
}


