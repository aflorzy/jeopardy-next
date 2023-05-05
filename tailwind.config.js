/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        "itc-korinna-std": ["itc-korinna-std", "sans-serif"],
        itc_korinna: ["itc_korinna", "sans-serif"],
        korinna: ["korinna", "sans-serif"],
        "itc-korinna": ["itc-korinna", "sans-serif"],
        "itc-korinna-lt1": ["itc-korinna-lt1", "sans-serif"],
        "itc-korinna-lt2": ["itc-korinna-lt2", "sans-serif"],
        "itc-korinna-lt3": ["itc-korinna-lt3", "sans-serif"],
        "swiss-911-compressed": ["swiss-911-compressed", "sans-serif"],
      },
    },
  },
  plugins: [],
};
