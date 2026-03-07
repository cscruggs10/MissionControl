import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nebula design system (light mode)
        nebula: {
          bg: "#F5F3EF",          // Soft cream background
          surface: "#FFFFFF",      // Card/surface white
          text: "#1A1A1A",        // Primary text
          "text-muted": "#6B6B6B", // Secondary text
          "text-light": "#9B9B9B", // Tertiary text
          border: "#E5E5E5",      // Borders/dividers
          "border-light": "#F0F0F0", // Subtle borders
          accent: "#34C759",      // Green accent (online/active)
          "accent-muted": "#E8F5E9", // Light green background
          blue: "#007AFF",        // Blue accent
          "blue-muted": "#E3F2FD", // Light blue background
        },
        // Dark mode variants
        "nebula-dark": {
          bg: "#1C1C1E",          // Soft dark background
          surface: "#2C2C2E",      // Card/surface dark
          text: "#F5F5F7",        // Primary text (light)
          "text-muted": "#AEAEB2", // Secondary text
          "text-light": "#8E8E93", // Tertiary text
          border: "#38383A",      // Borders/dividers
          "border-light": "#2C2C2E", // Subtle borders
          accent: "#32D74B",      // Green accent (slightly brighter)
          "accent-muted": "#1C3A23", // Dark green background
          blue: "#0A84FF",        // Blue accent (brighter)
          "blue-muted": "#1C2A3A", // Dark blue background
        },
        // Keep dark theme colors for reference
        gray: {
          850: "#1a1d24",
          950: "#0a0c10",
        },
      },
    },
  },
  plugins: [],
};
export default config;
