import { UniverseConfig, UniverseType } from "@/types";

export const UNIVERSES: Record<UniverseType, UniverseConfig> = {
  medieval: {
    id: "medieval",
    title: "Eldergrove Realms",
    emoji: "🏰",
    color: "#D4AF37",
    lore: "In an ancient realm of elder forests, kingdoms, and old magic, you rose to legend through cunning and valor.",
    recruiterFaction: "Royal Houses",
    personalityArchetypes: ["Knight", "Sage", "Noble", "Strategist"],
    terminology: {
      leader: "Liege",
      team: "Court",
      project: "Quest",
      success: "Glory",
      failure: "Defeat",
    },
    gradientFrom: "from-amber-900",
    gradientTo: "to-yellow-600",
  },
  cyberpunk: {
    id: "cyberpunk",
    title: "Neon Synthesis",
    emoji: "🌃",
    color: "#5b8cff",
    lore: "In a city of endless neon, you evolved beyond human constraints into something more.",
    recruiterFaction: "Megacorporations",
    personalityArchetypes: ["Hacker", "Netrunner", "Corporate Agent", "Rogue AI"],
    terminology: {
      leader: "Admin",
      team: "Collective",
      project: "Hack",
      success: "Exploit",
      failure: "Crash",
    },
    gradientFrom: "from-blue-600",
    gradientTo: "to-fuchsia-600",
  },
  pirate: {
    id: "pirate",
    title: "Endless Seas",
    emoji: "☠️",
    color: "#FF6B35",
    lore: "Upon the open ocean, you discovered freedom has no compass.",
    recruiterFaction: "Fleets & Crews",
    personalityArchetypes: ["Captain", "Navigator", "Buccaneer", "Smuggler"],
    terminology: {
      leader: "Captain",
      team: "Crew",
      project: "Voyage",
      success: "Treasure",
      failure: "Shipwreck",
    },
    gradientFrom: "from-orange-700",
    gradientTo: "to-red-600",
  },
  dragon: {
    id: "dragon",
    title: "Ancient Draconia",
    emoji: "🐉",
    color: "#E31937",
    lore: "Across centuries of existence, you learned that power is wisdom's echo.",
    recruiterFaction: "Ancient Orders",
    personalityArchetypes: ["Elder Wyrm", "Dragon Sage", "Guardian", "Oracle"],
    terminology: {
      leader: "Archon",
      team: "Brood",
      project: "Covenant",
      success: "Ascension",
      failure: "Dormancy",
    },
    gradientFrom: "from-red-900",
    gradientTo: "to-rose-600",
  },
  galactic: {
    id: "galactic",
    title: "Cosmic Frontier",
    emoji: "🚀",
    color: "#00D9FF",
    lore: "Among the stars, you learned that the universe expands faster than fear.",
    recruiterFaction: "Federations & Alliances",
    personalityArchetypes: ["Commander", "Explorer", "Diplomat", "Pioneer"],
    terminology: {
      leader: "Commander",
      team: "Fleet",
      project: "Mission",
      success: "Discovery",
      failure: "Void Loss",
    },
    gradientFrom: "from-blue-600",
    gradientTo: "to-cyan-500",
  },
  vampire: {
    id: "vampire",
    title: "Eternal Night",
    emoji: "🧛",
    color: "#9D4EDD",
    lore: "In the shadow of immortality, you discovered that time changes everything except choice.",
    recruiterFaction: "Ancient Covenants",
    personalityArchetypes: ["Ancient One", "Nocturne", "Immortal", "Sire"],
    terminology: {
      leader: "Prince",
      team: "Clan",
      project: "Compact",
      success: "Eternity",
      failure: "Oblivion",
    },
    gradientFrom: "from-purple-900",
    gradientTo: "to-indigo-600",
  },
};

export const ALL_UNIVERSE_IDS: UniverseType[] = [
  "medieval",
  "cyberpunk",
  "pirate",
  "dragon",
  "galactic",
  "vampire",
];

export function getUniverse(id: UniverseType): UniverseConfig {
  return UNIVERSES[id];
}

export function getAllUniverses(): UniverseConfig[] {
  return ALL_UNIVERSE_IDS.map((id) => UNIVERSES[id]);
}
