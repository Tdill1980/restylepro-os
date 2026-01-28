# 360° Vehicle Spin Viewer - Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for adding a 360° interactive vehicle spin viewer to all RestylePro Visualizer Suite™ tools (ColorPro™, DesignPanelPro™, PatternPro™, ApprovePro™). The feature will generate 12 photorealistic AI renders at 30° intervals and enable drag-to-spin interaction, competing directly with Zeno and CarChanger 3D.

---

## 1. Architecture Overview

### Core Components
1. **Edge Function Enhancement** - `generate-color-render` updated to support 12-angle generation
2. **360 Viewer React Component** - New `Vehicle360Viewer.tsx` component with drag-to-rotate
3. **Database Schema Updates** - Store 12-view URLs in `color_visualizations.render_urls`
4. **UI Integration Layer** - Add "Enable 360 View" button to all tool UIs
5. **Storage Management** - Optimize Supabase storage for 12x image volume

### Technology Stack
- **Image Generation**: Existing AI render pipeline (generate-color-render edge function)
- **360 Viewer Library**: `react-360-view` or custom implementation with React hooks
- **State Management**: React hooks + existing tool logic hooks
- **Storage**: Supabase Storage (public bucket for render images)

---

## 2. View Angle Specifications

### 12-Angle Configuration (30° Intervals)

```javascript
export const SPIN_VIEW_ANGLES = [
  { angle: 0, label: 'front', description: 'Front 3/4 view (primary)' },
  { angle: 30, label: 'front_30', description: 'Front-right 30°' },
  { angle: 60, label: 'front_60', description: 'Front-right 60°' },
  { angle: 90, label: 'side_right', description: 'Right side profile (90°)' },
  { angle: 120, label: 'rear_120', description: 'Rear-right 120°' },
  { angle: 150, label: 'rear_150', description: 'Rear-right 150°' },
  { angle: 180, label: 'rear', description: 'Rear 3/4 view' },
  { angle: 210, label: 'rear_210', description: 'Rear-left 210°' },
  { angle: 240, label: 'rear_240', description: 'Rear-left 240°' },
  { angle: 270, label: 'side_left', description: 'Left side profile (270°)' },
  { angle: 300, label: 'front_300', description: 'Front-left 300°' },
  { angle: 330, label: 'front_330', description: 'Front-left 330°' }
];
```

### Camera Positioning Rules
- **Distance from vehicle**: 12-15 feet for consistent framing
- **Height**: Eye level (5.5 feet) for realistic perspective
- **Target point**: Vehicle center at door handle height
- **Lighting**: Consistent studio lighting from above + environment
- **Background**: Neutral gray gradient or environment consistent across all angles

---

## 3. Edge Function Updates

### 3.1 Generate-Color-Render Edge Function

**File**: `supabase/functions/generate-color-render/index.ts`

#### New Parameters
```typescript
interface GenerateRenderRequest {
  // ... existing parameters
  enable360View?: boolean;          // NEW: Enable 12-angle generation
  specificAngles?: number[];        // NEW: Generate specific angles only
  batchMode?: boolean;              // NEW: Batch process all 12 angles
}
```

#### Batch Generation Logic
```typescript
async function generate360Renders(params: RenderParams) {
  const angles = SPIN_VIEW_ANGLES.map(v => v.angle);
  const renderPromises = angles.map(angle => 
    generateSingleAngleRender({ ...params, cameraAngle: angle })
  );
  
  // Process in batches of 4 to avoid rate limits
  const batch1 = await Promise.all(renderPromises.slice(0, 4));
  await delay(2000); // Rate limit protection
  const batch2 = await Promise.all(renderPromises.slice(4, 8));
  await delay(2000);
  const batch3 = await Promise.all(renderPromises.slice(8, 12));
  
  return [...batch1, ...batch2, ...batch3];
}
```

#### Camera Angle Prompt Enhancement
```typescript
const getCameraAnglePrompt = (angle: number): string => {
  const viewConfig = SPIN_VIEW_ANGLES.find(v => v.angle === angle);
  
  return `
    CAMERA POSITIONING FOR ${angle}° VIEW:
    - Vehicle rotated ${angle} degrees from front view
    - Camera distance: 12-15 feet from vehicle center
    - Camera height: 5.5 feet (eye level)
    - Target: Vehicle center at door handle height
    - Framing: Vehicle fills 70% of frame
    - Background: Consistent neutral studio environment
    - Lighting: Professional studio setup, consistent across all angles
    
    ${viewConfig?.description || 'Standard view'}
  `;
};
```

