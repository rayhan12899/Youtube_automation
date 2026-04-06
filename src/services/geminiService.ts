import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import OpenAI from "openai";

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'deepseek' | 'perplexity' | 'gemma';

// Function to get the current provider
const getProvider = (): AIProvider => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('AI_PROVIDER') as AIProvider) || 'gemini';
  }
  return 'gemini';
};

// Function to get the API key for a specific provider
const getApiKey = (provider: AIProvider) => {
  if (typeof window !== 'undefined') {
    const keyMap = {
      gemini: 'CUSTOM_GEMINI_API_KEY',
      openai: 'CUSTOM_OPENAI_API_KEY',
      groq: 'CUSTOM_GROQ_API_KEY',
      deepseek: 'CUSTOM_DEEPSEEK_API_KEY',
      perplexity: 'CUSTOM_PERPLEXITY_API_KEY',
      gemma: 'CUSTOM_GEMMA_API_KEY'
    };
    const savedKey = localStorage.getItem(keyMap[provider]);
    if (savedKey) return savedKey;
  }
  
  if (provider === 'gemini') return process.env.GEMINI_API_KEY || "";
  return "";
};

// Initialize AI clients
let ai = new GoogleGenAI({ apiKey: getApiKey('gemini') || "OFFLINE_MODE" });
let openaiClient: OpenAI | null = null;
let groqClient: OpenAI | null = null;
let deepseekClient: OpenAI | null = null;
let perplexityClient: OpenAI | null = null;
let gemmaClient: OpenAI | null = null;

const initClients = () => {
  const provider = getProvider();
  const geminiKey = getApiKey('gemini');
  const openaiKey = getApiKey('openai');
  const groqKey = getApiKey('groq');
  const deepseekKey = getApiKey('deepseek');
  const perplexityKey = getApiKey('perplexity');
  const gemmaKey = getApiKey('gemma');

  ai = new GoogleGenAI({ apiKey: geminiKey || "OFFLINE_MODE" });
  
  if (openaiKey) {
    openaiClient = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
  }
  
  if (groqKey) {
    groqClient = new OpenAI({ 
      apiKey: groqKey, 
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true 
    });
  }

  if (deepseekKey) {
    deepseekClient = new OpenAI({ 
      apiKey: deepseekKey, 
      baseURL: "https://api.deepseek.com",
      dangerouslyAllowBrowser: true 
    });
  }

  if (perplexityKey) {
    perplexityClient = new OpenAI({ 
      apiKey: perplexityKey, 
      baseURL: "https://api.perplexity.ai",
      dangerouslyAllowBrowser: true 
    });
  }

  if (gemmaKey) {
    gemmaClient = new OpenAI({ 
      apiKey: gemmaKey, 
      baseURL: "https://api.groq.com/openai/v1", // Defaulting to Groq for Gemma if not specified
      dangerouslyAllowBrowser: true 
    });
  }
};

initClients();

let isOffline = !getApiKey(getProvider()) && getProvider() === 'gemini' && !process.env.GEMINI_API_KEY;

// Function to update provider and keys
export const updateAIConfig = (provider: AIProvider, keys: Partial<Record<AIProvider, string>>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AI_PROVIDER', provider);
    if (keys.gemini) localStorage.setItem('CUSTOM_GEMINI_API_KEY', keys.gemini);
    if (keys.openai) localStorage.setItem('CUSTOM_OPENAI_API_KEY', keys.openai);
    if (keys.groq) localStorage.setItem('CUSTOM_GROQ_API_KEY', keys.groq);
    if (keys.deepseek) localStorage.setItem('CUSTOM_DEEPSEEK_API_KEY', keys.deepseek);
    if (keys.perplexity) localStorage.setItem('CUSTOM_PERPLEXITY_API_KEY', keys.perplexity);
    if (keys.gemma) localStorage.setItem('CUSTOM_GEMMA_API_KEY', keys.gemma);
  }
  initClients();
  const currentKey = getApiKey(provider);
  isOffline = !currentKey && provider === 'gemini' && !process.env.GEMINI_API_KEY;
};

