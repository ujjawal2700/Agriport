/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // MUI's CssBaseline handles global resets; disable Tailwind's preflight to avoid clashes.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF6F0',
          100: '#CDEADD',
          200: '#9DD4BC',
          300: '#66B894',
          400: '#389B73',
          500: '#1C7C58',
          600: '#15694A',
          700: '#11543B',
          800: '#0E432F',
          900: '#0A3324',
        },
        ink: {
          50: '#F6F7F9',
          100: '#EDEFF3',
          200: '#E2E6EC',
          300: '#CBD2DC',
          400: '#9AA4B2',
          500: '#6B7585',
          600: '#4E5765',
          700: '#3A4250',
          800: '#262C38',
          900: '#161B24',
        },
        amber: {
          400: '#E0A95A',
          500: '#C9842F',
          600: '#A66A1F',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-serif', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,27,36,0.04), 0 1px 3px rgba(22,27,36,0.06)',
        cardhover: '0 6px 16px rgba(22,27,36,0.08), 0 2px 6px rgba(22,27,36,0.05)',
        pop: '0 12px 32px rgba(22,27,36,0.14)',
      },
      borderRadius: {
        xl2: '1.125rem',
      },
    },
  },
  plugins: [],
}
