/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        daterra: {
          primary: "#114037",
          "primary-hover": "#0d332c",
          secondary: "#1D734B",
          accent: "#3CA64C",
          "accent-light": "#eef8f0",
          bg: "#F2F2F2",
          card: "#FFFFFF",
          muted: "#64748B",
          dark: "#0F172A",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(17, 64, 55, 0.08)',
        'floating': '0 12px 32px -4px rgba(17, 64, 55, 0.16)',
      }
    },
  },
  plugins: [],
}
