/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hub Music Color Palette
        primary: {
          DEFAULT: '#FF4081', // Rosa vibrante
          light: '#FF80AB',
          dark: '#E0306E',
          foreground: '#FFFFFF'
        },
        background: {
          DEFAULT: '#000000', // Preto puro
          secondary: '#121212',
          tertiary: '#1E1E1E',
          card: '#1A1A1A',
          hover: '#252525'
        },
        // Aliases for CSS @apply directives
        card: '#1A1A1A',
        'card-hover': '#222222',
        'border-primary': '#333333',
        'border-light': '#404040',
        'border-focus': '#FF4081',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
        'text-muted': '#727272',
        'text-inverse': '#000000',
        success: '#4CAF50',
        'success-bg': '#4CAF5020',
        warning: '#FF9800',
        'warning-bg': '#FF980020',
        error: '#F44336',
        'error-bg': '#F4433620',
        info: '#00B0FF',
        'info-bg': '#00B0FF20',
        waveform: {
          played: '#FF4081',
          unplayed: '#404040',
          progress: '#FF4081'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-lg': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-md': ['1.875rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.5rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
        'button': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'player': '0 -4px 20px rgba(0, 0, 0, 0.5)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.7)',
        'glow': '0 0 20px rgba(255, 64, 129, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 64, 129, 0.4)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      transitionDuration: {
        '400': '400ms'
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      // Safe area utilities para dispositivos com notch (iPhone, etc)
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)'
      },
      margin: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)'
      }
    }
  },
  plugins: []
}
