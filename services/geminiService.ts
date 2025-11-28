import { GoogleGenAI, Type } from "@google/genai";
import type { SubstitutionResult, Alert, Kpi, InventoryData, ConsolidationSuggestion, Material } from '../types';

// Use import.meta.env which is the standard for Vite projects
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables. Please create a .env file.");
}

const ai = new GoogleGenAI({ apiKey });


// Helper to parse JSON from Gemini's text response
const parseGeminiJson = <T,>(text: string): T => {
    // The response can be wrapped in markdown ```json ... ```
    const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON:", cleanedText);
        throw new Error("Respuesta JSON inválida del modelo de IA.");
    }
};

export const generateInitialInventory = async (): Promise<Material[]> => {
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                sku: { type: Type.STRING },
                description: { type: Type.STRING },
                stock: { type: Type.INTEGER },
                location: { type: Type.STRING },
                complianceStatus: { type: Type.STRING, enum: ['Validado', 'En Revisión', 'No Conforme'] },
                riskLevel: { type: Type.STRING, enum: ['Bajo', 'Medio', 'Alto'] },
            },
            required: ["sku", "description", "stock", "location", "complianceStatus", "riskLevel"],
        },
    };
    
    const prompt = `Genera una lista de inventario inicial de 15 a 20 materiales para Tecpetrol (empresa de oil & gas). La lista debe ser variada. Es crucial que incluyas:
- 2 o 3 materiales con stock CERO (0).
- 3 o 4 materiales con stock BAJO (entre 1 y 10).
- El resto con stock saludable (mayor a 50).
- Asigna un 'complianceStatus' a cada uno: la mayoría 'Validado', pero 2-3 como 'En Revisión' y 1 como 'No Conforme'.
- Asigna un 'riskLevel' a cada uno ('Bajo', 'Medio', 'Alto'), acorde al tipo de material.
Para cada material, proporciona un SKU temporal (ej: TEMP-01), descripción técnica, stock, ubicación, estado de cumplimiento y nivel de riesgo. La respuesta debe ser en español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });

    const inventory = parseGeminiJson<Material[]>(response.text);

    // Sort by description alphabetically (Spanish locale)
    inventory.sort((a, b) => a.description.localeCompare(b.description, 'es', { sensitivity: 'base' }));

    // Re-assign SKUs sequentially to match the required format (TEC001001, TEC001002...)
    return inventory.map((item, index) => ({
        ...item,
        sku: `TEC${String(index + 1).padStart(6, '0')}`
    }));
};

export const getTechnicalSpecifications = async (materialDescription: string): Promise<string> => {
    const prompt = `Eres un experto catalogador de Tecpetrol. Genera **únicamente** la ficha técnica para el material: "${materialDescription}".

**REGLAS ESTRICTAS:**
1.  **NO** escribas frases introductorias como "Aquí tienes la ficha..." o "Claro, aquí está...".
2.  Tu respuesta debe empezar directamente con la descripción técnica.
3.  Usa formato Markdown simple para la estructura:
    - Usa **doble asterisco** para los títulos y subtítulos (ej: **Dimensiones**).
    - Usa un asterisco (*) seguido de un espacio para las listas de especificaciones.

**EJEMPLO DE FORMATO:**
**DESCRIPCIÓN TÉCNICA DE MATERIAL: CARCASA DE POZO (CASING)**
**Identificación del Material:**
* **Tipo:** Carcasa de Pozo (Casing)
* **Diámetro Nominal Exterior (OD):** 9-5/8 pulgadas (244.48 mm)