### 3.2 New Edge Function: `batch-generate-360-views`

**Purpose**: Dedicated function for bulk 360° generation to avoid blocking main render flow.

```typescript
// supabase/functions/batch-generate-360-views/index.ts
serve(async (req) => {
  const { visualizationId, colorData, vehicleData } = await req.json();
  
  // 1. Generate all 12 angles
  const renders = await generate360Renders({ colorData, vehicleData });
  
  // 2. Upload to storage
  const uploadedUrls = await uploadRendersToStorage(renders, visualizationId);
  
  // 3. Update database with all 12 URLs
  await updateVisualization360Urls(visualizationId, uploadedUrls);
  
  return new Response(JSON.stringify({ success: true, urls: uploadedUrls }));
});
```

---

## 4. React Component: Vehicle360Viewer

### 4.1 Component Structure

**File**: `src/components/visualize/Vehicle360Viewer.tsx`

```typescript
interface Vehicle360ViewerProps {
  images: string[];                    // Array of 12 image URLs in order
  initialAngle?: number;               // Starting angle (default: 0)
  autoRotate?: boolean;                // Auto-spin on load
  rotationSpeed?: number;              // Degrees per second for auto-rotate
  dragSensitivity?: number;            // Pixels to drag for 1° rotation
  showAngleIndicator?: boolean;        // Display current angle
  onAngleChange?: (angle: number) => void;
}

export const Vehicle360Viewer: React.FC<Vehicle360ViewerProps> = ({
  images,
  initialAngle = 0,
  autoRotate = false,
  rotationSpeed = 30,
  dragSensitivity = 3,
  showAngleIndicator = true,
  onAngleChange
}) => {
  const [currentAngle, setCurrentAngle] = useState(initialAngle);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate which image to show based on angle
  const imageIndex = Math.floor((currentAngle % 360) / 30);
  const currentImage = images[imageIndex];
  
  // Mouse/touch drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const angleDelta = deltaX / dragSensitivity;
    
    setCurrentAngle((prev) => (prev + angleDelta + 360) % 360);
    setStartX(clientX);
    onAngleChange?.(currentAngle);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + rotationSpeed / 60 + 360) % 360);
    }, 1000 / 60); // 60 FPS
    
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, rotationSpeed]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <img 
        src={currentImage} 
        alt={`Vehicle at ${currentAngle}°`}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
      
      {showAngleIndicator && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(currentAngle)}°
        </div>
      )}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-4 py-2 rounded-full">
        Drag to rotate • {images.length} views loaded
      </div>
    </div>
  );
};
```

### 4.2 Loading State Component

**File**: `src/components/visualize/Vehicle360LoadingState.tsx`

```typescript
export const Vehicle360LoadingState: React.FC<{ 
  currentView: number; 
  totalViews: number;
  estimatedTimeRemaining: number;
}> = ({ currentView, totalViews, estimatedTimeRemaining }) => {
  const progress = (currentView / totalViews) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Generating 360° View...
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Rendering view {currentView} of {totalViews}
        </p>
        <Progress value={progress} className="w-64" />
        <p className="text-xs text-muted-foreground mt-2">
          ~{estimatedTimeRemaining}s remaining
        </p>
      </div>
    </div>
  );
};
```

---

## 5. Database Schema Updates

### 5.1 Color Visualizations Table

**Update `color_visualizations.render_urls` JSONB structure:**

```json
{
  "hood_detail": "https://...",
  "front": "https://...",
  "side": "https://...",
  "rear": "https://...",
  "top": "https://...",
  
  // NEW: 360 spin view URLs
  "spin_views": {
    "0": "https://...",
    "30": "https://...",
    "60": "https://...",
    "90": "https://...",
    "120": "https://...",
    "150": "https://...",
    "180": "https://...",
    "210": "https://...",
    "240": "https://...",
    "270": "https://...",
    "300": "https://...",
    "330": "https://..."
  },
  
  "has_360_view": true,
  "spin_view_count": 12,
  "spin_generated_at": "2025-01-15T10:30:00Z"
}
```

### 5.2 New Field for Tracking

Add column to track 360 generation status:

```sql
ALTER TABLE color_visualizations 
ADD COLUMN has_360_spin boolean DEFAULT false,
ADD COLUMN spin_view_count integer DEFAULT 0;

CREATE INDEX idx_has_360_spin ON color_visualizations(has_360_spin);
```

