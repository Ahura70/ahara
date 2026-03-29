import { GoogleGenAI, Type } from '@google/genai';
import { UserPreferences, Recipe } from '../types';

// Initialize the Gemini API client
// Note: In a real app, you might want to handle missing keys more gracefully,
// but for this prototype, we assume it's provided in the environment.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'test_key_for_ui_testing') {
  console.warn(
    '⚠️ WARNING: Using test Gemini API key. Image analysis will fail.\n' +
    'To enable image analysis:\n' +
    '1. Get a real API key from https://aistudio.google.com/app/apikey\n' +
    '2. Update .env file: VITE_GEMINI_API_KEY=your_actual_key\n' +
    '3. Restart the development server'
  );
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `${prompt}. Food photography.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "512px" // Reduced from 1K to 512px for faster generation
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateRecipesFromImage(
  imageFile: File,
  preferences: UserPreferences,
  highlyRatedRecipes: Recipe[] = []
): Promise<Recipe[]> {
  const imageSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "A unique string ID for the recipe" },
        title: { type: Type.STRING, description: "The name of the recipe" },
        prepTime: { type: Type.INTEGER, description: "Preparation time in minutes" },
        servings: { type: Type.INTEGER, description: "Number of servings the recipe makes" },
        calories: { type: Type.INTEGER, description: "Total calories" },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fats: { type: Type.INTEGER }
          },
          required: ["protein", "carbs", "fats"]
        },
        matchPercentage: { type: Type.INTEGER, description: "How well it matches preferences (0-100)" },
        imageUrl: { type: Type.STRING, description: "A short, descriptive keyword for the dish to use as an image seed" },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the ingredient" },
              amount: { type: Type.NUMBER, description: "Quantity of the ingredient" },
              unit: { type: Type.STRING, description: "Unit of measurement (e.g., 'grams', 'ml', 'cups', 'tbsp', 'pieces')" }
            },
            required: ["name", "amount", "unit"]
          },
          description: "List of ingredients with quantities and units"
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Step by step instructions"
        },
        dietaryRestrictions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of dietary restrictions this recipe adheres to (e.g., Vegetarian, Gluten-Free)"
        },
        cuisineType: { type: Type.STRING, description: "The cuisine type of the recipe" }
      },
      required: ["id", "title", "prepTime", "servings", "calories", "macros", "matchPercentage", "imageUrl", "ingredients", "instructions", "cuisineType"]
    }
  };

  try {
    const imagePart = await fileToGenerativePart(imageFile);

    let highlyRatedPrompt = "";
    if (highlyRatedRecipes.length > 0) {
      highlyRatedPrompt = `
      The user has previously highly rated the following recipes. Try to suggest recipes with similar flavor profiles, ingredients, or cooking styles:
      ${highlyRatedRecipes.map(r => `- ${r.title} (${r.cuisineType || 'General'})`).join('\n')}
      `;
    }

    const prompt = `
      You are an expert chef and nutritionist. Analyze the provided image of ingredients.
      Based on the ingredients visible in the image, and the following user preferences:
      - Preferred Cuisines: ${preferences.cuisines.join(', ') || 'Any'}
      - Dietary Restrictions: ${(preferences.dietaryRestrictions || []).join(', ') || 'None'}
      - Maximum Prep Time: ${preferences.maxPrepTime} minutes
      - Target Macros per meal (approximate): Protein ${preferences.macros.protein}g, Carbs ${preferences.macros.carbs}g, Fats ${preferences.macros.fats}g

      ${highlyRatedPrompt}

      Generate exactly 3 recipe recommendations that primarily use the ingredients shown (you may assume basic pantry staples like oil, salt, pepper, common spices are available).

      For each recipe, provide a descriptive visual keyword that could be used to search for an image of the finished dish (e.g., "salmon bowl", "quinoa salad").

      Return the result as a JSON array of objects.
    `;

    console.log('📤 Sending image to Gemini API for analysis...');

    let response;
    let modelUsed = 'gemini-3-flash-preview';

    try {
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: [
          imagePart,
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: imageSchema
        }
      });
    } catch (modelError: any) {
      console.warn(`⚠️ Model ${modelUsed} failed, trying fallback model...`);
      // Fallback to gemini-2.0-flash if primary model fails
      modelUsed = 'gemini-2.0-flash';
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: [
          imagePart,
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: imageSchema
        }
      });
    }

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    console.log(`✅ Received response from ${modelUsed}`);
    const recipes: Recipe[] = JSON.parse(text);

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Gemini returned empty recipe list");
    }

    console.log(`📝 Generated ${recipes.length} recipes`);
    return recipes;

  } catch (error: any) {
    console.error("❌ Error generating recipes:", error?.message || error);
    throw error;
  }
}

export async function extractIngredientsFromGroceryList(
  imageFile: File
): Promise<string[]> {
  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      imagePart,
      {
        text: `You are an expert at reading shopping lists.

