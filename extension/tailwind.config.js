/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: '#10121A',
        surface: '#191C27',
        surface2: '#20232F',
        border: '#2A2E3D',
        text: '#EDEEF5',
        muted: '#8B8FA3',
        signal: {
          DEFAULT: '#FFB238',
          dim: '#8A5C1E',
        },
        graph: {
          DEFAULT: '#5FD4D0',
          dim: '#2E5F5D',
        },
        danger: '#FF6B6B',
        success: '#6EE7B7',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      keyframes: {
        dissolve: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ghostFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        dissolve: 'dissolve 0.5s ease-out',
        ghostFloat: 'ghostFloat 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
