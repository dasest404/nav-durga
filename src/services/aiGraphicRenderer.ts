import { AIGraphicRecipe, AISteelProductVisual } from '../types';

export class AIGraphicRenderer {
  /**
   * Main render function that draws the entire AI-generated graphic onto an HTML5 Canvas.
   * Matches the visual style of Indian steel posters (dense, minimal blank space, bold typography,
   * colorful geometric cuts, 3D steel sections, and official Nav Durga branding).
   */
  static renderToCanvas(
    canvas: HTMLCanvasElement,
    recipe: AIGraphicRecipe
  ): void {
    const width = 1080;
    const height = recipe.aspectRatio === '4:5' ? 1350 : 1080;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    // 1. Draw Dense Base Multi-stop Gradient Background
    this.drawBackground(ctx, width, height, recipe);

    // 2. Draw Dynamic Colorful Industrial Geometric Plates & Angle Slashes (Eliminates Blank Space)
    this.drawGeometricCutaways(ctx, width, height, recipe);

    // 3. Draw Background Textures (Hex mesh, CAD lines, sunbeam rays)
    this.drawBackgroundDecor(ctx, width, height, recipe);

    // 4. Draw Header Branding (Nav Durga Ispat, Raipur, ISO Seal, Market Active Pill)
    this.drawHeader(ctx, width, height, recipe);

    // 5. Draw Top Ribbon / Badge & Bold Headline Section
    this.drawHeaderContent(ctx, width, height, recipe);

    // 6. Draw Dedicated 3D Steel Product Visual Showcase (Targeted to Admin Text)
    this.draw3DProductShowcase(ctx, width, height, recipe);

    // 7. Draw High-Impact Command Price Card / Discount Banner
    if (recipe.price) {
      this.drawPriceBanner(ctx, width, height, recipe);
    }

    // 8. Draw Dense Product Specifications & Advantages Matrix (4 Structured Cards)
    this.drawDenseSpecificationMatrix(ctx, width, height, recipe);

    // 9. Draw Authenticity Seals (Gold Medallion, Urla Stamp, Prime Shield)
    this.drawAuthenticitySeals(ctx, width, height, recipe);

    // 10. Draw Bottom High-Impact WhatsApp Order Bar
    this.drawFooter(ctx, width, height, recipe);

    // 11. Draw Ambient Molten Sparks & Flares
    if (recipe.decorations.hasSparks) {
      this.drawSparks(ctx, width, height, recipe.seed);
    }

    ctx.restore();
  }

