const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const supabase = require('./supabase');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock Auth Database
const USERS = {
  '1': { password: '1', role: 'admin', name: 'Master Admin' },
  '2': { password: '2', role: 'user', name: 'Citizen Observer' },
  admin: { password: 'admin123', role: 'admin', name: 'Command Admin' },
  user: { password: 'user123', role: 'user', name: 'Citizen Observer' }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];

  if (user && user.password === password) {
    res.json({ 
      success: true, 
      token: `mock-jwt-${user.role}`, 
      user: { name: user.name, role: user.role } 
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Mock data for utilities (Electricity, Water, Gas)
// Usually this would come from PostGIS
const utilities = {
  electricityLines: [
    // Mock GeoJSON-like structure
  ],
  waterPipes: [],
  gasLines: []
};

// Impact Analysis Endpoint using PostGIS
app.post('/api/analyze-impact', async (req, res) => {
  const { demolishedBuilding } = req.body;
  
  if (!demolishedBuilding) {
    return res.status(400).json({ error: 'No building data provided' });
  }

  const results = {
    utilitiesCut: ['Power Grid Alpha', 'Water Main 4B'],
    impactedHouseholds: Math.floor(Math.random() * 200) + 50,
    trafficDelayMinutes: Math.floor(Math.random() * 15) + 5,
    suggestedReroute: "Reroute via nearest arterial road detected in PostGIS fallback"
  };

  try {
    if (db && db.query) {
      const buildingGeom = JSON.stringify(demolishedBuilding.geometry || demolishedBuilding);
      const intersectsQuery = `SELECT type, name FROM utilities WHERE ST_Intersects(geom, ST_GeomFromGeoJSON($1))`;
      const intersectsResult = await db.query(intersectsQuery, [buildingGeom]);
      if (intersectsResult.rows.length) results.utilitiesCut = intersectsResult.rows.map(r => `${r.type} (${r.name || 'Unnamed'})`);
      
      const householdsQuery = `SELECT COUNT(*) as count FROM buildings WHERE ST_DWithin(geom, ST_GeomFromGeoJSON($1), 0.001)`;
      const householdsResult = await db.query(householdsQuery, [buildingGeom]);
      results.impactedHouseholds = parseInt(householdsResult.rows[0].count);
    }
  } catch (err) {
    console.warn("Database unavailable, using simulated spatial metrics.");
  }

  res.json(results);
});

// New Complex Spatial Query Endpoint
app.get('/api/proximity-search', async (req, res) => {
  const { lng, lat, radius = 500 } = req.query;
  
  if (!lng || !lat) {
    return res.status(400).json({ error: 'Coordinates required' });
  }

  try {
    const point = `POINT(${lng} ${lat})`;
    const radiusInDegrees = radius / 111000; // Rough conversion for degrees

    const query = `
      SELECT name, height, type, ST_AsGeoJSON(geom) as geometry
      FROM buildings 
      WHERE ST_DWithin(geom, ST_GeomFromText($1, 4326), $2)
      LIMIT 100
    `;
    
    const result = await db.query(query, [point, radiusInDegrees]);
    res.json({
      count: result.rowCount,
      features: result.rows.map(r => ({
        type: 'Feature',
        properties: { name: r.name, height: r.height, type: r.type },
        geometry: JSON.parse(r.geometry)
      }))
    });
  } catch (err) {
    console.error("Proximity Search Error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// PORT REDIRECT: Ensure users go to the Next.js unified portal (9000) instead of the raw API port (3001)
app.get('/', (req, res) => {
  res.send(`
    <div style="background: #050505; color: #ffcc00; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center;">
      <h1 style="letter-spacing: 5px;">Nexus Twin COMMAND</h1>
      <p style="color: #fff; margin: 20px 0;">The Command Core is running on Port 3001 (API), but the UI is unified on Port 9000.</p>
      <a href="http://localhost:9000" style="background: #ffcc00; color: #000; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: 800; letter-spacing: 2px;">INITIALIZE HUB PORTAL (PORT 9000)</a>
    </div>
  `);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.redirect('http://localhost:9000' + req.path);
});

// Policy Advisor (P.I.S.E. GPT) Endpoint with OLLAMA Integration
app.post('/api/policy-advisor', async (req, res) => {
  const { query } = req.body;
  
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    // Attempt to call local Ollama API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma',
        prompt: `You are the "Nexus Twin Strategic Advisor" (NEXUS_OS), a high-fidelity AI specialized ONLY in urban planning, infrastructure, and fiscal policy for the Bengaluru Digital Twin project.
        
        STRICT OPERATIONAL RULES:
        1. SCOPE: ONLY answer questions related to city management, urban planning, Bengaluru infrastructure (Metro, Water, Traffic), utilities, or policy simulation.
        2. RESTRICTION: If the user asks anything unrelated (jokes, recipes, general knowledge, or personal questions), you MUST politely refuse using the standard protocol.
        3. STANDARD REFUSAL: "I am authorized only to provide strategic counsel regarding the Nexus Twin urban infrastructure. Please submit a project-relevant query."
        4. TONE: Data-driven, tactical, professional, and concise. Use Markdown for formatting.
        
        CURRENT_QUERY: "${query}"
        
        If project-relevant, provide a professional strategy report with these sections:
        ### 📊 STRATEGIC OVERVIEW
        ### 💰 FISCAL IMPACT ANALYSIS
        ### 👥 SOCIAL & CITIZEN METRICS
        ### ✅ OPERATIONAL VERDICT`,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      return res.json({ report: data.response });
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("Ollama request timed out. Using fallback.");
    } else {
      console.warn("Ollama not detected on localhost:11434. Falling back to mock simulation.");
    }
  }

  // Simulation logic for LLM Analysis (Fallback)
  const q = query.toLowerCase();
  let analysis = "";

  if (q.includes('flyover') || q.includes('bridge')) {
    analysis = `
### 🏗️ PROJECT: URBAN FLYOVER INITIATIVE (FALLBACK)
**Location Identified**: JLB Road / Major Arterial Intersection

#### 💰 FISCAL METRICS
- **Projected Cost**: ₹145 Crores (Phase 1)
- **Economic ROI**: 12.4% (Projected via reduced transit latency)
- **Maintenance Load**: High (Structural monitoring required every 24 months)

#### 👥 SOCIAL IMPACT
- **Commuter Sentiment**: 🟢 Highly Positive (Reduced peak hour congestion by 34%)
- **Local Business Impact**: 🔴 Negative (Reduction in street-level footfall for small retailers)
- **Aesthetic Score**: 🟡 Neutral (Heritage skyline obstruction potential near Palace District)

#### ⚠️ RISK ASSESSMENT
- **Black Swan Risk**: Utility displacement during construction could trigger city-wide grid instability for 48 hours.
- **Recommendation**: Proceed with **Phase 1 Sub-surface cabling** before structural piling.
    `;
  } else {
    analysis = `
### 🧠 GENERAL POLICY ANALYSIS (FALLBACK)
**Query**: "${query}"

#### 📊 INITIAL HEURISTICS
- **Complexity Level**: Moderate
- **Status**: Ollama Engine [gemma] Offline.

#### 🔍 ADVISORY NOTE
The SYNTH-GOV engine requires the local Ollama service to be active for high-fidelity analysis. Please ensure "ollama run gemma" is available on this machine.
    `;
  }

  setTimeout(() => {
    res.json({ report: analysis });
  }, 1000);
});

// NEW: Document Parsing Endpoint for Strategic Policy Hub
app.post('/api/parse-policy-document', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  console.log(`[PISE_ADVISOR] Processing Policy Document: ${req.file.originalname}`);

  try {
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    // Call Ollama with strict JSON format instructions
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma',
        prompt: `You are the Nexus Twin Document Parser. 
        Extract the following tactical details from the urban policy text below.
        
        Return ONLY a JSON object with these keys:
        - title: The official name of the policy or infrastructure project.
        - budget: The projected cost (e.g. ₹120 Crores).
        - duration: The estimated timeline (e.g. 18 Months).
        - location: The target ward or area if mentioned.
        - outcome: A 1-sentence summary of the expected benefit.

        If a field is missing, use "N/A".
        
        TEXT:
        "${text.substring(0, 4000)}"`,
        stream: false,
        format: 'json'
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      try {
        const extracted = JSON.parse(data.response);
        return res.json(extracted);
      } catch (parseErr) {
        console.error("Failed to parse Ollama JSON response:", data.response);
      }
    }
    
    // Fallback Mock Extraction if Ollama is offline or fails
    console.warn("Ollama extraction failed. Using heuristic fallback.");
    res.json({ 
      title: 'Infrastructure Modernization Initiative', 
      budget: '₹120 Crores', 
      duration: '18 Months', 
      location: 'Bengaluru Central',
      outcome: 'Enhancement of urban mobility and utility resilience.' 
    });
  } catch (err) {
    console.error('PDF Parse Error:', err);
    res.status(500).json({ error: 'Internal Server Error during document analysis' });
  }
});

// AI Suggest Engine (Advanced Urban Directives)
app.post('/api/ai-suggest', async (req, res) => {
  const { priority, assets } = req.body;
  
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:e4b',
        prompt: `You are the "Nexus Twin Strategic AI". 
        Current Priority: ${priority.toUpperCase()}
        Current City Assets: ${JSON.stringify(assets)}
        
        Provide ONE short, highly tactical urban planning suggestion (max 20 words) to optimize the city according to the priority.
        Format: Return only the text of the suggestion.`,
        stream: false
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      return res.json({ suggestion: data.response });
    }
  } catch (err) {
    console.warn("Ollama suggest fallback.");
  }

  const fallbacks = ["Optimize traffic flow at MG Road junction.", "Increase solar density in residential zones.", "Deploy emergency units to high-risk flood areas."];
  res.json({ suggestion: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
});

// Predictive Failure Analysis Endpoint
app.post('/api/predict-failures', (req, res) => {
  const { stormIntensity } = req.body;
  
  if (stormIntensity === undefined) return res.status(400).json({ error: 'No storm intensity provided' });

  // Simulation: Predict failure points based on intensity
  // Higher intensity = more failures, concentrated in "high-elevation" or "vulnerable" areas
  const failurePoints = [];
  const numPoints = Math.floor(stormIntensity * 5) + 5;

  for (let i = 0; i < numPoints; i++) {
    // Generate points around Vidhana Soudha, Bengaluru area with slight bias
    failurePoints.push({
      id: i,
      coordinates: [
        77.58 + Math.random() * 0.03,
        12.96 + Math.random() * 0.03
      ],
      riskLevel: Math.random() * stormIntensity / 10,
      reason: Math.random() > 0.5 ? 'Structural Stress' : 'Electrical Surge'
    });
  }

  const analysis = {
    points: failurePoints,
    summary: {
      totalPredictedOutages: failurePoints.length,
      estimatedRestorationTime: `${Math.floor(stormIntensity * 2)} hours`,
      criticalZone: "Central Business District"
    }
  };

  res.json(analysis);
});

// Sentiment Analysis (X/News Data) Endpoint
app.post('/api/sentiment', (req, res) => {
  const sentimentPoints = [];
  const numPoints = 150;

  for (let i = 0; i < numPoints; i++) {
    const sentiment = Math.random() * 2 - 1; 
    sentimentPoints.push({
      id: i,
      coordinates: [
        77.55 + Math.random() * 0.1,
        12.92 + Math.random() * 0.1
      ],
      sentiment: sentiment,
      intensity: Math.random()
    });
  }

  const mockFeed = [
    { id: 1, user: "@namma_bengaluru", content: "Traffic at Silk Board is insane today! Need better flyover planning.", type: 'complaint', ward: 'BTM Layout' },
    { id: 2, user: "@green_blr", content: "Love the new bio-reserve in Cubbon Park. The air feels fresher already.", type: 'praise', ward: 'Shivajinagar' },
    { id: 3, user: "@techie_prakash", content: "Water shortage in Whitefield is getting critical. Any updates from the Command Center?", type: 'urgent', ward: 'Whitefield' },
    { id: 4, user: "@citizen_voice", content: "Why are the street lights off on MG Road? Feels unsafe.", type: 'complaint', ward: 'Shanthala Nagar' }
  ];

  res.json({ points: sentimentPoints, feed: mockFeed });
});

// Real-time Notification System
let notifications = [
  {
    id: 1,
    policy: "ROAD_BLOCK_ALERT: MG Road Construction",
    price: "N/A",
    location: "MG Road - Brigade Road Junction",
    purpose: "Total road block for Metro Phase 3 Pillar installation. Please use Trinity Circle reroute.",
    prediction: "TRAFFIC_DELAY: 45 Mins",
    duration: "TODAY (09:00 - 21:00)",
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    policy: "INAUGURATION: Nexus Healthcare Centre",
    price: "₹120 Crores",
    location: "Koramangala 4th Block",
    purpose: "State-of-the-art diagnostic facility opening for all citizens. 24/7 Trauma care integrated.",
    prediction: "LIFESPAN_IMPACT: +2.5 Yrs",
    duration: "OPENING_TODAY",
    timestamp: new Date().toISOString()
  },
  {
    id: 3,
    policy: "Monsoon Resilience Phase 1",
    price: "₹85 Crores",
    location: "NMIT Sector / North Bengaluru",
    purpose: "Stormwater drainage overhaul to prevent campus-wide inundation.",
    prediction: "85% reduction in flood risk for the 2024 monsoon season.",
    duration: "6 Months",
    timestamp: new Date().toISOString()
  }
];

app.get('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (!error && data && data.length > 0) {
      return res.json(data);
    }
  } catch (err) {
    console.warn("Supabase fetch failed, using local memory.");
  }
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const { policy, price, location, purpose, prediction, duration } = req.body;
  if (!policy || !price || !location) {
    return res.status(400).json({ error: 'Policy, Price, and Location are required' });
  }

  const newNotification = {
    id: Math.floor(Math.random() * 1000000), // Random ID for local
    policy_title: policy, // Mapping to Supabase schema 'policy_title'
    price,
    location,
    purpose,
    prediction,
    duration,
    timestamp: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('notifications').insert([newNotification]);
    if (error) console.error("Supabase Insert Error:", error.message);
  } catch (err) {
    console.warn("Supabase insert failed, storing in memory only.");
  }
  
  notifications.unshift(newNotification);
  if (notifications.length > 20) notifications = notifications.slice(0, 20);
  
  res.json({ success: true, notification: newNotification });
});

