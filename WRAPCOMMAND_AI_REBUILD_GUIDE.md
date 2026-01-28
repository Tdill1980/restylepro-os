# WrapCommand AI - Complete Rebuild Guide
## Full SaaS Platform for Vehicle Wrap Visualization

---

## Executive Summary

This document provides the complete technical blueprint to rebuild WrapCloser Tools as **WrapCommand AI** - a full-featured SaaS platform for vehicle wrap visualization. This guide includes:

- Complete technology stack
- Exact database schema with SQL
- Full codebase for all 5 tools (InkFusion, DesignPanelPro, FadeWraps, WBTY, ApproveMode)
- Edge function code with AI prompts
- UI/UX implementation details
- Deployment instructions
- SaaS conversion strategy

**Time to Build**: 4-6 weeks with 2-3 developers
**Tech Stack**: React + TypeScript + Supabase + Lovable AI Gateway
**Complexity**: Intermediate to Advanced

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Database Schema (Complete SQL)](#3-database-schema)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Backend Implementation (Edge Functions)](#5-backend-implementation)
6. [Tool-by-Tool Code](#6-tool-by-tool-code)
7. [UI/UX Specifications](#7-uiux-specifications)
8. [Deployment Guide](#8-deployment-guide)
9. [SaaS Conversion](#9-saas-conversion)
10. [Cost Analysis](#10-cost-analysis)

---

## 1. Technology Stack

### 1.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | Latest | Build tool (fast HMR) |
| React Router | 6.30.1 | Client routing |
| TanStack Query | 5.83.0 | Server state |
| Tailwind CSS | Latest | Styling |
| Radix UI | Latest | Headless components |
| Shadcn/ui | Latest | Pre-built components |
| Lucide React | 0.462.0 | Icons |
| React Hook Form | 7.61.1 | Forms |
| Zod | 3.25.76 | Validation |
| Sonner | 1.7.4 | Toasts |

### 1.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.81.1 | BaaS platform |
| PostgreSQL | 13+ | Database |
| Deno | Latest | Edge runtime |
| Lovable AI | Latest | Image generation |

### 1.3 AI Models

- **Image Generation**: `google/gemini-2.5-flash-image-preview`
- **Text Analysis**: `google/gemini-2.5-flash`
- **API Gateway**: Lovable AI Gateway (https://ai.gateway.lovable.dev)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│               React Frontend (Vite)                      │
│  ┌────────────┬────────────┬────────────┬────────────┐ │
│  │ InkFusion  │DesignPanel │ FadeWraps  │    WBTY    │ │
│  │    Tool    │  Pro Tool  │    Tool    │    Tool    │ │
│  └────────────┴────────────┴────────────┴────────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │           ApproveMode Tool                        │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────┘
               │ Supabase Client (REST/GraphQL)
               ▼
┌─────────────────────────────────────────────────────────┐
│          Supabase Backend (PostgreSQL + Deno)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Database Tables (19 tables)                      │  │
│  │ • inkfusion_swatches                             │  │
│  │ • wbty_products                                   │  │
│  │ • fadewraps_patterns                             │  │
│  │ • designpanelpro_patterns                        │  │
│  │ • color_visualizations (renders)                 │  │
│  │ • 5 carousel tables                              │  │
│  │ • user_roles, subscriptions                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Edge Functions                                    │  │
│  │ • generate-color-render (main AI)                │  │
│  │ • analyze-vinyl-swatch                           │  │
│  │ • analyze-panel-design                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Storage Buckets (public)                         │  │
│  │ • renders, swatches, patterns, carousel-images   │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS API Call
               ▼
┌─────────────────────────────────────────────────────────┐
│          Lovable AI Gateway                              │
│  • google/gemini-2.5-flash-image-preview                │
│  • Rate limiting, usage tracking                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow: Generate Render

```
1. User selects pattern/color + vehicle details
   ▼
2. Frontend validates input
   ▼
3. Call Supabase Edge Function (generate-color-render)
   ▼
4. Edge Function fetches pattern image (if applicable)
   ▼
5. Edge Function builds AI prompt based on tool type
   ▼
6. Call Lovable AI Gateway with prompt + image
   ▼
7. AI generates 16:9 landscape image (base64)
   ▼
8. Edge Function returns base64 to frontend
   ▼
9. Frontend displays image + option to download
   ▼
10. Frontend saves to Supabase Storage + carousel table
```

---

## 3. Database Schema

### 3.1 Core Product Tables

#### InkFusion Swatches
```sql
CREATE TABLE inkfusion_swatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex TEXT, -- Color hex code
  finish TEXT, -- 'gloss', 'satin', 'matte'
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE inkfusion_swatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON inkfusion_swatches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON inkfusion_swatches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

#### WBTY Products
```sql
CREATE TABLE wbty_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- 'Metal & Marble', 'Wicked & Wild', etc.
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  price NUMERIC DEFAULT 95.50,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wbty_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON wbty_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full" ON wbty_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### FadeWraps Patterns
```sql
CREATE TABLE fadewraps_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  media_url TEXT NOT NULL, -- Gradient swatch image
  media_type TEXT NOT NULL DEFAULT 'image',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fadewraps_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON fadewraps_patterns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full" ON fadewraps_patterns FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

#### DesignPanelPro Patterns
```sql
CREATE TABLE designpanelpro_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ai_generated_name TEXT, -- AI-created marketing name
  category TEXT DEFAULT 'Curated',
  media_url TEXT NOT NULL, -- Full public URL for AI
  clean_display_url TEXT, -- Cropped for UI (no dimensions text)
  thumbnail_url TEXT,
  is_curated BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE designpanelpro_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON designpanelpro_patterns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full" ON designpanelpro_patterns FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

#### ApproveMode Examples
```sql
CREATE TABLE approvemode_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE approvemode_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON approvemode_examples
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full" ON approvemode_examples FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

### 3.2 Render Storage Table

```sql
CREATE TABLE color_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_type TEXT,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  finish_type TEXT NOT NULL, -- 'gloss', 'satin', 'matte'
  mode_type TEXT, -- 'inkfusion', 'wbty', 'fadewraps', 'designpanelpro'
  infusion_color_id TEXT,
  render_urls JSONB DEFAULT '{}', -- {hero: url, side: url, rear: url, top: url}
  custom_swatch_url TEXT,
  custom_design_url TEXT,
  uses_custom_design BOOLEAN DEFAULT false,
  has_metallic_flakes BOOLEAN DEFAULT false,
  generation_status TEXT DEFAULT 'processing',
  is_saved BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  organization_id UUID,
  admin_notes TEXT,
  emailed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE color_visualizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create" ON color_visualizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update" ON color_visualizations
  FOR UPDATE USING (true);

CREATE POLICY "Public read" ON color_visualizations
  FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_color_visualizations_updated_at
  BEFORE UPDATE ON color_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 Carousel Tables

Each product has a carousel table for hero sections:

```sql
-- InkFusion Carousel
CREATE TABLE inkfusion_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  color_name TEXT,
  vehicle_name TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inkfusion_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON inkfusion_carousel
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full" ON inkfusion_carousel FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Repeat for:
-- wbty_carousel
-- fadewraps_carousel
-- designpanelpro_carousel
-- approvemode_carousel
-- hero_carousel (homepage)
```

### 3.4 User Management

```sql
-- User Roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage" ON user_roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Helper function
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### 3.5 Storage Buckets

Create these public buckets:

```sql
-- Via Supabase Dashboard or SQL
INSERT INTO storage.buckets (id, name, public) VALUES
  ('renders', 'renders', true),
  ('swatches', 'swatches', true),
  ('patterns', 'patterns', true),
  ('carousel-images', 'carousel-images', true),
  ('hero-videos', 'hero-videos', true),
  ('products', 'products', true),
  ('before-after', 'before-after', true),
  ('vehicle-renders', 'vehicle-renders', true),
  ('wrap-files', 'wrap-files', true),
  ('inkfusion-renders', 'inkfusion-renders', true);
```

---

## 4. Frontend Implementation

### 4.1 Project Structure

```
src/
├── App.tsx                    # Main app + routes
├── main.tsx                   # Entry point
├── index.css                  # Design tokens
│
├── components/
│   ├── ui/                    # 40+ shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   │
│   ├── wrapcloser/
│   │   ├── WrapCloserLite.tsx # Main unified tool
│   │   └── modes/
│   │       ├── InkFusionMode.tsx
│   │       ├── FadeWrapsMode.tsx
│   │       ├── SwatchMode.tsx (WBTY)
│   │       ├── ApproveModeComponent.tsx
│   │       └── FadeWrapMode.tsx
│   │
│   ├── productTools/
│   │   ├── FadeWrapToolUI.tsx
│   │   ├── InkFusionToolUI.tsx
│   │   └── WBTYToolUI.tsx
│   │
│   ├── designpanelpro/
│   │   ├── DesignPanelProToolUI.tsx
│   │   ├── PanelLibrary.tsx
│   │   └── PanelUploader.tsx
│   │
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroRenderer.tsx
│   ├── PaywallModal.tsx
│   └── RenderQualityRating.tsx
│
├── hooks/
│   ├── useInkFusionLogic.ts
│   ├── useFadeWrapLogic.ts
│   ├── useWBTYLogic.ts
│   ├── useDesignPanelProLogic.ts
│   ├── useGenerationLimit.ts
│   └── useRenderPolling.ts
│
├── pages/
│   ├── Index.tsx              # Homepage
│   ├── InkFusion.tsx
│   ├── FadeWraps.tsx
│   ├── WBTY.tsx
│   ├── DesignPanelPro.tsx
│   ├── ApproveMode.tsx
│   ├── WrapCloserLite.tsx
│   ├── Gallery.tsx
│   ├── UserGuide.tsx
│   ├── AdminDashboard.tsx
│   └── Admin*.tsx             # Admin pages
│
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client
│       └── types.ts           # Auto-generated
│
└── lib/
    ├── utils.ts               # cn() utility
    ├── color-extractor.ts
    └── panel-processor.ts
```

### 4.2 Design System (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background & Foreground */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* Primary Brand Colors */
    --primary: 280 100% 50%; /* Magenta */
    --primary-foreground: 210 40% 98%;
    
    /* Secondary Colors */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    /* Muted */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    /* Accent */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    /* Borders & Inputs */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 280 100% 50%;
    
    /* Cards */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    /* Gradients */
    --gradient-primary: linear-gradient(
      135deg,
      hsl(280 100% 50%),
      hsl(260 100% 60%)
    );
    
    /* Shadows */
    --shadow-elegant: 0 10px 30px -10px hsl(280 100% 50% / 0.3);
    --shadow-glow: 0 0 40px hsl(280 100% 50% / 0.2);
    
    /* Radius */
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 280 100% 60%;
    --border: 217.2 32.6% 17.5%;
    /* ... dark mode tokens */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 4.3 Routing (App.tsx)

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InkFusion from "./pages/InkFusion";
import FadeWraps from "./pages/FadeWraps";
import WBTY from "./pages/WBTY";
import DesignPanelPro from "./pages/DesignPanelPro";
import ApproveMode from "./pages/ApproveMode";
import WrapCloserLite from "./pages/WrapCloserLite";
import Gallery from "./pages/Gallery";
import UserGuide from "./pages/UserGuide";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inkfusion" element={<InkFusion />} />
        <Route path="/fadewraps" element={<FadeWraps />} />
        <Route path="/wbty" element={<WBTY />} />
        <Route path="/designpanelpro" element={<DesignPanelPro />} />
        <Route path="/approvemode" element={<ApproveMode />} />
        <Route path="/wrapcloser" element={<WrapCloserLite />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 5. Backend Implementation

### 5.1 Edge Function: generate-color-render

**File**: `supabase/functions/generate-color-render/index.ts`

This is the CORE AI function that powers all tools.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      vehicle, year, make, model,
      colorHex, colorName, finish,
      viewType, modeType,
      patternUrl,
      patternScale, // WBTY
      gradientScale, gradientDirection, // FadeWraps
      kitSize, addHood, addFrontBumper, addRearBumper, roofSize
    } = await req.json();

    console.log(`Generating ${modeType} render:`, { vehicle, colorName, finish, viewType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch pattern image if needed
    let patternImageBase64: string | null = null;
    if (patternUrl && (modeType === 'wbty' || modeType === 'fadewraps' || modeType === 'designpanelpro')) {
      try {
        const patternResponse = await fetch(patternUrl);
        if (!patternResponse.ok) {
          throw new Error(`Failed to load pattern image: ${patternResponse.statusText}`);
        }
        const patternBlob = await patternResponse.blob();
        const patternBuffer = await patternBlob.arrayBuffer();
        patternImageBase64 = btoa(String.fromCharCode(...new Uint8Array(patternBuffer)));
        console.log('Pattern image loaded successfully');
      } catch (error) {
        console.error('Failed to load pattern image:', error);
        throw new Error('Failed to load pattern image');
      }
    }

    // Camera angles
    const cameraAngles: {[key: string]: string} = {
      hero: "Front three-quarter view (45° angle) - Most flattering angle showing front and driver side",
      side: "Direct profile view - Perfect side elevation showing full vehicle length",
      rear: "Rear three-quarter view - Showing back and passenger side at 45°",
      top: "High aerial view looking down at 45° - Bird's eye perspective",
      closeup: viewType === 'closeup' && modeType === 'designpanelpro'
        ? "EXTREME CLOSE-UP of hood panel - Fill frame with wrapped panel surface showing pattern texture, detail, and finish in sharp focus. Camera very close to hood. NO full vehicle visible, just panel detail and texture."
        : "Extreme close-up of hood - Detailed view of wrap texture and finish"
    };
    const cameraAngle = cameraAngles[viewType] || cameraAngles.hero;

    // Build AI prompt based on mode
    let aiPrompt = '';

    if (modeType === 'inkfusion') {
      // InkFusion: Solid color vinyl wrap
      const finishInstructions = {
        gloss: `
GLOSS FINISH CRITICAL REQUIREMENTS:
- Mirror-like surface with sharp, crisp reflections
- High contrast between highlights and shadows
- Wet-look appearance with deep color saturation
- Studio lights create bright, defined highlight spots
- Floor reflection should be clear and prominent
- Surface appears liquid-smooth and glass-like`,
        satin: `
SATIN FINISH CRITICAL REQUIREMENTS:
- Soft, silk-like sheen (NOT glossy, NOT matte)
- Gentle, diffused reflections (not mirror-sharp)
- Moderate contrast between light and shadow areas
- Subtle pearl-like luster
- Smooth but not wet-looking
- Soft highlight spots from studio lights`,
        matte: `
MATTE FINISH CRITICAL REQUIREMENTS:
- ZERO reflections or sheen
- Completely flat, non-reflective surface
- Soft, even lighting with minimal highlights
- Velvety texture appearance
- No glossy spots whatsoever
- Uniform light absorption across all panels`
      };

      aiPrompt = `Generate a photorealistic studio photograph of a ${vehicle} wrapped in ${colorName} (${colorHex}) vinyl wrap with ${finish} finish.

🚨 CRITICAL IMAGE FORMAT REQUIREMENT 🚨
MANDATORY: Image MUST be 16:9 LANDSCAPE aspect ratio (e.g., 1792x1008, 1920x1080)
DO NOT generate square images - ONLY 16:9 landscape orientation

CAMERA ANGLE: ${cameraAngle}

PROFESSIONAL STUDIO ENVIRONMENT:
- Pristine white studio with soft, diffused lighting
- Multiple studio light sources creating natural highlights
- Perfectly clean, high-gloss studio floor with subtle reflections
- Professional automotive photography setup
- Zero background distractions - pure white backdrop

${finishInstructions[finish as keyof typeof finishInstructions]}

VINYL WRAP APPLICATION:
- Wrap edges tucked and sealed perfectly
- Material follows every curve and body line precisely
- Realistic vinyl wrap texture
- Professional installation quality

🚨 CRITICAL - WHAT TO WRAP VS WHAT NOT TO WRAP 🚨
WRAP THESE BODY PANELS ONLY:
✓ Hood
✓ Roof
✓ Trunk/Deck lid
✓ Front fenders
✓ Doors
✓ Rear quarter panels
✓ Front bumper cover (painted plastic part)
✓ Rear bumper cover (painted plastic part)

NEVER EVER WRAP THESE COMPONENTS:
❌ Metal grilles/grills (front or rear) - MUST stay BLACK/CHROME/SILVER
❌ Headlights and headlight housings - MUST stay CLEAR/BLACK
❌ Taillights and taillight housings - MUST stay RED/CLEAR/BLACK
❌ Windows and glass - MUST stay CLEAR/TINTED
❌ Wheels and rims - MUST stay BLACK/SILVER/CHROME
❌ Tires - MUST stay BLACK rubber
❌ Door handles (unless painted body color originally)
❌ Side mirrors (unless painted body color originally)
❌ Chrome trim and badges
❌ Exhaust tips
❌ License plate area

CRITICAL: If vinyl wrap appears on ANY grille, headlight, taillight, wheel, or tire, the render FAILS COMPLETELY.
The grille MUST remain in its original finish (black mesh, chrome, etc.) - NEVER the wrap color.

FINAL QUALITY CHECK:
- Does this look like a REAL photograph from professional studio?
- Is the image 16:9 LANDSCAPE (NOT square)?
- Is the ${finish} finish unmistakably correct and obvious?
- Is the color ${colorName} accurately represented?
- Are grilles, lights, wheels, and tires in their ORIGINAL colors (NOT wrapped)?
- Does the vehicle look REAL, not CGI or AI-generated?
- Would this pass as professional automotive photography?

If ANY answer is NO, the render FAILS completely.

OUTPUT: Ultra-photorealistic professional automotive photography showing ${vehicle} in ${colorName} vinyl wrap with ${finish} finish. MUST be 16:9 landscape aspect ratio. Must be indistinguishable from a real photograph.`;

    } else if (modeType === 'wbty') {
      // WBTY: Patterned vinyl wrap with scale control
      const scaleDescriptions: {[key: string]: string} = {
        extreme_large: "EXTREME LARGE SCALE (>150%): Pattern tiles are MASSIVELY OVERSIZED. On a sedan hood, you see only 1-2 pattern repeats MAX. Pattern elements are GIANT.",
        large: "LARGE SCALE (100-150%): Pattern tiles are significantly larger than standard. On a sedan hood, you see 2-4 pattern repeats. Pattern is BOLD and prominent.",
        standard: "STANDARD SCALE (70-100%): Normal pattern tiling. On a sedan hood, you see 4-6 pattern repeats. This is the default balanced look.",
        small: "SMALL SCALE (50-70%): Pattern tiles are smaller. On a sedan hood, you see 6-10 pattern repeats. More intricate appearance.",
        micro: "MICRO SCALE (<50%): Pattern tiles are TINY. On a sedan hood, you see 12+ pattern repeats. Very detailed, fine texture."
      };

      let scaleDesc = scaleDescriptions.standard;
      if (patternScale > 150) scaleDesc = scaleDescriptions.extreme_large;
      else if (patternScale > 100) scaleDesc = scaleDescriptions.large;
      else if (patternScale < 50) scaleDesc = scaleDescriptions.micro;
      else if (patternScale < 70) scaleDesc = scaleDescriptions.small;

      aiPrompt = `Generate a photorealistic automotive render of a ${vehicle} with ${colorName} vinyl wrap pattern with ${finish} finish.

🚨 CRITICAL IMAGE FORMAT REQUIREMENT 🚨
MANDATORY: Image MUST be 16:9 LANDSCAPE aspect ratio
DO NOT generate square images - ONLY 16:9 landscape orientation

CAMERA ANGLE: ${cameraAngle}

PATTERN SCALE: ${scaleDesc}
Current scale setting: ${patternScale}%

🚨 PATTERN TILING INSTRUCTIONS 🚨
The provided pattern image shows the design to tile/apply across vehicle panels.
Apply this EXACT pattern at ${patternScale}% scale - ${scaleDesc}

CRITICAL: Pattern image provided shows the design to tile/apply across vehicle panels.
Apply this EXACT pattern at ${patternScale}% scale.

[Rest of wrap instructions similar to InkFusion]

OUTPUT: Ultra-photorealistic render of ${vehicle} with ${colorName} pattern wrap at ${patternScale}% scale with ${finish} finish. MUST be 16:9 landscape.`;

    } else if (modeType === 'fadewraps') {
      // FadeWraps: Smooth gradient transitions
      aiPrompt = `Generate a photorealistic automotive render of a ${vehicle} with ${colorName} SMOOTH GRADIENT vinyl wrap.

🚨 CRITICAL IMAGE FORMAT REQUIREMENT 🚨
MANDATORY: Image MUST be 16:9 LANDSCAPE aspect ratio
DO NOT generate square images - ONLY 16:9 landscape orientation

CAMERA ANGLE: ${cameraAngle}

🚨 FADEWRAPS = SMOOTH COLOR GRADIENTS, NOT REPEATING PATTERNS 🚨

CRITICAL FADE WRAP CONCEPT:
- FadeWraps are SMOOTH, CONTINUOUS color gradients
- ZERO tiling, ZERO repeating patterns, ZERO geometric designs
- The provided swatch image IS the gradient to apply
- STRETCH the gradient naturally across vehicle panels
- NO pattern repetition - just smooth color transitions

GRADIENT DIRECTION: ${gradientDirection}
GRADIENT SCALE/INTENSITY: ${gradientScale}%

The provided image shows the gradient fade to apply - NOT a pattern to tile.
Apply this gradient smoothly across the ${vehicle} body panels.

[Finish and wrapping instructions similar to above]

OUTPUT: Ultra-photorealistic render showing ${vehicle} with ${colorName} smooth gradient fade wrap. MUST be 16:9 landscape.`;

    } else if (modeType === 'designpanelpro') {
      // DesignPanelPro: Custom panel designs
      aiPrompt = `Generate ultra-photorealistic automotive render of a ${vehicle} with custom panel design vinyl wrap.

🚨 CRITICAL IMAGE FORMAT REQUIREMENT 🚨
MANDATORY: Image MUST be 16:9 LANDSCAPE aspect ratio
DO NOT generate square images - ONLY 16:9 landscape orientation

CAMERA ANGLE: ${cameraAngle}

PANEL DESIGN APPLICATION:
- Use the provided panel texture/pattern image
- IGNORE any background or vehicle in the uploaded image - use ONLY the panel texture
- Apply this panel design across all body panels
- Maintain pattern continuity and proper alignment
- Professional wrap installation quality

[Photorealism and finish instructions]

OUTPUT: Ultra-photorealistic render of ${vehicle} with custom panel design wrap. MUST be 16:9 landscape.`;
    }

    // Call Lovable AI Gateway
    console.log('Calling Lovable AI Gateway');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: patternImageBase64 ? [
            { type: 'text', text: aiPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${patternImageBase64}` }
            }
          ] : aiPrompt
        }],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedImageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageBase64) {
      throw new Error('No image returned from AI');
    }

    console.log('Render generated successfully');

    return new Response(
      JSON.stringify({
        renderUrl: generatedImageBase64,
        vehicleInfo: { year, make, model },
        colorInfo: { name: colorName, hex: colorHex }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-color-render:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

### 5.2 Supabase Config

**File**: `supabase/config.toml`

```toml
project_id = "your-project-id"

[functions.generate-color-render]
verify_jwt = false

[functions.analyze-vinyl-swatch]
verify_jwt = false

[functions.analyze-panel-design]
verify_jwt = false
```

---

## 6. Tool-by-Tool Code

### 6.1 InkFusion Tool

**Hook**: `src/hooks/useInkFusionLogic.ts`

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInkFusionLogic = () => {
  const [selectedSwatch, setSelectedSwatch] = useState<any>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>("gloss");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [rollsNeeded, setRollsNeeded] = useState(1);
  const [generationCount, setGenerationCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [allViews, setAllViews] = useState<{[key: string]: string}>({});
  const [isGeneratingAdditional, setIsGeneratingAdditional] = useState(false);
  
  const { toast } = useToast();
  const FREE_LIMIT = 2;
  const PRICE_PER_ROLL = 650;
  const PRODUCT_ID = "12345";

  useEffect(() => {
    const count = parseInt(localStorage.getItem("restylepro-generations") || "0", 10);
    setGenerationCount(count);
    
    const lastVizId = localStorage.getItem("last-visualization-id");
    if (lastVizId) {
      setVisualizationId(lastVizId);
      loadRenderUrls(lastVizId);
    }
  }, []);

  const loadRenderUrls = async (vizId: string) => {
    const { data } = await supabase
      .from("color_visualizations")
      .select("render_urls")
      .eq("id", vizId)
      .single();
    
    if (data?.render_urls) {
      const urls = data.render_urls as any;
      if (urls.hero) setGeneratedImageUrl(urls.hero);
      setAllViews(urls);
    }
  };

  const generateRender = async () => {
    if (!selectedSwatch || !year || !make || !model) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-color-render', {
        body: {
          vehicle: `${year} ${make} ${model}`,
          year, make, model,
          colorHex: selectedSwatch.hex,
          colorName: selectedSwatch.name,
          finish: selectedFinish,
          viewType: 'hero',
          modeType: 'inkfusion'
        }
      });

      if (error) throw error;
      
      setGeneratedImageUrl(data.renderUrl);
      setVisualizationId(data.visualizationId);
      localStorage.setItem("last-visualization-id", data.visualizationId);
      
      incrementGeneration();
      
      toast({ title: "Render generated successfully!" });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAdditionalViews = async () => {
    if (!visualizationId) return;
    
    setIsGeneratingAdditional(true);
    
    const views = ['side', 'rear', 'top'];
    const promises = views.map(viewType =>
      supabase.functions.invoke('generate-color-render', {
        body: {
          vehicle: `${year} ${make} ${model}`,
          year, make, model,
          colorHex: selectedSwatch.hex,
          colorName: selectedSwatch.name,
          finish: selectedFinish,
          viewType,
          modeType: 'inkfusion'
        }
      })
    );

    try {
      const results = await Promise.all(promises);
      const newViews: {[key: string]: string} = { ...allViews };
      
      results.forEach((result, index) => {
        if (result.data?.renderUrl) {
          newViews[views[index]] = result.data.renderUrl;
        }
      });
      
      setAllViews(newViews);
      toast({ title: "Additional views generated!" });
    } catch (error) {
      toast({ title: "Failed to generate additional views", variant: "destructive" });
    } finally {
      setIsGeneratingAdditional(false);
    }
  };

  const incrementGeneration = () => {
    const newCount = generationCount + 1;
    localStorage.setItem("restylepro-generations", newCount.toString());
    setGenerationCount(newCount);
  };

  return {
    selectedSwatch, setSelectedSwatch,
    selectedFinish, setSelectedFinish,
    year, setYear, make, setMake, model, setModel,
    rollsNeeded, setRollsNeeded,
    generationCount,
    hasReachedLimit: generationCount >= FREE_LIMIT,
    remainingGenerations: Math.max(0, FREE_LIMIT - generationCount),
    totalPrice: rollsNeeded * PRICE_PER_ROLL,
    productId: PRODUCT_ID,
    generateRender,
    isGenerating,
    generatedImageUrl,
    allViews,
    generateAdditionalViews,
    isGeneratingAdditional
  };
};
```

**Component**: Uses same pattern as other tools - fetches swatches from `inkfusion_swatches`, displays grid, calls `generateRender()`.

### 6.2 WBTY Tool

Uses `useWBTYLogic` hook (see Architecture section for structure). Key differences:
- Fetches from `wbty_products` table
- Pattern scale slider (30-300%)
- Price per yard: $95.50
- Category filtering

### 6.3 FadeWraps Tool

Uses `useFadeWrapLogic` hook. Key features:
- Gradient direction control (horizontal, vertical, diagonal)
- Gradient scale slider (50-200%)
- Kit-based pricing (Small: $600, Medium: $710, Large: $825, XL: $990)
- Add-ons: Hood ($160), Front Bumper ($200), Rear Bumper ($395)
- Roof options: Small ($160), Medium ($225), Large ($330)

### 6.4 DesignPanelPro Tool

Uses `useDesignPanelProLogic` hook. Features:
- Curated panel library + custom uploads
- AI naming for uploaded panels
- Same pricing as FadeWraps
- Panel preprocessing to remove dimension text

### 6.5 ApproveMode Tool

Simple component fetching from `approvemode_examples`:

```typescript
const { data: examples } = useQuery({
  queryKey: ["approvemode_examples"],
  queryFn: async () => {
    const { data } = await supabase
      .from("approvemode_examples")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data;
  }
});
```

Displays before/after images side-by-side.

---

## 7. UI/UX Specifications

### 7.1 Color Palette

- **Primary**: Magenta gradient (#FF2DA1 → #B620E0 → #6A00FF)
- **Background**: White (#FFFFFF)
- **Text**: Near-black (#1a1a1a)
- **Secondary**: Light gray (#F5F5F5)
- **Borders**: Light gray (#E5E5E5)

### 7.2 Typography

- **Headings**: System font stack (sans-serif)
- **Body**: 16px base, 1.5 line height
- **Buttons**: 14px, 600 weight

### 7.3 Component Patterns

**Button Variants**:
```typescript
<Button variant="default">Generate 3D Proof</Button>
<Button variant="outline">View Details</Button>
<Button variant="ghost">Cancel</Button>
```

**Card Layout**:
```typescript
<Card className="p-6">
  <h3 className="text-xl font-bold mb-4">Select Pattern</h3>
  <ScrollArea className="h-96">
    {/* Content */}
  </ScrollArea>
</Card>
```

**Two-Column Layout**:
```typescript
<div className="grid md:grid-cols-2 gap-6">
  <div>{/* Controls */}</div>
  <div>{/* Preview */}</div>
</div>
```

### 7.4 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 8. Deployment Guide

### 8.1 Prerequisites

- Supabase account
- Node.js 18+
- Git
- Domain (optional)

### 8.2 Steps

**1. Create Supabase Project**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create new project via dashboard
# Note project URL and anon key
```

**2. Set up Database**

```bash
# Initialize local Supabase
supabase init

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
# Create migration files with SQL from Section 3
supabase migration new initial_schema
# Copy SQL into migration file
supabase db push
```

**3. Deploy Edge Functions**

```bash
# Deploy functions
supabase functions deploy generate-color-render
supabase functions deploy analyze-vinyl-swatch

# Set secrets
supabase secrets set LOVABLE_API_KEY=your_key_here
```

**4. Create Storage Buckets**

Via Supabase Dashboard:
- Create public buckets: renders, swatches, patterns, carousel-images, etc.

**5. Deploy Frontend**

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or Netlify
npm install -g netlify-cli
netlify deploy --prod
```

**6. Configure Environment Variables**

In Vercel/Netlify:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

---

## 9. SaaS Conversion

### 9.1 Stripe Integration

**Add Stripe Secret**:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
```

**Create Checkout Edge Function**:
```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

serve(async (req) => {
  const { priceId, userId, userEmail } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/pricing`,
    metadata: { user_id: userId }
  });
  
  return new Response(JSON.stringify({ url: session.url }));
});
```

### 9.2 Subscription Schema

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL, -- 'starter', 'professional', 'business'
  status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  generation_limit INTEGER NOT NULL,
  generations_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pricing tiers
-- Starter: $0/mo, 5 generations
-- Professional: $49/mo, 100 generations
-- Business: $149/mo, unlimited generations
```

