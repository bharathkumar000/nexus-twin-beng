# 🏛️ Supabase / PostGIS Schema Setup

Run the following SQL commands in your **Supabase SQL Editor** to initialize the Nexus Twin Digital Twin database.

## 1. Enable Core Extensions
This enables spatial functions and identity generation.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 2. Infrastructure & Assets

### 🏢 Buildings
Stores the 3D footprint and metadata for city buildings.

```sql
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  osm_id TEXT,
  name TEXT,
  height FLOAT DEFAULT 15.0,
  type TEXT DEFAULT 'building',
  status TEXT DEFAULT 'active', -- 'active' or 'demolished'
  geom GEOMETRY(Geometry, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast lookups
CREATE INDEX IF NOT EXISTS buildings_geom_idx ON buildings USING GIST(geom);
```

### 🏗️ Placed Assets
Stores custom infrastructure placed by administrators (Education, Healthcare, etc.).

```sql
CREATE TABLE IF NOT EXISTS placed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  lng FLOAT NOT NULL,
  lat FLOAT NOT NULL,
  height FLOAT,
  color INTEGER[], -- [R, G, B]
  metadata JSONB, -- Stores impacts and other asset-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a geometry column for spatial queries on custom assets
SELECT AddGeometryColumn('public', 'placed_assets', 'geom', 4326, 'POINT', 2);
UPDATE placed_assets SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326);
CREATE INDEX IF NOT EXISTS placed_assets_geom_idx ON placed_assets USING GIST(geom);
```

### ⚡ Utilities
Stores underground infrastructure like power grids, water mains, and gas lines.

```sql
CREATE TABLE IF NOT EXISTS utilities (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT, -- 'ElectricityLine', 'WaterPipe', 'SewagePipe', 'GasLine'
  diameter TEXT,
  source TEXT,
  geom GEOMETRY(Geometry, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS utilities_geom_idx ON utilities USING GIST(geom);
```

## 3. Governance & Strategy

### 📜 Policies
Stores the strategic directives analyzed by the AI Advisor.

```sql
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location TEXT,
  budget NUMERIC,
  budget_unit TEXT DEFAULT 'Cr', -- 'Cr' or 'Lakh'
  duration TEXT,
  outcome TEXT,
  pdf_url TEXT,
  ai_score INT,
  ai_report JSONB, -- Detailed breakdown and suggestions
  lng FLOAT,
  lat FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 📢 Broadcasts (Notifications)
Stores city-wide policy notifications sent to citizens.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  policy_title TEXT NOT NULL,
  price TEXT,
  location TEXT,
  purpose TEXT,
  prediction TEXT,
  duration TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Citizen Feedback

### 🚩 Public Reports & Demands
Stores citizen grievances and high-priority infrastructure requests.

```sql
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  demand TEXT NOT NULL,
  urgency TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  status TEXT DEFAULT 'Pending',
  source TEXT,
  affected_count TEXT,
  lng FLOAT,
  lat FLOAT,
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_geom_idx ON reports USING GIST(geom);
```

### 🧠 Sentiment Pulse
Stores anonymized citizen sentiment data mapped across the city.

```sql
CREATE TABLE IF NOT EXISTS sentiment_pulse (
  id SERIAL PRIMARY KEY,
  lng FLOAT NOT NULL,
  lat FLOAT NOT NULL,
  sentiment FLOAT NOT NULL, -- Ranges from -1.0 (unhappy) to 1.0 (happy)
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Helper Functions

### 🛰️ Find Nearby Assets
Directly query buildings or assets within a radius.

```sql
CREATE OR REPLACE FUNCTION get_assets_near(lng FLOAT, lat FLOAT, radius_meters FLOAT)
RETURNS TABLE (
  id UUID,
  type TEXT,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.type, 
    ST_Distance(p.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326), true) as distance
  FROM placed_assets p
  WHERE ST_DWithin(p.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326), radius_meters / 111320.0)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

---
**Setup Instruction**: Copy the blocks above and paste them into the **SQL Editor** in your Supabase dashboard. Ensure you have enabled **PostGIS** first.
