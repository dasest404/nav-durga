import {
  Customer,
  Product,
  CompanySettings,
  SalesEnquiry,
  WhatsAppCustomerMatch,
  WhatsAppProductMatch,
  WhatsAppOrderEnquiryParsed,
} from '../types';

/**
 * Clean phone number to digits only.
 * Normalizes 10-digit Indian numbers to standard formats.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

/**
 * 1. WHATSAPP CUSTOMER IDENTIFICATION
 * Searches the existing ERP Customer Master.
 * - Single match: auto-associated.
 * - No match: unregistered lead workflow (lead with phone number).
 * - Multiple matches: flagged for review.
 */
export function matchWhatsAppCustomer(
  senderPhone: string,
  customers: Customer[],
  preselectedCustomerId?: string
): WhatsAppCustomerMatch {
  if (preselectedCustomerId) {
    const cust = customers.find((c) => c.id === preselectedCustomerId);
    if (cust) {
      return {
        status: 'exact_match',
        customer: cust,
        senderPhone: cust.whatsapp || cust.mobile || senderPhone,
        isUnregisteredLead: false,
      };
    }
  }

  const cleanSender = normalizePhoneNumber(senderPhone);
  if (!cleanSender) {
    return {
      status: 'no_match',
      senderPhone: '',
      isUnregisteredLead: true,
    };
  }

  const matched = customers.filter((c) => {
    const cPhone = normalizePhoneNumber(c.whatsapp || c.mobile || '');
    return cPhone && (cPhone === cleanSender || cPhone.endsWith(cleanSender.slice(-10)) || cleanSender.endsWith(cPhone.slice(-10)));
  });

  if (matched.length === 1) {
    return {
      status: 'exact_match',
      customer: matched[0],
      senderPhone,
      isUnregisteredLead: false,
    };
  } else if (matched.length > 1) {
    return {
      status: 'multiple_matches',
      candidates: matched,
      senderPhone,
      isUnregisteredLead: false,
    };
  }

  return {
    status: 'no_match',
    senderPhone,
    isUnregisteredLead: true,
  };
}

/**
 * 2. PRODUCT & SIZE NORMALIZATION
 * Extracts normalized dimensions: 125x65, 100x50, 75x40, etc.
 */
export function extractSizeFromText(text: string): string | null {
  const clean = text.toLowerCase().replace(/×/g, 'x').replace(/\*/g, 'x');

  // Look for dimensions like 125x65, 125 x 65, 150x75, 75x40, 70x35, 40x5, 50x6, etc.
  const dimMatch = clean.match(/(\d{2,3})\s*(?:x|\*|\s)\s*(\d{2,3}(?:\s*x\s*\d{1,2})?)/);
  if (dimMatch) {
    const part1 = dimMatch[1];
    const part2 = dimMatch[2].replace(/\s+/g, '');
    return `${part1}x${part2}`;
  }

  // Look for joist / channel shorthand e.g. 125 65 or 100 50
  const spacedMatch = clean.match(/\b(125|150|200|250|300|100|70|75|95|40|50|65)\s+(65|75|82|50|70|100|125|140|35|40|45|5|6)\b/);
  if (spacedMatch) {
    return `${spacedMatch[1]}x${spacedMatch[2]}`;
  }

  return null;
}

/**
 * 3. PRODUCT & SECTION / TYPE IDENTIFICATION
 * Strict ERP Product Master matching. Never invents a product.
 */
