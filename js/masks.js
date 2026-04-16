// ===== DEPTH MASKS =====
// Pre-bakes background-through-mask once at init.
// Each frame: just drawImage if character.y < mask.groundY — no compositing overhead.

const Masks = {
    masks: [], // [{ baked: Canvas, groundY: number }]

    init(maskImages) {
        for (const maskCfg of CONFIG.MASKS) {
            const src = maskCfg.src;
            const img = maskImages[src];
            if (!img) { console.warn('Mask not loaded:', src); continue; }
            const processed = this._preprocessMask(img);
            const autoGroundY = this._computeGroundY(processed);
            const groundY = autoGroundY + (maskCfg.groundY || 0);
            const baked = this._bake(processed);
            this.masks.push({ baked, groundY });
            console.log(`Mask ${src}: groundY=${groundY} (auto ${autoGroundY} + offset ${maskCfg.groundY || 0})`);
        }
    },

    // Black/dark → transparent, white/light → opaque
    _preprocessMask(img) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            d[i + 3] = (d[i] + d[i + 1] + d[i + 2]) / 3 < 128 ? 0 : 255;
        }
        ctx.putImageData(imageData, 0, 0);
        return c;
    },

    // Scan bottom-up for lowest opaque pixel → groundY
    _computeGroundY(canvas) {
        const w = canvas.width, h = canvas.height;
        const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;
        for (let y = h - 1; y >= 0; y--)
            for (let x = 0; x < w; x++)
                if (data[(y * w + x) * 4 + 3] > 10) return y;
        return h;
    },

    // Composite bg through mask ONCE → static canvas, reused every frame
    _bake(processedMask) {
        const w = CONFIG.BASE_WIDTH, h = CONFIG.BASE_HEIGHT;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(processedMask, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(Renderer.baseCanvas, 0, 0);
        return c;
    },

    // Per-frame: just N drawImage calls — no pixel manipulation
    draw(ctx) {
        const charY = Character.y;
        for (const mask of this.masks) {
            if (charY < mask.groundY) {
                ctx.drawImage(mask.baked, 0, 0);
            }
        }
    },
};
