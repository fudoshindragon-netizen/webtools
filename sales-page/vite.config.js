import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Serves the cycle-tracker API routes during `npm run dev`. Production uses
// the same handlers as Vercel functions in /api.
function cycleApiPlugin() {
  return {
    name: 'cycle-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname !== '/api/drug-lookup' && url.pathname !== '/api/cycle-assistant') return next();
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          const query = Object.fromEntries(url.searchParams.entries());
          const fake = {
            method: req.method,
            url: req.url,
            query,
            body: raw ? JSON.parse(raw) : {},
          };
          let status = 200;
          let payload = {};
          const sink = {
            setHeader() {},
            status(code) { status = code; return sink; },
            json(body) { payload = body; return sink; },
          };
          if (url.pathname === '/api/drug-lookup') {
            const { default: handler } = await import('./api/drug-lookup.js');
            await handler(fake, sink);
          } else {
            const { default: handler } = await import('./api/cycle-assistant.js');
            await handler(fake, sink);
          }
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(payload));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, message: error.message }));
        }
      });
    },
  };
}

// Multi-page build: Study Hub, Focus & Flow, NOBODY RUNS, and the cycle tracker.
export default defineConfig({
  plugins: [cycleApiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        focusFlow: fileURLToPath(new URL('./focus-flow.html', import.meta.url)),
        nobodyRuns: fileURLToPath(new URL('./nobody-runs.html', import.meta.url)),
        nobodyRunsDownload: fileURLToPath(new URL('./nobody-runs-download.html', import.meta.url)),
        cycle: fileURLToPath(new URL('./cycle.html', import.meta.url)),
      },
    },
  },
});