export function matchERPProduct(rawText: string, products: Product[]): WhatsAppProductMatch {
  const lower = rawText.toLowerCase();
  const detectedSize = extractSizeFromText(rawText);

  // Category detection
  let detectedCategory: 'MS Channel' | 'MS Joist' | 'MS Angle' | undefined;
  if (lower.includes('channel') || lower.includes('ismc') || lower.includes('channal')) {
    detectedCategory = 'MS Channel';
  } else if (lower.includes('joist') || lower.includes('beam') || lower.includes('girder')) {
    detectedCategory = 'MS Joist';
  } else if (lower.includes('angle') || lower.includes('koniya') || lower.includes('l angle')) {
    detectedCategory = 'MS Angle';
  }

  // Section / Grade detection
  let detectedGrade: 'Medium' | 'SL' | '5 KG' | '8 KG' | undefined;
  let detectedSection: 'MEDIUM SECTION' | 'LIGHT SECTION' | undefined;

  if (lower.includes('super light') || lower.includes('sl') || lower.includes('superlight')) {
    detectedGrade = 'SL';
  } else if (lower.includes('5 kg') || lower.includes('5kg')) {
    detectedGrade = '5 KG';
    detectedSection = 'LIGHT SECTION';
  } else if (lower.includes('8 kg') || lower.includes('8kg')) {
    detectedGrade = '8 KG';
    detectedSection = 'LIGHT SECTION';
  } else if (lower.includes('medium') || lower.includes('med')) {
    detectedGrade = 'Medium';
  }

  if (lower.includes('medium section')) detectedSection = 'MEDIUM SECTION';
  if (lower.includes('light section') || lower.includes('unit 2') || lower.includes('unit-2')) {
    detectedSection = 'LIGHT SECTION';
  }

  // Filter candidates from active ERP products
  const activeProducts = products.filter((p) => p.status === 'Active');

  let candidates = activeProducts.filter((p) => {
    const pSize = (p.size || '').toLowerCase().replace(/×/g, 'x').replace(/\s+/g, '');
    const pCat = (p.category || p.productName || p.name || '').toLowerCase();
    const pGrade = (p.grade || p.gaugeType || '').toLowerCase();

    // Check size match
    if (detectedSize) {
      const targetSize = detectedSize.replace(/\s+/g, '');
      const matchSize = pSize.includes(targetSize) || targetSize.includes(pSize.replace('mm', ''));
      if (!matchSize) return false;
    }

    // Check category match
    if (detectedCategory) {
      if (detectedCategory === 'MS Channel' && !pCat.includes('channel')) return false;
      if (detectedCategory === 'MS Joist' && !(pCat.includes('joist') || pCat.includes('beam'))) return false;
      if (detectedCategory === 'MS Angle' && !pCat.includes('angle')) return false;
    }

    // Check grade match
    if (detectedGrade) {
      if (detectedGrade === 'SL' && !pGrade.includes('sl')) return false;
      if (detectedGrade === 'Medium' && !pGrade.includes('medium')) return false;
      if (detectedGrade === '5 KG' && !pGrade.includes('5 kg') && !pGrade.includes('5kg')) return false;
      if (detectedGrade === '8 KG' && !pGrade.includes('8 kg') && !pGrade.includes('8kg')) return false;
    }

    // Check section match
    if (detectedSection && p.section && p.section !== detectedSection) {
      return false;
    }

    return true;
  });

  // If detected category wasn't explicitly named, but size was found (e.g. "125x65")
  if (candidates.length === 0 && detectedSize) {
    candidates = activeProducts.filter((p) => {
      const pSize = (p.size || '').toLowerCase().replace(/×/g, 'x').replace(/\s+/g, '');
      return pSize.includes(detectedSize.replace(/\s+/g, ''));
    });
  }

  // Single exact match!
  if (candidates.length === 1) {
    return {
      status: 'exact_match',
      product: candidates[0],
      detectedSize: detectedSize || candidates[0].size,
      detectedCategory,
      detectedSection,
      detectedGrade,
    };
  }

  // Multiple candidates -> Need clarification (e.g. 125x65 Medium vs 125x65 SL)
  if (candidates.length > 1) {
    return {
      status: 'needs_clarification',
      candidates,
      detectedSize: detectedSize || '',
      detectedCategory,
      detectedSection,
      detectedGrade,
      clarificationOptions: candidates.map((p) => ({
        label: `${p.name} ${p.size} — ${p.grade || p.gaugeType || 'Medium'} (₹${(p.finalRate || p.currentPrice || 0).toLocaleString('en-IN')}/MT)`,
        product: p,
      })),
    };
  }

  return {
    status: 'no_match',
    detectedSize: detectedSize || '',
    detectedCategory,
    detectedSection,
    detectedGrade,
  };
}

/**
 * 4. QUANTITY EXTRACTION
 * Understands: 20 MT, 20 ton, 20 tonnes, 20 tonne, 20 t, 2 trailer, 30 गाड़ी
 */
