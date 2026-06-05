import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08090d",
          2: "#0e1018",
          3: "#14161f",
          4: "#1a1d29",
        },
        surface: {
          DEFAULT: "#1e2133",
          2: "#252a3d",
          3: "#2d3347",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          2: "rgba(255,255,255,0.13)",
          3: "rgba(255,255,255,0.21)",
        },
        tx: {
          DEFAULT: "#f0f2ff",
          2: "#a8adc8",
          3: "#6b7094",
        },
        gold: {
          DEFAULT: "#e8c97e",
          2: "#f5dfa0",
          3: "#c9a84c",
        },
        violet: {
          DEFAULT: "#7c6ef7",
          2: "#9d91ff",
          3: "#5a4fd4",
        },
        cyan: {
          DEFAULT: "#4ecdc4",
          2: "#7ee8e1",
          3: "#2db8af",
        },
        rose: {
          DEFAULT: "#f07070",
          2: "#ff9595",
          3: "#d44f4f",
        },
        amber: {
          DEFAULT: "#f0a050",
          2: "#ffc278",
          3: "#c97d30",
        },
      },
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        serif: ["Crimson Pro", "serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 4s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.4s ease forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
