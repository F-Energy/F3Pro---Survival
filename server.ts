import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock logistics notification store
const pushNotifications = [
  {
    id: 'notif-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    sender: 'Harper @ AZ Solar Depot',
    title: 'Solar Kit & LiFePO4 Pre-Staged',
    message: 'AZ Solar Depot satellite hub: 200W Foldable Solar Array and 512Wh LiFePO4 battery pack reserved at Drop Zone Bravo.',
    priority: 'HIGH',
    read: false,
  },
  {
    id: 'notif-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sender: 'Sat-WX-Alert',
    title: 'High-Altitude Barometric Drop Warning',
    message: 'Barometric pressure dropping 3.2 hPa/hr. Mountain ridge temperature expected to reach 18°F tonight with wind gust up to 45 mph.',
    priority: 'URGENT',
    read: false,
  }
];

// 1. AI Rationing & Survival Assistant Endpoint using Gemini API
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { prompt, scenario, inventorySummary, userStats } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        advice: `[OFFLINE FALLBACK MODE]
System Recommendation for ${scenario || '30-Day Mountain Survival'}:
1. Water Priority: Consume perishable water stores first before tapping boiled/purified snowmelt.
2. Calorie Management: Prioritize high-water-content produce/perishables in Days 1-4. Shift to freeze-dried MREs and high-density fats (peanut butter, nuts) starting Day 5.
3. Logistics Note: Contact Harper at AZ Solar Depot (+1 928-555-0199) via Aegis Satellite Dispatch for energy supply top-ups.`,
        modelUsed: 'Offline Rules Engine',
      });
    }

    const systemInstruction = `You are AEGIS-1, a elite wilderness survival logic AI and tactical logistics officer specializing in 30-day off-grid mountain expeditions and power outage rationing.
Provide direct, concise, high-impact tactical advice. Always format into clear bullet points:
- Rationing Order (What to eat/drink first and why)
- Water Conservation Strategy
- Calorie/Energy Optimization
- Immediate Tactical Action Steps.
Avoid filler prose or generic pleasantries.`;

    const userMessage = `Scenario: ${scenario || '30-Day Off-Grid Mountain Trip'}
User Profile: ${JSON.stringify(userStats || { weightKg: 75, temp: 'Cold (25°F)', exertion: 'High' })}
Inventory Context: ${JSON.stringify(inventorySummary || 'Water 15L, MRE 20 units, Canned Goods 12 units, Perishables 4 units')}
User Query: ${prompt || 'How should I ration my food and water for maximum 30-day survival efficiency?'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userMessage}` }] }
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    });

    return res.status(200).json({
      success: true,
      advice: response.text,
      modelUsed: 'gemini-2.5-flash',
    });
  } catch (err: any) {
    console.error('Gemini Advisor Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error generating survival analysis',
      advice: 'AEGIS tactical core offline. Conserve water immediately. Prioritize consuming perishable food items within 72 hours.'
    });
  }
});

// 2. Logistics Dispatch Endpoint for 'Harper' at 'AZ Solar Depot'
app.post('/api/logistics/dispatch', (req, res) => {
  const { itemCategory, itemDetails, quantity, dropCoordinates, urgency, userNotes } = req.body;

  const ticketId = `AZSD-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString();

  const newNotification = {
    id: `notif-${Date.now()}`,
    timestamp,
    sender: 'Harper @ AZ Solar Depot',
    title: `Order Received: ${quantity || 1}x ${itemCategory || 'Solar & Fuel Supply'}`,
    message: `Harper (+1 928-555-0199): Satellite dispatch signal verified for ${itemDetails || 'Solar Generator & Fuel Pack'}. Route: Drop Zone ${dropCoordinates || 'GPS Lock'}. Dispatch ETA: 45-90 mins.`,
    priority: urgency === 'EMERGENCY' ? 'URGENT' : 'HIGH',
    read: false,
  };

  pushNotifications.unshift(newNotification);

  return res.status(200).json({
    success: true,
    ticketId,
    timestamp,
    recipient: 'Harper @ AZ Solar Depot (+1 928-555-0199)',
    status: 'SATELLITE_DISPATCHED',
    estimatedETA: '45-90 Minutes via Overland/Sat-Drone',
    confirmationMessage: `Text notification transmitted to Harper at AZ Solar Depot. Dispatch ticket ${ticketId} confirmed.`
  });
});

// 3. Get Logistics Push Notifications
app.get('/api/logistics/notifications', (req, res) => {
  res.status(200).json({
    success: true,
    notifications: pushNotifications
  });
});

// 4. Weather Satellite Data Mock Endpoint
app.get('/api/weather/satellite', (req, res) => {
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    elevation: '8,450 ft',
    barometer: {
      currentHpa: 1008.4,
      trend: 'FALLING_FAST',
      diff3hr: -3.6,
      forecast: 'Storm / Cold Front Impending'
    },
    microclimate: {
      tempF: 28,
      windChillF: 16,
      windSpeedMph: 24,
      humidity: 82,
      uvIndex: 2,
      freezeRisk: 'HIGH',
      snowAccumulationEst: '4-8 inches next 12 hrs'
    }
  });
});

// Setup Vite Dev Server or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Aegis Survival - Off-Grid & Power Outage Rationing System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-black text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AEGIS Survival Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
