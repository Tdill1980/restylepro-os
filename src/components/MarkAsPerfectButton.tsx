import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MarkAsPerfectButtonProps {
  promptSignature: string;
  vehicleSignature: string;
  renderUrls: Record<string, string>;
  sourceVisualizationId?: string;
  className?: string;
}

export const MarkAsPerfectButton = ({
  promptSignature,
  vehicleSignature,
  renderUrls,
  sourceVisualizationId,
  className
}: MarkAsPerfectButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleMarkAsPerfect = async () => {
    if (!promptSignature || !vehicleSignature || Object.keys(renderUrls).length === 0) {
      toast({
        title: "Cannot Save",
        description: "Missing required render data.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if source_visualization_id exists before including it
      let validSourceId: string | null = null;
      
      if (sourceVisualizationId && sourceVisualizationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: vizExists } = await supabase
          .from('color_visualizations')
          .select('id')
          .eq('id', sourceVisualizationId)
          .maybeSingle();
        
        if (vizExists) {
          validSourceId = sourceVisualizationId;
        }
      }
      
      const { error } = await supabase
        .from('render_templates')
        .upsert({
          prompt_signature: promptSignature.toLowerCase().trim(),
          vehicle_signature: vehicleSignature,
          source_visualization_id: validSourceId,
          render_urls: renderUrls,
          is_golden_template: true,
          rating: 5,
          created_by: user?.email || null,
        }, {
          onConflict: 'prompt_signature,vehicle_signature'
        });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "⭐ Saved as Perfect!",
        description: "This render will be reused for identical future requests.",
      });
    } catch (error) {
      console.error('Error saving golden template:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save as perfect template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={`gap-2 bg-yellow-500/10 border-yellow-500/30 text-yellow-500 ${className}`}
      >
        <Star className="h-4 w-4 fill-yellow-500" />
        Saved as Perfect
      </Button>
    );
  }

  return (
    <Button
      onClick={handleMarkAsPerfect}
      disabled={isSaving}
      variant="outline"
      size="sm"
      className={`gap-2 hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:text-yellow-500 ${className}`}
    >
      <Star className="h-4 w-4" />
      {isSaving ? "Saving..." : "Mark as Perfect"}
    </Button>
  );
};
