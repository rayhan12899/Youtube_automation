/**
 * Application Constants
 */

import { AIProvider } from './services/geminiService';

export const POPULAR_TOPICS = [
  { en: "Viral Hooks & Scripts", bn: "ভাইরাল হুক ও স্ক্রিপ্ট", icon: "🪝", subs: ["Shorts Hooks", "Storytelling", "Call to Action", "Retention Tips"] },
  { en: "AI Video Creation", bn: "এআই ভিডিও তৈরি", icon: "🤖", subs: ["AI Avatars", "Voice Cloning", "Auto-Captions", "AI B-Roll"] },
  { en: "YouTube SEO Mastery", bn: "ইউটিউব এসইও মাস্টার", icon: "🔍", subs: ["Keyword Research", "Title Optimization", "Tag Strategy", "CTR Secrets"] },
  { en: "Thumbnail Design", bn: "থাম্বনেইল ডিজাইন", icon: "🖼️", subs: ["Clickbait Psychology", "Color Theory", "Face Expressions", "Typography"] },
  { en: "Niche Discovery", bn: "নিশ ডিসকভারি", icon: "🎯", subs: ["Low Competition", "High CPM", "Faceless Channels", "Trending Topics"] },
  { en: "Social Media Growth", bn: "সোশ্যাল মিডিয়া গ্রোথ", icon: "📈", subs: ["Algorithm Hacks", "Posting Schedule", "Engagement Boost", "Cross-Promotion"] },
  { en: "Monetization Hacks", bn: "মনিটাইজেশন হ্যাকস", icon: "💰", subs: ["Sponsorships", "Brand Deals", "Exclusive Content", "AdSense Optimization"] },
  { en: "Cinematic Editing", bn: "সিনেমাটিক এডিটিং", icon: "🎬", subs: ["Color Grading", "Sound Design", "Transitions", "Speed Ramping"] },
  { en: "Personal Branding", bn: "পার্সোনাল ব্র্যান্ডিং", icon: "👤", subs: ["Visual Identity", "Voice & Tone", "Logo Design", "Bio Optimization"] },
  { en: "Podcast & Audio", bn: "পডকাস্ট ও অডিও", icon: "🎙️", subs: ["Audio Quality", "Interview Skills", "Distribution", "Background Music"] },
  { en: "Short-Form Content", bn: "শর্ট-ফর্ম কন্টেন্ট", icon: "📱", subs: ["Reels Strategy", "TikTok Trends", "Shorts Loop", "Vertical Video"] },
  { en: "Content Strategy", bn: "কন্টেন্ট স্ট্র্যাটেজি", icon: "📅", subs: ["Content Calendar", "Batch Producing", "Repurposing", "Analytics"] },
  { en: "Integrated Farming", bn: "সমন্বিত কৃষি খামার", icon: "🏡", subs: ["Fish & Poultry", "Modern Irrigation", "Bio-Floc System", "Sustainable Farming"] },
  { en: "Modern Livestock", bn: "আধুনিক গবাদি পশু পালন", icon: "🐄", subs: ["Dairy Management", "Goat Fattening", "Fodder Production", "Disease Control"] },
  { en: "Smart Agriculture", bn: "স্মার্ট কৃষি প্রযুক্তি", icon: "🌱", subs: ["Hydroponics", "Greenhouse", "Vertical Farming", "Drip Irrigation"] },
  { en: "Farming Vlogs", bn: "কৃষি ব্লগিং আইডিয়া", icon: "🚀", subs: ["Daily Farm Life", "Harvesting Vlogs", "Farming Tips", "Agri-Education"] }
];

export const BEST_POSTING_TIMES = [
  { platform: "Facebook", time: "1-3 PM", period: "afternoon", icon: "📘" },
  { platform: "Instagram", time: "11 AM - 1 PM", period: "morning", icon: "📸" },
  { platform: "TikTok", time: "7-10 PM", period: "night", icon: "🎵" },
  { platform: "YouTube", time: "2-4 PM", period: "afternoon", icon: "▶️" },
  { platform: "WhatsApp", time: "8-11 AM", period: "morning", icon: "💬" },
  { platform: "All Platforms", time: "9-11 PM", period: "night", icon: "🌙" }
];

export const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' }
];

export const CONTENT_TYPES = [
  { id: 'shorts', name: 'Shorts Script', icon: '🎬' },
  { id: 'description', name: 'Video Description', icon: '📝' },
  { id: 'titleIdea', name: 'Title Idea', icon: '💡' },
  { id: 'thumbnail', name: 'Thumbnail Concept', icon: '🖼️' },
  { id: 'fullScript', name: 'Full Video Script', icon: '📜' }
];

