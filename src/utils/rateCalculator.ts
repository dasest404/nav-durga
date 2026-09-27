import { RateChargesConfig, Product, CompanyGradeBasicRates, CategoryBasicRates } from '../types';

/**
 * Exact Nav Durga ERP Daily Final Rate calculation:
 * FINAL RATE = CATEGORY BASIC RATE + GAUGE DIFFERENCE
 */
export function calculateSimpleFinalRate(basicRate: number, gaugeDifference: number): number {
  return (Number(basicRate) || 0) + (Number(gaugeDifference) || 0);
}

/**
 * Resolves the active category basic rate based on Category/Section and Company
 * MEDIUM SECTION (Nav Durga Ispat Pvt. Ltd.): 49,711
 * LIGHT SECTION (Unit-2 - NS Ispat (I) Pvt. Ltd.): 42,211
 */
export function resolveCategoryBasicRate(
  sectionOrCategory: string,
  categoryBasicRates?: CategoryBasicRates,
  company?: string
): number {
  const normSec = (sectionOrCategory || '').toUpperCase();
  if (normSec.includes('LIGHT') || company?.includes('NS ISPAT')) {
    if (categoryBasicRates?.['LIGHT SECTION'] !== undefined) {
      return categoryBasicRates['LIGHT SECTION']!;
    }
    return 42211;
  }

  // MEDIUM SECTION
  if (categoryBasicRates?.['MEDIUM SECTION'] !== undefined) {
    return categoryBasicRates['MEDIUM SECTION']!;
  }
  return 49711;
}

/**
 * Resolves product's category basic rate
 */
export function resolveProductCategoryBasicRate(
  product: Product,
  categoryBasicRates?: CategoryBasicRates
): number {
  const section =
    product.section ||
    (product.rateSource?.includes('NS ISPAT') ? 'LIGHT SECTION' : 'MEDIUM SECTION');
  return resolveCategoryBasicRate(section, categoryBasicRates, product.rateSource);
}

/**
 * Resolves the active basic rate for a product based on company and grade
 */
export function resolveProductBasicRate(
  product: Product,
  gradeBasicRates?: CompanyGradeBasicRates
): number {
  const normGrade = normalizeGrade(product.grade || product.gaugeType);
  const company = product.rateSource || 'NAV DURGA ISPAT PVT. LTD.';

  if (gradeBasicRates && gradeBasicRates[company]) {
    const compRates = gradeBasicRates[company];
    if (compRates[normGrade] !== undefined) {
      return compRates[normGrade]!;
    }
  }

  // Fallback to product.baseRate or defaults
  if (product.baseRate && product.baseRate > 0) return product.baseRate;
  if (company.includes('NAV DURGA')) {
    return normGrade === 'SL' ? 48500 : 49711;
  }
  if (normGrade === 'SL') return 47800;
  if (normGrade === '5 KG' || normGrade === '8 KG') return 46800;
  return 47300;
}

export interface RateCalculationParams {
  baseRate: number;
  gaugeDifference: number;
  loadingCharge?: number;
  insuranceCharge?: number;
  isRandomLength?: boolean;
  randomLengthDeduction?: number;
  isSpecialLength?: boolean;
  specialLengthCharge?: number;
  isNextDayPayment?: boolean;
  paymentAdjustment?: number;
  otherCharges?: number;
}

export interface RateCalculationBreakdown {
  baseRate: number;
  gaugeDifference: number;
  loadingCharge: number;
  insuranceCharge: number;
  randomLengthAdjustment: number;
  specialLengthAdjustment: number;
  paymentAdjustment: number;
  otherCharges: number;
  applicableCharges: number;
  subtotal: number;
  finalRate: number;
  formulaString: string;
}

/**
 * Standard ERP Rate Calculation formula:
 * Final Rate = Base Rate + Gauge Difference + Loading + Insurance - Random Length + Special Length + Payment Adjustment + Other Charges
 */
