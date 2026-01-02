import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge', // Optional: Use Edge runtime for faster cold starts on Vercel
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Security Check
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error: API_KEY missing' }), { status: 500 });
  }

  try {
    const { action, payload } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    // 1. GENERATE SUMMARY
    if (action === 'GENERATE_SUMMARY') {
      const prompt = `
        Tu es un expert en recrutement. Rédige un résumé professionnel pour un CV en français.
        Poste : ${payload.jobTitle}
        Contexte : ${payload.keywords}
        Consignes : Tiers personne, accrocheur, max 50 mots, pas de titre.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      return new Response(JSON.stringify({ result: response.text?.trim() }), { status: 200 });
    }

    // 2. IMPROVE EXPERIENCE
    if (action === 'IMPROVE_EXPERIENCE') {
      const prompt = `
        Améliore cette description de CV pour la rendre percutante (verbes d'action, pro).
        Rôle : ${payload.role}
        Texte : "${payload.description}"
        Réponds uniquement avec le texte amélioré.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return new Response(JSON.stringify({ result: response.text?.trim() }), { status: 200 });
    }

    // 3. GENERATE UNIQUE DESIGN
    if (action === 'GENERATE_DESIGN') {
      const prompt = `
        Tu es un Directeur Artistique. Crée une config JSON de CV pour : "${payload.description}".
        Random Seed: ${Math.random()}
        Consignes:
        - Tech/Dev -> Monochrome, grid, monospace.
        - Créatif -> Asymétrique, couleurs vives, grosses typos.
        - Corporate -> Classique, serif, aéré.
        
        Retourne UNIQUEMENT le JSON conforme au schéma DesignConfig.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 1.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              layout: {
                type: Type.STRING,
                enum: ['sidebar-left', 'sidebar-right', 'single-column', 'minimal-grid', 'asymmetric']
              },
              header: {
                type: Type.OBJECT,
                properties: {
                   alignment: { type: Type.STRING, enum: ['left', 'center', 'right'] },
                   style: { type: Type.STRING, enum: ['clean', 'banner', 'floating-box', 'underlined'] },
                   nameSize: { type: Type.STRING, enum: ['normal', 'large', 'huge'] }
                },
                required: ['alignment', 'style', 'nameSize']
              },
              sections: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING, enum: ['clean', 'cards', 'left-border', 'timeline'] },
                  titleStyle: { type: Type.STRING, enum: ['simple', 'uppercase-bold', 'underlined', 'highlighted', 'bracketed'] },
                  spacing: { type: Type.STRING, enum: ['compact', 'normal', 'spacious'] }
                },
                required: ['style', 'titleStyle', 'spacing']
              },
              colors: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  secondary: { type: Type.STRING },
                  background: { type: Type.STRING },
                  text: { type: Type.STRING },
                  accent: { type: Type.STRING },
                },
                required: ['primary', 'secondary', 'background', 'text', 'accent']
              },
              fonts: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING, enum: ['Inter', 'Merriweather', 'Playfair Display', 'Roboto Mono', 'Lato'] },
                  body: { type: Type.STRING, enum: ['Inter', 'Merriweather', 'Playfair Display', 'Roboto Mono', 'Lato'] },
                },
                required: ['heading', 'body']
              },
              decorative: {
                type: Type.OBJECT,
                properties: {
                  shape: { type: Type.STRING, enum: ['none', 'dots', 'geometric', 'waves', 'tech-lines'] },
                  borderStyle: { type: Type.STRING, enum: ['none', 'solid', 'double', 'dashed'] },
                  useIcons: { type: Type.BOOLEAN },
                },
                required: ['shape', 'borderStyle', 'useIcons']
              }
            },
            required: ['layout', 'header', 'sections', 'colors', 'fonts', 'decorative']
          }
        }
      });

      return new Response(response.text, { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
}