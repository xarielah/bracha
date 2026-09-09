// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL || 'https://bracha.vercel.app';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/g/') && !page.includes('/api/'),
    }),
  ],
});
