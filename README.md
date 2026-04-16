# Pixel Town

Browser pixel-art adventure game built with HTML5 Canvas. Explore a medieval fantasy town, visit buildings, and discover interactive scrolls with documentation about Claude Code features.

## Quick Start

1. Clone the repository:
```bash
git clone git@github.com:artanov/pixel_castle.git
cd pixel_castle
```

2. Start a local web server:
```bash
python -m http.server 8080
```

3. Open in browser:
```
http://localhost:8080
```

## Controls

- **Click** on the map to move the character
- **Click** on a building to walk to its entrance
- **Click again** on the building to enter the interior
- **Click** on scrolls inside buildings to read content
- **D** key toggles debug mode (shows walkmap, hitboxes, pathfinding)

## Project Structure

```
├── index.html              # Entry point
├── css/style.css            # Styles
├── js/
│   ├── config.js            # Game configuration
│   ├── main.js              # Game loop & initialization
│   ├── renderer.js          # Canvas rendering & scaling
│   ├── walkmap.js           # Walkability grid
│   ├── pathfinder.js        # A* pathfinding
│   ├── character.js         # Character movement & animation
│   ├── animations.js        # Sprite animations (torches, fountain)
│   ├── interactions.js      # Building click interactions
│   └── scenes.js            # Interior scenes & scroll system
└── assets/
    ├── town-base.png        # Town background
    ├── town-walkmap.png     # Walkability map
    ├── torch-map.png        # Torch placement map
    ├── sprites/             # Sprite sheets
    └── interiors/           # Building interior backgrounds
```

## Requirements

- Any modern browser with HTML5 Canvas support
- Python 3 (for local server) or any static file server