// Function to transcribe audio
export const transcribeAudio = async (audioData: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: audioData,
              mimeType: mimeType,
            },
          },
          { text: "Transcribe this audio." },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

// Function to analyze image
export const analyzeImage = async (imageData: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          { text: "Analyze this image and describe it in detail." },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};
// Function to reset to default
export const resetAIConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('AI_PROVIDER');
    localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    localStorage.removeItem('CUSTOM_OPENAI_API_KEY');
    localStorage.removeItem('CUSTOM_GROQ_API_KEY');
    localStorage.removeItem('CUSTOM_DEEPSEEK_API_KEY');
    localStorage.removeItem('CUSTOM_PERPLEXITY_API_KEY');
    localStorage.removeItem('CUSTOM_GEMMA_API_KEY');
  }
  initClients();
};

export interface GenerationOptions {
  topic: string;
  generateImagePrompt: boolean;
  generateVideoPrompt: boolean;
  generateThumbnail: boolean;
  generateDescription: boolean;
  generateTags: boolean;
  generateScript: boolean;
  generateSeoChecklist: boolean;
  generateKeywords: boolean;
  language: "bn" | "en" | "both" | "hi";
  videoDuration?: number; // in seconds
  scriptWordCount?: number; // in words
  scriptCharacterCount?: number; // in characters
  contentType?: string;
  platform?: string;
  tone?: string;
  businessType?: string;
  visualStyle?: string;
  cameraAngle?: string;
  mood?: string;
  customThumbnailElements?: string;
}

// Helper to extract JSON from model response
const extractJson = (text: string) => {
  const cleanText = text.trim();
  try {
    // Try direct parse first
    return JSON.parse(cleanText);
  } catch (e) {
    // If it fails, try to extract from markdown code blocks
    const markdownMatch = cleanText.match(/```json\n?([\s\S]*?)\n?```/) || 
                          cleanText.match(/```([\s\S]*?)```/);
    
    if (markdownMatch && markdownMatch[1]) {
      const innerText = markdownMatch[1].trim();
      try {
        return JSON.parse(innerText);
      } catch (e2) {
        // If markdown block fails, fall through to brace extraction
      }
    }

    // Fallback: try to find the first '{' and search backwards for the matching '}'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    // Choose the one that appears first
    const startIndex = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
    const endChar = startIndex === firstBrace ? '}' : ']';

    if (startIndex !== -1) {
      let lastIndex = cleanText.lastIndexOf(endChar);
      while (lastIndex > startIndex) {
        try {
          const candidate = cleanText.substring(startIndex, lastIndex + 1);
          return JSON.parse(candidate);
        } catch (err) {
          lastIndex = cleanText.lastIndexOf(endChar, lastIndex - 1);
        }
      }
    }

    console.error("Failed to parse JSON. Raw text:", text);
    throw new Error("Could not parse JSON from response. Please try again.");
  }
};

