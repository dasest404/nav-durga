import { AIGraphicRecipe, AISteelProductVisual } from '../types';

export class AIGraphicRenderer {
  /**
   * Main render function that draws the entire AI-generated graphic onto an HTML5 Canvas.
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

    // 1. Draw Background
    this.drawBackground(ctx, width, height, recipe);

    // 2. Draw Decorative Background Patterns & Geometry
    this.drawBackgroundDecor(ctx, width, height, recipe);

    // 3. Draw 3D Steel Product Visuals (Procedural Realistic Steel)
    this.draw3DProducts(ctx, width, height, recipe);

    // 4. Draw Layout-Specific Structure, Typography, Badges & Price
    this.drawLayout(ctx, width, height, recipe);

    // 5. Draw Header Branding (Nav Durga Ispat)
    this.drawHeader(ctx, width, height, recipe);

    // 6. Draw Footer Branding & WhatsApp CTA Bar
    this.drawFooter(ctx, width, height, recipe);

    // 7. Draw Foreground Sparks / Ambient Glow
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
    const isRadial = recipe.backgroundDecor === 'radial_sunburst';

    if (isRadial) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        50,
        width / 2,
        height * 0.5,
        width * 0.75
      );
      grad.addColorStop(0, c1);
      grad.addColorStop(0.55, c2);
      grad.addColorStop(1, c3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width * 0.3, height);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Draw decorative patterns: Mesh, blueprint, geometric cuts, sunburst, or layered slabs
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
      // Draw subtle hexagonal steel mesh
      ctx.strokeStyle = `${palette.accentPrimary}18`;
      ctx.lineWidth = 1.5;
      const size = 36;
      const h = size * Math.sqrt(3);

      for (let y = 0; y < height + h; y += h) {
        for (let x = 0; x < width + size * 3; x += size * 3) {
          this.drawHexagon(ctx, x, y, size);
          this.drawHexagon(ctx, x + size * 1.5, y + h / 2, size);
        }
      }
    } else if (decor === 'radial_sunburst') {
      // Draw dynamic radial rays
      ctx.save();
      ctx.translate(width / 2, height * 0.45);
      const rays = 28;
      const step = (Math.PI * 2) / rays;
      ctx.fillStyle = `${palette.accentSecondary}12`;
      for (let i = 0; i < rays; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, width * 1.2, i * step, (i + 1) * step);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (decor === 'blueprint_cad') {
      // Technical CAD blueprint grid & crosshairs
      ctx.strokeStyle = `${palette.accentPrimary}15`;
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // CAD corner ticks
      ctx.strokeStyle = `${palette.accentGlow}40`;
      ctx.lineWidth = 2;
      this.drawCrosshair(ctx, 60, 160);
      this.drawCrosshair(ctx, width - 60, 160);
      this.drawCrosshair(ctx, 60, height - 160);
      this.drawCrosshair(ctx, width - 60, height - 160);
    } else if (decor === 'diagonal_slashes' || decor === 'layered_slabs') {
      // Dynamic bold angular cuts
      ctx.save();
      ctx.fillStyle = `${palette.accentPrimary}15`;
      ctx.beginPath();
      ctx.moveTo(-100, height * 0.2);
      ctx.lineTo(width + 100, height * 0.05);
      ctx.lineTo(width + 100, height * 0.45);
      ctx.lineTo(-100, height * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `${palette.accentSecondary}12`;
      ctx.beginPath();
      ctx.moveTo(-100, height * 0.65);
      ctx.lineTo(width + 100, height * 0.5);
      ctx.lineTo(width + 100, height * 0.85);
      ctx.lineTo(-100, height * 0.95);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Modern Corner Tech Brackets if enabled
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

  private static drawCrosshair(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    const s = 14;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
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

    // Top Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);
    ctx.stroke();

    // Top Right
    ctx.beginPath();
    ctx.moveTo(width - pad - len, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + len);
    ctx.stroke();

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(pad, height - pad - len);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + len, height - pad);
    ctx.stroke();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(width - pad - len, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - len);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw 3D Procedural Steel Products
   */
  private static draw3DProducts(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    recipe.productVisuals.forEach((item) => {
      ctx.save();
      const x = width * item.xRatio;
      const y = height * item.yRatio;

      ctx.translate(x, y);
      ctx.rotate((item.rotationDeg * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);

      switch (item.type) {
        case 'channel':
          this.render3DMSChannel(ctx, recipe.colorPalette);
          break;
        case 'angle':
          this.render3DMSAngle(ctx, recipe.colorPalette);
          break;
        case 'beam':
          this.render3DMSBeam(ctx, recipe.colorPalette);
          break;
        case 'tmt_bundle':
          this.render3DTMTRebarBundle(ctx, recipe.colorPalette);
          break;
        case 'billet_stack':
          this.render3DSteelBillets(ctx, recipe.colorPalette);
          break;
      }

      ctx.restore();
    });
  }

  /**
   * Render a realistic 3D MS Channel with flange thickness & metallic bevel
   */
  private static render3DMSChannel(
    ctx: CanvasRenderingContext2D,
    palette: any
  ): void {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 15;

    const w = 180;
    const h = 80;
    const depth = 110;
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

    // Top Flange Lip Front
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, w, t);

    // Bottom Flange
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h - t);
    ctx.lineTo(w, h - t);
    ctx.lineTo(w + depth, h - t - depth * 0.4);
    ctx.lineTo(depth, h - t - depth * 0.4);
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

