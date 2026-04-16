// ===== WALKABILITY MAP =====

const WalkMap = {
    grid: null,
    gridW: 0,
    gridH: 0,

    // Cell types
    BLOCKED: 0,
    WALKABLE: 1,
    ENTRANCE: 2,
    SPECIAL: 3,

    parse(img) {
        const ts = CONFIG.TILE_SIZE;
        this.gridW = Math.floor(CONFIG.BASE_WIDTH / ts);
        this.gridH = Math.floor(CONFIG.BASE_HEIGHT / ts);

        // Draw walkmap image to offscreen canvas
        const offscreen = document.createElement('canvas');
        offscreen.width = CONFIG.BASE_WIDTH;
        offscreen.height = CONFIG.BASE_HEIGHT;
        const octx = offscreen.getContext('2d');
        octx.imageSmoothingEnabled = false;
        octx.drawImage(img, 0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
        const imageData = octx.getImageData(0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
        const pixels = imageData.data;

        const colors = CONFIG.WALKMAP_COLORS;
        const t = colors.THRESHOLD;

        // Build grid by sampling center pixel of each tile
        this.grid = new Array(this.gridH);
        for (let gy = 0; gy < this.gridH; gy++) {
            this.grid[gy] = new Uint8Array(this.gridW);
            for (let gx = 0; gx < this.gridW; gx++) {
                const px = gx * ts + Math.floor(ts / 2);
                const py = gy * ts + Math.floor(ts / 2);
                const i = (py * CONFIG.BASE_WIDTH + px) * 4;
                const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

                if (g > t && r < t && b < t) {
                    this.grid[gy][gx] = this.WALKABLE;
                } else if (r > t && g < t && b < t) {
                    this.grid[gy][gx] = this.ENTRANCE;
                } else if (b > t && r < t && g < t) {
                    this.grid[gy][gx] = this.SPECIAL;
                } else {
                    this.grid[gy][gx] = this.BLOCKED;
                }
            }
        }
        console.log(`WalkMap parsed: ${this.gridW}x${this.gridH} tiles`);
    },

    isWalkable(gx, gy) {
        if (gx < 0 || gy < 0 || gx >= this.gridW || gy >= this.gridH) return false;
        return this.grid[gy][gx] !== this.BLOCKED;
    },

    getType(gx, gy) {
        if (gx < 0 || gy < 0 || gx >= this.gridW || gy >= this.gridH) return this.BLOCKED;
        return this.grid[gy][gx];
    },

    worldToGrid(wx, wy) {
        return {
            x: Math.floor(wx / CONFIG.TILE_SIZE),
            y: Math.floor(wy / CONFIG.TILE_SIZE),
        };
    },

    gridToWorld(gx, gy) {
        return {
            x: gx * CONFIG.TILE_SIZE + Math.floor(CONFIG.TILE_SIZE / 2),
            y: gy * CONFIG.TILE_SIZE + Math.floor(CONFIG.TILE_SIZE / 2),
        };
    },

    // Find nearest walkable tile to a given grid position
    findNearestWalkable(gx, gy) {
        if (this.isWalkable(gx, gy)) return { x: gx, y: gy };
        // BFS outward
        const visited = new Set();
        const queue = [{ x: gx, y: gy }];
        visited.add(`${gx},${gy}`);
        while (queue.length > 0) {
            const curr = queue.shift();
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = curr.x + dx, ny = curr.y + dy;
                    const key = `${nx},${ny}`;
                    if (visited.has(key)) continue;
                    visited.add(key);
                    if (this.isWalkable(nx, ny)) return { x: nx, y: ny };
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        return null;
    },

    // Debug: draw walkmap overlay
    drawDebug(ctx) {
        const ts = CONFIG.TILE_SIZE;
        const colors = ['rgba(0,0,0,0)', 'rgba(0,255,0,0.3)', 'rgba(255,0,0,0.4)', 'rgba(0,100,255,0.4)'];
        for (let gy = 0; gy < this.gridH; gy++) {
            for (let gx = 0; gx < this.gridW; gx++) {
                const type = this.grid[gy][gx];
                if (type === this.BLOCKED) continue;
                ctx.fillStyle = colors[type];
                ctx.fillRect(gx * ts, gy * ts, ts, ts);
            }
        }
    },
};
