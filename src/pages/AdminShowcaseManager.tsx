import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const AdminShowcaseManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const { data: showcaseImages, isLoading } = useQuery({
    queryKey: ["homepage_showcase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_showcase")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !imageName || !imageTitle) {
        throw new Error("Missing required fields");
      }

      const fileName = `showcase-${Date.now()}-${uploadFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("carousel-images")
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("carousel-images")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("homepage_showcase")
        .insert({
          name: imageName,
          title: imageTitle,
          image_url: publicUrl,
          alt_text: `${imageTitle} showcase image`,
          sort_order: sortOrder,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage_showcase"] });
      toast({ title: "Success", description: "Showcase image uploaded successfully" });
      setUploadFile(null);
      setImageName("");
      setImageTitle("");
      setSortOrder(0);
    },
    onError: (error: any) => {
      toast({ 
        title: "Upload Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_showcase")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage_showcase"] });
      toast({ title: "Deleted", description: "Showcase image removed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Delete Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Homepage Showcase Manager</h1>
          <p className="text-muted-foreground">
            Manage the showcase images displayed in the "Explore Your Wrap in Hyper-Realistic 3D" section
          </p>
        </div>

        {/* Upload Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Showcase Image</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="image">Image File</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div>
              <Label htmlFor="name">Name (Internal)</Label>
              <Input
                id="name"
                placeholder="stellar-blue"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="title">Display Title</Label>
              <Input
                id="title"
                placeholder="Stellar Blue"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sort">Sort Order</Label>
              <Input
                id="sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>

            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!uploadFile || !imageName || !imageTitle || uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Showcase Image"}
            </Button>
          </div>
        </Card>

        {/* Existing Images */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Showcase Images</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : showcaseImages && showcaseImages.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {showcaseImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <img 
                    src={image.image_url} 
                    alt={image.alt_text}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{image.title}</h3>
                        <p className="text-sm text-muted-foreground">{image.name}</p>
                        <p className="text-xs text-muted-foreground">Sort: {image.sort_order}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(image.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No showcase images yet. Upload your first one above.
            </p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminShowcaseManager;
