import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

// Mocks the agent-studio response shape `connectChatPageSuggestions` parses
// (`data.parts[1].text` = JSON-stringified string array). Reactive to query
// and first-hit category so refinements visibly drive the pills.
function chatPageSuggestionsMockPlugin() {
  return {
    name: 'chat-page-suggestions-mock',
    configureServer(server) {
      server.middlewares.use('/api/chat-page-suggestions', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        // Tune via `?delay=N` (ms). Default 800ms so the loading skeleton is
        // clearly visible on every refetch (initial mount + each refinement
        // change).
        const url = new URL(req.url ?? '', 'http://localhost');
        const delayParam = Number(url.searchParams.get('delay'));
        const delayMs =
          Number.isFinite(delayParam) && delayParam >= 0 ? delayParam : 800;
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        let input = {};
        try {
          const body = JSON.parse(raw);
          const text = body?.messages?.[0]?.parts?.[0]?.text;
          if (typeof text === 'string') input = JSON.parse(text);
        } catch {
          // ignore — fall through with empty input
        }
        const query = (input.query || '').trim();
        const category = input.hitsSample?.[0]?.categories?.[0];
        const max = Math.max(1, Math.min(input.maxSuggestions ?? 4, 8));

        const pool = [];
        if (query) {
          pool.push(
            `Compare the top ${query} options`,
            `What should I look for in a ${query}?`,
            `Recommend a ${query} under $500`,
            `Show me bestsellers for "${query}"`
          );
        }
        if (category) {
          pool.push(
            `What's new in ${category}?`,
            `Top-rated ${category} this month`,
            `Help me choose a ${category}`
          );
        }
        pool.push(
          'Help me find what I need',
          'What are people buying right now?',
          'Suggest something for a gift'
        );
        const suggestions = Array.from(new Set(pool)).slice(0, max);

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            id: `dummy-${Date.now()}`,
            role: 'assistant',
            parts: [
              { type: 'reasoning', text: 'mocked' },
              { type: 'text', text: JSON.stringify(suggestions) },
            ],
          })
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [commonjs(), react(), chatPageSuggestionsMockPlugin()],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
      },
    },
  },
});