// Generic function to call AI based on selected provider with retry logic
const callAI = async (prompt: string, responseMimeType: string = "text/plain", retries: number = 2) => {
  const provider = getProvider();
  
  const executeCall = async () => {
    if (provider === 'gemini') {
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: { 
          responseMimeType,
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const result = await model;
      return result.text;
    } else {
      let client: OpenAI | null = null;
      let modelName = "";

      switch (provider) {
        case 'openai':
          client = openaiClient;
          modelName = "gpt-4o";
          break;
        case 'groq':
          client = groqClient;
          modelName = "llama-3.3-70b-versatile";
          break;
        case 'deepseek':
          client = deepseekClient;
          modelName = "deepseek-chat";
          break;
        case 'perplexity':
          client = perplexityClient;
          modelName = "llama-3.1-sonar-large-128k-online";
          break;
        case 'gemma':
          client = gemmaClient;
          modelName = "google/gemma-4-31B-it";
          break;
      }

      if (!client) throw new Error(`${provider} client not initialized. Please check your API key.`);
      
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: responseMimeType === "application/json" ? { type: "json_object" } : undefined,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || "";
    }
  };

  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await executeCall();
    } catch (error) {
      console.warn(`AI call failed (attempt ${i + 1}/${retries + 1}):`, error);
      lastError = error;
      if (i < retries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastError;
};

export const generateContent = async (options: GenerationOptions) => {
  if (isOffline) {
    return {
      imagePrompt: `A professional thumbnail for ${options.topic}`,
      videoPrompt: `A cinematic video about ${options.topic} with smooth transitions and professional lighting.`,
      thumbnailIdea: `Showing a person interacting with ${options.topic} in a bright studio.`,
      description: `In this video, we explore ${options.topic}. Don't forget to like and subscribe!`,
      tags: `${options.topic}, tutorial, 2026, viral`,
      script: `[Scene 1: Intro]\nHost: Welcome back! Today we are talking about ${options.topic}.\n[Scene 2: Main Content]\nHost: Here are the key points...\n[Scene 3: Outro]\nHost: Thanks for watching!`,
      seoChecklist: ["Optimize title", "Add tags", "Write description", "Create thumbnail"],
      keywords: [{ keyword: options.topic, searchVolume: "High", competition: "Medium" }]
    };
  }

  try {
    const prompt = `You are a professional social media content strategist. Based on the following options, generate content in ${options.language === 'bn' ? 'Bengali' : options.language === 'en' ? 'English' : 'both Bengali and English'}.
              
              Topic: ${options.topic}
              Platform: ${options.platform || "YouTube"}
              Content Type: ${options.contentType || "General Content"}
              Tone/Mood: ${options.tone || "Professional"}
              Business/Niche: ${options.businessType || "N/A"}
              Visual Style: ${options.visualStyle || "N/A"}
              Custom Thumbnail Elements: ${options.customThumbnailElements || "N/A"}
              
              Generate the following sections if requested:
              - Image Prompt: ${options.generateImagePrompt} ${options.visualStyle ? `(Ensure the image prompt specifically requests a ${options.visualStyle} style.)` : ""}
              - Video Prompt: ${options.generateVideoPrompt} ${options.videoDuration ? `(Target duration: ${options.videoDuration} seconds. Provide a highly detailed, cinematic prompt for AI video generators like Sora, Kling, Runway, or Veo 3. 
                  CRITICAL: The video prompt MUST be broken down into SCENES that correspond EXACTLY to the script's scenes. For each scene in the script, provide a matching visual prompt.
                  Include specific details about:
                  1. Camera Angles & Movements: Incorporate "${options.cameraAngle || 'dynamic tracking shots, low-angle pans, or drone fly-throughs'}". Use professional terms like 'close-up tracking shot', 'wide establishing shot', or 'handheld jitter' where appropriate.
                  2. Lighting & Atmosphere: Incorporate "${options.mood || 'cinematic neon lighting, golden hour, or moody and atmospheric'}". Use phrases like 'volumetric lighting', 'high-contrast shadows', or 'soft diffused glow'.
                  3. Specific Visual Sequences: Describe the exact action, pacing, and subject details. Ensure the motion is "${options.mood === 'Energetic' ? 'fast-paced and dynamic' : 'smooth and cinematic'}".
                  4. Pacing: Ensure the prompt aligns with the target duration and word count (${options.scriptWordCount || 'N/A'} words).
                  5. Visual Style: The overall aesthetic must be strictly "${options.visualStyle || 'photorealistic cinematic'}". Use keywords like '8k resolution', 'hyper-realistic textures', and 'masterpiece'.)` : ""}
              - Thumbnail Idea: ${options.generateThumbnail}
              - Description: ${options.generateDescription}
              - Tags: ${options.generateTags}
              - Script: ${options.generateScript} ${options.scriptWordCount ? `(Target length: approximately ${options.scriptWordCount} words${options.scriptCharacterCount ? ` and strictly under ${options.scriptCharacterCount} characters` : ''}. The script MUST be a full professional YouTube script including: 
                  1. Scene-by-scene descriptions (what should be happening on screen).
                  2. Engaging dialogue or voiceover text.
                  3. Clear Calls to Action (CTA) like subscribing, liking, or checking links.
                  4. Timestamps or pacing suggestions based on the ${options.videoDuration} seconds duration.
                  CRITICAL: Each scene in the script MUST have a corresponding visual description that matches the 'Video Prompt' section perfectly. Accuracy in timing and scene mapping is mandatory.)` : ""}
              - SEO Checklist: ${options.generateSeoChecklist} (A comprehensive YouTube SEO checklist including keyword research, title optimization, description best practices, tag strategy, thumbnail effectiveness, and end screen/card usage. Return as a structured list.)
              - Keyword Research: ${options.generateKeywords} (Provide a list of 10-15 relevant keywords for the topic. For each keyword, include an estimated 'searchVolume' (Low, Medium, High, or a number) and 'competition' (Low, Medium, High). Return as an array of objects.)
              
              Special Instruction for Content Type: If the Content Type is 'shorts', focus on high-energy, fast-paced vertical content. If it's 'thumbnail', provide detailed visual descriptions for a high-CTR thumbnail. If it's 'titleIdea', provide 5 catchy, viral-style titles. If it's 'description', provide an SEO-optimized video description. If it's 'fullScript', provide a comprehensive video script with scene details.
              
              Return the result as a strictly valid JSON object with keys: imagePrompt, videoPrompt, thumbnailIdea, description, tags, script, seoChecklist, keywords, sceneBreakdown. If a section is not requested, return null for that key. 
              
              - sceneBreakdown: An array of objects, each representing a scene. Each object MUST have:
                - 'scene': The scene number (1, 2, 3...).
                - 'time': The timestamp range (e.g., "0:00 - 0:10").
                - 'script': The dialogue or voiceover for this specific scene.
                - 'visual': The detailed visual prompt for this specific scene.
              
              CRITICAL: The number of scenes in 'sceneBreakdown' MUST match the total duration and the complexity of the topic. Each scene's 'script' and 'visual' MUST be perfectly synchronized.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any preamble, postamble, or explanation outside the JSON object. Ensure the JSON is valid and properly escaped.`;

    const text = await callAI(prompt, "application/json");
    return extractJson(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      imagePrompt: "Error generating prompt",
      videoPrompt: "Error generating prompt",
      thumbnailIdea: "Error generating idea",
      description: "Error generating description",
      tags: "error",
      script: "Error generating script",
      seoChecklist: [],
      keywords: [],
      sceneBreakdown: []
    };
  }
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9") => {
  if (isOffline) {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Image Generation Error:", error);
    return `https://picsum.photos/seed/error/1280/720`;
  }
};

export const generateVoiceOver = async (
  text: string, 
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore',
  options?: { tone?: string; accent?: string; age?: string }
) => {
  let promptText = text;
  if (options && (options.tone || options.accent || options.age)) {
    const instructions = [
      options.tone && `${options.tone} tone`,
      options.age && `${options.age} age`,
      options.accent && `${options.accent} accent`
    ].filter(Boolean).join(', ');
    promptText = `Say in a ${instructions} voice: ${text}`;
  }

  if (isOffline) {
    return ""; 
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const rawData = atob(base64Audio);
      const buffer = new ArrayBuffer(44 + rawData.length);
      const view = new DataView(buffer);

      view.setUint32(0, 0x52494646, false); 
      view.setUint32(4, 36 + rawData.length, true);
      view.setUint32(8, 0x57415645, false); 
      view.setUint32(12, 0x666d7420, false); 
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 24000, true);
      view.setUint32(28, 24000 * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false); 
      view.setUint32(40, rawData.length, true);

      for (let i = 0; i < rawData.length; i++) {
        view.setUint8(44 + i, rawData.charCodeAt(i));
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
    throw new Error("No audio data returned from Gemini");
  } catch (error) {
    console.error("Voice Over Error:", error);
    return "";
  }
};

export const generateVoiceExtractor = async (
  audioData: string,
  mimeType: string,
  targetLanguage: 'en' | 'bn' | 'hi'
) => {
  if (isOffline) {
    return {
      translatedText: "Offline mode: Translated text will appear here.",
      script: "Offline mode: Generated script will appear here.",
      imagePrompt: "Offline mode: Image prompt will appear here.",
      videoPrompt: "Offline mode: Video prompt will appear here."
    };
  }

  try {
    const base64Data = audioData.split(',')[1];
    const languageName = targetLanguage === 'en' ? 'English' : targetLanguage === 'bn' ? 'Bengali' : 'Hindi';

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Analyze this audio/video file. First, transcribe and translate the spoken content into ${languageName} with 100% accuracy.
              Then, based on the translated text, generate:
              1. A comprehensive 'Summary' of the content.
              2. A complete professional YouTube 'Script'.
              3. An 'Image Prompt' for a YouTube thumbnail generator.
              4. A 'Video Prompt' for an AI video generator (optimized for Sora/Kling/Runway/Veo 3).
              5. 'Subtitles' in standard SRT format translated into English, Bengali, Hindi, Spanish, and French.
              6. 'Metadata' including:
                 - 'title': A standard descriptive title.
                 - 'highCtrTitle': A viral, high CTR title to grab attention.
                 - 'thumbnailTitle': Short, punchy text to put ON the thumbnail (thermal title).
                 - 'description': A long, SEO-optimized YouTube description.
                 - 'tags': A comma-separated list of SEO tags.
                 - 'hashtags': A list of 3-5 trending hashtags.
              
              Return the result as a strictly valid JSON object with the following keys:
              - 'translatedText': The highly accurate translation in ${languageName}.
              - 'summary': A detailed summary in ${languageName}.
              - 'script': The generated video script in ${languageName}.
              - 'imagePrompt': The image generation prompt in English.
              - 'videoPrompt': The video generation prompt in English.
              - 'subtitles': An object containing the SRT formatted subtitles. Keys must be 'en', 'bn', 'hi', 'es', 'fr' and values must be the SRT strings.
              - 'metadata': An object containing title, highCtrTitle, thumbnailTitle, description, tags, hashtags.
              - 'sceneBreakdown': An array of objects, each with 'scene', 'time', 'script', and 'visual' keys, providing a 1:1 mapping between script and visual prompts.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      },
    });

    return extractJson(response.text);
  } catch (error) {
    console.error("Voice Extractor Error:", error);
    return {
      translatedText: "Error processing audio.",
      script: "Error generating script.",
      imagePrompt: "Error generating image prompt.",
      videoPrompt: "Error generating video prompt.",
      sceneBreakdown: [],
      metadata: {
        title: "Error",
        highCtrTitle: "Error",
        thumbnailTitle: "Error",
        description: "Error",
        tags: "",
        hashtags: ""
      }
    };
  }
};

