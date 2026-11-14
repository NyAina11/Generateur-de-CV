import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv, type Connect, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

type ApiRequest = IncomingMessage & { body?: unknown };
type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
};
type ApiHandler = (req: ApiRequest, res: ApiResponse) => unknown;

const MAX_BODY_BYTES = 1_000_000;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Sert `api/generate.js` directement depuis Vite (dev et preview), avec la même
 * interface que les fonctions serverless Vercel. `npm run dev` suffit donc pour
 * tester l'IA en local : pas besoin de `vercel dev`.
 */
function localApi(): Plugin {
  const mount = (middlewares: Connect.Server, loadHandler: () => Promise<ApiHandler>) => {
    middlewares.use('/api/generate', async (req, res) => {
      const apiRes = res as ApiResponse;
      apiRes.status = (code) => {
        apiRes.statusCode = code;
        return apiRes;
      };
      apiRes.json = (payload) => {
        apiRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        apiRes.end(JSON.stringify(payload));
      };

      try {
        const apiReq = req as ApiRequest;
        const raw = req.method === 'POST' ? await readBody(req) : '';
        try {
          apiReq.body = raw ? JSON.parse(raw) : {};
        } catch {
          apiReq.body = raw;
        }
        const handler = await loadHandler();
        await handler(apiReq, apiRes);
      } catch (error) {
        console.error('[api] Erreur inattendue :', error);
        if (!apiRes.headersSent) {
          apiRes.status(500).json({ error: 'SERVER_ERROR', message: 'Erreur interne du serveur local.' });
        }
      }
    });
  };

  return {
    name: 'cv-forge-local-api',
    configureServer(server) {
      mount(server.middlewares, async () => {
        const mod = await server.ssrLoadModule('/api/generate.js');
        return mod.default as ApiHandler;
      });
    },
    configurePreviewServer(server) {
      mount(server.middlewares, async () => {
        const mod = await import(pathToFileURL(resolve(server.config.root, 'api/generate.js')).href);
        return mod.default as ApiHandler;
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Rend les variables du fichier .env visibles par la fonction API locale.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GEMINI_API_KEY', 'API_KEY', 'GEMINI_MODEL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), localApi()],
    build: {
      outDir: 'dist',
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  };
});
