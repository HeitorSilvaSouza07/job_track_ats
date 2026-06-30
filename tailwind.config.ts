import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07111f",
          900: "#0b1727",
          800: "#12243a"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
