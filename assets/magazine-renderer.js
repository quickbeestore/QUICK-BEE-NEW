/**
 * Magazine Builder - Page Renderer
 * Renders page previews in real-time as user edits
 */

class MagazineRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.store = window.MagazineStore;
  }

  /**
   * Render a single page to canvas
   * @param {number} pageIndex
   * @param {HTMLCanvasElement} canvasElement
   */
  async renderPage(pageIndex, canvasElement) {
    if (!canvasElement) return;

    const page = this.store.getPage(pageIndex);
    const state = this.store.getState();
    const theme = state.global.palette;

    // Setup canvas (8.5" x 11" @ 150dpi = 1275px x 1650px)
    const canvas = canvasElement;
    canvas.width = 850;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and render primary image
    if (page.slots.primary_image) {
      const asset = this.store.getAsset(page.slots.primary_image);
      if (asset && asset.url) {
        await this._renderImage(ctx, asset, page.layout, canvas.width, canvas.height);
      }
    }

    // Render text
    this._renderText(ctx, page, theme, canvas.width, canvas.height);

    // Page number
    if (page.overrides.show_page_number) {
      ctx.fillStyle = `rgba(${this._hexToRgb(theme.accent).join(',')}, 0.3)`;
      ctx.font = 'italic 24px "Cormorant Garamond"';
      ctx.textAlign = 'right';
      ctx.fillText(String(pageIndex + 1), canvas.width - 40, canvas.height - 40);
    }
  }

  async _renderImage(ctx, asset, layout, w, h) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const fp = asset.focal_point || { x: 0.5, y: 0.35 };

        if (layout === 'cover-full-bleed' || layout === 'full-bleed') {
          this._coverFill(ctx, img, w, h, fp);
        } else if (layout === 'text-left-image-right') {
          this._halfRight(ctx, img, w, h, fp);
        } else if (layout === 'split-two') {
          this._halfTop(ctx, img, w, h / 2, fp);
        } else {
          this._centerFit(ctx, img, w, h, fp);
        }

        resolve();
      };

      img.onerror = () => {
        console.warn('Image load failed:', asset.url);
        resolve();
      };

      img.src = asset.url;
    });
  }

  _coverFill(ctx, img, w, h, fp) {
    const scale = Math.max(w / img.width, h / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = (w - scaledW) * fp.x;
    const y = (h - scaledH) * fp.y;
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }

  _halfRight(ctx, img, w, h, fp) {
    const halfW = w / 2;
    const scale = Math.max(halfW / img.width, h / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = w / 2 + (halfW - scaledW) * fp.x;
    const y = (h - scaledH) * fp.y;
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }

  _halfTop(ctx, img, w, h, fp) {
    const scale = Math.max(w / img.width, h / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = (w - scaledW) * fp.x;
    const y = (h - scaledH) * fp.y;
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }

  _centerFit(ctx, img, w, h, fp) {
    const scale = Math.min(w / img.width, h / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = (w - scaledW) / 2;
    const y = (h - scaledH) / 2;
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }

  _renderText(ctx, page, theme, w, h) {
    ctx.fillStyle = page.overrides.text_color || theme.text;
    ctx.font = 'bold 48px "Cormorant Garamond"';
    ctx.textAlign = 'center';

    if (page.text.headline) {
      ctx.fillText(page.text.headline, w / 2, 100);
    }

    ctx.font = '24px "Montserrat"';
    if (page.text.subheadline) {
      ctx.fillText(page.text.subheadline, w / 2, 140);
    }

    ctx.font = '16px "Montserrat"';
    if (page.text.body) {
      this._wrapText(ctx, page.text.body, w / 2, 200, w - 100, 20);
    }
  }

  _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line.length > 0) ctx.fillText(line, x, y);
  }

  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }
}

window.MagazineRenderer = new MagazineRenderer();