  /**
   * Draw multi-stop gradient background
   */
  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const [c1, c2, c3] = recipe.colorPalette.bgGradient;
    const grad = ctx.createLinearGradient(0, 0, width * 0.4, height);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw dynamic colorful geometric cuts and industrial panels (eliminating empty blank space)
   */
  private static drawGeometricCutaways(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;

    ctx.save();

    // Top-right angled contrast plate
    ctx.fillStyle = `${p.accentPrimary}22`;
    ctx.beginPath();
    ctx.moveTo(width * 0.45, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(width * 0.25, height * 0.35);
    ctx.closePath();
    ctx.fill();

    // Mid-section diagonal industrial chevron
    const midGrad = ctx.createLinearGradient(0, height * 0.35, width, height * 0.65);
    midGrad.addColorStop(0, `${p.accentSecondary}18`);
    midGrad.addColorStop(1, `${p.accentPrimary}28`);
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.moveTo(-50, height * 0.38);
    ctx.lineTo(width + 50, height * 0.26);
    ctx.lineTo(width + 50, height * 0.58);
    ctx.lineTo(-50, height * 0.68);
    ctx.closePath();
    ctx.fill();

    // Gold/accent divider line
    ctx.strokeStyle = `${p.goldTrim}55`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-50, height * 0.26);
    ctx.lineTo(width + 50, height * 0.18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-50, height * 0.68);
    ctx.lineTo(width + 50, height * 0.58);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw background textures
   */
  private static drawBackgroundDecor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const palette = recipe.colorPalette;
    const decor = recipe.backgroundDecor;

    ctx.save();

    if (decor === 'hex_mesh_steel') {
      ctx.strokeStyle = `${palette.accentPrimary}18`;
      ctx.lineWidth = 1.5;
      const size = 36;
      const h = size * Math.sqrt(3);

      for (let y = 84; y < height - 100; y += h) {
        for (let x = 0; x < width + size * 3; x += size * 3) {
          this.drawHexagon(ctx, x, y, size);
          this.drawHexagon(ctx, x + size * 1.5, y + h / 2, size);
        }
      }
    } else if (decor === 'blueprint_cad') {
      ctx.strokeStyle = `${palette.accentPrimary}14`;
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 84);
        ctx.lineTo(x, height - 100);
        ctx.stroke();
      }
      for (let y = 84; y <= height - 100; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (decor === 'radial_sunburst') {
      ctx.save();
      ctx.translate(width * 0.5, height * 0.38);
      const rays = 24;
      const step = (Math.PI * 2) / rays;
      ctx.fillStyle = `${palette.accentSecondary}10`;
      for (let i = 0; i < rays; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, width * 0.9, i * step, (i + 1) * step);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Modern Corner Tech Brackets
    if (recipe.decorations.hasCornerTechBrackets) {
      this.drawCornerTechBrackets(ctx, width, height, palette.accentGlow);
    }

    ctx.restore();
  }

  private static drawHexagon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private static drawCornerTechBrackets(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const len = 35;
    const pad = 24;

    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - pad - len, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + len);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pad, height - pad - len);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + len, height - pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - pad - len, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - len);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw Header Branding (Nav Durga Ispat, Raipur, ISO Certified, Active status)
   */
  private static drawHeader(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    ctx.save();

    // Dark solid header bar with bottom gold accent
    ctx.fillStyle = 'rgba(9, 13, 22, 0.94)';
    ctx.fillRect(0, 0, width, 84);

    ctx.strokeStyle = recipe.colorPalette.goldTrim;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 84);
    ctx.lineTo(width, 84);
    ctx.stroke();

    // ND Logo Monogram
    const logoX = 40;
    const logoY = 16;
    const logoSize = 52;

    const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
    logoGrad.addColorStop(0, '#2563eb');
    logoGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = logoGrad;
    this.roundRect(ctx, logoX, logoY, logoSize, logoSize, 14);
    ctx.fill();

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    this.roundRect(ctx, logoX, logoY, logoSize, logoSize, 14);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ND', logoX + logoSize / 2, logoY + logoSize / 2);

    // Company Name & Mill Details
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA ISPAT PVT. LTD.', logoX + logoSize + 16, 40);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Rolling Mill & Commercial Hub • Urla, Raipur (C.G.) • ISO 9001:2015', logoX + logoSize + 16, 59);

    // Right Header Pill: Raipur Steel Market Active
    ctx.textAlign = 'right';
    const pillW = 210;
    const pillH = 34;
    const pillX = width - 40 - pillW;
    const pillY = 25;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(pillX + 18, pillY + pillH / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('RAIPUR MARKET ACTIVE', pillX + pillW - 14, pillY + 21);

    ctx.restore();
  }

  /**
   * Draw Top Ribbon Badge, Massive Bold Headline and Subheadline
   */
  private static drawHeaderContent(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;

    ctx.save();

    // 1. Promotional 3D Ribbon / Badge
    const badgeText = (recipe.badge || "TODAY'S SPECIAL OFFER").toUpperCase();
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = Math.max(textWidth + 56, 240);
    const badgeH = 36;
    const badgeX = width / 2 - badgeW / 2;
    const badgeY = 106;

    // Glowing drop shadow
    ctx.shadowColor = p.accentGlow;
    ctx.shadowBlur = 18;

    const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY);
    bGrad.addColorStop(0, p.accentSecondary);
    bGrad.addColorStop(1, p.accentPrimary);
    ctx.fillStyle = bGrad;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fill();

    ctx.strokeStyle = p.goldTrim;
    ctx.lineWidth = 2;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = p.badgeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★  ${badgeText}  ★`, width / 2, badgeY + badgeH / 2);

    // 2. Main Massive Headline
    const headline = recipe.headline;
    let fontSize = 44;
    if (headline.length > 30) fontSize = 36;
    if (headline.length > 50) fontSize = 30;

    ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';

    const lines = this.wrapText(ctx, headline, width * 0.9);
    const startY = 182;

    lines.slice(0, 2).forEach((line, i) => {
      const y = startY + i * (fontSize * 1.15);

      // Deep Shadow for heavy contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(line, width / 2 + 3, y + 4);

      // Headline gradient (Gold / White)
      const grad = ctx.createLinearGradient(0, y - fontSize, 0, y);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.65, p.textLight);
      grad.addColorStop(1, p.goldTrim);

      ctx.fillStyle = grad;
      ctx.fillText(line, width / 2, y);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeText(line, width / 2, y);
    });

    // 3. Subheadline
    if (recipe.subheadline) {
      const subY = startY + lines.slice(0, 2).length * (fontSize * 1.15) + 12;
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText(recipe.subheadline, width / 2 + 1, subY + 1.5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(recipe.subheadline, width / 2, subY);
    }

    ctx.restore();
  }

  /**
   * Draw Dedicated 3D Steel Product Visual Showcase
   * Procedural realistic steel sections matching the admin's exact text!
   */
  private static draw3DProductShowcase(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;

    ctx.save();

    // Backdrop Podium / Frame for the 3D Steel Products
    const frameW = width * 0.92;
    const frameH = 220;
    const frameX = width / 2 - frameW / 2;
    const frameY = recipe.aspectRatio === '4:5' ? 290 : 275;

    // Glowing steel podium panel
    const podGrad = ctx.createLinearGradient(frameX, frameY, frameX, frameY + frameH);
    podGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    podGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = podGrad;
    this.roundRect(ctx, frameX, frameY, frameW, frameH, 20);
    ctx.fill();

    ctx.strokeStyle = `${p.accentPrimary}66`;
    ctx.lineWidth = 2;
    this.roundRect(ctx, frameX, frameY, frameW, frameH, 20);
    ctx.stroke();

    // Spotlight glow behind steel products
    const spot = ctx.createRadialGradient(
      width * 0.5,
      frameY + frameH * 0.5,
      20,
      width * 0.5,
      frameY + frameH * 0.5,
      frameW * 0.45
    );
    spot.addColorStop(0, `${p.accentSecondary}33`);
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Steel Product Showcase Label Pill
    const tagText = '★ PRIME STRUCTURAL STEEL SECTIONS • IS 2062 TESTED ★';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    const tagW = ctx.measureText(tagText).width + 32;
    ctx.fillStyle = `${p.accentPrimary}55`;
    this.roundRect(ctx, width / 2 - tagW / 2, frameY + 12, tagW, 24, 12);
    ctx.fill();
    ctx.strokeStyle = p.goldTrim;
    ctx.lineWidth = 1;
    this.roundRect(ctx, width / 2 - tagW / 2, frameY + 12, tagW, 24, 12);
    ctx.stroke();
    ctx.fillStyle = p.goldTrim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, width / 2, frameY + 24);

    // Draw the 3D Steel Products
    recipe.productVisuals.forEach((item, idx) => {
      ctx.save();
      // Relative positioning inside the podium box
      const posX = idx === 0 && recipe.productVisuals.length === 1
        ? width * 0.5
        : idx === 0
        ? width * 0.32
        : width * 0.68;
      const posY = frameY + frameH * 0.56;

      ctx.translate(posX, posY);
      ctx.rotate((item.rotationDeg * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);

      switch (item.type) {
        case 'channel':
          this.render3DMSChannel(ctx);
          break;
        case 'angle':
          this.render3DMSAngle(ctx);
          break;
        case 'beam':
          this.render3DMSBeam(ctx);
          break;
        case 'tmt_bundle':
          this.render3DTMTRebarBundle(ctx);
          break;
        case 'billet_stack':
          this.render3DSteelBillets(ctx);
          break;
      }

      ctx.restore();

      // Product Name Badge below product
      if (item.highlightText) {
        ctx.save();
        const badgePosX = idx === 0 && recipe.productVisuals.length === 1
          ? width * 0.5
          : idx === 0
          ? width * 0.32
          : width * 0.68;
        const badgePosY = frameY + frameH - 18;

        ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
        const nw = ctx.measureText(item.highlightText.toUpperCase()).width + 24;
        ctx.fillStyle = '#0f172a';
        this.roundRect(ctx, badgePosX - nw / 2, badgePosY - 12, nw, 24, 12);
        ctx.fill();
        ctx.strokeStyle = p.goldTrim;
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, badgePosX - nw / 2, badgePosY - 12, nw, 24, 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.highlightText.toUpperCase(), badgePosX, badgePosY);
        ctx.restore();
      }
    });

    ctx.restore();
  }

  /**
   * Draw High-Impact Command Price Card / Discount Banner
   */
  private static drawPriceBanner(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;
    const priceText = recipe.price || '';
    const labelText = recipe.priceLabel || 'SPECIAL EX-PLANT RATE';

    ctx.save();

    const bannerW = width * 0.92;
    const bannerH = 100;
    const bannerX = width / 2 - bannerW / 2;
    const bannerY = recipe.aspectRatio === '4:5' ? 525 : 510;

    // Glowing drop shadow
    ctx.shadowColor = p.accentGlow;
    ctx.shadowBlur = 28;

    // Solid Beveled Container
    const cardGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerH);
    cardGrad.addColorStop(0, '#090d16');
    cardGrad.addColorStop(1, '#020617');
    ctx.fillStyle = cardGrad;
    this.roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 20);
    ctx.fill();

    // Radiant Gold Border
    ctx.strokeStyle = p.goldTrim;
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 20);
    ctx.stroke();

    // Top Header Pill on Banner
    ctx.shadowBlur = 0;
    ctx.fillStyle = `${p.accentPrimary}44`;
    this.roundRect(ctx, bannerX + 4, bannerY + 4, bannerW - 8, 30, 16);
    ctx.fill();

    ctx.fillStyle = p.goldTrim;
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡  ${labelText.toUpperCase()}  ⚡`, width / 2, bannerY + 19);

    // Big Price Text
    const priceGrad = ctx.createLinearGradient(0, bannerY + 38, 0, bannerY + 86);
    priceGrad.addColorStop(0, '#ffffff');
    priceGrad.addColorStop(0.5, p.accentGlow);
    priceGrad.addColorStop(1, p.goldTrim);

    ctx.fillStyle = priceGrad;
    ctx.font = '900 46px "JetBrains Mono", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(priceText, width / 2, bannerY + 76);

    // Subtitle notice on bottom
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ex-Plant Urla, Raipur • GST Extra as applicable • Spot Loading Available', width / 2, bannerY + 93);

    ctx.restore();
  }

  /**
   * Draw Dense 4-Quadrant Specifications & Benefit Matrix (Fills lower half, minimal blank space)
   */
  private static drawDenseSpecificationMatrix(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;

    ctx.save();

    const startY = recipe.aspectRatio === '4:5' ? 645 : 625;
    const totalW = width * 0.92;
    const matrixX = width / 2 - totalW / 2;
    const cardGap = 12;
    const cardW = (totalW - cardGap) / 2;
    const cardH = recipe.aspectRatio === '4:5' ? 140 : 120;

    const cardsData = [
      {
        icon: '📐',
        title: 'AVAILABLE SPECIFICATIONS',
        detail1: recipe.products[0]?.name || 'MS Angles: 50×50 to 130×130',
        detail2: recipe.products[1]?.name || 'MS Channels: 75×40 to 200×75',
        badge: 'ROLLING NOW',
      },
      {
        icon: '🛡️',
        title: 'QUALITY & STANDARDS',
        detail1: 'IS 2062 Prime Commercial Quality',
        detail2: 'Chemical & Physical Mill TC Provided',
        badge: '100% TESTED',
      },
      {
        icon: '🚚',
        title: 'DISPATCH & LOADING',
        detail1: 'Direct Factory Dispatch: Urla Mill',
        detail2: 'Immediate Trailer & Truck Loading',
        badge: 'EX-PLANT URLA',
      },
      {
        icon: '💰',
        title: 'COMMERCIAL BENEFITS',
        detail1: recipe.features[1] || 'Special Rates on 20+ MT Orders',
        detail2: recipe.features[2] || 'Direct Rolling Mill Pricing Guarantee',
        badge: 'BEST MARKET RATE',
      },
    ];

    cardsData.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = matrixX + col * (cardW + cardGap);
      const cy = startY + row * (cardH + cardGap);

      // Card Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 16);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, cx, cy, cardW, cardH, 16);
      ctx.stroke();

      // Top Icon & Title
      ctx.font = '16px sans-serif';
      ctx.fillText(item.icon, cx + 16, cy + 26);

      ctx.fillStyle = p.goldTrim;
      ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.title, cx + 42, cy + 25);

      // Right mini-badge
      ctx.font = '800 9px "Plus Jakarta Sans", sans-serif';
      const bw = ctx.measureText(item.badge).width + 14;
      ctx.fillStyle = `${p.accentPrimary}44`;
      this.roundRect(ctx, cx + cardW - bw - 12, cy + 12, bw, 20, 10);
      ctx.fill();
      ctx.strokeStyle = p.accentGlow;
      ctx.lineWidth = 1;
      this.roundRect(ctx, cx + cardW - bw - 12, cy + 12, bw, 20, 10);
      ctx.stroke();
      ctx.fillStyle = p.accentGlow;
      ctx.textAlign = 'center';
      ctx.fillText(item.badge, cx + cardW - bw / 2 - 12, cy + 25);

      // Detail 1
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`• ${item.detail1}`, cx + 16, cy + 56);

      // Detail 2
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`• ${item.detail2}`, cx + 16, cy + 80);
    });

    ctx.restore();
  }

  /**
   * Draw Authenticity Seals (Gold Seal, Urla Stamp, Prime Quality Shield)
   */
  private static drawAuthenticitySeals(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    ctx.save();

    const sealY = recipe.aspectRatio === '4:5' ? 960 : 900;

    // Left Urla Mill Stamp
    this.drawUrlaStamp(ctx, 110, sealY, 44);

    // Center Gold Seal (100% Quality)
    this.drawGoldSeal(ctx, width * 0.5, sealY, 52, '100% PRIME', 'TESTED STEEL');

    // Right Certified Quality Shield
    this.drawQualityShield(ctx, width - 110, sealY);

    ctx.restore();
  }

  /**
   * Draw Gold Scalloped Seal (100% Quality Assurance)
   */
  private static drawGoldSeal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    topText: string,
    bottomText: string
  ): void {
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;

    const points = 24;
    const innerRadius = radius * 0.88;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : innerRadius;
      const a = (Math.PI / points) * i;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const goldGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 5, 0, 0, radius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#eab308');
    goldGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = goldGrad;
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#451a03';
    ctx.font = '900 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(topText, 0, -8);
    ctx.fillText(bottomText, 0, 10);

    ctx.fillStyle = '#78350f';
    ctx.font = '10px sans-serif';
    ctx.fillText('★★★', 0, 24);

    ctx.restore();
  }

  /**
   * Draw Urla Mill Raipur Official Stamp
   */
  private static drawUrlaStamp(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.08);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = '900 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NAV DURGA', 0, -14);
    ctx.fillText('URLA MILL', 0, 0);
    ctx.fillText('RAIPUR (C.G.)', 0, 14);

    ctx.restore();
  }

  /**
   * Draw Quality Guarantee Shield
   */
  private static drawQualityShield(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.save();
    ctx.translate(x, y);

    const w = 56;
    const h = 66;

    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, -h / 2 + 10);
    ctx.lineTo(w / 2, 5);
    ctx.quadraticCurveTo(w / 2, h / 2, 0, h / 2 + 10);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, 5);
    ctx.lineTo(-w / 2, -h / 2 + 10);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-2, 9);
    ctx.lineTo(13, -9);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.font = '800 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFIED', 0, 22);

    ctx.restore();
  }

  /**
   * Render 3D MS Channel with realistic bevel & flange thickness
   */
  private static render3DMSChannel(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 14;

    const w = 170;
    const h = 75;
    const depth = 105;
    const t = 16;

    // Back Web Face (Interior shadow)
    const webGrad = ctx.createLinearGradient(0, 0, w, 0);
    webGrad.addColorStop(0, '#505a66');
    webGrad.addColorStop(0.5, '#7b8794');
    webGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = webGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(depth, -depth * 0.4);
    ctx.lineTo(depth, -depth * 0.4 + h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Top Flange
    const topFlange = ctx.createLinearGradient(0, 0, w, -depth * 0.4);
    topFlange.addColorStop(0, '#cbd5e1');
    topFlange.addColorStop(0.5, '#f8fafc');
    topFlange.addColorStop(1, '#94a3b8');
    ctx.fillStyle = topFlange;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w + depth, -depth * 0.4);
    ctx.lineTo(depth, -depth * 0.4);
    ctx.closePath();
    ctx.fill();

    // Front Facing C-Section outline
    const frontGrad = ctx.createLinearGradient(0, 0, 0, h);
    frontGrad.addColorStop(0, '#e2e8f0');
    frontGrad.addColorStop(0.5, '#94a3b8');
    frontGrad.addColorStop(1, '#475569');
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, t);
    ctx.lineTo(t, t);
    ctx.lineTo(t, h - t);
    ctx.lineTo(w, h - t);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Specular Highlight Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w + depth, -depth * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render 3D MS Structural Angle
   */
  private static render3DMSAngle(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 14;

    const size = 105;
    const depth = 125;
    const t = 18;

    // Right Leg Top Face (Extruded)
    const legTop = ctx.createLinearGradient(0, 0, depth, -depth * 0.35);
    legTop.addColorStop(0, '#e2e8f0');
    legTop.addColorStop(0.5, '#f8fafc');
    legTop.addColorStop(1, '#94a3b8');
    ctx.fillStyle = legTop;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(size + depth, -depth * 0.35);
    ctx.lineTo(depth, -depth * 0.35);
    ctx.closePath();
    ctx.fill();

    // Front Facing L profile
    const frontGrad = ctx.createLinearGradient(0, 0, size, size);
    frontGrad.addColorStop(0, '#cbd5e1');
    frontGrad.addColorStop(1, '#475569');
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(t, 0);
    ctx.lineTo(t, size - t);
    ctx.lineTo(size, size - t);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();

    // Apex Highlight Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(depth, -depth * 0.35);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render 3D I-Beam / Joist
   */
  private static render3DMSBeam(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 28;

    const w = 105;
    const h = 150;
    const depth = 130;
    const t = 16;
    const webT = 14;

    // Top Flange
    const topGrad = ctx.createLinearGradient(0, 0, depth, -depth * 0.35);
    topGrad.addColorStop(0, '#f8fafc');
    topGrad.addColorStop(0.5, '#cbd5e1');
    topGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2 + depth, -depth * 0.35);
    ctx.lineTo(-w / 2 + depth, -depth * 0.35);
    ctx.closePath();
    ctx.fill();

    // Front I profile
    const frontGrad = ctx.createLinearGradient(0, 0, 0, h);
    frontGrad.addColorStop(0, '#cbd5e1');
    frontGrad.addColorStop(0.5, '#94a3b8');
    frontGrad.addColorStop(1, '#475569');
    ctx.fillStyle = frontGrad;

    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2, t);
    ctx.lineTo(webT / 2, t);
    ctx.lineTo(webT / 2, h - t);
    ctx.lineTo(w / 2, h - t);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(-w / 2, h);
    ctx.lineTo(-w / 2, h - t);
    ctx.lineTo(-webT / 2, h - t);
    ctx.lineTo(-webT / 2, t);
    ctx.lineTo(-w / 2, t);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(-w / 2 + depth, -depth * 0.35);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render 3D TMT Rebar Bundle with rib details
   */
  private static render3DTMTRebarBundle(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;

    const bars = [
      { x: 0, y: 0, r: 17 },
      { x: 28, y: 5, r: 16 },
      { x: -26, y: 8, r: 16 },
      { x: 13, y: 26, r: 15 },
      { x: -13, y: 24, r: 15 },
    ];

    const len = 140;

    bars.forEach((b) => {
      const cylGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + len);
      cylGrad.addColorStop(0, '#e2e8f0');
      cylGrad.addColorStop(0.3, '#94a3b8');
      cylGrad.addColorStop(0.7, '#475569');
      cylGrad.addColorStop(1, '#1e293b');

      ctx.fillStyle = cylGrad;
      ctx.beginPath();
      ctx.moveTo(b.x - b.r, b.y);
      ctx.lineTo(b.x + len, b.y - len * 0.3);
      ctx.lineTo(b.x + len, b.y - len * 0.3 + b.r * 2);
      ctx.lineTo(b.x - b.r, b.y + b.r * 2);
      ctx.closePath();
      ctx.fill();

      const circleGrad = ctx.createRadialGradient(b.x - 4, b.y + b.r - 4, 2, b.x, b.y + b.r, b.r);
      circleGrad.addColorStop(0, '#f8fafc');
      circleGrad.addColorStop(0.6, '#94a3b8');
      circleGrad.addColorStop(1, '#334155');

      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y + b.r, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(32, 14, 42, 24, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render stacked 3D Steel Billets
   */
  private static render3DSteelBillets(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 22;

    const billets = [
      { x: 0, y: 32 },
      { x: 42, y: 32 },
      { x: 21, y: 0 },
    ];

    billets.forEach((bil) => {
      const w = 38;
      const h = 38;
      const d = 130;

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(bil.x, bil.y);
      ctx.lineTo(bil.x + w, bil.y);
      ctx.lineTo(bil.x + w + d, bil.y - d * 0.3);
      ctx.lineTo(bil.x + d, bil.y - d * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.fillRect(bil.x, bil.y, w, h);

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(bil.x + w, bil.y);
      ctx.lineTo(bil.x + w + d, bil.y - d * 0.3);
      ctx.lineTo(bil.x + w + d, bil.y + h - d * 0.3);
      ctx.lineTo(bil.x + w, bil.y + h);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw Bottom WhatsApp Action & Hotline Bar
   */
  private static drawFooter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    ctx.save();

    const footerH = 100;
    const footerY = height - footerH;

    // Dark Solid Footer
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, footerY, width, footerH);

    ctx.strokeStyle = recipe.colorPalette.goldTrim;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(width, footerY);
    ctx.stroke();

    // Left Hotline & Address
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DISPATCH & BOOKING HOTLINE: +91 97521 83053', 40, footerY + 36);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ex-Plant Urla Industrial Area, Raipur, Chhattisgarh (493221) • Direct Mill Loading', 40, footerY + 62);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by Nav Durga Business ERP • Official Verified WhatsApp Broadcast', 40, footerY + 84);

    // Right WhatsApp Order Pill Button
    const btnW = 270;
    const btnH = 54;
    const btnX = width - 40 - btnW;
    const btnY = footerY + 23;

    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
    btnGrad.addColorStop(0, '#10b981');
    btnGrad.addColorStop(1, '#059669');
    ctx.fillStyle = btnGrad;
    this.roundRect(ctx, btnX, btnY, btnW, btnH, 27);
    ctx.fill();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    this.roundRect(ctx, btnX, btnY, btnW, btnH, 27);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(btnX + 32, btnY + btnH / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📞', btnX + 32, btnY + btnH / 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ORDER ON WHATSAPP', btnX + 56, btnY + 27);

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Instant Booking & Mill Loading', btnX + 56, btnY + 44);

    ctx.restore();
  }

  /**
   * Ambient Molten Sparks
   */
  private static drawSparks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    seed: number
  ): void {
    ctx.save();
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const count = 42;
    for (let i = 0; i < count; i++) {
      const sx = rand() * width;
      const sy = rand() * height;
      const sr = 1.5 + rand() * 4.5;
      const alpha = 0.25 + rand() * 0.65;

      const sparkGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2);
      sparkGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      sparkGrad.addColorStop(0.3, `rgba(251, 191, 36, ${alpha})`);
      sparkGrad.addColorStop(0.7, `rgba(249, 115, 22, ${alpha * 0.7})`);
      sparkGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = sparkGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 2, 0, Math.PI * 2);
      ctx.fill();
    }
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

  private static wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}
