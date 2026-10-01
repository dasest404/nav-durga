import {
  AIGraphicRecipe,
  AIGraphicColorPalette,
  AIGraphicLayoutStyle,
  AIGraphicBackgroundDecor,
  AISteelProductVisual,
  AISteelProduct3DType,
} from '../types';

export const AI_COLOR_PALETTES: AIGraphicColorPalette[] = [
  {
    name: 'Imperial Navy & Molten Gold',
    bgGradient: ['#0f172a', '#1e293b', '#090d16'],
    accentPrimary: '#2563eb',
    accentSecondary: '#f59e0b',
    accentGlow: '#fbbf24',
    textLight: '#f8fafc',
    textDark: '#0f172a',
    badgeBg: '#1e3a8a',
    badgeText: '#fef08a',
    cardBg: 'rgba(15, 23, 42, 0.95)',
    cardBorder: '#f59e0b',
    goldTrim: '#facc15',
  },
  {
    name: 'Blast Furnace Molten Ember',
    bgGradient: ['#450a0a', '#1c1917', '#0c0a09'],
    accentPrimary: '#dc2626',
    accentSecondary: '#ea580c',
    accentGlow: '#f97316',
    textLight: '#fff7ed',
    textDark: '#1c1917',
    badgeBg: '#7f1d1d',
    badgeText: '#ffedd5',
    cardBg: 'rgba(28, 25, 23, 0.95)',
    cardBorder: '#ea580c',
    goldTrim: '#fbbf24',
  },
  {
    name: 'High-Tech Industrial Cobalt & Cyan',
    bgGradient: ['#082f49', '#0f172a', '#020617'],
    accentPrimary: '#0284c7',
    accentSecondary: '#38bdf8',
    accentGlow: '#7dd3fc',
    textLight: '#f0f9ff',
    textDark: '#0c4a6e',
    badgeBg: '#075985',
    badgeText: '#e0f2fe',
    cardBg: 'rgba(15, 23, 42, 0.95)',
    cardBorder: '#38bdf8',
    goldTrim: '#38bdf8',
  },
  {
    name: 'Indian Emerald & Royal Gold',
    bgGradient: ['#064e3b', '#022c22', '#051914'],
    accentPrimary: '#059669',
    accentSecondary: '#eab308',
    accentGlow: '#facc15',
    textLight: '#ecfdf5',
    textDark: '#064e3b',
    badgeBg: '#065f46',
    badgeText: '#fef08a',
    cardBg: 'rgba(2, 44, 34, 0.95)',
    cardBorder: '#eab308',
    goldTrim: '#fde047',
  },
  {
    name: 'Midnight Onyx & Polished Steel',
    bgGradient: ['#18181b', '#09090b', '#000000'],
    accentPrimary: '#4f46e5',
    accentSecondary: '#6366f1',
    accentGlow: '#a5b4fc',
    textLight: '#fafafa',
    textDark: '#18181b',
    badgeBg: '#312e81',
    badgeText: '#e0e7ff',
    cardBg: 'rgba(24, 24, 27, 0.95)',
    cardBorder: '#6366f1',
    goldTrim: '#e2e8f0',
  },
  {
    name: 'Royal Purple & Cyber Gold',
    bgGradient: ['#3b0764', '#1e1b4b', '#0f172a'],
    accentPrimary: '#7e22ce',
    accentSecondary: '#eab308',
    accentGlow: '#facc15',
    textLight: '#faf5ff',
    textDark: '#3b0764',
    badgeBg: '#581c87',
    badgeText: '#fef08a',
    cardBg: 'rgba(30, 27, 75, 0.95)',
    cardBorder: '#eab308',
    goldTrim: '#facc15',
  },
];

export const LAYOUT_STYLES: AIGraphicLayoutStyle[] = [
  'diagonal_power',
  'center_gold_seal',
  'bold_split_poster',
  'industrial_bento',
  'dynamic_speed_angles',
  'executive_steel_sheet',
  'radiant_burst_deal',
  'heavy_structural_grid',
];

