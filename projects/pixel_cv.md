# Pixel CV

## 1. Introduction

I wanted to make something more than another standard portfolio — a more alive and memorable way of presenting myself. The idea was to turn a resume into a small interactive space that already says something about my approach, taste, and the kind of projects I find interesting.

Pixel CV was conceived as an expanded take on a classic CV and, at the same time, a showcase for my projects. Instead of a dry list of sections — a small pixel-art location where each object is tied to a specific topic: experience, skills, projects, or the direction I want to move toward. Getting to know my work happens not through scrolling a page, but through exploring a space.

For me this was a way to bring several things together: a love for game-like interfaces, an interest in visual presentation, and a desire to show not just the result, but the approach behind building products. At its core this isn't just a site about me — it's a small interactive experience.

## 2. How it was made

Work on the visuals didn't start with the final art — it started with finding the right mood. I needed something light, warm, and adventurous — somewhere between a game location and a project showcase. From there the scene was assembled around a simple structure: a center, key zones, and a movement path.
<img src="projects/images/pixel_cv/Shema.jpg" style="width: 40%">

After that came iterations through AI generation. I cycled through compositions, lighting, scale, and content, gradually moving toward the right sense of space. A few early versions I want to show separately in the article so the path and different scene variations are visible.
<div class="img-row">
  <img src="projects/images/pixel_cv/1.jpg">
  <img src="projects/images/pixel_cv/3.jpg">
  <img src="projects/images/pixel_cv/4.jpg">
</div>

The final base art was also refined by hand: I removed unnecessary details and adjusted the composition. For example, in one version I widened the staircase zone and made the table area more compact so the scene worked better as a unified hub. The main generation tools were Nano Banana 2 and Nano Banana Pro. Pro worked better for me: in pixel art its textures are noticeably cleaner and materials read more clearly.
<img src="projects/images/pixel_cv/5.jpg" style="width: 60%">

The character and animation were a separate challenge. I first tried generating sprite sheets directly in Nano Banana — that didn't work. Then I tried generating individual movement frames, but the model kept mixing up left and right sides and couldn't hold the logic of a walk cycle. The solution that worked was a different approach: the character, idle versions, and initial keyframes were made in Nano Banana, then I moved to generating a loop animation in Kling. After that I manually assembled a full 16-frame animation from a single cycle.
<div class="img-row">
  <img src="projects/images/pixel_cv/6.png">
  <img src="projects/images/pixel_cv/7.png">
  <img src="projects/images/pixel_cv/8.png">
</div>

In the end, AI here wasn't used as an automatic "make it done" button — it was a tool for finding form and speeding up production. The result came together from a combination of generation, selection, targeted manual refinement, and several shifts in approach along the way.

## 3. Technical details

The project is written in plain JavaScript with no frameworks — just HTML5 Canvas, CSS, and vanilla JS. No runtime dependencies apart from a font and a library for rendering articles.

**Rendering and architecture**

The scene is drawn on a 2560×1440 Canvas with CSS scaling to fit the screen. Depth is handled through a mask system: the character passes behind objects via layers that cover it at the right moment. The entire game loop runs on `requestAnimationFrame` with a fixed `deltaTime`.
<div class="img-row">
  <img src="projects/images/pixel_cv/9.jpg">
  <img src="projects/images/pixel_cv/10.png">
  <img src="projects/images/pixel_cv/11.jpg">
</div>

**Movement**

Movement is built on A\* pathfinding over a walkability map (walkmap). The map is a separate image where the pixel color defines the surface type. The character smoothly interpolates its position along the found path.

**Mobile**

On mobile devices the canvas is resized to fit the screen width (750 art-px), and the camera follows the character with lerp smoothing. Object labels that go off-screen snap to the edge and slide in smoothly as the character approaches.

**Tools used**

- **Nano Banana 2 / Pro** — pixel-art location and character generation
- **Kling** — character loop animation generation
- **Claude** — code writing and iteration (primary development tool)
- **GitHub Pages** — hosting
