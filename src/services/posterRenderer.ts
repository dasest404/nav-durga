import { Product, CompanySettings, CommonProductImage, WhatsAppThemeName } from '../types';
import { doesProductMatchSection } from '../utils/sectionPriceHelper';

export interface PosterRenderOptions {
  dateStr?: string;
  pageIndex?: number; // 0 for Post 1, 1 for Post 2
  totalPages?: number;
  aspectRatio?: '4:5' | '1:1';
  layoutMode?: 'multi-post' | 'single-master' | 'auto-split';
  sectionTitle?: string;
  millFilter?: string;
  commonProductImages?: CommonProductImage[];
  remarks?: string;
  itemsPerPage?: number;
}

export interface PosterThemeDefinition {
  id: WhatsAppThemeName;
  name: string;
  tagline: string;
  description: string;
  badgeClass: string;
  previewBg: string;
  previewAccent: string;
}

export const POSTER_THEMES: PosterThemeDefinition[] = [
  {
    id: 'premium-industrial',
    name: 'Theme A — Premium Industrial',
    tagline: 'Corporate Steel Aesthetic',
    description: 'Metallic precision accents, dark navy header & high-contrast steel cards',
    badgeClass: 'bg-slate-900 text-cyan-400 border border-slate-700',
    previewBg: '#0f2744',
    previewAccent: '#2563eb',
  },
  {
    id: 'modern-steel',
    name: 'Theme B — Modern Steel',
    tagline: 'Editorial Architectural',
    description: 'Modern editorial layout with large price numbers and structured cards',
    badgeClass: 'bg-blue-600 text-white',
    previewBg: '#f8fafc',
    previewAccent: '#e11d48',
  },
  {
    id: 'corporate-b2b',
    name: 'Theme C — Corporate B2B',
    tagline: 'Executive Business Bulletin',
    description: 'Very clean tabular layout designed for builders, dealers & EPC contractors',
    badgeClass: 'bg-blue-900 text-white',
    previewBg: '#ffffff',
    previewAccent: '#0a2540',
  },
  {
    id: 'engineering-grid',
    name: 'Theme D — Engineering Grid',
    tagline: 'Technical Mill Blueprint',
    description: 'Technical CAD sheet aesthetics, dimension markings & specification callouts',
    badgeClass: 'bg-slate-800 text-emerald-400 border border-slate-600',
    previewBg: '#f1f5f9',
    previewAccent: '#059669',
  },
  {
    id: 'dark-industrial',
    name: 'Theme E — Premium Dark Industrial',
    tagline: 'Graphite & Bronze Elegance',
    description: 'Deep charcoal & graphite canvas with illuminated metallic gold/cyan accents',
    badgeClass: 'bg-neutral-900 text-yellow-400 border border-yellow-600/40',
    previewBg: '#0f172a',
    previewAccent: '#f59e0b',
  },
  {
    id: 'clean-white-steel',
    name: 'Theme F — Clean White Steel',
    tagline: 'High-Contrast Daylight',
    description: 'Crisp white & platinum layout with solid high-contrast price blocks',
    badgeClass: 'bg-white text-slate-900 border border-slate-300',
    previewBg: '#ffffff',
    previewAccent: '#0f172a',
  },
  {
    id: 'market-bulletin',
    name: 'Theme G — Daily Market Bulletin',
    tagline: 'Steel Trade Gazette',
    description: 'Financial newsprint bulletin inspired by commodity exchange dispatches',
    badgeClass: 'bg-amber-900 text-amber-200 border border-amber-700',
    previewBg: '#fbfbfa',
    previewAccent: '#78350f',
  },
];