export const generateVideoIdeas = async (niche: string, language: "bn" | "en" | "both" | "hi") => {
  if (isOffline) {
    return {
      ideas: [
        { title: `How to start in ${niche}`, description: "A beginner's guide to the industry." },
        { title: `Top 10 ${niche} trends`, description: "What's hot right now." }
      ]
    };
  }

  try {
    const prompt = `You are a creative YouTube content strategist. Generate 10 highly targeted, viral video ideas based on the following keyword or niche: "${niche}". 
              The ideas should be engaging, trending, and specifically tailored to the provided keyword/niche. 
              Provide the ideas in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Return the result as a strictly valid JSON object with a key 'ideas' which is an array of objects, each with 'title' and 'description' keys. Do not include any text outside the JSON object.`;

    const text = await callAI(prompt, "application/json");
    return extractJson(text);
  } catch (error) {
    console.error("Video Ideas Error:", error);
    return { ideas: [] };
  }
};

export const getTrendingTopics = async (language: "bn" | "en" | "both" | "hi" = "bn") => {
  if (isOffline) {
    return {
      trending: [
        { topic: "AI in 2026", reason: "Rapid advancements in multimodal models." },
        { topic: "Sustainable Living", reason: "Global focus on environment." }
      ]
    };
  }

  try {
    const prompt = `Search for the most viral and trending YouTube topics and video ideas for this week (March 2026). 
              Analyze current global and local trends. 
              Provide a list of 6 highly trending topics that are likely to go viral.
              Return the result as a strictly valid JSON object with a key 'trending' which is an array of objects, each with 'topic' and 'reason' keys.
              The 'topic' should be a short catchy title, and 'reason' should explain why it's trending.
              Provide the content in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}. 
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Do not include any text outside the JSON object.`;

    // Note: Google Search tool is Gemini-specific. For other providers, we rely on their internal knowledge.
    const provider = getProvider();
    let text;
    if (provider === 'gemini') {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });
      text = response.text;
    } else {
      text = await callAI(prompt, "application/json");
    }

    return extractJson(text);
  } catch (error) {
    console.error("Trending Topics Error:", error);
    return { trending: [] };
  }
};

