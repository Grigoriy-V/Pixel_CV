// ===== CHARACTER (Claude Mascot) =====

const Character = {
    x: 0,
    y: 0,
    state: 'IDLE', // IDLE | WALKING
    direction: 0,  // 0=front(down), 1=back(up), 2=side
    directionFlipped: false, // true = mirror side sprite (facing right)
    targetObject: null,  // object to open after arriving
    currentFrame: 0,
    lastFrameTime: 0,
    path: null,
    pathIndex: 0,
    img: null,
    backImg: null,
    idleImg: null,
    backIdleImg: null,
    frameW: 0,
    frameH: 0,
    _shadowCanvas: null,

    init(images) {
        const cfg = CONFIG.CHARACTER;
        this.x = cfg.startX;
        this.y = cfg.startY;
        this.state = 'IDLE';
        this.direction = 0;
        this.currentFrame = 0;

        const rawImg = images[cfg.spriteSheet];
        if (rawImg) {
            this.img = rawImg;
            const sheetCols = cfg.sheetCols || cfg.cols;
            const sheetRows = cfg.sheetRows || cfg.rows;
            this.frameW = Math.floor(rawImg.width  / sheetCols);
            this.frameH = Math.floor(rawImg.height / sheetRows);
        }

        // Pre-bake pixelated gradient shadow — concentric ellipses on small canvas
        this._shadowCanvas = document.createElement('canvas');
        this._shadowCanvas.width  = 30;
        this._shadowCanvas.height = 12;
        const sc = this._shadowCanvas.getContext('2d');
        const cw = this._shadowCanvas.width;
        const ch = this._shadowCanvas.height;
        const cx = cw / 2;
        const cy = ch / 2;
        const rx = cw / 2 - 0.5;
        const ry = ch / 2 - 0.5;
        // Outer → inner rings, each darker (t = 0..1 от края к центру)
        const steps = [0, 0.28, 0.55, 0.78, 1.0];
        const alphas = [0, 0.10, 0.22, 0.32, 0.42];
        for (let i = steps.length - 1; i >= 0; i--) {
            const t = 1 - steps[i];
            sc.fillStyle = `rgba(0,0,0,${alphas[i]})`;
            sc.beginPath();
            sc.ellipse(cx, cy, rx * t + 0.5, ry * t + 0.5, 0, 0, Math.PI * 2);
            sc.fill();
        }

        // Back-direction walk spritesheet (same grid dimensions as main sheet)
        if (cfg.backSpriteSheet) {
            const backRaw = images[cfg.backSpriteSheet];
            if (backRaw) this.backImg = backRaw;
        }

        // Idle sprites
        if (cfg.idleSprite) {
            const idleRaw = images[cfg.idleSprite];
            if (idleRaw) this.idleImg = idleRaw;
        }
        if (cfg.backIdleSprite) {
            const backIdleRaw = images[cfg.backIdleSprite];
            if (backIdleRaw) this.backIdleImg = backIdleRaw;
        }
    },

    navigateToObject(worldX, worldY, obj) {
        const targetGrid = WalkMap.worldToGrid(worldX, worldY);
        const currentGrid = WalkMap.worldToGrid(this.x, this.y);

        let dest = targetGrid;
        if (!WalkMap.isWalkable(dest.x, dest.y)) {
            const nearest = WalkMap.findNearestWalkable(dest.x, dest.y);
            if (!nearest) return;
            dest = nearest;
        }
        let start = currentGrid;
        if (!WalkMap.isWalkable(start.x, start.y)) {
            const nearest = WalkMap.findNearestWalkable(start.x, start.y);
            if (!nearest) return;
            start = nearest;
        }

        const path = Pathfinder.findPath(start.x, start.y, dest.x, dest.y);
        if (path) {
            this.targetObject = obj;
            this._startWalking(path);
        }
    },

    handleClick(worldX, worldY) {
        const targetGrid = WalkMap.worldToGrid(worldX, worldY);
        const currentGrid = WalkMap.worldToGrid(this.x, this.y);

        const path = Pathfinder.findPath(currentGrid.x, currentGrid.y, targetGrid.x, targetGrid.y);
        if (path) {
            this._startWalking(path);
        }
    },

    _startWalking(gridPath) {
        if (!gridPath || gridPath.length < 2) return;
        this.path = gridPath.map(p => WalkMap.gridToWorld(p.x, p.y));
        this.pathIndex = 1;
        this.state = 'WALKING';
    },

    update(timestamp, deltaTime) {
        const cfg = CONFIG.CHARACTER;

        if (this.state === 'WALKING' && this.path) {
            const target = this.path[this.pathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const step = cfg.speed * (deltaTime / 1000);

            if (dist <= step) {
                this.x = target.x;
                this.y = target.y;
                this.pathIndex++;
                if (this.pathIndex >= this.path.length) {
                    this.state = 'IDLE';
                    this.path = null;
                    this.currentFrame = 0;
                    // Notify if arrived at object
                    if (this.targetObject) {
                        GameObjects.onObjectArrived(this.targetObject);
                        this.targetObject = null;
                    }
                }
            } else {
                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
            }

            // Determine direction by looking ahead several waypoints to avoid flickering
            const smooth = this._getSmoothDirection();
            this.direction = smooth.dir;
            this.directionFlipped = smooth.flip;

            // Animate walk cycle
            if (timestamp - this.lastFrameTime >= cfg.frameDuration) {
                this.currentFrame = (this.currentFrame + 1) % cfg.cols;
                this.lastFrameTime = timestamp;
            }
        }
    },

    draw(ctx) {
        const cfg = CONFIG.CHARACTER;
        const dx = this.x - cfg.drawWidth / 2;
        const dy = this.y - cfg.drawHeight;

        // Shadow — pixelated gradient (small canvas scaled up, no smoothing)
        if (this._shadowCanvas) {
            const sw = cfg.drawWidth * 0.5;
            const sh = sw * 0.3;
            ctx.save();
            ctx.globalAlpha = 0.65;          // ← общий множитель прозрачности (0..1)
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this._shadowCanvas,
                this.x - sw, this.y - sh - 8,
                sw * 2, sh * 2);
            ctx.restore();
        }

        // IDLE — pick sprite based on last walk direction
        if (this.state === 'IDLE') {
            // direction 1 = back/up → use backIdleImg if available
            const idleImg = (this.direction === 1 && this.backIdleImg) ? this.backIdleImg : this.idleImg;
            if (idleImg) {
                if (this.directionFlipped) {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(idleImg, 0, 0, idleImg.width, idleImg.height,
                        -(this.x + cfg.drawWidth / 2), dy, cfg.drawWidth, cfg.drawHeight);
                    ctx.restore();
                } else {
                    ctx.drawImage(idleImg, 0, 0, idleImg.width, idleImg.height,
                        dx, dy, cfg.drawWidth, cfg.drawHeight);
                }
                return;
            }
        }

        // WALKING — pick spritesheet based on direction
        // direction 1 = back/up → use backImg if available
        const walkImg = (this.direction === 1 && this.backImg) ? this.backImg : this.img;
        if (!walkImg) return;

        // 2D grid frame addressing (same layout for both sheets)
        const sheetCols = cfg.sheetCols || cfg.cols;
        const srcX = (this.currentFrame % sheetCols) * this.frameW;
        const srcY = Math.floor(this.currentFrame / sheetCols) * this.frameH;

        if (this.directionFlipped) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(walkImg, srcX, srcY, this.frameW, this.frameH,
                -(this.x + cfg.drawWidth / 2), dy, cfg.drawWidth, cfg.drawHeight);
            ctx.restore();
        } else {
            ctx.drawImage(walkImg, srcX, srcY, this.frameW, this.frameH,
                dx, dy, cfg.drawWidth, cfg.drawHeight);
        }
    },

    _getSmoothDirection() {
        if (!this.path) return { dir: this.direction, flip: this.directionFlipped };
        // Look ahead ~5 waypoints to get the overall movement direction
        const lookAhead = Math.min(this.pathIndex + 5, this.path.length - 1);
        const target = this.path[lookAhead];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        // Need some minimum distance to change direction
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return { dir: this.direction, flip: this.directionFlipped };
        return this._angleToDirection(dx, dy);
    },

    _angleToDirection(dx, dy) {
        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        // Back: northwest → north → northeast (-135° to -45°), верхняя 90° дуга
        // Спрайт бэка смотрит вправо, флип когда идём влево (NW сторона)
        if (deg > -165 && deg < -15) return { dir: 1, flip: dx < 0 };
        // Всё остальное (юг, восток, запад): side sprite, флип влево
        return { dir: 2, flip: dx < 0 };
    },

};

