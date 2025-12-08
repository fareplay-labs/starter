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
  			/* === Core shadcn colors (CSS variable based) === */
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',

  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',

  			/* === Casino Brand Colors (FARE) === */
  			casino: {
  				salmon: 'hsl(var(--casino-salmon))',
  				blue: 'hsl(var(--casino-blue))',
  				pink: 'hsl(var(--casino-pink))',
  				peach: 'hsl(var(--casino-peach))',
  				aqua: 'hsl(var(--casino-aqua))',
  				gray: 'hsl(var(--casino-gray))',
  				black: 'hsl(var(--casino-black))',
  				/* Legacy aliases for backward compatibility */
  				dark: 'hsl(var(--surface-base))',
  				darker: 'hsl(var(--casino-black))',
  			},

  			/* === Semantic Colors === */
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				soft: 'hsl(var(--success-soft))',
  			},
  			warning: 'hsl(var(--warning))',
  			error: {
  				DEFAULT: 'hsl(var(--error))',
  				soft: 'hsl(var(--error-soft))',
  			},

  			/* === Surface Colors === */
  			surface: {
  				base: 'hsl(var(--surface-base))',
  				raised: 'hsl(var(--surface-raised))',
  				overlay: 'hsl(var(--surface-overlay))',
  			},

  			/* === Chart colors (shadcn) === */
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},

  		/* === Border Colors === */
  		borderColor: {
  			subtle: 'hsl(var(--border-subtle))',
  			DEFAULT: 'hsl(var(--border-default))',
  			strong: 'hsl(var(--border-strong))',
  		},

  		/* === Text Colors (extended) === */
  		textColor: {
  			primary: 'hsl(var(--text-primary))',
  			secondary: 'hsl(var(--text-secondary))',
  			muted: 'hsl(var(--text-muted))',
  		},

  		/* === Animations === */
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
  			'glow-pulse': 'glowPulse 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s infinite',
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { left: '-100%' },
  				'100%': { left: '100%' },
  			},
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
  			glowPulse: {
  				'0%, 100%': { boxShadow: '0 0 20px hsl(var(--casino-salmon) / 0.3)' },
  				'50%': { boxShadow: '0 0 40px hsl(var(--casino-salmon) / 0.5)' },
  			},
  		},

  		/* === Border Radius === */
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},

  		/* === Box Shadow (Casino glow effects) === */
  		boxShadow: {
  			'glow-sm': '0 0 10px hsl(var(--casino-salmon) / 0.2)',
  			'glow': '0 0 20px hsl(var(--casino-salmon) / 0.3)',
  			'glow-lg': '0 0 40px hsl(var(--casino-salmon) / 0.4)',
  			'glow-blue': '0 0 20px hsl(var(--casino-blue) / 0.3)',
  			'glow-aqua': '0 0 20px hsl(var(--casino-aqua) / 0.4)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