### 9.3 Usage Tracking

Modify `generateRender` functions to check limits:

```typescript
// Before generating
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .single();

if (subscription.generations_used >= subscription.generation_limit) {
  throw new Error('Generation limit reached');
}

// After successful generation
await supabase
  .from('subscriptions')
  .update({ generations_used: subscription.generations_used + 1 })
  .eq('user_id', userId);
```

### 9.4 Webhook Handler

```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: session.metadata.user_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        tier: session.metadata.tier,
        generation_limit: getTierLimit(session.metadata.tier)
      });
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update to free tier
      await supabase
        .from('subscriptions')
        .update({ tier: 'starter', status: 'canceled', generation_limit: 5 })
        .eq('stripe_subscription_id', subscription.id);
      break;
  }
  
  return new Response(JSON.stringify({ received: true }));
});
```

---

## 10. Cost Analysis

### 10.1 Infrastructure Costs

**Supabase (Free tier)**:
- Up to 500MB database
- 1GB file storage
- 2 million edge function invocations
- **Upgrade**: $25/mo for Pro (8GB database, 100GB storage)

**Lovable AI**:
- Image generation: ~$0.02 per image
- 100 generations/month = ~$2
- 1000 generations/month = ~$20
- **Key cost driver**

**Vercel/Netlify (Free tier)**:
- Unlimited sites
- 100GB bandwidth/mo
- **Upgrade**: $20/mo for Pro (1TB bandwidth)

