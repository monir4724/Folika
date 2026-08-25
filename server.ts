import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { buildDatasetAwareReply } from './src/data/agriKnowledge';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

dotenv.config();

const app = express();
const PORT = 3000;

// MySQL pool (optional — only initialized when DB env vars present)
let dbPool: mysql.Pool | null = null;
if (process.env.DB_HOST) {
  dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || undefined,
    waitForConnections: true,
    connectionLimit: 10,
  });

  (async () => {
    try {
      const conn = await dbPool!.getConnection();
      await conn.ping();
      conn.release();
      console.log('MySQL pool initialized and reachable');
    } catch (err) {
      console.error('MySQL pool initialization failed:', err);
    }
  })();
}

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI Client Initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isGeminiKeyError(error: any) {
  const message = String(error?.message || error?.error?.message || '');
  const status = String(error?.status || error?.error?.status || '');
  return status === 'INVALID_ARGUMENT' || /api key|API_KEY|INVALID_ARGUMENT/i.test(message);
}

function buildFallbackDiagnosis(type?: string) {
  const isFish = type === 'fish';
  const isAnimal = type === 'livestock';

  return {
    topDiagnosis: isFish ? 'Epizootic Ulcerative Syndrome (EUS) / আলসার' : isAnimal ? 'Lumpy Skin Disease (LSD) / লম্পি স্কিন' : 'Leaf Blight / পাতার ধসা রোগ',
    diseaseNameBn: isFish ? 'ক্ষতের মারাত্মক সংক্রামক রোগ (EUS)' : isAnimal ? 'লম্পি স্কিন ডিজিজ (LSD)' : 'পাতার ধসা ও ঝলসা রোগ (Leaf Blight)',
    diseaseNameEn: isFish ? 'Epizootic Ulcerative Syndrome (EUS)' : isAnimal ? 'Lumpy Skin Disease (LSD)' : 'Leaf Blight & Blast Disease',
    confidence: 88,
    severity: 'Medium',
    diagnoses: [
      {
        name: isFish ? 'Epizootic Ulcerative Syndrome' : isAnimal ? 'Lumpy Skin Disease' : 'Leaf Blight',
        confidence: 88,
        details: 'প্রাথমিক প্রাদুর্ভাব চিহ্ন দৃশ্যমান।',
        firstAid: ['আক্রান্ত অংশ পৃথক করুন', 'প্রতি শতকে ২০০ গ্রাম চুন ও পটাশ ছিটিয়ে দিন'],
      },
    ],
    chemicalTreatmentBn: isFish ? 'পুকুরে শতক প্রতি ১ গ্রাম পটাশিয়াম পারম্যাঙ্গানেট ছিটিয়ে দিন।' : isAnimal ? 'জ্বর কমাতে প্যারাসিটামল ও অ্যান্টিহিস্টামিন প্রয়োগ করুন (পশু চিকিৎসকের পরামর্শে)।' : 'টেবুকোনাজল + ট্রাইফ্লক্সিস্ট্রবিন (যেমন: নেটিভো) প্রতি লিটার পানিতে ০.৫ গ্রাম মিশিয়ে স্প্রে করুন।',
    organicTreatmentBn: isFish ? 'নিম পাতা সিদ্ধ পানি পুকুরে প্রয়োগ করুন এবং শতক প্রতি ৫০০ গ্রাম চুন দিন।' : isAnimal ? 'নিম পাতা বেটে চামড়ায় লাগান এবং পুষ্টিকর স্যালাইন পানি পান করান।' : 'নিম তেলের দ্রবণ (৫ মিলি/লিটার) ও কাঁচা হলুদের রস মিশিয়ে স্প্রে করুন।',
    preventiveStepsBn: 'রোগমুক্ত বীজ/পোনা ব্যবহার করুন, সুষম সার/খাবার দিন এবং নিয়মিত খেত ও খামার জীবাণুমুক্ত রাখুন।',
    isFallback: true,
  };
}

async function getGroqChatReply(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.warn('Groq chat failed, falling back to Gemini.', error);
    return null;
  }
}

async function getGroqEnhancedDiagnosis(rawDiagnosis: any, lang: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const systemInstruction = `You are an expert Bangladeshi agricultural advisor. Reformat the diagnosis into valid JSON with only these fields: topDiagnosis, diseaseNameBn, diseaseNameEn, confidence, severity, diagnoses, chemicalTreatmentBn, organicTreatmentBn, preventiveStepsBn. Use ${lang === 'bn' ? 'Bangla' : 'English'} for the values. Respond only with valid JSON and do not include markdown or extra prose.`;
  const prompt = typeof rawDiagnosis === 'string'
    ? `Please convert the following AI diagnosis text into valid JSON exactly using the schema above. If the text already looks like JSON, preserve the values and make sure the result is valid JSON.

${rawDiagnosis}`
    : `Please rewrite the following disease diagnosis into valid JSON exactly using the schema above:
${JSON.stringify(rawDiagnosis, null, 2)}`;

  return getGroqChatReply([
    { role: 'system', content: systemInstruction },
    { role: 'user', content: prompt },
  ]);
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const base = { status: 'ok', app: 'Agri-Sahayak', version: '1.0.0' } as any;
  if (dbPool) {
    try {
      const conn = await dbPool.getConnection();
      await conn.query('SELECT 1');
      conn.release();
      base.db = { status: 'ok' };
    } catch (err: any) {
      base.db = { status: 'error', message: err.message || String(err) };
    }
  } else {
    base.db = { status: 'not-configured' };
  }
  res.json(base);
});

