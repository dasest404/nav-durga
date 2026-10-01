import {
  Product,
  Customer,
  DailyUpdate,
  SalesEnquiry,
  SalesOrder,
  Quotation,
  FollowUp,
  WhatsAppMessageRecord,
  CompanySettings,
  WhatsAppConfig,
  AppUser,
  RateChargesConfig,
  RateHistoryRecord,
  CommonProductImage,
  CompanyGradeBasicRates,
  CategoryBasicRates,
  MarketOpeningRates,
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_WHATSAPP_CONFIG,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  NAV_DURGA_TEST_CUSTOMER,
  INITIAL_DAILY_UPDATES,
  INITIAL_ENQUIRIES,
  INITIAL_ORDERS,
  INITIAL_QUOTATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_WHATSAPP_MESSAGES,
  INITIAL_RATE_CHARGES,
  INITIAL_RATE_HISTORY,
  INITIAL_COMMON_PRODUCT_IMAGES,
  INITIAL_GRADE_BASIC_RATES,
  INITIAL_CATEGORY_BASIC_RATES,
} from '../data/demoData';
import { normalizeGrade } from '../utils/rateCalculator';
import { syncProductMasterWithCanonicalGaugeDiffs } from '../data/productMasterData';

const STORAGE_KEYS = {
  COMPANY: 'navdurga_company_settings_v1',
  WHATSAPP_CONFIG: 'navdurga_whatsapp_config_v1',
  USERS: 'navdurga_users_v1',
  PRODUCTS: 'navdurga_products_v4_active_master',
  CUSTOMERS: 'navdurga_customers_v1',
  DAILY_UPDATES: 'navdurga_daily_updates_v1',
  ENQUIRIES: 'navdurga_enquiries_v1',
  ORDERS: 'navdurga_orders_v1',
  QUOTATIONS: 'navdurga_quotations_v1',
  FOLLOW_UPS: 'navdurga_follow_ups_v1',
  WHATSAPP_MESSAGES: 'navdurga_whatsapp_messages_v1',
  RATE_CHARGES: 'navdurga_rate_charges_v1',
  RATE_HISTORY: 'navdurga_rate_history_v1',
  COMMON_PRODUCT_IMAGES: 'navdurga_common_product_images_v1',
  GRADE_BASIC_RATES: 'navdurga_grade_basic_rates_v1',
  CATEGORY_BASIC_RATES: 'navdurga_category_basic_rates_v1',
  MARKET_OPENING_RATES: 'navdurga_market_opening_rates_v1',
};

export const DEFAULT_MARKET_OPENING_RATES: MarketOpeningRates = {
  mediumSectionName: 'MEDIUM SECTION',
  mediumSectionRate: 49711,
  lightSectionName: 'LIGHT SECTION',
  lightSectionRate: 42211,
};

