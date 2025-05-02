import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ["var(--font-work-sans)", "sans-serif"],
      },
  		colors: {
        // Shadcn UI colors mapped to custom properties
  			background: 'hsl(var(--background))', // --white
  			foreground: 'hsl(var(--foreground))', // --black
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))', // --accent
  				foreground: 'hsl(var(--primary-foreground))' // --white
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))', // --grey
  				foreground: 'hsl(var(--secondary-foreground))' // --white
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))', // --accent
  				foreground: 'hsl(var(--accent-foreground))' // --white
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
        success: 'hsl(var(--success))', // Added custom success color
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))', // --accent
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        // Explicit custom colors for direct use if needed
        'custom-accent': 'hsl(var(--accent))',
        'custom-black': 'hsl(var(--black))',
        'custom-white': 'hsl(var(--white))',
        'custom-grey': 'hsl(var(--grey))',
        'custom-success': 'hsl(var(--success))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)', // 0.125rem
  			md: 'calc(var(--radius) - 1px)', // Adjusted slightly smaller
  			sm: 'calc(var(--radius) - 2px)' // Adjusted slightly smaller
  		},
      fontSize: {
        base: '1rem', // 16px
        '4xl': ['4rem', { fontWeight: '900' }], // h1
        '2xl': ['2.5rem', { fontWeight: '700' }], // h2
      },
      fontWeight: {
        normal: '400',
        semibold: '600', // Added for buttons
        bold: '700',
        black: '900',
      },
      lineHeight: {
        normal: '1.5',
      },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