export const TONES = [
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'funny', name: 'Funny', icon: '😂' },
  { id: 'emotional', name: 'Emotional', icon: '❤️' },
  { id: 'urgent', name: 'Urgent', icon: '🚨' }
];

export const VISUAL_STYLES = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸' },
  { id: 'illustrative', name: 'Illustrative', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '🌸' },
  { id: '3dRender', name: '3D Render', icon: '🧊' }
];

export const PROMPT_ELEMENTS = {
  subject: [
    { en: "Cybernetic Human", bn: "সাইবারনেটিক মানুষ", icon: "👤" },
    { en: "Mythical Creature", bn: "পৌরাণিক প্রাণী", icon: "🐉" },
    { en: "Futuristic Robot", bn: "ভবিষ্যত রোবট", icon: "🤖" },
    { en: "Ethereal Landscape", bn: "স্বর্গীয় ল্যান্ডস্কেপ", icon: "🏔️" },
    { en: "Abstract Geometry", bn: "বিমূর্ত জ্যামিতি", icon: "📐" },
    { en: "Historical Figure", bn: "ঐতিহাসিক ব্যক্তিত্ব", icon: "📜" },
    { en: "Sci-fi Vehicle", bn: "সাই-ফাই যানবাহন", icon: "🛸" },
    { en: "Nature Close-up", bn: "প্রকৃতির ক্লোজ-আপ", icon: "🌿" }
  ],
  camera: [
    { en: "Low Angle", bn: "নিচ থেকে অ্যাঙ্গেল", icon: "📸" },
    { en: "High Angle", bn: "উপর থেকে অ্যাঙ্গেল", icon: "📸" },
    { en: "Bird's Eye View", bn: "পাখির চোখের মতো ভিউ", icon: "🦅" },
    { en: "Close-up", bn: "ক্লোজ-আপ", icon: "🔍" },
    { en: "Wide Shot", bn: "ওয়াইড শট", icon: "🖼️" },
    { en: "Dutch Angle", bn: "ডাচ অ্যাঙ্গেল", icon: "📐" },
    { en: "Tracking Shot", bn: "ট্র্যাকিং শট", icon: "🏃" },
    { en: "Drone Shot", bn: "ড্রোন শট", icon: "🚁" }
  ],
  lighting: [
    { en: "Cinematic Lighting", bn: "সিনেমাটিক লাইটিং", icon: "💡" },
    { en: "Soft Lighting", bn: "সফট লাইটিং", icon: "☁️" },
    { en: "Neon Glow", bn: "নিয়ন গ্লো", icon: "🌈" },
    { en: "Golden Hour", bn: "গোল্ডেন আওয়ার", icon: "🌅" },
    { en: "Moody Atmosphere", bn: "মুডি অ্যাটমোস্ফিয়ার", icon: "🌫️" },
    { en: "Studio Lighting", bn: "স্টুডিও লাইটিং", icon: "🔦" },
    { en: "Natural Light", bn: "প্রাকৃতিক আলো", icon: "☀️" },
    { en: "Cyberpunk Glow", bn: "সাইবারপাঙ্ক গ্লো", icon: "🌃" }
  ],
  mood: [
    { en: "Mysterious", bn: "রহস্যময়", icon: "🕵️" },
    { en: "Joyful", bn: "আনন্দময়", icon: "😊" },
    { en: "Melancholic", bn: "বিষণ্ণ", icon: "😢" },
    { en: "Epic", bn: "মহাকাব্যিক", icon: "⚔️" },
    { en: "Futuristic", bn: "ভবিষ্যতবাদী", icon: "🚀" },
    { en: "Nostalgic", bn: "স্মৃতিবেদনাতুর", icon: "🎞️" },
    { en: "Aggressive", bn: "আক্রমণাত্মক", icon: "💢" },
    { en: "Peaceful", bn: "শান্তিপূর্ণ", icon: "🕊️" }
  ],
  environment: [
    { en: "Cyberpunk City", bn: "সাইবারপাঙ্ক শহর", icon: "🏙️" },
    { en: "Ancient Forest", bn: "প্রাচীন বন", icon: "🌳" },
    { en: "Outer Space", bn: "মহাকাশ", icon: "🌌" },
    { en: "Underwater World", bn: "পানির নিচের জগত", icon: "🌊" },
    { en: "Desert Oasis", bn: "মরুভূমির মরূদ্যান", icon: "🏜️" },
    { en: "Snowy Mountains", bn: "তুষারাবৃত পাহাড়", icon: "🏔️" },
    { en: "Post-Apocalyptic", bn: "ধ্বংসাত্মক পরবর্তী", icon: "🏚️" },
    { en: "Cozy Interior", bn: "আরামদায়ক অভ্যন্তর", icon: "🏠" }
  ],
  style: [
    { en: "Cyberpunk", bn: "সাইবারপাঙ্ক", icon: "🤖" },
    { en: "Minimalist", bn: "মিনিমালিস্ট", icon: "⚪" },
    { en: "Surrealism", bn: "সুররিয়ালিজম", icon: "🌀" },
    { en: "Hyper-realistic", bn: "হাইপার-রিয়েলিস্টিক", icon: "💎" },
    { en: "Oil Painting", bn: "তৈলচিত্র", icon: "🎨" },
    { en: "Digital Art", bn: "ডিজিটাল আর্ট", icon: "💻" },
    { en: "Vaporwave", bn: "ভেপারওয়েভ", icon: "📼" },
    { en: "Steampunk", bn: "স্টিমপাঙ্ক", icon: "⚙️" },
    { en: "Anime Style", bn: "অ্যানিমে স্টাইল", icon: "🌸" },
    { en: "3D Render", bn: "থ্রিডি রেন্ডার", icon: "🧊" }
  ],
  movement: [
    { en: "Slow Motion", bn: "স্লো মোশন", icon: "🐢" },
    { en: "Fast Paced", bn: "ফাস্ট পেসড", icon: "⚡" },
    { en: "Smooth Transitions", bn: "স্মুথ ট্রানজিশন", icon: "✨" },
    { en: "Dynamic Motion", bn: "ডাইনামিক মোশন", icon: "🔥" },
    { en: "Static Shot", bn: "স্ট্যাটিক শট", icon: "📍" },
    { en: "Time-lapse", bn: "টাইম-ল্যাপস", icon: "⏳" }
  ],
  composition: [
    { en: "Rule of Thirds", bn: "রুল অফ থার্ডস", icon: "📏" },
    { en: "Symmetrical", bn: "প্রতিসম", icon: "⚖️" },
    { en: "Leading Lines", bn: "লিডিং লাইনস", icon: "🛤️" },
    { en: "Golden Ratio", bn: "গোল্ডেন রেশিও", icon: "🌀" },
    { en: "Minimalist Framing", bn: "মিনিমালিস্ট ফ্রেমিং", icon: "🖼️" },
    { en: "Deep Depth of Field", bn: "ডিপ ডেপথ অফ ফিল্ড", icon: "🏔️" },
    { en: "Shallow Depth of Field", bn: "শ্যালো ডেপথ অফ ফিল্ড", icon: "📸" }
  ],
  colors: [
    { en: "Vibrant Colors", bn: "প্রাণবন্ত রঙ", icon: "🌈" },
    { en: "Monochrome", bn: "মনোক্রোম", icon: "⚫" },
    { en: "Pastel Tones", bn: "প্যাস্টেল টোন", icon: "🎨" },
    { en: "High Contrast", bn: "উচ্চ বৈপরীত্য", icon: "🌓" },
    { en: "Warm Tones", bn: "উষ্ণ টোন", icon: "🔥" },
    { en: "Cool Tones", bn: "শীতল টোন", icon: "❄️" },
    { en: "Sepia", bn: "সেপিয়া", icon: "🎞️" },
    { en: "Neon Palette", bn: "নিয়ন প্যালেট", icon: "🌃" }
  ],
  weather: [
    { en: "Rainy", bn: "বৃষ্টির দিন", icon: "🌧️" },
    { en: "Foggy", bn: "কুয়াশাচ্ছন্ন", icon: "🌫️" },
    { en: "Stormy", bn: "ঝড়ো", icon: "⛈️" },
    { en: "Sunny", bn: "রৌদ্রোজ্জ্বল", icon: "☀️" },
    { en: "Snowing", bn: "তুষারপাত", icon: "❄️" },
    { en: "Cloudy", bn: "মেঘলা", icon: "☁️" }
  ],
  time: [
    { en: "Dawn", bn: "ভোর", icon: "🌅" },
    { en: "Midnight", bn: "মধ্যরাত", icon: "🌑" },
    { en: "Noon", bn: "দুপুর", icon: "☀️" },
    { en: "Twilight", bn: "গোধূলি", icon: "🌇" },
    { en: "Golden Hour", bn: "গোল্ডেন আওয়ার", icon: "✨" },
    { en: "Blue Hour", bn: "ব্লু আওয়ার", icon: "🌌" }
  ],
  texture: [
    { en: "Metallic", bn: "ধাতব", icon: "🔩" },
    { en: "Glassy", bn: "কাঁচের মতো", icon: "💎" },
    { en: "Fabric", bn: "কাপড়", icon: "👕" },
    { en: "Liquid", bn: "তরল", icon: "💧" },
    { en: "Holographic", bn: "হলোগ্রাফিক", icon: "💿" },
    { en: "Rough", bn: "অমসৃণ", icon: "🧱" }
  ]
};

