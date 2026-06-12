# LinkedOut

> *Every decision creates a new timeline. Meet the people you could have become.*

LinkedOut is an AI-powered narrative experience that transforms your career profile into the origin story of six alternate versions of yourself across radically different universes. Upload your career profile — receive six lives you never lived.

---

## What It Does

You upload your career profile. LinkedOut reads it, extracts your Career DNA — your strengths, archetypes, personality, and achievements — and generates six fully realized alternate selves, each native to a different world. Not re-skinned versions of your job. Different lives entirely.

| Universe | Tone |
|----------|------|
| 🏰 **Medieval Kingdom** | Feudal courts, guild oaths, heraldic legacy |
| 🌃 **Neon Synthesis** | Cyberpunk megacity, digital identity, augmented self |
| ☠️ **Endless Seas** | Pirate fleets, salt-wind reputation, hard-won freedom |
| 🐉 **Ancient Draconia** | Elemental magic, draconic power, centuries of mastery |
| 🚀 **Cosmic Frontier** | Starfaring civilization, quantum exploration, post-Earth |
| 🧛 **Eternal Night** | Immortal courts, gothic aristocracy, memory as currency |

---

## Journey Phases

### Phase 1 — Explore Your Selves
Six profile cards reveal who you could have become. Each alternate self has a universe-native name (gothic transformations for Eternal Night, sharp-consonant cosmic names for Cosmic Frontier, epithet-based names for Endless Seas), profession, biography, achievements, and competencies — all written in the voice and language of their world.

### Phase 2 — Go Deeper
- **Future Transmission** — Chat directly with your future self. They remember the conversation, have opinions, and evolve.
- **Butterfly Effect** — Choose a pivotal life decision. Watch the timeline recalculate.
- **Multiverse Invitations** — Receive in-world job offers written as native documents (royal proclamations, corporate contracts, stone tablets).
- **Legendary Self** — The greatest version of you across all timelines.
- **Villain Self** — The darkest path your strengths could have taken.
- **Council of Selves** — All six versions of you in conversation.

### Phase 3 — The Multiversal Chronicle
A physical book — complete with animated hard-cover page flip — containing your full multiverse story. Spring-physics cover, chapter-by-chapter narrative, downloadable archive.

---

## Universe-Native Naming System

Each universe has its own naming law enforced at the prompt level:

- **Medieval** — Title matches gender (Lady/Dame/Mistress vs Lord/Sir/Master), name transformed to period phonetics, heraldic surname invented from deed or craft
- **Endless Seas** — Format: `[Rank] [Name] "[Epithet]" [Surname]` — rank closest to real profession (Musician for artists, Navigator for analysts, Helmsman for engineers…), epithet invented fresh from the user's specific legend
- **Cosmic Frontier** — Sharp consonants (X, Z, V, K), sleek future spin on real name or fully cosmic invention
- **Eternal Night** — Gothic/Eastern European transformation of real name (Alex → Alaric, Sofia → Seraphel), Latin/Romanian dark surname
- **Ancient Draconia** — Valyrian-style transformation (Elena → Elhaena, Marcus → Maerys), House name from elemental roots

---

## Tech Stack

- **Next.js 15** (App Router, `"use client"`)
- **TypeScript**
- **Framer Motion** — Spring physics, `useMotionValue`, `useMotionTemplate`, cinematic transitions
- **Three.js + @react-three/fiber + @react-three/drei** — Stars background on landing
- **GSAP** — Spiral animation on loading screen
- **react-pageflip** — Chronicle book with custom spring cover overlay
- **Recharts** — Timeline visualizations
- **pdfjs-dist** — Career profile PDF parsing
- **Anthropic SDK** — All AI generation (Claude)
- **Tailwind CSS v3**

---

## AI Architecture

```
PDF → pdfjs-dist → Text Extraction
                        ↓
              Anthropic: analyze-resume
              → ResumeAnalysis (Career DNA, timelineSignature, pronouns, skills, personality)
                        ↓
              Anthropic: generate-profile (×6 universes, parallel)
              → AlternateProfile (name, profession, worldName, eraName, biography, achievements)
                        ↓
              Anthropic: generate-future-self
              → FutureSelf (memories, philosophy, regrets, lessons — all in-world language)
                        ↓
              Anthropic: future-transmission (chat)
              → Conversational future self with timeline stability awareness
                        ↓
              Anthropic: generate-chronicle
              → Full narrative book (prologue, chapters, epilogue)
```

