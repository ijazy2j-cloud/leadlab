export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'hsbc-red': '#DB0011',
        'hsbc-grey': '#767676',
        'hsbc-black': '#000000',
        'hsbc-bg': '#F7F7F5',
        'hsbc-border': '#E5E5E2',
        'hsbc-overdue': '#DB0011',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}
