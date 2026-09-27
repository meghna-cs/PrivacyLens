import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        paper: "#EFEDE2",
        "paper-dim": "#E4E0CE",
        seal: "#3F6E64",
        "seal-dark": "#2C4E47",
        amber: "#B9832E",
        rose: "#A8425A",
        moss: "#5B7A52",
        line: "#C9C2A6"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px"
      }
    }
  },
  plugins: []
};

export default config;
