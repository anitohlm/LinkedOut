"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { getAllUniverses } from "@/lib/universes";
import UniverseIcon from "@/components/UniverseIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface LandingProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
  savedExists?: boolean;
  onResume?: () => void;
  onNewGame?: () => void;
  savedScreen?: AppScreenState;
}

const SCREEN_LABELS: Partial<Record<AppScreenState, string>> = {
  "universe-discovery": "exploring your multiverse",
  "identity-reconstruction": "viewing a universe self",
  "future-transmission": "mid-conversation with a future self",
  "multiverse-invitations": "reviewing recruiter offers",
  "butterfly-effect": "fracturing your timeline",
  "council-of-selves": "at the Council of Selves",
  "chronicle": "reading your chronicle",
};

const ACCENT = "#3b9eff"; // LinkedOut blue

// Centered carousel of big universe cards.
const UNIVERSE_CAROUSEL_CSS = `
  .lo-universe-swiper { padding: 16px 0 60px; margin-top: 36px; overflow: visible; }
  .lo-universe-slide { width: 300px; max-width: 80vw; }
  .lo-universe-swiper .swiper-pagination { bottom: 14px; }
  .lo-universe-swiper .swiper-pagination-bullet { background: rgba(255,255,255,0.4); opacity: 0.5; }
  .lo-universe-swiper .swiper-pagination-bullet-active { background: ${ACCENT}; opacity: 1; width: 22px; border-radius: 4px; }
  .lo-universe-swiper .swiper-button-next, .lo-universe-swiper .swiper-button-prev { color: ${ACCENT}; }
  .lo-universe-swiper .swiper-button-next::after, .lo-universe-swiper .swiper-button-prev::after { font-size: 26px; font-weight: 700; }
  @media (max-width: 560px) {
    .lo-universe-slide { width: 260px; }
    .lo-universe-swiper .swiper-button-next, .lo-universe-swiper .swiper-button-prev { display: none; }
  }
`;

// Short, punchy per-universe blurbs for the explore grid.
const UNIVERSE_BLURB: Record<string, string> = {
  medieval:  "Lead, strategize, and carve your legacy in an ancient realm of forests, kingdoms, and old honor.",
  cyberpunk: "Innovate, disrupt, and rise in a future driven by technology and ambition.",
  pirate:    "Explore, adapt, and conquer uncharted waters brimming with opportunity.",
  dragon:    "Harness power, follow wisdom, and ascend in a land of dragons and old magic.",
  galactic:  "Venture beyond the stars and shape the future across the cosmos.",
  vampire:   "Embrace the shadows, master the night, and thrive in a world of secrets.",
};

// Five-step "how the system works" content.
const STEPS = [
  { n: "01", title: "Create Your Profile", body: "Tell us about your skills, experience, and ambitions." },
  { n: "02", title: "AI Analysis", body: "Our AI reads your Career DNA and maps your essence." },
  { n: "03", title: "Generate Multiverse", body: "Six alternate selves are rendered across six worlds." },
  { n: "04", title: "Explore & Interact", body: "Talk to your selves, take offers, and uncover insights." },
  { n: "05", title: "Shape Your Destiny", body: "Use what you learn to shape the future you choose." },
];

function StepIcon({ n }: { n: string }) {
  const c = ACCENT;
  const s = { stroke: c, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    "01": <><circle cx="12" cy="8" r="3.5" {...s} /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" {...s} /></>,
    "02": <><circle cx="12" cy="12" r="3" {...s} /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" {...s} /></>,
    "03": <><circle cx="12" cy="12" r="9" {...s} /><ellipse cx="12" cy="12" rx="9" ry="3.6" {...s} /><path d="M12 3v18" {...s} /></>,
    "04": <><path d="M12 2 4 7v10l8 5 8-5V7l-8-5z" {...s} /><path d="M14.5 9.5 11 11l-1.5 3.5L13 13l1.5-3.5z" {...s} /></>,
    "05": <><path d="M12 2l2.6 6.3L21 9l-5 4.3L17.5 21 12 17.2 6.5 21 8 13.3 3 9l6.4-.7L12 2z" {...s} /></>,
  };
  return <svg width="26" height="26" viewBox="0 0 24 24">{paths[n]}</svg>;
}