export const generatePromptsFromVideo = async (base64Video: string, mimeType: string, language: "bn" | "en" | "both" | "hi" = "bn", instruction: string = "", videoDuration?: number, scriptWordCount?: number, visualStyle: string = "cinematic", cameraAngle: string = "wide shot", mood: string = "cinematic") => {
  if (isOffline) {
    return {
      summary: "This is a mock summary of the uploaded video.",
      imagePrompt: "A cinematic thumbnail based on the video content.",
      videoPrompt: "A detailed video prompt for AI generation.",
      script: "A full script extracted from the video content.",
      metadata: {
        title: "Extracted Video Title",
        highCtrTitle: "Viral High CTR Title",
        thumbnailTitle: "Catchy Thumbnail Text",
        description: "Extracted SEO optimized description from the video.",
        tags: "video, analysis, ai",
        hashtags: "#ai #video #analysis"
      }
    };
  }

  if (!base64Video || !base64Video.includes(",")) {
    throw new Error("Invalid video data provided");
  }

  const actualMimeType = mimeType || base64Video.split(";")[0].split(":")[1] || "video/mp4";
  
  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Video.split(",")[1],
                mimeType: actualMimeType,
              },
            },
            {
              text: `Analyze this video and extract all possible information for a professional YouTube creator. 
              
              Ensure the visual style for both image and video prompts is strictly ${visualStyle}.
              Ensure the camera angle is strictly ${cameraAngle}.
              Ensure the mood is strictly ${mood}.
              
              Generate:
              1. A comprehensive 'Summary' of what happens in the video.
              2. A detailed 'Image Prompt' for a YouTube thumbnail generator.
              3. A 'Video Prompt' for an AI video generator (optimized for Sora/Kling/Runway/Veo 3).
                 - CRITICAL: The video prompt MUST be broken down into SCENES.
                 - Include specific details about:
                   - Camera Angles & Movements: Incorporate "${cameraAngle || 'dynamic tracking shots, low-angle pans, or drone fly-throughs'}". Use professional terms like 'close-up tracking shot', 'wide establishing shot', or 'handheld jitter'.
                   - Lighting & Atmosphere: Incorporate "${mood || 'cinematic neon lighting, golden hour, or moody and atmospheric'}". Use phrases like 'volumetric lighting', 'high-contrast shadows', or 'soft diffused glow'.
                   - Specific Visual Sequences: Describe the exact action, pacing, and subject details. Ensure the motion is "${mood === 'Energetic' ? 'fast-paced and dynamic' : 'smooth and cinematic'}".
                   - Visual Style: The overall aesthetic must be strictly "${visualStyle || 'photorealistic cinematic'}". Use keywords like '8k resolution', 'hyper-realistic textures', and 'masterpiece'.
              4. A full professional YouTube 'Script' that matches the video's content.
              5. 'Metadata' including:
                 - 'title': A standard descriptive title.
                 - 'highCtrTitle': A viral, high CTR title to grab attention.
                 - 'thumbnailTitle': Short, punchy text to put ON the thumbnail (thermal title).
                 - 'description': A long, SEO-optimized YouTube description.
                 - 'tags': A comma-separated list of SEO tags.
                 - 'hashtags': A list of 3-5 trending hashtags.
              
              ${videoDuration ? `Target video duration: ${videoDuration} seconds.` : ""}
              ${scriptWordCount ? `Target script length: approximately ${scriptWordCount} words.` : ""}
              ${instruction ? `Additional Instruction: ${instruction}` : ""}
              
              Provide the content in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Return as a strictly valid JSON object with keys: summary, imagePrompt, videoPrompt, script, sceneBreakdown, metadata (object with title, highCtrTitle, thumbnailTitle, description, tags, hashtags). 
              
              - 'sceneBreakdown': An array of objects, each with 'scene', 'time', 'script', and 'visual' keys, providing a 1:1 mapping between script and visual prompts.
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    const result = await model;
    return extractJson(result.text);
  } catch (error) {
    console.error("Video Analysis Error:", error);
    throw error;
  }
};

export const generatePromptsFromImage = async (base64Image: string, mimeType: string, language: "bn" | "en" | "both" | "hi" = "bn", instruction: string = "", videoDuration?: number, scriptWordCount?: number, visualStyle: string = "cinematic", cameraAngle: string = "wide shot", mood: string = "cinematic") => {
  if (isOffline) {
    return {
      imagePrompt: "A cinematic thumbnail based on the image.",
      videoPrompt: "A detailed video prompt for AI generation.",
      script: "A full script based on the image."
    };
  }

  if (!base64Image || !base64Image.includes(",")) {
    throw new Error("Invalid image data provided");
  }

  const actualMimeType = mimeType || base64Image.split(";")[0].split(":")[1] || "image/jpeg";
  
  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image.split(",")[1],
                mimeType: actualMimeType,
              },
            },
            {
              text: `Analyze this image and generate:
              1. A comprehensive 'Summary' (detailed analysis) of what is in the image.
              2. A detailed 'Image Prompt' for an AI image generator.
              3. A highly detailed 'Video Prompt' for an AI video generator (optimized for Sora/Kling/Runway/Veo 3).
                 - CRITICAL: The video prompt MUST be broken down into SCENES.
                 - Include specific details about:
                   - Camera Angles & Movements: Incorporate "${cameraAngle || 'dynamic tracking shots, low-angle pans, or drone fly-throughs'}". Use professional terms like 'close-up tracking shot', 'wide establishing shot', or 'handheld jitter'.
                   - Lighting & Atmosphere: Incorporate "${mood || 'cinematic neon lighting, golden hour, or moody and atmospheric'}". Use phrases like 'volumetric lighting', 'high-contrast shadows', or 'soft diffused glow'.
                   - Specific Visual Sequences: Describe the exact action, pacing, and subject details. Ensure the motion is "${mood === 'Energetic' ? 'fast-paced and dynamic' : 'smooth and cinematic'}".
                   - Visual Style: The overall aesthetic must be strictly "${visualStyle || 'photorealistic cinematic'}". Use keywords like '8k resolution', 'hyper-realistic textures', and 'masterpiece'.
              4. A full professional YouTube 'Script' based on the visual elements of this image. 
              
              Ensure the visual style for both image and video prompts is strictly ${visualStyle}.
              Ensure the camera angle is strictly ${cameraAngle}.
              Ensure the mood is strictly ${mood}.
              ${videoDuration ? `Target video duration: ${videoDuration} seconds.` : ""}
              ${scriptWordCount ? `Target script length: approximately ${scriptWordCount} words.` : ""}
              ${instruction ? `Additional Instruction: ${instruction}` : ""}
              
              The script MUST include:
              1. Scene-by-scene descriptions (what should be happening on screen).
              2. Engaging dialogue or voiceover text.
              3. Clear Calls to Action (CTA).
              4. Pacing suggestions based on the ${videoDuration || 60} seconds duration.
              
              Provide the content in ${language === 'bn' ? 'Bengali' : language === 'en' ? 'English' : 'both Bengali and English'}.
              
              CRITICAL: Do NOT include any e-commerce, online shop, or product sales promotion language. Avoid phrases like "Order now", "Visit our website", "100% organic", or anything related to selling products (e.g., organic rice). Focus strictly on engaging social media video content.
              
              Return as a strictly valid JSON object with keys: summary, imagePrompt, videoPrompt, script, sceneBreakdown. 
              
              - 'sceneBreakdown': An array of objects, each with 'scene', 'time', 'script', and 'visual' keys, providing a 1:1 mapping between script and visual prompts.
              
              Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    const result = await model;
    return extractJson(result.text);
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
};
