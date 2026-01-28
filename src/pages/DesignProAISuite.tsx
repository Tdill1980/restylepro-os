import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Palette, Layers, Image, Eye, Sparkles, Lock, Check, Car } from "lucide-react";
import { useToolAccess } from "@/hooks/useToolAccess";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/PricingCard";

const tools = [
  {
    id: 'colorpro',
    name: 'ColorPro™',
    description: 'Visualize InkFusion™, Avery & 3M Films on any vehicle with photorealistic 3D renders',
    icon: Palette,
    href: '/colorpro',
    color: 'from-cyan-400 via-blue-500 to-blue-600',
    carouselTable: 'inkfusion_carousel',
    tier: 'Starter',
    price: '$19/mo'
  },
  {
    id: 'designpanelpro',
    name: 'DesignPanelPro™',
    description: 'Apply custom graphic panels and patterns with precision 3D visualization',
    icon: Sparkles,
    href: '/designpanelpro',
    color: 'from-purple-400 via-pink-500 to-red-500',
    carouselTable: 'designpanelpro_carousel',
    tier: 'Business',
    price: '$149/mo'
  },
  {
    id: 'fadewraps',
    name: 'FadeWraps™',
    description: 'Create stunning gradient and fade effects with customizable direction and scale',
    icon: Layers,
    href: '/fadewraps',
    color: 'from-orange-400 via-red-500 to-pink-500',
    carouselTable: 'fadewraps_carousel',
    tier: 'Professional',
    price: '$49/mo'
  },
  {
    id: 'wbty',
    name: 'PatternPro™',
    description: 'Wrap By The Yard - Visualize specialty patterns and materials before installation',
    icon: Image,
    href: '/wbty',
    color: 'from-green-400 via-teal-500 to-blue-500',
    carouselTable: 'wbty_carousel',
    tier: 'Professional',
    price: '$49/mo'
  },
  {
    id: 'approvemode',
    name: 'ApprovePro™',
    description: 'Transform 2D design proofs into 3D renders for client approval',
    icon: Eye,
    href: '/approvemode',
    color: 'from-indigo-400 via-purple-500 to-pink-500',
    carouselTable: 'approvemode_carousel',
    tier: 'Business',
    price: '$149/mo'
  },
  {
    id: 'myrenders',
    name: 'My Renders',
    description: 'Your personal library with shareable URLs & QR codes. Tag and filter renders to send specific collections to clients',
    icon: Car,
    href: '/my-renders',
    color: 'from-amber-400 via-orange-500 to-red-500',
    carouselTable: null,
    tier: 'All Tiers',
    price: 'Included'
  }
];

const ToolCard = ({ tool }: { tool: typeof tools[0] }) => {
  const { hasAccess } = useToolAccess(tool.id);
  const Icon = tool.icon;
  
  const { data: exampleImage } = useQuery({
    queryKey: ['tool-example', tool.carouselTable],
    queryFn: async () => {
      const tableName = tool.carouselTable;
      
      // Skip query if no carousel table
      if (!tableName) return null;
      
      if (tableName === 'inkfusion_carousel') {
        const { data } = await supabase
          .from('inkfusion_carousel')
          .select('media_url, title, subtitle')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1)
          .single();
        return data;
      } else if (tableName === 'designpanelpro_carousel') {
        const { data } = await supabase
          .from('designpanelpro_carousel')
          .select('media_url, title, subtitle')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1)
          .single();
        return data;
      } else if (tableName === 'fadewraps_carousel') {
        const { data } = await supabase
          .from('fadewraps_carousel')
          .select('media_url, title, subtitle')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1)
          .single();
        return data;
      } else if (tableName === 'wbty_carousel') {
        const { data } = await supabase
          .from('wbty_carousel')
          .select('media_url, title, subtitle')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1)
          .single();
        return data;
      } else if (tableName === 'approvemode_carousel') {
        const { data } = await supabase
          .from('approvemode_carousel')
          .select('media_url, title, subtitle')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1)
          .single();
        return data;
      }
      return null;
    },
    enabled: !!tool.carouselTable
  });
  
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link to={tool.href}>
          <Card className="group relative overflow-hidden transition-all hover:shadow-xl border-border cursor-pointer">
          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
          
          <div className="p-6 relative space-y-4">
            <div className="flex items-start justify-between">
              <div className={`rounded-full p-3 bg-gradient-to-br ${tool.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              {hasAccess ? (
                <div className="flex items-center gap-1 text-sm text-primary font-medium">
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Locked</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground">Required Tier</div>
                <div className="text-sm font-semibold text-foreground">{tool.tier}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Pricing</div>
                <div className="text-sm font-semibold text-foreground">{tool.price}</div>
              </div>
            </div>
            
            <Button 
              className={`w-full ${hasAccess ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 hover:opacity-90 text-white font-bold' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 hover:opacity-90 text-white font-bold'}`}
            >
              {hasAccess ? 'Launch Tool' : 'Try Free'}
            </Button>
          </div>
        </Card>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0 overflow-hidden border-2 border-primary/20 shadow-2xl" side="top" sideOffset={8}>
        {exampleImage ? (
          <div className="relative">
            <img 
              src={exampleImage.media_url} 
              alt={exampleImage.title || tool.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h4 className="font-bold text-xl mb-1">{exampleImage.title || tool.name}</h4>
              {exampleImage.subtitle && (
                <p className="text-sm text-white/95 leading-relaxed">{exampleImage.subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading preview...</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

const DesignProAISuite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-[#FF2DA1] via-[#B620E0] to-[#6A00FF] text-transparent bg-clip-text">RestylePro</span>
                <span className="text-foreground"> Suite™</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Professional 3D wrap visualization tools for WPWRestylePro™
              </p>
              <p className="text-lg text-muted-foreground">
                Create photorealistic renders, close more deals, and transform your wrap business
              </p>
            </div>
            
            {/* Tools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            
            {/* Pricing Tiers */}
            <div className="space-y-12 pt-12">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[#FF2DA1] via-[#B620E0] to-[#6A00FF] text-transparent bg-clip-text">Choose</span>
                  <span className="text-foreground"> Your Plan</span>
                </h2>
                <p className="text-muted-foreground">
                  Select the tier that fits your business needs
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <PricingCard
                  title="Starter"
                  price={19}
                  features={[
                    "10 renders per month",
                    "ColorPro™ access",
                    "Basic vehicle library",
                    "HD quality renders",
                    "Email support"
                  ]}
                />
                <PricingCard
                  title="Professional"
                  price={49}
                  isPopular={true}
                  features={[
                    "50 renders per month",
                    "All Starter features",
                    "FadeWraps™ access",
                    "WBTY™ access",
                    "Extended vehicle library",
                    "Priority support"
                  ]}
                />
                <PricingCard
                  title="Business"
                  price={149}
                  features={[
                    "200 renders per month",
                    "All Professional features",
                    "DesignPanelPro™ access",
                    "ApproveMode™ access",
                    "White-label options",
                    "Dedicated support"
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default DesignProAISuite;