export const SCENE_PRESETS = [
  {
    en: "Cinematic Night",
    bn: "সিনেমাটিক রাত",
    icon: "🎬",
    elements: ["Cinematic Lighting", "Midnight", "Low Angle", "Moody Atmosphere"]
  },
  {
    en: "Cyberpunk City",
    bn: "সাইবারপাঙ্ক শহর",
    icon: "🌃",
    elements: ["Cyberpunk", "Neon Glow", "Cyberpunk City", "High Contrast"]
  },
  {
    en: "Ethereal Nature",
    bn: "স্বর্গীয় প্রকৃতি",
    icon: "🌿",
    elements: ["Ethereal Landscape", "Soft Lighting", "Golden Hour", "Ancient Forest"]
  },
  {
    en: "Epic Action",
    bn: "অ্যাকশন দৃশ্য",
    icon: "🔥",
    elements: ["Epic", "Dynamic Motion", "Wide Shot", "High Contrast"]
  }
];

export const MODEL_INFO: Record<AIProvider, { 
  name: string; 
  description: string; 
  strengths: string[]; 
  weaknesses: string[]; 
  useCases: string[]; 
  pricing: string;
}> = {
  gemini: {
    name: "Google Gemini",
    description: "Google's most capable AI model, integrated with the Google ecosystem.",
    strengths: ["Multimodal (Text, Image, Video)", "Massive context window (up to 2M tokens)", "Fast & Efficient"],
    weaknesses: ["Can be overly restrictive in safety filters"],
    useCases: ["Long document analysis", "Complex multimodal tasks", "General content creation"],
    pricing: "Free tier available; Paid for high-volume usage."
  },
  openai: {
    name: "OpenAI GPT-4o",
    description: "The industry standard for high-reasoning AI tasks.",
    strengths: ["State-of-the-art reasoning", "Excellent instruction following", "Reliable performance"],
    weaknesses: ["Higher latency", "More expensive than competitors"],
    useCases: ["Complex logic & coding", "High-quality creative writing", "Strategic planning"],
    pricing: "~$5.00 per 1M input tokens; ~$15.00 per 1M output tokens."
  },
  groq: {
    name: "Groq (Llama 3.3 70B)",
    description: "The world's fastest AI inference engine, powered by LPU technology.",
    strengths: ["Ultra-fast response times", "Excellent for real-time apps", "High throughput"],
    weaknesses: ["Smaller context window compared to Gemini"],
    useCases: ["Real-time script generation", "Fast brainstorming", "Interactive AI agents"],
    pricing: "Extremely low cost; Free for some models on Groq Cloud."
  },
  deepseek: {
    name: "DeepSeek-V3",
    description: "A high-performance, open-source model optimized for coding and math.",
    strengths: ["Exceptional coding capability", "Very low cost", "Strong logical reasoning"],
    weaknesses: ["Newer provider with potentially lower stability"],
    useCases: ["Technical content writing", "Code generation", "Mathematical problem solving"],
    pricing: "~$0.10 per 1M input tokens; ~$0.20 per 1M output tokens."
  },
  perplexity: {
    name: "Perplexity Sonar",
    description: "AI-powered search engine that provides real-time information with citations.",
    strengths: ["Real-time web access", "Accurate source citations", "Up-to-date information"],
    weaknesses: ["Primarily optimized for search/research tasks"],
    useCases: ["SEO research", "Fact-checking", "Market analysis & trends"],
    pricing: "~$5.00 per 1M tokens (includes search cost)."
  },
  gemma: {
    name: "Google Gemma 4",
    description: "Google's open-weights model, optimized for high performance and efficiency.",
    strengths: ["Open-weights flexibility", "High performance for its size", "Efficient inference"],
    weaknesses: ["Smaller context window than Gemini Pro"],
    useCases: ["Local deployment", "Fine-tuning for specific tasks", "General AI assistance"],
    pricing: "Free on some platforms (e.g., Groq); Low cost via API providers."
  }
};
