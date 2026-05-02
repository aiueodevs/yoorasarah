import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2b211e",
        clay: "#51403A",
        blush: "#fbf4ee",
        line: "#eaded5"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(43, 33, 30, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
