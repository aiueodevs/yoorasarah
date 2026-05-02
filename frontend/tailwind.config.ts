import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241b19",
        "ink-soft": "#5f504c",
        muted: "#9a7e71",
        peach: "#e8b6a6",
        cream: "#fbf7f2",
        cocoa: "#3d261f"
      },
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
        nav: ['"Gambetta"', '"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
        sentient: ['"Sentient"', '"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
        sans: ['"Segoe UI"', '"Helvetica Neue"', "Arial", "sans-serif"],
        cabinet: ['"Cabinet Grotesk"', '"Satoshi"', "Arial", "sans-serif"]
      },
      boxShadow: {
        panel: "0 40px 100px rgba(30,20,15,0.15), inset 0 1px 1px rgba(255,255,255,1)",
        soft: "0 28px 90px rgba(69,43,33,0.08)"
      },
      keyframes: {
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" }
        }
      },
      animation: {
        ticker: "ticker 42s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