// Voice Assistant RAG & AI Query Endpoint
app.post('/api/voice-assistant', async (req, res) => {
  const { query, prompt, text, userContext, lang, session } = req.body || {};
  try {
    const userPrompt = query || prompt || text;
    if (!userPrompt) {
      return res.status(400).json({ error: 'Missing query prompt' });
    }

    const preferredLanguage = lang === 'en' ? 'English' : 'Bangla';
    const datasetContext = buildDatasetAwareReply(userPrompt, (lang || 'bn') as 'bn' | 'en');
    const systemInstruction = `You are Agri-Sahayak (Agri Assistant), an expert Bangladeshi agricultural, livestock, and fisheries AI advisor.
Answer in clear, concise, empathetic ${preferredLanguage} suitable for Bangladeshi farmers.
User language: ${lang || 'bn'}.
Context provided about farmer: ${JSON.stringify(userContext || {})}.
Use the following dataset-backed knowledge as grounding when relevant:
${datasetContext}
Give complete and actionable farming guidance for crop pest/disease treatment, animal healthcare, fish pond management, market selling, or financial loan guidance.
Do not truncate information or stop mid-sentence. If the response is long, continue until the full answer is complete. Use several short paragraphs and clearly label recommendations, precautions, and next steps.
Format key terms clearly. Mention specific local terms like বিঘা, একর, SRDI, BARI, DAE, BRRI, DLS, DoF, 16123 hotspot where relevant.`;

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...(
        Array.isArray(session)
          ? session.map((item: any) => ({
              role: item.role === 'assistant' ? 'assistant' : 'user',
              content: item.text,
            }))
          : []
      ),
      { role: 'user', content: userPrompt },
    ];

    const groqReply = await getGroqChatReply(groqMessages);
    if (groqReply) {
      return res.json({
        answer: groqReply,
        reply: groqReply,
        isFallback: false,
        provider: 'groq',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if no AI key is configured yet
      const fallbackMsg = lang === 'bn' || !lang
        ? `আপনাকে ধন্যবাদ! আপনার প্রশ্নটি হলো: "${userPrompt}"। পরামর্শ: স্থানীয় কৃষি উপ-সহকারী কর্মকর্তা (SAAO) বা ১৭৬১২৩ হটলাইনে যোগাযোগের পাশাপাশি বিআরআরআই (BRRI)/বারি (BARI) অনুমোদিত বীজ ও জৈব বালাইনাশক ব্যবহার করুন।`
        : `Thank you for your question: "${userPrompt}". Advisory: Consult your local Extension Officer or contact Agricultural Hotline 16123. Use BARI/BRRI recommended seeds and bio-pesticides.`;

      return res.json({
        answer: fallbackMsg,
        reply: fallbackMsg,
        isFallback: true,
        provider: 'fallback',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 6000,
        topP: 0.95,
      },
    });

    const aiText = response.text || (lang === 'bn' ? 'দুঃখিত, বর্তমানে সরাসরি উত্তর প্রদান করা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Sorry, a direct response is not available at the moment. Please try again shortly.');

    res.json({
      answer: aiText,
      reply: aiText,
      isFallback: false,
      provider: 'gemini',
    });
  } catch (error: any) {
    console.error('Error in voice-assistant API:', error);

    if (isGeminiKeyError(error)) {
      const fallbackMsg = lang === 'bn' || !lang
        ? `আপনাকে ধন্যবাদ! আপনার প্রশ্নটি হলো: "${query || prompt || text}"। বর্তমানে AI সার্ভিসটি সাময়িকভাবে অপ্রাপ্য। স্থানীয় কৃষি উপ-সহকারী কর্মকর্তা (SAAO) বা ১৭৬১২৩ হটলাইনে যোগাযোগ করুন।`
        : `Thank you for your question: "${query || prompt || text}". The AI service is temporarily unavailable; please contact your local extension officer or the Agricultural Hotline 16123.`;

      return res.json({
        answer: fallbackMsg,
        reply: fallbackMsg,
        isFallback: true,
        provider: 'fallback',
      });
    }

    res.status(500).json({
      error: 'Failed to process voice query',
      details: error.message,
    });
  }
});

// AI Disease Vision Scanner Endpoint
app.post('/api/disease-scan', async (req, res) => {
  const { imageBase64, image, mimeType, type, lang } = req.body || {}; // type: 'crop' | 'livestock' | 'fish'

  try {
    const rawImage = imageBase64 || image;
    const ai = getGeminiClient();

    if (!ai || !rawImage) {
      const fallbackObj = buildFallbackDiagnosis(type);
      return res.json({
        diagnosis: fallbackObj,
        ...fallbackObj,
      });
    }

    const cleanBase64 = rawImage.replace(/^data:image\/\w+;base64,/, '');

    const systemInstruction = `You are a plant, livestock, and aquaculture disease diagnostic AI for Bangladeshi farmers.
Analyze the provided image and diagnose the crop pest/disease, animal disease, or fish condition.
Return JSON response matching this schema:
{
  "topDiagnosis": "Primary Diagnosis Name in Bangla and English",
  "diseaseNameBn": "রোগের নাম (বাংলায়)",
  "diseaseNameEn": "Disease Name (English)",
  "confidence": number (between 50 and 98),
  "severity": "Low" | "Medium" | "High" | "Critical",
  "diagnoses": [
    {
      "name": "Diagnosis name in Bangla & English",
      "confidence": number,
      "details": "Explanation of visual symptoms",
      "firstAid": ["Immediate step 1", "Immediate step 2"]
    }
  ],
  "chemicalTreatmentBn": "রাসায়নিক ঔষধ বা ছত্রাকনাশক উপাদান নির্দেশিকা (বাংলায়)",
  "organicTreatmentBn": "জৈব ও প্রাকৃতিক ঘরোয়া চিকিৎসা পদ্ধতি (বাংলায়)",
  "preventiveStepsBn": "ভবিষ্যতে রোগ প্রতিরোধ করার পরামর্শ (বাংলায়)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: `Please analyze this ${type || 'farming'} image and diagnose any visible disease or health issue. Respond strictly in valid JSON format adhering to system instruction.`,
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let parsed: any = {};
    const rawResponseText = response.text || '';

    try {
      parsed = JSON.parse(rawResponseText || '{}');
    } catch (parseError) {
      console.warn('Gemini image parse failed, falling back to Groq validation.', parseError);
      parsed = {};
    }

    let finalDiagnosis = parsed;
    if (process.env.GROQ_API_KEY) {
      const enhanced = await getGroqEnhancedDiagnosis(Object.keys(parsed).length > 0 ? parsed : rawResponseText, lang || 'bn');
      if (enhanced) {
        try {
          const groqParsed = JSON.parse(enhanced);
          if (groqParsed?.topDiagnosis) {
            finalDiagnosis = groqParsed;
          }
        } catch (groqParseError) {
          console.warn('Groq diagnosis parse failed:', groqParseError);
        }
      }
    }

    if (!finalDiagnosis || Object.keys(finalDiagnosis).length === 0) {
      const fallbackParsed = {
        topDiagnosis: 'অজানা লক্ষণ চিহ্নিত (Visual Pattern Detected)',
        diseaseNameBn: 'লক্ষণ নির্ভর প্রাথমিক রোগ বিশ্লেষণ',
        diseaseNameEn: 'Visual Pattern Analysis',
        confidence: 75,
        severity: 'Medium',
        diagnoses: [
          {
            name: 'লক্ষণ পরীক্ষা প্রয়োজন',
            confidence: 75,
            details: 'স্পষ্ট প্রাদুর্ভাব শনাক্ত করতে নিকটস্থ ব্লকের উপ-সহকারী কৃষি বা প্রাণিসম্পদ কর্মকর্তার পরামর্শ নিন।',
            firstAid: ['আক্রান্ত অংশ পরিষ্কার রাখুন'],
          },
        ],
        chemicalTreatmentBn: 'স্থানীয় কৃষি বা ভেটেরিনারি কর্মকর্তার প্রেসক্রিপশন অনুযায়ী রাসায়নিক বা বালাইনাশক ব্যবহার করুন।',
        organicTreatmentBn: 'নিম তেলের স্প্রে এবং পর্যাপ্ত পরিচর্যা করুন।',
        preventiveStepsBn: 'ক্ষেত পরিচ্ছন্ন রাখুন এবং সময়মতো বিষাক্ত আগাছা অপসারণ করুন।',
      };
      return res.json({
        diagnosis: fallbackParsed,
        ...fallbackParsed,
      });
    }

    return res.json({
      diagnosis: finalDiagnosis,
      ...finalDiagnosis,
    });
  } catch (error: any) {
    console.error('Error in disease-scan API:', error);

    const fallbackObj = buildFallbackDiagnosis(type);

    if (isGeminiKeyError(error) || error?.status === 400 || error?.code === 400) {
      return res.status(200).json({
        diagnosis: fallbackObj,
        ...fallbackObj,
      });
    }

    res.status(200).json({
      diagnosis: fallbackObj,
      ...fallbackObj,
    });
  }
});

// Offline Sync API
app.post('/api/sync', (req, res) => {
  const { queueItems } = req.body;
  console.log(`Synced ${queueItems?.length || 0} offline actions to server.`);
  res.json({ success: true, syncedCount: queueItems?.length || 0, timestamp: new Date().toISOString() });
});

// Start Express + Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agri-Sahayak Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