export function calculateFinalRate(
  params: RateCalculationParams,
  config?: Partial<RateChargesConfig>
): RateCalculationBreakdown {
  const baseRate = Number(params.baseRate) || 0;
  const gaugeDifference = Number(params.gaugeDifference) || 0;
  
  const loadingCharge =
    params.loadingCharge !== undefined
      ? Number(params.loadingCharge)
      : config?.loadingCharge !== undefined
      ? Number(config.loadingCharge)
      : 365;

  const insuranceCharge =
    params.insuranceCharge !== undefined
      ? Number(params.insuranceCharge)
      : config?.insuranceCharge !== undefined
      ? Number(config.insuranceCharge)
      : 30;

  const randomLengthAdjustment = params.isRandomLength
    ? -(params.randomLengthDeduction !== undefined
        ? Number(params.randomLengthDeduction)
        : config?.randomLengthDeduction !== undefined
        ? Number(config.randomLengthDeduction)
        : 300)
    : 0;

  const specialLengthAdjustment = params.isSpecialLength
    ? (params.specialLengthCharge !== undefined
        ? Number(params.specialLengthCharge)
        : config?.specialLengthCharge !== undefined
        ? Number(config.specialLengthCharge)
        : 500)
    : 0;

  const paymentAdjustment = params.isNextDayPayment
    ? (params.paymentAdjustment !== undefined
        ? Number(params.paymentAdjustment)
        : config?.nextDayPaymentAdjustment !== undefined
        ? Number(config.nextDayPaymentAdjustment)
        : 300)
    : 0;

  const otherCharges = Number(params.otherCharges) || 0;

  const finalRate = Math.round(
    baseRate +
      gaugeDifference +
      loadingCharge +
      insuranceCharge +
      randomLengthAdjustment +
      specialLengthAdjustment +
      paymentAdjustment +
      otherCharges
  );

  const applicableCharges = loadingCharge + insuranceCharge + otherCharges;
  const formulaString = `₹${baseRate.toLocaleString('en-IN')} (Base) + ₹${gaugeDifference.toLocaleString('en-IN')} (Gauge Diff) + ₹${loadingCharge} (Loading) + ₹${insuranceCharge} (Insurance)${otherCharges ? ` + ₹${otherCharges} (Other)` : ''} = ₹${finalRate.toLocaleString('en-IN')}/MT`;

  return {
    baseRate,
    gaugeDifference,
    loadingCharge,
    insuranceCharge,
    randomLengthAdjustment,
    specialLengthAdjustment,
    paymentAdjustment,
    otherCharges,
    applicableCharges,
    subtotal: baseRate + gaugeDifference,
    finalRate,
    formulaString,
  };
}

/**
 * Normalize Grade string to standard display representation:
 * SL, Medium, 5 KG, 8 KG or custom value
 */
export function normalizeGrade(type: string | undefined | null): string {
  if (!type) return 'Medium';
  const clean = type.trim();
  const lower = clean.toLowerCase();

  if (
    lower === 'sl' ||
    lower === 's.l.' ||
    lower === 'super light' ||
    lower === 'superlight' ||
    lower === 'small'
  ) {
    return 'SL';
  }
  if (lower === 'medium' || lower === 'med' || lower === 'standard') {
    return 'Medium';
  }
  if (lower === '5kg' || lower === '5 kg' || lower === '5-kg') {
    return '5 KG';
  }
  if (lower === '8kg' || lower === '8 kg' || lower === '8-kg') {
    return '8 KG';
  }

  return clean;
}

export const normalizeGaugeType = normalizeGrade;

/**
 * Standard badge styling for Grades
 */
export function getGaugeBadgeStyles(gaugeType: string): { bg: string; text: string; border: string } {
  const norm = normalizeGrade(gaugeType);
  switch (norm) {
    case 'SL':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
      };
    case 'Medium':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case '5 KG':
    case '5KG':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
      };
    case '8 KG':
    case '8KG':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
      };
  }
}