export default function Landing({ transitionTo, savedExists, onResume, onNewGame, savedScreen }: LandingProps) {
  const universes = getAllUniverses();
  const start = () => { onNewGame?.(); transitionTo("upload-resume"); };

  return (
    <div style={{ minHeight: "100vh", background: "#060710", color: "var(--text)", overflowX: "hidden", position: "relative" }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "url('/landing/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center top" }} />
        {/* Legibility + fade-to-page overlays */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(6,7,16,0.55) 0%, rgba(6,7,16,0.35) 40%, rgba(6,7,16,0.82) 82%, #060710 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(6,7,16,0.6) 100%)" }} />

        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
          style={{ position: "relative", zIndex: 2, maxWidth: 760, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Logo */}
          <motion.img
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
            src="/landing/logo.png" alt="LinkedOut"
            style={{ width: "min(620px, 88vw)", height: "auto", filter: "drop-shadow(0 6px 34px rgba(59,158,255,0.4))", marginBottom: 4 }}
          />

          {/* Tagline */}
          <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            style={{ fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.42em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 36, paddingLeft: "0.42em" }}>
            The AI Multiverse Experience
          </motion.p>

          {/* Three-line promise */}
          <motion.h1 variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
            style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: "clamp(22px, 3.4vw, 34px)", lineHeight: 1.5, letterSpacing: "0.08em", color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: "0 0 40px" }}>
            One Career Profile.<br />Six Universes.<br />
            Countless <span style={{ color: ACCENT, textShadow: `0 0 28px ${ACCENT}66` }}>Possibilities.</span>
          </motion.h1>

          {/* CTA */}
          <motion.button
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            onClick={start}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 34px", borderRadius: 100,
              fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
              color: "#fff", cursor: "pointer",
              background: `linear-gradient(135deg, ${ACCENT}, #1f6fe0)`,
              border: `1px solid ${ACCENT}`, boxShadow: `0 10px 40px -8px ${ACCENT}aa, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            <SparkleGlyph /> Generate Your Multiverse
          </motion.button>

          {/* Resume saved journey */}
          {savedExists && (
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
              style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 14,
                background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.32)", backdropFilter: "blur(8px)", maxWidth: 480 }}>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cyan2)" }}>Continue your journey</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  You left off {savedScreen && SCREEN_LABELS[savedScreen] ? SCREEN_LABELS[savedScreen] : "in your multiverse"}.
                </div>
              </div>
              <button onClick={() => onResume?.()}
                style={{ padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "var(--cyan)", color: "#06121a", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                Resume →
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5, y: [0, 8, 0] }} transition={{ delay: 1, duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: 24, zIndex: 2 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>
      </section>

      {/* ═══════════════ EXPLORE SIX UNIVERSES ═══════════════ */}
      <section style={{ position: "relative", padding: "20px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeading kicker="Explore" title="Six Unique Universes" />

        <style>{UNIVERSE_CAROUSEL_CSS}</style>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          centeredSlides
          slidesPerView="auto"
          spaceBetween={28}
          rewind
          speed={900}
          autoplay={{ delay: 2400, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation
          pagination={{ clickable: true }}
          className="lo-universe-swiper"
        >
          {universes.map((u) => (
            <SwiperSlide key={u.id} className="lo-universe-slide">
              <UniverseCard u={u} blurb={UNIVERSE_BLURB[u.id]} onExplore={start} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ═══════════════ HOW THE SYSTEM WORKS ═══════════════ */}
      <section style={{ position: "relative", padding: "40px 24px 90px", maxWidth: 1100, margin: "0 auto" }}>
        {/* ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300,
          background: `radial-gradient(ellipse, ${ACCENT}14, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
        <SectionHeading kicker="The Process" title="How the System Works" />

        <div style={{ position: "relative", marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28 }}>
          {/* connecting line (desktop) */}
          <div aria-hidden style={{ position: "absolute", top: 26, left: "8%", right: "8%", height: 1,
            background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)`, zIndex: 0 }} />
          {STEPS.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "radial-gradient(circle at 35% 30%, rgba(59,158,255,0.22), rgba(11,13,24,0.95))",
                border: `1px solid ${ACCENT}55`, boxShadow: `0 0 24px ${ACCENT}33`, marginBottom: 16 }}>
                <StepIcon n={s.n} />
              </div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: ACCENT, marginBottom: 8 }}>{s.n}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "0.02em" }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0, maxWidth: 200 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FOOTER TAGLINE ═══════════════ */}
      <footer style={{ position: "relative", padding: "30px 24px 70px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div aria-hidden style={{ width: 1, height: 40, margin: "0 auto 28px", background: `linear-gradient(${ACCENT}, transparent)` }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(15px, 2.4vw, 20px)", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.82)", lineHeight: 1.9, margin: 0 }}>
            Your Journey. Infinite Possibilities.<br />
            One <span style={{ color: ACCENT }}>Link</span> To Them All.
          </p>
          <button onClick={start}
            style={{ marginTop: 34, padding: "13px 30px", borderRadius: 100, cursor: "pointer",
              fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
              background: "transparent", color: "#fff", border: `1px solid ${ACCENT}88`, transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACCENT; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Begin Your Multiverse →
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 40 }}>
            Powered by Azure AI Foundry · A narrative career multiverse
          </p>
        </motion.div>
      </footer>
    </div>
  );
}

/* ── Premium AAA universe selection card — flips to reveal details ── */
function UniverseCard({ u, blurb, onExplore }: { u: { id: string; title: string; color: string }; blurb: string; onExplore: () => void }) {
  const c = u.color;
  const [hover, setHover] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const corners = [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]] as const;

  const faceBase: React.CSSProperties = {
    position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden",
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: "#06070f",
  };
  const cornerEls = corners.map(([v, h]) => {
    const st = {
      position: "absolute", width: 14, height: 14, opacity: hover ? 1 : 0.7, transition: "opacity 0.3s", zIndex: 3,
      [v]: 9, [h]: 9,
      ...(v === "top" ? { borderTop: `2px solid ${c}` } : { borderBottom: `2px solid ${c}` }),
      ...(h === "left" ? { borderLeft: `2px solid ${c}` } : { borderRight: `2px solid ${c}` }),
    } as React.CSSProperties;
    return <span key={`${v}${h}`} style={st} />;
  });

  return (
    <motion.div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      whileHover={{ y: -8 }}
      style={{ position: "relative", aspectRatio: "9 / 16", width: "100%", perspective: 1400, cursor: "pointer", fontFamily: "Sora, sans-serif" }}
    >
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d",
        transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>

        {/* ───── FRONT ───── */}
        <div onClick={() => setFlipped(true)}
          style={{ ...faceBase, border: `1px solid ${c}${hover ? "dd" : "55"}`,
            boxShadow: hover ? `0 30px 70px -20px ${c}aa, 0 0 34px ${c}55, inset 0 0 40px ${c}22`
                             : `0 18px 50px -24px ${c}66, inset 0 0 28px ${c}14`,
            transition: "box-shadow 0.3s, border-color 0.3s" }}>
          {/* artwork */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(/landing/card-${u.id}.png)`, backgroundSize: "cover", backgroundPosition: "center",
            transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform 0.6s ease" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,5,12,0.66) 0%, transparent 26%, transparent 52%, rgba(4,5,12,0.82) 84%, rgba(4,5,12,0.96) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 55% at 50% 112%, ${c}3a, transparent 62%)`, opacity: hover ? 1 : 0.7, transition: "opacity 0.3s" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: hover ? 1 : 0.55 }} />
          {cornerEls}
          {[0, 1, 2, 3].map(k => (
            <motion.span key={k} animate={{ y: [0, -14, 0], opacity: [0.12, 0.55, 0.12] }} transition={{ duration: 3 + k, repeat: Infinity, delay: k * 0.6, ease: "easeInOut" }}
              style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, top: `${30 + k * 13}%`, left: `${18 + k * 20}%`, pointerEvents: "none" }} />
          ))}
          {/* icon + title */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 14px 0", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: `radial-gradient(circle at 40% 35%, ${c}44, rgba(6,7,15,0.85))`, border: `1px solid ${c}88`, boxShadow: `0 0 18px ${c}66` }}>
              <UniverseIcon id={u.id} size={24} color={c} strokeWidth={1.6} />
            </div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#fff", margin: 0, lineHeight: 1.3, textAlign: "center", textShadow: `0 1px 10px rgba(0,0,0,0.85), 0 0 16px ${c}55` }}>
              {u.title}
            </h3>
          </div>
          {/* flip hint */}
          <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, zIndex: 2, display: "flex", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100,
              fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
              color: hover ? "#06070f" : c, background: hover ? c : "rgba(6,7,15,0.6)", backdropFilter: "blur(6px)",
              border: `1px solid ${c}`, boxShadow: hover ? `0 0 18px ${c}88` : "none", transition: "all 0.25s" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" stroke={hover ? "#06070f" : c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Details
            </span>
          </div>
        </div>

        {/* ───── BACK ───── */}
        <div onClick={() => setFlipped(false)}
          style={{ ...faceBase, transform: "rotateY(180deg)", border: `1px solid ${c}aa`,
          boxShadow: hover ? `0 30px 70px -20px ${c}aa, 0 0 30px ${c}44` : `0 18px 50px -24px ${c}66`,
          display: "flex", flexDirection: "column" }}>
          {/* darkened blurred art */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(/landing/card-${u.id}.png)`, backgroundSize: "cover", backgroundPosition: "center",
            filter: "blur(3px) brightness(0.38)", transform: "scale(1.12)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, rgba(6,7,15,0.86), rgba(6,7,15,0.94)), radial-gradient(110% 60% at 50% 0%, ${c}30, transparent 62%)` }} />
          {cornerEls}
          {/* flip-back button */}
          <button onClick={(e) => { e.stopPropagation(); setFlipped(false); }} aria-label="Flip back"
            style={{ position: "absolute", top: 10, left: 10, zIndex: 4, width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(6,7,15,0.6)", backdropFilter: "blur(6px)", border: `1px solid ${c}66`, color: c }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {/* content */}
          <div style={{ position: "relative", zIndex: 2, flex: 1, padding: "22px 18px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: `radial-gradient(circle at 40% 35%, ${c}44, rgba(6,7,15,0.85))`, border: `1px solid ${c}88`, boxShadow: `0 0 18px ${c}66` }}>
              <UniverseIcon id={u.id} size={22} color={c} strokeWidth={1.6} />
            </div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: c, margin: 0, lineHeight: 1.3 }}>
              {u.title}
            </h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: 0 }}>
              {blurb}
            </p>
            <div style={{ width: "70%", height: 1, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, boxShadow: `0 0 8px ${c}` }} />
            <button onClick={(e) => { e.stopPropagation(); onExplore(); }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "11px 0", borderRadius: 9, cursor: "pointer",
                fontFamily: "Sora, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#06070f", background: c, border: `1px solid ${c}`, boxShadow: `0 0 22px ${c}77`, transition: "all 0.25s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${c}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 22px ${c}77`; }}>
              Explore
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#06070f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* ── Small shared bits ── */
function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
      style={{ textAlign: "center" }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT, marginBottom: 14, paddingLeft: "0.28em" }}>
        {kicker}
      </p>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(24px, 3.4vw, 36px)", fontWeight: 600, letterSpacing: "0.06em", color: "#fff", margin: 0 }}>
        {title}
      </h2>
      <div aria-hidden style={{ width: 60, height: 2, margin: "18px auto 0", borderRadius: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
    </motion.div>
  );
}

function SparkleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="#fff" />
    </svg>
  );
}
