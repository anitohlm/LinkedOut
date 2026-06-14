// Portrait generator — alternate-self profile picture via gpt-image-2.
import { NextRequest, NextResponse } from "next/server";
import { UniverseType, ResumeAnalysis } from "@/types";
import { generateImage } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";

// Front-loaded style directive — gpt-image-2 weights the start of the prompt most,
// so the illustrated medium goes first and stays short to dominate the realism default.
const STYLE =
  "Anime-style 2D digital illustration. Cel-shaded anime key-visual art with clean lineart, flat-to-soft anime shading and a hand-painted illustrated look — like high-end anime game character splash art / visual-novel key art. This is hand-drawn ARTWORK, NOT a photo: stylized anime facial features, large expressive eyes, smooth non-realistic skin, no photographic detail, no pores, no camera realism. Vibrant, clean, illustrated.";

// Per-universe visual direction so each portrait reads as its world on sight.
const UNIVERSE_LOOK: Record<string, string> = {
  medieval:  "an ethereal elven realm deep in an ancient enchanted forest (Lord of the Rings, Rivendell / Lothlórien inspired). The character is an ELF with subtly POINTED EARS, refined elegant features and flowing hair, wearing ornate elven armor and robes of green and gold adorned with delicate leaf, vine and filigree motifs. Behind them, soaring white elven spires and arched tree-cathedrals woven into giant ancient trees, cascading waterfalls, sunbeams filtering through a lush green canopy, drifting leaves and motes of light, warm golden forest light",
  cyberpunk: "neon-drenched futuristic megacity at night with towering skyscrapers, glowing holographic signs and bokeh city lights in vivid ELECTRIC BLUE, deep PURPLE and MAGENTA. The character MUST wear an unmistakably FUTURISTIC CYBERPUNK outfit — sleek high-tech techwear / cyber-armor with glowing blue circuitry panels, segmented plating, holographic iridescent fabric, exposed cybernetic accents and glowing seams. If they wear eyeglasses they must be FUTURISTIC AR smart-glasses or a holographic HUD visor with a glowing digital readout (not ordinary glasses). Any headwear, headset or headdress must be sleek high-tech cyber gear with glowing elements — a neural headset, light-up earpiece, augmented-reality halo or cybernetic implants. Electric-blue and violet rim light on the face, magenta neon city accents, subtle cybernetic glow, cool blue-purple cinematic cyberpunk palette (NOT green)",
  pirate:    "epic open ocean at golden hour, a grand tall ship with billowing sails and rigging behind, seabirds against a dramatic cloudy sky, the figure in a weathered pirate captain's coat with leather straps and a tricorne hat, sun-glow on the waves, warm golden amber and deep ocean-blue tones, illustrated anime adventure look",
  dragon:    "ancient fiery dragon realm, a massive towering dragon looming in the background amid swirling embers and glowing molten sparks, the figure in ornate dark dragon-scaled armor and regalia conjuring glowing fire/magic in hand. They MUST wear a distinctive DRAGON HEADDRESS, styled BOTH to their gender AND fused with their real-world profession: for a MAN, a commanding horned dragon-skull crown or helm with large sweeping dragon horns and bone/scale detailing; for a WOMAN, an elegant ornate dragon-scale circlet or tiara-headdress with graceful curved horns, gold filigree and gem accents. The dragon headdress must ALSO incorporate clear motifs of the character's trade so it visibly represents their vocation — e.g. a GARDENER's dragon headdress entwined with leaves, vines, flowers and growing tendrils; an ENGINEER's forged with gears, pipes and metal; a HEALER's adorned with herbs and vials; a SCHOLAR's set with scrolls and quills; a CHEF's with culinary motifs. Fuse the dragon crown with their profession. Intense orange-and-crimson ember light, fiery volcanic atmosphere, dramatic warm rim light, epic painterly fantasy look",
  galactic:  "vast cosmic frontier, a sleek high-tech spacesuit / power armor with glowing blue circuitry holding a futuristic helmet, towering crystalline sci-fi spires and a snowy alien world below, giant planets, nebula, drifting starships and a star-filled sky behind, cool electric blue and violet glow, illustrated anime space-opera look",
  vampire:   "eternal moonlit gothic night, a towering gothic castle with glowing crimson windows and bats swirling against a huge full moon behind, the figure as an elegant vampire noble in ornate dark gothic attire with a high collar, holding a glass of red wine, deep purples and crimson reds with silver moonlight, mysterious seductive mood, illustrated anime fantasy look",
};

