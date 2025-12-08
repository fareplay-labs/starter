/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			casino: {
  				dark: '#0a0a0a',
  				darker: '#050505',
  				card: '#1a1a1a',
  				border: '#2a2a2a',
  				accent: '#fbbf24',
  				green: '#10b981',
  				red: '#ef4444'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'spin-slow': 'spin 3s linear infinite',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'icon-pop': 'iconPop 0.5s ease forwards',
  			'loading-dots': 'loadingDots 1.5s infinite',
  			'fade-in': 'fadeIn 0.3s ease forwards',
  			'fade-out': 'fadeOut 0.3s ease forwards',
  			'edit-circle-pop': 'editCirclePop 0.3s ease forwards',
  			'edit-circle-pulse': 'editCirclePulse 2s ease-in-out infinite',
  			'pulse-text': 'pulseText 1s linear infinite alternate',
  			'line-reveal-left': 'lineReveal 2s ease-out forwards',
  			'line-reveal-right': 'lineReveal 2s ease-out forwards',
  		},
  		keyframes: {
  			iconPop: {
  				'0%': { transform: 'scale(0)', opacity: '0' },
  				'50%': { transform: 'scale(1.2)', opacity: '1' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			loadingDots: {
  				'0%': { content: '"."' },
  				'33%': { content: '".."' },
  				'66%': { content: '"..."' },
  				'100%': { content: '"."' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			fadeOut: {
  				'0%': { opacity: '1' },
  				'100%': { opacity: '0' },
  			},
  			editCirclePop: {
  				'0%': { transform: 'scale(0)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			editCirclePulse: {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
  				'50%': { boxShadow: '0 0 0 8px rgba(255, 255, 255, 0)' },
  			},
  			pulseText: {
  				'0%': { opacity: '0.6', transform: 'scale(0.98) translateY(0)' },
  				'50%': { opacity: '0.8', transform: 'scale(1) translateY(-1px)' },
  				'100%': { opacity: '1', transform: 'scale(1.02) translateY(-2px)' },
  			},
  			lineReveal: {
  				'0%': { transform: 'scaleX(0)' },
  				'100%': { transform: 'scaleX(1)' },
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

