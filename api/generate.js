import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  // 1. Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. API Key Check
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuration Error: API_KEY is missing in server environment.' });
  }

  try {
    const { action, payload } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    // Switching to 'gemini-3-flash-preview' per system guidelines for Basic Text Tasks.
    // This often has better availability/quotas than the experimental 2.0 model.
    const MODEL_NAME = 'gemini-3-flash-preview';

    // 1. GENERATE SUMMARY
    if (action === 'GENERATE_SUMMARY') {
      const prompt = `
        Tu es un expert en recrutement. Rédige un résumé professionnel pour un CV en français.
        Poste : ${payload.jobTitle}
        Contexte : ${payload.keywords}
        Consignes : Tiers personne, accrocheur, max 50 mots, pas de titre.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      
      return res.status(200).json({ result: response.text?.trim() });
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
        model: MODEL_NAME,
        contents: prompt,
      });

      return res.status(200).json({ result: response.text?.trim() });
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
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 1.0,
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

      // Handle potential parsing errors if the model is chatty
      let jsonResult;
      try {
        jsonResult = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
      } catch (e) {
        // Fallback if JSON is wrapped in markdown blocks
        const match = response.text?.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonResult = JSON.parse(match[1]);
        } else {
           throw new Error("Failed to parse JSON from model response: " + response.text);
        }
      }

      return res.status(200).json(jsonResult);
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (error) {
    console.error("API Execution Error:", error);
    
    // Check for Rate Limit / Quota Exceeded
    if (error.message?.includes('429') || error.message?.includes('Quota') || error.status === 429) {
       return res.status(429).json({ 
        error: 'Quota Exceeded', 
        details: 'Le service est momentanément saturé. Veuillez réessayer dans quelques secondes.'
      });
    }

    // Check for 404 Model Not Found (can happen if model alias changes)
    if (error.message?.includes('404') || error.status === 404) {
       return res.status(503).json({ 
        error: 'Model Error', 
        details: 'Le modèle IA est temporairement indisponible. Veuillez réessayer.'
      });
    }

    return res.status(500).json({ 
      error: 'AI Processing Failed', 
      details: error.message || 'Unknown error',
      stack: error.stack 
    });
  }
}