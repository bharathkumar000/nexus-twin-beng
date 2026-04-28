# 🏙️ Bengaluru 3D Digital Twin: Integrated Command Center v4.0

![Banner](./assets/banner.png)

## 📡 PROJECT OVERVIEW
**Bengaluru 3D Digital Twin** is a high-fidelity, interactive urban planning and management platform designed for the **Silicon Valley of India: Bengaluru**. This integrated command center synthesizes real-world geospatial data, 3D architectural footprints, and critical utility infrastructure into a single, immersive browser-based interface.

Built for urban planners, emergency responders, and policy makers, it provides deep insights into the city's infrastructure resilience, environmental health, and citizen sentiment.

---

## 🚀 CORE CAPABILITIES

### 🏆 1. MISSION CONTROL (Zoning & Urban Planning)
*   **3D Building HUD**: Interactive extruded building footprints with precise height and architectural metadata.
*   **🏗️ Demolish Mode**: A revolutionary "What If" tool for urban developers. Simulate the removal of any building and instantly analyze the impact on surrounding utility services, traffic flow, and household connectivity.
*   **📊 Triple Win Scorecard**: Real-time tracking of **Fiscal**, **Social**, and **Environmental** metrics that react dynamically to every urban intervention.
*   **🌿 Sustainability Analytics**: Deep-dive into building-level **Solar ROI** and **Carbon Footprint** calculations to drive green policy.
*   **📍 Precision Search**: Seamlessly fly to any landmark (e.g., Palace, Devaraja Market) using the integrated OpenStreetMap engine.

### 🎭 2. CITIZEN PULSE (Sentiment Analysis)
*   **🎭 Sentiment Heatmaps**: Ingest simulated X (Twitter) and news data to visualize the real-time "Mood" of the city.
*   **Mood Visualization**: A glowing heatmap layer where **Red** indicates infrastructure complaints and **Green** indicates high satisfaction.
*   **Ward-Level Insights**: Analyze which sectors of the city require immediate attention based on social data.

### 🌊 3. CRISIS SIMULATOR (Emergency Response)
*   **🌊 Flood Visualizer**: Simulate severe flooding scenarios (0-15m). Watch in real-time as the 3D city color-codes buildings based on inundation depth.
*   **🚑 Disaster Routing**: Dynamically plot and visualize optimal emergency paths through the city grid during crisis states.
*   **🔥 Fire Ready**: Instantaneous mapping of fire hydrants across the urban fabric for rapid response.

### 🧠 4. SYNT-GOV ADVISOR (AI Policy Support)
*   **🤖 P.I.S.E. GPT**: An integrated AI Policy Impact & Social Economic advisor.
*   **Policy Audits**: Ask the advisor about the fiscal and social impact of new projects (e.g., "Impact of a new flyover at JLB Road").
*   **Predictive Failure**: Use the **Storm Severity Index** to predict where electrical grids or structural points might fail during severe weather.

### 🏺 5. CHRONO-SPRAWL (Heritage Timeline)
*   **⏳ Time Slider (1920 - 2024)**: Travel through time. Observe the urban sprawl and boundaries of old Bengaluru (Bangalore) with custom sepia-filtered historical map overlays.
*   **🏰 Landmark Dossier**: Deep-dive into heritage sites with embedded architectural documentation.

---

## 🛠️ TECHNICAL ARCHITECTURE

The platform is built on a **High-Performance Geospatial Stack**:

*   **Frontend**: React.js + Vite for ultra-fast performance.
*   **Mapping Engine**: MapLibre GL & Deck.gl for 60fps 3D rendering of complex GeoJSON datasets.
*   **Animations**: Framer Motion for a premium, HUD-style user experience.
*   **Backend**: Express.js/Node.js powering the Impact Analysis and Sentiment Heuristic Engines.
*   **Data Structure**: GeoJSON-based layers for Buildings, Utilities, and AQI metrics.

---

## ⚙️ INSTALLATION & RUNNING

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 1. Project Initialization
Cloning the repository and installing dependencies:
```bash
# Install all dependencies (Client & Server)
npm run install:all
```

### 2. Launch Development Environment
Run the unified command to boot the entire ecosystem:
```bash
npm run dev
```
*   **🏙️ Command Center**: [http://localhost:5173](http://localhost:5173)
*   **📡 Analysis Service**: [http://localhost:3001/api](http://localhost:3001/api)

---

## 📂 PROJECT STRUCTURE
```bash
├── client/          # Vite + React 3D Interface
│   ├── src/        # HUD Components, Deck.gl Layers (App.jsx)
│   └── public/     # Static GIS Assets (Buildings, Utilities)
├── server/          # Node.js Express API
│   └── index.js    # Simulation, Sentiment & Impact Analysis Endpoints
├── data/            # GeoJSON datasets for Bengaluru
└── assets/          # Project visual identity & branding
```

---

## 👤 AUTHOR
**Bharath Kumara**
*   *Digital Twin Engineering & GIS Integration*

---

> *"The future of urban governance is not in papers, but in pixels."* - **SYNT-GOV Command Shell v4.0**
