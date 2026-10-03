/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px'
      },
      colors: {
        // Nautical Light Cartographic Design Tokens (From Maritime Chart UI)
        'nautical-bg': '#EAF4F8',             // Pale ice-cyan maritime chart paper
        'nautical-card': '#FFFFFF',           // Crisp white instrument card
        'nautical-card-tint': '#F2F9FB',      // Subtle ice tint
        'nautical-panel': '#E2F0F5',          // Pale cyan observation card
        'nautical-panel-border': '#BCDCE6',   // Delicate nautical panel border
        'nautical-border': '#CCE4EC',         // Crisp 1px chart line border
        'nautical-border-subtle': '#E0EEF3',   // Hairline grid rule
        'nautical-navy': '#061219',           // Pitch naval black-navy
        'nautical-navy-surface': '#081622',   // Deep navbar & footer surface
        'nautical-teal': '#007A78',           // Primary hydrographic teal
        'nautical-teal-hover': '#006664',     // Hover state
        'nautical-teal-light': '#E1F3F5',     // Soft teal badge background
        'nautical-teal-border': '#B9E4E8',    // Soft teal badge border
        'nautical-ink': '#0A1B27',            // Deepest naval ink for headlines
        'nautical-ink-body': '#2D4454',       // Body paragraph slate-ink
        'nautical-ink-muted': '#5C7788',      // Secondary metadata ink
        'nautical-ink-subtle': '#809BAA',     // Delicate annotation ink
        'nautical-parchment': '#FDFBF7',      // Warm tactical verdict parchment
        'nautical-parchment-border': '#E5DCC9',// Warm tactical verdict border

        // Grounded Maritime Palette (Physical Naval Materials)
        'deep-sounding': '#091825',   // Deep Indian Ocean Navy
        'shoal-water': '#122534',     // Coastal shelf ground
        'shoal-card': '#162C3D',      // Working ledger card ground
        'shoal-high': '#1E384D',      // Elevated deck tier
        'chart-parchment': '#FAF6EE', // Warm sailcloth & ivory parchment
        'parchment-muted': '#A4B8C4', // Saline mist / secondary text
        'hull-red': '#C04B28',        // Red-lead oxide primer / squall veto
        'copper-patina': '#106644',   // Indian emerald / chlorophyll bloom
        'hemp-line': '#E86014',       // Indian saffron / maritime beacon
        'chart-grid': 'rgba(250, 246, 238, 0.12)',
        'chart-border': 'rgba(250, 246, 238, 0.18)',

        // Authentic Indian Palette Tokens
        'indian-navy': '#091825',
        'indian-navy-dark': '#061019',
        'indian-sand': '#FAF6EE',
        'indian-sand-dark': '#F0E9DC',
        'indian-saffron': '#E86014',
        'indian-saffron-bright': '#FF7722',
        'indian-saffron-light': '#FFEAD8',
        'indian-terracotta': '#C04B28',
        'indian-emerald': '#106644',
        'indian-emerald-light': '#E6F4ED',
        'indian-marigold': '#D4881A',
        'ink-dark': '#13222B',
        'ink-muted': '#4A5F6B',
        'ink-subtle': '#7E939E',

        // System Compatibility Mappings
        surface: '#091825',
        'surface-container-lowest': '#061019',
        'surface-container-low': '#0F2130',
        'surface-container': '#162C3D',
        'surface-container-high': '#1F384C',
        'surface-container-highest': '#2A475E',
        'on-surface': '#FAF6EE',
        'on-surface-variant': '#A4B8C4',
        outline: '#3B596E',
        'outline-variant': '#274355',

        primary: '#E86014',
        'primary-bright': '#FF7722',
        'primary-container': '#2D1808',
        secondary: '#106644',
        tertiary: '#D4881A',
        sustain: '#106644',
        warning: '#D4881A',
        error: '#C04B28'
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'ui-monospace', 'monospace'] // Deliberately mapped to tabular sans to prevent fake-tech mono
      },
      keyframes: {
        sounderSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pingPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        }
      },
      animation: {
        sounderSweep: 'sounderSweep 4s linear infinite',
        pingPulse: 'pingPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite'
      }
    }
  },
  plugins: []
}

