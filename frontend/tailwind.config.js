/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(99, 102, 241, 0.4), 0 18px 40px rgba(59, 130, 246, 0.25)'
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #4f8cff, #7c3aed)',
        'grid-pattern': 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
