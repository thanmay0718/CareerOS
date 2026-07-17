/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0F19',
        glass: '#1E293B',
        primary: '#6366F1',
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