export function extractQuantityFromText(text: string): { quantity?: number; unit: string } {
  const lower = text.toLowerCase();

  // Pattern: number followed by ton/mt/trailer
  const m1 = lower.match(/(\d+(?:\.\d+)?)\s*(?:ton|tons|mt|tonne|tonnes|t\b|trailer|trailers|गाड़ी|गाड़ी|ट्रक)/i);
  if (m1 && m1[1]) {
    const val = parseFloat(m1[1]);
    if (lower.includes('trailer') || lower.includes('गाड़ी') || lower.includes('गाड़ी')) {
      // 1 standard trailer in Raipur steel market is approximately 25-30 MT
      return { quantity: val * 25, unit: 'MT' };
    }
    return { quantity: val, unit: 'MT' };
  }

  // Pattern: "need 20" or "order 25" or "20 bhejna hai"
  const m2 = lower.match(/(?:need|order|chahiye|chahiye\s+h|bhejna\s+hai|bhejo)\s*(\d+(?:\.\d+)?)/i) ||
             lower.match(/(\d+(?:\.\d+)?)\s*(?:bhejna|chahiye|order)/i);
  if (m2 && m2[1]) {
    return { quantity: parseFloat(m2[1]), unit: 'MT' };
  }

  return { unit: 'MT' };
}

/**
 * 5. COMPLETE PARSING OF INCOMING WHATSAPP MESSAGE
 */
export function parseWhatsAppCustomerMessage(params: {
  rawText: string;
  senderPhone?: string;
  preselectedCustomerId?: string;
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
}): WhatsAppOrderEnquiryParsed {
  const { rawText, senderPhone = '', preselectedCustomerId, customers, products, company } = params;
  const lower = rawText.toLowerCase();

  // 1. Identify Customer
  const customerMatch = matchWhatsAppCustomer(senderPhone, customers, preselectedCustomerId);

  // 2. Identify Product
  const productMatch = matchERPProduct(rawText, products);

  // 3. Identify Quantity
  const { quantity, unit } = extractQuantityFromText(rawText);

  // 4. Identify Intent
  const hasRequirementWords =
    lower.includes('chahiye') ||
    lower.includes('bhejna') ||
    lower.includes('order') ||
    lower.includes('supply') ||
    lower.includes('dispatch') ||
    lower.includes('require') ||
    lower.includes('urgent') ||
    lower.includes('book') ||
    lower.includes('bhejo') ||
    Boolean(quantity);

  const hasPriceQueryWords =
    lower.includes('rate') ||
    lower.includes('bhav') ||
    lower.includes('bhao') ||
    lower.includes('price') ||
    lower.includes('kya hai') ||
    lower.includes('cost') ||
    lower.includes('quotation');

  const intent: 'rate_enquiry' | 'product_requirement' | 'general' =
    hasRequirementWords && quantity
      ? 'product_requirement'
      : hasPriceQueryWords || productMatch.status === 'exact_match'
      ? 'rate_enquiry'
      : 'general';

  // 5. Approved Rate retrieval
  let approvedRate: number | undefined;
  let totalAmount: number | undefined;

  if (productMatch.product) {
    approvedRate =
      productMatch.product.finalRate ??
      productMatch.product.currentPrice ??
      ((productMatch.product.baseRate || 40211) + (productMatch.product.gaugeDifference || 0));

    if (quantity && approvedRate) {
      totalAmount = Math.round(quantity * approvedRate);
    }
  }

  // 6. Response generation
  let generatedResponse = '';
  let clarificationQuestion: string | undefined;

  const customerGreeting = customerMatch.customer
    ? `Namaste ${customerMatch.customer.name},`
    : 'Namaste,';

  if (productMatch.status === 'needs_clarification') {
    const sizeStr = productMatch.detectedSize || 'this size';
    clarificationQuestion = `Please confirm the section/type: Medium, SL, Light, 5 KG or 8 KG.`;
    generatedResponse = `${customerGreeting}\n\nI found more than one matching ${sizeStr} product in our ERP Product Master. Please confirm the section/type: Medium, SL, Light, 5 KG or 8 KG.\n\nOptions:\n` +
      (productMatch.clarificationOptions || [])
        .map((opt, i) => `${i + 1}. ${opt.label}`)
        .join('\n') +
      `\n\n— ${company.companyName}, Raipur`;
  } else if (productMatch.status === 'exact_match' && productMatch.product) {
    const prod = productMatch.product;
    const rateStr = `₹${(approvedRate || 0).toLocaleString('en-IN')}/MT`;
    const gradeStr = prod.grade || prod.gaugeType || 'Medium';

    if (intent === 'product_requirement' && quantity) {
      generatedResponse =
        `${customerGreeting}\n\n` +
        `Aapka requirement receive ho gaya hai:\n` +
        `▫️ *Product:* ${prod.name} ${prod.size}\n` +
        `▫️ *Grade/Section:* ${gradeStr} (${prod.section || 'Nav Durga'})\n` +
        `▫️ *Quantity:* ${quantity} ${unit}\n` +
        `▫️ *Current Approved Rate:* *${rateStr}*\n` +
        (totalAmount ? `▫️ *Estimated Amount:* ₹${totalAmount.toLocaleString('en-IN')} (Ex-Plant)\n` : '') +
        `\n📌 *Terms:* Rates ex-plant Urla, Raipur. GST 18% extra. Weighbridge at plant.\n` +
        `Hamari sales team order confirmation aur delivery dispatch schedule ke liye turant sampark karegi.\n\n` +
        `— ${company.companyName} | 📞 ${company.phone}`;
    } else {
      // Simple enquiry: Example 1
      generatedResponse =
        `${prod.name} ${prod.size} ${gradeStr} ka current approved rate *${rateStr}* hai.\n\n` +
        `▫️ *Basic Formula:* Basic Rate + Gauge Diff (₹${(prod.gaugeDifference || 0).toLocaleString('en-IN')})\n` +
        `▫️ *Dispatch Location:* Ex-Plant Urla, Raipur\n` +
        `▫️ *Terms:* GST 18% extra • Valid for today's booking.\n\n` +
        `To confirm order or trailer booking, reply with required quantity.\n— ${company.companyName}`;
    }
  } else {
    // No product matched
    generatedResponse =
      `${customerGreeting}\n` +
      `Thank you for reaching out to ${company.companyName}.\n` +
      `Please let us know the required steel section (MS Channel, Joist, Angle) and size (e.g. 125x65, 100x50, 75x40) with required tonnage.`;
  }

  const isRequirementReadyForCRM = Boolean(
    intent === 'product_requirement' &&
    productMatch.status === 'exact_match' &&
    productMatch.product &&
    quantity &&
    quantity > 0
  );

  return {
    customerMatch,
    productMatch,
    intent,
    rawText,
    quantity,
    unit,
    approvedRate,
    totalAmount,
    generatedResponse,
    isRequirementReadyForCRM,
    clarificationQuestion,
  };
}

