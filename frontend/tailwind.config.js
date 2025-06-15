/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e6e8f5',
          200: '#c1c6e7',
          300: '#9ba4d8',
          400: '#7682ca',
          500: '#5060bc',
          600: '#3f51b5', // Primary color
          700: '#303f9f', // Primary hover
          800: '#283593',
          900: '#1a237e',
        },
        danger: {
          100: '#f8d7da',
          200: '#f1aeb5',
          300: '#ea868f',
          400: '#e35d6a',
          500: '#dc3545', // Danger color
          600: '#dc3545', // Same as 500 for consistency
          700: '#bd2130', // Danger hover
          800: '#9e1c28',
          900: '#7c151f',
        },
        success: {
          100: '#d4edda',
          200: '#a9d9b5',
          300: '#7fc691',
          400: '#54b26c',
          500: '#28a745', // Success color
          600: '#28a745', // Same as 500 for consistency
          700: '#218838', // Success hover
          800: '#1b7130',
          900: '#155724',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
} 