---

## 6. UI Integration Strategy

### 6.1 ColorPro™ Integration

**File**: `src/components/productTools/InkFusionToolUI.tsx`

```typescript
const [is360Enabled, setIs360Enabled] = useState(false);
const [is360Loading, setIs360Loading] = useState(false);
const [spinViewUrls, setSpinViewUrls] = useState<string[]>([]);

const handle360Generation = async () => {
  setIs360Loading(true);
  
  try {
    const { data } = await supabase.functions.invoke('batch-generate-360-views', {
      body: {
        visualizationId: currentVisualizationId,
        colorData: selectedColor,
        vehicleData: vehicleDetails
      }
    });
    
    setSpinViewUrls(Object.values(data.urls.spin_views));
    setIs360Enabled(true);
    toast.success('360° view ready! Drag to rotate.');
  } catch (error) {
    toast.error('Failed to generate 360° view');
  } finally {
    setIs360Loading(false);
  }
};

// UI Rendering
{hasRenders && !is360Enabled && (
  <Button 
    onClick={handle360Generation}
    variant="outline"
    disabled={is360Loading}
  >
    {is360Loading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generating 360° View...
      </>
    ) : (
      <>
        <RotateCw className="mr-2 h-4 w-4" />
        Enable 360° Spin View
      </>
    )}
  </Button>
)}

{is360Enabled && (
  <Vehicle360Viewer 
    images={spinViewUrls}
    autoRotate={true}
    showAngleIndicator={true}
  />
)}
```

### 6.2 DesignPanelPro™ Integration

**File**: `src/components/designpanelpro/DesignPanelProToolUI.tsx`

Same pattern as ColorPro, but integrate with `useDesignProLogic` hook:

```typescript
const { generateRender, generate360Views } = useDesignProLogic();

const handle360 = async () => {
  await generate360Views({
    panelId: selectedPanel.id,
    finish: selectedFinish,
    vehicle: vehicleDetails
  });
};
```

### 6.3 PatternPro™ Integration

**File**: `src/components/productTools/WBTYToolUI.tsx`

```typescript
// Same 360 button + viewer pattern
// Uses useWBTYLogic hook for state management
```

### 6.4 ApprovePro™ Integration

**File**: `src/components/tools/modes/ApproveModeComponent.tsx`

```typescript
// 360 generation after design upload + proof generation
// Allows clients to spin and inspect approval renders
```

---

## 7. Custom Hook: use360SpinLogic

**File**: `src/hooks/use360SpinLogic.ts`

Centralized logic for all tools to share:

```typescript
export function use360SpinLogic(toolType: 'colorpro' | 'designpanelpro' | 'patternpro' | 'approvepro') {
  const [is360Enabled, setIs360Enabled] = useState(false);
  const [is360Loading, setIs360Loading] = useState(false);
  const [spinViews, setSpinViews] = useState<string[]>([]);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const generate360 = async (params: Generate360Params) => {
    setIs360Loading(true);
    setGenerationProgress(0);
    
    try {
      // Real-time progress updates via polling
      const pollInterval = setInterval(async () => {
        const { data } = await supabase
          .from('color_visualizations')
          .select('spin_view_count')
          .eq('id', params.visualizationId)
          .single();
        
        setGenerationProgress((data.spin_view_count / 12) * 100);
      }, 2000);
      
      // Invoke batch generation
      const { data, error } = await supabase.functions.invoke('batch-generate-360-views', {
        body: params
      });
      
      clearInterval(pollInterval);
      
      if (error) throw error;
      
      setSpinViews(Object.values(data.urls.spin_views));
      setIs360Enabled(true);
      setGenerationProgress(100);
      
      toast.success('🎉 360° view ready! Drag to rotate.');
    } catch (error) {
      console.error('360 generation failed:', error);
      toast.error('Failed to generate 360° view. Please try again.');
    } finally {
      setIs360Loading(false);
    }
  };
  
  const reset360 = () => {
    setIs360Enabled(false);
    setSpinViews([]);
    setCurrentAngle(0);
    setGenerationProgress(0);
  };
  
  return {
    is360Enabled,
    is360Loading,
    spinViews,
    currentAngle,
    generationProgress,
    generate360,
    reset360,
    setCurrentAngle
  };
}
```

---

## 8. Cost & Performance Analysis

### 8.1 Generation Cost per 360 View

