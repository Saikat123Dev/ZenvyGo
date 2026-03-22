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
        // Brand Blue Scale
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Semantic Colors
        success: {
          light: '#CCFBF1',
          DEFAULT: '#0D9488',
          dark: '#0F766E',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        danger: {
          light: '#FFE4E6',
          DEFAULT: '#E11D48',
          dark: '#BE123C',
        },
        info: {
          light: '#E0F2FE',
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
        },
        // Surface Colors (Light Mode)
        surface: {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
        },
        // Surface Colors (Dark Mode)
        'surface-dark': {
          primary: '#1E293B',
          secondary: '#0F172A',
          tertiary: '#020617',
        },
      },
      fontFamily: {
        sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        'h1': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'h4': ['18px', { lineHeight: '26px' }],
        'body-lg': ['17px', { lineHeight: '26px' }],
        'body': ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
        'overline': ['11px', { lineHeight: '16px', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
