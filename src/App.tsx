import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
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
} from './types';
import { StorageService, AppFullState } from './services/storageService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { DailyUpdatesView } from './components/DailyUpdatesView';
import { DailyUpdateFormModal } from './components/DailyUpdateFormModal';
import { CustomersView } from './components/CustomersView';
import { CustomerDetailView } from './components/CustomerDetailView';
import { CustomerFormModal } from './components/CustomerFormModal';
import { WhatsAppCenterView } from './components/WhatsAppCenterView';
import { EnquiriesView } from './components/EnquiriesView';
import { QuotationsView } from './components/QuotationsView';
import { OrdersView } from './components/OrdersView';
import { SettingsView } from './components/SettingsView';
import { PostGeneratorModal } from './components/PostGeneratorModal';
import { SendTestWhatsAppModal } from './components/SendTestWhatsAppModal';
import { DailyRateUpdateView } from './components/DailyRateUpdateView';
import { GaugeDifferenceMasterView } from './components/GaugeDifferenceMasterView';
import { AIAssistantView } from './components/AIAssistantView';
import { RateChargesConfig, RateHistoryRecord, GaugeDifferenceMasterItem, CompanyGradeBasicRates, CategoryBasicRates } from './types';
import { calculateFinalRate } from './utils/rateCalculator';

