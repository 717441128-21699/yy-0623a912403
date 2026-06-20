/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'cold-deep': '#0A3D62',
        'cold-deeper': '#062A45',
        'ice': '#00CEC9',
        'ice-light': '#55E6E2',
        'safe-green': '#26DE81',
        'warn-orange': '#FDCB6E',
        'danger-red': '#E74C3C',
        'ink-dark': '#2D3436',
        'ink-gray': '#636E72',
        'ink-light': '#B2BEC3',
        'surface': '#F8FAFC',
        'surface-dark': '#0F172A',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(10, 61, 98, 0.08)',
        'glow-green': '0 0 30px rgba(38, 222, 129, 0.4)',
        'glow-red': '0 0 30px rgba(231, 76, 60, 0.4)',
        'glow-ice': '0 0 40px rgba(0, 206, 201, 0.35)',
      },
      animation: {
        'breath': 'breath 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(38, 222, 129, 0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(38, 222, 129, 0)' },
        },
      },
    },
  },
  plugins: [],
};