export const BACKGROUND_DECORS: AIGraphicBackgroundDecor[] = [
  'particles_molten',
  'hex_mesh_steel',
  'radial_sunburst',
  'diagonal_slashes',
  'blueprint_cad',
  'layered_slabs',
  'sparks_and_flares',
];

export class AIGraphicService {
  /**
   * Main generation method.
   * Calls server AI endpoint if available, with procedural fallback.
   * Always guarantees a fresh, completely random, unique graphic!
   */
  static async generateGraphic(
    promptText: string,
    seed: number = Date.now(),
    aspectRatio: '1:1' | '4:5' = '1:1'
  ): Promise<AIGraphicRecipe> {
    try {
      const response = await fetch('/api/ai/generate-graphic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText, seed, aspectRatio }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.headline && !data.isProceduralFallback) {
          return this.hydrateRecipe(data, promptText, seed, aspectRatio);
        }
      }
    } catch (e) {
      console.warn('Backend AI graphic endpoint not reachable, generating procedurally:', e);
    }

    // Procedural Generative AI Engine (Runs locally with seed-based randomization)
    return this.generateProceduralRecipe(promptText, seed, aspectRatio);
  }

  /**
   * Generates a completely new, randomized artistic recipe procedurally
   */
  private static generateProceduralRecipe(
    promptText: string,
    seed: number,
    aspectRatio: '1:1' | '4:5'
  ): AIGraphicRecipe {
    const prng = this.createPRNG(seed);

    // 1. Text Parsing & Entity Extraction (Preserving all user text)
    const parsed = this.parsePromptText(promptText);

    // 2. Random Selection of Layout, Palette & Background
    const layoutStyle = LAYOUT_STYLES[Math.floor(prng() * LAYOUT_STYLES.length)];
    const colorPalette = AI_COLOR_PALETTES[Math.floor(prng() * AI_COLOR_PALETTES.length)];
    const backgroundDecor = BACKGROUND_DECORS[Math.floor(prng() * BACKGROUND_DECORS.length)];

    // 3. 3D Steel Products Visual Selection based strictly on admin's text!
    const productVisuals = this.generateTargeted3DProductPositions(parsed.relevantTypes, prng);

    // 4. Random Decorations Flags
    const decorations = {
      hasGoldSeal: true,
      hasUrlaBadge: true,
      hasPrimeQualityShield: true,
      hasRibbon: true,
      hasSparks: true,
      hasCornerTechBrackets: true,
    };

    const generationId = `ND-AI-${Math.floor(prng() * 90000 + 10000)}`;

    const formattedShareText = this.buildWhatsAppShareText({
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      price: parsed.price,
      products: parsed.detectedProducts,
      features: parsed.features,
      cta: parsed.cta,
    });

    return {
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      badge: parsed.badge,
      price: parsed.price,
      priceLabel: parsed.priceLabel,
      features: parsed.features,
      cta: parsed.cta,
      products: parsed.detectedProducts,
      layoutStyle,
      colorPalette,
      backgroundDecor,
      productVisuals,
      decorations,
      aspectRatio,
      seed,
      generationId,
      formattedShareText,
    };
  }

  /**
   * Parse user's raw text to extract headline, prices, products, and features
   */
  private static parsePromptText(text: string): {
    headline: string;
    subheadline: string;
    badge: string;
    price: string | null;
    priceLabel: string;
    detectedProducts: { name: string; tag?: string }[];
    relevantTypes: { type: AISteelProduct3DType; label: string }[];
    features: string[];
    cta: string;
  } {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Detect Price (e.g. ₹48,500, 48500/MT, ₹500 off, Rs 49000)
    let price: string | null = null;
    let priceLabel = 'SPECIAL EX-PLANT RATE';

    const priceMatch =
      raw.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(?:\/(?:MT|Ton|KG))?/i) ||
      raw.match(/([\d]{2,3}(?:,\d{3})+|\d{4,6})\s*(?:\/(?:MT|Ton|KG))/i) ||
      raw.match(/(?:₹|Rs\.?)\s*([\d,]+)/i);

    if (priceMatch) {
      const numStr = priceMatch[1].replace(/,/g, '');
      const num = Number(numStr);
      if (!isNaN(num)) {
        price = `₹${num.toLocaleString('en-IN')}/MT`;
      } else {
        price = priceMatch[0];
      }
    } else if (lower.includes('off') || lower.includes('discount')) {
      const discountMatch = raw.match(/(\d+)\s*(?:₹|rs|rupees|%|\/mt)?\s*(?:off|discount)/i);
      if (discountMatch) {
        price = `FLAT ₹${discountMatch[1]} OFF / MT`;
        priceLabel = 'LIMITED DISCOUNT OFFER';
      }
    }

    // 2. Detect Products Mentioned & Map to 3D Visual Types
    const detectedProducts: { name: string; tag?: string }[] = [];
    const relevantTypes: { type: AISteelProduct3DType; label: string }[] = [];

    // MS Channel detection
    if (lower.includes('channel')) {
      const sizeMatch =
        raw.match(/(\d+\s*[x×]\s*\d+)\s*channel/i) ||
        raw.match(/channel\s*(\d+\s*[x×]\s*\d+)/i) ||
        raw.match(/125\s*[x×]\s*65|75\s*[x×]\s*40|100\s*[x×]\s*50|150\s*[x×]\s*75|200\s*[x×]\s*75/i);

      const label = sizeMatch ? `MS Channel ${sizeMatch[1] || sizeMatch[0]} mm` : 'MS Structural Channel';
      detectedProducts.push({ name: label, tag: 'Rolling Now' });
      relevantTypes.push({ type: 'channel', label });
    }

    // MS Angle detection
    if (lower.includes('angle')) {
      const sizeMatch =
        raw.match(/(\d+\s*[x×]\s*\d+)\s*angle/i) ||
        raw.match(/angle\s*(\d+\s*[x×]\s*\d+)/i) ||
        raw.match(/50\s*[x×]\s*50|65\s*[x×]\s*65|75\s*[x×]\s*75|90\s*[x×]\s*90|100\s*[x×]\s*100|130\s*[x×]\s*130/i);

      const label = sizeMatch ? `MS Angle ${sizeMatch[1] || sizeMatch[0]} mm` : 'MS Structural Angle';
      detectedProducts.push({ name: label, tag: 'Prime IS 2062' });
      relevantTypes.push({ type: 'angle', label });
    }

    // Beam / Joist detection
    if (lower.includes('beam') || lower.includes('joist')) {
      const label = 'MS Heavy Beams & Joists';
      detectedProducts.push({ name: label, tag: 'Ex-Stock' });
      relevantTypes.push({ type: 'beam', label });
    }

    // TMT Rebar detection
    if (lower.includes('tmt') || lower.includes('rebar')) {
      const label = 'Fe 500D TMT Rebar (8mm-32mm)';
      detectedProducts.push({ name: label, tag: 'Tested' });
      relevantTypes.push({ type: 'tmt_bundle', label });
    }

    // Billet detection
    if (lower.includes('billet') || lower.includes('ingot')) {
      const label = 'Prime Commercial Billets';
      detectedProducts.push({ name: label, tag: 'Prime' });
      relevantTypes.push({ type: 'billet_stack', label });
    }

    // Fallback if no specific product named
    if (detectedProducts.length === 0) {
      detectedProducts.push(
        { name: 'MS Angles (50x50 to 130x130)', tag: 'IS 2062' },
        { name: 'MS Channels (75x40 to 200x75)', tag: 'Rolling Now' }
      );
      relevantTypes.push(
        { type: 'channel', label: 'MS Channel 125x65' },
        { type: 'angle', label: 'MS Angle 50x50' }
      );
    }

    // 3. Detect / Synthesize Headline (Preserving user meaning)
    let headline = '';
    const sentences = raw.split(/[.!\n]+/).filter(Boolean);
    const firstSentence = sentences[0]?.trim() || '';

    if (firstSentence.length > 5 && firstSentence.length <= 60) {
      headline = firstSentence.toUpperCase();
    } else if (lower.includes('diwali') || lower.includes('festive')) {
      headline = 'DIWALI SPECIAL STEEL BOOKING OFFER';
    } else if (lower.includes('drop') || lower.includes('reduction')) {
      headline = 'RAIPUR STEEL PRICE DROP ALERT';
    } else if (lower.includes('weekend')) {
      headline = 'NAV DURGA WEEKEND MILL BOOKING';
    } else if (price) {
      headline = 'SPECIAL DIRECT ROLLING MILL OFFER';
    } else {
      headline = 'NAV DURGA ISPAT SPECIAL RATE UPDATE';
    }

    // 4. Subheadline
    let subheadline = sentences[1]?.trim() || '';
    if (!subheadline || subheadline.length > 80) {
      subheadline = 'Direct Rolling Mill Ex-Plant Dispatch • Urla Industrial Area, Raipur';
    }

    // 5. Badge Text
    const badges = [
      'HOT DEAL',
      'LIMITED TIME',
      'DIRECT EX-PLANT',
      'BEST MARKET RATE',
      'ROLLING MILL OFFER',
      'IMMEDIATE LOADING',
      'PRIME QUALITY STEEL',
    ];
    let badge = badges[Math.floor(Math.random() * badges.length)];
    if (lower.includes('today')) badge = "TODAY'S SPECIAL OFFER";
    if (lower.includes('diwali')) badge = 'DIWALI DHAMAKA OFFER';
    if (lower.includes('urgent') || lower.includes('flash') || lower.includes('limited')) badge = 'FLASH SALE • LIMITED STOCK';

    // 6. Features / Benefits
    const features: string[] = [
      'Direct Rolling Mill Supply (Urla Mill)',
      'Immediate Trailer & Truck Loading',
      'IS 2062 & Commercial Grades Guaranteed',
      'Ex-Plant Raipur Delivery with Mill TC',
    ];

    if (lower.includes('20 mt') || lower.includes('bulk')) {
      features[1] = 'Special Discounts for Orders 20+ MT';
    }
    if (lower.includes('spot') || lower.includes('cash')) {
      features[2] = 'Extra Rebate for Prompt Spot Payments';
    }

    return {
      headline,
      subheadline,
      badge,
      price,
      priceLabel,
      detectedProducts,
      relevantTypes,
      features,
      cta: 'BOOK ON WHATSAPP: +91 97521 83053',
    };
  }

  /**
   * Generates targeted 3D product visual positions based on detected products
   */
  private static generateTargeted3DProductPositions(
    relevantTypes: { type: AISteelProduct3DType; label: string }[],
    prng: () => number
  ): AISteelProductVisual[] {
    const visuals: AISteelProductVisual[] = [];

    if (relevantTypes.length === 1) {
      // Single hero product: Center-Right hero showcase
      visuals.push({
        type: relevantTypes[0].type,
        xRatio: 0.65 + (prng() * 0.04 - 0.02),
        yRatio: 0.38 + (prng() * 0.04 - 0.02),
        scale: 1.15,
        rotationDeg: prng() > 0.5 ? -12 : 12,
        highlightText: relevantTypes[0].label,
      });
    } else {
      // Multi-product: Primary on right, secondary on left/accent
      visuals.push({
        type: relevantTypes[0].type,
        xRatio: 0.68,
        yRatio: 0.36,
        scale: 1.05,
        rotationDeg: -10 + (prng() * 6 - 3),
        highlightText: relevantTypes[0].label,
      });

      visuals.push({
        type: relevantTypes[1]?.type || 'angle',
        xRatio: 0.22,
        yRatio: 0.42,
        scale: 0.92,
        rotationDeg: 12 + (prng() * 6 - 3),
        highlightText: relevantTypes[1]?.label || 'MS Structural Steel',
      });
    }

    return visuals;
  }

  /**
   * Builds WhatsApp Share Text
   */
  private static buildWhatsAppShareText(data: {
    headline: string;
    subheadline: string;
    price: string | null;
    products: { name: string }[];
    features: string[];
    cta: string;
  }): string {
    let text = `*🔥 ${data.headline}*\n`;
    text += `_${data.subheadline}_\n\n`;

    if (data.price) {
      text += `💰 *RATE HIGHLIGHT:* *${data.price}*\n`;
      text += `_(Ex-Plant Urla, Raipur • GST Extra as applicable)_\n\n`;
    }

    text += `*📦 AVAILABLE SPECIFICATIONS:*\n`;
    data.products.forEach((p) => {
      text += `▫️ *${p.name}*\n`;
    });

    text += `\n*✨ ADVANTAGES:*\n`;
    data.features.forEach((f) => {
      text += `✅ ${f}\n`;
    });

    text += `\n*🏢 NAVDURGA ISPAT PVT. LTD.*\n`;
    text += `📍 Urla Industrial Area, Raipur, Chhattisgarh (493221)\n`;
    text += `📲 *Instant Booking / Inquiry:* +91 97521 83053\n`;
    text += `_Please check the attached promotional rate graphic for details._`;

    return text;
  }

  /**
   * Hydrates server response with fallback values
   */
  private static hydrateRecipe(
    data: any,
    promptText: string,
    seed: number,
    aspectRatio: '1:1' | '4:5'
  ): AIGraphicRecipe {
    const prng = this.createPRNG(seed);

    const layoutStyle =
      LAYOUT_STYLES.includes(data.layoutStyle)
        ? data.layoutStyle
        : LAYOUT_STYLES[Math.floor(prng() * LAYOUT_STYLES.length)];

    const colorPalette =
      AI_COLOR_PALETTES.find((p) => p.name === data.colorPaletteName) ||
      AI_COLOR_PALETTES[Math.floor(prng() * AI_COLOR_PALETTES.length)];

    const backgroundDecor =
      BACKGROUND_DECORS.includes(data.backgroundDecor)
        ? data.backgroundDecor
        : BACKGROUND_DECORS[Math.floor(prng() * BACKGROUND_DECORS.length)];

    const parsedFallback = this.parsePromptText(promptText);

    return {
      headline: data.headline || parsedFallback.headline,
      subheadline: data.subheadline || parsedFallback.subheadline,
      badge: data.badge || parsedFallback.badge,
      price: data.price !== undefined ? data.price : parsedFallback.price,
      priceLabel: data.priceLabel || parsedFallback.priceLabel,
      features: Array.isArray(data.features) && data.features.length > 0 ? data.features : parsedFallback.features,
      cta: data.cta || parsedFallback.cta,
      products: Array.isArray(data.products) && data.products.length > 0 ? data.products : parsedFallback.detectedProducts,
      layoutStyle,
      colorPalette,
      backgroundDecor,
      productVisuals: this.generateTargeted3DProductPositions(parsedFallback.relevantTypes, prng),
      decorations: {
        hasGoldSeal: true,
        hasUrlaBadge: true,
        hasPrimeQualityShield: true,
        hasRibbon: true,
        hasSparks: true,
        hasCornerTechBrackets: true,
      },
      aspectRatio,
      seed,
      generationId: `ND-AI-${Math.floor(prng() * 90000 + 10000)}`,
      formattedShareText: this.buildWhatsAppShareText({
        headline: data.headline || parsedFallback.headline,
        subheadline: data.subheadline || parsedFallback.subheadline,
        price: data.price !== undefined ? data.price : parsedFallback.price,
        products: data.products || parsedFallback.detectedProducts,
        features: data.features || parsedFallback.features,
        cta: data.cta || parsedFallback.cta,
      }),
    };
  }

  /**
   * Deterministic Pseudo-Random Number Generator based on seed
   */
  private static createPRNG(seed: number): () => number {
    let s = Math.abs(seed) % 2147483647;
    if (s <= 0) s += 2147483646;

    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
}