export default function App() {
  // Load initial persistent state
  const [appState, setAppState] = useState<AppFullState>(() => StorageService.loadState());

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalUpdate, setPostModalUpdate] = useState<DailyUpdate | null>(null);

  const [isSendTestModalOpen, setIsSendTestModalOpen] = useState(false);
  const [testModalUpdate, setTestModalUpdate] = useState<DailyUpdate | null>(null);

  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDailyUpdateFormOpen, setIsDailyUpdateFormOpen] = useState(false);

  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Save state on changes
  useEffect(() => {
    StorageService.saveState(appState);
  }, [appState]);

  // Derived counts for badges
  const newEnquiriesCount = appState.enquiries.filter((e) => e.status === 'New').length;
  const pendingOrdersCount = appState.orders.filter(
    (o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing'
  ).length;
  const pendingFollowUpsCount = appState.followUps.filter((f) => f.status === 'Pending').length;

  // Handlers for Navigation
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedCustomer(null); // Return to list view if changing main tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab('customers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomerById = (customerId: string) => {
    const cust = appState.customers.find((c) => c.id === customerId);
    if (cust) {
      setSelectedCustomer(cust);
      setActiveTab('customers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Post Generator
  const handleOpenPostGenerator = (update?: DailyUpdate) => {
    const targetUpdate = update || appState.dailyUpdates[0];
    setPostModalUpdate(targetUpdate);
    setIsPostModalOpen(true);
  };

  // Send Test WhatsApp Modal
  const handleOpenSendTestWhatsApp = (update?: DailyUpdate) => {
    const targetUpdate = update || appState.dailyUpdates[0];
    setTestModalUpdate(targetUpdate);
    setIsSendTestModalOpen(true);
  };

  // Preselected category / search when opening Daily Rates from AI Assistant
  const [dailyRatesPreselection, setDailyRatesPreselection] = useState<{
    category: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL';
    search?: string;
  }>({ category: 'MEDIUM SECTION', search: '' });

  const handleOpenDailyRatesForSection = (
    category: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL',
    search?: string
  ) => {
    setDailyRatesPreselection({ category, search });
    setActiveTab('daily-rates');
  };

  // Product Actions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductDetailOpen(false);
    setIsProductFormOpen(true);
  };

  const handleViewProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setIsProductDetailOpen(true);
  };

  const handleSaveProduct = (data: Partial<Product>) => {
    if (editingProduct) {
      const updated = appState.products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...data,
              productName: data.productName || data.name || p.productName || p.name,
              productCategory: data.productCategory || data.category || p.productCategory || p.category,
              category: data.productCategory || data.category || p.category,
              name: data.productName || data.name || p.name,
              size: data.size || p.size,
              grade: data.grade || p.grade,
              gaugeType: data.gaugeType || p.gaugeType,
              rateSource: data.rateSource || p.rateSource,
              baseRate: data.baseRate ?? p.baseRate,
              gaugeDifference: data.gaugeDifference ?? p.gaugeDifference,
              loadingCharge: data.loadingCharge ?? p.loadingCharge,
              insuranceCharge: data.insuranceCharge ?? p.insuranceCharge,
              otherCharges: data.otherCharges ?? p.otherCharges,
              finalRate: data.finalRate ?? data.currentPrice ?? p.finalRate ?? p.currentPrice,
              currentPrice: data.finalRate ?? data.currentPrice ?? p.currentPrice,
              previousPrice: data.previousPrice ?? p.previousPrice,
              priceChange:
                (data.finalRate ?? data.currentPrice ?? p.currentPrice) -
                (data.previousPrice ?? p.previousPrice),
            }
          : p
      );
      setAppState({ ...appState, products: updated });
    } else {
      const currentRate = data.finalRate || data.currentPrice || 48106;
      const prevRate = data.previousPrice || currentRate;
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: data.productName || data.name || 'MS Channel',
        productName: data.productName || data.name || 'MS Channel',
        productCategory: data.productCategory || data.category || 'MS Channel',
        category: data.productCategory || data.category || 'MS Channel',
        size: data.size || '70 × 35 mm',
        grade: data.grade || `${data.size || '70 × 35 mm'} (${data.gaugeType || 'SL'})`,
        gaugeType: data.gaugeType || 'SL',
        rateSource: data.rateSource || 'NS ISPAT (INDIA) PVT. LTD. UNIT-II',
        code: data.code || `ND-${Math.floor(100 + Math.random() * 900)}`,
        unit: data.unit || 'MT',
        baseRate: data.baseRate || 40211,
        gaugeDifference: data.gaugeDifference !== undefined ? data.gaugeDifference : 7500,
        loadingCharge: data.loadingCharge !== undefined ? data.loadingCharge : 365,
        insuranceCharge: data.insuranceCharge !== undefined ? data.insuranceCharge : 30,
        otherCharges: data.otherCharges || 0,
        finalRate: currentRate,
        currentPrice: currentRate,
        previousPrice: prevRate,
        priceChange: currentRate - prevRate,
        minOrderQty: data.minOrderQty || 5,
        description: data.description || '',
        inStock: data.inStock ?? true,
        status: data.status || 'Active',
        priceHistory: data.priceHistory || [
          {
            date: new Date().toISOString().split('T')[0],
            price: currentRate,
            changeReason: 'Initial specification registration',
          },
        ],
      };
      setAppState({ ...appState, products: [newProd, ...appState.products] });
    }
  };

  // Daily Rate Management Batch Handler
  const handleSaveDailyRateBatch = (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    newCharges?: RateChargesConfig,
    updatedGradeBasicRates?: CompanyGradeBasicRates,
    updatedCategoryBasicRates?: CategoryBasicRates
  ) => {
    // Synchronize currentPrice with calculated finalRate
    const mappedProducts = updatedProducts.map((p) => {
      const final = p.finalRate ?? p.currentPrice;
      const prev = p.previousPrice ?? final;
      return {
        ...p,
        finalRate: final,
        currentPrice: final,
        previousPrice: prev,
        priceChange: final - prev,
      };
    });

    setAppState((prev) => ({
      ...prev,
      products: mappedProducts,
      rateHistory: [...newHistory, ...(prev.rateHistory || [])],
      rateCharges: newCharges || prev.rateCharges,
      gradeBasicRates: updatedGradeBasicRates || prev.gradeBasicRates,
      categoryBasicRates: updatedCategoryBasicRates || prev.categoryBasicRates,
    }));
  };

  // Gauge Difference Master update handler
  const handleUpdateGaugeDifferenceProducts = (updatedProducts: Product[]) => {
    setAppState((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const handleToggleProductStatus = (productId: string) => {
    const updated = appState.products.map((p) =>
      p.id === productId ? { ...p, status: (p.status === 'Active' ? 'Inactive' : 'Active') as Product['status'] } : p
    );
    setAppState({ ...appState, products: updated });
  };

  const handleQuickUpdateProductPrice = (productId: string, newPrice: number, reason: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = appState.products.map((p) => {
      if (p.id === productId) {
        const diff = newPrice - p.currentPrice;
        const newHistory = [{ date: today, price: newPrice, changeReason: reason }, ...(p.priceHistory || [])];
        return {
          ...p,
          previousPrice: p.currentPrice,
          currentPrice: newPrice,
          priceChange: diff,
          priceHistory: newHistory,
        };
      }
      return p;
    });
    setAppState({ ...appState, products: updated });
    if (selectedProduct && selectedProduct.id === productId) {
      const found = updated.find((p) => p.id === productId);
      if (found) setSelectedProduct(found);
    }
  };

  // Daily Updates Actions
  const handleSaveDailyUpdate = (newUpdate: DailyUpdate, openGenerator = false) => {
    const updatedList = [newUpdate, ...appState.dailyUpdates];

    // Also update current prices in product catalog if matching
    const updatedProducts = appState.products.map((prod) => {
      const itemMatch = newUpdate.items.find((it) => it.productId === prod.id || it.grade === prod.grade);
      if (itemMatch) {
        return {
          ...prod,
          previousPrice: prod.currentPrice,
          currentPrice: itemMatch.price,
          priceChange: itemMatch.price - prod.currentPrice,
          priceHistory: [
            {
              date: newUpdate.date,
              price: itemMatch.price,
              changeReason: `Daily rate update: ${newUpdate.title}`,
            },
            ...(prod.priceHistory || []),
          ],
        };
      }
      return prod;
    });

    setAppState((prev: AppFullState) => ({
      ...prev,
      products: updatedProducts,
      dailyUpdates: updatedList,
    }));

    if (openGenerator) {
      setPostModalUpdate(newUpdate);
      setIsPostModalOpen(true);
    }
  };

  // Dedicated Section-based Daily Price Update Synchronizer
  const handleUpdateSectionPrices = (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    sectionName?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];

    // Identify changed products to build published broadcast sheet
    const changedProducts = updatedProducts.filter((p) => {
      const orig = appState.products.find((o) => o.id === p.id);
      return orig && orig.currentPrice !== p.currentPrice;
    });

    let updatedDailyUpdates = appState.dailyUpdates;
    if (changedProducts.length > 0) {
      const newDailyUpdate: DailyUpdate = {
        id: `upd-${Date.now()}`,
        date: today,
        title: `${sectionName || 'Section'} Daily Price Revision (${changedProducts.length} items)`,
        items: updatedProducts
          .filter((p) => (sectionName ? p.section === sectionName : true))
          .map((p) => ({
            productId: p.id,
            productName: p.name,
            grade: p.grade,
            price: p.currentPrice,
            previousPrice: p.previousPrice,
            unit: p.unit || 'MT',
            availability: p.inStock ? 'Available' : 'Booking Open',
            changeNote:
              p.priceChange > 0
                ? `+₹${p.priceChange} / ${p.unit}`
                : p.priceChange < 0
                ? `-₹${Math.abs(p.priceChange)} / ${p.unit}`
                : 'Stable',
          })),
        remarks: `Official Daily Price Revision for ${sectionName || 'Section'}. Ex-plant Raipur. GST 18% extra.`,
        status: 'Published',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin',
      };
      updatedDailyUpdates = [newDailyUpdate, ...appState.dailyUpdates];
    }

    setAppState((prev: AppFullState) => ({
      ...prev,
      products: updatedProducts,
      rateHistory: [...newHistory, ...(prev.rateHistory || [])],
      dailyUpdates: updatedDailyUpdates,
    }));
  };

  // Customer Actions
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerFormOpen(true);
  };

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setIsCustomerFormOpen(true);
  };

  const handleSaveCustomer = (data: Partial<Customer>) => {
    if (editingCustomer) {
      const updated = appState.customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...data } : c
      );
      setAppState({ ...appState, customers: updated });
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...data });
      }
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: data.name || 'New Customer',
        companyName: data.companyName || 'Industrial Firm',
        mobile: data.mobile || '+91 98271 00000',
        whatsapp: data.whatsapp || data.mobile || '+91 98271 00000',
        email: data.email || '',
        address: data.address || '',
        city: data.city || 'Raipur',
        state: data.state || 'Chhattisgarh',
        gstin: data.gstin || '22AABC00000',
        customerType: data.customerType || 'Contractor',
        interestedProducts: data.interestedProducts || ['TMT Fe 500D'],
        notes: data.notes || '',
        status: data.status || 'Active',
        creditDays: data.creditDays || 7,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setAppState({ ...appState, customers: [newCust, ...appState.customers] });
      setSelectedCustomer(newCust);
    }
  };

  // WhatsApp logs
  const handleLogWhatsAppMessage = (record: WhatsAppMessageRecord) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      whatsAppMessages: [record, ...prev.whatsAppMessages],
    }));
  };

  // Sales Enquiry Actions
  const handleAddEnquiry = (enquiryData: Partial<SalesEnquiry>) => {
    const newEnq: SalesEnquiry = {
      id: `enq-${Date.now()}`,
      enquiryNumber: enquiryData.enquiryNumber || `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enquiryData.customerId || appState.customers[0]?.id || 'c1',
      customerName: enquiryData.customerName || 'Customer',
      product: enquiryData.product || 'TMT Steel Rebar',
      grade: enquiryData.grade || 'Fe 500D',
      quantity: enquiryData.quantity || 10,
      unit: enquiryData.unit || 'MT',
      quotedPrice: enquiryData.quotedPrice,
      source: enquiryData.source || 'WhatsApp',
      status: enquiryData.status || 'New',
      notes: enquiryData.notes || '',
      followUpDate: enquiryData.followUpDate,
      date: enquiryData.date || new Date().toISOString().split('T')[0],
    };
    setAppState((prev: AppFullState) => ({
      ...prev,
      enquiries: [newEnq, ...prev.enquiries],
    }));
  };

  const handleUpdateEnquiryStatus = (enquiryId: string, newStatus: SalesEnquiry['status']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e)),
    }));
  };

  const handleConvertEnquiryToQuotation = (enq: SalesEnquiry) => {
    const cust = appState.customers.find((c) => c.id === enq.customerId);
    const subtotal = (enq.quantity || 10) * (enq.quotedPrice || 58500);
    const taxAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + taxAmount;
    const standardTerms = appState.company.standardTerms;

    const newQuot: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `NDI-QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enq.customerId,
      customerName: enq.customerName,
      customerContact: cust?.name || enq.customerName,
      customerMobile: cust?.mobile || '+91 98261 00000',
      customerGstin: cust?.gstin || '22AABC00000',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: 'p1',
          productName: enq.product,
          grade: enq.grade,
          quantity: enq.quantity,
          unit: enq.unit,
          rate: enq.quotedPrice || 58500,
          amount: subtotal,
          unitPrice: enq.quotedPrice || 58500,
          total: subtotal,
        },
      ],
      subtotal,
      taxRate: 18,
      taxAmount,
      grandTotal,
      total: grandTotal,
      terms: {
        delivery: standardTerms?.deliveryTerms || 'Ex-plant Urla, Raipur',
        payment: standardTerms?.paymentTerms || '100% advance RTGS',
        validity: standardTerms?.validityTerms || '24 hours',
      },
      status: 'Sent',
    };

    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: [newQuot, ...prev.quotations],
      enquiries: prev.enquiries.map((e) => (e.id === enq.id ? { ...e, status: 'Quoted' } : e)),
    }));
    setActiveTab('quotations');
  };

  const handleConvertEnquiryToOrder = (enq: SalesEnquiry) => {
    const subtotal = (enq.quantity || 10) * (enq.quotedPrice || 58500);
    const item = {
      productId: 'p1',
      productName: enq.product,
      grade: enq.grade,
      quantity: enq.quantity,
      unit: enq.unit,
      rate: enq.quotedPrice || 58500,
      amount: subtotal,
      unitPrice: enq.quotedPrice || 58500,
      total: subtotal,
    };

    const newOrder: SalesOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `NDI-ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enq.customerId,
      customerName: enq.customerName,
      products: [item],
      items: [item],
      total: subtotal,
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryLocation: 'Naya Raipur Site Godown',
    };

    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      enquiries: prev.enquiries.map((e) => (e.id === enq.id ? { ...e, status: 'Won' } : e)),
    }));
    setActiveTab('orders');
  };

  // Quotation Actions
  const handleAddQuotation = (quotation: Quotation) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: [quotation, ...prev.quotations],
    }));
  };

  const handleUpdateQuotationStatus = (id: string, status: Quotation['status']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: prev.quotations.map((q: Quotation) => (q.id === id ? { ...q, status } : q)),
    }));
  };

  // Order Actions
  const handleAddOrder = (order: SalesOrder) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: [order, ...prev.orders],
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: SalesOrder['orderStatus']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: prev.orders.map((o: SalesOrder) => (o.id === orderId ? { ...o, orderStatus: status } : o)),
    }));
  };

  const handleUpdatePaymentStatus = (orderId: string, status: SalesOrder['paymentStatus']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: prev.orders.map((o: SalesOrder) => (o.id === orderId ? { ...o, paymentStatus: status } : o)),
    }));
  };

  // Settings
  const handleSaveCompanySettings = (updated: CompanySettings) => {
    setAppState((prev: AppFullState) => ({ ...prev, company: updated }));
  };

  const handleSaveWhatsAppConfig = (updated: WhatsAppConfig) => {
    setAppState((prev: AppFullState) => ({ ...prev, whatsAppConfig: updated }));
  };

  const handleResetDemoData = () => {
    StorageService.resetToFactoryDefaults();
    setAppState(StorageService.loadState());
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Global Header */}
      <Header
        company={appState.company}
        currentTab={activeTab}
        onNavigate={handleTabChange}
        mobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setIsMobileMenuOpen}
        pendingEnquiriesCount={newEnquiriesCount}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full max-w-7xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={handleTabChange}
          pendingEnquiriesCount={newEnquiriesCount}
          pendingFollowUpsCount={pendingFollowUpsCount}
          todayOrdersCount={pendingOrdersCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              products={appState.products}
              customers={appState.customers}
              dailyUpdates={appState.dailyUpdates}
              enquiries={appState.enquiries}
              orders={appState.orders}
              followUps={appState.followUps}
              whatsAppMessages={appState.whatsAppMessages}
              onNavigate={handleTabChange}
              onOpenCreateUpdate={() => setIsDailyUpdateFormOpen(true)}
              onOpenCreateEnquiry={() => {
                handleAddEnquiry({});
                setActiveTab('enquiries');
              }}
              onOpenCreateOrder={() => setActiveTab('orders')}
              onOpenAddCustomer={handleAddCustomer}
              onOpenAddProduct={handleAddProduct}
              onViewCustomerDetail={handleSelectCustomerById}
              onViewProductDetail={(productId: string) => {
                const prod = appState.products.find((p) => p.id === productId);
                if (prod) handleViewProduct(prod);
              }}
              onGeneratePostForUpdate={(u) => handleOpenPostGenerator(u)}
            />
          )}

          {/* VIEW: NAV DURGA AI ASSISTANT */}
          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              products={appState.products}
              rateHistory={appState.rateHistory || []}
              dailyUpdates={appState.dailyUpdates}
              company={appState.company}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              rateCharges={appState.rateCharges}
              customers={appState.customers}
              enquiries={appState.enquiries}
              orders={appState.orders}
              whatsAppConfig={appState.whatsAppConfig}
              onApplyRateBatch={handleSaveDailyRateBatch}
              onSaveDailyUpdate={(u) => handleSaveDailyUpdate(u)}
              onNavigateTab={handleTabChange}
              onOpenDailyRatesForSection={handleOpenDailyRatesForSection}
              onLogWhatsAppMessage={handleLogWhatsAppMessage}
              onAddEnquiry={handleAddEnquiry}
            />
          )}

          {/* VIEW: PRODUCTS */}
          {activeTab === 'products' && (
            <ProductsView
              products={appState.products}
              rateCharges={appState.rateCharges}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
              onToggleStatus={handleToggleProductStatus}
              onQuickUpdatePrice={handleQuickUpdateProductPrice}
              onOpenDailyRates={() => setActiveTab('daily-rates')}
              onOpenGaugeMaster={() => setActiveTab('gauge-master')}
            />
          )}

          {/* VIEW: DAILY RATE MANAGEMENT */}
          {activeTab === 'daily-rates' && (
            <DailyRateUpdateView
              products={appState.products}
              rateCharges={appState.rateCharges}
              rateHistory={appState.rateHistory || []}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              initialCategory={dailyRatesPreselection.category}
              initialSearch={dailyRatesPreselection.search || ''}
              onSaveRates={handleSaveDailyRateBatch}
              onOpenGaugeMaster={() => setActiveTab('gauge-master')}
              onOpenWhatsAppBroadcast={() => handleOpenPostGenerator()}
            />
          )}

          {/* VIEW: GAUGE DIFFERENCE MASTER */}
          {activeTab === 'gauge-master' && (
            <GaugeDifferenceMasterView
              products={appState.products}
              rateCharges={appState.rateCharges}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              onUpdateProducts={handleUpdateGaugeDifferenceProducts}
              onOpenDailyRates={() => setActiveTab('daily-rates')}
            />
          )}

          {/* VIEW: DAILY UPDATES */}
          {activeTab === 'daily-updates' && (
            <DailyUpdatesView
              products={appState.products}
              dailyUpdates={appState.dailyUpdates}
              company={appState.company}
              rateHistory={appState.rateHistory || []}
              onOpenCreateUpdate={() => setIsDailyUpdateFormOpen(true)}
              onGeneratePost={(u) => handleOpenPostGenerator(u)}
              onNavigateToWhatsAppCenter={() => {
                setActiveTab('whatsapp');
              }}
              onSendTestWhatsApp={handleOpenSendTestWhatsApp}
              onUpdateSectionPrices={handleUpdateSectionPrices}
            />
          )}

          {/* VIEW: CUSTOMERS */}
          {activeTab === 'customers' && (
            selectedCustomer ? (
              <CustomerDetailView
                customer={selectedCustomer}
                enquiries={appState.enquiries}
                orders={appState.orders}
                quotations={appState.quotations}
                followUps={appState.followUps}
                whatsAppMessages={appState.whatsAppMessages}
                onBack={() => setSelectedCustomer(null)}
                onEditCustomer={handleEditCustomer}
                onCreateEnquiryForCustomer={(c) => {
                  handleAddEnquiry({
                    customerId: c.id,
                    customerName: c.companyName,
                  });
                  setActiveTab('enquiries');
                }}
                onCreateQuotationForCustomer={() => {
                  setActiveTab('quotations');
                }}
                onCreateOrderForCustomer={() => {
                  setActiveTab('orders');
                }}
                onScheduleFollowUp={(c) => {
                  alert(`Follow-up scheduled for ${c.companyName}. Recorded in audit timeline.`);
                }}
                onSendCustomWhatsApp={(c, msg) => {
                  handleLogWhatsAppMessage({
                    id: `msg-${Date.now()}`,
                    customerId: c.id,
                    customerName: c.companyName,
                    whatsappNumber: c.whatsapp || c.mobile,
                    type: 'sent',
                    message: msg,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    source: 'manual',
                    context: 'Customer Direct Chat',
                  });
                }}
              />
            ) : (
              <CustomersView
                customers={appState.customers}
                onSelectCustomer={handleSelectCustomer}
                onAddCustomer={handleAddCustomer}
                onEditCustomer={handleEditCustomer}
              />
            )
          )}

          {/* VIEW: WHATSAPP CENTER */}
          {(activeTab === 'whatsapp' || activeTab === 'whatsapp-center') && (
            <WhatsAppCenterView
              dailyUpdates={appState.dailyUpdates}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              whatsAppConfig={appState.whatsAppConfig}
              onLogMessage={handleLogWhatsAppMessage}
              onCreateEnquiryFromWebhook={(enq) => {
                setAppState((prev: AppFullState) => ({
                  ...prev,
                  enquiries: [enq, ...prev.enquiries],
                }));
              }}
              onNavigateToCustomer={handleSelectCustomerById}
              onNavigateTab={handleTabChange}
            />
          )}

          {/* VIEW: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <EnquiriesView
              enquiries={appState.enquiries}
              customers={appState.customers}
              products={appState.products}
              onAddEnquiry={handleAddEnquiry}
              onUpdateStatus={handleUpdateEnquiryStatus}
              onConvertToQuotation={handleConvertEnquiryToQuotation}
              onConvertToOrder={handleConvertEnquiryToOrder}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {/* VIEW: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <QuotationsView
              quotations={appState.quotations}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              onAddQuotation={handleAddQuotation}
              onUpdateStatus={handleUpdateQuotationStatus}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {/* VIEW: ORDERS */}
          {activeTab === 'orders' && (
            <OrdersView
              orders={appState.orders}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              company={appState.company}
              whatsAppConfig={appState.whatsAppConfig}
              onSaveCompany={handleSaveCompanySettings}
              onSaveWhatsAppConfig={handleSaveWhatsAppConfig}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        currentTab={activeTab}
        onSelectTab={handleTabChange}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pendingEnquiriesCount={newEnquiriesCount}
        company={appState.company}
      />

      {/* MODAL: Square WhatsApp Post Graphic Generator */}
      <PostGeneratorModal
        update={postModalUpdate || appState.dailyUpdates[0]}
        company={appState.company}
        products={appState.products}
        commonProductImages={appState.commonProductImages || []}
        gradeBasicRates={appState.gradeBasicRates}
        categoryBasicRates={appState.categoryBasicRates}
        onSaveCommonProductImages={(imgs) => {
          setAppState((prev) => ({ ...prev, commonProductImages: imgs }));
          StorageService.saveCommonProductImages(imgs);
        }}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onNavigateToWhatsAppCenter={() => {
          setIsPostModalOpen(false);
          setActiveTab('whatsapp');
        }}
        onOpenSendTest={(u) => handleOpenSendTestWhatsApp(u)}
      />

      {/* MODAL: Send Test WhatsApp (Nav Durga Test Customer Preview) */}
      {isSendTestModalOpen && (
        <SendTestWhatsAppModal
          isOpen={isSendTestModalOpen}
          onClose={() => setIsSendTestModalOpen(false)}
          update={testModalUpdate || appState.dailyUpdates[0]}
          company={appState.company}
        />
      )}

      {/* MODAL: Product Details & Historical Price Log */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        onEdit={handleEditProduct}
        onQuickUpdatePrice={handleQuickUpdateProductPrice}
      />

      {/* MODAL: Product Form (Add / Edit) */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* MODAL: Daily Update Form */}
      <DailyUpdateFormModal
        products={appState.products}
        isOpen={isDailyUpdateFormOpen}
        onClose={() => setIsDailyUpdateFormOpen(false)}
        onSave={handleSaveDailyUpdate}
        onUpdateSectionPrices={handleUpdateSectionPrices}
      />

      {/* MODAL: Customer Form (Add / Edit) */}
      <CustomerFormModal
        customer={editingCustomer}
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
        onSave={handleSaveCustomer}
        availableProducts={appState.products.map((p: Product) => `${p.name} ${p.grade}`)}
      />
    </div>
  );
}