Analyze the provided image of a shopping list.
Extract ALL ingredients listed, regardless of:
- Language (translate to English)
- Format (numbered, bulleted, handwritten, digital)
- Organization (grouped by category or random)

Return a JSON array of extracted ingredients.
Include quantity and unit if visible (e.g., "2 lbs chicken").
If quantity is not visible, use a generic quantity like "1 unit".

Example output:
{
  "ingredients": [
    { "name": "chicken breast", "quantity": "2", "unit": "lbs" },
    { "name": "rice", "quantity": "1", "unit": "bag" },
    { "name": "broccoli", "quantity": "1", "unit": "head" }
  ]
}`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                unit: { type: Type.STRING },
              },
              required: ['name'],
            },
          },
        },
      },
    },
  });

  const parsed = JSON.parse(response.text);
  return parsed.ingredients.map(
    (ing: any) => `${ing.quantity || '1'} ${ing.unit || 'unit'} ${ing.name}`
  );
}

export async function detectIngredientsFromPhoto(
  imageFile: File
): Promise<any[]> {
  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      imagePart,
      {
        text: `You are an expert food identification system.

Analyze the provided image of food ingredients.
Identify each visible food item and estimate:
1. Item name (be specific: "chicken breast" not just "meat")
2. Estimated quantity/amount visible
3. Estimated unit (count, weight, volume)
4. Freshness assessment (fresh, ripe, expiring soon, old)
5. Confidence score (0.0 to 1.0)

Return as JSON array. Ignore packaging, containers, and non-food items.
Be conservative with confidence scores (only >0.7 for clear items).

Example output:
{
  "detected_items": [
    {
      "name": "chicken breast",
      "quantity": "2",
      "unit": "pieces",
      "freshness": "fresh",
      "confidence": 0.95,
      "notes": "Appears to be raw, packaged in plastic"
    }
  ]
}`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detected_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                unit: { type: Type.STRING },
                freshness: {
                  type: Type.STRING,
                  enum: ['fresh', 'ripe', 'expiring_soon', 'old'],
                },
                confidence: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['name', 'confidence'],
            },
          },
        },
      },
    },
  });

  const parsed = JSON.parse(response.text);
  return parsed.detected_items;
}

export async function transcribeIngredientsFromSpeech(
  audioBlob: Blob
): Promise<string[]> {
  const base64Audio = await blobToBase64(audioBlob);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          mimeType: 'audio/wav',
          data: base64Audio,
        },
      },
      {
        text: `Listen to this audio of someone listing their available ingredients.

Transcribe the audio and extract a JSON array of ingredients.
For each ingredient, try to parse:
- Ingredient name
- Quantity (if mentioned)
- Unit (if mentioned)

Ignore:
- Filler words ("um", "uh", etc.)
- Cooking directions
- Non-ingredient statements

Return JSON with: ingredients array and confidence score.

Example output:
{
  "ingredients": [
    { "name": "chicken breast", "quantity": "2", "unit": "lbs" },
    { "name": "rice", "quantity": "1", "unit": "cup" },
    { "name": "broccoli" }
  ],
  "transcription": "Full transcription of what was said",
  "confidence": 0.92
}`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text);
  return parsed.ingredients.map(
    (ing: any) =>
      `${ing.quantity ? ing.quantity + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name}`.trim()
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getRecipeHelp(
  recipe: Recipe,
  currentStep: number,
  userQuestion: string
): Promise<any> {
  const recipeContext = `
