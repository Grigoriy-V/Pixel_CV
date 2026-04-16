// ===== QUICK MENU =====
// Fixed button (bottom-right) → opens list of all portfolio sections.
// Clicking an item opens the same scroll modal as the in-world objects.

const QuickMenu = {
    init() {
        const btn     = document.getElementById('quick-menu-btn');
        const overlay = document.getElementById('quick-menu-overlay');
        const closeBtn = document.getElementById('quick-menu-close');
        const list    = document.getElementById('quick-menu-list');

        // Build list from CONFIG.OBJECTS
        for (const obj of CONFIG.OBJECTS) {
            if (!obj.content) continue;
            const item = document.createElement('button');
            item.className = 'quick-menu-item';
            item.innerHTML = `${obj.content.title}
                <span class="item-subtitle">${obj.content.subtitle || obj.name}</span>`;
            item.addEventListener('click', () => {
                this._close();
                Scenes.openContent(obj.content, () => this._open());
            });
            list.appendChild(item);
        }

        // Toggle open
        btn.addEventListener('click', () => overlay.classList.add('visible'));

        // Close button
        closeBtn.addEventListener('click', () => this._close());

        // Click outside parchment
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this._close();
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._close();
        });
    },

    _open() {
        document.getElementById('quick-menu-overlay').classList.add('visible');
    },

    _close() {
        document.getElementById('quick-menu-overlay').classList.remove('visible');
    },
};
