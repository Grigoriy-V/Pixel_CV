// ===== SPRITE ANIMATIONS =====

const Animations = {
    instances: [],
    spriteCache: new Map(),

    init(images) {
        this.instances = [];
        for (const animConfig of CONFIG.ANIMATIONS) {
            const img = images[animConfig.spriteSheet];
            if (!img) continue;

            let processedImg = img;
            const bgMode = animConfig.removeWhiteBg ? 'white' : animConfig.removeBlackBg ? 'black' : null;
            const cacheKey = animConfig.spriteSheet + (bgMode ? '_no' + bgMode : '');
            if (this.spriteCache.has(cacheKey)) {
                processedImg = this.spriteCache.get(cacheKey);
            } else if (bgMode) {
                processedImg = bgMode === 'white' ? this._removeWhiteBg(img) : this._removeBlackBg(img);
                this.spriteCache.set(cacheKey, processedImg);
            }

            this.instances.push({
                config: animConfig,
                img: processedImg,
                frameW: Math.floor(img.width / animConfig.cols),
                frameH: Math.floor(img.height / (animConfig.rows || 1)),
                currentFrame: Math.floor(Math.random() * animConfig.cols),
                lastFrameTime: 0,
            });
        }
    },

    update(timestamp) {
        for (const anim of this.instances) {
            if (timestamp - anim.lastFrameTime >= anim.config.frameDuration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.config.cols;
                anim.lastFrameTime = timestamp;
            }
        }
    },

    draw(ctx, timestamp) {
        this.update(timestamp);

        for (const anim of this.instances) {
            const srcX = anim.currentFrame * anim.frameW;
            const srcY = 0;

            const prevComposite = ctx.globalCompositeOperation;
            if (anim.config.blendMode) {
                ctx.globalCompositeOperation = anim.config.blendMode;
            }

            ctx.drawImage(
                anim.img,
                srcX, srcY, anim.frameW, anim.frameH,
                anim.config.x - anim.config.drawWidth / 2,
                anim.config.y - anim.config.drawHeight / 2,
                anim.config.drawWidth,
                anim.config.drawHeight
            );

            if (anim.config.blendMode) {
                ctx.globalCompositeOperation = prevComposite;
            }
        }
    },

    _removeBlackBg(img) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cctx = c.getContext('2d');
        cctx.drawImage(img, 0, 0);
        const imageData = cctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
            if (brightness < 30) {
                d[i + 3] = 0;
            } else if (brightness < 60) {
                d[i + 3] = Math.floor(d[i + 3] * 0.3);
            }
        }
        cctx.putImageData(imageData, 0, 0);
        return c;
    },

    _removeWhiteBg(img) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cctx = c.getContext('2d');
        cctx.drawImage(img, 0, 0);
        const imageData = cctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) {
                d[i + 3] = 0;
            } else if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) {
                d[i + 3] = Math.floor(d[i + 3] * 0.3);
            }
        }
        cctx.putImageData(imageData, 0, 0);
        return c;
    },
};

// ===== FOUNTAIN GLOW EFFECT =====

const FountainGlow = {
    draw(ctx, timestamp) {
        const f = CONFIG.FOUNTAIN;
        const pulse = Math.sin(timestamp * f.pulseSpeed);
        const radius = f.baseRadius + pulse * f.pulseAmount;
        const alpha = f.opacity + pulse * 0.1;

        const prevComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'screen';

        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
        gradient.addColorStop(0, `rgba(${f.color.r}, ${f.color.g}, ${f.color.b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${f.color.r}, ${f.color.g}, ${f.color.b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(f.x, f.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = prevComposite;
    },
};