/**
 * 6. STRUCTURED REQUIREMENT CONVERSION INTO SALES/CRM
 */
export function buildSalesEnquiryFromWhatsAppParsed(params: {
  parsed: WhatsAppOrderEnquiryParsed;
  company: CompanySettings;
  salesperson?: string;
}): SalesEnquiry {
  const { parsed, company, salesperson = 'Rajesh Sharma (AI WhatsApp)' } = params;
  const today = new Date().toISOString().split('T')[0];
  const randNum = Math.floor(100 + Math.random() * 900);

  const prod = parsed.productMatch.product;
  const cust = parsed.customerMatch.customer;

  const customerId = cust ? cust.id : `cust-lead-${Date.now()}`;
  const customerName = cust
    ? cust.companyName
    : `WhatsApp Lead (${parsed.customerMatch.senderPhone || 'Unregistered'})`;

  return {
    id: `enq-wa-${Date.now()}`,
    enquiryNumber: `WA-REQ-${today.slice(0, 4)}-${randNum}`,
    customerId,
    customerName,
    product: prod ? `${prod.name} ${prod.size}` : 'Steel Structural',
    grade: prod ? (prod.grade || prod.gaugeType || 'Medium') : 'Medium',
    quantity: parsed.quantity || 20,
    unit: parsed.unit || 'MT',
    quotedPrice: parsed.approvedRate || 56400,
    expectedPrice: parsed.approvedRate || 56400,
    source: 'WhatsApp',
    whatsappMessage: parsed.rawText,
    date: today,
    salesperson,
    status: 'New',
    notes: `WhatsApp Order Requirement auto-extracted by AI Engine.\nSender: ${parsed.customerMatch.senderPhone || 'N/A'}\nSection: ${prod?.section || 'MEDIUM'}\nGauge Diff: ₹${prod?.gaugeDifference || 0}/MT\nEstimated Total: ₹${(parsed.totalAmount || 0).toLocaleString('en-IN')}`,
  };
}
