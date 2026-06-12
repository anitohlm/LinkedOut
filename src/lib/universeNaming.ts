/**
 * Per-universe naming conventions + cultural definitions of success & failure.
 * Used by the Legendary Self and Shadow Self generators so each is a true
 * citizen of its universe — not a scaled-up/down version of the same role.
 */

import { UniverseType } from "@/types";

export function nameConvention(universeId: string, firstName: string): string {
  const f = firstName || "the subject";
  // Neon Synthesis handle styles — pick one at RANDOM so the cyberpunk name isn't always
  // "${f}//Prime". Mirrors the variety used for the main profile name.
  const CYBER_STYLES: string[][] = [
    [`${f}.exe`, `${f}.Protocol`, `${f}.Null`],
    [`${f}_7`, `${f.toUpperCase()}-9`, `${f}_v2`],
    [`Cipher${f}`, `Kernel${f}`, `Hex${f}`, `Ghost${f}`],
    [`${f}//Prime`, `${f}//Root`],
    [`GhostProcess-13`, `${f}-Daemon`, `Proc_${f}`],
    ["NullVector", "Voidcaller", "The Lattice Architect", "Architect of the Infinite Simulation"],
  ];
  const cyber = CYBER_STYLES[Math.floor(Math.random() * CYBER_STYLES.length)];
  const M: Record<string, string> = {
    medieval: `Noble/knightly/guild names. Titles like Lord, Lady, Sir, Master, Dame, or "Keeper of [X]". Heraldic surnames or "of [Place]". e.g. "Lord ${f} Storyforge, Keeper of the Thousand Tales".`,
    cyberpunk: `Digital handles, aliases, protocol designations. May drop the human name entirely. VARY the format — do NOT default to the "//" slash style. This time lean toward: ${cyber.map(e => `"${e}"`).join(", ")}.`,
    pirate: `Sea/weather names with nautical ranks (Captain, Admiral, Navigator). e.g. "Admiral ${f} Stormwake", "The Drowned Navigator".`,
    dragon: `Dragon-clan / ancient-scholar names with mythic epithets. e.g. "${f} Embermind, Dragon of Memory", "The Ash Scholar".`,
    galactic: `Stellar/explorer names with cosmic ranks (Commander, Pioneer, Voyager). e.g. "Voyager ${f} Novareach", "The Lost Colonist".`,
    vampire: `Old-world, nocturnal, mournful names with immortal titles (Lord, Lady, Count, Elder). e.g. "Elder ${f} Nightwhisper", "The Hollow Witness".`,
  };
  return M[universeId] || `A culturally authentic name for a native of this world.`;
}

export function universeSuccess(universeId: string): string {
  const M: Record<string, string> = {
    medieval: "To be honored across the realm — a name sung in halls, trusted by crown and commoner alike, remembered for centuries.",
    cyberpunk: "To become a legend of the net — your work woven so deeply into the city that it outlasts you, admired by everyone who plugs in.",
    pirate: "To be utterly free and renowned — master of the open sea, your name a legend whispered in every port.",
    dragon: "To achieve timeless wisdom and power — revered as an immortal keeper, your understanding spanning ages.",
    galactic: "To expand what's possible for everyone — a pioneer whose discoveries open new frontiers for all who follow.",
    vampire: "To master eternity with grace — to endure the centuries without losing your soul, beloved across lifetimes.",
  };
  return M[universeId] || "The highest possible expression of who they are.";
}

export function universeFailure(universeId: string): string {
  const M: Record<string, string> = {
    medieval: "Disgrace, obscurity, or a broken oath — a once-great name reduced to a cautionary whisper.",
    cyberpunk: "Fading into the network — so consumed by the work that warmth and connection slip away, remembered only as a name on a screen.",
    pirate: "Marooned by your own recklessness or greed — freedom curdled into isolation, the sea that you loved now your prison.",
    dragon: "Hoarding wisdom or power until it rots — patience twisted into paralysis, knowledge into a tomb.",
    galactic: "Lost to the void chasing the frontier — sacrificing everyone who mattered for a discovery no one remembers.",
    vampire: "Eternity without connection — outliving all meaning until only hollow hunger remains.",
  };
  return M[universeId] || "A tragic, distorted version of the same gifts.";
}

export const ALL_UNIVERSES: UniverseType[] = ["medieval", "cyberpunk", "pirate", "dragon", "galactic", "vampire"];
