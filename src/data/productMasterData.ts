import { Product } from '../types';

/**
 * NAV DURGA BUSINESS ERP — ACTIVE PRODUCT MASTER
 * 
 * EXACT SPECIFICATION FROM NAVDURGA DAILY RATE CARD:
 * 
 * 1. NAVDURGA ISPAT PVT. LTD. — MEDIUM SECTION (13 RECORDS)
 * S.N. | PRODUCT    | SIZE        | GRADE  | GAUGE DIFFERENCE
 * 1    | MS CHANNEL | 125 × 65mm  | Medium | ₹400
 * 2    | MS CHANNEL | 150 × 75mm  | Medium | ₹400
 * 3    | MS CHANNEL | 200 × 75mm  | Medium | ₹1,300
 * 4    | MS CHANNEL | 250 × 82mm  | Medium | ₹2,200
 * 5    | MS CHANNEL | 125 × 65mm  | SL     | ₹2,100
 * 6    | MS CHANNEL | 150 × 75mm  | SL     | ₹3,100
 * 7    | MS CHANNEL | 200 × 75mm  | SL     | ₹3,100
 * 8    | MS JOIST   | 100 × 50mm  | Medium | ₹700
 * 9    | MS JOIST   | 125 × 70mm  | Medium | ₹400
 * 10   | MS JOIST   | 150 × 75mm  | Medium | ₹400
 * 11   | MS JOIST   | 200 × 100mm | Medium | ₹700
 * 12   | MS JOIST   | 250 × 125mm | Medium | ₹1,500
 * 13   | MS JOIST   | 300 × 140mm | Medium | ₹2,200
 * 
 * 2. UNIT-2 — NS ISPAT (I) PVT. LTD. — LIGHT SECTION (9 RECORDS)
 * S.N. | PRODUCT    | SIZE           | GRADE  | GAUGE DIFFERENCE
 * 1    | MS CHANNEL | 70 × 35mm      | SL     | ₹7,500
 * 2    | MS CHANNEL | 75 × 40mm      | Medium | ₹6,700
 * 3    | MS CHANNEL | 75 × 40mm      | 5 KG   | ₹7,500
 * 4    | MS CHANNEL | 95 × 45mm      | SL     | ₹7,500
 * 5    | MS CHANNEL | 100 × 50mm     | Medium | ₹6,400
 * 6    | MS CHANNEL | 100 × 50mm     | 8 KG   | ₹7,500
 * 7    | MS ANGLE   | 40 × 5, 40 × 6 | Medium | ₹7,200
 * 8    | MS ANGLE   | 50 × 5, 65 × 5 | Medium | ₹6,700
 * 9    | MS ANGLE   | 50 × 6, 65 × 6 | Medium | ₹6,400
 * 
 * TOTAL: Exactly 22 Active Records
 * FORMULA: FINAL RATE = CATEGORY BASIC RATE + GAUGE DIFFERENCE
 */

export interface CanonicalGaugeDifferenceRecord {
  id: string;
  code: string;
  company: 'NAVDURGA ISPAT PVT. LTD.' | 'UNIT-2 - NS ISPAT (I) PVT. LTD.';
  section: 'MEDIUM SECTION' | 'LIGHT SECTION';
  productName: 'MS CHANNEL' | 'MS JOIST' | 'MS ANGLE';
  category: 'MS Channel' | 'MS Joist' | 'MS Angle';
  size: string;
  grade: 'Medium' | 'SL' | '5 KG' | '8 KG';
  gaugeDifference: number;
}