    // Metallic Specular Highlight Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w + depth, -depth * 0.4);
    ctx.stroke();

    // Steel Mill Roll-Mark stamp on channel web
    ctx.save();
    ctx.rotate(-0.35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('NAV DURGA ISPAT • IS 2062', 15, 30);
    ctx.restore();

    ctx.restore();
  }

  /**
   * Render a realistic 3D MS Structural Angle
   */
  private static render3DMSAngle(
    ctx: CanvasRenderingContext2D,
    palette: any
  ): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 14;

    const size = 110;
    const depth = 130;
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

    // Vertical Leg Outer Face (Extruded)
    const legVert = ctx.createLinearGradient(0, 0, 0, size);
    legVert.addColorStop(0, '#64748b');
    legVert.addColorStop(0.5, '#475569');
    legVert.addColorStop(1, '#334155');
    ctx.fillStyle = legVert;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(depth, -depth * 0.35);
    ctx.lineTo(depth, size - depth * 0.35);
    ctx.lineTo(0, size);
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
   * Render a heavy 3D I-Beam / Joist
   */
  private static render3DMSBeam(
    ctx: CanvasRenderingContext2D,
    palette: any
  ): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 16;

    const w = 110;
    const h = 160;
    const depth = 140;
    const t = 16;
    const webT = 14;

    // Top Flange Upper Extrusion
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

    // Specular highlight along beam edge
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
  private static render3DTMTRebarBundle(
    ctx: CanvasRenderingContext2D,
    palette: any
  ): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;

    const bars = [
      { x: 0, y: 0, r: 18 },
      { x: 30, y: 5, r: 17 },
      { x: -28, y: 8, r: 17 },
      { x: 14, y: 28, r: 16 },
      { x: -14, y: 26, r: 16 },
    ];

    const len = 150;

