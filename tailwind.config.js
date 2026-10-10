/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,css}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        page: '#fffced',
        ink: '#1a1a1a',
        muted: '#6b7280',
        primary: { DEFAULT: '#1a1a1a', hover: '#333333' },
        badge: '#4a4a4a',
        line: '#dcdcd6',
        success: '#16a34a'
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif']
      },
      maxWidth: {
        content: '700px'
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        pop: 'pop 0.3s ease-out'
      }
    }
  }
};