export class PosterRenderer {
  /**
   * Helper: extract dominant benchmark rates for Medium and SL
   */
  static extractBenchmarkRates(products: Product[]): { mediumPrice: number; slPrice: number } {
    // 1. Medium Benchmark
    const mediumItems = products.filter(
      (p) =>
        (p.rateSource?.includes('NAV DURGA') || !p.rateSource) &&
        (doesProductMatchSection(p, 'Medium') ||
          p.grade === 'Medium' ||
          p.gaugeType === 'Medium' ||
          p.section === 'MEDIUM SECTION')
    );

    let mediumPrice = 51200;
    if (mediumItems.length > 0) {
      // Find the primary base rate or currentPrice
      const sorted = [...mediumItems].map((p) => p.finalRate ?? p.currentPrice ?? 0).filter((v) => v > 0);
      if (sorted.length > 0) mediumPrice = sorted[0];
    } else {
      const anyMedium = products.find((p) => (p.grade || '').toLowerCase().includes('med') || (p.section || '').toLowerCase().includes('med'));
      if (anyMedium && (anyMedium.finalRate || anyMedium.currentPrice)) {
        mediumPrice = anyMedium.finalRate ?? anyMedium.currentPrice;
      }
    }

    // 2. SL Benchmark
    const slItems = products.filter(
      (p) =>
        (p.rateSource?.includes('NAV DURGA') || !p.rateSource) &&
        (p.type === 'Super light' ||
          (p.type && p.type.toLowerCase().includes('super light')) ||
          p.grade === 'SL' ||
          p.gaugeType === 'SL' ||
          (p.name && p.name.includes('SL')))
    );

    let slPrice = 48500;
    if (slItems.length > 0) {
      const sorted = [...slItems].map((p) => p.finalRate ?? p.currentPrice ?? 0).filter((v) => v > 0);
      if (sorted.length > 0) slPrice = sorted[0];
    } else {
      const anySL = products.find((p) => (p.grade || '').toUpperCase() === 'SL' || (p.name || '').includes('SL'));
      if (anySL && (anySL.finalRate || anySL.currentPrice)) {
        slPrice = anySL.finalRate ?? anySL.currentPrice;
      }
    }

    return { mediumPrice, slPrice };
  }

  /**
   * Helper: Partition products across pages intelligently
   */
  static partitionProductsForPages(
    products: Product[],
    layoutMode: 'multi-post' | 'single-master' | 'auto-split' = 'auto-split',
    aspectRatio: '4:5' | '1:1' = '4:5'
  ): { pages: Product[][]; pageTitles: string[] } {
    if (layoutMode === 'single-master') {
      return {
        pages: [products],
        pageTitles: ['COMPLETE STEEL PRICE CATALOGUE'],
      };
    }

    // Default max items per page for clear readability without squishing text:
    // In Square (1:1), 7 items max.
    // In Portrait (4:5), 10 items max.
    const maxPerPage = aspectRatio === '1:1' ? 7 : 10;
    if (products.length <= maxPerPage) {
      return {
        pages: [products],
        pageTitles: ['STEEL PRICE CATALOGUE'],
      };
    }

    const pagesCount = Math.ceil(products.length / maxPerPage);
    const pages: Product[][] = [];
    const pageTitles: string[] = [];

    const itemsPerChunk = Math.ceil(products.length / pagesCount);
    for (let i = 0; i < pagesCount; i++) {
      const slice = products.slice(i * itemsPerChunk, (i + 1) * itemsPerChunk);
      if (slice.length > 0) {
        pages.push(slice);
        pageTitles.push(`STEEL PRICE BULLETIN — PAGE ${i + 1} OF ${pagesCount}`);
      }
    }

    return {
      pages,
      pageTitles,
    };
  }

