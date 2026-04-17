// ===== SCENE MANAGER =====
// Manages the scroll/content modal overlay used by GameObjects and QuickMenu.

const Scenes = {
    init() {
        const backBtn = document.getElementById('article-back');
        backBtn.addEventListener('click', () => this._closeArticle());
        document.getElementById('article-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('article-overlay')) this._closeArticle();
        });
    },

    async openArticle(mdPath) {
        const overlay = document.getElementById('article-overlay');
        const content = document.getElementById('article-content');
        content.innerHTML = '<p>Loading...</p>';
        overlay.classList.add('visible');
        overlay.scrollTop = 0;
        try {
            const res  = await fetch(mdPath);
            const text = await res.text();
            content.innerHTML = marked.parse(text);
        } catch (e) {
            content.innerHTML = '<p>Could not load article.</p>';
        }
    },

    _closeArticle() {
        document.getElementById('article-overlay').classList.remove('visible');
    },

    // Public: open content overlay directly (used by GameObjects & QuickMenu)
    // onClose: optional callback when modal is dismissed
    openContent(content, onClose) {
        this._onItemClick({ label: content.title, content }, onClose);
    },

    // Stub — kept so main.js click/mousemove pipeline compiles without change
    handleClick()     { return false; },
    handleMouseMove() { return false; },

    _onItemClick(item, onClose) {
        if (!item.content) {
            // No content yet — show tooltip
            const tooltip = document.getElementById('tooltip');
            tooltip.innerHTML = `<strong>${item.label}</strong><br>Coming soon...`;
            tooltip.classList.add('visible');
            tooltip.style.left = '50%';
            tooltip.style.top = '80%';
            tooltip.style.transform = 'translateX(-50%)';
            setTimeout(() => {
                tooltip.classList.remove('visible');
                tooltip.style.transform = '';
            }, 2000);
            return;
        }

        // Build scroll content HTML
        const c = item.content;
        let html = `<h2>${c.title}</h2>`;
        if (c.heroName) html += `<div class="scroll-hero-name">${c.heroName}</div>`;
        if (c.subtitle) html += `<div class="scroll-subtitle">${c.subtitle}</div>`;
        for (const section of c.sections) {
            if (section.article) {
                html += `<div class="scroll-section scroll-project">
                    <h3>${section.heading}</h3>
                    ${section.subtitle ? `<div class="scroll-project-subtitle">${section.subtitle}</div>` : ''}
                    ${section.teaser   ? `<p class="scroll-project-teaser">${section.teaser}</p>` : ''}
                    <button class="scroll-read-btn" data-article="${section.article}">Read more</button>
                </div>`;
            } else if (section.type === 'button') {
                html += `<div class="scroll-section scroll-cta-section">
                    <button class="scroll-cta-btn" data-action="${section.action}">${section.label}</button>
                </div>`;
            } else if (section.links) {
                html += `<div class="scroll-section"><h3>${section.heading}</h3><ul class="scroll-links">`;
                for (const link of section.links) {
                    if (link.type === 'copy') {
                        html += `<li><span class="scroll-link-label">${link.label}</span><span class="scroll-copy" data-copy="${link.value}">${link.value}</span></li>`;
                    } else {
                        html += `<li><span class="scroll-link-label">${link.label}</span><a href="${link.url}" target="_blank" rel="noopener">${link.display || link.url}</a></li>`;
                    }
                }
                html += `</ul></div>`;
            } else if (section.items) {
                html += `<div class="scroll-section"><h3>${section.heading}</h3><ul class="scroll-list">`;
                for (const item of section.items) {
                    html += `<li>${item}</li>`;
                }
                html += `</ul></div>`;
            } else {
                html += `<div class="scroll-section"><h3>${section.heading}</h3><p>${section.text}</p></div>`;
            }
        }

        const contentEl = document.getElementById('scroll-content');
        contentEl.innerHTML = html;

        const overlay = document.getElementById('scroll-overlay');
        overlay.classList.add('visible');

        // Copy-on-click for contacts
        contentEl.querySelectorAll('.scroll-copy').forEach(el => {
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.dataset.copy).then(() => {
                    const orig = el.textContent;
                    el.textContent = '✓ Copied!';
                    el.classList.add('copied');
                    setTimeout(() => {
                        el.textContent = orig;
                        el.classList.remove('copied');
                    }, 1500);
                });
            });
        });

        // Close handler
        const closeBtn = document.getElementById('scroll-close');
        const closeHandler = () => {
            overlay.classList.remove('visible');
            closeBtn.removeEventListener('click', closeHandler);
            overlay.removeEventListener('click', bgClickHandler);
            if (onClose) onClose();
        };
        const bgClickHandler = (e) => {
            if (e.target === overlay) closeHandler();
        };
        closeBtn.addEventListener('click', closeHandler);
        overlay.addEventListener('click', bgClickHandler);

        // Read more → open article overlay
        contentEl.querySelectorAll('.scroll-read-btn[data-article]').forEach(btn => {
            btn.addEventListener('click', () => this.openArticle(btn.dataset.article));
        });

        // CTA button → close modal + open quick menu
        const ctaBtn = contentEl.querySelector('.scroll-cta-btn[data-action="quickmenu"]');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                closeHandler();
                setTimeout(() => QuickMenu._open(), 50);
            });
        }
    },

};