Recipe: ${recipe.title}
Current Step: ${currentStep + 1} of ${recipe.instructions.length}
Step Text: "${recipe.instructions[currentStep]}"
Ingredients: ${recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join(', ')}
Total Cook Time: ${recipe.cookTime || 'N/A'} minutes`;

  const prompt = `You are an expert cooking coach helping someone make "${recipe.title}".

${recipeContext}

The user asks: "${userQuestion}"

Provide helpful advice that:
1. Addresses their immediate concern
2. Suggests practical solutions with specific quantities/measurements
3. Explains the food science behind the solution
4. Prevents common mistakes
5. Is encouraging and supportive

Return JSON with: advice, solution, reasoning, and next_steps.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ text: prompt }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          advice: { type: Type.STRING },
          solution: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
  });

  return JSON.parse(response.text);
}

export async function getIngredientSubstitutions(
  ingredient: any,
  recipe: Recipe,
  userAllergies: string[] = []
): Promise<any[]> {
  const prompt = `You are a professional chef and food scientist.

Original Recipe: ${recipe.title}
Missing Ingredient: ${ingredient.amount} ${ingredient.unit} ${ingredient.name}
Recipe Function: This ingredient is used in step ${recipe.instructions.findIndex(
    s => s.toLowerCase().includes(ingredient.name.toLowerCase())
  ) + 1}

User Allergies to AVOID: ${userAllergies.join(', ') || 'None'}

Suggest 3 suitable substitutions that:
1. Maintain similar cooking properties (binding, moisture, texture, etc.)
2. Preserve the dish's flavor profile
3. Are common/accessible ingredients
4. Consider cost effectiveness
5. Avoid any listed allergies

For each substitution, provide:
- Substitute ingredient name
- Quantity to use (ratio relative to original)
- How to prepare/adjust the recipe
- Why it works scientifically
- Any flavor/texture tradeoffs

Return as JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ text: prompt }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            ingredient: { type: Type.STRING },
            quantity: { type: Type.STRING },
            rationale: { type: Type.STRING },
            prepNotes: { type: Type.STRING },
            tradeoffs: { type: Type.STRING },
            ranking: { type: Type.INTEGER }, // 1-3, where 1 is best
          },
        },
      },
    },
  });

  const substitutions = JSON.parse(response.text);
  return substitutions.sort((a: any, b: any) => a.ranking - b.ranking);
}

export async function analyzeRecipeWithPhoto(
  recipe: Recipe,
  photoFile: File,
  stepIndex: number
): Promise<any> {
  const imagePart = await fileToGenerativePart(photoFile);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      imagePart,
      {
        text: `A user is cooking "${recipe.title}" and is on step ${stepIndex + 1}:
"${recipe.instructions[stepIndex]}"

They've uploaded a photo of their current progress.

Analyze the photo and provide:
1. Assessment of progress (looks right, minor issues, major issues)
2. Specific feedback on appearance, color, texture, etc.
3. Cooking temperature assessment if applicable (looks raw, medium, well-done, etc.)
4. Time remaining estimate (how much longer until this step is done)
5. Any safety concerns
6. Encouragement/positive feedback

Return as JSON.`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(response.text);
}

/**
 * Generate recipes from multiple ingredient images
 * Analyzes all images together to identify ingredients and generate recipes
 */
export async function generateRecipesFromMultipleImages(
  imageFiles: File[],
  preferences: UserPreferences,
  highlyRatedRecipes: Recipe[] = []
): Promise<Recipe[]> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("No images provided");
  }

  const imageSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "A unique string ID for the recipe" },
        title: { type: Type.STRING, description: "The name of the recipe" },
        prepTime: { type: Type.INTEGER, description: "Preparation time in minutes" },
        servings: { type: Type.INTEGER, description: "Number of servings the recipe makes" },
        calories: { type: Type.INTEGER, description: "Total calories" },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fats: { type: Type.INTEGER }
          },
          required: ["protein", "carbs", "fats"]
        },
        matchPercentage: { type: Type.INTEGER, description: "How well it matches preferences (0-100)" },
        imageUrl: { type: Type.STRING, description: "A short, descriptive keyword for the dish to use as an image seed" },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the ingredient" },
              amount: { type: Type.NUMBER, description: "Quantity of the ingredient" },
              unit: { type: Type.STRING, description: "Unit of measurement (e.g., 'grams', 'ml', 'cups', 'tbsp', 'pieces')" }
            },
            required: ["name", "amount", "unit"]
          },
          description: "List of ingredients with quantities and units"
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Step by step instructions"
        },
        dietaryRestrictions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of dietary restrictions this recipe adheres to (e.g., Vegetarian, Gluten-Free)"
        },
        cuisineType: { type: Type.STRING, description: "The cuisine type of the recipe" }
      },
      required: ["id", "title", "prepTime", "servings", "calories", "macros", "matchPercentage", "imageUrl", "ingredients", "instructions", "cuisineType"]
    }
  };

  try {
    // Convert all images to base64
    console.log(`📤 Processing ${imageFiles.length} image(s) for analysis...`);
    const imageParts = await Promise.all(
      imageFiles.map((file, idx) => {
        console.log(`  📸 Image ${idx + 1}: ${file.name}`);
        return fileToGenerativePart(file);
      })
    );

    let highlyRatedPrompt = "";
    if (highlyRatedRecipes.length > 0) {
      highlyRatedPrompt = `
      The user has previously highly rated the following recipes. Try to suggest recipes with similar flavor profiles, ingredients, or cooking styles:
      ${highlyRatedRecipes.map(r => `- ${r.title} (${r.cuisineType || 'General'})`).join('\n')}
      `;
    }

    const prompt = `
      You are an expert chef and nutritionist. Analyze ALL provided images of ingredients.
      Combine the ingredients visible across all images, and based on the following user preferences:
      - Preferred Cuisines: ${preferences.cuisines.join(', ') || 'Any'}
      - Dietary Restrictions: ${(preferences.dietaryRestrictions || []).join(', ') || 'None'}
      - Maximum Prep Time: ${preferences.maxPrepTime} minutes
      - Target Macros per meal (approximate): Protein ${preferences.macros.protein}g, Carbs ${preferences.macros.carbs}g, Fats ${preferences.macros.fats}g

      ${highlyRatedPrompt}

      Generate exactly 3 recipe recommendations that primarily use the ingredients shown across ALL images (you may assume basic pantry staples like oil, salt, pepper, common spices are available).

      For each recipe, provide a descriptive visual keyword that could be used to search for an image of the finished dish (e.g., "salmon bowl", "quinoa salad").

      Return the result as a JSON array of objects.
    `;

    // Build contents array with all image parts
    const contents = [
      ...imageParts,
      { text: prompt }
    ];

    console.log('📤 Sending images to Gemini API for analysis...');

    let response;
    let modelUsed = 'gemini-3-flash-preview';

    try {
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: imageSchema
        }
      });
    } catch (modelError: any) {
      console.warn(`⚠️ Model ${modelUsed} failed, trying fallback model...`);
      // Fallback to gemini-2.0-flash if primary model fails
      modelUsed = 'gemini-2.0-flash';
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: imageSchema
        }
      });
    }

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    console.log(`✅ Received response from ${modelUsed}`);
    const recipes: Recipe[] = JSON.parse(text);

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Gemini returned empty recipe list");
    }

    console.log(`📝 Generated ${recipes.length} recipes from ${imageFiles.length} image(s)`);
    return recipes;

  } catch (error: any) {
    console.error("❌ Error generating recipes from multiple images:", error?.message || error);
    throw error;
  }
}

/**
 * Analyze text (like a barcode) to extract product and ingredient information
 * Used by the barcode scanner to identify products and their ingredients
 */
export async function analyzeIngredients(prompt: string): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing ingredients:", error);
    throw error;
  }
}