// Citizen Complaint System
let complaints = [];

app.post('/api/complaints', upload.single('photo'), async (req, res) => {
  const { type, description, location, lngLat } = req.body;
  const coords = lngLat ? JSON.parse(lngLat) : { lng: 77.59, lat: 12.97 };
  
  const newComplaint = {
    id: Date.now(),
    demand: type,
    urgency: 'MEDIUM',
    status: 'pending',
    source: location || 'Bengaluru',
    lng: coords.lng,
    lat: coords.lat,
    affected_count: '1-10',
    timestamp: new Date().toISOString(),
    upvotes: 1
  };

  try {
    const { data, error } = await supabase.from('reports').insert([{
      demand: newComplaint.demand,
      urgency: newComplaint.urgency,
      status: newComplaint.status,
      source: newComplaint.source,
      lng: newComplaint.lng,
      lat: newComplaint.lat,
      affected_count: newComplaint.affected_count,
      upvotes: 1
    }]).select();
    if (error) throw error;

    // Create a notification for the admin in Supabase
    await supabase.from('notifications').insert([{
      policy_title: `NEW COMPLAINT: ${type}`,
      price: 'N/A',
      location: location || 'Unknown',
      purpose: description || 'Citizen reported issue.',
      prediction: 'Awaiting admin review',
      duration: 'URGENT'
    }]);

    newComplaint.id = data[0].id;
    complaints.unshift(newComplaint);
    res.json({ success: true, complaint: data[0] });
  } catch (err) {
    console.warn("Supabase Complaint Error, using fallback:", err.message);
    complaints.unshift(newComplaint);
    res.json({ success: true, complaint: newComplaint });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').order('upvotes', { ascending: false });
    if (error) throw error;
    res.json(data.map(d => ({
      id: d.id,
      type: d.demand,
      location: d.source,
      status: d.status,
      lngLat: { lng: d.lng, lat: d.lat },
      timestamp: d.created_at,
      upvotes: d.upvotes || 1
    })));
  } catch (err) {
    // Fallback to memory
    res.json(complaints.map(c => ({
      id: c.id,
      type: c.demand,
      location: c.source,
      status: c.status,
      lngLat: { lng: c.lng, lat: c.lat },
      timestamp: c.timestamp,
      upvotes: c.upvotes || 1
    })).sort((a, b) => b.upvotes - a.upvotes));
  }
});

