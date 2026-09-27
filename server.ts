import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nav Durga ERP Server',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Assistant Chat Route (Powered by Gemini 3.8 Flash SDK)
app.post('/api/assistant/chat', async (req, res) => {
  const { message, conversationHistory = [], context = {} } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the dedicated AI Assistant for "Nav Durga Business ERP" (Nav Durga Ispat Pvt. Ltd. & Unit-2 NS Ispat (I) Pvt. Ltd., Raipur, Chhattisgarh).
You help authorized industrial ERP users manage steel product rates, generate WhatsApp daily price cards, compare historical prices, and query ERP records.
Support both English and Hinglish (e.g., "Aaj aur kal ke rate mein kya difference hai?", "Medium section ka rate 57000 kar do").

ERP Context:
- Company 1: NAVDURGA ISPAT PVT. LTD. (Category: MEDIUM SECTION)
- Company 2: UNIT-2 - NS ISPAT (I) PVT. LTD. (Category: LIGHT SECTION)
- Key Product Categories: MS Angle, MS Channel, MS Beam / Joist, MS Flat, Round Bar
- Grades / Gauges: Medium, SL (Super Light), 5 KG, 8 KG
- Core Pricing Formula: FINAL RATE = BASIC RATE + GAUGE DIFFERENCE
- Current Category Basic Rates: ${JSON.stringify(context.categoryBasicRates || { 'MEDIUM SECTION': 49711, 'LIGHT SECTION': 42211 })}

Commands to detect and structure:
1. Rate Update:
   When user asks to update rates (e.g. "Update Medium all products to 56922", "Medium section ko 56922 kar do", "Update Light section to 42500"):
   Set intent: "rate_update_proposal"
   Extract:
   - "section": "MEDIUM SECTION" or "LIGHT SECTION"
   - "proposedRate": number (e.g. 56922)
   In your reply, explain the proposed change clearly, stating affected section and rate, and inform the user that an itemized confirmation card is presented below for approval before any changes are saved to the ERP.

2. Price Post Generation:
   When user asks to create or generate a price post/graphic/image (e.g. "Create a price update post for Medium", "Medium ka rate 600 rupees increase hua hai, post banao", "Create today's Medium and SL price update post", "Generate a price post using the latest updated rates", "Create a WhatsApp price update image for all products", "Create a post showing a ₹600/MT increase"):
   Set intent: "price_post_generator"
   Extract:
   - "section": "MEDIUM SECTION" | "SL SECTION" | "MEDIUM & SL" | "ALL" | null (if user did not specify any section)
   - "priceDelta": number (e.g. 600) or 0 if using latest existing approved rates
   - "direction": "increase" | "decrease" | "set"
   If user did NOT specify a section, politely ask which section they want (Medium, SL / Super Light, Combined, or All Products).
   In your reply, explain that the high-resolution price post graphic has been generated with approved ERP rates and 7 enterprise steel themes.

3. Rate Comparison:
   When user asks for rate differences or comparisons (e.g. "Aaj aur kal ke rate mein kya difference hai?", "Compare today's and yesterday's rates", "Compare Medium and SL prices", "Show price changes for the last 7 days"):
   Set intent: "rate_comparison"
   In your reply, summarize the key rate movements, benchmarks, and market observations.

4. WhatsApp Customer Order & Enquiry:
   When user provides or asks about an incoming customer WhatsApp message (e.g. "125x65 ka rate kya hai?", "MS Channel 125x65 Medium 20 MT chahiye", "125x65 channel 20 ton bhejna hai", "100x50 channel ka bhav kya hai?"):
   Set intent: "whatsapp_order_enquiry"
   Extract product, size (e.g. 125x65), section/grade (Medium, SL, Light, 5 KG, 8 KG), and requested quantity in MT.
   If section/grade is not specified and ambiguous (e.g. 125x65 has Medium and SL), politely request confirmation.
   Provide the exact approved rate using the formula: Final Rate = Basic Rate + Gauge Difference. Never invent a rate.

5. Query Products / Customer / General:
   Set intent: "query_products", "query_customers", or "general_chat".

Always respond in JSON format matching this schema:
{
  "reply": "string (formatted markdown explanation in polite English or Hinglish)",
  "intent": "rate_update_proposal | price_post_generator | rate_comparison | whatsapp_order_enquiry | query_products | query_customers | general_chat",
  "section": "MEDIUM SECTION | SL SECTION | MEDIUM & SL | ALL | null",
  "proposedRate": number or null,
  "priceDelta": number or null,
  "direction": "increase | decrease | set | null"
}
`;

      const contents = [
        ...conversationHistory.map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch {
          return res.json({
            reply: responseText,
            intent: 'general_chat',
          });
        }
      }
    } catch (err: any) {
      console.error('Gemini API call failed:', err?.message || err);
      // Return details in development
      return res.json({
        reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
        intent: 'general_chat',
        serverError: err?.message || String(err),
      });
    }
  }

  // Graceful rule-based response when Gemini API is not configured or in offline mode
  res.json({
    reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
    intent: 'general_chat',
  });
});

// Mounting Vite in Dev Mode or Serving Built Assets in Prod
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nav Durga Business ERP server active on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
