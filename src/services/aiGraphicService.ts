import {
  AIGraphicRecipe,
  AIGraphicColorPalette,
  AIGraphicLayoutStyle,
  AIGraphicBackgroundDecor,
  AISteelProductVisual,
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
    name: 'High-Tech Industrial Cyan & Cobalt',
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
    name: 'Royal Purple & Cyber Yellow',
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
        if (data && data.headline) {
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

    // 1. Text Parsing & Entity Extraction
    const parsed = this.parsePromptText(promptText);

    // 2. Random Selection of Layout, Palette & Background
    const layoutStyle = LAYOUT_STYLES[Math.floor(prng() * LAYOUT_STYLES.length)];
    const colorPalette = AI_COLOR_PALETTES[Math.floor(prng() * AI_COLOR_PALETTES.length)];
    const backgroundDecor = BACKGROUND_DECORS[Math.floor(prng() * BACKGROUND_DECORS.length)];

    // 3. Random 3D Steel Products Visual Selection & Arrangement
    const productVisuals = this.generateRandom3DProductPositions(parsed.detectedProducts, prng);

    // 4. Random Decorations Flags
    const decorations = {
      hasGoldSeal: prng() > 0.25,
      hasUrlaBadge: prng() > 0.3,
      hasPrimeQualityShield: prng() > 0.4,
      hasRibbon: prng() > 0.5,
      hasSparks: prng() > 0.15,
      hasCornerTechBrackets: prng() > 0.35,
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
    features: string[];
    cta: string;
  } {
    const raw = text.trim();

    // 1. Detect Price (e.g. ₹48,500, 48500/MT, ₹500 off, Rs 49000)
    let price: string | null = null;
    let priceLabel = 'SPECIAL EX-PLANT RATE';

    const priceMatch = raw.match(
      /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(?:\/(?:MT|Ton|KG))?/i
    ) || raw.match(/([\d]{2,3}(?:,\d{3})+|\d{4,6})\s*(?:\/(?:MT|Ton|KG))/i);

    if (priceMatch) {
      const numStr = priceMatch[1].replace(/,/g, '');
      const num = Number(numStr);
      if (!isNaN(num)) {
        price = `₹${num.toLocaleString('en-IN')}/MT`;
      } else {
        price = priceMatch[0];
      }
    } else if (raw.toLowerCase().includes('off') || raw.toLowerCase().includes('discount')) {
      const discountMatch = raw.match(/(\d+)\s*(?:₹|rs|rupees|%|\/mt)?\s*(?:off|discount)/i);
      if (discountMatch) {
        price = `FLAT ₹${discountMatch[1]} OFF / MT`;
        priceLabel = 'LIMITED DISCOUNT OFFER';
      }
    }

    // 2. Detect Products Mentioned
    const detectedProducts: { name: string; tag?: string }[] = [];
    const lower = raw.toLowerCase();

    if (lower.includes('channel')) {
      const sizeMatch = raw.match(/(\d+\s*[x×]\s*\d+)\s*channel/i) || raw.match(/channel\s*(\d+\s*[x×]\s*\d+)/i);
      detectedProducts.push({
        name: sizeMatch ? `MS Channel ${sizeMatch[1]} mm` : 'MS Structural Channel',
        tag: 'In Stock',
      });
    }

    if (lower.includes('angle')) {
      const sizeMatch = raw.match(/(\d+\s*[x×]\s*\d+)\s*angle/i) || raw.match(/angle\s*(\d+\s*[x×]\s*\d+)/i);
      detectedProducts.push({
        name: sizeMatch ? `MS Angle ${sizeMatch[1]} mm` : 'MS Structural Angle',
        tag: 'Prime',
      });
    }

    if (lower.includes('beam') || lower.includes('joist')) {
      detectedProducts.push({ name: 'MS Heavy Beams & Joists', tag: 'Ex-Stock' });
    }

    if (lower.includes('tmt') || lower.includes('rebar')) {
      detectedProducts.push({ name: 'Fe 500D TMT Rebar (8mm-32mm)', tag: 'Tested' });
    }

    if (lower.includes('billet')) {
      detectedProducts.push({ name: 'Prime Commercial Billets', tag: 'Prime' });
    }

    if (detectedProducts.length === 0) {
      detectedProducts.push(
        { name: 'MS Angles (50x50 to 130x130)', tag: 'IS 2062' },
        { name: 'MS Channels (75x40 to 200x75)', tag: 'Rolling Now' }
      );
    }

    // 3. Detect / Synthesize Headline
    let headline = '';
    const sentences = raw.split(/[.!\n]+/).filter(Boolean);
    const firstSentence = sentences[0]?.trim() || '';

    if (firstSentence.length > 5 && firstSentence.length <= 60) {
      headline = firstSentence.toUpperCase();
    } else if (lower.includes('diwali') || lower.includes('festive') || lower.includes('offer')) {
      headline = 'SPECIAL FESTIVE STEEL OFFER';
    } else if (lower.includes('drop') || lower.includes('decrease') || lower.includes('reduction')) {
      headline = 'RAIPUR STEEL PRICE DROP ALERT';
    } else if (price) {
      headline = 'SPECIAL DIRECT ROLLING MILL OFFER';
    } else {
      headline = 'NAV DURGA ISPAT SPECIAL RATE UPDATE';
    }

    // 4. Subheadline
    let subheadline = sentences[1]?.trim() || '';
    if (!subheadline || subheadline.length > 80) {
      subheadline = 'Prime Structural Steel Ex-Plant Urla, Raipur • Direct Factory Loading';
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
    if (lower.includes('urgent') || lower.includes('flash')) badge = 'FLASH SALE • LIMITED STOCK';

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

    return {
      headline,
      subheadline,
      badge,
      price,
      priceLabel,
      detectedProducts,
      features,
      cta: 'BOOK ON WHATSAPP: +91 97521 83053',
    };
  }

  /**
   * Generates random 3D product positions and rotations
   */
  private static generateRandom3DProductPositions(
    products: { name: string }[],
    prng: () => number
  ): AISteelProductVisual[] {
    const types: ('channel' | 'angle' | 'beam' | 'tmt_bundle' | 'billet_stack')[] = [
      'channel',
      'angle',
      'beam',
      'tmt_bundle',
      'billet_stack',
    ];

    const visuals: AISteelProductVisual[] = [];
    const count = Math.min(2 + Math.floor(prng() * 2), 3); // 2 or 3 items

    // Configuration slots to avoid overlap with center text
    const slots = [
      { xRatio: 0.18, yRatio: 0.42, scale: 0.85, rot: -15 },
      { xRatio: 0.82, yRatio: 0.45, scale: 0.85, rot: 15 },
      { xRatio: 0.5, yRatio: 0.82, scale: 0.75, rot: 0 },
    ];

    for (let i = 0; i < count; i++) {
      const slot = slots[i];
      const type = types[Math.floor(prng() * types.length)];
      visuals.push({
        type,
        xRatio: slot.xRatio + (prng() * 0.06 - 0.03),
        yRatio: slot.yRatio + (prng() * 0.06 - 0.03),
        scale: slot.scale * (0.9 + prng() * 0.2),
        rotationDeg: slot.rot + (prng() * 10 - 5),
      });
    }

    return visuals;
  }

  /**
   * Helper: Builds WhatsApp Share Text
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
      productVisuals: this.generateRandom3DProductPositions(parsedFallback.detectedProducts, prng),
      decorations: {
        hasGoldSeal: data.decorations?.hasGoldSeal ?? true,
        hasUrlaBadge: data.decorations?.hasUrlaBadge ?? true,
        hasPrimeQualityShield: data.decorations?.hasPrimeQualityShield ?? true,
        hasRibbon: data.decorations?.hasRibbon ?? false,
        hasSparks: data.decorations?.hasSparks ?? true,
        hasCornerTechBrackets: data.decorations?.hasCornerTechBrackets ?? true,
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
   * Simple deterministic Pseudo-Random Number Generator based on seed
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
