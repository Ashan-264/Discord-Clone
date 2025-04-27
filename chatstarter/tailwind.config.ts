import type { Config } from "tailwindcss";

import tailwindcssAnimate from "tailwindcss-animate";
import daisyui from "daisyui";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: "hsl(var(--muted))",
        "muted-fore": "hsl(var(--muted-fore))",
        primary: "hsl(var(--primary))",
        "primary-fore": "hsl(var(--primary-fore))",
        accent: "hsl(var(--accent))",
        "accent-fore": "hsl(var(--accent-fore))",
      },
    },
  },
  plugins: [tailwindcssAnimate, daisyui],
  daisyui: {
    themes: [
      {
        /* LIGHT MODE THEME */
        "emerald-blue-light": {
          primary: "hsl(var(--primary))",
          "primary-content": "hsl(var(--primary-fore))",
          neutral: "hsl(var(--surface))",
          "base-100": "hsl(var(--background))",
          "base-200": "hsl(var(--muted))",
          "base-content": "hsl(var(--foreground))",
          accent: "hsl(var(--accent))",
          "accent-content": "hsl(var(--accent-fore))",
        },
      },
      {
        /* DARK MODE THEME */
        "emerald-blue-dark": {
          primary: "hsl(var(--primary))",
          "primary-content": "hsl(var(--primary-fore))",
          neutral: "hsl(var(--surface))",
          "base-100": "hsl(var(--background))",
          "base-200": "hsl(var(--muted))",
          "base-content": "hsl(var(--foreground))",
          accent: "hsl(var(--accent))",
          "accent-content": "hsl(var(--accent-fore))",
        },
      },
    ],
    darkTheme: "emerald-blue-dark",
  },
};

export default config;
