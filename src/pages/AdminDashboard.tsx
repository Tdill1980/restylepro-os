import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Layers, Package, CheckCircle, Video, Image, ArrowRight, Grid3x3, Star, Wand2, Download, Trash2, AlertTriangle } from "lucide-react";
import { generatePrintProPoster } from "@/lib/printpro-poster-generator";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<any>(null);

  // Fetch cleanup stats
  const { data: cleanupStatsData, refetch: refetchStats } = useQuery({
    queryKey: ["cleanup-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const response = await supabase.functions.invoke('cleanup-renders', {
        body: { action: 'stats' }
      });
      
      if (response.error) throw response.error;
      return response.data?.stats || null;
    },
    refetchOnWindowFocus: false,
  });

  const handleCleanDatabase = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL broken renders?\n\nThis will permanently delete:\n- Records with "custom" or "unknown" labels\n- Records with pipe "|" characters\n- All GraphicsPro/CustomStyling mode renders\n\nThis action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setCleanupLoading(true);
    toast.loading("Cleaning database...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.dismiss();
        toast.error("Not authenticated");
        return;
      }
      
      const response = await supabase.functions.invoke('cleanup-renders', {
        body: { action: 'clean' }
      });
      
      toast.dismiss();
      
      if (response.error) {
        toast.error(`Cleanup failed: ${response.error.message}`);
        return;
      }
      
      const results = response.data?.results;
      toast.success(
        `Database cleaned! Deleted ${results?.vehicle_renders || 0} vehicle renders and ${results?.color_visualizations || 0} visualizations.`
      );
      
      // Refetch stats
      refetchStats();
      // Invalidate gallery queries
      queryClient.invalidateQueries();
      
    } catch (error) {
      toast.dismiss();
      toast.error("Cleanup failed");
      console.error(error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleDownloadCatalog = async () => {
    toast.loading("Generating PrintPro Color Catalog PDF...");
    try {
      await generatePrintProPoster();
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
      console.error(error);
    }
  };

  // Fetch counts for each content type
  const { data: inkfusionCount } = useQuery({
    queryKey: ["inkfusion-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("inkfusion_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: swatchCount } = useQuery({
    queryKey: ["swatch-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("inkfusion_swatches")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: fadewrapsCount } = useQuery({
    queryKey: ["fadewraps-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("fadewraps_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: patternsCount } = useQuery({
    queryKey: ["patterns-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("fadewraps_patterns")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: wbtyCount } = useQuery({
    queryKey: ["wbty-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("wbty_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: productsCount } = useQuery({
    queryKey: ["products-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("wbty_products")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: approveModeCount } = useQuery({
    queryKey: ["approvemode-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("approvemode_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: examplesCount } = useQuery({
    queryKey: ["examples-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("approvemode_examples")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: designPanelProCount } = useQuery({
    queryKey: ["designpanelpro-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("designpanelpro_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: panelPatternsCount } = useQuery({
    queryKey: ["panel-patterns-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("designpanelpro_patterns")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: vinylSwatchCount } = useQuery({
    queryKey: ["vinyl-swatch-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("vinyl_swatches")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: heroCarouselCount } = useQuery({
    queryKey: ["hero-carousel-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("hero_carousel")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: showcaseCount } = useQuery({
    queryKey: ["showcase-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("homepage_showcase")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: featuredHeroCount } = useQuery({
    queryKey: ["featured-hero-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("color_visualizations")
        .select("*", { count: "exact", head: true })
        .eq("is_featured_hero", true);
      return count || 0;
    },
  });

  const contentSections = [
    {
      id: "landing",
      title: "Landing Page",
      description: "Homepage / carousel",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      items: [
        { label: "Hero Carousel Images", count: heroCarouselCount, action: () => navigate("/admin/hero-carousel") },
        { label: "Hero Render Picker", count: featuredHeroCount, action: () => navigate("/admin/hero-render-picker") },
        { label: "Showcase Gallery", count: showcaseCount, action: () => navigate("/admin/showcase-manager") },
      ],
    },
    {
      id: "colorpro",
      title: "ColorPro™",
      description: "AI Swatch Generator",
      icon: Palette,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      items: [
        { label: "Generate AI Swatches", count: swatchCount, action: () => navigate("/admin/colorpro-manager") },
        { label: "Vinyl Swatch QA Dashboard", count: vinylSwatchCount, action: () => navigate("/admin/swatch-qa") },
        { label: "LAB Extraction Monitor", count: vinylSwatchCount, action: () => navigate("/admin/lab-monitor") },
      ],
    },
    {
      id: "inkfusion",
      title: "InkFusion",
      description: "Appears on /inkfusion page",
      icon: Palette,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      items: [
        { label: "Hero Carousel Images", count: inkfusionCount, action: () => navigate("/admin/carousel?product=inkfusion") },
        { label: "Color Swatches", count: swatchCount, action: () => navigate("/admin/inkfusion-manager") },
      ],
    },
    {
      id: "fadewraps",
      title: "FadeWraps",
      description: "Appears on /fadewraps page",
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      items: [
        { label: "Hero Carousel Images", count: fadewrapsCount, action: () => navigate("/admin/carousel?product=fadewraps") },
        { label: "Pattern Library", count: patternsCount, action: () => navigate("/admin/fadewraps-manager") },
      ],
    },
    {
      id: "wbty",
      title: "PatternPro™",
      description: "Appears on /wbty page",
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      items: [
        { label: "Hero Carousel Images", count: wbtyCount, action: () => navigate("/admin/carousel?product=wbty") },
        { label: "Products", count: productsCount, action: () => navigate("/admin/wbty-manager") },
      ],
    },
    {
      id: "designpanelpro",
      title: "DesignPanelPro™",
      description: "Appears on /designpanelpro page",
      icon: Grid3x3,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      items: [
        { label: "Hero Carousel Images", count: designPanelProCount, action: () => navigate("/admin/carousel?product=designpanelpro") },
        { label: "Pattern Library", count: panelPatternsCount, action: () => navigate("/admin/designpanelpro-manager") },
      ],
    },
    {
      id: "approvemode",
      title: "ApprovePro™",
      description: "Appears on /approvemode page",
      icon: CheckCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      items: [
        { label: "Hero Carousel Images", count: approveModeCount, action: () => navigate("/admin/carousel?product=approvemode") },
        { label: "Before/After Examples", count: examplesCount, action: () => navigate("/admin/carousel?product=approvemode") },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all content across your website</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-3 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.count !== undefined ? `${item.count} items` : "Loading..."}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={item.action}
                          className="hover:bg-background"
                        >
                          Manage
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-pink-500/10">
                    <Image className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle>Homepage Showcase</CardTitle>
                    <CardDescription>Manage the featured wrap images on homepage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/showcase-manager")} variant="outline">
                  Manage Showcase
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <Video className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle>Video Management</CardTitle>
                    <CardDescription>Manage hero videos for all products</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/carousel")} variant="outline">
                  Manage Videos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Image className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Gallery Management</CardTitle>
                    <CardDescription>Manage and delete gallery carousel items</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/gallery-manager")} variant="outline">
                  Advanced Gallery Manager
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle>Quality Review</CardTitle>
                    <CardDescription>Monitor render quality ratings and flagged issues</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/quality-review")} variant="outline">
                  Review Quality
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Wand2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>AI Auto-Fix</CardTitle>
                    <CardDescription>Automatically analyze and fix quality issues with AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/ai-auto-fix")} variant="outline">
                  Run AI Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-[#D946EF] to-[#9b87f5]">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>PrintPro™ Color Catalog</CardTitle>
                    <CardDescription>Download branded PDF with Pantone colors, InkFusion swatches & renders</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDownloadCatalog} 
                  className="bg-gradient-to-r from-[#D946EF] to-[#9b87f5] hover:opacity-90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Color Catalog PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone - Database Cleanup */}
          <div className="mt-8">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-destructive/20">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Clean up broken renders and invalid database entries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">This will permanently delete:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Records with "custom" or "unknown" color labels</li>
                    <li>Records with pipe "|" characters in names</li>
                    <li>All GraphicsPro/CustomStyling mode renders</li>
                  </ul>
                  {cleanupStatsData && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm font-medium mb-2">Current problematic records:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-background">
                          <span className="font-medium">vehicle_renders:</span> {cleanupStatsData.vehicle_renders?.total || 0}
                        </div>
                        <div className="p-2 rounded bg-background">
                          <span className="font-medium">color_visualizations:</span> {cleanupStatsData.color_visualizations?.total || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleCleanDatabase}
                  disabled={cleanupLoading}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {cleanupLoading ? "Cleaning..." : "Clean Database"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
