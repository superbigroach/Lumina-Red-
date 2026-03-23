import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fdf3ee',
          100: '#fbe4d6',
          200: '#f5c5ac',
          300: '#ef9f78',
          400: '#e87343',
          500: '#C2652A',
          600: '#b24e1a',
          700: '#943c17',
          800: '#77321a',
          900: '#622c19',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0D9488',
          600: '#0d7a70',
          700: '#0f6259',
          800: '#114e48',
          900: '#13403c',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F59E0B',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        warm: {
          50: '#fefcf9',
          100: '#fdf6ed',
          200: '#faecd6',
          900: '#2d1b0e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