  /**
   * Master Render Method
   */
  static render(
    canvas: HTMLCanvasElement,
    products: Product[],
    company: CompanySettings,
    themeId: WhatsAppThemeName = 'premium-industrial',
    options?: PosterRenderOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions: 4:5 Mobile Portrait (1080x1350) or 1:1 Square (1080x1080)
    const isSquare = options?.aspectRatio === '1:1';
    const width = 1080;
    const height = isSquare ? 1080 : 1350;
    canvas.width = width;
    canvas.height = height;

    const { mediumPrice, slPrice } = this.extractBenchmarkRates(products);

    // Normalize theme ID
    const normalizedTheme = this.normalizeTheme(themeId);

    // Format display date
    const rawDate = options?.dateStr || new Date().toISOString().split('T')[0];
    const dateObj = new Date(rawDate);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const monthLong = dateObj.toLocaleString('en-IN', { month: 'long' }).toUpperCase();
    const monthShort = dateObj.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
    const year = dateObj.getFullYear();
    const formattedDate = `${day} ${monthLong} ${year}`;
    const shortDate = `${day} ${monthShort} ${year}`;

    // Page information and intelligent multi-page partitioning
    const pageIndex = options?.pageIndex ?? 0;
    const partitioned = this.partitionProductsForPages(products, options?.layoutMode, options?.aspectRatio);
    const computedTotalPages = options?.totalPages ?? partitioned.pages.length;
    const pageItems = options?.layoutMode === 'single-master' ? products : (partitioned.pages[pageIndex] || products);

    // Execute theme-specific renderer
    switch (normalizedTheme) {
      case 'modern-steel':
        this.renderModernSteel(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'corporate-b2b':
        this.renderCorporateB2B(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'engineering-grid':
        this.renderEngineeringGrid(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'dark-industrial':
        this.renderDarkIndustrial(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'clean-white-steel':
        this.renderCleanWhiteSteel(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'market-bulletin':
        this.renderMarketBulletin(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
      case 'premium-industrial':
      default:
        this.renderPremiumIndustrial(ctx, width, height, pageItems, company, mediumPrice, slPrice, formattedDate, shortDate, pageIndex, computedTotalPages, options);
        break;
    }
  }

  /**
   * Helper: Map legacy theme names to new themes
   */
  private static normalizeTheme(theme: string): string {
    const map: Record<string, string> = {
      'modern-industrial': 'premium-industrial',
      'nav-durga-professional': 'premium-industrial',
      'industrial-steel': 'premium-industrial',
      'clean-steel': 'clean-white-steel',
      'minimal-business': 'clean-white-steel',
      'royal-blue': 'corporate-b2b',
      'premium-corporate': 'corporate-b2b',
      'warm-steel': 'modern-steel',
      'dark-knight': 'dark-industrial',
      'premium-gold': 'dark-industrial',
      'modern-metallic': 'engineering-grid',
      'steel-market-daily-rate': 'market-bulletin',
    };
    return map[theme] || theme;
  }

  // =========================================================================
  // THEME A: PREMIUM INDUSTRIAL
  // =========================================================================
  private static renderPremiumIndustrial(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const isSquare = height === 1080;
    const margin = 28;

    // Background Canvas
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Main Card Frame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 16);
    ctx.fill();

    // Outer Border with Industrial Rivets
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f2744';
    ctx.stroke();

    // Corner rivet details
    const drawRivet = (x: number, y: number) => {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawRivet(margin + 16, margin + 16);
    drawRivet(width - margin - 16, margin + 16);
    drawRivet(margin + 16, height - margin - 16);
    drawRivet(width - margin - 16, height - margin - 16);

    // --- HEADER ---
    const headerHeight = isSquare ? 136 : 156;
    ctx.fillStyle = '#0f2744';
    ctx.beginPath();
    ctx.roundRect(margin + 2, margin + 2, width - margin * 2 - 4, headerHeight, [14, 14, 0, 0]);
    ctx.fill();

    // Subtle metallic highlight line
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(margin + 2, margin + headerHeight - 4, width - margin * 2 - 4, 4);

    // Top Tagline Bar
    ctx.fillStyle = '#93c5fd';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GOVT. RECOGNIZED STEEL ROLLING MILL • RAIPUR (CHHATTISGARH)', margin + 24, margin + 32);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(totalPages > 1 ? `OFFICIAL BULLETIN • POST ${pageIndex + 1} OF ${totalPages}` : 'OFFICIAL DAILY MARKET BULLETIN', width - margin - 24, margin + 32);

    // Company Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', margin + 24, margin + 74);

    // Subtitle & Location
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MANUFACTURER & DISTRIBUTOR • MS CHANNELS & BEAMS / JOISTS', margin + 24, margin + 100);

    // Date Badge (Right Header)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(width - margin - 280, margin + 48, 256, 58, 10);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY PRICE UPDATE', width - margin - 152, margin + 68);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(shortDate, width - margin - 152, margin + 94);

    // --- HERO PRICE POST: MEDIUM & SL PRICE CARDS ---
    const heroY = margin + headerHeight + 14;
    const heroHeight = isSquare ? 116 : 138;
    const cardWidth = (width - margin * 2 - 28) / 2;

    // CARD 1: MEDIUM PRICE
    const medCardX = margin + 10;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(medCardX, heroY, cardWidth, heroHeight, 12);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1d4ed8';
    ctx.stroke();

    // Medium Header Ribbon
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(medCardX, heroY, cardWidth, 32, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MEDIUM SECTION BENCHMARK', medCardX + 16, heroY + 21);

    ctx.textAlign = 'right';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#bfdbfe';
    ctx.fillText('CHANNELS & BEAMS', medCardX + cardWidth - 16, heroY + 21);

    // Medium Price Number
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, medCardX + 16, heroY + (isSquare ? 72 : 82));

    ctx.fillStyle = '#2563eb';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', medCardX + 220, heroY + (isSquare ? 72 : 82));

    // Medium Sub-details
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Base Rate • Ex-Plant Urla • Channels 125–250mm & Beams 100–300mm', medCardX + 16, heroY + (isSquare ? 98 : 116));

    // CARD 2: SL (SUPER LIGHT) PRICE
    const slCardX = medCardX + cardWidth + 8;
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(slCardX, heroY, cardWidth, heroHeight, 12);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // SL Header Ribbon
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(slCardX, heroY, cardWidth, 32, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SL (SUPER LIGHT) BENCHMARK', slCardX + 16, heroY + 21);

    ctx.textAlign = 'right';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fef3c7';
    ctx.fillText('LIGHT PROFILES', slCardX + cardWidth - 16, heroY + 21);

    // SL Price Number
    ctx.textAlign = 'left';
    ctx.fillStyle = '#78350f';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, slCardX + 16, heroY + (isSquare ? 72 : 82));

    ctx.fillStyle = '#d97706';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', slCardX + 220, heroY + (isSquare ? 72 : 82));

    // SL Sub-details
    ctx.fillStyle = '#92400e';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Base Rate • Ex-Plant Urla • MS Channels 75×40, 100×50 & 125×65 SL', slCardX + 16, heroY + (isSquare ? 98 : 116));

    // --- PRODUCT TABLE LEDGER ---
    const tableTop = heroY + heroHeight + 14;
    const footerHeight = 110;
    const tableBottom = height - margin - footerHeight - 10;
    const availableTableHeight = tableBottom - tableTop;

    this.renderStructuredLedger(ctx, margin + 10, tableTop, width - margin * 2 - 20, availableTableHeight, products, {
      headerBg: '#0f2744',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f8fafc',
      textColor: '#0f172a',
      subTextColor: '#475569',
      priceColor: '#1e40af',
      dividerColor: '#e2e8f0',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
    });

    // --- FOOTER ---
    this.renderIndustrialFooter(ctx, margin + 2, height - margin - footerHeight, width - margin * 2 - 4, footerHeight, {
      bg: '#0f2744',
      phoneColor: '#ffffff',
      subColor: '#93c5fd',
      sealColor: '#facc15',
    });
  }

  // =========================================================================
  // THEME B: MODERN STEEL (Editorial, Architectural)
  // =========================================================================
  private static renderModernSteel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 24;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Architectural outer border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Accent vermilion bar
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(margin, margin, 10, height - margin * 2);

    // Header Area
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 42px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NAV DURGA ISPAT', margin + 32, margin + 58);

    ctx.fillStyle = '#64748b';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STEEL MANUFACTURERS • INDUSTRIAL ARCHITECTURE • URLA, RAIPUR', margin + 32, margin + 84);

    // Date & Bulletin Tag (Right aligned)
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.roundRect(width - margin - 260, margin + 28, 236, 62, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY PRICE BULLETIN', width - margin - 142, margin + 50);
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(shortDate, width - margin - 142, margin + 74);

    // HERO PRICE BANNER (Architectural Asymmetric Split)
    const heroY = margin + 110;
    const heroH = 130;
    const wHalf = (width - margin * 2 - 50) / 2;

    // Box 1: MEDIUM
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(margin + 32, heroY, wHalf, heroH, 8);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BENCHMARK // 01', margin + 50, heroY + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEDIUM SECTION', margin + 50, heroY + 54);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 50, heroY + 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 260, heroY + 100);

    // Box 2: SL (SUPER LIGHT)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(margin + 32 + wHalf + 10, heroY, wHalf, heroH, 8);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BENCHMARK // 02', margin + 50 + wHalf + 10, heroY + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SUPER LIGHT (SL)', margin + 50 + wHalf + 10, heroY + 54);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 50 + wHalf + 10, heroY + 100);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 260 + wHalf + 10, heroY + 100);

    // Table
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 32, tableTop, width - margin * 2 - 44, tableBottom - tableTop, products, {
      headerBg: '#1e293b',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f1f5f9',
      textColor: '#0f172a',
      subTextColor: '#475569',
      priceColor: '#e11d48',
      dividerColor: '#cbd5e1',
      badgeBg: '#f1f5f9',
      badgeText: '#0f172a',
    });

    // Footer
    this.renderIndustrialFooter(ctx, margin + 32, height - margin - footerH, width - margin * 2 - 44, footerH, {
      bg: '#0f172a',
      phoneColor: '#ffffff',
      subColor: '#94a3b8',
      sealColor: '#e11d48',
    });
  }

  // =========================================================================
  // THEME C: CORPORATE B2B (Executive Business Bulletin)
  // =========================================================================
  private static renderCorporateB2B(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 26;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Clean Corporate Double Border
    ctx.strokeStyle = '#0a2540';
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 5, margin + 5, width - margin * 2 - 10, height - margin * 2 - 10);

    // Formal Corporate Header
    ctx.fillStyle = '#0a2540';
    ctx.fillRect(margin + 6, margin + 6, width - margin * 2 - 12, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', width / 2, margin + 54);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('OFFICIAL COMMERCIAL PRICE BULLETIN • STRUCTURAL ROLLING DIVISION', width / 2, margin + 82);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`DATE: ${formattedDate.toUpperCase()} • EX-PLANT URLA, RAIPUR • GST 18% EXTRA`, width / 2, margin + 114);

    // HERO PRICE CERTIFICATE PANEL
    const heroY = margin + 160;
    const heroH = 120;
    const boxW = (width - margin * 2 - 40) / 2;

    // Medium Certificate Box
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(margin + 16, heroY, boxW, heroH, 8);
    ctx.fill();
    ctx.strokeStyle = '#0a2540';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0a2540';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL BENCHMARK — MEDIUM SECTION', margin + 16 + boxW / 2, heroY + 28);

    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 16 + boxW / 2, heroY + 74);

    ctx.fillStyle = '#475569';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PER METRIC TON (MT) • IS 2062 E250 / COMMERCIAL', margin + 16 + boxW / 2, heroY + 102);

    // SL Certificate Box
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(margin + 24 + boxW, heroY, boxW, heroH, 8);
    ctx.fill();
    ctx.strokeStyle = '#0a2540';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0a2540';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL BENCHMARK — SUPER LIGHT (SL)', margin + 24 + boxW + boxW / 2, heroY + 28);

    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 24 + boxW + boxW / 2, heroY + 74);

    ctx.fillStyle = '#475569';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PER METRIC TON (MT) • STANDARD COMMERCIAL TOLERANCE', margin + 24 + boxW + boxW / 2, heroY + 102);

    // Ledger Table
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 16, tableTop, width - margin * 2 - 32, tableBottom - tableTop, products, {
      headerBg: '#0a2540',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f8fafc',
      textColor: '#0f172a',
      subTextColor: '#475569',
      priceColor: '#0a2540',
      dividerColor: '#cbd5e1',
      badgeBg: '#e2e8f0',
      badgeText: '#0f172a',
    });

    // Formal Footer
    this.renderIndustrialFooter(ctx, margin + 6, height - margin - footerH - 6, width - margin * 2 - 12, footerH, {
      bg: '#0a2540',
      phoneColor: '#ffffff',
      subColor: '#93c5fd',
      sealColor: '#ffffff',
    });
  }

