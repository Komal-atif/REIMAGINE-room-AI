import { GoogleGenAI, Type } from "@google/genai";
import { DesignSuggestion, DesignStyle, RoomType, ColorPalette } from "../types";

// Local/Vite: key comes from VITE_GEMINI_API_KEY in .env.local
const GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

if (!GEMINI_KEY) {
  console.warn("Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local and restart `npm run dev`.");
}

const ai = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

// ---- Model names (Google changes these often; check ai.google.dev/gemini-api/docs/models) ----
// Text design plan: free tier available on Flash-family models.
const TEXT_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_TEXT_MODEL = "gemini-3.8-flash";
// Image generation: NOT free on the Gemini API (billing must be enabled on your Google project).
const IMAGE_MODEL = "gemini-3.1-flash-image";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      cache: 'no-cache'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Image processing error:", url, err);
    return "";
  }
}

const callWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 2000
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      let errorStr = "";
      try {
        errorStr = JSON.stringify(err).toLowerCase();
      } catch {
        errorStr = String(err).toLowerCase();
      }

      const isQuotaError = 
        errorStr.includes('429') || 
        errorStr.includes('quota') || 
        errorStr.includes('resource_exhausted') ||
        errorStr.includes('rate limit') ||
        (err && (err.code === 429 || err.status === 429)) ||
        (err && (err.status === 'RESOURCE_EXHAUSTED' || (err.error && err.error.status === 'RESOURCE_EXHAUSTED')));
      
      if (isQuotaError && i < maxRetries - 1) {
        const delay = (initialDelay * Math.pow(1.5, i)) + (Math.random() * 2000);
        console.warn(`Gemini Quota reached, retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

export const generateDesignPlan = async (
  imageData: string | null,
  roomType: RoomType,
  style: DesignStyle,
  budget: number,
  colorPalette: ColorPalette,
  action: 'redesign' | 'clean' | 'paint' | 'generate' = 'redesign',
  customContext?: string
): Promise<DesignSuggestion> => {
  let processedImageData = imageData;
  if (imageData && imageData.startsWith('http')) {
    processedImageData = await imageUrlToBase64(imageData);
  }

  const prompt = action === 'generate'
    ? `
    Provide a professional architectural design plan for a new floor plan layout.
    Context: ${customContext || ''}
    Style: ${style}.
    Provide detailed descriptions for architectural elements, wall placements, and room flow.
    Description for image gen: "A professional ${style} floor plan, CAD level detail."
    `
    : `
    1. Analyze the original photo of this ${roomType}.
    2. Task: ${action === 'clean' ? 'Provide a plan to empty the space.' : `Provide a redesign in ${style} style with a budget of PKR ${budget} and ${colorPalette} color palette.`}
    3. MANDATORY CRITERIA: 
       - Architecture MUST be identical to the source image.
    4. BUDGET ENFORCEMENT & PAKISTANI MARKET:
       - User budget: PKR ${budget}. Use Daraz.pk, Habitt.com, Interwood.pk prices.
    5. Describe the changed room for an image generator: "A high-quality photo of the SAME room, ${action === 'clean' ? 'completely empty' : `redesigned with ${style} furniture`}, camera angle identical."
    `;

  const runGeneration = async (modelName: string) => {
    if (!ai) {
      throw new Error("Gemini API is not initialized. Please ensure your API key is configured.");
    }
    
    const actualModel = modelName;

    const parts: any[] = [];
    if (processedImageData && processedImageData.includes(',')) {
      parts.push({ 
        inlineData: { 
          data: processedImageData.split(',')[1], 
          mimeType: "image/jpeg" 
        } 
      });
    }
    parts.push({ text: prompt });

    console.log(`Calling Gemini (${actualModel})...`);
    const response = await ai.models.generateContent({
      model: actualModel,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            redesignDescription: { type: Type.STRING },
            transformations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  purchaseLink: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  color: { type: Type.STRING },
                  availableAt: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            overallPrice: { type: Type.NUMBER },
            roomCounts: {
              type: Type.OBJECT,
              properties: {
                Bedroom: { type: Type.NUMBER },
                Bathroom: { type: Type.NUMBER },
                Kitchen: { type: Type.NUMBER },
                LivingRoom: { type: Type.NUMBER },
                DiningRoom: { type: Type.NUMBER }
              }
            }
          },
          required: ["title", "summary", "furniture", "overallPrice", "redesignDescription", "transformations"]
        }
      }
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        totalBudget: budget,
        isFallback: actualModel !== TEXT_MODEL
      };
    } catch (parseErr) {
      console.error("Failed to parse AI response:", text);
      return {
        title: "Design Plan",
        summary: "We created a layout optimized for your space.",
        furniture: [],
        overallPrice: budget,
        redesignDescription: text.substring(0, 500) || "Modern redesign",
        transformations: ["Color update", "Furniture layout"],
        transformedElements: [],
        totalBudget: budget,
        isFallback: true
      } as any;
    }
  };

  return callWithRetry(async () => {
    try {
      return await runGeneration(TEXT_MODEL);
    } catch (err: any) {
      return await runGeneration(FALLBACK_TEXT_MODEL);
    }
  }, 3, 1000);
};

export const generateTransformedImage = async (
  originalImageData: string | null,
  redesignDescription: string
): Promise<{ url: string, isFallback: boolean }> => {
  let processedImageData = originalImageData;
  if (originalImageData && originalImageData.startsWith('http')) {
    processedImageData = await imageUrlToBase64(originalImageData);
  }

  const runImageGen = async (modelName: string) => {
    if (!ai) {
      throw new Error("Gemini API is not initialized. Please ensure your API key is configured.");
    }
    
    const actualModel = modelName;

    const parts: any[] = [];
    if (processedImageData && processedImageData.includes(',')) {
      parts.push({ 
        inlineData: { 
          data: processedImageData.split(',')[1], 
          mimeType: "image/jpeg" 
        } 
      });
    }
    parts.push({ text: redesignDescription });

    console.log(`Calling Gemini Image Gen (${actualModel})...`);
    const response = await ai.models.generateContent({
      model: actualModel,
      contents: { parts: parts },
    });
    
    // Check for inlineData in parts
    const resParts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of resParts) {
      if (part.inlineData?.data) {
        return {
          url: `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`,
          isFallback: false
        };
      }
    }

    console.warn(
      "No image returned. finishReason:",
      response.candidates?.[0]?.finishReason,
      "text:",
      response.text
    );

    return { 
      url: originalImageData || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000", 
      isFallback: true 
    };
  };

  return callWithRetry(async () => {
    try {
      return await runImageGen(IMAGE_MODEL);
    } catch (err: any) {
      console.warn("Retrying image generation due to error:", err.message || err);
      throw err;
    }
  }, 2, 4000).catch(err => {
    console.error("Image transformation failed after retries:", err);
    return { 
      url: originalImageData || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000", 
      isFallback: true 
    };
  });
};