export const CANONICAL_GAUGE_DIFFERENCE_RECORDS: CanonicalGaugeDifferenceRecord[] = [
  // =========================================================================
  // 1. NAVDURGA ISPAT PVT. LTD. — MEDIUM SECTION (13 Records)
  // =========================================================================
  {
    id: 'prod-nd-ch-12565-med',
    code: 'ND-CH-12565-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '125 × 65mm',
    grade: 'Medium',
    gaugeDifference: 400,
  },
  {
    id: 'prod-nd-ch-15075-med',
    code: 'ND-CH-15075-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '150 × 75mm',
    grade: 'Medium',
    gaugeDifference: 400,
  },
  {
    id: 'prod-nd-ch-20075-med',
    code: 'ND-CH-20075-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '200 × 75mm',
    grade: 'Medium',
    gaugeDifference: 1300,
  },
  {
    id: 'prod-nd-ch-25082-med',
    code: 'ND-CH-25082-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '250 × 82mm',
    grade: 'Medium',
    gaugeDifference: 2200,
  },
  {
    id: 'prod-nd-ch-12565-sl',
    code: 'ND-CH-12565-SL',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '125 × 65mm',
    grade: 'SL',
    gaugeDifference: 2100,
  },
  {
    id: 'prod-nd-ch-15075-sl',
    code: 'ND-CH-15075-SL',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '150 × 75mm',
    grade: 'SL',
    gaugeDifference: 3100,
  },
  {
    id: 'prod-nd-ch-20075-sl',
    code: 'ND-CH-20075-SL',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '200 × 75mm',
    grade: 'SL',
    gaugeDifference: 3100,
  },
  {
    id: 'prod-nd-joist-10050-med',
    code: 'ND-JST-10050-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '100 × 50mm',
    grade: 'Medium',
    gaugeDifference: 700,
  },
  {
    id: 'prod-nd-joist-12570-med',
    code: 'ND-JST-12570-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '125 × 70mm',
    grade: 'Medium',
    gaugeDifference: 400,
  },
  {
    id: 'prod-nd-joist-15075-med',
    code: 'ND-JST-15075-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '150 × 75mm',
    grade: 'Medium',
    gaugeDifference: 400,
  },
  {
    id: 'prod-nd-joist-200100-med',
    code: 'ND-JST-200100-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '200 × 100mm',
    grade: 'Medium',
    gaugeDifference: 700,
  },
  {
    id: 'prod-nd-joist-250125-med',
    code: 'ND-JST-250125-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '250 × 125mm',
    grade: 'Medium',
    gaugeDifference: 1500,
  },
  {
    id: 'prod-nd-joist-300140-med',
    code: 'ND-JST-300140-MED',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    productName: 'MS JOIST',
    category: 'MS Joist',
    size: '300 × 140mm',
    grade: 'Medium',
    gaugeDifference: 2200,
  },

  // =========================================================================
  // 2. UNIT-2 — NS ISPAT (I) PVT. LTD. — LIGHT SECTION (9 Records)
  // =========================================================================
  {
    id: 'prod-ns-ch-7035-sl',
    code: 'NS-CH-7035-SL',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '70 × 35mm',
    grade: 'SL',
    gaugeDifference: 7500,
  },
  {
    id: 'prod-ns-ch-7540-med',
    code: 'NS-CH-7540-MED',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '75 × 40mm',
    grade: 'Medium',
    gaugeDifference: 6700,
  },
  {
    id: 'prod-ns-ch-7540-5kg',
    code: 'NS-CH-7540-5KG',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '75 × 40mm',
    grade: '5 KG',
    gaugeDifference: 7500,
  },
  {
    id: 'prod-ns-ch-9545-sl',
    code: 'NS-CH-9545-SL',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '95 × 45mm',
    grade: 'SL',
    gaugeDifference: 7500,
  },
  {
    id: 'prod-ns-ch-10050-med',
    code: 'NS-CH-10050-MED',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '100 × 50mm',
    grade: 'Medium',
    gaugeDifference: 6400,
  },
  {
    id: 'prod-ns-ch-10050-8kg',
    code: 'NS-CH-10050-8KG',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS CHANNEL',
    category: 'MS Channel',
    size: '100 × 50mm',
    grade: '8 KG',
    gaugeDifference: 7500,
  },
  {
    id: 'prod-ns-ang-40',
    code: 'NS-ANG-40-MED',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS ANGLE',
    category: 'MS Angle',
    size: '40 × 5, 40 × 6',
    grade: 'Medium',
    gaugeDifference: 7200,
  },
  {
    id: 'prod-ns-ang-50-65-5',
    code: 'NS-ANG-5065-5-MED',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS ANGLE',
    category: 'MS Angle',
    size: '50 × 5, 65 × 5',
    grade: 'Medium',
    gaugeDifference: 6700,
  },
  {
    id: 'prod-ns-ang-50-65-6',
    code: 'NS-ANG-5065-6-MED',
    company: 'UNIT-2 - NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    productName: 'MS ANGLE',
    category: 'MS Angle',
    size: '50 × 6, 65 × 6',
    grade: 'Medium',
    gaugeDifference: 6400,
  },
];

const MEDIUM_BASIC_RATE = 49711;
const LIGHT_BASIC_RATE = 42211;

/**
 * 22 Active Products initialized directly with exact gauge difference & rates
 */
export const ACTIVE_PRODUCT_MASTER: Product[] = CANONICAL_GAUGE_DIFFERENCE_RECORDS.map((c) => {
  const isMed = c.section === 'MEDIUM SECTION';
  const baseRate = isMed ? MEDIUM_BASIC_RATE : LIGHT_BASIC_RATE;
  const finalRate = baseRate + c.gaugeDifference;

  return {
    id: c.id,
    name: c.productName,
    productName: c.productName,
    code: c.code,
    category: c.category,
    productCategory: c.category,
    size: c.size,
    gaugeType: c.grade,
    type: c.grade === 'SL' ? 'Super light' : c.grade,
    grade: c.grade,
    section: c.section,
    rateSource: c.company,
    baseRate: baseRate,
    loadingCharge: 0,
    insuranceCharge: 0,
    gaugeDifference: c.gaugeDifference,
    otherCharges: 0,
    finalRate: finalRate,
    currentPrice: finalRate,
    previousPrice: baseRate,
    priceChange: c.gaugeDifference,
    unit: 'MT',
    minOrderQty: isMed ? 10 : 5,
    description: `${c.productName} ${c.size} ${c.grade} (${c.section}) - ${c.company}.`,
    inStock: true,
    status: 'Active',
    priceHistory: [
      {
        date: '2026-09-24',
        price: finalRate,
        changeReason: `Daily rate update (Category Basic: ₹${baseRate.toLocaleString('en-IN')} + Gauge Diff: ₹${c.gaugeDifference.toLocaleString('en-IN')})`,
      },
    ],
  };
});