Tu respuesta debe ser solo la ficha en español.`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.2,
        },
    });

    return response.text;
};


export const findSubstitutes = async (materialDescription: string): Promise<SubstitutionResult> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            original: {
                type: Type.OBJECT,
                properties: {
                    sku: { type: Type.STRING },
                    description: { type: Type.STRING },
                    stock: { type: Type.INTEGER },
                    location: { type: Type.STRING },
                    complianceStatus: { type: Type.STRING, enum: ['Validado', 'En Revisión', 'No Conforme'] },
                    riskLevel: { type: Type.STRING, enum: ['Bajo', 'Medio', 'Alto'] },
                },
                required: ["sku", "description", "stock", "location", "complianceStatus", "riskLevel"],
            },
            substitutes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sku: { type: Type.STRING },
                        description: { type: Type.STRING },
                        stock: { type: Type.INTEGER },
                        location: { type: Type.STRING },
                        compatibility: { type: Type.INTEGER, description: "A score from 0-100" },
                        justification: { type: Type.STRING, description: "Technical reason for substitution" },
                        complianceStatus: { type: Type.STRING, enum: ['Validado', 'En Revisión', 'No Conforme'] },
                        riskLevel: { type: Type.STRING, enum: ['Bajo', 'Medio', 'Alto'] },
                    },
                    required: ["sku", "description", "stock", "location", "compatibility", "justification", "complianceStatus", "riskLevel"],
                },
            },
        },
        required: ["original", "substitutes"],
    };

    const prompt = `Actúa como el "Motor de Sustitución" para Tecpetrol. Dado el material "${materialDescription}", identifícalo y encuentra de 3 a 5 sustitutos potenciales de un inventario ficticio. Proporciona una justificación técnica y una puntuación de compatibilidad para cada sustituto. Tanto el material original como los sustitutos deben tener datos ficticios de stock, ubicación, estado de cumplimiento (la mayoría 'Validado') y nivel de riesgo. La respuesta completa debe estar en español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.5,
        },
    });

    return parseGeminiJson<SubstitutionResult>(response.text);
};

export const generateDashboardData = async (): Promise<{ kpis: Kpi[]; inventoryData: InventoryData[]; }> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            kpis: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        change: { type: Type.STRING },
                        changeType: { type: Type.STRING, enum: ['increase', 'decrease'] }
                    },
                    required: ["label", "value", "change", "changeType"],
                },
            },
            inventoryData: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.INTEGER }
                    },
                    required: ["name", "value"],
                }
            }
        },
        required: ["kpis", "inventoryData"],
    };

    const prompt = `Genera datos de panel para el sistema "Materiales Sustitutos" de Tecpetrol. Necesito 4 KPIs en español que reflejen los objetivos del proyecto: 'Reducción de Sobre-stock (Valor)', 'Cobertura de Faltantes con Sustitutos', 'Rotación de Inventario Mejorada', y 'Ahorro por Sustitución'. Los valores deben ser realistas para una empresa de oil & gas. Además, proporciona de 5 a 7 puntos de datos para un gráfico de barras de rotación de inventario por categoría de material. Toda la respuesta debe estar en español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });
    
    return parseGeminiJson<{ kpis: Kpi[]; inventoryData: InventoryData[]; }>(response.text);
};


export const generateAlerts = async (): Promise<Alert[]> => {
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['OBSOLESCENCE', 'OVERSTOCK', 'LOW_STOCK'] },
                severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                materialSku: { type: Type.STRING },
                message: { type: Type.STRING },
                timestamp: { type: Type.STRING, description: "ISO 8601 date format" }
            },
            required: ["id", "type", "severity", "materialSku", "message", "timestamp"],
        },
    };

    const prompt = `Genera 5 alertas de inventario realistas en español para una empresa de petróleo y gas. Incluye alertas de obsolescencia potencial (sin movimiento en >1 año), sobrestock de un material donde existe un sustituto y bajo stock de un componente crítico. Usa códigos SKU ficticios pero realistas. La respuesta completa debe estar en español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });

    return parseGeminiJson<Alert[]>(response.text);
};

export const generateConsolidationReport = async (): Promise<{suggestions: ConsolidationSuggestion[]}> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        fromSku: { type: Type.STRING },
                        toSku: { type: Type.STRING },
                        location: { type: Type.STRING },
                        justification: { type: Type.STRING }
                    },
                    required: ["fromSku", "toSku", "location", "justification"],
                }
            }
        },
        required: ["suggestions"],
    };

    const prompt = `Actúa como un sistema de optimización de inventario para Tecpetrol. Genera 3 a 5 sugerencias de consolidación de stock. Cada sugerencia debe proponer unificar el stock de un material (fromSku) en otro material sustituto (toSku) en un centro logístico específico. Proporciona una justificación basada en baja rotación, costos, o exceso de stock. La respuesta debe estar en español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });

    return parseGeminiJson<{suggestions: ConsolidationSuggestion[]}>(response.text);
};