/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Bin2Win Worker App Theme Colors
        primary: '#3b82f6',
        secondary: '#10b981', 
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
        background: '#ffffff',
        backgroundDark: '#1f2937',
        card: '#f9fafb',
        cardDark: '#374151',
        text: '#1f2937',
        textDark: '#f9fafb',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        tabBar: '#ffffff',
        // Worker Status Colors
        pending: '#f59e0b',
        inProgress: '#3b82f6',
        completed: '#10b981',
        rejected: '#dc2626'
      }
    },
  },
  plugins: [],
};
