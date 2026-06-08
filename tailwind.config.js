/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#27AE60",
        dark: "#1A1A2E",
        light: "#F4F6F9",
        accent: "#F39C12",
      },
    },
  },
  plugins: [],
};