**Current single render cost**: ~$0.15 per view (AI generation)

**360 view cost**: 12 views × $0.15 = **$1.80 per 360 generation**

### 8.2 Storage Cost

**Image size**: ~500KB per render (optimized JPEG)

**12 views**: 500KB × 12 = **6MB per 360 set**

**Supabase storage**: $0.021/GB/month = **~$0.00013/month per 360 set**

### 8.3 Generation Time

**Single view**: ~8-12 seconds

**12 views (batched)**: ~35-45 seconds total with rate limit protection

### 8.4 Optimization Strategies

1. **Progressive Loading**: Load first 4 views, then fetch remaining 8 in background
2. **Lazy 360 Generation**: Only generate when user clicks "Enable 360"
3. **Caching**: Store 360 views permanently for popular color/vehicle combos
4. **Compression**: Use WebP format (50% smaller than JPEG) for 360 views
5. **CDN**: Serve from Supabase CDN for faster load times globally

---

## 9. Pricing Strategy

### 9.1 Tiered Access Model

**Free Tier**:
- Standard 4-view renders (hood_detail, side, rear, top)
- No 360 access

**Advanced Tier** ($39/month):
- 10 × 360 generations per month included
- $2 per additional 360 generation

**Complete Tier** ($99/month):
- Unlimited 360 generations
- Priority render queue

### 9.2 A La Carte

**One-Time 360 Purchase**: $3 per 360 view generation (no subscription)

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Update `generate-color-render` edge function with angle parameters
- ✅ Create `SPIN_VIEW_ANGLES` constant configuration
- ✅ Update database schema for 360 storage
- ✅ Create `batch-generate-360-views` edge function

### Phase 2: React Components (Week 2-3)
- ✅ Build `Vehicle360Viewer` component with drag-to-rotate
- ✅ Create `Vehicle360LoadingState` component
- ✅ Build `use360SpinLogic` custom hook
- ✅ Add unit tests for 360 viewer interactions

### Phase 3: Tool Integration (Week 3-4)
- ✅ Integrate into ColorPro™
- ✅ Integrate into DesignPanelPro™
- ✅ Integrate into PatternPro™
- ✅ Integrate into ApprovePro™

### Phase 4: Admin Tools (Week 4)
- ✅ Add 360 generation to AdminSmartUploader
- ✅ Create admin dashboard for monitoring 360 usage
- ✅ Build 360 regeneration tool for failed generations

### Phase 5: Optimization & Polish (Week 5)
- ✅ Implement progressive loading (4 views first, then 8 more)
- ✅ Add auto-rotate toggle in viewer
- ✅ Optimize image compression (WebP conversion)
- ✅ Add keyboard controls (arrow keys to rotate)

### Phase 6: Launch & Monitor (Week 6)
- ✅ Beta launch to Complete tier users
- ✅ Monitor generation costs and success rates
- ✅ Collect user feedback on drag sensitivity
- ✅ A/B test pricing models

---

## 11. Competitive Analysis

### Zeno vs. RestylePro 360

| Feature | Zeno | RestylePro 360 |
|---------|------|----------------|
| Render Quality | CGI/3D models | Photorealistic AI |
| Angle Count | Unlimited (true 3D) | 12 fixed angles |
| Generation Time | Instant (pre-rendered) | 35-45 seconds |
| Customization | Limited templates | Any color/design/vehicle |
| Cost | $89-299/month | $39-99/month |
| Use Case | Mass-market configurators | Professional wrap shops |

**Key Differentiator**: RestylePro's photorealistic AI renders look like actual wrapped vehicles (real lighting, reflections, environment) vs. Zeno's CGI appearance.

### CarChanger 3D vs. RestylePro 360

| Feature | CarChanger 3D | RestylePro 360 |
|---------|---------------|----------------|
| Platform | Mobile app only | Web + mobile responsive |
| Vehicle Library | 50+ models | Unlimited (user input) |
| Design Library | Pre-made only | Upload ANY design |
| 360 Interaction | Touch-to-spin | Drag-to-spin + auto-rotate |
| Price | $19.99/month | $39-99/month |
| Target User | DIY enthusiasts | Professional installers |

**Key Differentiator**: RestylePro allows ANY vehicle + ANY design vs. CarChanger's limited template library.

---

## 12. Success Metrics

### KPIs to Track

