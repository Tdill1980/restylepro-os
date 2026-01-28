import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

interface SharedDesign {
  id: string;
  name: string;
  vehicle: string;
  finish: string;
  heroUrl: string | null;
  createdAt: string;
  type: string;
}

const ShareDesign = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [design, setDesign] = useState<SharedDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadDesign();
  }, [type, id]);

  const loadDesign = async () => {
    if (!type || !id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      let data: any = null;

      if (type === 'panel') {
        const result = await supabase
          .from('panel_designs')
          .select('*')
          .eq('id', id)
          .single();
        if (result.data) {
          const promptState = result.data.prompt_state as Record<string, unknown> | null;
          data = {
            id: result.data.id,
            name: (promptState?.panelName as string) || 'DesignPanelPro Design',
            vehicle: `${result.data.vehicle_year || ''} ${result.data.vehicle_make || ''} ${result.data.vehicle_model || ''}`.trim(),
            finish: result.data.finish || 'Gloss',
            heroUrl: (promptState?.heroUrl as string) || result.data.preview_image_url,
            createdAt: result.data.created_at,
            type: 'DesignPanelPro™',
          };
        }
      } else if (type === 'pattern') {
        const result = await supabase
          .from('pattern_designs')
          .select('*')
          .eq('id', id)
          .single();
        if (result.data) {
          const textureProfile = result.data.texture_profile as Record<string, unknown> | null;
          data = {
            id: result.data.id,
            name: result.data.pattern_name || 'PatternPro Design',
            vehicle: `${result.data.vehicle_year || ''} ${result.data.vehicle_make || ''} ${result.data.vehicle_model || ''}`.trim(),
            finish: result.data.finish || 'Gloss',
            heroUrl: (textureProfile?.heroUrl as string) || result.data.preview_image_url,
            createdAt: result.data.created_at,
            type: 'PatternPro™',
          };
        }
      } else if (type === 'fadewrap') {
        const result = await supabase
          .from('fadewrap_designs')
          .select('*')
          .eq('id', id)
          .single();
        if (result.data) {
          const gradientSettings = result.data.gradient_settings as Record<string, unknown> | null;
          data = {
            id: result.data.id,
            name: result.data.fade_name || 'FadeWrap Design',
            vehicle: `${result.data.vehicle_year || ''} ${result.data.vehicle_make || ''} ${result.data.vehicle_model || ''}`.trim(),
            finish: result.data.finish || 'Gloss',
            heroUrl: (gradientSettings?.heroUrl as string) || result.data.preview_image_url,
            createdAt: result.data.created_at,
            type: 'FadeWrap™',
          };
        }
      }

      if (data) {
        setDesign(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load shared design:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !design) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Design Not Found</h1>
          <p className="text-muted-foreground">This design may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Design Preview */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {design.heroUrl ? (
            <img
              src={design.heroUrl}
              alt={design.name}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No preview available</span>
            </div>
          )}
          
          <div className="p-6 space-y-4">
            {/* Type Badge */}
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#D946EF] to-[#9b87f5] text-white rounded-full text-sm font-medium">
              {design.type}
            </span>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">{design.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{design.vehicle || 'Vehicle not specified'}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Finish: {design.finish}</span>
              <span>•</span>
              <span>Created: {new Date(design.createdAt).toLocaleDateString()}</span>
            </div>
            
            {/* Branding */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Generated with{' '}
                <span className="font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  RestylePro Visualizer Suite™
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDesign;