    bars.forEach((b) => {
      // Cylinder body
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

      // Front cross section circle
      const circleGrad = ctx.createRadialGradient(
        b.x - 4,
        b.y + b.r - 4,
        2,
        b.x,
        b.y + b.r,
        b.r
      );
      circleGrad.addColorStop(0, '#f8fafc');
      circleGrad.addColorStop(0.6, '#94a3b8');
      circleGrad.addColorStop(1, '#334155');

      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y + b.r, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Rib marks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 20; i < len; i += 18) {
        ctx.beginPath();
        ctx.moveTo(b.x + i, b.y - i * 0.3);
        ctx.lineTo(b.x + i + 8, b.y - i * 0.3 + b.r * 2);
        ctx.stroke();
      }
    });

    // Gold/Steel binding wire
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(35, 15, 45, 25, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render stacked heavy 3D Steel Billets
   */
  private static render3DSteelBillets(
    ctx: CanvasRenderingContext2D,
    palette: any
  ): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;

    const billets = [
      { x: 0, y: 35 },
      { x: 45, y: 35 },
      { x: 22, y: 0 },
    ];

    billets.forEach((bil) => {
      const w = 40;
      const h = 40;
      const d = 140;

      // Top
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(bil.x, bil.y);
      ctx.lineTo(bil.x + w, bil.y);
      ctx.lineTo(bil.x + w + d, bil.y - d * 0.3);
      ctx.lineTo(bil.x + d, bil.y - d * 0.3);
      ctx.closePath();
      ctx.fill();

      // Front
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bil.x, bil.y, w, h);

      // Side
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
   * Draw layout structure, typography, highlights, features, and price tags
   */
  private static drawLayout(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;

    ctx.save();

    // 1. Promotional Hook Badge (e.g. "HOT DEAL", "PRICE UPDATE", "FESTIVE OFFER")
    if (recipe.badge) {
      this.drawTopBadge(ctx, width, height, recipe);
    }

    // 2. Main Headline
    this.drawMainHeadline(ctx, width, height, recipe);

    // 3. Subheadline
    this.drawSubheadline(ctx, width, height, recipe);

    // 4. Highlighted Price Card / Pill
    if (recipe.price) {
      this.drawPriceCard(ctx, width, height, recipe);
    }

    // 5. Feature Badges / Product Highlights
    this.drawFeaturesAndProducts(ctx, width, height, recipe);

    // 6. Seals & Badges (100% Quality, Urla Mill, Trust Shield)
    if (recipe.decorations.hasGoldSeal) {
      this.drawGoldSeal(ctx, width * 0.85, height * 0.28, 55, '100% PRIME', 'QUALITY STEEL');
    }

    if (recipe.decorations.hasUrlaBadge) {
      this.drawUrlaStamp(ctx, width * 0.14, height * 0.72, 48);
    }

    if (recipe.decorations.hasPrimeQualityShield) {
      this.drawQualityShield(ctx, width * 0.86, height * 0.72);
    }

    ctx.restore();
  }

  /**
   * Draw Top Promotional Ribbon / Badge
   */
  private static drawTopBadge(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const text = recipe.badge.toUpperCase();
    const p = recipe.colorPalette;

    ctx.save();
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(text).width;
    const badgeW = Math.max(textWidth + 48, 180);
    const badgeH = 38;
    const x = width / 2 - badgeW / 2;
    const y = 145;

    // Glowing drop shadow
    ctx.shadowColor = p.accentGlow;
    ctx.shadowBlur = 18;

    // Badge Background
    const grad = ctx.createLinearGradient(x, y, x + badgeW, y);
    grad.addColorStop(0, p.accentSecondary);
    grad.addColorStop(1, p.accentPrimary);
    ctx.fillStyle = grad;

    this.roundRect(ctx, x, y, badgeW, badgeH, 19);
    ctx.fill();

    // Border
    ctx.strokeStyle = p.goldTrim;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, badgeW, badgeH, 19);
    ctx.stroke();

    // Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = p.badgeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★  ${text}  ★`, width / 2, y + badgeH / 2);

    ctx.restore();
  }

  /**
   * Draw Main Headline with 3D gradient & metallic shadow
   */
  private static drawMainHeadline(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;
    const text = recipe.headline;

    ctx.save();
    ctx.textAlign = 'center';

    // Auto font sizing based on length
    let fontSize = 48;
    if (text.length > 35) fontSize = 38;
    if (text.length > 55) fontSize = 32;

    ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", sans-serif`;

    const lines = this.wrapText(ctx, text, width * 0.86);
    const startY = 225;

    lines.forEach((line, i) => {
      const y = startY + i * (fontSize * 1.15);

      // Deep Shadow for heavy contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillText(line, width / 2 + 3, y + 4);

      // Headline gradient (Gold or Pure White with Accent)
      const grad = ctx.createLinearGradient(0, y - fontSize, 0, y);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.65, p.textLight);
      grad.addColorStop(1, p.accentGlow);

      ctx.fillStyle = grad;
      ctx.fillText(line, width / 2, y);

      // Stroke
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeText(line, width / 2, y);
    });

    ctx.restore();
  }

  /**
   * Draw Subheadline
   */
  private static drawSubheadline(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    if (!recipe.subheadline) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';

    const lines = this.wrapText(ctx, recipe.subheadline, width * 0.82);
    const startY = 320;

    lines.slice(0, 2).forEach((line, i) => {
      const y = startY + i * 26;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(line, width / 2 + 1, y + 1.5);

      ctx.fillStyle = `${recipe.colorPalette.textLight}e6`;
      ctx.fillText(line, width / 2, y);
    });

    ctx.restore();
  }

  /**
   * Draw Price Card with Glowing Bevel
   */
  private static drawPriceCard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;
    const priceText = recipe.price || '';
    const labelText = recipe.priceLabel || 'SPECIAL EX-PLANT RATE';

    ctx.save();

    const cardW = Math.min(width * 0.74, 520);
    const cardH = 110;
    const x = width / 2 - cardW / 2;
    const y = recipe.layoutStyle === 'bold_split_poster' ? height * 0.44 : height * 0.48;

    // Glowing card shadow
    ctx.shadowColor = p.accentGlow;
    ctx.shadowBlur = 30;

    // Beveled Card Body
    const cardGrad = ctx.createLinearGradient(x, y, x, y + cardH);
    cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    cardGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
    ctx.fillStyle = cardGrad;
    this.roundRect(ctx, x, y, cardW, cardH, 22);
    ctx.fill();

    // Metallic Golden/Cyber Border
    ctx.strokeStyle = p.goldTrim;
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, x, y, cardW, cardH, 22);
    ctx.stroke();

    // Header strip for price card
    ctx.shadowBlur = 0;
    ctx.fillStyle = `${p.accentPrimary}33`;
    this.roundRect(ctx, x + 3, y + 3, cardW - 6, 32, 18);
    ctx.fill();

    // Label Text
    ctx.fillStyle = p.goldTrim;
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡  ${labelText.toUpperCase()}  ⚡`, width / 2, y + 23);

    // Big Price Text
    const priceGrad = ctx.createLinearGradient(0, y + 40, 0, y + 95);
    priceGrad.addColorStop(0, '#ffffff');
    priceGrad.addColorStop(0.5, p.accentGlow);
    priceGrad.addColorStop(1, p.goldTrim);

    ctx.fillStyle = priceGrad;
    ctx.font = '900 46px "JetBrains Mono", monospace, sans-serif';
    ctx.fillText(priceText, width / 2, y + 84);

    ctx.restore();
  }

  /**
   * Draw Feature List and Product Highlights
   */
  private static drawFeaturesAndProducts(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    const p = recipe.colorPalette;
    const features = recipe.features.slice(0, 4);

    ctx.save();

    const startY = height * 0.63;
    const cardW = width * 0.82;
    const x = width / 2 - cardW / 2;

    // Container pill for features
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, startY, cardW, 140, 18);
    ctx.fill();
    ctx.stroke();

    // Feature items in 2 columns
    const colW = cardW / 2;
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';

    features.forEach((feat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const fx = x + 24 + col * (colW - 8);
      const fy = startY + 36 + row * 52;

      // Golden check circle
      ctx.fillStyle = p.goldTrim;
      ctx.beginPath();
      ctx.arc(fx + 8, fy - 5, 10, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark tick
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx + 4, fy - 5);
      ctx.lineTo(fx + 7, fy - 2);
      ctx.lineTo(fx + 12, fy - 8);
      ctx.stroke();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(feat, fx + 26, fy);
    });

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

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 18;

    // Scalloped points
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

    // Double Ring
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Emblem Stars & Text
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
    ctx.rotate(-0.1);

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

    const w = 60;
    const h = 70;

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

    // Checkmark inside shield
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-3, 10);
    ctx.lineTo(14, -10);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.font = '800 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFIED', 0, 24);

    ctx.restore();
  }

  /**
   * Draw Header Branding (Nav Durga Ispat)
   */
  private static drawHeader(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    ctx.save();

    // Header Background Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, width, 84);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
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

    // Company Name & Mill Location
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA ISPAT PVT. LTD.', logoX + logoSize + 16, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Rolling Mill & Commercial Hub • Urla, Raipur (Chhattisgarh)', logoX + logoSize + 16, 59);

    // Right Header Pill: Raipur Steel Market Active
    ctx.textAlign = 'right';
    const pillW = 200;
    const pillH = 34;
    const pillX = width - 40 - pillW;
    const pillY = 25;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.stroke();

    // Pulsing Green Dot
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
   * Draw Footer Branding & WhatsApp CTA Bar
   */
  private static drawFooter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    recipe: AIGraphicRecipe
  ): void {
    ctx.save();

    const footerH = 110;
    const footerY = height - footerH;

    // Dark Solid Footer Container
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, footerY, width, footerH);

    ctx.strokeStyle = recipe.colorPalette.accentPrimary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(width, footerY);
    ctx.stroke();

    // Left Contact Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DISPATCH & BOOKING HOTLINE: +91 97521 83053', 40, footerY + 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ex-Plant Urla Industrial Area, Raipur, Chhattisgarh (493221) • Direct Mill Loading', 40, footerY + 68);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by Nav Durga Business ERP • Official WhatsApp Broadcast', 40, footerY + 92);

    // Right WhatsApp Action Button Pill
    const btnW = 260;
    const btnH = 54;
    const btnX = width - 40 - btnW;
    const btnY = footerY + 28;

    // Green WhatsApp Button
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

    // WhatsApp Phone Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(btnX + 32, btnY + btnH / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📞', btnX + 32, btnY + btnH / 2);

    // Button Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ORDER ON WHATSAPP', btnX + 56, btnY + 27);

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Instant Quote & Loading', btnX + 56, btnY + 44);

    ctx.restore();
  }

  /**
   * Draw Ambient Sparks / Molten Steel Flares
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

    const sparkCount = 38;
    for (let i = 0; i < sparkCount; i++) {
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

  /**
   * Utility helper to draw rounded rectangle
   */
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

  /**
   * Helper to wrap text into lines fitting max width
   */
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
