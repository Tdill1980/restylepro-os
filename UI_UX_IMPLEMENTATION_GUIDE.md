# Complete UI/UX Implementation Guide - InkFusion Tool Design

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Tool Layout Pattern](#tool-layout-pattern)
3. [Complete InkFusion UI Code](#complete-inkfusion-ui-code)
4. [Component Breakdown](#component-breakdown)
5. [Styling Specifications](#styling-specifications)
6. [Responsive Design](#responsive-design)
7. [Replication Steps](#replication-steps)

---

## Design System Overview

### Color System (HSL Semantic Tokens)

All colors use CSS custom properties defined in `src/index.css`:

```css
:root {
  /* Background & Foreground */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Primary Brand Colors */
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  /* Surface Colors */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Interactive States */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Borders */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  
  /* Border Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
}
```

### Typography Scale

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

Tailwind's default spacing scale (rem-based):
- `p-2` = 0.5rem (8px)
- `p-4` = 1rem (16px)
- `p-6` = 1.5rem (24px)
- `p-8` = 2rem (32px)
- `gap-2` = 0.5rem
- `gap-4` = 1rem

---

## Tool Layout Pattern

### Two-Column Card Layout

All tools (InkFusion, FadeWraps, WBTY) follow this exact pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  CARD CONTAINER (max-w-7xl mx-auto p-8)                    │
│  ┌───────────────────┬──────────────────────────────────┐  │
│  │ LEFT SIDEBAR      │ RIGHT PREVIEW AREA               │  │
│  │ (350px width)     │ (flex-1)                        │  │
│  │                   │                                  │  │
│  │ • Vehicle Inputs  │  ┌────────────────────────────┐ │  │
│  │ • Selection UI    │  │                            │ │  │
│  │ • Options         │  │   3D PREVIEW CONTAINER     │ │  │
│  │ • Pricing         │  │   (aspect-video)           │ │  │
│  │ • Action Buttons  │  │                            │ │  │
│  │                   │  └────────────────────────────┘ │  │
│  │                   │                                  │  │
│  │                   │  • Download Buttons              │  │
│  │                   │  • Additional Views              │  │
│  └───────────────────┴──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Measurements:**
- Outer Card: `max-w-7xl` (1280px) with `p-8` padding
- Left Sidebar: Fixed `w-[350px]`
- Right Preview: `flex-1` (fills remaining space)
- Gap between columns: `gap-8`
- Card border radius: `rounded-lg`
- Card background: `bg-card` with `border border-border`

---

## Complete InkFusion UI Code

### Full Component (src/components/productTools/InkFusionToolUI.tsx)

```typescript
import { useToast } from "@/hooks/use-toast";
import { useInkFusionLogic } from "@/hooks/useInkFusionLogic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, ChevronDown, Sparkles } from "lucide-react";

export const InkFusionToolUI = () => {
  const { toast } = useToast();
  const {
    selectedColor,
    setSelectedColor,
    selectedFinish,
    setSelectedFinish,
    colors,
    generateRender,
    isGenerating,
    generatedImageUrl,
    additionalViews,
    generateAdditionalViews,
    isGeneratingAdditional,
  } = useInkFusionLogic();

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearError, setYearError] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);

  const finishes = ['Gloss', 'Satin', 'Matte'];

  const validateYear = () => {
    if (!year || year.trim() === '') {
      setYearError(true);
      yearInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      yearInputRef.current?.focus();
      setTimeout(() => setYearError(false), 2000);
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!selectedColor) {
      toast({ 
        title: "No color selected", 
        description: "Please select a color first", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!validateYear()) {
      return;
    }

    if (!make || !model) {
      toast({ 
        title: "Vehicle required", 
        description: "Please enter year, make, and model", 
        variant: "destructive" 
      });
      return;
    }

    await generateRender(year, make, model);
  };

  const handleGenerateAdditionalViews = async () => {
    if (!generatedImageUrl) {
      toast({ 
        title: "No render available", 
        description: "Generate a 3D proof first", 
        variant: "destructive" 
      });
      return;
    }
    await generateAdditionalViews(year, make, model);
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Download started", description: `Downloading ${filename}` });
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: "Please try again", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card className="max-w-7xl mx-auto p-8 bg-card border border-border">
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        
        {/* LEFT SIDEBAR - Configuration */}
        <div className="space-y-6">
          
          {/* Vehicle Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Vehicle Information</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="year" className="text-xs text-muted-foreground">Year</Label>
                <Input
                  ref={yearInputRef}
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className={cn(
                    "h-9 text-sm",
                    yearError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              <div>
                <Label htmlFor="make" className="text-xs text-muted-foreground">Make</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Tesla"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-xs text-muted-foreground">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model S"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Select Color</h3>
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {colors?.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all hover:scale-105",
                    selectedColor?.id === color.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.hex || '#ccc' }}
                  title={color.name}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="text-xs text-muted-foreground text-center">
                {selectedColor.name}
              </p>
            )}
          </div>

          {/* Finish Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Select Finish</h3>
            <div className="grid grid-cols-3 gap-2">
              {finishes.map((finish) => (
                <button
                  key={finish}
                  onClick={() => setSelectedFinish(finish as any)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                    selectedFinish === finish
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedColor}
            className="w-full h-11"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate 3D Proof
              </>
            )}
          </Button>

          {/* Pricing (Collapsible) */}
          <Collapsible open={pricingOpen} onOpenChange={setPricingOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="text-sm font-medium">Pricing Details</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  pricingOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Full Vehicle Wrap:</span>
                  <span className="font-semibold text-foreground">$2,499</span>
                </div>
                <div className="flex justify-between">
                  <span>Partial Wrap:</span>
                  <span className="font-semibold text-foreground">$1,299</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* RIGHT SIDE - Preview */}
        <div className="space-y-4">
          
          {/* Main Preview Container */}
          <div className="aspect-video rounded-lg border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
            {generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated render"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Your 3D proof will appear here</p>
                <p className="text-xs mt-2">Select a color and vehicle, then generate</p>
              </div>
            )}
          </div>

          {/* Download & Additional Views */}
          {generatedImageUrl && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(generatedImageUrl, `inkfusion-${selectedColor?.name}-hero.png`)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Hero View
                </Button>
                <Button
                  onClick={handleGenerateAdditionalViews}
                  disabled={isGeneratingAdditional}
                  variant="secondary"
                  className="flex-1"
                >
                  {isGeneratingAdditional ? "Generating..." : "Generate All Views"}
                </Button>
              </div>

              {/* Additional Views Grid */}
              {additionalViews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {additionalViews.map((view, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={view.url}
                        alt={view.name}
                        className="w-full aspect-video rounded border border-border object-cover"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(view.url, `inkfusion-${selectedColor?.name}-${view.name}.png`)}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
```

---

## Component Breakdown

### 1. Card Container
```tsx
<Card className="max-w-7xl mx-auto p-8 bg-card border border-border">
```
- **Purpose:** Main wrapper for entire tool
- **Max Width:** 1280px (`max-w-7xl`)
- **Padding:** 32px all sides (`p-8`)
- **Background:** Uses semantic `bg-card` token
- **Border:** 1px using `border-border` token

### 2. Grid Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
```
- **Mobile:** Single column (`grid-cols-1`)
- **Desktop (lg):** Two columns - 350px fixed left, fluid right
- **Gap:** 32px between columns (`gap-8`)

### 3. Left Sidebar (Configuration)
```tsx
<div className="space-y-6">
```
- **Width:** 350px (set by parent grid)
- **Spacing:** 24px between sections (`space-y-6`)

**Sections include:**
- Vehicle Information (3-column grid)
- Color Selection (4-column grid, scrollable)
- Finish Selection (3-column grid)
- Generate Button
- Pricing Collapsible

### 4. Vehicle Input Grid
```tsx
<div className="grid grid-cols-3 gap-2">
  <div>
    <Label className="text-xs text-muted-foreground">Year</Label>
    <Input className="h-9 text-sm" />
  </div>
  {/* Make, Model... */}
</div>
```
- **Grid:** 3 equal columns
- **Gap:** 8px (`gap-2`)
- **Label:** xs size, muted color
- **Input:** 36px height (`h-9`), small text

### 5. Color Swatch Grid
```tsx
<div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
  <button
    className={cn(
      "aspect-square rounded-lg border-2 transition-all hover:scale-105",
      selected ? "border-primary ring-2 ring-primary/20" : "border-border"
    )}
    style={{ backgroundColor: color.hex }}
  />
</div>
```
- **Grid:** 4 columns
- **Gap:** 8px
- **Max Height:** 300px with scroll
- **Aspect Ratio:** Square swatches
- **Selected State:** Primary border + ring effect
- **Hover:** Scale up 5%

### 6. Finish Selector
```tsx
<div className="grid grid-cols-3 gap-2">
  <button
    className={cn(
      "px-3 py-2 rounded-lg border text-sm font-medium",
      selected ? "bg-primary text-primary-foreground" : "bg-background"
    )}
  >
    Gloss
  </button>
</div>
```
- **Grid:** 3 equal columns
- **Selected State:** Primary background with contrasting text
- **Unselected:** Background color with border

### 7. Generate Button
```tsx
<Button className="w-full h-11">
  <Sparkles className="mr-2 h-4 w-4" />
  Generate 3D Proof
</Button>
```
- **Width:** Full width of container
- **Height:** 44px (`h-11`)
- **Icon:** Leading sparkles icon with 8px margin

### 8. Preview Container
```tsx
<div className="aspect-video rounded-lg border border-border bg-muted/30 overflow-hidden">
  {generatedImageUrl ? (
    <img className="w-full h-full object-contain" />
  ) : (
    <div className="text-center text-muted-foreground">
      <Sparkles className="h-12 w-12 opacity-30" />
      <p>Your 3D proof will appear here</p>
    </div>
  )}
</div>
```
- **Aspect Ratio:** 16:9 (`aspect-video`)
- **Border Radius:** 8px (`rounded-lg`)
- **Background:** Muted at 30% opacity
- **Empty State:** Centered icon + text

### 9. Additional Views Grid
```tsx
<div className="grid grid-cols-3 gap-2">
  <div className="relative group">
    <img className="aspect-video rounded border object-cover" />
    <Button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100" />
  </div>
</div>
```
- **Grid:** 3 columns for thumbnails
- **Hover Effect:** Download button fades in
- **Position:** Absolute positioning for button overlay

---

## Styling Specifications

### Shadow & Effects

```css
/* Card Elevation */
.card-elevated {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Hover Elevations */
.hover-lift:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* Ring Effects (Focus/Selected) */
.ring-primary {
  ring: 2px solid hsl(var(--primary) / 0.2);
}
```

### Transitions

```css
/* Default Transition */
transition-all /* all properties, 150ms ease */

/* Specific Transitions */
transition-colors /* color-only, 150ms */
transition-transform /* transform-only, 150ms */
```

### Button Variants (from CVA)

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
  }
);
```

---

## Responsive Design

### Breakpoints (Tailwind)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (main tool breakpoint)
- `xl`: 1280px
- `2xl`: 1536px

### Mobile Layout (`< 1024px`)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
```

**Mobile Behavior:**
- Single column layout
- Left sidebar stacks on top
- Preview container below
- Full width on mobile
- Maintains aspect ratios

**Example Mobile Stack:**
```
┌──────────────────┐
│ Vehicle Inputs   │
├──────────────────┤
│ Color Selection  │
├──────────────────┤
│ Finish Selection │
├──────────────────┤
│ Generate Button  │
├──────────────────┤
│ Preview          │
│ Container        │
└──────────────────┘
```

### Tablet Optimization

Color grid adjusts:
```tsx
<div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
```

---

## Replication Steps

### Step 1: Install Dependencies

```bash
npm install @radix-ui/react-collapsible
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
```

### Step 2: Copy Design Tokens

Create/update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}
```

### Step 3: Copy UI Components

Copy these files from `src/components/ui/`:
- `card.tsx`
- `button.tsx`
- `input.tsx`
- `label.tsx`
- `collapsible.tsx`

### Step 4: Create Tool UI Component

Copy the complete InkFusionToolUI component code above to:
`src/components/productTools/YourToolUI.tsx`

### Step 5: Create Logic Hook

Create `src/hooks/useYourToolLogic.ts`:
```typescript
export const useYourToolLogic = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState('Gloss');
  
  // Fetch data
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems
  });
  
  // Generate function
  const generateRender = async (year, make, model) => {
    // Your generation logic
  };
  
  return {
    selectedItem,
    setSelectedItem,
    selectedFinish,
    setSelectedFinish,
    items,
    generateRender,
    // ...more
  };
};
```

### Step 6: Customize for Your Product

**Replace:**
- Color swatches → Your pattern/product grid
- Finish selection → Your options (if different)
- Pricing → Your pricing model
- Generation logic → Your render API

**Keep the same:**
- Layout structure (2-column card)
- Spacing system
- Component composition
- Responsive behavior

### Step 7: Page Integration

```typescript
// src/pages/YourProduct.tsx
import { YourToolUI } from "@/components/productTools/YourToolUI";

const YourProduct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductHero {...heroProps} />
        
        <section className="bg-background/50 py-8">
          <div className="max-w-7xl mx-auto">
            <YourToolUI />
          </div>
        </section>
        
        {/* More sections... */}
      </main>
      <Footer />
    </div>
  );
};
```

---

## Design Patterns Summary

### Spacing Pattern
- **Outer container:** `p-8` (32px)
- **Section gaps:** `space-y-6` (24px)
- **Item gaps:** `gap-2` or `gap-4` (8px or 16px)
- **Column gap:** `gap-8` (32px)

### Typography Pattern
- **Headings:** `text-sm font-semibold text-foreground`
- **Labels:** `text-xs text-muted-foreground`
- **Body:** `text-sm text-muted-foreground`

### Interactive States
- **Default:** `border-border`
- **Hover:** `hover:border-primary/50 hover:scale-105`
- **Selected:** `border-primary ring-2 ring-primary/20`
- **Disabled:** `opacity-50 cursor-not-allowed`

### Color Usage
- **Always use semantic tokens:** `bg-card`, `text-foreground`, etc.
- **Never use direct colors:** Avoid `bg-white`, `text-black`
- **Use HSL format:** All colors in `hsl(var(--token))` format

---

## Key Takeaways

✅ **Two-column card layout** is the foundation  
✅ **350px fixed sidebar** with all configuration  
✅ **Fluid preview area** with aspect-video container  
✅ **Grid-based selections** (3, 4 columns as needed)  
✅ **Semantic color tokens** for theme consistency  
✅ **Collapsible sections** for space efficiency  
✅ **Responsive by default** (mobile stacks vertically)  
✅ **Consistent spacing** using Tailwind scale  
✅ **Interactive states** with hover/selected/disabled  

This exact pattern is used across **InkFusion**, **FadeWraps**, and **WBTY** tools, ensuring consistent UX.

---

*For complete working examples, see:*
- `src/components/productTools/InkFusionToolUI.tsx`
- `src/components/productTools/FadeWrapToolUI.tsx`
- `src/components/productTools/WBTYToolUI.tsx`
