# WrapCommand AI - Full Tech Stack & Architecture Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Core Architecture](#core-architecture)
4. [Component Library](#component-library)
5. [Database Schema](#database-schema)
6. [API & Edge Functions](#api--edge-functions)
7. [State Management](#state-management)
8. [Styling System](#styling-system)
9. [Deployment](#deployment)

---

## Technology Stack

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Components & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless component primitives
  - @radix-ui/react-accordion
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-tabs
  - @radix-ui/react-collapsible
  - @radix-ui/react-select
  - And 20+ more component primitives
- **Shadcn/ui** - Pre-built accessible components
- **Lucide React 0.462.0** - Icon library
- **Class Variance Authority (CVA)** - Component variant management
- **tailwind-merge & clsx** - Conditional class utilities
- **tailwindcss-animate** - Animation utilities

### Backend & Database
- **Supabase 2.81.1** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Storage buckets
  - Edge Functions (Deno runtime)
  - Real-time subscriptions
- **Lovable Cloud** - Integrated Supabase instance

### State Management & Data Fetching
- **TanStack Query (React Query) 5.83.0** - Server state management
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Query invalidation

### Form Handling
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation
- **@hookform/resolvers 3.10.0** - Form validation integration

### Additional Libraries
- **Sonner** - Toast notifications
- **date-fns 3.6.0** - Date utilities
- **Embla Carousel React 8.6.0** - Carousel component
- **Recharts 2.15.4** - Chart library
- **Next Themes 0.3.0** - Theme management

---

## Project Structure

```
wrapcommand-ai/
├── public/                          # Static assets
│   ├── fadewraps-swatches/         # FadeWraps pattern images
│   ├── robots.txt
│   └── favicon.ico
│
├── src/
│   ├── assets/                      # Local image assets
│   │   ├── wbty/                   # WBTY pattern images
│   │   └── *.png                   # Hero images
│   │
│   ├── components/                  # React components
│   │   ├── ui/                     # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── [40+ more]
│   │   │
│   │   ├── productTools/           # Product-specific tools
│   │   │   ├── FadeWrapToolUI.tsx
│   │   │   ├── InkFusionToolUI.tsx
│   │   │   └── WBTYToolUI.tsx
│   │   │
│   │   ├── visualize/              # Visualization components
│   │   │   ├── ColorDropdown.tsx
│   │   │   ├── DesignUploader.tsx
│   │   │   ├── FinishSelector.tsx
│   │   │   ├── RenderResults.tsx
│   │   │   └── VehicleSelector.tsx
│   │   │
│   │   ├── wrapcloser/             # Unified tool components
│   │   │   ├── modes/              # Tool modes
│   │   │   │   ├── FadeWrapMode.tsx
│   │   │   │   ├── FadeWrapsMode.tsx
│   │   │   │   ├── InkFusionMode.tsx
│   │   │   │   ├── SwatchMode.tsx
│   │   │   │   └── WrapByTheYardMode.tsx
│   │   │   └── UnifiedWrapCloserTool.tsx
│   │   │
│   │   ├── BeforeAfter.tsx         # Before/after slider
│   │   ├── FAQ.tsx                 # FAQ accordion
│   │   ├── Footer.tsx              # Site footer
│   │   ├── Header.tsx              # Site header
│   │   ├── HeroCarousel.tsx        # Hero carousel
│   │   ├── ImageCarousel.tsx       # Image carousel
│   │   ├── MediaManager.tsx        # Media upload manager
│   │   ├── PaywallModal.tsx        # Paywall dialog
│   │   ├── PricingCard.tsx         # Pricing display
│   │   └── ProductHero.tsx         # Product hero section
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.tsx          # Mobile detection
│   │   ├── use-toast.ts            # Toast notifications
│   │   ├── useGenerationLimit.ts   # Generation limits
│   │   ├── useFadeWrapLogic.ts     # FadeWraps logic
│   │   ├── useInkFusionLogic.ts    # InkFusion logic
│   │   ├── useRenderPolling.ts     # Render polling
│   │   └── useWBTYLogic.ts         # WBTY logic
│   │
│   ├── integrations/
│   │   └── supabase/               # Supabase integration
│   │       ├── client.ts           # Supabase client (auto-generated)
│   │       └── types.ts            # Database types (auto-generated)
│   │
│   ├── lib/                         # Utilities
│   │   ├── color-extractor.ts      # Color extraction utils
│   │   ├── utils.ts                # General utilities
│   │   └── wpw-infusion-colors.ts  # Color definitions
│   │
│   ├── pages/                       # Page components
│   │   ├── admin/                  # Admin pages
│   │   │   ├── AdminCarouselManager.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminFadeWrapsManager.tsx
│   │   │   ├── AdminGallery.tsx
│   │   │   ├── AdminInkFusionManager.tsx
│   │   │   ├── AdminRenderCarousel.tsx
│   │   │   ├── AdminRenders.tsx
│   │   │   ├── AdminSwatchCleaner.tsx
│   │   │   └── AdminWBTYManager.tsx
│   │   │
│   │   ├── ApproveMode.tsx         # ApproveMode product page
│   │   ├── FadeWraps.tsx           # FadeWraps product page
│   │   ├── Gallery.tsx             # Public gallery
│   │   ├── Index.tsx               # Homepage
│   │   ├── InkFusion.tsx           # InkFusion product page
│   │   ├── NotFound.tsx            # 404 page
│   │   ├── Visualize.tsx           # Visualization tool
│   │   ├── WBTY.tsx                # WBTY product page
│   │   └── WrapCloserLite.tsx      # Lite version
│   │
│   ├── contexts/                    # React contexts
│   │   └── OrganizationContext.tsx # Organization state
│   │
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   ├── index.css                    # Global styles
│   └── vite-env.d.ts               # Vite types
│
├── supabase/
│   ├── config.toml                  # Supabase config (auto-generated)
│   ├── functions/                   # Edge functions
│   │   ├── analyze-vinyl-swatch/
│   │   ├── bulk-upload-wbty-swatches/
│   │   ├── clean-swatch-image/
│   │   ├── generate-color-render/
│   │   └── regenerate-clean-swatch/
│   └── migrations/                  # Database migrations
│
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies

```

---

## Core Architecture

### 1. Application Entry Point

**File: `src/main.tsx`**
```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { OrganizationProvider } from "./contexts/OrganizationContext";

createRoot(document.getElementById("root")!).render(
  <OrganizationProvider>
    <App />
  </OrganizationProvider>
);
```

### 2. Main App Component

**File: `src/App.tsx`**
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Component imports...

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inkfusion" element={<InkFusion />} />
          <Route path="/fadewraps" element={<FadeWraps />} />
          <Route path="/wbty" element={<WBTY />} />
          {/* More routes... */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

### 3. Routing Structure

All routes are defined in `App.tsx`:
- `/` - Homepage
- `/inkfusion` - InkFusion product page
- `/fadewraps` - FadeWraps product page
- `/wbty` - Wrap By The Yard page
- `/approvemode` - ApproveMode page
- `/gallery` - Public gallery
- `/admin/*` - Admin pages (dashboard, managers)

---

## Component Library

### UI Components (Shadcn/ui)

All UI components are in `src/components/ui/`:

**Core Components:**
- `button.tsx` - Button with variants (default, destructive, outline, ghost, link)
- `card.tsx` - Card container with header, content, footer
- `dialog.tsx` - Modal dialogs
- `input.tsx` - Text inputs
- `label.tsx` - Form labels
- `select.tsx` - Dropdown selects
- `tabs.tsx` - Tabbed interfaces
- `accordion.tsx` - Collapsible sections
- `collapsible.tsx` - Expandable content

**Advanced Components:**
- `carousel.tsx` - Image carousels (Embla)
- `toast.tsx` & `toaster.tsx` - Notifications
- `dropdown-menu.tsx` - Context menus
- `sheet.tsx` - Slide-out panels
- `alert-dialog.tsx` - Confirmation dialogs
- `progress.tsx` - Progress bars
- `slider.tsx` - Range sliders

### Product-Specific Components

#### FadeWraps Tool UI
**File: `src/components/productTools/FadeWrapToolUI.tsx`**

Features:
- Pattern selection
- Finish selection (Gloss, Satin, Matte)
- Kit size selection with pricing
- Add-ons (Hood, Bumpers, Roof)
- Vehicle input (Year, Make, Model)
- 3D render generation
- Additional views generation
- Download functionality

#### InkFusion Tool UI
**File: `src/components/productTools/InkFusionToolUI.tsx`**

Features:
- Color swatch selection (50 colors)
- Finish selection
- Real-time color preview
- Vehicle input
- 3D render generation
- Swatch detail modal
- Download renders

#### WBTY Tool UI
**File: `src/components/productTools/WBTYToolUI.tsx`**

Features:
- Pattern category filtering
- Pattern swatch selection
- Lamination finish selection
- Yard calculation
- Vehicle input
- 3D render generation
- Pattern scaling control
- Close-up view generation

---

## Database Schema

### Supabase Tables

#### 1. InkFusion Swatches
**Table: `inkfusion_swatches`**
```sql
CREATE TABLE inkfusion_swatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  hex TEXT,
  finish TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. FadeWraps Patterns
**Table: `fadewraps_patterns`**
```sql
CREATE TABLE fadewraps_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. WBTY Products
**Table: `wbty_products`**
```sql
CREATE TABLE wbty_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. Carousel Tables
Each product has a carousel table:
- `inkfusion_carousel`
- `fadewraps_carousel`
- `wbty_carousel`
- `approvemode_carousel`

**Structure:**
```sql
CREATE TABLE {product}_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  media_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  vehicle_name TEXT,
  color_name TEXT,
  pattern_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. Color Visualizations
**Table: `color_visualizations`**
```sql
CREATE TABLE color_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_type TEXT,
  color_hex TEXT NOT NULL,
  color_name TEXT NOT NULL,
  finish_type TEXT NOT NULL,
  mode_type TEXT,
  render_urls JSONB,
  custom_design_url TEXT,
  custom_swatch_url TEXT,
  infusion_color_id TEXT,
  generation_status TEXT DEFAULT 'processing',
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Storage Buckets

Supabase Storage buckets:
1. `carousel-images` - Carousel images (public)
2. `swatches` - Color swatches (public)
3. `patterns` - Pattern images (public)
4. `products` - Product images (public)
5. `renders` - Generated renders (public)
6. `vehicle-renders` - Vehicle renders (public)
7. `wrap-files` - Wrap design files (public)

### Row Level Security (RLS)

**Public read access pattern:**
```sql
CREATE POLICY "Public read access"
ON {table_name}
FOR SELECT
USING (is_active = true);
```

**Admin full access pattern:**
```sql
CREATE POLICY "Admin full access"
ON {table_name}
FOR ALL
USING (true);
```

---

## API & Edge Functions

### Edge Functions (Deno Runtime)

#### 1. Generate Color Render
**File: `supabase/functions/generate-color-render/index.ts`**

Purpose: Generate photorealistic vehicle renders using AI

Input:
```typescript
{
  vehicleYear: string,
  vehicleMake: string,
  vehicleModel: string,
  colorHex: string,
  colorName: string,
  finishType: 'Gloss' | 'Satin' | 'Matte',
  modeType: 'inkfusion' | 'fadewraps' | 'wbty',
  patternUrl?: string,
  viewType: 'front' | 'side' | 'rear' | 'top'
}
```

Output:
```typescript
{
  renderUrl: string
}
```

#### 2. Analyze Vinyl Swatch
**File: `supabase/functions/analyze-vinyl-swatch/index.ts`**

Purpose: Extract color and finish from uploaded swatch images

#### 3. Clean Swatch Image
**File: `supabase/functions/clean-swatch-image/index.ts`**

Purpose: Remove text/branding from swatch images

### API Integration with Lovable AI

The app uses Lovable AI for image generation without requiring API keys:

**Supported Models:**
- `google/gemini-2.5-pro` - High-quality multimodal
- `google/gemini-2.5-flash` - Balanced performance
- `google/gemini-2.5-flash-lite` - Fast & cheap
- `openai/gpt-5` - Premium quality
- `openai/gpt-5-mini` - Balanced cost
- `openai/gpt-5-nano` - Speed optimized
- `flux.1-dev` - Photorealistic renders (currently used)

---

## State Management

### TanStack Query (React Query)

**Query Pattern:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["unique_key", ...params],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .eq("column", value);
    
    if (error) throw error;
    return data;
  },
});
```

**Mutation Pattern:**
```typescript
const mutation = useMutation({
  mutationFn: async (payload) => {
    const { data, error } = await supabase
      .from("table_name")
      .insert(payload);
    
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["unique_key"] });
    toast({ title: "Success!" });
  },
  onError: (error) => {
    toast({ title: "Error", variant: "destructive" });
  },
});
```

### Custom Hooks

#### useFadeWrapLogic
**File: `src/hooks/useFadeWrapLogic.ts`**

Manages:
- Pattern selection
- Finish selection
- Kit size & add-ons
- Pricing calculation
- Render generation
- Generation limits

```typescript
export const useFadeWrapLogic = () => {
  // State
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState('Gloss');
  const [kitSize, setKitSize] = useState('medium');
  
  // Fetch patterns
  const { data: patterns } = useQuery({
    queryKey: ["fadewraps_patterns"],
    queryFn: fetchPatterns
  });
  
  // Calculate price
  const calculateTotal = () => {
    let total = kitPrices[kitSize];
    if (addHood) total += addonPrices.hood;
    // ... more calculations
    return total;
  };
  
  // Generate render
  const generateRender = async (year, make, model) => {
    const { data } = await supabase.functions.invoke(
      'generate-color-render',
      { body: { vehicleYear: year, ... } }
    );
    setGeneratedImageUrl(data.renderUrl);
  };
  
  return {
    selectedPattern,
    setSelectedPattern,
    // ... all state and functions
  };
};
```

#### useInkFusionLogic
**File: `src/hooks/useInkFusionLogic.ts`**

Similar structure for InkFusion tool.

#### useWBTYLogic
**File: `src/hooks/useWBTYLogic.ts`**

Similar structure for WBTY tool.

---

## Styling System

### Tailwind Configuration

**File: `tailwind.config.ts`**
```typescript
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more semantic tokens
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Design Tokens

**File: `src/index.css`**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    /* ... more tokens */
    
    --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
    --shadow-elegant: 0 10px 30px -10px hsl(var(--primary) / 0.3);
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode tokens */
  }
}
```

### Component Variants (CVA)

**Example: Button Component**
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## Deployment

### Frontend Deployment (Lovable)

**Production URL:** `yourproject.lovable.app`

Steps:
1. Click "Publish" button (top-right)
2. Review changes
3. Click "Update" to deploy

**Custom Domain:**
- Navigate to Project > Settings > Domains
- Add custom domain (requires paid plan)
- Configure DNS records

### Backend Deployment (Automatic)

**Edge Functions:** Deploy automatically on code changes

**Database Migrations:** Run automatically

**Environment Variables:**
- `VITE_SUPABASE_URL` - Auto-configured
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Auto-configured
- Custom secrets via Lovable Cloud UI

---

## Usage in Other Apps

### Complete Mode Implementation

Each mode (InkFusion, FadeWraps, WBTY) follows this pattern:

1. **UI Component** (`src/components/productTools/{Mode}ToolUI.tsx`)
2. **Logic Hook** (`src/hooks/use{Mode}Logic.ts`)
3. **Page Component** (`src/pages/{Mode}.tsx`)
4. **Database Table** (`{mode}_patterns` or `{mode}_swatches`)
5. **Carousel Table** (`{mode}_carousel`)
6. **Admin Manager** (`src/pages/Admin{Mode}Manager.tsx`)

### Copy Requirements

To implement in another app:

**Files to copy:**
```
src/components/ui/* (all shadcn components)
src/components/productTools/{YourMode}ToolUI.tsx
src/hooks/use{YourMode}Logic.ts
src/pages/{YourMode}.tsx
src/pages/Admin{YourMode}Manager.tsx
src/integrations/supabase/* (client & types)
tailwind.config.ts
src/index.css
```

**Database setup:**
1. Create pattern/swatch table
2. Create carousel table
3. Create storage bucket
4. Set up RLS policies
5. Deploy edge functions

**Dependencies to install:**
```bash
npm install @supabase/supabase-js @tanstack/react-query
npm install react-router-dom react-hook-form zod
npm install @radix-ui/react-* (all needed primitives)
npm install tailwindcss tailwind-merge clsx
npm install lucide-react sonner
npm install class-variance-authority
```

---

## Support & Resources

- **Lovable Docs:** https://docs.lovable.dev
- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Shadcn/ui Docs:** https://ui.shadcn.com

---

*Last Updated: 2025-11-17*
*Version: 1.0*
