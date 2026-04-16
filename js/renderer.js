// ===== CANVAS RENDERER =====

const Renderer = {
    canvas: null,
    ctx: null,
    scale: 1,
    baseCanvas: null, // offscreen cache for base image
    isMobile: false,
    cameraX: 0,
    cameraY: 0,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        // Start camera at character spawn so first frame is correct
        this.cameraX = CONFIG.CHARACTER.startX;
        this.cameraY = CONFIG.CHARACTER.startY;
        this.updateScale();
        window.addEventListener('resize', () => this.updateScale());
    },

    updateScale() {
        // Mobile: viewport narrower than 900px → camera-follow mode
        this.isMobile = window.innerWidth < 900;

        if (this.isMobile) {
            // Show 750 art-space pixels wide, fills full screen height too
            const VIEW_W = 750;
            this.scale  = window.innerWidth / VIEW_W;
            const viewW = VIEW_W;
            const viewH = Math.round(window.innerHeight / this.scale);
            this.canvas.width  = viewW;
            this.canvas.height = viewH;
            this.canvas.style.width  = window.innerWidth  + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
        } else {
            const scaleX = window.innerWidth  / CONFIG.BASE_WIDTH;
            const scaleY = window.innerHeight / CONFIG.BASE_HEIGHT;
            this.scale = Math.min(scaleX, scaleY);
            const cssW = Math.floor(CONFIG.BASE_WIDTH  * this.scale);
            const cssH = Math.floor(CONFIG.BASE_HEIGHT * this.scale);
            this.canvas.width  = CONFIG.BASE_WIDTH;
            this.canvas.height = CONFIG.BASE_HEIGHT;
            this.canvas.style.width  = cssW + 'px';
            this.canvas.style.height = cssH + 'px';

            // CSS variables for canvas-relative UI positioning
            const mx = Math.max(0, Math.floor((window.innerWidth  - cssW) / 2));
            const my = Math.max(0, Math.floor((window.innerHeight - cssH) / 2));
            document.documentElement.style.setProperty('--canvas-mx', mx + 'px');
            document.documentElement.style.setProperty('--canvas-my', my + 'px');
            document.documentElement.style.setProperty('--canvas-s',  this.scale);
        }

        this.ctx.imageSmoothingEnabled = false;
    },

    // ── Camera (mobile only) ─────────────────────────────────────────────────

    updateCamera(worldX, worldY) {
        if (!this.isMobile) return;
        const halfW = this.canvas.width  / 2;
        const halfH = this.canvas.height / 2;
        // Clamp so we never show outside the world
        const tx = Math.max(halfW, Math.min(CONFIG.BASE_WIDTH  - halfW, worldX));
        const ty = Math.max(halfH, Math.min(CONFIG.BASE_HEIGHT - halfH, worldY));
        // Smooth follow
        this.cameraX += (tx - this.cameraX) * 0.1;
        this.cameraY += (ty - this.cameraY) * 0.1;
    },

    // Call before drawing world-space content
    applyCamera() {
        if (!this.isMobile) return;
        this.ctx.save();
        this.ctx.translate(
            Math.round(-this.cameraX + this.canvas.width  / 2),
            Math.round(-this.cameraY + this.canvas.height / 2)
        );
    },

    // Call after drawing world-space content
    resetCamera() {
        if (!this.isMobile) return;
        this.ctx.restore();
    },

    // ── Base rendering ───────────────────────────────────────────────────────

    cacheBaseImage(img) {
        this.baseCanvas = document.createElement('canvas');
        this.baseCanvas.width  = CONFIG.BASE_WIDTH;
        this.baseCanvas.height = CONFIG.BASE_HEIGHT;
        const bctx = this.baseCanvas.getContext('2d');
        bctx.imageSmoothingEnabled = false;
        bctx.drawImage(img, 0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
    },

    drawBase() {
        if (this.baseCanvas) {
            this.ctx.drawImage(this.baseCanvas, 0, 0);
        }
    },

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Convert screen (mouse/touch) coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (screenX - rect.left) / this.scale;
        const y = (screenY - rect.top)  / this.scale;
        if (this.isMobile) {
            return {
                x: Math.floor(x + this.cameraX - this.canvas.width  / 2),
                y: Math.floor(y + this.cameraY - this.canvas.height / 2),
            };
        }
        return { x: Math.floor(x), y: Math.floor(y) };
    },
};
