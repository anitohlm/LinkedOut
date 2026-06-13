"use client";

/**
 * UniverseArtwork — atmospheric SVG header for each universe card.
 *
 * Each artwork is 400×160 viewBox, rendered full-width at 160px height.
 * Unexplored: desaturated + dimmed (CSS filter) + fog overlay.
 * Explored:   full color, active particles via SVG <animate>.
 * Hovering:   filter intensifies + shimmer sweep + per-universe accent animation.
 */

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const H = 160;

interface ArtProps {
  color: string;
  visited: boolean;
  hovering: boolean;
  /** When true, all animations are suppressed (prefers-reduced-motion). */
  rm: boolean;
}

/* ─── Medieval Kingdom — moonlit castle ───────────────────────────────────── */
function MedievalArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="skyMed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06080f" />
          <stop offset="100%" stopColor="#150f04" />
        </linearGradient>
        <radialGradient id="moonGlowMed" cx="76%" cy="24%" r="28%">
          <stop offset="0%" stopColor={c} stopOpacity="0.22" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyMed)" />
      <rect width="400" height="160" fill="url(#moonGlowMed)" />

      {/* Stars */}
      {([[28,14],[75,22],[130,10],[185,28],[255,7],[335,19],[370,13],[100,42],[210,38],[350,44]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?1.2:0.8} fill={c} opacity={0.25+(i%3)*0.15}>
          {visited && !rm && <animate attributeName="opacity" values={`${0.2+(i%3)*0.15};0.7;${0.2+(i%3)*0.15}`} dur={`${hovering ? 1.0+i*0.18 : 2.2+i*0.35}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* Moon base layers */}
      <circle cx="304" cy="34" r="28" fill={c} opacity="0.07" />
      <circle cx="304" cy="34" r="18" fill={c} opacity="0.13" />
      <circle cx="304" cy="34" r="11" fill={c} opacity="0.24" />

      {/* Hover: moon outer ring expands + brightens */}
      <motion.circle cx="304" cy="34" r="42"
        animate={hovering ? { opacity: 0.14, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        fill={c} style={{ transformOrigin: "304px 34px" }}
      />
      <motion.circle cx="304" cy="34" r="22"
        animate={hovering ? { opacity: 0.25 } : { opacity: 0.13 }}
        transition={{ duration: 0.35 }}
        fill={c}
      />

      {/* Distant hills */}
      <path d="M0,132 Q80,112 160,122 Q240,108 320,118 Q370,112 400,115 L400,160 L0,160Z" fill={c} opacity="0.05" />

      {/* Castle walls */}
      <rect x="140" y="105" width="120" height="55" fill={c} opacity="0.1" />

      {/* Left tower */}
      <rect x="108" y="82" width="42" height="78" fill={c} opacity="0.12" />
      {([0,1,2,3] as number[]).map(i => <rect key={i} x={106+i*11} y="74" width="8" height="10" fill={c} opacity="0.12" />)}

      {/* Center tower */}
      <rect x="179" y="58" width="42" height="102" fill={c} opacity="0.14" />
      {([0,1,2,3] as number[]).map(i => <rect key={i} x={177+i*11} y="50" width="8" height="10" fill={c} opacity="0.14" />)}

      {/* Right tower */}
      <rect x="250" y="82" width="42" height="78" fill={c} opacity="0.12" />
      {([0,1,2,3] as number[]).map(i => <rect key={i} x={248+i*11} y="74" width="8" height="10" fill={c} opacity="0.12" />)}

      {/* Lit windows */}
      {([[187,72],[201,72],[115,95],[261,95],[187,100],[201,100]] as [number,number][]).map(([x,y],i) => (
        <rect key={i} x={x} y={y} width={i<2?9:7} height={i<2?13:10} rx="4" fill={c} opacity={visited?0.45:0.12}>
          {visited && !rm && <animate attributeName="opacity" values={`0.3;${hovering?0.85:0.6};0.3`} dur={`${hovering?0.9+i*0.25:1.8+i*0.5}s`} repeatCount="indefinite"/>}
        </rect>
      ))}

      {/* Ground mist */}
      <path d="M0,148 Q100,142 200,146 Q300,140 400,145 L400,160 L0,160Z" fill={c} opacity="0.06" />

      {/* Hover: shooting star */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.line
            x1="50" y1="10" x2="70" y2="25"
            stroke={c} strokeWidth="1.5" strokeLinecap="round"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: [0, 0.7, 0], x: [0, 80] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.1, repeat: Infinity, repeatDelay: 2.5 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Neon Synthesis — cyberpunk cityscape ────────────────────────────────── */
function CyberpunkArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyCyber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#010506" />
          <stop offset="100%" stopColor="#020e06" />
        </linearGradient>
        <radialGradient id="groundGlowCyber" cx="50%" cy="90%" r="55%">
          <stop offset="0%" stopColor={c} stopOpacity="0.18" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyCyber)" />
      <rect width="400" height="160" fill="url(#groundGlowCyber)" />

      {/* Perspective grid */}
      {([0,1,2,3,4,5,6,7,8] as number[]).map(i => (
        <motion.line key={`v${i}`} x1={i*50} y1="160" x2="200" y2="115"
          stroke={c} strokeWidth="0.4"
          animate={{ opacity: hovering ? 0.18 : 0.1 }}
          transition={{ duration: 0.4 }}
        />
      ))}
      {([0,1,2,3] as number[]).map(i => (
        <line key={`h${i}`} x1="0" y1={115+i*13} x2="400" y2={115+i*13} stroke={c} strokeWidth="0.3" opacity="0.07" />
      ))}

      {/* Back buildings */}
      {([[0,88,28],[34,72,22],[60,82,18],[340,74,22],[368,65,20],[392,80,8]] as [number,number,number][]).map(([x,y,w],i)=>(
        <rect key={i} x={x} y={y} width={w} height={160-y} fill={c} opacity="0.07" />
      ))}

      {/* Mid buildings */}
      {([[90,96,34],[130,75,26],[244,76,30],[278,92,24],[308,82,20]] as [number,number,number][]).map(([x,y,w],i)=>(
        <rect key={i} x={x} y={y} width={w} height={160-y} fill={c} opacity="0.1" />
      ))}

      {/* Central spire */}
      <rect x="186" y="38" width="28" height="122" fill={c} opacity="0.15" />
      <polygon points="200,20 188,44 212,44" fill={c} opacity="0.2" />
      <line x1="200" y1="20" x2="200" y2="0" stroke={c} strokeWidth="0.8" opacity={visited ? 0.5 : 0.2} />

      {/* Neon roof edges */}
      {([[90,96],[130,75],[186,38],[244,76],[308,82]] as [number,number][]).map(([x,y],i)=>(
        <motion.line key={i} x1={x} y1={y} x2={x+[34,26,28,30,20][i]} y2={y}
          stroke={c} strokeWidth="1.2"
          animate={{ opacity: visited ? (hovering ? 1 : 0.7) : 0.2 }}
          transition={{ duration: 0.3, delay: i*0.05 }}
        >
          {visited && !rm && <animate attributeName="opacity" values={`${hovering?0.7:0.5};${hovering?1:0.8};${hovering?0.7:0.5}`} dur={`${hovering?0.7+i*0.2:1.5+i*0.4}s`} repeatCount="indefinite"/>}
        </motion.line>
      ))}

      {/* Window lights */}
      {([[95,106],[102,120],[135,85],[143,100],[249,86],[256,102],[314,92],[321,107]] as [number,number][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="4" height="5" fill={c} opacity={visited?0.45:0.1}>
          {visited && !rm && <animate attributeName="opacity" values={`0.3;${hovering?0.95:0.8};0.3`} dur={`${hovering?0.5+i*0.15:1+i*0.28}s`} repeatCount="indefinite"/>}
        </rect>
      ))}

      {/* Horizon glow */}
      <motion.line x1="0" y1="115" x2="400" y2="115" stroke={c} strokeWidth="0.6"
        animate={{ opacity: hovering ? 0.6 : visited ? 0.3 : 0.1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Hover: scan line sweeping down */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.rect x="0" y="0" width="400" height="2" fill={c} fillOpacity="0.35"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, 162], opacity: [0, 0.35, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* Hover: data column flicker */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.rect x="198" y="0" width="4" height="160" fill={c} fillOpacity="0.06"
            animate={{ opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Endless Seas — ocean at dusk ───────────────────────────────────────── */
function PirateArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyPirate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050509" />
          <stop offset="55%" stopColor="#0f0802" />
          <stop offset="100%" stopColor="#180c03" />
        </linearGradient>
        <radialGradient id="sunPirate" cx="50%" cy="62%" r="35%">
          <stop offset="0%" stopColor={c} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyPirate)" />
      <rect width="400" height="160" fill="url(#sunPirate)" />

      {/* Stars */}
      {([[40,20],[90,14],[160,25],[230,10],[290,18],[350,8],[370,28],[60,38]] as [number,number][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.9" fill={c} opacity={0.25+(i%3)*0.1}>
          {visited && !rm && <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${hovering?1.2+i*0.2:2+i*0.4}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* Horizon glow */}
      <motion.ellipse cx="200" cy="100" rx="180" ry="18"
        animate={{ ry: hovering ? 24 : 18, opacity: hovering ? 0.18 : 0.12 }}
        transition={{ duration: 0.5 }}
        fill={c}
      />

      {/* Ocean layers */}
      <motion.path d="M0,100 Q100,94 200,98 Q300,92 400,97 L400,160 L0,160Z"
        fill={c}
        animate={{ opacity: hovering ? 0.11 : 0.07 }}
        transition={{ duration: 0.4 }}
      />
      <motion.path d="M0,112 Q60,106 120,110 Q180,104 240,108 Q300,103 360,107 Q390,105 400,106 L400,160 L0,160Z"
        fill={c}
        animate={{ opacity: hovering ? 0.1 : 0.06 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      />
      <motion.path d="M0,125 Q80,119 160,123 Q240,117 320,121 Q370,118 400,120 L400,160 L0,160Z"
        fill={c}
        animate={{ opacity: hovering ? 0.13 : 0.08 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />

      {/* Ship silhouette */}
      <path d="M165,108 Q200,104 235,108 L230,120 Q200,124 170,120Z" fill={c} opacity="0.2" />
      <line x1="200" y1="50" x2="200" y2="108" stroke={c} strokeWidth="1.5" opacity="0.25" />
      <line x1="178" y1="68" x2="222" y2="68" stroke={c} strokeWidth="1.2" opacity="0.2" />
      <path d="M182,70 Q200,65 218,70 L215,104 Q200,106 185,104Z" fill={c} opacity="0.12" />
      <line x1="180" y1="72" x2="180" y2="108" stroke={c} strokeWidth="0.8" opacity="0.18" />
      <line x1="168" y1="84" x2="192" y2="84" stroke={c} strokeWidth="0.8" opacity="0.15" />
      <path d="M170,86 Q180,83 190,86 L188,106 Q180,108 172,106Z" fill={c} opacity="0.1" />

      {/* Distant islands */}
      <path d="M20,104 Q50,92 80,100 L80,112 L20,112Z" fill={c} opacity="0.08" />
      <path d="M310,106 Q340,95 370,103 L370,115 L310,115Z" fill={c} opacity="0.07" />

      {/* Birds */}
      {([[90,55],[110,48],[130,58],[280,42],[300,52]] as [number,number][]).map(([x,y],i)=>(
        <motion.path key={i} d={`M${x},${y} Q${x+5},${y-4} ${x+10},${y}`}
          stroke={c} strokeWidth="0.8" fill="none"
          animate={{ opacity: visited ? (hovering ? 0.65 : 0.4) : 0.15, y: hovering ? [0,-3,0] : 0 }}
          transition={{ duration: 1.2+i*0.3, repeat: hovering ? Infinity : 0, delay: i*0.15 }}
        />
      ))}

      {/* Hover: moonrise glow on horizon */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.ellipse cx="200" cy="100" rx="60" ry="8"
            initial={{ opacity: 0, ry: 4 }}
            animate={{ opacity: 0.25, ry: 8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            fill={c}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Ancient Draconia — volcanic peaks & dragon ─────────────────────────── */
function DragonArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyDragon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040208" />
          <stop offset="100%" stopColor="#0d0518" />
        </linearGradient>
        <radialGradient id="moonDragon" cx="20%" cy="18%" r="22%">
          <stop offset="0%" stopColor={c} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="volcanoGlow" cx="50%" cy="80%" r="30%">
          <stop offset="0%" stopColor={c} stopOpacity="0.2" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyDragon)" />
      <rect width="400" height="160" fill="url(#moonDragon)" />
      <rect width="400" height="160" fill="url(#volcanoGlow)" />

      {/* Stars */}
      {([[60,18],[110,10],[170,22],[230,6],[290,14],[350,20],[380,10],[140,35],[320,38]] as [number,number][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.9" fill={c} opacity={0.2+(i%3)*0.15}>
          {visited && !rm && <animate attributeName="opacity" values="0.15;0.55;0.15" dur={`${hovering?1.2+i*0.15:2.5+i*0.3}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* Moon */}
      <circle cx="78" cy="30" r="22" fill={c} opacity="0.06" />
      <motion.circle cx="78" cy="30" r="15"
        animate={{ opacity: hovering ? 0.2 : 0.12 }}
        transition={{ duration: 0.4 }}
        fill={c}
      />
      <circle cx="78" cy="30" r="9" fill={c} opacity="0.22" />

      {/* Mountains */}
      <path d="M0,160 L60,75 L110,95 L160,55 L200,80 L240,50 L290,90 L340,60 L380,85 L400,70 L400,160Z" fill={c} opacity="0.07" />
      <path d="M0,160 L40,115 L80,90 L130,110 L175,80 L210,100 L255,72 L300,98 L350,78 L400,95 L400,160Z" fill={c} opacity="0.11" />

      {/* Ruins */}
      {([[60,115,6,45],[66,125,6,35],[72,110,6,50],[200,108,8,52],[208,118,8,42],[216,105,8,55]] as [number,number,number,number][]).map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} opacity="0.15" rx="1" />
      ))}
      {([[58,113],[64,123],[70,108],[198,106],[206,116],[214,103]] as [number,number][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width={i<3?10:12} height="3" fill={c} opacity="0.18" />
      ))}

      {/* Dragon silhouette */}
      <motion.path d="M290,45 Q300,35 315,38 Q320,32 330,36 Q325,42 310,44 Q315,48 308,52 Q295,50 290,45Z"
        fill={c}
        animate={{ opacity: visited ? (hovering ? 0.55 : 0.35) : 0.15 }}
        transition={{ duration: 0.4 }}
      />
      <motion.path d="M295,42 Q275,30 265,38 Q275,44 295,44Z"
        fill={c}
        animate={{ opacity: hovering ? 0.4 : 0.2, y: hovering ? [0,-2,0] : 0 }}
        transition={{ duration: 0.8, repeat: hovering ? Infinity : 0 }}
      />
      <motion.path d="M315,40 Q335,28 348,34 Q336,42 315,42Z"
        fill={c}
        animate={{ opacity: hovering ? 0.4 : 0.2, y: hovering ? [0,-2,0] : 0 }}
        transition={{ duration: 0.8, repeat: hovering ? Infinity : 0, delay: 0.1 }}
      />
      <path d="M290,46 Q280,55 270,52 Q265,58 258,54" stroke={c} strokeWidth="1.5" fill="none" opacity={visited?0.3:0.12} strokeLinecap="round"/>

      {/* Lava glow */}
      <motion.path d="M160,155 Q200,148 240,153 L240,160 L160,160Z"
        fill={c}
        animate={{ opacity: visited ? (hovering ? 0.35 : 0.18) : 0.06 }}
        transition={{ duration: 0.4 }}
      >
        {visited && !rm && <animate attributeName="opacity" values={`${hovering?0.25:0.12};${hovering?0.45:0.25};${hovering?0.25:0.12}`} dur={`${hovering?0.8:2.5}s`} repeatCount="indefinite"/>}
      </motion.path>

      {/* Hover: fire ember particles */}
      <AnimatePresence>
        {hovering && !rm && (
          <>
            {[185, 200, 215, 195, 205].map((x, i) => (
              <motion.circle key={i} cx={x} cy="155"
                r={0.8 + (i % 2) * 0.5} fill={c}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.7, 0], y: [0, -(20 + i * 8)], x: [0, (i % 2 === 0 ? -1 : 1) * (i + 1) * 3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 + i * 0.2, repeat: Infinity, repeatDelay: i * 0.3, delay: i * 0.15 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Cosmic Frontier — orbital station & planet rings ───────────────────── */
function GalacticArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyGalactic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#010309" />
          <stop offset="100%" stopColor="#020510" />
        </linearGradient>
        <radialGradient id="nebulaGalactic" cx="70%" cy="35%" r="35%">
          <stop offset="0%" stopColor={c} stopOpacity="0.12" />
          <stop offset="60%" stopColor={c} stopOpacity="0.03" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebulaGalactic2" cx="20%" cy="65%" r="30%">
          <stop offset="0%" stopColor="#7c6ef7" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7c6ef7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyGalactic)" />
      <rect width="400" height="160" fill="url(#nebulaGalactic)" />
      <rect width="400" height="160" fill="url(#nebulaGalactic2)" />

      {/* Star field */}
      {([[15,12],[45,35],[70,8],[95,28],[130,15],[165,40],[200,6],[235,22],[270,38],[305,12],[340,28],[375,8],
         [30,55],[80,62],[140,50],[200,68],[280,55],[350,60],[380,45]] as [number,number][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%4===0?1.2:0.7} fill={c} opacity={0.15+(i%4)*0.12}>
          {visited && !rm && <animate attributeName="opacity" values={`${0.1+(i%4)*0.1};0.5;${0.1+(i%4)*0.1}`} dur={`${hovering?0.9+i*0.12:1.8+i*0.25}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* Planet */}
      <motion.circle cx="300" cy="55" r="38"
        animate={{ opacity: hovering ? 0.12 : 0.07 }}
        transition={{ duration: 0.4 }}
        fill={c}
      />
      <motion.circle cx="300" cy="55" r="28"
        animate={{ opacity: hovering ? 0.18 : 0.1 }}
        transition={{ duration: 0.4 }}
        fill={c}
      />
      <motion.circle cx="300" cy="55" r="18"
        animate={{ opacity: hovering ? 0.28 : 0.16 }}
        transition={{ duration: 0.4 }}
        fill={c}
      />

      {/* Planet rings */}
      <motion.ellipse cx="300" cy="55" rx="52" ry="10" fill="none"
        stroke={c} strokeWidth="2.5"
        animate={{ opacity: hovering ? 0.3 : 0.15 }}
        transition={{ duration: 0.4 }}
      />
      <ellipse cx="300" cy="55" rx="48" ry="9" fill="none" stroke={c} strokeWidth="1" opacity="0.08" />
      <path d="M265,50 Q300,47 335,52 L335,58 Q300,63 265,60Z" fill="url(#skyGalactic)" opacity="1" />

      {/* Orbital station */}
      <rect x="100" y="45" width="50" height="14" rx="4" fill={c} opacity="0.15" />
      <rect x="120" y="38" width="10" height="28" rx="2" fill={c} opacity="0.18" />
      <rect x="85" y="49" width="18" height="6" rx="1" fill={c} opacity="0.12" />
      <rect x="147" y="49" width="18" height="6" rx="1" fill={c} opacity="0.12" />
      <motion.circle cx="125" cy="52" r="2.5" fill={c}
        animate={{ opacity: visited ? (hovering ? 1 : 0.7) : 0.2 }}
        transition={{ duration: 0.3 }}
      >
        {visited && !rm && <animate attributeName="opacity" values={`0.5;${hovering?1:0.8};0.5`} dur={`${hovering?0.6:1.5}s`} repeatCount="indefinite"/>}
      </motion.circle>

      {/* Orbital paths */}
      <ellipse cx="300" cy="55" rx="80" ry="22" fill="none" stroke={c} strokeWidth="0.4" opacity="0.07" strokeDasharray="4 6"/>
      <motion.ellipse cx="300" cy="55" rx="105" ry="30" fill="none"
        stroke={c} strokeWidth="0.4" strokeDasharray="3 8"
        animate={{ opacity: hovering ? 0.1 : 0.05 }}
        transition={{ duration: 0.4 }}
      />

      {/* Distant colonies */}
      <rect x="35" y="110" width="80" height="50" fill={c} opacity="0.04" />
      <rect x="50" y="102" width="12" height="58" fill={c} opacity="0.07" />
      <rect x="70" y="98" width="10" height="62" fill={c} opacity="0.07" />
      <rect x="90" y="106" width="12" height="54" fill={c} opacity="0.07" />

      {/* Horizon atmosphere */}
      <path d="M0,140 Q200,130 400,138 L400,160 L0,160Z" fill={c} opacity="0.05" />

      {/* Hover: hyperspace streak effect */}
      <AnimatePresence>
        {hovering && !rm && (
          <>
            {[[20,80],[60,35],[180,90],[340,50],[380,70]].map(([x,y],i) => (
              <motion.line key={i}
                x1={x} y1={y} x2={x + 18} y2={y}
                stroke={c} strokeWidth="0.8" strokeLinecap="round"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, 0.5, 0], scaleX: [0, 1, 0], x: [0, -30] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, repeatDelay: 0.8 + i * 0.4, delay: i * 0.2 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Eternal Night — gothic moonlit city ────────────────────────────────── */
function VampireArt({ color: c, visited, hovering, rm }: ArtProps) {
  return (
    <svg viewBox="0 0 400 160" width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyVamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060006" />
          <stop offset="100%" stopColor="#100008" />
        </linearGradient>
        <radialGradient id="moonVamp" cx="50%" cy="25%" r="30%">
          <stop offset="0%" stopColor={c} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="groundMistVamp" cx="50%" cy="95%" r="50%">
          <stop offset="0%" stopColor={c} stopOpacity="0.1" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="160" fill="url(#skyVamp)" />
      <rect width="400" height="160" fill="url(#moonVamp)" />
      <rect width="400" height="160" fill="url(#groundMistVamp)" />

      {/* Stars */}
      {([[25,15],[70,10],[120,20],[180,8],[240,18],[300,9],[355,14],[380,24],[90,36],[310,32]] as [number,number][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.8" fill={c} opacity={0.2+(i%3)*0.1}>
          {visited && !rm && <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${hovering?0.9+i*0.18:2+i*0.38}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* Moon */}
      <motion.circle cx="200" cy="32" r="38"
        animate={{ opacity: hovering ? 0.12 : 0.05 }}
        transition={{ duration: 0.5 }}
        fill={c}
      />
      <motion.circle cx="200" cy="32" r="26"
        animate={{ opacity: hovering ? 0.18 : 0.1 }}
        transition={{ duration: 0.5 }}
        fill={c}
      />
      <motion.circle cx="200" cy="32" r="12"
        animate={{ opacity: hovering ? 0.36 : 0.2 }}
        transition={{ duration: 0.5 }}
        fill={c}
      />

      {/* City silhouette */}
      <path d="M0,115 L20,90 L30,95 L50,72 L70,82 L85,65 L100,75 L120,58 L135,70 L155,52 L170,65 L185,48 L200,60 L215,46 L230,62 L248,50 L265,68 L280,55 L300,72 L320,62 L338,78 L355,65 L370,80 L385,72 L400,82 L400,160 L0,160Z"
        fill={c} opacity="0.08" />

      {/* Gothic towers — left */}
      <rect x="55" y="70" width="22" height="90" fill={c} opacity="0.13" />
      <polygon points="66,52 56,74 76,74" fill={c} opacity="0.16" />
      {([[61,82],[61,98]] as [number,number][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="5" height="8" rx="2.5" fill={c} opacity={visited?0.5:0.12}>
          {visited && !rm && <animate attributeName="opacity" values={`0.35;${hovering?0.85:0.65};0.35`} dur={`${hovering?1.2+i*0.4:2.8+i*0.4}s`} repeatCount="indefinite"/>}
        </rect>
      ))}

      {/* Gothic towers — center */}
      <rect x="180" y="50" width="40" height="110" fill={c} opacity="0.14" />
      <polygon points="200,28 180,55 220,55" fill={c} opacity="0.18" />
      <circle cx="200" cy="75" r="8" fill="none" stroke={c} strokeWidth="1.2" opacity={visited?0.4:0.15} />
      <motion.circle cx="200" cy="75" r="4" fill={c}
        animate={{ opacity: visited ? (hovering ? 0.65 : 0.35) : 0.1 }}
        transition={{ duration: 0.4 }}
      >
        {visited && !rm && <animate attributeName="opacity" values={`0.25;${hovering?0.75:0.5};0.25`} dur={`${hovering?0.8:2}s`} repeatCount="indefinite"/>}
      </motion.circle>
      <line x1="180" y1="100" x2="162" y2="120" stroke={c} strokeWidth="2.5" opacity="0.1" />
      <line x1="220" y1="100" x2="238" y2="120" stroke={c} strokeWidth="2.5" opacity="0.1" />

      {/* Gothic towers — right */}
      <rect x="323" y="68" width="22" height="92" fill={c} opacity="0.13" />
      <polygon points="334,50 324,72 344,72" fill={c} opacity="0.16" />
      <rect x="329" y="80" width="5" height="8" rx="2.5" fill={c} opacity={visited?0.5:0.12}>
        {visited && !rm && <animate attributeName="opacity" values={`0.38;${hovering?0.85:0.68};0.38`} dur={`${hovering?1.0:3}s`} repeatCount="indefinite"/>}
      </rect>

      {/* Bats */}
      {([[140,42],[155,35],[168,44],[232,38],[248,30]] as [number,number][]).map(([x,y],i)=>(
        <motion.g key={i}
          animate={{ opacity: visited ? (hovering ? 0.7 : 0.45) : 0.15, y: hovering ? [0,-4,0] : 0 }}
          transition={{ duration: 0.8 + i * 0.2, repeat: hovering ? Infinity : 0, delay: i * 0.12 }}
        >
          <path d={`M${x},${y} Q${x-6},${y-5} ${x-12},${y}`} stroke={c} strokeWidth="0.9" fill="none"/>
          <path d={`M${x},${y} Q${x+6},${y-5} ${x+12},${y}`} stroke={c} strokeWidth="0.9" fill="none"/>
        </motion.g>
      ))}

      {/* Ground mist */}
      <motion.path d="M0,150 Q100,143 200,148 Q300,142 400,150 L400,160 L0,160Z"
        fill={c}
        animate={{ opacity: hovering ? 0.14 : 0.08 }}
        transition={{ duration: 0.5 }}
      />
      <path d="M0,155 Q150,150 300,153 Q370,151 400,154 L400,160 L0,160Z" fill={c} opacity="0.06" />

      {/* Hover: crimson pulse from moon */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.circle cx="200" cy="32" r="50"
            stroke={c} strokeWidth="1" fill="none"
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: [0.3, 0], scale: [0.8, 1.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.4 }}
            style={{ transformOrigin: "200px 32px" }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────── */
export default function UniverseArtwork({ id, color, visited, hovering = false }: {
  id: string;
  color: string;
  visited: boolean;
  hovering?: boolean;
}) {
  // Respect OS-level prefers-reduced-motion — all animations are suppressed when true
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rm = prefersReducedMotion;

  const props: ArtProps = { color, visited, hovering, rm };

  const artMap: Record<string, React.ReactNode> = {
    medieval: <MedievalArt {...props} />,
    cyberpunk: <CyberpunkArt {...props} />,
    pirate: <PirateArt {...props} />,
    dragon: <DragonArt {...props} />,
    galactic: <GalacticArt {...props} />,
    vampire: <VampireArt {...props} />,
  };

  const art = artMap[id] ?? <MedievalArt {...props} />;

  return (
    <div style={{ position: "relative", height: H, overflow: "hidden" }}>
      {/* Artwork — filter intensifies on hover (static when reduced-motion) */}
      <motion.div
        animate={{
          filter: visited
            ? (hovering && !rm)
              ? "brightness(1.22) saturate(1.18)"
              : "brightness(1) saturate(1)"
            : "brightness(0.45) saturate(0.25)",
        }}
        transition={rm ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
      >
        {art}
      </motion.div>

      {/* Unexplored fog overlay */}
      {!visited && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(8,9,13,0.0) 40%, rgba(8,9,13,0.55) 100%)",
          pointerEvents: "none",
        }} />
      )}

      {/* Shimmer sweep on hover */}
      <AnimatePresence>
        {hovering && !rm && (
          <motion.div
            initial={{ x: "-60%", opacity: 0 }}
            animate={{ x: "160%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{
              position: "absolute", top: 0, bottom: 0, width: "55%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
              pointerEvents: "none", zIndex: 4,
            }}
          />
        )}
      </AnimatePresence>

      {/* Central atmosphere glow on hover */}
      <motion.div
        animate={{ opacity: (hovering && !rm) ? 1 : 0 }}
        transition={rm ? { duration: 0 } : { duration: 0.4 }}
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${color}18 0%, transparent 65%)`,
          pointerEvents: "none", zIndex: 3,
        }}
      />

      {/* Bottom fade into card content */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
        background: "linear-gradient(to bottom, transparent, var(--bg2))",
        pointerEvents: "none",
      }} />
    </div>
  );
}
