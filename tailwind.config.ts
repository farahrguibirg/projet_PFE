// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        danger: '#ef4444',
        'danger-hover': '#dc2626',
        success: '#10b981',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}