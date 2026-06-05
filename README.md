# LinkedOut — Agents League Hackathon

A narrative RPG powered by AI where your resume becomes the origin story of six alternate versions of yourself across the multiverse.

## 🌌 Core Concept

LinkedOut combines LinkedIn, Spotify Wrapped, Disco Elysium, Life is Strange, Detroit: Become Human, and Character.AI into a premium, venture-backed product experience.

Users upload their resume and explore six alternate-universe identities:
- 🏰 Medieval Kingdom
- 🌃 Cyberpunk Neon
- ☠️ Pirate Seas
- 🐉 Dragon's Draconia
- 🚀 Galactic Frontier
- 🧛 Eternal Night

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Recharts** (timeline visualizations)
- **Anthropic SDK** (AI generation)
- **pdfjs-dist** (resume parsing)

## 📋 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── AppOrchestrator.tsx   # State machine orchestrator
│   └── screens/
│       ├── Landing.tsx       # Welcome screen
│       ├── ResumeUpload.tsx  # PDF upload
│       ├── TimelineScan.tsx  # Timeline scan animation
│       └── [more screens...]
├── lib/
│   └── universes.ts          # Universe configurations
├── types/
│   └── index.ts              # Core type definitions
└── api/
    └── [route handlers...]
```

## 🎮 Journey Stages

1. **Landing** — Hero section & call-to-action
2. **Upload Resume** — PDF drag-and-drop
3. **Timeline Scan** — Cinematic analysis animation
4. **Multiverse Calibration** — Loading sequence
5. **Universe Discovery** — Select universe to explore
6. **Identity Reconstruction** — Generate alternate profile
7. **Profile** — View alternate self details
8. **Future Transmission** — Chat with future self
9. **Butterfly Effect** — Modify life decisions
10. **Multiverse Invitations** — Faction opportunities
11. **Legendary Self** — Greatest version of you
12. **Villain Self** — Dark counterpart
13. **Council of Selves** — All versions speak
14. **Share Card** — Shareable social card

## 🔑 Key Features

### Resume Analysis
- Extract skills, competencies, achievements
- Generate `timelineSignature` seed for universe consistency
- Calculate seniority level & personality indicators

### AI Identity Generation
- Anthropic API generates believable alternate profiles
- Universe-specific names, professions, biographies
- Timeline-consistent career trajectories

### Future Transmission Chatbot
- Persistent memory across conversations
- Evolving relationship scores
- Timeline stability awareness
- Villain intercepts at low stability

### Temporal Mechanics
- Timeline Stability system (0-100)
- Butterfly Effect decisions alter reality
- Council of Selves interaction

## 🛠 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/anitohlm/linkedout.git
cd linkedout

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Configuration Files

- `tsconfig.json` — TypeScript configuration
- `tailwind.config.ts` — Tailwind CSS theme & plugins
- `next.config.ts` — Next.js build & webpack config
- `postcss.config.mjs` — PostCSS plugins

## 🎨 Design Language

- **Dark Mode** — `#0a0a0a` base
- **Glassmorphism** — Frosted glass UI components
- **Holographic Gradients** — Purple → Blue → Violet
- **Particle Effects** — Subtle animated backgrounds
- **Premium Motion** — Framer Motion transitions
- **Typography** — System fonts with text gradients

## 🧠 AI Architecture

### Resume Parsing
```
PDF → pdfjs-dist → Text Extraction → Anthropic Analysis → ResumeAnalysis
```

### Universe Generation
```
ResumeAnalysis + timelineSignature → Anthropic Prompt → AlternateProfile
```

### Future Self Conversations
```
User Message → Resume Context → Anthropic Chat → Future Self Response
```

## 🎬 Animation Strategy

- **Cinematic Transitions** — 600ms fade + state change
- **Scroll-aware Effects** — Parallax & reveal animations
- **Interactive Hover States** — Glassmorphic depth
- **Persistent Animations** — Particle backgrounds, floating elements

## 📦 API Routes (To Be Implemented)

- `POST /api/analyze-resume` — Parse & analyze PDF
- `POST /api/generate-profile` — Create alternate profile
- `POST /api/future-transmission` — Chat with future self
- `POST /api/butterfly-effect` — Recalculate timeline
- `POST /api/generate-share-card` — Create social card

## 🚢 Deployment

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or your hosting provider.

## 📊 Demo Day Checklist

- [ ] Resume upload & parsing working
- [ ] All 6 universes generate profiles
- [ ] Future Transmission chatbot functional
- [ ] Timeline Stability system working
- [ ] Share cards generate & shareable
- [ ] Mobile responsive
- [ ] Performance optimized (LCP < 2.5s)
- [ ] Accessibility (WCAG 2.1 AA)

## 🎯 Future Enhancements

- Social sharing integration
- User accounts & timeline history
- Multiplayer Council mode
- VR/AR experiences
- Mobile app (React Native)
- Voice messages from future selves
- LinkedIn data integration
- Career opportunity marketplace

## 📝 License

Proprietary — Agents League Hackathon Project

## 👤 Author

Created for Agents League Hackathon (Creative Challenge)

---

**Every decision creates a new timeline. Meet the people you could have become.**
