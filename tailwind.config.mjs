/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        fontFamily: {
          'inter': ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'pulse-glow': 'pulse-glow 2s infinite',
          'bounce-gentle': 'bounceGentle 2s infinite',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { 
              transform: 'scale(1)',
              boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)'
            },
            '50%': { 
              transform: 'scale(1.05)',
              boxShadow: '0 0 20px rgba(52, 152, 219, 0.6)'
            }
          },
          'bounceGentle': {
            '0%, 20%, 50%, 80%, 100%': {
              transform: 'translateY(0)'
            },
            '40%': {
              transform: 'translateY(-10px)'
            },
            '60%': {
              transform: 'translateY(-5px)'
            }
          }
        }
      },
    },
    plugins: [],
  }