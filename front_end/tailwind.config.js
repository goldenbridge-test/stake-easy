/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A", // Bleu profond (Ta charte)
          dark: "#172554", // Pour les survol ou fonds très sombres
        },
        secondary: {
          DEFAULT: "#3B82F6", // Bleu vif (Accents)
        },
        dark: {
          DEFAULT: "#1F2937", // Gris foncé (Texte)
        },
        gold: {
          DEFAULT: "#FACC15", // Or (Premium/ROI)
          hover: "#EAB308", // Or plus foncé pour le hover
          light: "#FEF9C3", // Fond jaune très clair
        },
        white: "#FFFFFF",
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      // Ajout du dégradé futuriste mentionné dans ta charte
      backgroundImage: {
        "hero-gradient": "linear-gradient(to right bottom, #1E3A8A, #4C1D95)", // Bleu -> Violet
      },
    },
  },
  plugins: [],
};
