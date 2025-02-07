import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        moveRight: "moveRight 1s ease-in-out infinite alternate",
        moveLeft: "moveLeft 1s ease-in-out infinite alternate",
        moveUp: "moveUp 1s ease-in-out infinite alternate",
        moveDown: "moveDown 1s ease-in-out infinite alternate",
        moveUpReset: "moveUpReset 2s linear infinite",
        moveUpResetFade: "moveUpResetFade 2s linear infinite",
        colorChange: "colorChange 2s ease-in-out infinite",
        fadeSlide: "fadeSlide 0.6s ease-in-out",
      },
      keyframes: {
        moveRight: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(5px)" },
        },
        moveLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-5px)" },
        },
        moveUp: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-10px)" },
        },
        moveDown: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(5px)" },
        },
        moveUpResetFade: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "50%": { opacity: "0" },
          "100%": { transform: "translateY(-100px)", opacity: "0" },
        },
        moveUpReset: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100px)" },
        },
        colorChange: {
          "0%": { backgroundColor: "#FF5733" },
          "50%": { backgroundColor: "#33FF57" },
          "100%": { backgroundColor: "#FF5733" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