1. **360 Generation Rate**: % of renders that get 360 upgrade
2. **Engagement Time**: Average time users spend interacting with 360 viewer
3. **Conversion Impact**: Subscription upgrade rate after using 360
4. **Generation Success Rate**: % of 360 generations that complete successfully
5. **Cost per 360**: Actual AI generation cost vs. projected $1.80

### Target Goals (Month 1)

- 360 generation rate: >25% of renders
- Average interaction time: >45 seconds per 360 view
- Conversion lift: +15% upgrade rate from Free to Advanced
- Success rate: >95% of 360 generations complete without errors
- Cost per 360: <$2.00

---

## 13. Risk Mitigation

### Technical Risks

**Risk**: AI fails to generate consistent angles across all 12 views
- **Mitigation**: Strict camera positioning prompts, validation checks, auto-retry logic

**Risk**: Rate limiting from AI provider during batch generation
- **Mitigation**: Batching strategy (4 views at a time), exponential backoff

**Risk**: Storage costs exceed projections
- **Mitigation**: Implement image compression (WebP), auto-delete old 360 views after 30 days

### Business Risks

**Risk**: Users don't find value in 360 vs. standard 4-view
- **Mitigation**: A/B test with free trial, collect user feedback, iterate on UX

**Risk**: Generation cost makes feature unprofitable
- **Mitigation**: Usage caps per tier, dynamic pricing based on actual costs

---

## 14. Future Enhancements (Post-Launch)

### V2 Features (3-6 months)

1. **Smart Angle Selection**: AI picks best 8 angles based on design asymmetry
2. **Variable Resolution**: Lower-res thumbnails for drag preview, high-res on stop
3. **Video Export**: Auto-generate 360° rotation video (MP4) for social media
4. **Hotspot Annotations**: Click to highlight specific design elements during spin
5. **Comparison Mode**: Spin two 360 views side-by-side (before/after)

### V3 Features (6-12 months)

1. **True 3D Integration**: Hybrid model using AI renders as textures on 3D mesh
2. **VR/AR Export**: Export 360 views for VR headset or AR mobile preview
3. **Collaborative Viewing**: Share live 360 link with clients for real-time feedback
4. **Zoom + Pan**: Zoom into specific panels while maintaining 360 rotation

---

## 15. Documentation Requirements

### User-Facing Docs

1. **Help Article**: "How to Use 360° Spin View"
2. **Video Tutorial**: 2-minute demo of drag-to-rotate interaction
3. **FAQ Section**: Common questions about generation time, costs, limitations

### Developer Docs

1. **API Reference**: `batch-generate-360-views` endpoint documentation
2. **Component Library**: `Vehicle360Viewer` props and usage examples
3. **Integration Guide**: Step-by-step for adding 360 to new tools

---

## 16. Launch Checklist

### Pre-Launch
- [ ] All edge functions deployed and tested
- [ ] React components built and unit tested
- [ ] Database migrations applied to production
- [ ] Storage buckets configured with proper CORS
- [ ] Pricing tiers configured in Stripe
- [ ] Admin monitoring dashboard live
- [ ] Error logging and alerts configured

### Launch Day
- [ ] Feature flag enabled for Complete tier users
- [ ] Announcement blog post published
- [ ] Email campaign sent to existing subscribers
- [ ] Social media teasers posted
- [ ] Customer support trained on new feature

### Post-Launch (Week 1)
- [ ] Monitor error rates and generation success
- [ ] Collect user feedback via in-app survey
- [ ] Review cost per 360 vs. projections
- [ ] Analyze engagement metrics (interaction time)
- [ ] Iterate on drag sensitivity based on feedback

---

## Conclusion

The Image-Based 360 Vehicle Spin Viewer positions RestylePro Design Suite™ as a direct competitor to Zeno and CarChanger 3D while maintaining our photorealistic quality advantage. With 12 AI-generated angles and drag-to-rotate interaction, we deliver an industry-leading visualization experience that professional wrap shops demand.

**Estimated Development Time**: 6 weeks (foundation to launch)

**Estimated Cost**: $1.80 per 360 generation + ~$0.00013/month storage

**Projected ROI**: 15% conversion lift from Free to Advanced tier = $5,850/month additional MRR (150 users × $39 upgrade)

**Competitive Moat**: Photorealistic AI quality + unlimited vehicle/design combinations vs. competitors' template-based CGI models.

---

**Next Steps**: Approve this plan → Begin Phase 1 implementation → Weekly progress reviews → Beta launch in 6 weeks.