// Age band derived from career seniority — keeps the portrait the user's real age,
// not an idealized young hero.
const AGE_BY_SENIORITY: Record<string, string> = {
  junior:    "a young adult in their mid-to-late 20s",
  mid:       "an adult in their early-to-mid 30s",
  senior:    "a mature adult in their late 30s to mid 40s",
  lead:      "a mature adult in their 40s",
  executive: "a distinguished adult in their late 40s to 50s",
};

function genderFromPronouns(p?: string): string {
  const s = (p || "").toLowerCase();
  if (s.includes("she")) return "a woman";
  if (s.includes("he")) return "a man";
  return "a person";
}

export async function POST(req: NextRequest) {
  try {
    const { profile, universeId, resumeAnalysis } = await req.json() as {
      profile: { alternativeName?: string; profession?: string; worldName?: string; worldDescription?: string; portrait?: string; personalityProfile?: string };
      universeId: UniverseType;
      resumeAnalysis?: ResumeAnalysis;
    };
    if (!profile || !universeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const u = getUniverse(universeId);
    const look = UNIVERSE_LOOK[universeId] ?? u.lore;

    const age = AGE_BY_SENIORITY[resumeAnalysis?.seniority ?? ""] ?? "an adult in their 30s";
    const gender = genderFromPronouns(resumeAnalysis?.pronouns);
    // Real-world grounding so the portrait reflects who the user actually is.
    const realField = resumeAnalysis?.industries?.[0];
    const realRole = [resumeAnalysis?.seniority, realField].filter(Boolean).join(" ");
    const grounding = realRole
      ? `In real life this person is a ${realRole} professional — carry their real-world bearing, build and presence (a ${gender}, ${age}) into this character.`
      : "";
    // Profession drives the wardrobe and the props the character holds.
    const vocation = [profile.profession, realField].filter(Boolean).join(", from a real-world background in ");
    const vocationCue = vocation
      ? `CRITICAL — the character's PROFESSION must be unmistakable from WHAT THEY WEAR and WHAT THEY HOLD. Dress them in clothing, uniform, robes or armor that signal a ${vocation} as it would exist in this world, and have them clearly WEARING or HOLDING the signature tools, instruments, weapons, garments or objects of that trade. For example: a farmer wears rugged work clothes and holds a scythe/sickle or bundles of harvested crops; a doctor or nurse wears healer's robes and holds medical instruments or herbs; an engineer wears a tool-rigged outfit and holds a wrench or device; a chef wears an apron and holds a blade or ladle; a teacher or scholar holds a book or scroll; a soldier wears armor and bears a weapon; a musician holds an instrument; a merchant carries wares or a ledger. Faithfully translate the real profession (${realRole || vocation}) into this universe's aesthetic so their craft is obvious at a single glance.`
      : "";

    const prompt = `${STYLE}

Character: ${gender}, ${age}, as ${profile.alternativeName || "a hero"}, ${profile.profession || "a legendary figure"} of ${profile.worldName || u.title}. ${grounding} ${profile.portrait || ""} Believable ${age} (a ${gender}), confident heroic expression — but drawn in the anime illustration style above, never a realistic photo of a real person.

${vocationCue}

Scene: ${look}. A single hero framed from the chest or waist up, turned slightly toward the viewer, against an atmospheric illustrated background. Bold anime rim lighting and glow, richly illustrated costume detail. Centered with headroom above the head. No text, no watermark, no logos, no UI, no border.`.trim();

    const image = await generateImage(prompt, "1024x1024");
    return NextResponse.json({ image });
  } catch (error: any) {
    console.error("Portrait generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
