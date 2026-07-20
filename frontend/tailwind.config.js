/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0F19',
        glass: '#1E293B',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      boxShadow: {
        glow: '0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'career-grid':
          'radial-gradient(circle at 12% 12%, rgba(99, 102, 241, 0.34), transparent 28%), radial-gradient(circle at 82% 4%, rgba(56, 189, 248, 0.14), transparent 24%), linear-gradient(135deg, #0B0F19 0%, #101728 54%, #0B0F19 100%)',
      },
    },
  },
  plugins: [],
};
