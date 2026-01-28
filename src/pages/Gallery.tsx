import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { Maximize2, Download, Eye, ExternalLink, Rotate3D, ChevronLeft, ChevronRight, Check, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { Gallery360Badge } from "@/components/gallery/Gallery360Badge";
import { Gallery360PreviewStrip } from "@/components/gallery/Gallery360PreviewStrip";
import { Gallery360GenerateModal } from "@/components/gallery/Gallery360GenerateModal";
import { Gallery360ViewerModal } from "@/components/gallery/Gallery360ViewerModal";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MarkAsPerfectButton } from "@/components/MarkAsPerfectButton";

type ProductType = 'all' | 'colorpro' | 'wbty' | 'approvemode' | 'fadewraps' | 'designpanelpro';
type WBTYCategory = 'all' | 'Metal & Marble' | 'Wicked & Wild' | 'Camo & Carbon' | 'Bape Camo' | 'Modern & Trippy';
type SortOption = 'newest' | 'oldest' | 'vehicle-asc' | 'vehicle-desc' | 'pattern-asc' | 'pattern-desc';

interface GalleryItem {
  id: string;
  media_url: string;
  before_url?: string;
  title: string;
  subtitle: string;
  vehicle_name?: string;
  color_name?: string;
  pattern_name?: string;
  category?: string;
  product_type: string;
  created_at: string;
  // 360° Spin data
  has_360_spin?: boolean;
  spin_view_count?: number;
  render_urls?: Record<string, any>;
  // Vehicle/color data for 360° generation
  vehicle_year?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_type?: string;
  color_hex?: string;
  finish_type?: string;
  manufacturer?: string;
  mode_type?: string;
}

interface GroupedGalleryItem {
  groupKey: string;
  items: GalleryItem[];
  primaryItem: GalleryItem;
}

