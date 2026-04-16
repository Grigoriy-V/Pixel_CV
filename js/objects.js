// ===== INTERACTIVE OBJECTS =====
// Hover over zone → tooltip. Click → character walks there → menu opens.

const GameObjects = {
    _pixelData: null,
    _mapWidth: 0,
    _mapHeight: 0,
    _mapCanvas: null,   // cached for debug overlay
    _activeObject: null,
    _pendingObject: null,
    _tolerance: 60,

    init(interactionMapImage) {
        if (!interactionMapImage) { console.warn('Interaction map not loaded'); return; }
        const c = document.createElement('canvas');
        c.width = interactionMapImage.width;
        c.height = interactionMapImage.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(interactionMapImage, 0, 0);
        this._pixelData = ctx.getImageData(0, 0, c.width, c.height).data;
        this._mapWidth  = c.width;
        this._mapHeight = c.height;
        this._mapCanvas = c;

        // Precompute zone centers for label rendering
        for (const obj of CONFIG.OBJECTS) {
            obj._center       = this._getZoneCenter(obj.color);
            obj._hoverProgress = 0; // 0=idle, 1=fully hovered — animated each frame
        }
        console.log(`Interaction map: ${c.width}x${c.height}`);
    },

    // Hover — track hovered object, canvas label handles visual feedback
    handleMouseMove(worldX, worldY) {
        if (!this._pixelData) return false;
        const obj = this._getObjectAt(worldX, worldY);
        if (obj !== this._activeObject) {
            this._activeObject = obj;
            Renderer.canvas.style.cursor = obj ? 'pointer' : 'crosshair';
        }
        return !!obj;
    },

    // Click — navigate character to click point, then open content on arrival
    handleClick(worldX, worldY) {
        if (!this._pixelData) return false;
        const obj = this._getObjectAt(worldX, worldY);
        if (!obj) return false;

        this._pendingObject = obj;
        Character.navigateToObject(worldX, worldY, obj);
        return true;
    },

    // Called by Character when it arrives at the object target
    onObjectArrived(obj) {
        this._pendingObject = null;
        this._openContent(obj);
    },

    // Debug: draw interaction map as semi-transparent overlay
    drawDebug(ctx) {
        if (!this._mapCanvas) return;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.drawImage(this._mapCanvas, 0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
        ctx.globalAlpha = 1;
        // Label each object at its zone center
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (const obj of CONFIG.OBJECTS) {
            const center = this._getZoneCenter(obj.color);
            if (center) ctx.fillText(obj.name, center.x + 5, center.y);
        }
        ctx.restore();
    },

    // Draw persistent floating labels above each object, scaled by distance to character
    drawLabels(ctx) {
        // On mobile all labels are handled by drawMobileLabels (screen space)
        if (Renderer.isMobile) return;

        const NEAR = 180;   // px — near state
        const FAR  = 650;   // px — far state

        for (const obj of CONFIG.OBJECTS) {
            if (!obj._center) continue;

            const dist  = Math.hypot(Character.x - obj._center.x, Character.y - obj._center.y);
            const tDist = 1 - Math.min(Math.max((dist - NEAR) / (FAR - NEAR), 0), 1);

            // Animate hoverProgress toward target (0 or 1) — ~200ms transition at 60fps
            const hoverTarget = this._activeObject === obj ? 1 : 0;
            obj._hoverProgress += (hoverTarget - obj._hoverProgress) * 0.12;

            const h = obj._hoverProgress;
            const t = Math.min(tDist + h * 0.5, 1);

            const alpha    = 0.75 + t * 0.25;
            const fontSize = Math.round(13 + t * 6 + h * 3);
            const padX     = 14;
            const padY     = 8;
            const off    = obj.labelOffset || { x: 0, y: 0 };
            const labelX = obj._center.x + off.x;
            const labelY = obj._center.y - 50 - t * 15 + off.y;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `${fontSize}px "Press Start 2P", monospace`;
            ctx.textAlign = 'center';

            const text  = obj.content ? obj.content.title : obj.name;
            const textW = ctx.measureText(text).width;
            const boxW  = textW + padX * 2;
            const boxH  = fontSize + padY * 2;
            const boxX  = labelX - boxW / 2;
            const boxY  = labelY - boxH / 2;

            // Glow effect when near
            if (t > 0.1) {
                ctx.shadowColor = `rgba(255, 180, 60, ${t * 0.7})`;
                ctx.shadowBlur  = t * 18;
            }

            // Background
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(boxX, boxY, boxW, boxH);

            // Border
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(170, 120, 50, ${0.6 + t * 0.4})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            // Text — warm gold, brighter when near
            if (t > 0.1) {
                ctx.shadowColor = `rgba(255, 200, 80, ${t * 0.9})`;
                ctx.shadowBlur  = t * 12;
            }
            const bright = Math.round(185 + t * 70);
            ctx.fillStyle = `rgb(${bright}, ${Math.round(bright * 0.76)}, ${Math.round(bright * 0.35)})`;
            ctx.fillText(text, labelX, labelY + fontSize / 2 - 1);

            ctx.restore();
        }
    },

    // Mobile-only: unified label handler in screen space.
    // On-screen → same behaviour as desktop drawLabels.
    // Off-screen → label sticks to the screen edge at its label-offset position,
    //              smoothly sliding in as the character approaches.
    drawMobileLabels(ctx) {
        if (!Renderer.isMobile) return;

        const NEAR = 180;
        const FAR  = 650;
        const TRANSITION = 120; // screen-px zone where slide-in happens
        const EDGE_PAD   = 6;   // min px from screen border

        const halfW = Renderer.canvas.width  / 2;
        const halfH = Renderer.canvas.height / 2;

        for (const obj of CONFIG.OBJECTS) {
            if (!obj._center) continue;

            // --- same t / hoverProgress logic as drawLabels ---
            const dist  = Math.hypot(Character.x - obj._center.x, Character.y - obj._center.y);
            const tDist = 1 - Math.min(Math.max((dist - NEAR) / (FAR - NEAR), 0), 1);

            const hoverTarget = this._activeObject === obj ? 1 : 0;
            obj._hoverProgress += (hoverTarget - obj._hoverProgress) * 0.12;

            const h = obj._hoverProgress;
            const t = Math.min(tDist + h * 0.5, 1);

            // Normal label world-position (matches drawLabels exactly)
            const off    = obj.labelOffset || { x: 0, y: 0 };
            const worldX = obj._center.x + off.x;
            const worldY = obj._center.y - 50 - t * 15 + off.y;

            // Convert to screen space
            const screenX = worldX - Renderer.cameraX + halfW;
            const screenY = worldY - Renderer.cameraY + halfH;

            // Font sizes needed before clamp (to measure edge-size box)
            const normalFS = Math.round(13 + t * 6 + h * 3);
            const edgeFS   = 8;

            // Pre-measure edge-size box so clamp keeps it fully inside the screen
            const text = obj.content ? obj.content.title : obj.name;
            ctx.font = `${edgeFS}px "Press Start 2P", monospace`;
            const edgeHalfW = (ctx.measureText(text).width + 10 * 2) / 2; // edgePadX=10
            const edgeHalfH = (edgeFS + 6 * 2) / 2;                       // edgePadY=6

            // Clamp center so the edge-size box is fully inside the screen
            const clampX = Math.max(EDGE_PAD + edgeHalfW, Math.min(Renderer.canvas.width  - EDGE_PAD - edgeHalfW, screenX));
            const clampY = Math.max(EDGE_PAD + edgeHalfH, Math.min(Renderer.canvas.height - EDGE_PAD - edgeHalfH, screenY));

            // How far is the label outside the screen?
            const offDist    = Math.hypot(screenX - clampX, screenY - clampY);
            const edgeFactor = Math.min(offDist / TRANSITION, 1); // 0=on-screen, 1=fully off

            // Blend draw position: on-screen pos → clamped edge pos
            const drawX = screenX + (clampX - screenX) * edgeFactor;
            const drawY = screenY + (clampY - screenY) * edgeFactor;

            // Blend font size: normal → small edge size
            const fontSize = Math.round(normalFS + (edgeFS - normalFS) * edgeFactor);

            const padX = Math.round(14 + (10 - 14) * edgeFactor);
            const padY = Math.round(8  + (6  - 8)  * edgeFactor);

            ctx.save();
            ctx.globalAlpha = 0.75 + t * 0.25;
            ctx.font        = `${fontSize}px "Press Start 2P", monospace`;
            ctx.textAlign   = 'center';

            const textW = ctx.measureText(text).width;
            const boxW  = textW + padX * 2;
            const boxH  = fontSize + padY * 2;

            // Glow fades out as label moves to edge
            const glowT = t * (1 - edgeFactor);
            if (glowT > 0.05) {
                ctx.shadowColor = `rgba(255, 180, 60, ${glowT * 0.7})`;
                ctx.shadowBlur  = glowT * 18;
            }

            // Background
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(drawX - boxW / 2, drawY - boxH / 2, boxW, boxH);

            // Border
            ctx.shadowBlur  = 0;
            ctx.strokeStyle = `rgba(170, 120, 50, ${0.6 + t * 0.4})`;
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(drawX - boxW / 2, drawY - boxH / 2, boxW, boxH);

            // Text
            if (glowT > 0.05) {
                ctx.shadowColor = `rgba(255, 200, 80, ${glowT * 0.9})`;
                ctx.shadowBlur  = glowT * 12;
            }
            const bright = Math.round(185 + t * 70);
            ctx.fillStyle = `rgb(${bright}, ${Math.round(bright * 0.76)}, ${Math.round(bright * 0.35)})`;
            ctx.fillText(text, drawX, drawY + fontSize / 2 - 1);

            ctx.restore();
        }
    },

    // Find centroid of a color zone (used for debug labels)
    _getZoneCenter(color) {
        if (!this._pixelData) return null;
        let sumX = 0, sumY = 0, count = 0;
        for (let y = 0; y < this._mapHeight; y += 4) {
            for (let x = 0; x < this._mapWidth; x += 4) {
                const i = (y * this._mapWidth + x) * 4;
                if (this._colorMatch(
                    [this._pixelData[i], this._pixelData[i+1], this._pixelData[i+2]], color
                )) { sumX += x; sumY += y; count++; }
            }
        }
        if (!count) return null;
        return { x: (sumX / count) * (CONFIG.BASE_WIDTH / this._mapWidth),
                 y: (sumY / count) * (CONFIG.BASE_HEIGHT / this._mapHeight) };
    },

    _getObjectAt(worldX, worldY) {
        const xi = Math.floor(worldX * this._mapWidth  / CONFIG.BASE_WIDTH);
        const yi = Math.floor(worldY * this._mapHeight / CONFIG.BASE_HEIGHT);
        if (xi < 0 || xi >= this._mapWidth || yi < 0 || yi >= this._mapHeight) return null;
        const i = (yi * this._mapWidth + xi) * 4;
        const r = this._pixelData[i], g = this._pixelData[i+1], b = this._pixelData[i+2];
        if (r < 20 && g < 20 && b < 20) return null;
        for (const obj of CONFIG.OBJECTS) {
            if (this._colorMatch([r, g, b], obj.color)) return obj;
        }
        return null;
    },

    _colorMatch(pixel, target) {
        return Math.abs(pixel[0] - target[0]) <= this._tolerance &&
               Math.abs(pixel[1] - target[1]) <= this._tolerance &&
               Math.abs(pixel[2] - target[2]) <= this._tolerance;
    },

    _openContent(obj) {
        const content = obj.content || {
            title: obj.name,
            sections: [{ heading: '', text: 'Coming soon...' }]
        };
        Scenes.openContent(content);
    },
};
