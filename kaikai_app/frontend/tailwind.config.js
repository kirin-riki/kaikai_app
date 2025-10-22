/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kai-indigo': '#4B5563',    // 界藍
        'kai-lavender': '#A5B4FC',  // 淡藤
        'kai-white': '#F9FAFB',     // 白磁
      },
      fontFamily: {
        'noto': ['"Noto Sans JP"', 'sans-serif'],
        'raleway': ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
