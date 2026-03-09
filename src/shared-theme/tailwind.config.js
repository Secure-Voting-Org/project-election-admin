/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../project-voter/index.html",
    "../project-voter/src/**/*.{js,ts,jsx,tsx}",
    "../project-election-admin/index.html",
    "../project-election-admin/src/**/*.{js,ts,jsx,tsx}",
    "../project-sys-admin/index.html",
    "../project-sys-admin/src/**/*.{js,ts,jsx,tsx}",
    "../project-observer/index.html",
    "../project-observer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eci: {
          blue: '#1e3a8a', // Placeholder for ECI Blue
        },
        saffron: '#ff9933', // Placeholder for Saffron
      }
    },
  },
  plugins: [],
}
