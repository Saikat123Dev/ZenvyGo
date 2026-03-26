/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Modern Monochrome & Minimalist Neutral Scale
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Neutral text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Premium Brand Color (Vibrant Violet)
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        warning: {
          light: '#FFFBEB',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        danger: {
          light: '#FEF2F2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
        success: {
          light: '#ECFDF5',
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F4F4F5',
        },
        'surface-dark': {
          primary: '#040405',
          secondary: '#0E0E12',
          tertiary: '#15151A',
        },
      },
      fontFamily: {
        sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
        'h1': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em' }],
        'h3': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'h4': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'body': ['15px', { lineHeight: '22px', letterSpacing: '0em' }],
        'body-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.01em' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'DEFAULT': '12px', // Very rounded buttons and cards for modern look
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.05)',
        md: '0 8px 24px rgba(0, 0, 0, 0.08)',
        lg: '0 16px 32px rgba(0, 0, 0, 0.12)',
        xl: '0 24px 48px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};
