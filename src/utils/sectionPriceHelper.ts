import { Product } from '../types';

export interface SectionInfo {
  key: string;
  label: string;
  count: number;
}

export interface TypeInfo {
  key: string;
  label: string;
  count: number;
}

/**
 * Normalizes section key for canonical comparison.
 * SECTION and TYPE are strictly separated.
 */
export const normalizeSectionKey = (raw: string): string => {
  if (!raw) return '';
  const s = raw.trim().toUpperCase();
  if (s === 'ALL' || s === 'ALL SECTIONS' || s === 'ALL PRODUCTS') return 'ALL';
  if (s === 'MEDIUM' || s === 'MEDIUM SECTION') return 'MEDIUM SECTION';
  if (s === 'LIGHT' || s === 'LIGHT SECTION') return 'LIGHT SECTION';
  return raw.trim();
};

/**
 * Normalizes type key for canonical comparison.
 */
export const normalizeProductType = (raw?: string): string => {
  if (!raw) return '';
  const s = raw.trim().toLowerCase();
  if (s === 'medium' || s === 'med') return 'Medium';
  if (
    s === 'super light' ||
    s === 'sl' ||
    s === 'superlight' ||
    s === 'super light / sl' ||
    s === 'sl / super light'
  ) {
    return 'Super light';
  }
  if (s === '5 kg' || s === '5kg' || s === '5-kg') return '5 kg';
  if (s === '8 kg' || s === '8kg' || s === '8-kg') return '8 kg';
  return raw.trim();
};

/**
 * Section matching logic (MANDATED BY SPEC):
 * function doesProductMatchSection(product, section) {
 *     return product.section === section;
 * }
 *
 * Checks ONLY the product.section field.
 * NEVER uses Type while selecting a section.
 * "MEDIUM SECTION" matches ALL products where product.section === "MEDIUM SECTION",
 * regardless of whether Type is Medium, Super light, 5 kg, 8 kg, etc.
 */
export const doesProductMatchSection = (p: Product, sectionKey: string): boolean => {
  if (!sectionKey || sectionKey === 'ALL' || sectionKey.trim() === '') return true;
  if (!p || !p.section) return false;

  const targetSec = normalizeSectionKey(sectionKey);
  const prodSec = normalizeSectionKey(p.section);

  return prodSec === targetSec;
};

/**
 * Type matching logic:
 * Filters independently by product.type (or grade/gaugeType fallback).
 */
export const doesProductMatchType = (p: Product, typeKey: string): boolean => {
  if (!typeKey || typeKey === 'ALL' || typeKey.trim() === '') return true;
  if (!p) return false;

  const target = normalizeProductType(typeKey).toLowerCase();
  const prodType = normalizeProductType(p.type || p.grade || p.gaugeType).toLowerCase();

  return prodType === target;
};

/**
 * Combined Section + Type filtering logic:
 * - Section filter works independently.
 * - Type filter works independently.
 * - Section + Type works as a combined filter when both are specified.
 */
export const doesProductMatchSectionAndType = (
  p: Product,
  sectionKey?: string,
  typeKey?: string
): boolean => {
  const matchSec = !sectionKey || sectionKey === 'ALL' || sectionKey.trim() === ''
    ? true
    : doesProductMatchSection(p, sectionKey);

  const matchType = !typeKey || typeKey === 'ALL' || typeKey.trim() === ''
    ? true
    : doesProductMatchType(p, typeKey);

  return matchSec && matchType;
};

/**
 * Dynamically discovers all available sections for the given products.
 * Filters strictly by product.section.
 */
export const getAvailableSections = (products: Product[]): SectionInfo[] => {
  const sectionCounts = new Map<string, number>();

  products.forEach((p) => {
    if (p.section && p.section.trim() !== '') {
      const canonical = normalizeSectionKey(p.section);
      sectionCounts.set(canonical, (sectionCounts.get(canonical) || 0) + 1);
    }
  });

  const preferredOrder = ['MEDIUM SECTION', 'LIGHT SECTION'];
  const list: SectionInfo[] = [];

  preferredOrder.forEach((sec) => {
    const count = sectionCounts.get(sec);
    if (count !== undefined && count > 0) {
      list.push({
        key: sec,
        label: sec,
        count,
      });
      sectionCounts.delete(sec);
    }
  });

  // Any other sections if dynamically added
  sectionCounts.forEach((count, sec) => {
    if (count > 0) {
      list.push({
        key: sec,
        label: sec,
        count,
      });
    }
  });

  return list;
};

/**
 * Dynamically discovers all available types for the given products (optionally scoped to a section).
 * Filters strictly by product.type / grade.
 */
export const getAvailableTypes = (products: Product[], selectedSection?: string): TypeInfo[] => {
  const scopedProducts = selectedSection && selectedSection !== 'ALL' && selectedSection.trim() !== ''
    ? products.filter((p) => doesProductMatchSection(p, selectedSection))
    : products;

  const typeCounts = new Map<string, number>();

  scopedProducts.forEach((p) => {
    const normType = normalizeProductType(p.type || p.grade || p.gaugeType);
    if (normType) {
      typeCounts.set(normType, (typeCounts.get(normType) || 0) + 1);
    }
  });

  const preferredOrder = ['Medium', 'Super light', '5 kg', '8 kg'];
  const list: TypeInfo[] = [];

  preferredOrder.forEach((t) => {
    const count = typeCounts.get(t);
    if (count !== undefined && count > 0) {
      list.push({
        key: t,
        label: t,
        count,
      });
      typeCounts.delete(t);
    }
  });

  typeCounts.forEach((count, t) => {
    if (count > 0) {
      list.push({
        key: t,
        label: t,
        count,
      });
    }
  });

  return list;
};
