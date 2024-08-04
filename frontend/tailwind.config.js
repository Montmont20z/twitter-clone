import daisyui from 'daisyui';
import daisyuiUIThemes from 'daisyui/src/theming/themes';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      {
        black: {
          ...daisyuiUIThemes["black"],
          primary: "rgb(29, 155, 240)",
          secondary: "rgb(24,24,24)",
        },
      },
    ],
  },
}