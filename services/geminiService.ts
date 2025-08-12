
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PronunciationAnalysis, WordIpaPair } from '../types';
import { getApiKey } from "../utils/apiKey";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

function getAiClient(): GoogleGenAI {
    const userApiKey = getApiKey();
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
        throw new Error("API Key không được tìm thấy. Vui lòng vào Cài đặt để thêm API Key của bạn.");
    }

    if (ai && apiKey === currentApiKey) {
        return ai;
    }
    
    currentApiKey = apiKey;
    ai = new GoogleGenAI({ apiKey: currentApiKey });
    return ai;
}


const generationConfig = {
    responseMimeType: "application/json",
};

export async function getMeaningForSentence(sentence: string): Promise<string> {
    if (!sentence) return "";
    const ai = getAiClient();
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Dịch câu tiếng Anh sau sang tiếng Việt: "${sentence}"`,
            config: {
                ...generationConfig,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        meaning: {
                            type: Type.STRING,
                            description: "Nghĩa tiếng Việt của câu."
                        }
                    }
                }
            }
        });

        const json = JSON.parse(response.text);
        return json.meaning || "Không thể dịch câu này.";
    } catch (error) {
        console.error("Error fetching meaning:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
            throw error;
        }
        return "Không thể dịch nghĩa cho câu này.";
    }
}

export async function getIpaForSentence(sentence: string): Promise<WordIpaPair[]> {
    if (!sentence) return [];
    const ai = getAiClient();
    const prompt = `Đối với mỗi từ trong câu sau, hãy cung cấp phiên âm IPA (phiên âm Anh-Mỹ). Trả về kết quả dưới dạng một mảng JSON. Mỗi đối tượng trong mảng phải có thuộc tính "word" và "ipa". Câu: "${sentence}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: {
                                type: Type.STRING,
                                description: "The word from the sentence."
                            },
                            ipa: {
                                type: Type.STRING,
                                description: "The International Phonetic Alphabet transcription of the word (American English)."
                            }
                        },
                        required: ["word", "ipa"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (Array.isArray(result) && result.every(item => typeof item.word === 'string' && typeof item.ipa === 'string')) {
            return result as WordIpaPair[];
        }
        console.error("Gemini API returned an invalid structure for IPA:", result);
        return [];
    } catch (error) {
        console.error("Error fetching structured IPA from Gemini:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
            throw error;
        }
        return [];
    }
}

export async function analyzePronunciation(
    sentence: string,
    audioBase64: string,
    mimeType: string
): Promise<PronunciationAnalysis> {
    const ai = getAiClient();
    const prompt = `Bạn là một chuyên gia huấn luyện phát âm tiếng Anh. Nhiệm vụ của bạn là phân tích âm thanh người dùng nói một câu cho trước và cung cấp phản hồi rõ ràng, ngắn gọn và khích lệ. 
    Câu đó là: "${sentence}".
    Phân tích bản ghi âm được cung cấp. 
    Cung cấp phản hồi của bạn trong một đối tượng JSON theo lược đồ sau:
    {
        "type": "OBJECT",
        "properties": {
            "goodPoints": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "Một danh sách các cụm từ khen ngợi những gì người dùng phát âm tốt."
            },
            "areasForImprovement": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "word": {"type": "STRING"},
                        "feedback": {"type": "STRING"}
                    }
                },
                "description": "Một danh sách các đối tượng, mỗi đối tượng chứa một từ cần cải thiện và phản hồi cụ thể về cách cải thiện nó."
            }
        }
    }`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inlineData: { data: audioBase64, mimeType: mimeType } }
                    ]
                }
            ],
            config: {
                ...generationConfig
            }
        });

        const jsonText = response.text.trim();
        const analysis: PronunciationAnalysis = JSON.parse(jsonText);
        return analysis;
    } catch (error) {
        console.error("Error analyzing pronunciation:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
            throw error;
        }
        throw new Error("Không thể phân tích phát âm. Mô hình có thể đã trả về một định dạng không mong muốn.");
    }
}