### Prompt Engineering Highlights
- **Career DNA extraction** — Role archetype (Builder, Connector, Explorer) drives world-native profession, never a literal re-skin
- **World independence** — `worldName` / `eraName` / `worldDescription` are built like a cartographer naming a real place, never derived from the user's career
- **Universe immersion** — All achievements and competencies written in period-appropriate language; modern vocabulary banned in non-tech universes
- **Gender-aware titles** — Pronouns from career profile drive title selection throughout all universes
- **Epithet invention** — Pirate epithets coined fresh from each user's specific profile, never picked from a preset list

---

## Key Screens

| Screen | What it does |
|--------|-------------|
| `Landing.tsx` | Aurora radial-gradient background cycling via `useMotionValue`, Three.js star field, animated CTA buttons |
| `TimelineScan.tsx` | GSAP spiral animation, step-by-step generation progress |
| `MultiverseCalibration.tsx` | Six universe orbs building in sequence |
| `UniverseDiscovery.tsx` | Profile card grid — flip to explore each universe |
| `IdentityReconstruction.tsx` | Full alternate profile with biography, achievements, competencies, timeline |
| `FutureTransmission.tsx` | Chat interface with future self, timeline stability bar, villain intercepts |
| `ButterflyEffect.tsx` | Decision branch visualization |
| `MultiverseInvitations.tsx` | Universe-native job postings (parchment scroll, neon terminal, ship's log…) |
| `Chronicle.tsx` | Spring-physics hardcover flip book, edition system, downloadable archive |
| `CouncilOfSelves.tsx` | All six selves in conversation |

### Universe Arrival Cards
Each universe has a custom arrival modal with its own material and attitude:
- **Medieval** — Parchment scroll with wooden rollers, wax seal to break
- **Cyberpunk** — Boot-from-black terminal with typewriter lines and scan sweep
- **Endless Seas** — Weathered ship's log on aged paper, skull & crossbones cover, *"The sea does not ask if you are ready"*
- **Dragon** — Carved stone tablet, ember particles, glowing rune
- **Galactic** — Static-to-signal entrance, twinkling star field, interstellar transmission
- **Vampire** — Moonlit manuscript, silver dust motes, word-by-word whisper reveal

---

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key

### Installation

```bash
git clone https://github.com/anitohlm/linkedout.git
cd linkedout
npm install

cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze-resume/
│       ├── generate-profile/       # Agent 2: Character builder
│       ├── generate-future-self/   # Agent 3: Future self narrator
│       ├── future-transmission/    # Chat with future self
│       ├── butterfly-effect/
│       ├── generate-chronicle/
│       ├── generate-legendary/
│       ├── generate-villain/
│       ├── generate-recruiter/     # Universe-native job postings
│       ├── council-response/
│       └── shadow-intercept/       # Villain intercepts
├── components/
│   ├── AppOrchestrator.tsx         # Central state machine
│   ├── UniverseArrivalModal.tsx    # Per-universe arrival cards
│   ├── screens/                    # All journey screens
│   └── ui/
│       ├── aurora-stars.tsx        # Three.js star field
│       └── spiral-animation.tsx    # GSAP spiral loader
├── lib/
│   ├── agents/
│   │   ├── prompts.ts              # Universe identity guides + naming laws
│   │   ├── useAgents.ts
│   │   └── foundry.ts
│   ├── universes.ts
│   ├── historian.ts                # Event logging
│   └── voices.ts
└── types/
    └── index.ts
```

---

## Design Language

- **Base** — `#0a0a0a` near-black, dark glassmorphism
- **Aurora Landing** — Radial gradient cycling through `#7c6ef7 → #4ecdc4 → #e8c97e → #9d4edd`
- **Universe accent colors** — Medieval gold, Cyberpunk teal, Pirate coral, Dragon amber, Galactic violet, Vampire rose
- **Motion** — Spring physics (`stiffness: 50, damping: 14`) for the Chronicle cover; `ease: [0.22, 1, 0.36, 1]` for cinematic entrances
- **Typography** — Cinzel (medieval/vampire headings), Crimson Pro (serif body), Sora / Exo 2 (sci-fi), Share Tech Mono (cyberpunk terminal)

---

## License

Proprietary

## Author

[@anitohlm](https://github.com/anitohlm/linkedout)

---

*Every decision creates a new timeline. Meet the people you could have become.*
