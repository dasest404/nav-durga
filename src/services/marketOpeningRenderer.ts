import { MarketOpeningRates } from '../types';
import marketOpeningTemplateImg from '../assets/images/market_opening_template_1790859180670.jpg';

export class MarketOpeningRenderer {
  // Native dimensions of the uploaded Nav Durga base template
  public static readonly TEMPLATE_WIDTH = 1264;
  public static readonly TEMPLATE_HEIGHT = 848;

  private static templateImg: HTMLImageElement | null = null;
  private static isImgLoaded = false;
  private static isImgLoading = false;
  private static loadListeners: Array<() => void> = [];

  /**
   * Preload the base template image so it is immediately ready when rendering to canvas
   */
  public static preloadImage(onLoad?: () => void): void {
    if (this.isImgLoaded && this.templateImg) {
      onLoad?.();
      return;
    }

    if (onLoad) {
      this.loadListeners.push(onLoad);
    }

    if (this.isImgLoading) return;
    this.isImgLoading = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.templateImg = img;
      this.isImgLoaded = true;
      this.isImgLoading = false;
      const listeners = [...this.loadListeners];
      this.loadListeners = [];
      listeners.forEach((fn) => fn());
    };
    img.onerror = () => {
      // Fallback: try root public URL if bundled asset path had any issue
      if (img.src !== '/market_opening_template.jpg') {
        img.src = '/market_opening_template.jpg';
      } else {
        this.isImgLoading = false;
      }
    };
    img.src = marketOpeningTemplateImg;
  }

  /**
   * Renders the exact Nav Durga Market Opening graphic onto an HTML5 Canvas.
   * Uses the uploaded Nav Durga promotional image as the fixed base template.
   * Only the two price rows inside the boxed area are dynamically bound to the passed rates.
   * All other visual elements, logos, Maa Durga illustration, colors, layout, and contact numbers
   * remain completely preserved and faithful to the reference image.
   */
  static renderToCanvas(
    canvas: HTMLCanvasElement,
    rates: MarketOpeningRates,
    onReady?: () => void
  ): void {
    const width = this.TEMPLATE_WIDTH;
    const height = this.TEMPLATE_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if the uploaded base template image is ready
    if (this.isImgLoaded && this.templateImg) {
      ctx.save();
      // 1. Draw the exact base template image (preserving 100% of Durga, logos, branding, borders, terms & hotlines)
      ctx.drawImage(this.templateImg, 0, 0, width, height);

      // 2. Draw ONLY the two price rows inside the boxed area with live rates
      this.drawTemplateBoxedRates(ctx, rates);
      ctx.restore();
      onReady?.();
      return;
    }

    // If template image is still loading: draw the high-fidelity fallback
    // and queue an immediate re-render once loaded
    this.renderSyntheticFallback(ctx, width, height, rates);

    this.preloadImage(() => {
      if (canvas.isConnected) {
        this.renderToCanvas(canvas, rates, onReady);
      }
    });
  }

  /**
   * Overlays the two price rows inside the golden boxed rates area
   * on top of the base template image.
   * Positioned with aesthetic harmony between "NAV DURGA MARKET" above and
   * "FLEXIBLE PAYMENT TERMS" below, with guaranteed zero-overlap right-aligned pricing.
   */
  private static drawTemplateBoxedRates(
    ctx: CanvasRenderingContext2D,
    rates: MarketOpeningRates
  ): void {
    ctx.save();

    // Exact bounding coordinates:
    // Placed between "NAV DURGA MARKET" (ends y≈590) and "FLEXIBLE PAYMENT TERMS" (starts y≈712)
    const boxX = 394;
    const boxY = 592;
    const boxW = 476;
    const boxH = 118;
    const radius = 12;

    // 1. Royal Plaque Outer Shadow & Warm Golden Ambient Glow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Multi-stop warm royal ivory parchment gradient
    const plaqueGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    plaqueGrad.addColorStop(0, '#ffffff');
    plaqueGrad.addColorStop(0.4, '#fffefb');
    plaqueGrad.addColorStop(1, '#fbf4e6');
    ctx.fillStyle = plaqueGrad;

    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.fill();
    ctx.restore();

    // 2. Metallic 24K Gold Outer Rim (2.5px) matching Nav Durga temple frame
    const goldGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
    goldGrad.addColorStop(0, '#d4af37');
    goldGrad.addColorStop(0.3, '#fde68a');
    goldGrad.addColorStop(0.7, '#d4af37');
    goldGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.stroke();

    // 3. Inner Delicate Golden Inset Line
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.9)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, boxX + 1.5, boxY + 1.5, boxW - 3, boxH - 3, radius - 1);
    ctx.stroke();

    // 4. Four Corner Golden Diamond Florets
    this.drawCornerFloret(ctx, boxX + 7, boxY + 7);
    this.drawCornerFloret(ctx, boxX + boxW - 7, boxY + 7);
    this.drawCornerFloret(ctx, boxX + 7, boxY + boxH - 7);
    this.drawCornerFloret(ctx, boxX + boxW - 7, boxY + boxH - 7);

    // =========================================================================
    // ROW 1: MEDIUM SECTION
    // =========================================================================
    const row1Y = boxY + 31;
    const rowCardX = boxX + 7;
    const rowCardW = boxW - 14;
    const rowCardH = 48;

    // Row 1 Card Enamel Background
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    this.roundRect(ctx, rowCardX, boxY + 7, rowCardW, rowCardH, 8);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, rowCardX, boxY + 7, rowCardW, rowCardH, 8);
    ctx.stroke();

    // Left Steel Section Circular Emblem
    this.drawSmallSteelIcon(ctx, rowCardX + 20, row1Y, 'round');

    // Section 1 Display Name
    const mediumName = (rates.mediumSectionName || 'MEDIUM SECTION').toUpperCase();
    let labelFont1 = 16;
    ctx.fillStyle = '#0f2744';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `800 ${labelFont1}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(mediumName).width > 165 && labelFont1 > 12) {
      labelFont1 -= 1;
      ctx.font = `800 ${labelFont1}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
    }
    ctx.fillText(mediumName, rowCardX + 38, row1Y);

    // Mini "EX-WORKS" tag pill next to section name
    const name1W = ctx.measureText(mediumName).width;
    if (name1W < 135) {
      this.drawMiniTagPill(ctx, rowCardX + 38 + name1W + 8, row1Y, 'EX-WORKS');
    }

    // Right-Aligned Price Callout (Mathematically Guaranteed Zero Overlap)
    const rightMargin1 = rowCardX + rowCardW - 14;
    this.drawRightAlignedPrice(
      ctx,
      rates.mediumSectionRate,
      rightMargin1,
      row1Y
    );

    // =========================================================================
    // CENTER DIVIDER BETWEEN ROWS
    // =========================================================================
    const divY = boxY + 59;
    ctx.save();
    const divGrad = ctx.createLinearGradient(boxX + 24, divY, boxX + boxW - 24, divY);
    divGrad.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
    divGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.6)');
    divGrad.addColorStop(1, 'rgba(212, 175, 55, 0.1)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, divY);
    ctx.lineTo(boxX + boxW - 24, divY);
    ctx.stroke();

    // Center Gold Diamond
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(boxX + boxW / 2, divY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // =========================================================================
    // ROW 2: LIGHT SECTION
    // =========================================================================
    const row2Y = boxY + 87;

    // Row 2 Card Enamel Background
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    this.roundRect(ctx, rowCardX, boxY + 63, rowCardW, rowCardH, 8);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, rowCardX, boxY + 63, rowCardW, rowCardH, 8);
    ctx.stroke();

    // Left Steel Section Circular Emblem
    this.drawSmallSteelIcon(ctx, rowCardX + 20, row2Y, 'flat');

    // Section 2 Display Name
    const lightName = (rates.lightSectionName || 'LIGHT SECTION').toUpperCase();
    let labelFont2 = 16;
    ctx.fillStyle = '#0f2744';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `800 ${labelFont2}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(lightName).width > 165 && labelFont2 > 12) {
      labelFont2 -= 1;
      ctx.font = `800 ${labelFont2}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
    }
    ctx.fillText(lightName, rowCardX + 38, row2Y);

    // Mini "EX-WORKS" tag pill
    const name2W = ctx.measureText(lightName).width;
    if (name2W < 135) {
      this.drawMiniTagPill(ctx, rowCardX + 38 + name2W + 8, row2Y, 'EX-WORKS');
    }

    // Right-Aligned Price Callout (Mathematically Guaranteed Zero Overlap)
    const rightMargin2 = rowCardX + rowCardW - 14;
    this.drawRightAlignedPrice(
      ctx,
      rates.lightSectionRate,
      rightMargin2,
      row2Y
    );

    ctx.restore();
  }

  /**
   * Renders the price value and unit with right-alignment to guarantee
   * mathematically zero overlap between the numbers and "/ MT".
   */
  private static drawRightAlignedPrice(
    ctx: CanvasRenderingContext2D,
    rateValue: number,
    rightX: number,
    centerY: number
  ): void {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 1. Draw Unit "/ MT" in refined emerald-green
    ctx.font = '700 13px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('/ MT', rightX, centerY + 0.5);
    const unitWidth = ctx.measureText('/ MT').width;

    // 2. Draw Price Number e.g. "₹52,711" stopping cleanly 6px before "/ MT"
    const priceStr = `₹${Number(rateValue || 0).toLocaleString('en-IN')}`;
    ctx.font = '900 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(priceStr, rightX - unitWidth - 6, centerY);

    ctx.restore();
  }

  /**
   * Draws four corner florets on the plaque border
   */
  private static drawCornerFloret(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a miniature tag pill like "EX-WORKS"
   */
  private static drawMiniTagPill(
    ctx: CanvasRenderingContext2D,
    x: number,
    centerY: number,
    label: string
  ): void {
    ctx.save();
    ctx.font = '800 9px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    const tagW = ctx.measureText(label).width + 8;
    const tagH = 15;
    const tagY = centerY - tagH / 2;

    ctx.fillStyle = '#fffbeb';
    this.roundRect(ctx, x, tagY, tagW, tagH, 4);
    ctx.fill();

    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, tagY, tagW, tagH, 4);
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + tagW / 2, centerY);
    ctx.restore();
  }

  /**
   * Draws a miniature industrial steel icon bullet for section rows
   */
  private static drawSmallSteelIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'round' | 'flat'
  ): void {
    ctx.save();
    // Circular Metallic Emblem
    const grad = ctx.createLinearGradient(x - 13, y - 13, x + 13, y + 13);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Miniature steel icon inside
    ctx.fillStyle = '#ffffff';
    if (type === 'round') {
      // 3 Steel rebar cross sections
      ctx.beginPath();
      ctx.arc(x - 3.5, y - 3, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 3.5, y - 3, 2.5, 0, Math.PI * 2);
      ctx.arc(x, y + 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 3 Steel flat structural strips
      ctx.fillRect(x - 6, y - 5, 12, 2.2);
      ctx.fillRect(x - 6, y - 1, 12, 2.2);
      ctx.fillRect(x - 6, y + 3, 12, 2.2);
    }
    ctx.restore();
  }

  /**
   * Fallback renderer while the template image loads
   */
  private static renderSyntheticFallback(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rates: MarketOpeningRates
  ): void {
    ctx.save();
    this.drawBackground(ctx, width, height);
    this.drawTopLeftBranding(ctx);
    this.drawTopCenterBlessings(ctx, width);
    this.drawMaaDurgaArtwork(ctx, width);
    this.drawMarketOpeningsHeader(ctx);
    this.drawBoxedRatesArea(ctx, rates);
    this.drawFourCircularBadges(ctx);
    this.drawCitySkylineAndWish(ctx);
    this.drawRightColumnContent(ctx, width);
    this.drawBottomFooter(ctx, width, height);
    ctx.restore();
  }

  /**
   * Base canvas background
   */
  private static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const bgGrad = ctx.createRadialGradient(
      width * 0.45,
      height * 0.45,
      50,
      width * 0.5,
      height * 0.5,
      width * 0.8
    );
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.6, '#fcfaf6');
    bgGrad.addColorStop(1, '#f7f2ea');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Top-Left: Indian Flag Swoosh & Nav Durga Group Branding
   */
  private static drawTopLeftBranding(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Indian Flag Swoosh in Top-Left Corner
    ctx.save();
    ctx.lineWidth = 14;

    // Saffron arc
    ctx.strokeStyle = '#ff9933';
    ctx.beginPath();
    ctx.arc(-20, -20, 220, 0.1, 1.25);
    ctx.stroke();

    // White arc
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(-20, -20, 206, 0.1, 1.25);
    ctx.stroke();

    // Green arc
    ctx.strokeStyle = '#138808';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(-20, -20, 192, 0.1, 1.25);
    ctx.stroke();
    ctx.restore();

    // Brand Logo Container
    const logoX = 64;
    const logoY = 46;

    // Diamond Logo Mark
    ctx.save();
    ctx.translate(logoX + 185, logoY + 18);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-18, -18, 36, 36);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.restore();

    // "NAV" text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 62px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV', logoX, logoY + 62);

    // "DURGA" text
    ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DURGA', logoX, logoY + 124);

    // "— GROUP —"
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('—  GROUP  —', logoX + 16, logoY + 164);

    // "🇮🇳 We build the nation 🇮🇳"
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('We build the nation', logoX + 38, logoY + 196);

    // Mini flags beside "We build the nation"
    this.drawMiniFlag(ctx, logoX, logoY + 180);
    this.drawMiniFlag(ctx, logoX + 275, logoY + 180);

    ctx.restore();
  }

  private static drawMiniFlag(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = '#ff9933';
    ctx.fillRect(x, y, 28, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + 6, 28, 6);
    ctx.fillStyle = '#138808';
    ctx.fillRect(x, y + 12, 28, 6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x, y, 28, 18);
    // Chakra dot
    ctx.fillStyle = '#000080';
    ctx.beginPath();
    ctx.arc(x + 14, y + 9, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Top-Center: Shubh Nav Durga Header with Golden Trishul & Blessings
   */
  private static drawTopCenterBlessings(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();
    const centerX = width * 0.44;

    // Golden Trishul Icon 🔱
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔱', centerX, 52);

    // "— Shubh —"
    ctx.font = 'italic 700 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('— Shubh —', centerX, 86);

    // "NAV DURGA" in crimson red serif
    ctx.font = '900 64px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#7f1d1d';
    ctx.fillText('NAV DURGA', centerX, 146);

    // Blessings Subtitle
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('May Maa Durga bless you with', centerX, 178);
    ctx.fillText('prosperity, success and new beginnings.', centerX, 204);

    // Decorative golden floral ornament
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 90, 222);
    ctx.lineTo(centerX - 24, 222);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 24, 222);
    ctx.lineTo(centerX + 90, 222);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.font = '18px sans-serif';
    ctx.fillText('❖', centerX, 227);

    ctx.restore();
  }

  /**
   * Top-Right: Maa Durga Divine Portrait & "जय माता दी" Sunburst
   */
  private static drawMaaDurgaArtwork(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();

    const durgaX = width * 0.72;
    const durgaY = 135;

    // Warm radiant sunburst halo behind Maa Durga
    const halo = ctx.createRadialGradient(durgaX + 30, durgaY, 20, durgaX + 30, durgaY, 220);
    halo.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
    halo.addColorStop(0.85, 'rgba(234, 88, 12, 0.2)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(durgaX + 30, durgaY, 220, 0, Math.PI * 2);
    ctx.fill();

    // Divine Golden Crown (Mukut) Rays
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2.5;
    for (let a = -Math.PI * 0.9; a < -Math.PI * 0.1; a += 0.08) {
      ctx.beginPath();
      ctx.moveTo(durgaX + 30 + Math.cos(a) * 90, durgaY + Math.sin(a) * 90);
      ctx.lineTo(durgaX + 30 + Math.cos(a) * 190, durgaY + Math.sin(a) * 190);
      ctx.stroke();
    }

    // Sacred Maa Durga Face & Golden Mukut Silhouette
    // Golden Mukut (Crown)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(durgaX - 50, durgaY - 30);
    ctx.lineTo(durgaX + 30, durgaY - 120);
    ctx.lineTo(durgaX + 110, durgaY - 30);
    ctx.quadraticCurveTo(durgaX + 30, durgaY - 50, durgaX - 50, durgaY - 30);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mukut Jewels
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(durgaX + 30, durgaY - 80, 8, 0, Math.PI * 2);
    ctx.arc(durgaX, durgaY - 55, 6, 0, Math.PI * 2);
    ctx.arc(durgaX + 60, durgaY - 55, 6, 0, Math.PI * 2);
    ctx.fill();

    // Maa Durga Divine Face Oval
    const faceGrad = ctx.createLinearGradient(durgaX, durgaY - 30, durgaX + 60, durgaY + 70);
    faceGrad.addColorStop(0, '#fef3c7');
    faceGrad.addColorStop(0.5, '#fde68a');
    faceGrad.addColorStop(1, '#fcd34d');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(durgaX + 30, durgaY + 25, 46, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Vermilion Tilak & Third Eye on Forehead
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(durgaX + 30, durgaY + 8, 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Divine Lotus Eyes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(durgaX + 12, durgaY + 28, 12, 6, -0.15, 0, Math.PI * 2);
    ctx.ellipse(durgaX + 48, durgaY + 28, 12, 6, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Golden Nose Ring (Nath)
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(durgaX + 22, durgaY + 44, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Divine Smile
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(durgaX + 30, durgaY + 54, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Golden Lion (Sher) Vahana Head on Right
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(durgaX + 115, durgaY + 75, 34, 0, Math.PI * 2);
    ctx.fill();
    // Lion Mane
    ctx.fillStyle = '#b45309';
    for (let la = 0; la < Math.PI * 2; la += 0.4) {
      ctx.beginPath();
      ctx.arc(durgaX + 115 + Math.cos(la) * 38, durgaY + 75 + Math.sin(la) * 38, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lion Face
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(durgaX + 115, durgaY + 75, 26, 0, Math.PI * 2);
    ctx.fill();

    // Red Sunburst Badge "जय माता दी" in Top Right
    const badgeX = width - 110;
    const badgeY = 120;

    ctx.save();
    ctx.translate(badgeX, badgeY);
    ctx.fillStyle = '#dc2626';
    const points = 16;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 68 : 55;
      const a = (Math.PI / points) * i;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hindi Text: "जय माता दी"
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 24px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('जय', 0, -22);
    ctx.fillText('माता', 0, 2);
    ctx.fillText('दी', 0, 26);
    ctx.restore();

    ctx.restore();
  }

  /**
   * Center-Left: 3D Red Ribbon "MARKET OPENINGS" with Megaphone & "BEST RATES" Pill
   */
  private static drawMarketOpeningsHeader(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const bannerX = 70;
    const bannerY = 285;
    const bannerW = 860;
    const bannerH = 105;

    // 3D Red Ribbon Background
    const ribbonGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY);
    ribbonGrad.addColorStop(0, '#b91c1c');
    ribbonGrad.addColorStop(0.4, '#dc2626');
    ribbonGrad.addColorStop(0.8, '#ef4444');
    ribbonGrad.addColorStop(1, '#b91c1c');

    ctx.fillStyle = ribbonGrad;
    this.roundRect(ctx, bannerX + 80, bannerY, bannerW - 80, bannerH, 22);
    ctx.fill();

    // Gold outline
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, bannerX + 80, bannerY, bannerW - 80, bannerH, 22);
    ctx.stroke();

    // Megaphone / Loudspeaker on the left
    const megaX = bannerX + 60;
    const megaY = bannerY + bannerH / 2;

    ctx.save();
    ctx.translate(megaX, megaY);
    ctx.rotate(-0.2);

    // Megaphone body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(25, -34);
    ctx.lineTo(-30, -12);
    ctx.lineTo(-30, 12);
    ctx.lineTo(25, 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Front bell oval
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(25, 0, 10, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Handle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-22, 10, 14, 26);

    // Sound waves
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(42, 0, 16, -0.6, 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(48, 0, 24, -0.6, 0.6);
    ctx.stroke();
    ctx.restore();

    // Bold 3D Text: "MARKET OPENINGS"
    ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Deep drop shadow
    ctx.fillStyle = '#450a0a';
    ctx.fillText('MARKET OPENINGS', bannerX + 172, bannerY + bannerH / 2 + 4);

    // Main 3D Text gradient
    const textGrad = ctx.createLinearGradient(0, bannerY + 20, 0, bannerY + 90);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.7, '#fff7ed');
    textGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = textGrad;
    ctx.fillText('MARKET OPENINGS', bannerX + 170, bannerY + bannerH / 2);

    // Golden Rounded Pill below ribbon: "★ BEST RATES (EX-WORKS) ★"
    const pillW = 560;
    const pillH = 50;
    const pillX = bannerX + 180;
    const pillY = bannerY + bannerH + 8;

    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
    pillGrad.addColorStop(0, '#0284c7');
    pillGrad.addColorStop(0.5, '#0369a1');
    pillGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = pillGrad;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 25);
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 25);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦  BEST RATES (EX-WORKS)  ✦', pillX + pillW / 2, pillY + pillH / 2 + 1);

    ctx.restore();
  }

  /**
   * Center-Left: The Boxed Rates Area (ONLY EDITABLE AREA)
   * Exactly matches the golden boxed area in the uploaded image.
   */
  private static drawBoxedRatesArea(ctx: CanvasRenderingContext2D, rates: MarketOpeningRates): void {
    ctx.save();

    const boxX = 40;
    const boxY = 460;
    const boxW = 1000;
    const boxH = 220;

    // Golden-Bordered Rounded Container
    ctx.shadowColor = 'rgba(234, 179, 8, 0.25)';
    ctx.shadowBlur = 18;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.fill();

    // Metallic Golden Border (3.5px)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Inner subtle cream tint
    const innerGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    innerGrad.addColorStop(1, 'rgba(254, 252, 248, 0.9)');
    ctx.fillStyle = innerGrad;
    this.roundRect(ctx, boxX + 3, boxY + 3, boxW - 6, boxH - 6, 21);
    ctx.fill();

    // Row 1: Medium Section
    const row1Y = boxY + 60;

    // Blue Circular Icon on Left (Round bars stack)
    this.drawSteelRoundIcon(ctx, boxX + 65, row1Y);

    // Section 1 Title: "MEDIUM SECTION"
    ctx.fillStyle = '#0f2744';
    ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(rates.mediumSectionName || 'MEDIUM SECTION', boxX + 130, row1Y);

    // Divider "|"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '300 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('|', boxX + 590, row1Y - 2);

    // Price: "₹49711/MT" in bold green
    ctx.fillStyle = '#047857';
    ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹${rates.mediumSectionRate}`, boxX + 620, row1Y);

    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    const numWidth = ctx.measureText(`₹${rates.mediumSectionRate}`).width;
    ctx.fillStyle = '#047857';
    ctx.fillText('/MT', boxX + 620 + numWidth + 4, row1Y + 3);

    // Horizontal Divider between rows
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, boxY + boxH / 2);
    ctx.lineTo(boxX + boxW - 24, boxY + boxH / 2);
    ctx.stroke();

    // Row 2: Light Section
    const row2Y = boxY + 160;

    // Blue Circular Icon on Left (Flat plates stack)
    this.drawSteelFlatIcon(ctx, boxX + 65, row2Y);

    // Section 2 Title: "LIGHT SECTION"
    ctx.fillStyle = '#0f2744';
    ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(rates.lightSectionName || 'LIGHT SECTION', boxX + 130, row2Y);

    // Divider "|"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '300 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('|', boxX + 590, row2Y - 2);

    // Price: "₹42211/MT" in bold green
    ctx.fillStyle = '#047857';
    ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`₹${rates.lightSectionRate}`, boxX + 620, row2Y);

    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    const numWidth2 = ctx.measureText(`₹${rates.lightSectionRate}`).width;
    ctx.fillStyle = '#047857';
    ctx.fillText('/MT', boxX + 620 + numWidth2 + 4, row2Y + 3);

    ctx.restore();
  }

  private static drawSteelRoundIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Stack of round bars
    ctx.fillStyle = '#e2e8f0';
    const r = 8;
    const bars = [
      { bx: x - 14, by: y - 10 },
      { bx: x, by: y - 10 },
      { bx: x + 14, by: y - 10 },
      { bx: x - 7, by: y + 4 },
      { bx: x + 7, by: y + 4 },
      { bx: x, by: y + 18 },
    ];
    bars.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.bx, b.by, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  private static drawSteelFlatIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Stack of isometric flat plates
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;

    const layers = [y - 12, y - 2, y + 8, y + 18];
    layers.forEach((ly) => {
      ctx.beginPath();
      ctx.moveTo(x - 22, ly);
      ctx.lineTo(x, ly - 8);
      ctx.lineTo(x + 22, ly);
      ctx.lineTo(x, ly + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  /**
   * Mid-Left: 4 Circular Badges (Quality, Trusted Supply, On Time Delivery, Satisfaction)
   */
  private static drawFourCircularBadges(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const startX = 60;
    const startY = 745;
    const badgeGap = 245;

    const badges = [
      {
        icon: '🛡️',
        bg: '#059669',
        title: 'QUALITY',
        sub: 'MATERIAL',
      },
      {
        icon: '🤝',
        bg: '#1d4ed8',
        title: 'TRUSTED',
        sub: 'SUPPLY',
      },
      {
        icon: '🚚',
        bg: '#0d9488',
        title: 'ON TIME',
        sub: 'DELIVERY',
      },
      {
        icon: '👥',
        bg: '#7c3aed',
        title: 'CUSTOMER',
        sub: 'SATISFACTION',
      },
    ];

    badges.forEach((b, i) => {
      const bx = startX + i * badgeGap;

      // Circle Icon
      ctx.fillStyle = b.bg;
      ctx.beginPath();
      ctx.arc(bx + 35, startY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.icon, bx + 35, startY);

      // Title & Subtitle text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(b.title, bx + 78, startY - 8);
      ctx.fillText(b.sub, bx + 78, startY + 12);
    });

    ctx.restore();
  }

  /**
   * Lower-Left: City Skyline Silhouette & "Wishing you a very HAPPY AND PRODUCTIVE DAY!"
   */
  private static drawCitySkylineAndWish(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const startX = 60;
    const startY = 825;
    const endX = 1040;

    // Dark blue city skyline silhouette
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(startX, startY + 50);

    // Towers & Crane silhouette
    const buildings = [
      { w: 25, h: 45 },
      { w: 30, h: 30 },
      { w: 20, h: 60 },
      { w: 35, h: 25 },
      { w: 40, h: 55 },
      { w: 25, h: 40 },
      { w: 30, h: 65 },
      { w: 45, h: 35 },
      { w: 20, h: 50 },
      { w: 35, h: 30 },
      { w: 40, h: 60 },
      { w: 30, h: 40 },
      { w: 50, h: 70 },
      { w: 35, h: 30 },
      { w: 25, h: 50 },
      { w: 40, h: 35 },
      { w: 30, h: 55 },
      { w: 45, h: 30 },
    ];

    let cx = startX;
    buildings.forEach((b) => {
      ctx.lineTo(cx, startY + 50 - b.h);
      ctx.lineTo(cx + b.w, startY + 50 - b.h);
      cx += b.w;
    });

    ctx.lineTo(endX, startY + 50);
    ctx.closePath();
    ctx.fill();

    // Wishing you a very
    ctx.font = 'italic 700 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Wishing you a very', startX + (endX - startX) / 2, startY + 22);

    // "— HAPPY AND PRODUCTIVE DAY! —"
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText('— HAPPY AND PRODUCTIVE DAY! —', startX + (endX - startX) / 2, startY + 62);

    ctx.restore();
  }

  /**
   * Right Column: Steel Framing, Photos, Payment Terms, Extra Notice, Caution Box
   */
  private static drawRightColumnContent(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();

    const colX = 1065;
    const colW = 425;
    const startY = 285;

    // 1. High-Rise Steel Framing Graphic
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, colX, startY, colW, 160, 16);
    ctx.fill();

    // Steel structure grid visual
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let x = colX + 20; x < colX + colW - 10; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, startY + 10);
      ctx.lineTo(x, startY + 150);
      ctx.stroke();
    }
    for (let y = startY + 20; y < startY + 150; y += 30) {
      ctx.beginPath();
      ctx.moveTo(colX + 10, y);
      ctx.lineTo(colX + colW - 10, y);
      ctx.stroke();
    }

    // Blue Pill on top of building: "STRONGER STEEL FOR A BRIGHTER TOMORROW"
    const stW = colW - 30;
    ctx.fillStyle = '#0f2744';
    this.roundRect(ctx, colX + 15, startY + 120, stW, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STRONGER STEEL FOR A BRIGHTER TOMORROW', colX + colW / 2, startY + 140);

    // 2. Middle Two Photo Boxes (Pipes & Rebars)
    const photoY = startY + 172;
    const pW = (colW - 14) / 2;
    const pH = 95;

    // Left Photo: Square Steel Pipes
    ctx.fillStyle = '#334155';
    this.roundRect(ctx, colX, photoY, pW, pH, 12);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    for (let py = photoY + 15; py < photoY + pH - 15; py += 24) {
      for (let px = colX + 15; px < colX + pW - 15; px += 24) {
        ctx.strokeRect(px, py, 18, 18);
      }
    }

    // Right Photo: Bundles of TMT rebars
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, colX + pW + 14, photoY, pW, pH, 12);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    for (let rby = photoY + 12; rby < photoY + pH - 10; rby += 16) {
      for (let rbx = colX + pW + 24; rbx < colX + colW - 20; rbx += 16) {
        ctx.beginPath();
        ctx.arc(rbx, rby, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Payment Terms Box
    const payY = photoY + pH + 14;
    ctx.fillStyle = '#0284c7';
    this.roundRect(ctx, colX, payY, colW, 64, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📄  PAYMENT TERMS', colX + 16, payY + 24);

    // White Pill: "Advance Payment Basis"
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, colX + 16, payY + 34, colW - 32, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Advance Payment Basis', colX + colW / 2, payY + 50);

    // 4. Red Box: "₹ 300/MT extra — for next - day payment"
    const redY = payY + 74;
    ctx.fillStyle = '#dc2626';
    this.roundRect(ctx, colX, redY, colW, 58, 14);
    ctx.fill();

    // Rupee Coin Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(colX + 32, redY + 29, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('₹', colX + 32, redY + 35);

    // White text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('₹ 300/MT extra', colX + 60, redY + 28);
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('— for next - day payment', colX + 60, redY + 48);

    // 5. Yellow Caution Notice Box
    const noticeY = redY + 68;
    ctx.fillStyle = '#fef08a';
    this.roundRect(ctx, colX, noticeY, colW, 95, 14);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, colX, noticeY, colW, 95, 14);
    ctx.stroke();

    // ⚠️ Warning Icon & Header
    ctx.fillStyle = '#d97706';
    ctx.font = '22px sans-serif';
    ctx.fillText('⚠️', colX + 16, noticeY + 28);

    ctx.fillStyle = '#92400e';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('IMPORTANT NOTICE', colX + 48, noticeY + 26);

    ctx.fillStyle = '#451a03';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• Rates are indicative & subject to market fluctuations.', colX + 16, noticeY + 54);
    ctx.fillText('• Please reconfirm before booking.', colX + 16, noticeY + 76);

    ctx.restore();
  }

  /**
   * Bottom Footer Banner: Navy Bar, Yellow Contact Pill, 3 WhatsApp Hotlines
   */
  private static drawBottomFooter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.save();

    const footerH = 95;
    const footerY = height - footerH;

    // Solid Deep Navy Bar
    ctx.fillStyle = '#061325';
    ctx.fillRect(0, footerY, width, footerH);

    // Tricolor Swoosh at bottom-left
    ctx.fillStyle = '#ff9933';
    ctx.fillRect(0, height - 12, 180, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height - 8, 180, 4);
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, height - 4, 180, 4);

    // Yellow Contact Pill: "CONTACT FOR ORDERS"
    const pillW = 240;
    const pillH = 56;
    const pillX = 40;
    const pillY = footerY + 20;

    ctx.fillStyle = '#eab308';
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 28);
    ctx.fill();

    // Telephone Icon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pillX + 30, pillY + 28, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📞', pillX + 30, pillY + 34);

    // Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CONTACT FOR', pillX + 58, pillY + 26);
    ctx.fillText('ORDERS', pillX + 58, pillY + 46);

    // Divider
    ctx.fillStyle = '#475569';
    ctx.font = '300 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('|', pillX + pillW + 36, footerY + 58);

    // 3 WhatsApp Hotlines with WhatsApp icons
    const phones = ['9009544333', '7000923464', '9713144333'];
    let phoneX = pillX + pillW + 75;

    phones.forEach((phone, idx) => {
      // WhatsApp Green Circle Icon
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(phoneX, footerY + 48, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬', phoneX, footerY + 55);

      // Phone Number
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(phone, phoneX + 28, footerY + 60);

      const numW = ctx.measureText(phone).width;
      phoneX += 28 + numW + 40;

      // Divider if not last
      if (idx < phones.length - 1) {
        ctx.fillStyle = '#475569';
        ctx.font = '300 48px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('|', phoneX - 20, footerY + 58);
      }
    });

    ctx.restore();
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
