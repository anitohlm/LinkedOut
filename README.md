# LinkedOut

> *You made your choices. But somewhere, across six other worlds, someone with your exact mind made different ones.*
> *LinkedOut finds them.*
>
> **You have been linkedout.**

---

Demo Video: [https://youtu.be/61vVO_7Prtc](https://youtu.be/61vVO_7Prtc)

---

LinkedOut is an AI-powered multiverse game where you upload your career profile and discover six alternate versions of yourself — a medieval knight, a cyberpunk ghost, a pirate captain, a dragon lord, a space pioneer, an immortal vampire — each one built from your actual Career DNA. From there, you open a live transmission and talk directly to your future self, watching the **Timeline Stability** meter rise and fall with every exchange — until the **Shadow** breaks through and intercepts the signal, forcing you to choose which voice to trust. When you're ready, you summon the **Council of Selves**, putting all six versions of you in the same room to debate, clash, and vote on who you really are. And when the multiverse has been fully explored, **The Historian** writes your **Chronicle** — a hardcover narrative book of every life you could have lived, sealed in the Archive forever.

---

## The Six Worlds

Each universe has its own naming laws, its own language, its own sense of what success means. Your alternate selves don't carry your job title into a different costume. They *became* someone else entirely.

| Universe | What you become |
|----------|----------------|
| 🏰 **Eldergrove Realms** | A figure of the ancient forest kingdom — elven courts, living woodland, guild pacts sworn beneath the canopy |
| 🌃 **Neon Synthesis** | A ghost in the megacity — digital identity, augmented flesh, reputation sold by the byte |
| ☠️ **Endless Seas** | A name whispered in port taverns — rank earned by salt and blood, epithet invented by the sea itself |
| 🐉 **Ancient Draconia** | An elemental force — centuries of mastery, draconic power, memory older than kingdoms |
| 🚀 **Cosmic Frontier** | A pioneer beyond the last star — quantum exploration, post-Earth civilization, designation etched in sector logs |
| 🧛 **Eternal Night** | An immortal of the inner courts — gothic aristocracy, memory as currency, a name that has outlived empires |

---

## Features

**Universes & Identity**
- Six parallel universes, each with its own world, era, and alternate self
- Legendary self and Villain self generated per universe — the best and worst of who you could become

**Relationships**
- Chat with your Future Self across each universe
- Relationship stages tracked per universe: Stranger → Curious Observer → Ally → Trusted Self → Temporal Confidant
- Council of Selves — hold a conversation with all 8 versions of yourself at once

**Timeline**
- Timeline Stability (0–100%) — shifts with every choice; drives the tone of your narrative
- Shadow Affinity — a hidden global counter that grows each time you engage the dark path

**Butterfly Effect**
- Name a pivotal real decision and watch four divergent timelines branch from it, each with its own consequences

**Records**
- Historian Log — a factual record of every significant event across your multiverse
- Chronicle Editions — narrative stories of your saga, written across multiple sessions; never marked as final

**Progress**
- Multiverse Offers — job offers from each universe tracked as accepted, negotiated, or rejected
- Completion bonuses — one-time stability gains unlocked per universe

---

## The Journey

### Phase 1 — Six Selves Revealed
Your career profile is read, and your **Career DNA** is extracted: role archetype (Builder, Connector, Explorer), personality signature, achievements, and the pattern underneath all of it. Six alternate profiles are built in parallel — each one a different answer to the question *"what if?"*

Every name is universe-native. Eternal Night names are gothic transformations of your real name. Cosmic Frontier names carry sharp consonants and stellar concepts. Endless Seas names follow the format `[Rank] [FirstName] "Epithet" [Invented Surname]` — the epithet coined fresh from your specific profile by the AI, never pulled from a list.

### Phase 2 — Go Deeper
Once your six selves exist, you can reach into their worlds:

- **Future Transmission** — Open a live channel to your future self. They remember the conversation, form opinions, evolve. The timeline has a stability score. The Shadow is watching.
- **Butterfly Effect** — Name a pivotal decision you made. Watch four alternate timelines branch from it, each one mapped with its own consequences.
- **Multiverse Invitations** — Receive in-world recruitment offers. Royal proclamations. Encrypted corporate contracts. Messages carved in stone. Each one addressed to the version of you that world believes you are.
- **Legendary Self** — The greatest version of you across all timelines — the one where every choice aligned.
- **Villain Self** — The darkest path your strengths could have taken. The same ambition, pointed the wrong way.
- **Council of Selves** — All eight versions of you in the same room. They don't agree on everything.

### Phase 3 — The Multiversal Chronicle
Your story, written. A hardcover chronicle book — animated spring-physics cover, chapter-by-chapter narrative, every universe rendered in its own voice — powered by **generate-chronicle** and **the-historian** via Foundry IQ. The archive is yours to keep.

---

## Tech Stack

### Frontend
| Library | What it does here |
|---------|-------------------|
| **Next.js 15** | App Router, server components, API routes |
| **TypeScript** | End-to-end typing across all agents and state |
| **Framer Motion** | Spring physics, `useMotionValue`, `useMotionTemplate`, cinematic screen transitions |
| **Three.js** + `@react-three/fiber` + `drei` | Interactive star field on the landing screen |
| **GSAP** | Spiral animation on the timeline scan screen |
| **react-pageflip** | Chronicle book with custom spring-physics cover overlay |
| **Recharts** | Timeline and destiny score visualizations |
| **Lucide React** | Icon system |
| **Tailwind CSS v3** | Utility styling |
| **pdfjs-dist** | Career profile PDF text extraction |

### AI — Azure AI Foundry IQ
| | |
|--|--|
| **`@azure/ai-projects`** | Azure AI Projects SDK |
| **`AzureOpenAI` client** | Chat completions against the Foundry IQ inference endpoint |
| **Foundry IQ Named Agent** | `callAgent()` via Responses API + `agent_reference` — used by `the-historian` |
| **Foundry IQ Direct Inference** | `callAI()` — all other routes |

---

## AI Architecture

LinkedOut runs **11 agents** across two tiers on **Azure AI Foundry IQ**. Ten agents run on direct inference — fast, parallel, model-level calls. The Chronicle is different: it passes through `generate-chronicle` and is powered by **the-historian**, a named Foundry IQ agent with persistent memory and a grounded knowledge base.

```
Your Career Profile (PDF)
        ↓  pdfjs-dist
        ↓
  ── Agent 1: analyze-resume ─────────────────────────────────────────────
  Career DNA extracted: archetype, pronouns, skills, timeline signature
        ↓
  ── Agent 2: generate-profile ×6 (parallel) ─────────────────────────────
  Six alternate selves built simultaneously across all universes
  Each: name · profession · world · era · biography · achievements
        ↓
  ── Agent 3: generate-future-self ────────────────────────────────────────
  Future self narrated: memories, philosophy, regrets, lessons
  Written entirely in the voice and language of their world
        ↓
  ── Agent 3: future-transmission (live) ──────────────────────────────────
  Ongoing chat · relationship stages · timeline stability · Shadow intercepts
        ↓
  ── Agent 10: generate-chronicle ─────────────────────────────────────────
  Assembles the narrative saga: prologue · chapters · epilogue
  Grounded in the Historian Log · edition model (never "final")
        ↓
  ── Agent 11: the-historian ◄─ Named Foundry IQ Agent ───────────────────
  Writes the Chronicle · persistent memory · linkedoutmultiversememory KB
```

### The Historian

The only named Foundry IQ agent in LinkedOut. It exists outside all six universes. It is not a future self, a mentor, a recruiter, or a guide. It records what happened.

| | |
|-|--|
| **Model** | `gpt-4.1-mini` — Global Standard deployment |
| **Version** | 6 |
| **Knowledge** | `linkedoutmultiversememory` — knowledge base (`ks-web-956`, Active) |
| **Memory** | `MemoryStore-boring_ice_8n66ryry6h` — persistent cross-session memory |
| **Tools** | Web search via Grounding with Bing |
| **Instructions** | *"You are The Historian. You exist outside the six universes. You are not a future self, a mentor, a recruiter, or a guide."* |

### All 11 Agents

| # | Agent | Description |
|---|-------|-------------|
| 1 | **analyze-resume** | Extracts Career DNA — archetypes, skills, timeline signature, pronouns |
| 2 | **generate-profile** | Builds all six alternate selves in parallel |
| 3 | **generate-future-self** + **future-transmission** | Creates the Future Self persona; runs live ongoing chat |
| 4 | **generate-recruiter** | Writes universe-native job offers as period-authentic documents |
| 5 | **generate-legendary** | Generates the legendary self — the timeline where everything aligned |
| 6 | **generate-villain** | Generates the villain self — ambition without values |
| 7 | **butterfly-effect** | Maps four divergent timelines from a single pivotal decision |
| 8 | **council-response** | Drives all 8 selves speaking in the Council debate |
| 9 | **shadow-intercept** | Generates the Shadow's universe-native manifestation and question |
| 10 | **generate-chronicle** | Assembles the narrative saga grounded in the Historian Log |
| 11 | **The Historian** *(Foundry IQ)* | Named Foundry IQ agent — writes the Chronicle with persistent memory and knowledge base |

### Supporting Utilities

| Utility | Description |
|---------|-------------|
| **generate-portrait** | gpt-image-2 via Azure Images endpoint — character portrait generation |
| **suggestions** | Contextual reply hints in Future Transmission and Council chats |

### Prompt Engineering

- **Career DNA → world-native profession** — Role archetype (Builder, Connector, Explorer) drives what you *do* in each world. Never a literal re-skin of your job title.
- **World independence** — `worldName`, `eraName`, and `worldDescription` are built like a cartographer naming a real place. The world existed before you arrived.
- **Universe immersion** — All achievements and competencies written in period-appropriate language. Modern vocabulary is banned in non-tech universes.
- **Gender-aware titles** — Pronouns extracted from your career profile drive title selection in every universe.
- **Epithet invention** — Pirate epithets are coined fresh from your specific profile by the AI. Never pulled from a preset list.
- **Naming laws** — Each universe has its own law. Eternal Night: gothic transformation of your real name. Cosmic Frontier: sharp consonants, X/Z/K sounds, stellar concepts. Endless Seas: `[Rank] [FirstName] "Epithet" [Surname]`, rank derived from career, surname invented.

---

## Getting Started

### Prerequisites
- Node.js 18+
- An Azure AI Foundry project with a deployed model

### Install

```bash
git clone https://github.com/anitohlm/linkedout.git
cd linkedout
npm install

cp .env.example .env.local
```

### Environment Variables

```env
AZURE_FOUNDRY_ENDPOINT=https://your-project.api.azureml.ms/...
AZURE_FOUNDRY_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   └── api/
│       ├── analyze-resume/           Agent 1
│       ├── generate-profile/         Agent 2  ×6 universes, parallel
│       ├── generate-future-self/     Agent 3
│       ├── future-transmission/      Agent 3  live chat
│       ├── generate-recruiter/       Agent 4
│       ├── generate-legendary/       Agent 5
│       ├── generate-villain/         Agent 6
│       ├── butterfly-effect/         Agent 7
│       ├── council-response/         Agent 8
│       ├── shadow-intercept/         Agent 9
│       ├── generate-chronicle/       Agent 10 → the-historian (Foundry IQ)
│       ├── generate-portrait/        utility
│       └── suggestions/              utility
├── components/
│   ├── AppOrchestrator.tsx           central state machine
│   ├── UniverseArrivalModal.tsx      per-universe arrival cards (skeuomorphic)
│   ├── screens/                      all journey screens
│   └── ui/
│       ├── aurora-stars.tsx          Three.js star field
│       └── spiral-animation.tsx      GSAP spiral loader
└── lib/
    ├── agents/
    │   ├── foundry.ts                callAI() + callAgent() + extractJSON()
    │   ├── prompts.ts                universe identity guides + naming laws
    │   └── useAgents.ts
    ├── historian.ts                  event logging + The Multiversal Record
    ├── universes.ts
    └── voices.ts
```

---

## License

Proprietary

## Author

[@anitohlm](https://github.com/anitohlm/linkedout)

---

*Six worlds. One set of choices. Infinite versions of you.*
*The Historian is already watching.*