**Stripe**:
- 2.9% + $0.30 per transaction
- No monthly fee

### 10.2 Revenue Model

**Pricing Tiers**:

| Tier | Price | Generations/mo | Revenue (100 users) |
|------|-------|----------------|---------------------|
| Starter | $0 | 5 | $0 |
| Professional | $49 | 100 | $4,900 |
| Business | $149 | Unlimited* | $14,900 |

*Fair use policy: ~500 generations/mo

**Break-even Analysis**:
- Fixed costs: ~$50/mo (Supabase Pro + hosting)
- Variable costs: $0.02 per generation
- 10 paying users on Pro plan = $490/mo revenue
- Profit margin: ~80% after costs

### 10.3 Scaling Considerations

**1000 Users (100 paying)**:
- Revenue: ~$5,000/mo
- AI costs: ~$400/mo (20,000 generations)
- Infrastructure: ~$100/mo
- Profit: ~$4,500/mo

**10,000 Users (1,000 paying)**:
- Revenue: ~$50,000/mo
- AI costs: ~$4,000/mo (200,000 generations)
- Infrastructure: ~$500/mo (need Supabase Team plan)
- Profit: ~$45,500/mo

---

## Conclusion

This guide provides everything needed to rebuild WrapCloser Tools as WrapCommand AI:

✅ Complete technology stack
✅ Full database schema with SQL
✅ All 5 tools with exact code
✅ Edge functions with AI prompts
✅ UI/UX specifications
✅ Deployment instructions
✅ SaaS conversion strategy
✅ Cost & revenue analysis

**Next Steps**:
1. Set up Supabase project
2. Deploy database schema
3. Deploy edge functions
4. Build frontend with provided code
5. Test all 5 tools
6. Integrate Stripe for payments
7. Launch beta

**Estimated Timeline**: 4-6 weeks with 2-3 developers

**Support**: Refer to user guide at `/user-guide` route for end-user documentation.

---

**End of Rebuild Guide**
