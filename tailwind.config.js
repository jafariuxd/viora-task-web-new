/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        viora: {
          bg: "#000000",
          weather: "#D3E2FF",
          calendar: "#CBEA97",
          unplanned: "#FBE38A",
          task: "#FFFFFF",
          pill: "#2A2B2D",
          grayText: "#5E6064",
          badgeBg: "#E5F1FF",
          badgeText: "#386B99",
          darkText: "#1E2022",
          neonLime: "#B4FF00",
        }
      },
      fontFamily: {
        sans: ["SF Pro Display", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        inter: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sf: ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      }
    },
  },
  plugins: [],
}