/**
 * Normalization helper for duplicate prevention matching:
 * Matches company, section, product name, size, and grade
 */
function normalizeSize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[×*x]/g, 'x')
    .replace(/\s+/g, '')
    .trim();
}

function normalizeGradeKey(g: string): string {
  const lower = (g || '').toLowerCase().trim();
  if (lower.includes('5') && lower.includes('kg')) return '5 KG';
  if (lower.includes('8') && lower.includes('kg')) return '8 KG';
  if (lower.includes('sl') || lower.includes('super light')) return 'SL';
  return 'Medium';
}

function normalizeCompanyKey(c: string): 'MEDIUM' | 'LIGHT' {
  const lower = (c || '').toLowerCase();
  if (lower.includes('ns ispat') || lower.includes('unit-2') || lower.includes('unit 2')) {
    return 'LIGHT';
  }
  return 'MEDIUM';
}

/**
 * Sync existing product catalog with the 22 canonical Gauge Difference Master records:
 * 
 * Requirement 4 (Duplicate Prevention):
 * - Check whether the same company, product, size, grade, and section already exist.
 * - If the record exists: Update its Gauge Difference with the canonical value.
 * - If the record does not exist: Create a new record from the canonical specification.
 * - Do not create duplicate products.
 * - Preserve existing product IDs and relationships.
 */
export function syncProductMasterWithCanonicalGaugeDiffs(existingProducts: Product[]): Product[] {
  const result: Product[] = [];
  const handledCanonicalIds = new Set<string>();

  // Map existing products by canonical match key
  const existingList = Array.isArray(existingProducts) ? existingProducts : [];

  CANONICAL_GAUGE_DIFFERENCE_RECORDS.forEach((canonical) => {
    const canonicalKey = `${normalizeCompanyKey(canonical.company)}_${canonical.productName}_${normalizeSize(canonical.size)}_${normalizeGradeKey(canonical.grade)}`;
    
    // Find matching existing product
    const matchIndex = existingList.findIndex((p) => {
      if (p.id === canonical.id) return true;
      const pKey = `${normalizeCompanyKey(p.rateSource || '')}_${(p.productName || p.name).toUpperCase()}_${normalizeSize(p.size || '')}_${normalizeGradeKey(p.grade || p.gaugeType || '')}`;
      return pKey === canonicalKey;
    });

    const isMed = canonical.section === 'MEDIUM SECTION';
    const baseRate = isMed ? MEDIUM_BASIC_RATE : LIGHT_BASIC_RATE;
    const finalRate = baseRate + canonical.gaugeDifference;

    if (matchIndex >= 0) {
      const existing = existingList[matchIndex];

      result.push({
        ...existing,
        name: canonical.productName,
        productName: canonical.productName,
        category: canonical.category,
        productCategory: canonical.category,
        size: canonical.size,
        grade: canonical.grade,
        gaugeType: canonical.grade,
        type: canonical.grade === 'SL' ? 'Super light' : canonical.grade,
        section: canonical.section,
        rateSource: canonical.company,
        baseRate: baseRate,
        gaugeDifference: canonical.gaugeDifference,
        finalRate: finalRate,
        currentPrice: finalRate,
        previousPrice: existing.previousPrice || baseRate,
        priceChange: finalRate - (existing.previousPrice || baseRate),
        status: 'Active',
      });
      handledCanonicalIds.add(canonical.id);
    } else {
      // Create new record
      const defaultProd = ACTIVE_PRODUCT_MASTER.find((p) => p.id === canonical.id)!;
      result.push({ ...defaultProd });
      handledCanonicalIds.add(canonical.id);
    }
  });

  // Preserve any custom non-canonical products user may have added without duplicating canonicals
  existingList.forEach((p) => {
    if (!p || !p.id) return;
    const isCanonicalId = CANONICAL_GAUGE_DIFFERENCE_RECORDS.some((c) => c.id === p.id);
    const pKey = `${normalizeCompanyKey(p.rateSource || '')}_${(p.productName || p.name).toUpperCase()}_${normalizeSize(p.size || '')}_${normalizeGradeKey(p.grade || p.gaugeType || '')}`;
    const matchesCanonical = CANONICAL_GAUGE_DIFFERENCE_RECORDS.some((c) => {
      const cKey = `${normalizeCompanyKey(c.company)}_${c.productName}_${normalizeSize(c.size)}_${normalizeGradeKey(c.grade)}`;
      return cKey === pKey;
    });

    if (!isCanonicalId && !matchesCanonical) {
      result.push(p);
    }
  });

  return result;
}