export default function Gallery() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('all');
  const [selectedFinish, setSelectedFinish] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<WBTYCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [fullscreenImage, setFullscreenImage] = useState<GalleryItem | null>(null);
  const [swatchModal, setSwatchModal] = useState<{ isOpen: boolean; item: GalleryItem | null }>({ isOpen: false, item: null });
  const [swatchImageUrl, setSwatchImageUrl] = useState<string | null>(null);
  const [generate360Modal, setGenerate360Modal] = useState<{ isOpen: boolean; item: GalleryItem | null }>({ isOpen: false, item: null });
  const [view360Modal, setView360Modal] = useState<{ isOpen: boolean; item: GalleryItem | null }>({ isOpen: false, item: null });
  const [selectedViewUrl, setSelectedViewUrl] = useState<string | null>(null);
  const [groupViewIndex, setGroupViewIndex] = useState<Record<string, number>>({});
  const [isPrivilegedUser, setIsPrivilegedUser] = useState(false);

  // Check if current user is admin or tester
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'tester']);
      
      setIsPrivilegedUser(roles && roles.length > 0);
    };
    checkUserRole();
  }, []);

  const getProductRoute = (productType: string) => {
    const routes: Record<string, string> = {
      'colorpro': '/colorpro',
      'ColorPro': '/colorpro',
      'inkfusion': '/colorpro',
      'fadewraps': '/fadewraps',
      'wbty': '/wbty',
      'designpanelpro': '/designpanelpro',
      'approvemode': '/approvemode'
    };
    return routes[productType] || '/';
  };

  const getProductName = (productType: string) => {
    const names: Record<string, string> = {
      'colorpro': 'ColorPro™',
      'ColorPro': 'ColorPro™',
      'inkfusion': 'ColorPro™',
      'fadewraps': 'FadeWraps™',
      'wbty': 'PatternPro™',
      'designpanelpro': 'DesignPanelPro™',
      'approvemode': 'ApprovePro™'
    };
    return names[productType] || 'Product';
  };

  // Fetch all carousel items AND all past generated renders
  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ['gallery-items'],
    staleTime: 0, // Always refetch for fresh data
    refetchOnMount: 'always',
    queryFn: async () => {
      const allItems: GalleryItem[] = [];

      // Fetch InkFusion carousel
      const { data: inkfusionData } = await supabase
        .from('inkfusion_carousel')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (inkfusionData) {
        allItems.push(...inkfusionData.map(item => ({
          id: item.id,
          media_url: item.media_url,
          title: item.title || item.color_name || 'Untitled',
          subtitle: item.subtitle || '',
          vehicle_name: item.vehicle_name || '',
          color_name: item.color_name || '',
          pattern_name: '',
          category: '',
          product_type: 'inkfusion',
          created_at: item.created_at || ''
        })));
      }

      // Fetch ALL wbty_products ONCE for category lookup (performance optimization)
      const { data: wbtyProducts } = await supabase
        .from('wbty_products')
        .select('name, category');
      
      const wbtyProductsMap = new Map(
        wbtyProducts?.map(p => [p.name, p.category]) || []
      );

      // Fetch WBTY carousel
      const { data: wbtyData } = await supabase
        .from('wbty_carousel')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (wbtyData) {
        allItems.push(...wbtyData.map(item => ({
          id: item.id,
          media_url: item.media_url,
          title: item.title || item.pattern_name || 'Untitled',
          subtitle: item.subtitle || '',
          vehicle_name: item.vehicle_name || '',
          color_name: '',
          pattern_name: item.pattern_name || '',
          category: item.pattern_name ? (wbtyProductsMap.get(item.pattern_name) || '') : '',
          product_type: 'wbty',
          created_at: item.created_at || ''
        })));
      }

      // Fetch ApproveMode carousel
      const { data: approvemodeData } = await supabase
        .from('approvemode_carousel')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (approvemodeData) {
        allItems.push(...approvemodeData.map(item => ({
          id: item.id,
          media_url: item.media_url,
          before_url: item.before_url || undefined,
          title: item.title || item.color_name || 'Untitled',
          subtitle: item.subtitle || '',
          vehicle_name: item.vehicle_name || '',
          color_name: item.color_name || '',
          pattern_name: '',
          category: '',
          product_type: 'approvemode',
          created_at: item.created_at || ''
        })));
      }

      // Fetch FadeWraps carousel
      const { data: fadewrapsData } = await supabase
        .from('fadewraps_carousel')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fadewrapsData) {
        allItems.push(...fadewrapsData.map(item => ({
          id: item.id,
          media_url: item.media_url,
          title: item.title || item.pattern_name || 'Untitled',
          subtitle: item.subtitle || '',
          vehicle_name: item.vehicle_name || '',
          color_name: '',
          pattern_name: item.pattern_name || '',
          category: '',
          product_type: 'fadewraps',
          created_at: item.created_at || ''
        })));
      }

      // Fetch DesignPanelPro carousel
      const { data: designpanelproData } = await supabase
        .from('designpanelpro_carousel')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (designpanelproData) {
        allItems.push(...designpanelproData.map(item => ({
          id: item.id,
          media_url: item.media_url,
          title: item.title || item.pattern_name || 'Untitled',
          subtitle: item.subtitle || '',
          vehicle_name: item.vehicle_name || '',
          color_name: '',
          pattern_name: item.pattern_name || '',
          category: '',
          product_type: 'designpanelpro',
          created_at: item.created_at || ''
        })));
      }

      // Sort all items by date (newest first) - ONLY admin carousel items, no user-generated content
      return allItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  // Extract unique finishes from gallery items
  const finishes = Array.from(
    new Set(
      galleryItems
        ?.map(item => item.subtitle.toLowerCase())
        .filter(s => s.includes('gloss') || s.includes('satin') || s.includes('matte'))
        .map(s => {
          if (s.includes('gloss')) return 'Gloss';
          if (s.includes('satin')) return 'Satin';
          if (s.includes('matte')) return 'Matte';
          return '';
        })
        .filter(Boolean) || []
    )
  );

  // Filter items based on selections
  const filteredItems = galleryItems?.filter(item => {
    // Normalize product type for filtering (ColorPro and inkfusion are the same tool)
    const normalizedProductType = item.product_type?.toLowerCase() === 'colorpro' || item.product_type === 'inkfusion' 
      ? 'colorpro' 
      : item.product_type?.toLowerCase();
    const productMatch = selectedProduct === 'all' || normalizedProductType === selectedProduct;
    const finishMatch = selectedFinish === 'all' || item.subtitle.toLowerCase().includes(selectedFinish.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || 
                          (item.product_type === 'wbty' && item.category === selectedCategory);
    return productMatch && finishMatch && categoryMatch;
  });

  // Sort filtered items
  const sortedItems = filteredItems?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'vehicle-asc':
        return (a.vehicle_name || '').localeCompare(b.vehicle_name || '');
      case 'vehicle-desc':
        return (b.vehicle_name || '').localeCompare(a.vehicle_name || '');
      case 'pattern-asc':
        return (a.pattern_name || a.color_name || '').localeCompare(b.pattern_name || b.color_name || '');
      case 'pattern-desc':
        return (b.pattern_name || b.color_name || '').localeCompare(a.pattern_name || a.color_name || '');
      default:
        return 0;
    }
  });

  // Group items by vehicle + color/pattern to nest same-design renders together
  const groupedItems = useMemo(() => {
    if (!sortedItems) return [];
    
    const groups = new Map<string, GalleryItem[]>();
    
    sortedItems.forEach(item => {
      // Create vehicle key - normalize to handle trailing spaces in data
      let vehicleKey: string;
      if (item.vehicle_year && item.vehicle_make && item.vehicle_model) {
        // Trim each part individually to handle inconsistent data
        const year = String(item.vehicle_year).trim();
        const make = String(item.vehicle_make).trim();
        const model = String(item.vehicle_model).trim();
        vehicleKey = `${year}-${make}-${model}`.toLowerCase();
      } else if (item.vehicle_name) {
        vehicleKey = item.vehicle_name.toLowerCase().trim();
      } else {
        // Unique per item if no vehicle info
        vehicleKey = item.id;
      }
      
      // Get design identifier - fallback to item.id if no design name to prevent incorrect grouping
      let designKey = (item.color_name || item.pattern_name || '').toLowerCase().trim();
      if (!designKey) {
        // Use a timestamp-based grouping from the render URL or created_at to group concurrent renders
        const timestamp = item.created_at ? new Date(item.created_at).getTime() : 0;
        // Round to nearest 5 minutes to group renders created together
        const roundedTime = Math.floor(timestamp / 300000);
        designKey = `unnamed-${roundedTime}`;
      }
      
      const productKey = item.product_type?.toLowerCase() || '';
      
      const groupKey = `${vehicleKey}|${designKey}|${productKey}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      
      // Check if this item has multiple render_urls (views) - expand them
      if (item.render_urls && typeof item.render_urls === 'object') {
        const renderUrls = item.render_urls as Record<string, any>;
        const viewKeys = Object.keys(renderUrls).filter(k => k !== 'spin_views' && typeof renderUrls[k] === 'string');
        
        if (viewKeys.length > 1) {
          // Add each view as a separate item in this group
          viewKeys.forEach((viewKey, idx) => {
            const viewItem: GalleryItem = {
              ...item,
              id: `${item.id}-view-${idx}`,
              media_url: renderUrls[viewKey] as string,
              title: item.title,
            };
            // Avoid duplicates
            const existing = groups.get(groupKey)!;
            if (!existing.some(i => i.media_url === viewItem.media_url)) {
              existing.push(viewItem);
            }
          });
        } else {
          // Single view or no render_urls - add as-is
          const existing = groups.get(groupKey)!;
          if (!existing.some(i => i.media_url === item.media_url)) {
            existing.push(item);
          }
        }
      } else {
        // No render_urls - add as-is
        const existing = groups.get(groupKey)!;
        if (!existing.some(i => i.media_url === item.media_url)) {
          existing.push(item);
        }
      }
    });
    
    // Convert to array of grouped items
    const result: GroupedGalleryItem[] = [];
    groups.forEach((items, groupKey) => {
      // Filter out items without valid media_url
      const validItems = items.filter(i => i.media_url && i.media_url.length > 0);
      if (validItems.length > 0) {
        result.push({
          groupKey,
          items: validItems,
          primaryItem: validItems[0] // First item (newest based on sort)
        });
      }
    });
    
    return result;
  }, [sortedItems]);

  const handleGroupNav = (groupKey: string, direction: 'prev' | 'next', totalItems: number) => {
    setGroupViewIndex(prev => {
      const currentIndex = prev[groupKey] || 0;
      let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0) newIndex = totalItems - 1;
      if (newIndex >= totalItems) newIndex = 0;
      return { ...prev, [groupKey]: newIndex };
    });
  };

  const handleSwatchClick = async (item: GalleryItem) => {
    setSwatchModal({ isOpen: true, item });
    
    // Fetch the swatch image based on product type
    try {
      if (item.product_type === 'inkfusion' && item.color_name) {
        const { data } = await supabase
          .from('inkfusion_swatches')
          .select('media_url')
          .eq('name', item.color_name)
          .single();
        setSwatchImageUrl(data?.media_url || null);
      } else if (item.product_type === 'wbty' && item.pattern_name) {
        const { data } = await supabase
          .from('wbty_products')
          .select('media_url')
          .eq('name', item.pattern_name)
          .single();
        setSwatchImageUrl(data?.media_url || null);
      } else if (item.product_type === 'fadewraps' && item.pattern_name) {
        const { data } = await supabase
          .from('fadewraps_patterns')
          .select('media_url')
          .eq('name', item.pattern_name)
          .single();
        setSwatchImageUrl(data?.media_url || null);
      }
    } catch (error) {
      console.error('Error fetching swatch:', error);
      setSwatchImageUrl(null);
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      toast.success('Download started');
      
      // Try fetch with no-cors mode for cross-origin images
      const response = await fetch(imageUrl, { mode: 'cors' });
      
      if (!response.ok) {
        // Fallback: open in new tab if fetch fails
        window.open(imageUrl, '_blank');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
      toast.info('Image opened in new tab - right-click to save');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* ============================= */}
        {/*   PROOF SHEET SHOWCASE       */}
        {/* ============================= */}
        <section className="pb-10 mb-10 border-b border-border/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">
            What You'll Receive: <span className="text-gradient-blue">Professional Approval Proof</span>
          </h2>
          <p className="text-center text-muted-foreground mb-6 text-sm sm:text-base">
            Every design includes a print-ready customer approval proof
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center max-w-5xl mx-auto">
            {/* Left: Proof Sheet Preview (Visual Mockup) */}
            <div className="rounded-xl border border-border overflow-hidden shadow-lg bg-card p-4">
              <div className="bg-background rounded-lg p-4 border border-border/50">
                {/* Mini Proof Sheet Mockup */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
                  <span className="text-xs font-bold text-cyan-400">RestylePro™</span>
                  <span className="text-xs text-muted-foreground">Design Approval Proof</span>
                </div>
                
                {/* 6-View Grid Mockup */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['Driver Side', 'Front', 'Rear', 'Passenger Side', 'Top', 'Detail'].map((view) => (
                    <div key={view} className="aspect-video bg-muted/50 rounded border border-border/30 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground">{view}</span>
                    </div>
                  ))}
                </div>
                
                {/* Film Info Bar Mockup */}
                <div className="bg-muted/30 rounded p-2 mb-3 text-[10px] text-muted-foreground flex flex-wrap gap-2">
                  <span>Manufacturer: 3M</span>
                  <span>•</span>
                  <span>Color: Gloss Black</span>
                  <span>•</span>
                  <span>Finish: Gloss</span>
                </div>
                
                {/* Signature Lines Mockup */}
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="border-t border-dashed border-border pt-1">
                    <span className="text-muted-foreground">Customer Signature</span>
                  </div>
                  <div className="border-t border-dashed border-border pt-1">
                    <span className="text-muted-foreground">Shop Representative</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Feature List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">6 Vehicle Views</span>
                  <p className="text-sm text-muted-foreground">Driver Side, Passenger Side, Front, Rear, Top, and Detail views</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Dual Signature Lines</span>
                  <p className="text-sm text-muted-foreground">Customer signature + Shop representative signature with dates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Film Details Bar</span>
                  <p className="text-sm text-muted-foreground">Manufacturer, color name, product code, finish type, and hex swatch</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Optional Terms & Conditions</span>
                  <p className="text-sm text-muted-foreground">Professional disclaimer about color accuracy (Pro/Elite tier)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Print-Ready Format</span>
                  <p className="text-sm text-muted-foreground">16:9 landscape layout optimized for printing and sharing</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button variant="gradient" asChild>
              <Link to="/colorpro">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Any Tool — Get Your Proof
              </Link>
            </Button>
          </div>
        </section>
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Design <span className="text-gradient-blue">Gallery</span>
            </h1>
            <Badge variant="outline" className="gap-1.5 text-base px-3 py-1">
              <Rotate3D className="h-4 w-4" />
              360°
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore professional vehicle wrap renders with <strong className="text-primary">interactive 360° spin views</strong>. 
            Filter by product type and finish. Click any 360° badge to view full rotations or generate your own!
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Filter Designs</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type</label>
                <Select value={selectedProduct} onValueChange={(value) => setSelectedProduct(value as ProductType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="colorpro">ColorPro™</SelectItem>
                    <SelectItem value="wbty">PatternPro™</SelectItem>
                    <SelectItem value="fadewraps">FadeWraps™</SelectItem>
                    <SelectItem value="designpanelpro">DesignPanelPro™</SelectItem>
                    <SelectItem value="approvemode">ApprovePro™</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Finish</label>
                <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Finishes</SelectItem>
                    {finishes.map(finish => (
                      <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">WBTY Category</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value as WBTYCategory)}
                  disabled={selectedProduct !== 'wbty' && selectedProduct !== 'all'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Metal & Marble">Metal & Marble</SelectItem>
                    <SelectItem value="Wicked & Wild">Wicked & Wild</SelectItem>
                    <SelectItem value="Camo & Carbon">Camo & Carbon</SelectItem>
                    <SelectItem value="Bape Camo">Bape Camo</SelectItem>
                    <SelectItem value="Modern & Trippy">Modern & Trippy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="vehicle-asc">Vehicle A-Z</SelectItem>
                    <SelectItem value="vehicle-desc">Vehicle Z-A</SelectItem>
                    <SelectItem value="pattern-asc">Pattern/Color A-Z</SelectItem>
                    <SelectItem value="pattern-desc">Pattern/Color Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {groupedItems && (
                <p className="text-sm text-muted-foreground">
                  Showing {groupedItems.length} designs ({sortedItems?.length || 0} total views)
                </p>
              )}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full aspect-video mb-4 rounded-lg" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : !groupedItems?.length ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">No designs found</p>
              <p className="text-sm">
                {selectedProduct !== 'all' || selectedFinish !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Gallery is empty. Generate some designs to see them here!'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {groupedItems.map((group) => {
              const currentIndex = groupViewIndex[group.groupKey] || 0;
              const item = group.items[currentIndex] || group.primaryItem;
              const hasMultipleViews = group.items.length > 1;
              
              return (
                <Card 
                  key={group.groupKey} 
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="gallery-card-image-wrapper">{/* S.A.W. FIX: contain without cropping */}
                    {/* Multi-view navigation arrows */}
                    {hasMultipleViews && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupNav(group.groupKey, 'prev', group.items.length);
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupNav(group.groupKey, 'next', group.items.length);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        {/* View counter badge */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {currentIndex + 1} / {group.items.length}
                        </div>
                      </>
                    )}

                    {/* 360° Preview Strip - Only show if spin data actually exists */}
                    {item.has_360_spin && 
                     item.render_urls?.spin_views && 
                     Object.keys(item.render_urls.spin_views).length > 0 && (
                      <Gallery360PreviewStrip 
                        spinViews={item.render_urls.spin_views as Record<number, string>}
                        onClick={() => setView360Modal({ isOpen: true, item })}
                      />
                    )}

                    {item.product_type === 'approvemode' && item.before_url ? (
                      <>
                        <BeforeAfterSlider
                          beforeUrl={item.before_url}
                          afterUrl={item.media_url}
                          altText={item.title}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => setFullscreenImage(item)}
                            title="View fullscreen"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="gallery-card-image transition-transform duration-300 cursor-pointer active:scale-95"
                          loading="lazy"
                          decoding="async"
                          onClick={() => setFullscreenImage(item)}
                        />
                        {/* Mobile-friendly overlay - clicking anywhere opens fullscreen */}
                        <div 
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4 cursor-pointer"
                          onClick={() => setFullscreenImage(item)}
                        >
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFullscreenImage(item);
                            }}
                            className="touch-manipulation"
                          >
                            <Maximize2 className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item.media_url, `${item.title.replace(/\s+/g, '-')}.png`);
                            }}
                            className="touch-manipulation"
                          >
                            <Download className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Save</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Product Type Tag */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {item.product_type === 'inkfusion' && 'ColorPro™'}
                          {item.product_type === 'ColorPro' && 'ColorPro™'}
                          {item.product_type === 'wbty' && 'PatternPro™'}
                          {item.product_type === 'fadewraps' && 'FadeWraps™'}
                          {item.product_type === 'approvemode' && 'ApprovePro™'}
                          {item.product_type === 'designpanelpro' && 'DesignPanelPro™'}
                        </span>
                        
                        {/* Pattern/Color Name Tag */}
                        {(item.pattern_name || item.color_name) && (
                          <button
                            onClick={() => handleSwatchClick(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            {item.pattern_name || item.color_name}
                          </button>
                        )}
                        
                        {/* Category Tag (WBTY only) */}
                        {item.category && item.product_type === 'wbty' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {item.category}
                          </span>
                        )}
                        
                        {/* Finish/Lamination Tag */}
                        {item.subtitle && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground border border-border">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Vehicle Name */}
                    {item.vehicle_name && (
                      <p className="text-sm text-muted-foreground mt-auto">
                        {item.vehicle_name}
                      </p>
                    )}
                    
                    {/* Date */}
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    
                    {/* Mark as Perfect - Admin/Tester only */}
                    {isPrivilegedUser && (
                      <MarkAsPerfectButton
                        promptSignature={item.color_name || item.pattern_name || item.title || ''}
                        vehicleSignature={`${item.vehicle_year || ''} ${item.vehicle_make || ''} ${item.vehicle_model || ''}`.trim() || item.vehicle_name || ''}
                        renderUrls={
                          item.render_urls && Object.keys(item.render_urls).length > 0
                            ? item.render_urls as Record<string, string>
                            : { hero: item.media_url }
                        }
                        sourceVisualizationId={item.id}
                        className="w-full mt-2"
                      />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Fullscreen Modal */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => { setFullscreenImage(null); setSelectedViewUrl(null); }}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95" aria-describedby={undefined}>
          <VisuallyHidden>
            <DialogTitle>{fullscreenImage?.title || 'Gallery Image'}</DialogTitle>
          </VisuallyHidden>
          {fullscreenImage && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setFullscreenImage(null)}
              >
                <span className="text-2xl">×</span>
              </Button>

              {/* Navigation arrows */}
              {sortedItems && sortedItems.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                    onClick={() => {
                      const currentIndex = sortedItems.findIndex(item => item.id === fullscreenImage.id);
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : sortedItems.length - 1;
                      setFullscreenImage(sortedItems[prevIndex]);
                    }}
                  >
                    <span className="text-2xl">‹</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                    onClick={() => {
                      const currentIndex = sortedItems.findIndex(item => item.id === fullscreenImage.id);
                      const nextIndex = currentIndex < sortedItems.length - 1 ? currentIndex + 1 : 0;
                      setFullscreenImage(sortedItems[nextIndex]);
                    }}
                  >
                    <span className="text-2xl">›</span>
                  </Button>
                </>
              )}

              {/* Main Image Display */}
              {fullscreenImage.product_type === 'approvemode' && fullscreenImage.before_url ? (
                <div className="w-full">
                  {selectedViewUrl ? (
                    <img
                      src={selectedViewUrl}
                      alt={fullscreenImage.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  ) : (
                    <BeforeAfterSlider
                      beforeUrl={fullscreenImage.before_url}
                      afterUrl={fullscreenImage.media_url}
                      altText={fullscreenImage.title}
                    />
                  )}
                </div>
              ) : (
                <img
                  src={selectedViewUrl || fullscreenImage.media_url}
                  alt={fullscreenImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}

              {/* Multi-View Thumbnail Strip for items with render_urls */}
              {fullscreenImage.render_urls && Object.keys(fullscreenImage.render_urls).filter(key => !key.includes('spin')).length > 1 && (
                <div className="bg-black/60 p-3 mt-2">
                  <p className="text-white/60 text-xs mb-2 text-center">All Available Views</p>
                  <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                    {/* Before/After toggle for ApproveMode */}
                    {fullscreenImage.product_type === 'approvemode' && fullscreenImage.before_url && (
                      <button
                        onClick={() => setSelectedViewUrl(null)}
                        className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all ${
                          !selectedViewUrl ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-orange-500/50 to-cyan-500/50 flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium">Before/After</span>
                        </div>
                      </button>
                    )}
                    {Object.entries(fullscreenImage.render_urls)
                      .filter(([key, val]) => !key.includes('spin') && typeof val === 'string')
                      .map(([viewType, url]) => (
                        <button
                          key={viewType}
                          onClick={() => setSelectedViewUrl(url as string)}
                          className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all ${
                            selectedViewUrl === url ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <img src={url as string} className="w-full h-full object-cover" alt={viewType} />
                          <span className="sr-only">{viewType}</span>
                        </button>
                      ))}
                  </div>
                  <div className="flex gap-2 justify-center mt-2 flex-wrap">
                    {Object.entries(fullscreenImage.render_urls)
                      .filter(([key, val]) => !key.includes('spin') && typeof val === 'string')
                      .map(([viewType]) => (
                        <span key={viewType} className="text-[10px] text-white/60 capitalize">{viewType.replace('_', ' ')}</span>
                      ))}
                  </div>
                </div>
              )}

              {/* Info Bar */}
              <div className="bg-gradient-to-t from-black/80 to-black/60 p-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{fullscreenImage.title}</h2>
                    <p className="text-white/80 mb-1">{fullscreenImage.subtitle}</p>
                    {fullscreenImage.vehicle_name && (
                      <p className="text-white/60 text-sm">{fullscreenImage.vehicle_name}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* View in Tool - Pass visualization ID for ApproveMode */}
                    <Button
                      onClick={() => {
                        if (fullscreenImage.product_type === 'approvemode') {
                          navigate(`/approvemode?visualizationId=${fullscreenImage.id}`);
                        } else {
                          navigate(getProductRoute(fullscreenImage.product_type));
                        }
                      }}
                      className="gap-2 bg-cyan-500 hover:bg-cyan-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View in {getProductName(fullscreenImage.product_type)}
                    </Button>
                    
                    {/* Download buttons */}
                    {fullscreenImage.product_type === 'approvemode' && fullscreenImage.before_url ? (
                      <>
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => handleDownload(
                            fullscreenImage.before_url!,
                            `${fullscreenImage.title.replace(/\s+/g, '-')}-before.png`
                          )}
                        >
                          <Download className="h-4 w-4" />
                          Before
                        </Button>
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => handleDownload(
                            selectedViewUrl || fullscreenImage.media_url,
                            `${fullscreenImage.title.replace(/\s+/g, '-')}-${selectedViewUrl ? 'view' : 'after'}.png`
                          )}
                        >
                          <Download className="h-4 w-4" />
                          {selectedViewUrl ? 'This View' : 'After'}
                        </Button>
                        {/* Download All Views */}
                        {fullscreenImage.render_urls && Object.keys(fullscreenImage.render_urls).filter(k => !k.includes('spin')).length > 1 && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              Object.entries(fullscreenImage.render_urls || {})
                                .filter(([key, val]) => !key.includes('spin') && typeof val === 'string')
                                .forEach(([viewType, url]) => {
                                  handleDownload(url as string, `${fullscreenImage.title.replace(/\s+/g, '-')}-${viewType}.png`);
                                });
                            }}
                          >
                            <Download className="h-4 w-4" />
                            All Views
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        className="gap-2"
                        onClick={() => handleDownload(
                          selectedViewUrl || fullscreenImage.media_url,
                          `${fullscreenImage.title.replace(/\s+/g, '-')}.png`
                        )}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Swatch Modal */}
      <Dialog open={swatchModal.isOpen} onOpenChange={(open) => {
        setSwatchModal({ isOpen: open, item: null });
        setSwatchImageUrl(null);
      }}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <VisuallyHidden>
            <DialogTitle>{swatchModal.item?.pattern_name || swatchModal.item?.color_name || 'Swatch'}</DialogTitle>
          </VisuallyHidden>
          {swatchModal.item && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {swatchModal.item.pattern_name || swatchModal.item.color_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {swatchModal.item.product_type === 'inkfusion' && 'InkFusion™'}
                  {swatchModal.item.product_type === 'wbty' && 'Wrap By The Yard'}
                  {swatchModal.item.product_type === 'fadewraps' && 'FadeWraps™'}
                  {swatchModal.item.product_type === 'approvemode' && 'ApproveMode™'}
                  {swatchModal.item.subtitle && ` — ${swatchModal.item.subtitle}`}
                </p>
              </div>
              
              {swatchImageUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={swatchImageUrl}
                    alt={swatchModal.item.pattern_name || swatchModal.item.color_name || 'Swatch'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No swatch image available</p>
                </div>
              )}
              
              {swatchModal.item.category && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{swatchModal.item.category}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 360° Generate Modal */}
      {generate360Modal.item && (
        <Gallery360GenerateModal
          isOpen={generate360Modal.isOpen}
          onClose={() => setGenerate360Modal({ isOpen: false, item: null })}
          visualizationId={generate360Modal.item.id}
          vehicleData={{
            year: generate360Modal.item.vehicle_year || '',
            make: generate360Modal.item.vehicle_make || '',
            model: generate360Modal.item.vehicle_model || '',
            type: generate360Modal.item.vehicle_type
          }}
          colorData={{
            colorName: generate360Modal.item.color_name || '',
            colorHex: generate360Modal.item.color_hex || '',
            finish: generate360Modal.item.finish_type || '',
            manufacturer: generate360Modal.item.manufacturer,
            colorLibrary: generate360Modal.item.mode_type,
            mode_type: generate360Modal.item.mode_type || 'inkfusion'
          }}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
            toast.success('360° spin view added to gallery!');
          }}
        />
      )}

      {/* 360° Viewer Modal */}
      {view360Modal.item && 
       view360Modal.item.render_urls?.spin_views &&
       Object.keys(view360Modal.item.render_urls.spin_views).length > 0 && (
        <Gallery360ViewerModal
          isOpen={view360Modal.isOpen}
          onClose={() => setView360Modal({ isOpen: false, item: null })}
          spinImages={Object.values(view360Modal.item.render_urls.spin_views)}
          title={view360Modal.item.title}
        />
      )}

      <Footer />
    </div>
  );
}
