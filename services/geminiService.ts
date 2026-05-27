
import { GoogleGenAI } from "@google/genai";
import * as mammoth from 'mammoth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractTextFromFile = async (base64DataUrl: string): Promise<string> => {
  try {
    // Extract mimeType and base64 string from data URL
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid base64 data URL format.");
    }
    const mimeType = matches[1];
    const base64Data = matches[2];

    // Handle .docx files separately as Gemini might not support them directly in inlineData
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || "No se pudo extraer texto del documento Word.";
      } catch (mammothError) {
        console.error("Error extracting text with mammoth:", mammothError);
        throw new Error("No se pudo procesar el archivo Word.");
      }
    }

    // For other supported types (images, PDFs), use Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract all the text from this document or image so it can be read aloud to a student. Only return the extracted text content, without any additional comments or formatting markers.",
          },
        ],
      },
      config: {
        temperature: 0.1, // Low temperature for more accurate extraction
      }
    });

    return response.text || "No se pudo extraer texto del archivo.";
  } catch (error: any) {
    console.error("Error extracting text with Gemini:", error);
    
    // Check for specific Gemini errors to provide better feedback
    if (error?.message?.includes("Unsupported MIME type")) {
      throw new Error("El formato de este archivo no es compatible con la extracción de texto. Prueba con una imagen o un PDF.");
    }
    
    throw new Error("No se pudo leer el contenido del archivo con la asistencia de voz.");
  }
};
