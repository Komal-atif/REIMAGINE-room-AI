import { GoogleGenAI, Type } from "@google/genai";
import { DesignSuggestion, DesignStyle, RoomType, ColorPalette } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 5, // Increased retries
  initialDelay = 2000 // Increased initial delay
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isQuotaError = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && i < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = (initialDelay * Math.pow(2, i)) + (Math.random() * 1000);
        console.warn(`AI Quota reached, retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

export const generateDesignPlan = async (
  imageData: string,
  roomType: RoomType,
  style: DesignStyle,
  budget: number,
  colorPalette: ColorPalette
): Promise<DesignSuggestion> => {
  const prompt = `
    I have a photo of a ${roomType} that I want to redesign in a ${style} style with a budget of RS ${budget} Pakistani Rupees.
    The desired color palette theme is: ${colorPalette}.
    
    1. Analyze the original room photo (in base64 format).
    2. Propose a complete redesign plan that stays within the budget of RS ${budget} PKR and strictly adheres to the ${colorPalette} color scheme.
    3. MANDATORY CRITERIA: 
       - Architecture (walls, windows, doors, ceiling height) MUST be 100% identical to the source image.
       - Focus strictly on FURNISHING and PAINTING/DECOR.
    4. BUDGET ENFORCEMENT & PAKISTAN MARKET:
       - The user has a budget of RS ${budget}. 
       - For low budgets, prioritize "Budget" or "Affordable" products from Daraz.pk or local Pakistani vendors.
       - For high budgets, choose specialized stores like Interwood, Zubaidas, or Habitt.
       - Every item MUST be realistic and available in Pakistan.
    5. REAL PRODUCTS & SEARCH:
       - Every item must have a realistic market price in PKR.
       - "purchaseLink" MUST be a functional URL to the real product (e.g. from Daraz.pk, Interwood.pk, or a Google Search for the specific item in Pakistan).
       - Provide the dominant HEX color code for each item.
    6. SPATIAL POSITIONING:
       - In your redesign plan, mention where each item is placed relative to real-life room standards.
    7. Describe the redesigned room for an image generator: "A high-quality photo of the SAME room from the source, exact layout, redesigned with ${style} furniture in ${colorPalette} tones, camera angle identical, professional architectural photography."
  `;

  const runGeneration = async (modelName: string) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: imageData.split(',')[1], mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            redesignDescription: { 
              type: Type.STRING, 
              description: "Detailed prompt for generating the 'after' image." 
            },
            transformations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            transformedElements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  change: { type: Type.STRING }
                }
              }
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  purchaseLink: { type: Type.STRING },
                  availableAt: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of marketplace names where this item can be purchased."
                  },
                  color: { 
                    type: Type.STRING,
                    description: "Hex color code of the item (e.g. #FFFFFF)."
                  }
                },
                required: ["name", "price", "purchaseLink", "availableAt", "color"]
              }
            },
            overallPrice: { type: Type.NUMBER }
          },
          required: ["title", "summary", "furniture", "overallPrice", "redesignDescription", "transformations", "transformedElements"]
        },
        tools: [{ googleSearch: {} }],
      }
    });

    let text = "";
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          text += part.text;
        }
      }
    }

    if (!text) {
      text = response.text || "";
    }

    // Handle markdown-wrapped JSON
    const jsonMatch = text.match(/```json?\n?([\s\S]*?)\n?```/) || text.match(/{[\s\S]*}/);
    const cleanText = jsonMatch ? jsonMatch[jsonMatch.length - 1] : text;

    try {
      const parsed = JSON.parse(cleanText);
      
      // Ensure overallPrice is a number
      if (typeof parsed.overallPrice === 'string') {
        parsed.overallPrice = parseFloat(parsed.overallPrice.replace(/[^0-9.]/g, '')) || 0;
      }

      // Ensure item prices are numbers
      if (Array.isArray(parsed.furniture)) {
        parsed.furniture = parsed.furniture.map((item: any) => ({
          ...item,
          price: typeof item.price === 'string' 
            ? (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0)
            : (item.price || 0)
        }));
      }

      return {
        ...parsed,
        totalBudget: budget,
        isFallback: modelName !== "gemini-3-flash-preview"
      };
    } catch (parseErr) {
      console.error("Failed to parse AI response:", text);
      throw new Error("The AI provided an invalid design plan format. Please try again.");
    }
  };

  return callWithRetry(async () => {
    try {
      return await runGeneration("gemini-3-flash-preview");
    } catch (err: any) {
      // Fallback to Flash Lite if the main model is hitting quota
      const isQuotaError = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError) {
        console.warn("Main model quota reached, trying fallback model...");
        return await runGeneration("gemini-3.1-flash-lite-preview");
      }
      throw err;
    }
  }, 5, 2000).catch(err => {
    if (err.message && (err.message.includes('quota') || err.message.includes('429'))) {
      throw new Error('Our AI designer is currently over-booked (Quota Reached). Please wait a moment or try again later.');
    }
    throw err;
  });
};

export const generateTransformedImage = async (
  originalImageData: string,
  redesignDescription: string
): Promise<{ url: string, isFallback: boolean }> => {
  const runImageGen = async (modelName: string) => {
    const aiImage = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await aiImage.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: originalImageData.split(',')[1], mimeType: "image/jpeg" } },
          { text: `Transform this exact room according to these design instructions: ${redesignDescription}. REMEMBER: Keep the window, walls, and layout exactly the same. Only change the furniture and paint.` }
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            url: `data:image/png;base64,${part.inlineData.data}`,
            isFallback: modelName !== "gemini-2.5-flash-image"
          };
        }
      }
    }
    throw new Error('No image generated');
  };

  return callWithRetry(async () => {
    try {
      return await runImageGen("gemini-2.5-flash-image");
    } catch (err: any) {
      const isQuotaError = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError) {
        console.warn("Image generation quota reached, trying fallback model...");
        return await runImageGen("gemini-3.1-flash-image-preview");
      }
      throw err;
    }
  }, 5, 2500).catch(error => {
    console.warn("Visualizing with layout sync fallback due to resource limits.");
    return { url: originalImageData, isFallback: true }; 
  });
};
