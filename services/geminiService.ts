
import { GoogleGenAI, Type } from "@google/genai";
import { SoilDiagnosisInputs, PlantingPlanInputs, PlantingPlanResponse, DiagnosisResponse, PlantIdentificationResult } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const apiKey = process.env.API_KEY;

// Initialize AI only if key exists, otherwise methods will throw
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = "gemini-2.5-flash";

export const identifyPlants = async (images: { base64: string, mimeType: string }[]): Promise<PlantIdentificationResult[]> => {
  if (!ai || !apiKey) {
    throw new Error("API Key is missing. Please check your settings or .env file.");
  }

  try {
    const parts: any[] = [];

    // Add all images to the prompt
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64
        }
      });
    });

    const promptText = `
      Analyze these images. They contain one or more seed packets or plants.
      Identify EVERY distinct plant species visible.
      
      For each plant found, return a JSON object with the following fields.
      IMPORTANT: If exact dates are not visible on the packet, you MUST ESTIMATE them based on general gardening knowledge for a Temperate Northern Hemisphere climate. Do not return empty strings.
      
      - name: The common name and variety if visible (e.g. "Tomato - Roma").
      - type: "Vegetable", "Herb", "Flower", or "Fruit".
      - season: Best growing season ("Spring", "Summer", "Autumn", or "Winter").
      - notes: A very short tip (max 10 words).
      - sowIndoors: The months to sow indoors (e.g., "Feb-Mar"). If strictly outdoor, return "N/A". ESTIMATE if not found.
      - sowOutdoors: The months to sow outdoors (e.g., "Apr-Jun"). If strictly indoor, return "N/A". ESTIMATE if not found.
      - transplant: The months to transplant (e.g., "May-Jun"). If direct sow only, return "N/A". ESTIMATE if not found.
      - harvest: The months to harvest (e.g., "Jul-Sep"). ESTIMATE if not found.
      
      Return strictly a JSON array of these objects.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        temperature: 0.4, // Lower temperature for more factual extraction
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Vegetable", "Herb", "Flower", "Fruit"] },
              season: { type: Type.STRING, enum: ["Spring", "Summer", "Autumn", "Winter"] },
              notes: { type: Type.STRING },
              sowIndoors: { type: Type.STRING },
              sowOutdoors: { type: Type.STRING },
              transplant: { type: Type.STRING },
              harvest: { type: Type.STRING }
            },
            required: ["name", "type", "season", "sowIndoors", "sowOutdoors", "transplant", "harvest"]
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up potential Markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as PlantIdentificationResult[];

  } catch (error) {
    console.error("Error identifying plants:", error);
    throw new Error("Failed to identify plants from images.");
  }
};

export const generateSoilDiagnosis = async (inputs: SoilDiagnosisInputs): Promise<DiagnosisResponse> => {
  if (!ai || !apiKey) {
    throw new Error("API Key is missing. Please check your settings or .env file.");
  }

  try {
    const prompt = `
      You are an expert gardening consultant specializing in **Huw Richards' Minimal Disturbance Gardening** and **No-Dig** methods.
      
      The user has provided the following details about their garden soil:
      - **Texture:** ${inputs.texture}
      - **Compaction:** ${inputs.compaction}
      - **Drainage:** ${inputs.drainage}
      - **Biodiversity:** ${inputs.biodiversity}
      - **Surface Condition:** ${inputs.surface}
      - **Specific Concern:** ${inputs.specificConcern || "None provided"}

      Based strictly on **Minimal Disturbance** principles (No-Dig, keeping soil covered, keeping living roots in the ground, minimizing chemical use), provide a detailed diagnosis and action plan.
      
      Return the result in strictly valid JSON format matching the schema provided.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthTitle: { type: Type.STRING, description: "A short 3-5 word summary title of the soil condition" },
            healthScore: { type: Type.NUMBER, description: "A number 1-10 rating the soil health based on inputs" },
            diagnosisSummary: { type: Type.STRING, description: "A 2-3 sentence explanation of what is happening in the soil." },
            immediateActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            longTermStrategy: { type: Type.STRING, description: "Paragraph on maintaining fertility over seasons." },
            recommendedPlants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Cover Crop", "Vegetable", "Flower"] }
                }
              }
            }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as DiagnosisResponse;

  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw new Error("Failed to analyze soil data.");
  }
};

export const generatePlantingPlan = async (inputs: PlantingPlanInputs): Promise<PlantingPlanResponse> => {
  if (!ai || !apiKey) {
    throw new Error("API Key is missing. Please check your settings or .env file.");
  }

  try {
    const parts: any[] = [];

    if (inputs.seedInputType === 'image' && inputs.seedImages.length > 0) {
       inputs.seedImages.forEach(img => {
         parts.push({
           inlineData: {
             mimeType: img.mimeType,
             data: img.base64
           }
         });
       });
       parts.push({ text: "These images show the seed packets or list of seeds I have available." });
    } else if (inputs.seedText) {
      parts.push({ text: `I have the following seeds: ${inputs.seedText}` });
    }

    const promptText = `
      You are an expert market gardener specializing in **Succession Planting** and **Intercropping**.
      
      User Parameters:
      - **Location:** ${inputs.location}
      - **Growing Space:** ${inputs.spaceSize} ${inputs.spaceUnit}.
      
      Based on the seeds provided, create a comprehensive planting plan.
      Return valid JSON.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seasonalStrategy: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cropName: { type: Type.STRING },
                  sowIndoors: { type: Type.STRING },
                  sowOutdoors: { type: Type.STRING },
                  transplant: { type: Type.STRING },
                  harvest: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["cropName", "harvest", "notes"]
              }
            },
            successionPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalCrop: { type: Type.STRING },
                  followUpCrop: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            spaceMaximizationTip: { type: Type.STRING }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as PlantingPlanResponse;

  } catch (error) {
    console.error("Error generating planting plan:", error);
    throw new Error("Failed to generate planting plan.");
  }
};
