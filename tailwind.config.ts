import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        cream: "#F5F2EE",
        ink: "#0F0E0C",
        stone: "#8C8580",
        accent: "#C9A96E",
        "accent-light": "#E8D5B0",
        muted: "#E8E4DF",
      },
      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.3em",
      },
      fontSize: {
        "10xl": "10rem",
        "12xl": "12rem",
      },
    },
  },
  plugins: [],
};

export default config;
