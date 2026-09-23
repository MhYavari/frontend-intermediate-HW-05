import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";

// Vite config: register the Tailwind v4 plugin so utility classes are generated.

export default defineConfig({
  plugins: [tailwindcss()],
});