export interface AppFullState {
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  users: AppUser[];
  products: Product[];
  customers: Customer[];
  dailyUpdates: DailyUpdate[];
  enquiries: SalesEnquiry[];
  orders: SalesOrder[];
  quotations: Quotation[];
  followUps: FollowUp[];
  whatsAppMessages: WhatsAppMessageRecord[];
  rateCharges: RateChargesConfig;
  rateHistory: RateHistoryRecord[];
  commonProductImages: CommonProductImage[];
  gradeBasicRates: CompanyGradeBasicRates;
  categoryBasicRates: CategoryBasicRates;
  marketOpeningRates: MarketOpeningRates;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

function ensureTestCustomer(customers: Customer[]): Customer[] {
  const cleanPhone = (p: string) => (p || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone(NAV_DURGA_TEST_CUSTOMER.mobile);

  const existingIndex = customers.findIndex(
    (c) =>
      c.id === NAV_DURGA_TEST_CUSTOMER.id ||
      cleanPhone(c.whatsapp) === targetPhone ||
      cleanPhone(c.mobile) === targetPhone ||
      c.companyName.toLowerCase() === NAV_DURGA_TEST_CUSTOMER.companyName.toLowerCase() ||
      c.name.toLowerCase() === NAV_DURGA_TEST_CUSTOMER.name.toLowerCase()
  );

  if (existingIndex >= 0) {
    const existing = customers[existingIndex];
    const updated: Customer = {
      ...existing,
      name: NAV_DURGA_TEST_CUSTOMER.name,
      companyName: NAV_DURGA_TEST_CUSTOMER.companyName,
      mobile: NAV_DURGA_TEST_CUSTOMER.mobile,
      whatsapp: NAV_DURGA_TEST_CUSTOMER.whatsapp,
      customerType: 'Test Customer',
      status: 'Active',
      tag: 'WhatsApp Test',
      tags: ['WhatsApp Test'],
    };
    const newList = [...customers];
    newList[existingIndex] = updated;
    return newList;
  } else {
    return [NAV_DURGA_TEST_CUSTOMER, ...customers];
  }
}

export class StorageService {
  static loadState(): AppFullState {
    const rawCustomers = safeGet<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const customers = ensureTestCustomer(rawCustomers);

    // Purge legacy obsolete product caches so old records are completely cleared
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('navdurga_products_v1');
        window.localStorage.removeItem('navdurga_products_v2');
        window.localStorage.removeItem('navdurga_products_v3');
      }
    } catch {
      // safe fallback
    }

    const savedProducts = safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const rawProducts = Array.isArray(savedProducts) && savedProducts.length > 0 ? savedProducts : INITIAL_PRODUCTS;
    const products = syncProductMasterWithCanonicalGaugeDiffs(rawProducts);

    const commonProductImages = safeGet<CommonProductImage[]>(
      STORAGE_KEYS.COMMON_PRODUCT_IMAGES,
      INITIAL_COMMON_PRODUCT_IMAGES
    );

    const gradeBasicRates = safeGet<CompanyGradeBasicRates>(
      STORAGE_KEYS.GRADE_BASIC_RATES,
      INITIAL_GRADE_BASIC_RATES
    );

    const categoryBasicRates = safeGet<CategoryBasicRates>(
      STORAGE_KEYS.CATEGORY_BASIC_RATES,
      INITIAL_CATEGORY_BASIC_RATES
    );

    return {
      company: safeGet<CompanySettings>(STORAGE_KEYS.COMPANY, INITIAL_COMPANY_SETTINGS),
      whatsAppConfig: safeGet<WhatsAppConfig>(STORAGE_KEYS.WHATSAPP_CONFIG, INITIAL_WHATSAPP_CONFIG),
      users: safeGet<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
      products,
      customers,
      dailyUpdates: safeGet<DailyUpdate[]>(STORAGE_KEYS.DAILY_UPDATES, INITIAL_DAILY_UPDATES),
      enquiries: safeGet<SalesEnquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES),
      orders: safeGet<SalesOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
      quotations: safeGet<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
      followUps: safeGet<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS),
      whatsAppMessages: safeGet<WhatsAppMessageRecord[]>(STORAGE_KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES),
      rateCharges: safeGet<RateChargesConfig>(STORAGE_KEYS.RATE_CHARGES, INITIAL_RATE_CHARGES),
      rateHistory: safeGet<RateHistoryRecord[]>(STORAGE_KEYS.RATE_HISTORY, INITIAL_RATE_HISTORY),
      commonProductImages,
      gradeBasicRates,
      categoryBasicRates,
      marketOpeningRates: safeGet<MarketOpeningRates>(STORAGE_KEYS.MARKET_OPENING_RATES, DEFAULT_MARKET_OPENING_RATES),
    };
  }

  static saveState(state: AppFullState): void {
    safeSet(STORAGE_KEYS.COMPANY, state.company);
    safeSet(STORAGE_KEYS.WHATSAPP_CONFIG, state.whatsAppConfig);
    safeSet(STORAGE_KEYS.USERS, state.users);
    safeSet(STORAGE_KEYS.PRODUCTS, state.products);
    safeSet(STORAGE_KEYS.CUSTOMERS, state.customers);
    safeSet(STORAGE_KEYS.DAILY_UPDATES, state.dailyUpdates);
    safeSet(STORAGE_KEYS.ENQUIRIES, state.enquiries);
    safeSet(STORAGE_KEYS.ORDERS, state.orders);
    safeSet(STORAGE_KEYS.QUOTATIONS, state.quotations);
    safeSet(STORAGE_KEYS.FOLLOW_UPS, state.followUps);
    safeSet(STORAGE_KEYS.WHATSAPP_MESSAGES, state.whatsAppMessages);
    safeSet(STORAGE_KEYS.RATE_CHARGES, state.rateCharges);
    safeSet(STORAGE_KEYS.RATE_HISTORY, state.rateHistory);
    safeSet(STORAGE_KEYS.COMMON_PRODUCT_IMAGES, state.commonProductImages);
    safeSet(STORAGE_KEYS.GRADE_BASIC_RATES, state.gradeBasicRates);
    safeSet(STORAGE_KEYS.CATEGORY_BASIC_RATES, state.categoryBasicRates);
    safeSet(STORAGE_KEYS.MARKET_OPENING_RATES, state.marketOpeningRates);
  }

  static getMarketOpeningRates(): MarketOpeningRates {
    return safeGet<MarketOpeningRates>(STORAGE_KEYS.MARKET_OPENING_RATES, DEFAULT_MARKET_OPENING_RATES);
  }

  static saveMarketOpeningRates(rates: MarketOpeningRates): void {
    safeSet(STORAGE_KEYS.MARKET_OPENING_RATES, rates);
    // Also sync categoryBasicRates
    const catRates = safeGet<CategoryBasicRates>(STORAGE_KEYS.CATEGORY_BASIC_RATES, INITIAL_CATEGORY_BASIC_RATES);
    catRates['MEDIUM SECTION'] = rates.mediumSectionRate;
    catRates['LIGHT SECTION'] = rates.lightSectionRate;
    safeSet(STORAGE_KEYS.CATEGORY_BASIC_RATES, catRates);
  }

  static getRateCharges(): RateChargesConfig {
    return safeGet<RateChargesConfig>(STORAGE_KEYS.RATE_CHARGES, INITIAL_RATE_CHARGES);
  }

  static setRateCharges(charges: RateChargesConfig): void {
    safeSet(STORAGE_KEYS.RATE_CHARGES, charges);
  }

  static getRateHistory(): RateHistoryRecord[] {
    return safeGet<RateHistoryRecord[]>(STORAGE_KEYS.RATE_HISTORY, INITIAL_RATE_HISTORY);
  }

  static setRateHistory(history: RateHistoryRecord[]): void {
    safeSet(STORAGE_KEYS.RATE_HISTORY, history);
  }

  static addRateHistory(record: RateHistoryRecord): void {
    const existing = this.getRateHistory();
    this.setRateHistory([record, ...existing]);
  }

  static getCompanySettings(): CompanySettings {
    return safeGet<CompanySettings>(STORAGE_KEYS.COMPANY, INITIAL_COMPANY_SETTINGS);
  }

  static setCompanySettings(settings: CompanySettings): void {
    safeSet(STORAGE_KEYS.COMPANY, settings);
  }

  static getWhatsAppConfig(): WhatsAppConfig {
    return safeGet<WhatsAppConfig>(STORAGE_KEYS.WHATSAPP_CONFIG, INITIAL_WHATSAPP_CONFIG);
  }

  static setWhatsAppConfig(config: WhatsAppConfig): void {
    safeSet(STORAGE_KEYS.WHATSAPP_CONFIG, config);
  }

  static getUsers(): AppUser[] {
    return safeGet<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static setUsers(users: AppUser[]): void {
    safeSet(STORAGE_KEYS.USERS, users);
  }

  static getProducts(): Product[] {
    return safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static setProducts(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  }

  static getCustomers(): Customer[] {
    const raw = safeGet<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return ensureTestCustomer(raw);
  }

  static setCustomers(customers: Customer[]): void {
    safeSet(STORAGE_KEYS.CUSTOMERS, customers);
  }

  static getDailyUpdates(): DailyUpdate[] {
    return safeGet<DailyUpdate[]>(STORAGE_KEYS.DAILY_UPDATES, INITIAL_DAILY_UPDATES);
  }

  static setDailyUpdates(updates: DailyUpdate[]): void {
    safeSet(STORAGE_KEYS.DAILY_UPDATES, updates);
  }

  static getEnquiries(): SalesEnquiry[] {
    return safeGet<SalesEnquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);
  }

  static setEnquiries(enquiries: SalesEnquiry[]): void {
    safeSet(STORAGE_KEYS.ENQUIRIES, enquiries);
  }

  static getOrders(): SalesOrder[] {
    return safeGet<SalesOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  static setOrders(orders: SalesOrder[]): void {
    safeSet(STORAGE_KEYS.ORDERS, orders);
  }

  static getQuotations(): Quotation[] {
    return safeGet<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  }

  static setQuotations(quotations: Quotation[]): void {
    safeSet(STORAGE_KEYS.QUOTATIONS, quotations);
  }

  static getFollowUps(): FollowUp[] {
    return safeGet<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
  }

  static setFollowUps(followUps: FollowUp[]): void {
    safeSet(STORAGE_KEYS.FOLLOW_UPS, followUps);
  }

  static getWhatsAppMessages(): WhatsAppMessageRecord[] {
    return safeGet<WhatsAppMessageRecord[]>(STORAGE_KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
  }

  static setWhatsAppMessages(messages: WhatsAppMessageRecord[]): void {
    safeSet(STORAGE_KEYS.WHATSAPP_MESSAGES, messages);
  }

  static getCommonProductImages(): CommonProductImage[] {
    return safeGet<CommonProductImage[]>(
      STORAGE_KEYS.COMMON_PRODUCT_IMAGES,
      INITIAL_COMMON_PRODUCT_IMAGES
    );
  }

  static setCommonProductImages(images: CommonProductImage[]): void {
    safeSet(STORAGE_KEYS.COMMON_PRODUCT_IMAGES, images);
  }

  static saveCommonProductImages(images: CommonProductImage[]): void {
    safeSet(STORAGE_KEYS.COMMON_PRODUCT_IMAGES, images);
  }

  static resetToFactoryDefaults(): void {
    this.resetToDemoData();
  }

  static resetToDemoData(): void {
    safeSet(STORAGE_KEYS.COMPANY, INITIAL_COMPANY_SETTINGS);
    safeSet(STORAGE_KEYS.WHATSAPP_CONFIG, INITIAL_WHATSAPP_CONFIG);
    safeSet(STORAGE_KEYS.USERS, INITIAL_USERS);
    safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    safeSet(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    safeSet(STORAGE_KEYS.DAILY_UPDATES, INITIAL_DAILY_UPDATES);
    safeSet(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);
    safeSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    safeSet(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    safeSet(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    safeSet(STORAGE_KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
    safeSet(STORAGE_KEYS.COMMON_PRODUCT_IMAGES, INITIAL_COMMON_PRODUCT_IMAGES);
  }
}