  // =========================================================================
  // THEME D: ENGINEERING GRID (Technical Blueprint)
  // =========================================================================
  private static renderEngineeringGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 26;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw technical millimeter background grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = margin; x <= width - margin; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }
    for (let y = margin; y <= height - margin; y += 36) {
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }

    // Outer Blueprint Border
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Crosshairs on corners
    const drawCross = (cx: number, cy: number) => {
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
    };
    drawCross(margin + 12, margin + 12);
    drawCross(width - margin - 12, margin + 12);
    drawCross(margin + 12, height - margin - 12);
    drawCross(width - margin - 12, height - margin - 12);

    // Technical Header Title Block
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(margin + 2, margin + 2, width - margin * 2 - 4, 136);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// SPECIFICATION SHEET: IS 808 / IS 2062 ROLLING MILL //', margin + 24, margin + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', margin + 24, margin + 72);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText('DAILY STRUCTURAL STEEL ROLLING DISPATCH RATES • URLA INDUSTRIAL COMPLEX', margin + 24, margin + 98);

    // Date & Drawing Ref
    ctx.fillStyle = '#047857';
    ctx.fillRect(width - margin - 260, margin + 24, 240, 90);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(width - margin - 260, margin + 24, 240, 90);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ISSUE DATE', width - margin - 140, margin + 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 17px "JetBrains Mono", monospace';
    ctx.fillText(shortDate, width - margin - 140, margin + 70);
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillText(totalPages > 1 ? `SHEET ${pageIndex + 1} OF ${totalPages}` : 'REV: APPROVED', width - margin - 140, margin + 96);

    // TECHNICAL HERO PRICE CALLOUT BLOCKS
    const heroY = margin + 154;
    const heroH = 126;
    const bW = (width - margin * 2 - 36) / 2;

    // Callout 1: Medium
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(margin + 14, heroY, bW, heroH);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 14, heroY, bW, heroH);

    ctx.fillStyle = '#065f46';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[CALLOUT 01: MEDIUM SECTION BASE]', margin + 28, heroY + 26);

    ctx.fillStyle = '#064e3b';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 28, heroY + 72);
    ctx.fillStyle = '#059669';
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.fillText('/ MT', margin + 230, heroY + 72);

    ctx.fillStyle = '#475569';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('GRADE: Fe 410 / E250 • CHANNELS & BEAMS', margin + 28, heroY + 104);

    // Callout 2: SL
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(margin + 22 + bW, heroY, bW, heroH);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 22 + bW, heroY, bW, heroH);

    ctx.fillStyle = '#065f46';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[CALLOUT 02: SUPER LIGHT (SL) BASE]', margin + 36 + bW, heroY + 26);

    ctx.fillStyle = '#064e3b';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 36 + bW, heroY + 72);
    ctx.fillStyle = '#059669';
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.fillText('/ MT', margin + 238 + bW, heroY + 72);

    ctx.fillStyle = '#475569';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('GRADE: COMMERCIAL • LIGHT SECTION CHANNELS', margin + 36 + bW, heroY + 104);

    // Table
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 14, tableTop, width - margin * 2 - 28, tableBottom - tableTop, products, {
      headerBg: '#064e3b',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f0fdf4',
      textColor: '#0f172a',
      subTextColor: '#047857',
      priceColor: '#065f46',
      dividerColor: '#a7f3d0',
      badgeBg: '#d1fae5',
      badgeText: '#065f46',
    });

    // Technical Footer
    this.renderIndustrialFooter(ctx, margin + 2, height - margin - footerH, width - margin * 2 - 4, footerH, {
      bg: '#064e3b',
      phoneColor: '#ffffff',
      subColor: '#a7f3d0',
      sealColor: '#34d399',
    });
  }

  // =========================================================================
  // THEME E: PREMIUM DARK INDUSTRIAL (Graphite & Bronze Elegance)
  // =========================================================================
  private static renderDarkIndustrial(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 26;

    // Dark graphite background (NEVER flat black)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Inner Card
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 16);
    ctx.fill();

    // Brushed gold/bronze outer stroke
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Header Band
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(margin + 2, margin + 2, width - margin * 2 - 4, 146, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ NAV DURGA ISPAT ROLLING MILLS • RAIPUR', margin + 24, margin + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', margin + 24, margin + 74);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PREMIUM STRUCTURAL STEEL • CHANNELS & JOISTS / BEAMS', margin + 24, margin + 102);

    // Date Badge Right
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(width - margin - 260, margin + 36, 236, 68, 10);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY STEEL RATES', width - margin - 142, margin + 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(shortDate, width - margin - 142, margin + 88);

    // HERO PRICE POST: DUAL METALLIC DARK CARDS
    const heroY = margin + 162;
    const heroH = 130;
    const cardW = (width - margin * 2 - 32) / 2;

    // Card 1: MEDIUM (Gold glow)
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(margin + 12, heroY, cardW, heroH, 12);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MEDIUM SECTION BENCHMARK', margin + 28, heroY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 28, heroY + 80);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 230, heroY + 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Channels 125–250mm • Beams 100–300mm • IS 2062', margin + 28, heroY + 110);

    // Card 2: SL (Cyan Steel glow)
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(margin + 20 + cardW, heroY, cardW, heroH, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SUPER LIGHT (SL) BENCHMARK', margin + 36 + cardW, heroY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 36 + cardW, heroY + 80);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 238 + cardW, heroY + 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MS Channels 75×40, 100×50, 125×65 SL • Commercial', margin + 36 + cardW, heroY + 110);

    // Dark Table Ledger
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 12, tableTop, width - margin * 2 - 24, tableBottom - tableTop, products, {
      headerBg: '#090d16',
      headerTextColor: '#f59e0b',
      rowEven: '#111827',
      rowOdd: '#1e293b',
      textColor: '#ffffff',
      subTextColor: '#94a3b8',
      priceColor: '#38bdf8',
      dividerColor: '#334155',
      badgeBg: '#1e293b',
      badgeText: '#f59e0b',
    });

    // Dark Footer
    this.renderIndustrialFooter(ctx, margin + 2, height - margin - footerH, width - margin * 2 - 4, footerH, {
      bg: '#090d16',
      phoneColor: '#ffffff',
      subColor: '#94a3b8',
      sealColor: '#f59e0b',
    });
  }

  // =========================================================================
  // THEME F: CLEAN WHITE STEEL (Bright Daylight High-Contrast)
  // =========================================================================
  private static renderCleanWhiteSteel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 26;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Top Header
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(margin, margin, width - margin * 2, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', margin + 24, margin + 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DAILY PRICE UPDATE • URLA INDUSTRIAL AREA, RAIPUR (C.G.)', margin + 24, margin + 88);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formattedDate.toUpperCase(), width - margin - 24, margin + 60);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(totalPages > 1 ? `PART ${pageIndex + 1} OF ${totalPages}` : 'EX-PLANT URLA', width - margin - 24, margin + 88);

    // SOLID HIGH-CONTRAST BLOCKS FOR MEDIUM AND SL
    const heroY = margin + 156;
    const heroH = 120;
    const bW = (width - margin * 2 - 28) / 2;

    // Block 1: Medium (Solid Charcoal)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(margin + 10, heroY, bW, heroH, 8);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PRIMARY BENCHMARK', margin + 24, heroY + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEDIUM PRICE', margin + 24, heroY + 54);

    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 24, heroY + 100);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 230, heroY + 100);

    // Block 2: SL (Solid Steel Blue)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(margin + 18 + bW, heroY, bW, heroH, 8);
    ctx.fill();

    ctx.fillStyle = '#bfdbfe';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIGHT BENCHMARK', margin + 32 + bW, heroY + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SL (SUPER LIGHT)', margin + 32 + bW, heroY + 54);

    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 32 + bW, heroY + 100);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 238 + bW, heroY + 100);

    // Ledger Table
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 10, tableTop, width - margin * 2 - 20, tableBottom - tableTop, products, {
      headerBg: '#0f172a',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f8fafc',
      textColor: '#0f172a',
      subTextColor: '#475569',
      priceColor: '#0f172a',
      dividerColor: '#e2e8f0',
      badgeBg: '#e2e8f0',
      badgeText: '#0f172a',
    });

    // Clean Footer
    this.renderIndustrialFooter(ctx, margin, height - margin - footerH, width - margin * 2, footerH, {
      bg: '#0f172a',
      phoneColor: '#ffffff',
      subColor: '#cbd5e1',
      sealColor: '#ffffff',
    });
  }

  // =========================================================================
  // THEME G: DAILY MARKET BULLETIN (Steel Trade Gazette)
  // =========================================================================
  private static renderMarketBulletin(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    products: Product[],
    company: CompanySettings,
    mediumPrice: number,
    slPrice: number,
    formattedDate: string,
    shortDate: string,
    pageIndex: number,
    totalPages: number,
    options?: PosterRenderOptions
  ): void {
    const margin = 26;

    ctx.fillStyle = '#fbfbfa';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Masthead
    ctx.fillStyle = '#1c1917';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE STEEL MARKET BULLETIN • OFFICIAL EX-PLANT DISPATCH GAZETTE', width / 2, margin + 32);

    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + 20, margin + 42);
    ctx.lineTo(width - margin - 20, margin + 42);
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PVT. LTD.', width / 2, margin + 86);

    ctx.fillStyle = '#78350f';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`RAIPUR SPOT MARKET • ${formattedDate.toUpperCase()} • ISSUE NO. ${dateToIssueNumber(formattedDate)}`, width / 2, margin + 112);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin + 20, margin + 126);
    ctx.lineTo(width - margin - 20, margin + 126);
    ctx.stroke();

    // EDITORIAL BENCHMARK SPOT FEATURE
    const heroY = margin + 140;
    const heroH = 118;
    const boxW = (width - margin * 2 - 28) / 2;

    // Medium Spotlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(margin + 10, heroY, boxW, heroH);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 10, heroY, boxW, heroH);

    ctx.fillStyle = '#78350f';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MARKET SPOT // MEDIUM SECTION', margin + 24, heroY + 26);

    ctx.fillStyle = '#1c1917';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${mediumPrice.toLocaleString('en-IN')}`, margin + 24, heroY + 74);

    ctx.fillStyle = '#78350f';
    ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 230, heroY + 74);

    ctx.fillStyle = '#44403c';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('● ACTIVE ROLLING • MS CHANNELS & BEAMS', margin + 24, heroY + 102);

    // SL Spotlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(margin + 18 + boxW, heroY, boxW, heroH);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 18 + boxW, heroY, boxW, heroH);

    ctx.fillStyle = '#78350f';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MARKET SPOT // SUPER LIGHT (SL)', margin + 32 + boxW, heroY + 26);

    ctx.fillStyle = '#1c1917';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹ ${slPrice.toLocaleString('en-IN')}`, margin + 32 + boxW, heroY + 74);

    ctx.fillStyle = '#78350f';
    ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ MT', margin + 238 + boxW, heroY + 74);

    ctx.fillStyle = '#44403c';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('● ACTIVE ROLLING • MS CHANNELS 75-125 SL', margin + 32 + boxW, heroY + 102);

    // Table
    const tableTop = heroY + heroH + 16;
    const footerH = 100;
    const tableBottom = height - margin - footerH - 12;

    this.renderStructuredLedger(ctx, margin + 10, tableTop, width - margin * 2 - 20, tableBottom - tableTop, products, {
      headerBg: '#1c1917',
      headerTextColor: '#ffffff',
      rowEven: '#ffffff',
      rowOdd: '#f5f5f4',
      textColor: '#1c1917',
      subTextColor: '#57534e',
      priceColor: '#78350f',
      dividerColor: '#d6d3d1',
      badgeBg: '#e7e5e4',
      badgeText: '#1c1917',
    });

    // Editorial Footer
    this.renderIndustrialFooter(ctx, margin, height - margin - footerH, width - margin * 2, footerH, {
      bg: '#1c1917',
      phoneColor: '#ffffff',
      subColor: '#d6d3d1',
      sealColor: '#fde047',
    });
  }

  // =========================================================================
  // SHARED COMPONENT: STRUCTURED PRODUCT LEDGER
  // =========================================================================
  private static renderStructuredLedger(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    items: Product[],
    style: {
      headerBg: string;
      headerTextColor: string;
      rowEven: string;
      rowOdd: string;
      textColor: string;
      subTextColor: string;
      priceColor: string;
      dividerColor: string;
      badgeBg: string;
      badgeText: string;
    }
  ): void {
    if (items.length === 0) return;

    // Table Header
    const thHeight = 36;
    ctx.fillStyle = style.headerBg;
    ctx.beginPath();
    ctx.roundRect(x, y, width, thHeight, [8, 8, 0, 0]);
    ctx.fill();

    ctx.fillStyle = style.headerTextColor;
    ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('S.NO.', x + 14, y + 23);
    ctx.fillText('PRODUCT', x + 62, y + 23);
    ctx.fillText('SIZE', x + 310, y + 23);
    ctx.fillText('GAUGE DIFF.', x + 530, y + 23);

    ctx.textAlign = 'right';
    ctx.fillText('FINAL RATE (₹/MT)', x + width - 18, y + 23);

    // Calculate row height dynamically to fit available space perfectly
    const availableRows = items.length;
    const bodyHeight = height - thHeight;
    const rawRowH = bodyHeight / availableRows;
    const rowH = Math.max(38, Math.min(54, rawRowH));

    let currY = y + thHeight;

    items.forEach((item, idx) => {
      // Background striping
      ctx.fillStyle = idx % 2 === 0 ? style.rowEven : style.rowOdd;
      ctx.fillRect(x, currY, width, rowH);

      // Bottom Divider
      ctx.strokeStyle = style.dividerColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, currY + rowH);
      ctx.lineTo(x + width, currY + rowH);
      ctx.stroke();

      // S.No.
      ctx.fillStyle = style.subTextColor;
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(idx + 1).padStart(2, '0'), x + 14, currY + rowH / 2 + 5);

      // Product Name
      const prodName = item.name || item.productName || 'MS Steel';
      ctx.fillStyle = style.textColor;
      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(prodName, x + 62, currY + rowH / 2 + 5);

      // Size
      const sizeStr = item.size || 'Standard';
      ctx.fillStyle = style.subTextColor;
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sizeStr, x + 310, currY + rowH / 2 + 5);

      // Gauge Difference Badge
      const gaugeDiff = item.gaugeDifference !== undefined && item.gaugeDifference !== null ? item.gaugeDifference : 0;
      const gaugeText = gaugeDiff > 0 ? `+₹${gaugeDiff.toLocaleString('en-IN')}` : gaugeDiff < 0 ? `-₹${Math.abs(gaugeDiff).toLocaleString('en-IN')}` : 'Base Rate';

      const badgeW = 96;
      const badgeH = 22;
      const badgeX = x + 530;
      const badgeY = currY + (rowH - badgeH) / 2;

      ctx.fillStyle = gaugeDiff > 0 ? '#e0f2fe' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
      ctx.fill();

      ctx.fillStyle = gaugeDiff > 0 ? '#0369a1' : '#475569';
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gaugeText, badgeX + badgeW / 2, badgeY + 15);

      // Final Rate / MT
      const priceVal = item.finalRate ?? item.currentPrice ?? 0;
      ctx.fillStyle = style.priceColor;
      ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹ ${priceVal.toLocaleString('en-IN')}`, x + width - 18, currY + rowH / 2 + 5);

      currY += rowH;
    });
  }

  // =========================================================================
  // SHARED COMPONENT: OFFICIAL INDUSTRIAL FOOTER
  // =========================================================================
  private static renderIndustrialFooter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    palette: {
      bg: string;
      phoneColor: string;
      subColor: string;
      sealColor: string;
    }
  ): void {
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [0, 0, 14, 14]);
    ctx.fill();

    // Hotlines
    ctx.fillStyle = palette.phoneColor;
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '📞 BOOKING & INQUIRY HOTLINES: 9009544333  •  7000923464  •  9713144333',
      x + width / 2,
      y + 36
    );

    // Terms
    ctx.fillStyle = palette.subColor;
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'Terms: GST 18% Extra • Rates subject to dynamic market conditions • Please confirm booking before vehicle placement',
      x + width / 2,
      y + 64
    );

    // Compliance & Watermark
    ctx.fillStyle = palette.sealColor;
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'OFFICIAL NAV DURGA ISPAT MANUFACTURER DISPATCH • URLA INDUSTRIAL AREA, RAIPUR (C.G.)',
      x + width / 2,
      y + 88
    );
  }
}

function dateToIssueNumber(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % 9000;
  }
  return String(1000 + Math.abs(hash));
}
