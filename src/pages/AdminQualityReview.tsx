import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Flag, Mail, Calendar, CheckCircle, XCircle, Image, Loader2, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

interface VinylSwatch {
  id: string;
  manufacturer: string;
  name: string;
  code: string | null;
  hex: string;
  finish: string;
  has_reference_bundle: boolean;
  is_flip_film: boolean;
  needs_reference_review: boolean;
  reference_image_count: number | null;
}

interface ReferenceImage {
  id: string;
  swatch_id: string;
  image_url: string;
  image_type: string;
  is_verified: boolean;
}

interface VehicleRender {
  id: string;
  render_url: string;
  quality_verified: boolean;
  is_canonical_demo: boolean;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  color_data: any;
}

export default function AdminQualityReview() {
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<VinylSwatch | null>(null);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState<{ processed: number; total: number } | null>(null);

  // Existing render ratings queries
  const { data: flaggedRenders, isLoading: loadingFlagged } = useQuery({
    queryKey: ['flagged-renders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('render_quality_ratings')
        .select('*')
        .eq('is_flagged', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: allRatings, isLoading: loadingRatings } = useQuery({
    queryKey: ['all-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('render_quality_ratings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  // Color QA queries
  const { data: colorsNeedingReview, isLoading: loadingColors } = useQuery({
    queryKey: ['colors-needing-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vinyl_swatches')
        .select('id, manufacturer, name, code, hex, finish, has_reference_bundle, is_flip_film, needs_reference_review, reference_image_count')
        .eq('verified', true)
        .order('is_flip_film', { ascending: false }) // Flip films first
        .order('manufacturer', { ascending: true })
        .limit(200);
      
      if (error) throw error;
      return data as VinylSwatch[];
    },
  });

  const { data: referenceStats } = useQuery({
    queryKey: ['reference-stats'],
    queryFn: async () => {
      const { count: totalColors } = await supabase
        .from('vinyl_swatches')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      const { count: withReferences } = await supabase
        .from('vinyl_swatches')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true)
        .eq('has_reference_bundle', true);

      const { count: flipFilms } = await supabase
        .from('vinyl_swatches')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true)
        .eq('is_flip_film', true);

      const { count: verifiedRenders } = await supabase
        .from('vehicle_renders')
        .select('*', { count: 'exact', head: true })
        .eq('quality_verified', true);

      const { count: totalReferenceImages } = await supabase
        .from('vinyl_reference_images')
        .select('*', { count: 'exact', head: true });

      return {
        totalColors: totalColors || 0,
        withReferences: withReferences || 0,
        flipFilms: flipFilms || 0,
        verifiedRenders: verifiedRenders || 0,
        totalReferenceImages: totalReferenceImages || 0
      };
    },
  });

  // Fetch reference images for selected color
  const { data: selectedColorRefs, isLoading: loadingRefs } = useQuery({
    queryKey: ['color-references', selectedColor?.id],
    queryFn: async () => {
      if (!selectedColor) return [];
      const { data, error } = await supabase
        .from('vinyl_reference_images')
        .select('*')
        .eq('swatch_id', selectedColor.id);
      
      if (error) throw error;
      return data as ReferenceImage[];
    },
    enabled: !!selectedColor,
  });

  // Fetch renders for selected color
  const { data: selectedColorRenders, isLoading: loadingSelectedRenders } = useQuery({
    queryKey: ['color-renders', selectedColor?.id],
    queryFn: async () => {
      if (!selectedColor) return [];
      const { data, error } = await supabase
        .from('vehicle_renders')
        .select('*')
        .contains('color_data', { swatchId: selectedColor.id });
      
      if (error) throw error;
      return data as VehicleRender[];
    },
    enabled: !!selectedColor,
  });

  // Mutation to verify a render
  const verifyRenderMutation = useMutation({
    mutationFn: async ({ renderId, verified }: { renderId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('vehicle_renders')
        .update({ quality_verified: verified })
        .eq('id', renderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-renders'] });
      queryClient.invalidateQueries({ queryKey: ['reference-stats'] });
      toast.success('Render verification updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  // Run backfill batch
  const runBackfillBatch = async () => {
    setBackfillLoading(true);
    setBackfillProgress({ processed: 0, total: referenceStats?.totalColors || 400 });
    
    try {
      let offset = 0;
      const batchSize = 10;
      let totalProcessed = 0;
      
      while (true) {
        const response = await supabase.functions.invoke('backfill-vinyl-references', {
          body: { batchSize, startFrom: offset }
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        const data = response.data;
        totalProcessed += data.stats?.processed || 0;
        setBackfillProgress({ processed: totalProcessed, total: referenceStats?.totalColors || 400 });
        
        if (data.stats?.remainingColors === 0 || data.stats?.processed === 0) {
          break;
        }
        
        offset += batchSize;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success(`Backfill complete! Processed ${totalProcessed} colors`);
      queryClient.invalidateQueries({ queryKey: ['colors-needing-review'] });
      queryClient.invalidateQueries({ queryKey: ['reference-stats'] });
    } catch (error) {
      toast.error(`Backfill failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBackfillLoading(false);
      setBackfillProgress(null);
    }
  };

  const averageRating = allRatings?.filter(r => r.rating).reduce((acc, r) => acc + (r.rating || 0), 0) / (allRatings?.filter(r => r.rating).length || 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Render Quality Review</h1>
        <p className="text-muted-foreground">Monitor render quality, reference images, and address flagged issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{referenceStats?.totalColors || 0}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">With References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{referenceStats?.withReferences || 0}</span>
              <span className="text-muted-foreground text-sm">
                ({referenceStats?.totalColors ? Math.round((referenceStats.withReferences / referenceStats.totalColors) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reference Images</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{referenceStats?.totalReferenceImages || 0}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Flip Films</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{referenceStats?.flipFilms || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verified Renders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{referenceStats?.verifiedRenders || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="color-qa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="color-qa">Color QA</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Issues ({flaggedRenders?.length || 0})</TabsTrigger>
          <TabsTrigger value="all">All Ratings</TabsTrigger>
        </TabsList>

        {/* Color QA Tab */}
        <TabsContent value="color-qa" className="space-y-4">
          {/* Backfill Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reference Image Backfill</CardTitle>
              <CardDescription>
                Populate reference images for all colors from web search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={runBackfillBatch} 
                  disabled={backfillLoading}
                  className="gap-2"
                >
                  {backfillLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Run Full Backfill
                    </>
                  )}
                </Button>
                {backfillProgress && (
                  <div className="text-sm text-muted-foreground">
                    Progress: {backfillProgress.processed} / {backfillProgress.total} colors
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Color List */}
            <Card className="max-h-[600px] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Colors</CardTitle>
                <CardDescription>
                  Click a color to view references vs renders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingColors ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading colors...
                  </div>
                ) : colorsNeedingReview?.length ? (
                  colorsNeedingReview.map((color) => (
                    <div
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedColor?.id === color.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <div className="font-medium text-sm">{color.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {color.manufacturer} {color.code && `• ${color.code}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {color.is_flip_film && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Flip
                            </Badge>
                          )}
                          {color.has_reference_bundle ? (
                            <Badge variant="secondary" className="gap-1">
                              <Image className="h-3 w-3" />
                              {color.reference_image_count || 0}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              No refs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No colors found</p>
                )}
              </CardContent>
            </Card>

            {/* Reference vs Render Comparison */}
            <Card className="max-h-[600px] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedColor ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      {selectedColor.manufacturer} {selectedColor.name}
                    </div>
                  ) : 'Select a Color'}
                </CardTitle>
                {selectedColor && (
                  <CardDescription>
                    {selectedColor.finish} • {selectedColor.code || 'No code'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedColor ? (
                  <p className="text-muted-foreground text-center py-8">
                    Select a color from the list to view comparison
                  </p>
                ) : (
                  <>
                    {/* Reference Images */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Reference Images ({selectedColorRefs?.length || 0})
                      </h4>
                      {loadingRefs ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : selectedColorRefs?.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedColorRefs.map((ref) => (
                            <div key={ref.id} className="relative group">
                              <img 
                                src={ref.image_url} 
                                alt={`Reference for ${selectedColor.name}`}
                                className="w-full h-24 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <Badge 
                                variant="secondary" 
                                className="absolute bottom-1 left-1 text-xs"
                              >
                                {ref.image_type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm flex items-center gap-2 p-4 border rounded bg-muted/50">
                          <AlertTriangle className="h-4 w-4" />
                          No reference images found
                        </div>
                      )}
                    </div>

                    {/* Generated Renders */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Generated Renders ({selectedColorRenders?.length || 0})
                      </h4>
                      {loadingSelectedRenders ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : selectedColorRenders?.length ? (
                        <div className="space-y-2">
                          {selectedColorRenders.map((render) => (
                            <div key={render.id} className="border rounded p-2">
                              <img 
                                src={render.render_url} 
                                alt={`Render for ${selectedColor.name}`}
                                className="w-full h-32 object-cover rounded mb-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {render.vehicle_year} {render.vehicle_make} {render.vehicle_model}
                                </div>
                                <div className="flex items-center gap-2">
                                  {render.is_canonical_demo && (
                                    <Badge variant="outline" className="text-xs">Demo</Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant={render.quality_verified ? "default" : "outline"}
                                    className="h-7 gap-1"
                                    onClick={() => verifyRenderMutation.mutate({ 
                                      renderId: render.id, 
                                      verified: !render.quality_verified 
                                    })}
                                  >
                                    {render.quality_verified ? (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="h-3 w-3" />
                                        Verify
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm flex items-center gap-2 p-4 border rounded bg-muted/50">
                          <AlertTriangle className="h-4 w-4" />
                          No renders found for this color
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flagged Issues Tab */}
        <TabsContent value="flagged" className="space-y-4">
          {loadingFlagged ? (
            <p>Loading flagged renders...</p>
          ) : flaggedRenders && flaggedRenders.length > 0 ? (
            flaggedRenders.map((rating) => (
              <Card key={rating.id} className="border-destructive">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Flag className="h-5 w-5 text-destructive" />
                        {rating.render_type.toUpperCase()} Render Issue
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {rating.user_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {rating.user_email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Flagged</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-medium text-sm">Reason:</p>
                    <p className="text-muted-foreground">{rating.flag_reason}</p>
                  </div>
                  {rating.notes && (
                    <div>
                      <p className="font-medium text-sm">Additional Notes:</p>
                      <p className="text-muted-foreground">{rating.notes}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Render ID: {rating.render_id}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No flagged renders found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Ratings Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{averageRating?.toFixed(1) || 'N/A'}</span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
            </CardContent>
          </Card>

          {loadingRatings ? (
            <p>Loading ratings...</p>
          ) : allRatings && allRatings.length > 0 ? (
            allRatings.map((rating) => (
              <Card key={rating.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {rating.render_type.toUpperCase()} Render
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {rating.user_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {rating.user_email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {rating.is_flagged ? (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      ) : rating.rating && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {rating.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rating.is_flagged && rating.flag_reason && (
                    <div>
                      <p className="font-medium text-sm">Reason:</p>
                      <p className="text-muted-foreground">{rating.flag_reason}</p>
                    </div>
                  )}
                  {rating.notes && (
                    <div>
                      <p className="font-medium text-sm">Notes:</p>
                      <p className="text-muted-foreground">{rating.notes}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Render ID: {rating.render_id}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No ratings found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
