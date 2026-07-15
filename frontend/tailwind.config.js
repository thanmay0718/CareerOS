/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(148, 163, 184, 0.14), 0 24px 70px rgba(15, 23, 42, 0.55)',
      },
      backgroundImage: {
        'career-grid':
          'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.14), transparent 24%), linear-gradient(180deg, rgba(2, 6, 23, 0.9), rgba(15, 23, 42, 1))',
      },
    },
  },
  plugins: [],
};

