// ===== GAME CONFIGURATION =====

const CONFIG = {
    // Base image dimensions (art-space)
    BASE_WIDTH: 2560,
    BASE_HEIGHT: 1440,

    // Walkmap tile size for pathfinding grid
    TILE_SIZE: 8,

    // Character settings
    CHARACTER: {
        spriteSheet:     'assets/sprites/dev/anim/spritesheet-css/spritesheet.png',      // side/front walk (faces right)
        backSpriteSheet: 'assets/sprites/dev/anim/back/spritesheet-css/spritesheet.png', // back walk (faces right)
        cols: 15,        // total walk animation frames
        rows: 1,         // directions (1 for now — mirrored for left)
        sheetCols: 4,    // columns in the spritesheet grid
        sheetRows: 4,    // rows in the spritesheet grid (last cell empty)
        drawWidth: 170,
        drawHeight: 170,
        speed: 430,
        idleSprite:     'assets/sprites/dev/anim/idle_test_2.png',
        backIdleSprite: 'assets/sprites/dev/anim/back/idle_2_nobg.png',
        frameDuration: 60, // ms per frame (~15fps walk cycle)
        startX: 1728,
        startY: 1164,
    },

    // Sprite animations overlaid on the base image
    ANIMATIONS: [],

    // Fountain glow effect (programmatic, no sprite)
    FOUNTAIN: {
        x: 660,
        y: 370,
        baseRadius: 50,
        pulseAmount: 15,
        pulseSpeed: 0.002,
        color: { r: 80, g: 180, b: 255 },
        opacity: 0.25,
    },

    // Interactive objects — matched by pixel color on the interaction map
    OBJECTS: [
        {
            id: 'table', name: 'About Me', color: [0, 255, 0], labelOffset: { x: -15, y: -75 },
            content: {
                title: 'About Me',
                heroName: 'Grigoriy Voyakin',
                subtitle: 'AI Product Engineer',
                sections: [
                    {
                        heading: 'Hello',
                        text: 'AI Product Engineer with a background in film, advertising, automation, and hands-on AI product development.\n\nI work across the full path from idea to implementation: researching new AI approaches, shaping UX and product flows, building prototypes, and shipping end-to-end solutions.\n\nStrongest in fast-moving environments with high uncertainty — quickly understanding what is worth building, simplifying complexity, and turning it into a working product experience.'
                    },
                    {
                        heading: 'Contacts & Links',
                        links: [
                            { label: 'Email',    value: 'grigoriyvoyakinwork@gmail.com', type: 'copy' },
                            { label: 'Phone',    value: '+7 913 529 8090',               type: 'copy' },
                            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/grigoriy-voyakin-63400b155', display: 'linkedin/grigoriy-voyakin', type: 'link' },
                            { label: 'Telegram', url: 'https://t.me/GRIGORIY_VOYAKIN',                        display: 't.me/GRIGORIY_VOYAKIN',    type: 'link' },
                            { label: 'Geni AI',  url: 'https://t.me/geni_ai_bot',                display: 'Try the bot →',           type: 'link' },
                        ]
                    },
                    {
                        heading: 'Education & Language',
                        text: 'B.Sc. Software Engineering\nSiberian State Aerospace University\n2016 — 2020\n\nEnglish: B2  •  Russian: Native'
                    },
                    {
                        type: 'button',
                        label: "Short on time? → Full overview",
                        action: 'quickmenu'
                    }
                ]
            }
        },
        {
            id: 'board', name: 'Доска', color: [255, 0, 0], labelOffset: { x: -60, y: -110 },
            content: {
                title: 'Core Skills',
                subtitle: 'What I work with',
                sections: [
                    {
                        heading: 'Programming & Integration',
                        text: 'Python  •  React  •  Next.js  •  Vite\nSQL / PostgreSQL  •  Git\nAPI Integrations  •  Webhooks'
                    },
                    {
                        heading: 'Applied AI & Prototyping',
                        text: 'Generative AI  •  LLM Applications\nPrompt Engineering  •  RAG Workflows\nComputer Vision  •  MediaPipe  •  ComfyUI\nAI Workflow Automation  •  Rapid Prototyping'
                    },
                    {
                        heading: 'Product & Frontend',
                        text: 'AI Product Development  •  Product Prototyping\nTelegram Bot / WebApp  •  Frontend Dev\nUX / Product Flows  •  Analytics  •  Figma'
                    },
                    {
                        heading: 'Infrastructure & Deployment',
                        text: 'Docker  •  Supabase  •  n8n  •  RunPod\nCloudflare Pages  •  Vercel\nServerless Deployment  •  VPS / Self-Hosting'
                    },
                    {
                        heading: 'AI Developer Tools',
                        text: 'Cursor  •  Claude Code  •  Codex  •  MCP'
                    },
                ]
            }
        },
        {
            id: 'books', name: 'Книги', color: [255, 0, 255], labelOffset: { x: 0, y: -125 },
            content: {
                title: 'Experience',
                subtitle: '7+ years across AI, VFX & product',
                sections: [
                    {
                        heading: 'Founder / Product Builder',
                        text: 'Geni AI  •  2025 — Present\n\n• Building a WebApp-first AI product inside Telegram, owning product direction, UX and user flows, frontend implementation, backend workflows, infrastructure, self-hosting, and deployment.\n• Designed and shipped AI-powered scenarios, prompt-library workflows, publishing and analytics systems, pricing logic, and operational tooling using React, n8n, Supabase, Cloudflare Pages, Vercel, Docker, and self-hosted services.\n• Worked end-to-end from idea to live product: exploring new AI capabilities, turning them into usable flows, and iterating on UX, retention, and monetization based on real usage.\n• Combined technical execution with product thinking, balancing feasibility, UX clarity, speed of delivery, and business constraints in a fast-moving environment.'
                    },
                    {
                        heading: 'AI Technical Artist / Gen AI Dev',
                        text: 'Prequel  •  07.2025 — 10.2025\n\n• Researched and evaluated image-generation models, workflows, and product-oriented use cases for rapid experimentation and practical application.\n• Built and iterated ComfyUI-based pipelines for repeatable generative tasks, balancing quality, speed, control, and operational constraints.\n• Developed custom nodes and computer-vision workflows using MediaPipe for specific product needs and image-processing scenarios.\n• Worked with RunPod GPU environments, serverless endpoints, and LoRA training to support applied generative AI development.'
                    },
                    {
                        heading: 'AI Engineer / ML Researcher',
                        text: 'Assetub Inc  •  08.2024 — 03.2025\n\n• Built RAG and LLM-assisted workflows with Python, SQL, Docker, and Hugging Face tooling for domain-specific search, QA, and internal knowledge-access scenarios.\n• Prototyped AI-assisted tools and automation that turned open-ended ideas into usable features and reduced manual work across production pipelines.\n• Worked with computer-vision-based image-processing workflows and deployed inference and serverless endpoints on RunPod for rapid experimentation.\n• Operated in an MVP-oriented environment: validating ideas in code, surfacing practical constraints early, and iterating toward production-ready directions.'
                    },
                    {
                        heading: 'Pipeline Artist / TD / Senior FX',
                        text: 'CGF / Chemistry Film  •  03.2019 — 08.2024\n\n• Developed tools and automation workflows that improved pipeline efficiency, shortened production cycles, and reduced manual overhead across production environments.\n• Led technical problem-solving across complex production tasks, translating ambiguous needs into practical tools and repeatable workflows.\n• Professional background includes work in film and advertising, including award-recognized commercial production.'
                    },
                ]
            }
        },
        {
            id: 'alchemy', name: 'Алхим. стол', color: [255, 255, 0], labelOffset: { x: -10, y: -75 },
            content: {
                title: 'Projects',
                subtitle: 'Things I built',
                sections: [
                    {
                        heading: 'Pixel CV',
                        subtitle: 'Interactive resume',
                        teaser: 'This project is an expanded take on a classic CV — built as a small interactive world. It works as a portfolio, a project showcase, and an experiment with a more game-like way of presenting yourself.',
                        article: 'projects/pixel_cv.md',
                    },
                    {
                        heading: 'Geni AI',
                        text: 'Coming soon...'
                    },
                    {
                        heading: 'Content Factory',
                        text: 'Coming soon...'
                    },
                    {
                        heading: 'Second Brain',
                        text: 'Coming soon...'
                    },
                ]
            }
        },
        {
            id: 'telescope', name: 'Телескоп', color: [0, 0, 255], labelOffset: { x: -100, y: -55 },
            content: {
                title: "Where I'm Heading",
                subtitle: 'Looking ahead',
                sections: [
                    {
                        heading: 'Focus',
                        text: "I'm currently working on AI products, content automation systems, and user journey flows. What drives me is how people interact with a product — finding the most direct and frictionless path to the result, removing everything unnecessary. I'm not only interested in writing code or working with AI models, but in thinking about what new possibilities technology opens up today and how those can be turned into real products. I like looking at a product as a whole system."
                    },
                    {
                        heading: 'Open to',
                        items: [
                            'AI Product Engineer',
                            'Generative AI',
                            'AI Solutions Engineer',
                            'Product Engineer',
                            'AI Product Manager / Product Manager',
                        ]
                    },
                    {
                        heading: '',
                        text: 'Open to roles at the intersection of AI, product, and systems thinking — where it matters not only to build solutions, but to shape direction, logic, and the user journey. Most excited about work where emerging technology can be turned into real, useful products.'
                    },
                ]
            }
        },
    ],

    // Depth masks — full-size PNGs (BASE_WIDTH x BASE_HEIGHT)
    // groundY: auto-computed from bottom white pixel, or set manually to override
    MASKS: [
        { src: 'assets/maks_2/1.png' },
        { src: 'assets/maks_2/2.png' },
        { src: 'assets/maks_2/3.png' },
        { src: 'assets/maks_2/4.png' },
        { src: 'assets/maks_2/5.png', groundY: -50 },
    ],

    // Walkmap color thresholds
    WALKMAP_COLORS: {
        THRESHOLD: 100,
    },
};
