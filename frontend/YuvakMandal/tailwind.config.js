// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./dist/index.html",
    ],
    theme: {
      extend: {
        animation: {
          shimmer: "shimmer 2s infinite linear",
          pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
        keyframes: {
          shimmer: {
            "0%": { backgroundPosition: "200% 0" },
            "100%": { backgroundPosition: "0 0" },
          },
          pulse: {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.5 },
          },
        },
      },
    },
    plugins: [],
  };