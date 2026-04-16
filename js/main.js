// ===== MAIN ENTRY POINT =====

const Game = {
    images: {},
    debugMode: false,
    lastTimestamp: 0,

    async start() {
        this._updateLoading('Загрузка ассетов...');

        // Collect all image sources
        const imageSources = {
            'assets/town-base.png': 'assets/v1/Base_1_2.jpg',
            'assets/town-walkmap.png': 'assets/walkmap_3.jpg',
            [CONFIG.CHARACTER.spriteSheet]: CONFIG.CHARACTER.spriteSheet,
        };
        for (const anim of CONFIG.ANIMATIONS) {
            imageSources[anim.spriteSheet] = anim.spriteSheet;
        }
        for (const mask of CONFIG.MASKS) {
            imageSources[mask.src] = mask.src;
        }
        imageSources['assets/v1/objects.png'] = 'assets/v1/objects.png';
        if (CONFIG.CHARACTER.idleSprite) {
            imageSources[CONFIG.CHARACTER.idleSprite] = CONFIG.CHARACTER.idleSprite;
        }
        if (CONFIG.CHARACTER.backSpriteSheet) {
            imageSources[CONFIG.CHARACTER.backSpriteSheet] = CONFIG.CHARACTER.backSpriteSheet;
        }
        if (CONFIG.CHARACTER.backIdleSprite) {
            imageSources[CONFIG.CHARACTER.backIdleSprite] = CONFIG.CHARACTER.backIdleSprite;
        }

        try {
            this.images = await this._loadImages(imageSources);
        } catch (e) {
            this._updateLoading('Ошибка загрузки: ' + e.message);
            return;
        }

        this._updateLoading('Инициализация...');

        Renderer.init();
        Renderer.cacheBaseImage(this.images['assets/town-base.png']);
        WalkMap.parse(this.images['assets/town-walkmap.png']);
        Animations.init(this.images);
        Character.init(this.images);
        Scenes.init();
        Masks.init(this.images);
        GameObjects.init(this.images['assets/v1/objects.png']);
        QuickMenu.init();

        this._setupEvents();

        // Hide loading, show canvas
        document.getElementById('loading').style.display = 'none';
        Renderer.canvas.style.display = 'block';

        this.lastTimestamp = performance.now();
        requestAnimationFrame((ts) => this._gameLoop(ts));
    },

    _gameLoop(timestamp) {
        const deltaTime = Math.min(timestamp - this.lastTimestamp, 50); // cap at 50ms
        this.lastTimestamp = timestamp;

        Renderer.clear();

        // Town scene
        Renderer.drawBase();
        Animations.draw(Renderer.ctx, timestamp);
        FountainGlow.draw(Renderer.ctx, timestamp);
        Character.update(timestamp, deltaTime);
        Character.draw(Renderer.ctx);
        Masks.draw(Renderer.ctx);
        GameObjects.drawLabels(Renderer.ctx);

        if (this.debugMode) {
            WalkMap.drawDebug(Renderer.ctx);
            GameObjects.drawDebug(Renderer.ctx);
            if (Character.path) {
                Renderer.ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
                Renderer.ctx.lineWidth = 2;
                Renderer.ctx.beginPath();
                Renderer.ctx.moveTo(Character.x, Character.y);
                for (let i = Character.pathIndex; i < Character.path.length; i++) {
                    Renderer.ctx.lineTo(Character.path[i].x, Character.path[i].y);
                }
                Renderer.ctx.stroke();
            }
        }

        requestAnimationFrame((ts) => this._gameLoop(ts));
    },

    _setupEvents() {
        const canvas = Renderer.canvas;

        canvas.addEventListener('click', (e) => {
            const world = Renderer.screenToWorld(e.clientX, e.clientY);
            if (!GameObjects.handleClick(world.x, world.y)) {
                Character.handleClick(world.x, world.y);
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const world = Renderer.screenToWorld(e.clientX, e.clientY);
            GameObjects.handleMouseMove(world.x, world.y);
        });

        canvas.addEventListener('mouseleave', () => {
            Renderer.canvas.style.cursor = 'crosshair';
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const world = Renderer.screenToWorld(touch.clientX, touch.clientY);
            if (!GameObjects.handleClick(world.x, world.y)) {
                Character.handleClick(world.x, world.y);
            }
        }, { passive: false });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugMode = !this.debugMode;
            }
        });

    },

    _loadImages(sources) {
        const entries = Object.entries(sources);
        let loaded = 0;
        return new Promise((resolve, reject) => {
            const images = {};
            if (entries.length === 0) resolve(images);
            for (const [key, src] of entries) {
                const img = new Image();
                img.onload = () => {
                    images[key] = img;
                    loaded++;
                    this._updateLoading(`Загрузка ассетов... ${loaded}/${entries.length}`);
                    if (loaded === entries.length) resolve(images);
                };
                img.onerror = () => reject(new Error(`Не удалось загрузить: ${src}`));
                img.src = src;
            }
        });
    },

    _updateLoading(text) {
        const el = document.getElementById('loading-text');
        if (el) el.textContent = text;
    },

};

document.addEventListener('DOMContentLoaded', () => Game.start());
