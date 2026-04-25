import { GoogleGenAI, Type } from "@google/genai";
import { DesignSuggestion, DesignStyle, RoomType, ColorPalette } from "../types";

// Support both AI Studio environment and standard Vite environment variables
const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API Key is missing. Please set GEMINI_API_KEY or VITE_GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI(apiKey || "");

// Helper to determine if we are in AI Studio environment
const isAIStudio = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY && !import.meta.env?.VITE_GEMINI_API_KEY;

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
    // Map internal aliases to public models if running locally
    let actualModel = modelName;
    if (!isAIStudio) {
      if (modelName === "gemini-3-flash-preview") actualModel = "gemini-1.5-flash";
      if (modelName === "gemini-3.1-flash-lite-preview") actualModel = "gemini-1.5-flash";
    }

    const model = ai.getGenerativeModel({
      model: actualModel,
      generationConfig: {
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

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        totalBudget: budget,
        isFallback: actualModel !== "gemini-3-flash-preview"
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
      return await runGeneration("gemini-3-flash-preview");
    } catch (err: any) {
      return await runGeneration("gemini-3.1-flash-lite-preview");
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
    let actualModel = modelName;
    if (!isAIStudio) {
      // Local execution uses 1.5-flash which can return text-based image descriptions or similar
      // but if the user wants true image-to-image we need a model that supports it.
      actualModel = "gemini-1.5-flash"; 
    }

    const model = ai.getGenerativeModel({ model: actualModel });

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

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const response = await result.response;
    
    // Check for inlineData in candidates manually if using flash-image
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return {
            url: `data:image/png;base64,${part.inlineData.data}`,
            isFallback: false
          };
        }
      }
    }
    
    return { 
      url: originalImageData || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000", 
      isFallback: true 
    };
  };

  return callWithRetry(async () => {
    try {
      return await runImageGen("gemini-2.5-flash-image");
    } catch (err: any) {
      console.warn("Retrying image generation due to error:", err.message || err);
      throw err;
    }
  }, 10, 6000).catch(err => {
    console.error("Image transformation failed after retries:", err);
    return { 
      url: originalImageData || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000", 
      isFallback: true 
    };
  });
};
