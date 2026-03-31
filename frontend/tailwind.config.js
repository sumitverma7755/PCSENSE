/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./main.html"],
  safelist: ["translate-y-[120%]"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",
          accent: "#3b82f6",
          glass: "rgba(15, 23, 42, 0.8)"
        }
      },
      animation: {
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
