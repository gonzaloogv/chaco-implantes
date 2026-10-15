// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://chacoimplantes.com.ar',
  compressHTML: true,
  // Fuentes descargadas en el build y servidas desde el propio sitio (sin Google Fonts en runtime)
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [400, 500, 600, 700],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Montserrat',
      cssVariable: '--font-montserrat',
      weights: [700, 800, 900],
      fallbacks: ['sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
