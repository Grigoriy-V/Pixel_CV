// ===== CANVAS RENDERER =====

const Renderer = {
    canvas: null,
    ctx: null,
    scale: 1,
    baseCanvas: null, // offscreen cache for base image

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.BASE_WIDTH;
        this.canvas.height = CONFIG.BASE_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;
        this.updateScale();
        window.addEventListener('resize', () => this.updateScale());
    },

    updateScale() {
        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        const scaleX = maxW / CONFIG.BASE_WIDTH;
        const scaleY = maxH / CONFIG.BASE_HEIGHT;
        this.scale = Math.min(scaleX, scaleY);
        // Allow fractional scaling for better fit
        const cssW = Math.floor(CONFIG.BASE_WIDTH  * this.scale);
        const cssH = Math.floor(CONFIG.BASE_HEIGHT * this.scale);
        this.canvas.style.width  = cssW + 'px';
        this.canvas.style.height = cssH + 'px';

        // Margins between canvas edges and viewport edges (canvas is flex-centered)
        const mx = Math.max(0, Math.floor((window.innerWidth  - cssW) / 2));
        const my = Math.max(0, Math.floor((window.innerHeight - cssH) / 2));
        document.documentElement.style.setProperty('--canvas-mx', mx + 'px');
        document.documentElement.style.setProperty('--canvas-my', my + 'px');
        document.documentElement.style.setProperty('--canvas-s',  this.scale);
    },

    cacheBaseImage(img) {
        this.baseCanvas = document.createElement('canvas');
        this.baseCanvas.width = CONFIG.BASE_WIDTH;
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
        this.ctx.clearRect(0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
    },

    // Convert screen (mouse) coordinates to art-space coordinates
    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (screenX - rect.left) / this.scale;
        const y = (screenY - rect.top) / this.scale;
        return { x: Math.floor(x), y: Math.floor(y) };
    },
};