app.post('/api/complaints/:id/resolve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: complaint, error: fetchErr } = await supabase.from('reports').select('*').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    
    // Notify users that a problem was resolved
    await supabase.from('notifications').insert([{
      policy_title: `RESOLVED: ${complaint.demand}`,
      price: 'N/A',
      location: complaint.source,
      purpose: `The reported issue has been successfully addressed by the Nexus Twin Command.`,
      prediction: 'VITALITY_GAIN: +5%',
      duration: 'COMPLETED'
    }]);
    
    res.json({ success: true });
  } catch (err) {
    console.warn("Resolve Error (Supabase), trying memory fallback:", err.message);
    
    // In-memory fallback
    const idx = complaints.findIndex(c => c.id == id);
    if (idx !== -1) {
      complaints[idx].status = 'resolved';
      
      const notif = {
        id: Date.now(),
        policy: `RESOLVED: ${complaints[idx].demand}`,
        price: 'N/A',
        location: complaints[idx].source,
        purpose: `The reported issue has been successfully addressed by the Nexus Twin Command.`,
        prediction: 'VITALITY_GAIN: +5%',
        duration: 'COMPLETED',
        timestamp: new Date().toISOString()
      };
      notifications.unshift(notif);
      
      return res.json({ success: true });
    }
    
    res.status(404).json({ error: 'Complaint not found' });
  }
});

