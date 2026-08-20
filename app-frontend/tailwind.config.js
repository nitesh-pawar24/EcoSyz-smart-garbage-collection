/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: This points to your 'app' folder
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6B5BFF", // Your purple color
      },
    },
  },
  plugins: [],
};