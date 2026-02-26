/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0c5eaf',
                'primary-dark': '#083d73',
                accent: '#fe4100',
                'accent-dark': '#d63700',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1.5rem',
                '3xl': '2rem',
                '4xl': '3rem',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 20s linear infinite',
            },
        },
    },
    plugins: [],
}