app.post('/api/complaints/:id/upvote', async (req, res) => {
  const { id } = req.params;
  try {
    // Try Supabase first
    const { data: complaint, error: fetchErr } = await supabase.from('reports').select('upvotes').eq('id', id).single();
    if (fetchErr) throw fetchErr;
    
    const newVotes = (complaint.upvotes || 1) + 1;
    await supabase.from('reports').update({ upvotes: newVotes }).eq('id', id);
    
    // Sync fallback array if possible
    const idx = complaints.findIndex(c => c.id == id);
    if (idx !== -1) complaints[idx].upvotes = newVotes;

    res.json({ success: true, upvotes: newVotes });
  } catch (err) {
    console.warn("Upvote Error (Supabase), trying memory fallback:", err.message);
    const idx = complaints.findIndex(c => c.id == id);
    if (idx !== -1) {
      complaints[idx].upvotes = (complaints[idx].upvotes || 1) + 1;
      return res.json({ success: true, upvotes: complaints[idx].upvotes });
    }
    res.status(404).json({ error: 'Complaint not found' });
  }
});

// Catch-all for missing API routes to help debug 404s
app.use('/api', (req, res) => {
  console.warn(`[404_DETECTION] Missing API Endpoint: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found on Command Core.` });
});

app.listen(port, () => {
  console.log(`\n🚀 COMMAND CORE ONLINE`);
  console.log(`🔗 API SERVER: http://localhost:${port}`);
  console.log(`🖥️  UNIFIED UI: http://localhost:9000 (USE THIS LINK)\n`);
});
