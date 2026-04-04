/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg_primary: "#0A0A0A",
        bg_surface: "#111111",
        bg_elevated: "#1A1A1A",
        bg_card: "#141414",
        accent_red: "#E8453C",
        accent_amber: "#F5A623",
        accent_green: "#2ECC71",
        text_primary: "#FFFFFF",
        text_secondary: "#9B9B9B",
        border: "rgba(255,255,255,0.08)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
};
