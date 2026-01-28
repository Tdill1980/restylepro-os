import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";

interface WBTYPatternUploaderProps {
  onPatternUploaded: (pattern: any) => void;
}

export const WBTYPatternUploader = ({ onPatternUploaded }: WBTYPatternUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPattern, setUploadedPattern] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user for custom path
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `wbty-custom/${userId}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patterns')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patterns')
        .getPublicUrl(filePath);

      // Save to database
      const { data: patternData, error: dbError } = await supabase
        .from('wbty_products')
        .insert({
          name: file.name.replace(/\.[^/.]+$/, ""),
          category: 'Custom',
          media_url: publicUrl,
          media_type: 'image',
          price: 95.50,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedPattern(patternData);
      onPatternUploaded(patternData);

      toast({
        title: "Pattern uploaded successfully",
        description: `"${patternData.name}" is ready to use`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="wbty-upload" className="text-lg font-semibold">
            Upload Custom Wrap Pattern
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Upload tileable wrap pattern • 60" width • High resolution recommended
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <Input
            id="wbty-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Label
            htmlFor="wbty-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload pattern</span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, or WEBP (max 20MB)
                </span>
              </>
            )}
          </Label>
        </div>

        {uploadedPattern && (
          <Card className="p-4 bg-secondary/50">
            <p className="text-sm font-medium">
              Uploaded: <span className="text-primary">{uploadedPattern.name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Price per yard: ${uploadedPattern.price}
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
};
