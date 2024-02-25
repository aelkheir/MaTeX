/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/renderer/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--color-on-secondary) / <alpha-value>)",
        "primary-container":
          "rgb(var(--color-primary-container) / <alpha-value>)",
        "on-primary-container":
          "rgb(var(--color-on-primary-container) / <alpha-value>)",
        "secondary-container":
          "rgb(var(--color-secondary-container) / <alpha-value>)",
        "on-secondary-container":
          "rgb(var(--color-on-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--color-on-tertiary) / <alpha-value>)",
        "tertiary-container":
          "rgb(var(--color-tertiary-container) / <alpha-value>)",
        "on-tertiary-container":
          "rgb(var(--color-on-tertiary-container) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "on-error": "rgb(var(--color-on-error) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        "on-surface-variant":
          "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "surface-tint": "rgb(var(--color-surface-tint) / <alpha-value>)",
        surface1: "rgb(var(--color-surface1) / <alpha-value>)",
        surface2: "rgb(var(--color-surface2) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",

        "ref-primary-0": "rgb(var(--color-ref-primary-00) / <alpha-value>)",
        "ref-primary-10": "rgb(var(--color-ref-primary-10) / <alpha-value>)",
        "ref-primary-20": "rgb(var(--color-ref-primary-20) / <alpha-value>)",
        "ref-primary-30": "rgb(var(--color-ref-primary-30) / <alpha-value>)",
        "ref-primary-40": "rgb(var(--color-ref-primary-40) / <alpha-value>)",
        "ref-primary-50": "rgb(var(--color-ref-primary-50) / <alpha-value>)",
        "ref-primary-60": "rgb(var(--color-ref-primary-60) / <alpha-value>)",
        "ref-primary-70": "rgb(var(--color-ref-primary-70) / <alpha-value>)",
        "ref-primary-80": "rgb(var(--color-ref-primary-80) / <alpha-value>)",
        "ref-primary-90": "rgb(var(--color-ref-primary-90) / <alpha-value>)",
        "ref-primary-95": "rgb(var(--color-ref-primary-95) / <alpha-value>)",
        "ref-primary-99": "rgb(var(--color-ref-primary-99) / <alpha-value>)",
        "ref-primary-100": "rgb(var(--color-ref-primary-100) / <alpha-value>)",

        "ref-neutral-80": "rgb(var(--color-ref-neutral-80) / <alpha-value>)",
      },
    },
  },
  plugins: [require("tailwindcss-react-aria-components")],
};
