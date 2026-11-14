import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', BOOLEAN: 'BOOLEAN' },
}));

type Handler = (req: unknown, res: unknown) => Promise<unknown>;

interface MockResponse {
  statusCode: number;
  body: any;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
  setHeader(name: string, value: string): void;
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
}

let ipCounter = 0;

function createRequest(body: unknown, overrides: Record<string, unknown> = {}) {
  ipCounter += 1;
  return {
    method: 'POST',
    headers: { host: 'cv.example.com', 'x-forwarded-for': `10.0.${Math.floor(ipCounter / 250)}.${ipCounter % 250}` },
    body,
    ...overrides,
  };
}

/** Chaque test repart d'un module neuf (cache de modèle et compteur de débit vides). */
async function loadHandler(): Promise<Handler> {
  vi.resetModules();
  return (await import('../api/generate.js')).default as Handler;
}

async function call(handler: Handler, body: unknown, overrides: Record<string, unknown> = {}) {
  const res = createResponse();
  await handler(createRequest(body, overrides), res);
  return res;
}

const summary = { action: 'GENERATE_SUMMARY', payload: { jobTitle: 'Développeuse', context: 'Compétences : React' } };

beforeEach(() => {
  generateContent.mockReset();
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubEnv('API_KEY', '');
  vi.stubEnv('GEMINI_MODEL', '');
  vi.stubEnv('ALLOWED_ORIGINS', '');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('api/generate – contrôles d’accès', () => {
  it('refuse les méthodes autres que POST', async () => {
    const res = await call(await loadHandler(), undefined, { method: 'GET' });
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });

  it('signale l’absence de clé API sans appeler le modèle', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('CONFIG_ERROR');
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('accepte l’ancienne variable API_KEY', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('API_KEY', 'legacy-key');
    generateContent.mockResolvedValue({ text: 'Résumé.' });
    expect((await call(await loadHandler(), summary)).statusCode).toBe(200);
  });

  it('refuse les appels provenant d’un autre site', async () => {
    const handler = await loadHandler();
    const foreign = await call(handler, summary, { headers: { host: 'cv.example.com', origin: 'https://evil.example' } });
    expect(foreign.statusCode).toBe(403);
    expect(generateContent).not.toHaveBeenCalled();

    generateContent.mockResolvedValue({ text: 'Résumé.' });
    const same = await call(handler, summary, { headers: { host: 'cv.example.com', origin: 'https://cv.example.com' } });
    expect(same.statusCode).toBe(200);
  });

  it('limite le nombre de demandes par adresse IP', async () => {
    const handler = await loadHandler();
    generateContent.mockResolvedValue({ text: 'Résumé.' });
    const headers = { host: 'cv.example.com', 'x-forwarded-for': '203.0.113.7' };
    const statuses: number[] = [];
    for (let i = 0; i < 22; i += 1) {
      statuses.push((await call(handler, summary, { headers })).statusCode);
    }
    expect(statuses.slice(0, 20).every((status) => status === 200)).toBe(true);
    expect(statuses.slice(20)).toEqual([429, 429]);
  });
});

describe('api/generate – validation des entrées', () => {
  it('rejette une action inconnue ou un corps illisible', async () => {
    const handler = await loadHandler();
    expect((await call(handler, { action: 'DROP_TABLE' })).statusCode).toBe(400);
    expect((await call(handler, { action: 'constructor' })).statusCode).toBe(400);
    expect((await call(handler, 'pas du json')).statusCode).toBe(400);
    expect((await call(handler, undefined)).statusCode).toBe(400);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('exige les champs obligatoires et borne leur longueur', async () => {
    const handler = await loadHandler();
    const missing = await call(handler, { action: 'GENERATE_SUMMARY', payload: { jobTitle: '   ' } });
    expect(missing.statusCode).toBe(400);
    expect(missing.body.message).toContain('titre du poste');

    const tooLong = await call(handler, { action: 'IMPROVE_EXPERIENCE', payload: { description: 'x'.repeat(4001) } });
    expect(tooLong.statusCode).toBe(400);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('accepte un corps reçu sous forme de chaîne JSON', async () => {
    generateContent.mockResolvedValue({ text: 'Résumé.' });
    const res = await call(await loadHandler(), JSON.stringify(summary));
    expect(res.statusCode).toBe(200);
  });
});

describe('api/generate – génération', () => {
  it('renvoie un résumé nettoyé et transmet le contexte au modèle', async () => {
    generateContent.mockResolvedValue({ text: '  "**Développeuse** passionnée par React."  ' });
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ result: 'Développeuse passionnée par React.' });
    expect(res.headers['Cache-Control']).toBe('no-store');

    const request = generateContent.mock.calls[0][0];
    expect(request.contents).toContain('Développeuse');
    expect(request.contents).toContain('Compétences : React');
    expect(request.config.systemInstruction).toContain("N'invente aucun fait");
  });

  it('convertit les puces markdown d’une description améliorée', async () => {
    generateContent.mockResolvedValue({ text: '- Pilotage du projet\n* Suivi des indicateurs' });
    const res = await call(await loadHandler(), { action: 'IMPROVE_EXPERIENCE', payload: { description: 'j’ai géré', role: 'Cheffe' } });
    expect(res.body.result).toBe('• Pilotage du projet\n• Suivi des indicateurs');
  });

  it('signale une réponse vide du modèle', async () => {
    generateContent.mockResolvedValue({ text: undefined });
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe('EMPTY_RESPONSE');
  });

  it('renvoie le design au format JSON, même entouré d’un bloc de code', async () => {
    const handler = await loadHandler();
    const design = { layout: 'single-column', colors: { primary: '#000000' } };
    generateContent.mockResolvedValue({ text: JSON.stringify(design) });
    const direct = await call(handler, { action: 'GENERATE_DESIGN', payload: { description: 'sobre' } });
    expect(direct.body).toEqual({ result: design });
    expect(generateContent.mock.calls[0][0].config.responseMimeType).toBe('application/json');

    generateContent.mockResolvedValue({ text: 'Voici :\n```json\n' + JSON.stringify(design) + '\n```' });
    const fenced = await call(handler, { action: 'GENERATE_DESIGN', payload: { description: 'sobre' } });
    expect(fenced.body).toEqual({ result: design });

    generateContent.mockResolvedValue({ text: 'désolé, pas de JSON' });
    const invalid = await call(handler, { action: 'GENERATE_DESIGN', payload: { description: 'sobre' } });
    expect(invalid.statusCode).toBe(502);
  });
});

describe('api/generate – modèles et erreurs', () => {
  it('se replie sur le modèle suivant si le premier n’existe plus, puis s’en souvient', async () => {
    const handler = await loadHandler();
    generateContent
      .mockRejectedValueOnce(Object.assign(new Error('models/gemini-3.8-flash is not found'), { status: 404 }))
      .mockResolvedValue({ text: 'Résumé.' });

    expect((await call(handler, summary)).statusCode).toBe(200);
    const models = generateContent.mock.calls.map(([request]) => request.model);
    expect(models).toEqual(['gemini-3.8-flash', 'gemini-3-flash-preview']);

    generateContent.mockClear();
    await call(handler, summary);
    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual(['gemini-3-flash-preview']);
  });

  it('essaie d’abord le modèle défini par GEMINI_MODEL', async () => {
    vi.stubEnv('GEMINI_MODEL', 'gemini-custom');
    generateContent.mockResolvedValue({ text: 'Résumé.' });
    await call(await loadHandler(), summary);
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-custom');
  });

  it('renvoie 503 quand aucun modèle n’est disponible', async () => {
    generateContent.mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }));
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('MODEL_UNAVAILABLE');
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('traduit un dépassement de quota en 429', async () => {
    generateContent.mockRejectedValue(Object.assign(new Error('RESOURCE_EXHAUSTED: quota'), { status: 429 }));
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe('QUOTA_EXCEEDED');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('ne divulgue jamais le détail technique d’une erreur', async () => {
    const error = new Error('secret internal detail: key=AIza-SECRET at /var/task/api/generate.js');
    generateContent.mockRejectedValue(error);
    const res = await call(await loadHandler(), summary);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'AI_FAILED', message: 'La génération a échoué. Réessayez.' });
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('stack');
  });
});
