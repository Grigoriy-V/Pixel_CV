# Pixel CV — Interactive Portfolio

A pixel-art portfolio built with vanilla HTML5 Canvas. Explore a medieval fantasy town and interact with objects to learn about the author.

**Live demo:** https://grigoriy-v.github.io/Pixel_CV/

## How it works

Walk around the town and approach interactive objects — a label appears above each one. Click an object (or its label) to open a content card with information. A **Fast Overview** button in the corner lets you jump directly to any section.

## Controls

| Input | Action |
|---|---|
| Click / Tap | Move character |
| Click object or label | Open content card |
| Fast Overview button | Jump to any section |
| **D** key | Toggle debug overlay (dev) |

## Sections

1. **About Me** — table
2. **Core Skills** — board
3. **Experience** — books
4. **Projects** — alchemy table
5. **Where I'm Heading** — telescope

## Project Structure

```
├── index.html
├── css/style.css
├── js/
│   ├── config.js        # All content, object definitions, character settings
│   ├── main.js          # Game loop & event handling
│   ├── renderer.js      # Canvas scaling, mobile camera follow
│   ├── walkmap.js       # Walkability grid
│   ├── pathfinder.js    # A* pathfinding
│   ├── character.js     # Movement & sprite animation
│   ├── animations.js    # Ambient animations (torches, fountain)
│   ├── masks.js         # Depth masks for layering
│   ├── objects.js       # Interactive objects & label rendering
│   ├── scenes.js        # Content modal system
│   └── quickmenu.js     # Fast Overview panel
└── assets/
    ├── v1/              # Background and walkmap images
    └── ...              # Sprite sheets, masks
```

## Local Development

```bash
git clone https://github.com/Grigoriy-V/Pixel_CV.git
cd Pixel_CV
python -m http.server 8080
# open http://localhost:8080
```

## Mobile

Fully playable on mobile. The viewport follows the character (750 art-px wide), and off-screen object labels slide in from the nearest edge.

## Contact

Telegram: https://t.me/GRIGORIY_VOYAKIN
