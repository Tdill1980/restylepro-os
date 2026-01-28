import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Palette, Image, Eye, Layers, Sparkles, Smartphone, Car, Wrench, Check, X as XIcon, MessageSquare, ClipboardSignature, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DynamicRenderSlider } from "@/components/DynamicRenderSlider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { WaitlistPopup } from "@/components/WaitlistPopup";

// Typewriter words for hero
const TYPEWRITER_WORDS = [
  "Car Enthusiasts",
  "Wrap Shops",
  "Designers",
  "PPF Installers",
  "Tint Shops",
  "Dealerships",
  "Restylers"
];

const Index = () => {
  const [fullscreenImage, setFullscreenImage] = useState<any | null>(null);
  const [typewriterText, setTypewriterText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[wordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setTypewriterText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        if (charIndex > 0) {
          setTypewriterText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setWordIndex((wordIndex + 1) % TYPEWRITER_WORDS.length);
        }
      }
    }, isDeleting ? 60 : 120);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  // Fetch showcase images
  const { data: showcaseImages } = useQuery({
    queryKey: ["homepage_showcase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_showcase")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <WaitlistPopup />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-background pt-4 pb-2 sm:py-12 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="grid lg:grid-cols-[45%_55%] gap-8 md:gap-12 lg:gap-16 items-center">
              {/* LEFT TEXT COLUMN */}
              <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    className="bg-gradient-blue hover:opacity-90 text-white font-bold px-4 py-2 text-base sm:text-lg md:text-xl h-auto w-fit"
                  >
                    <Link to="/tools">
                      <span className="text-white">RestylePro Visualizer Suite™</span>
                    </Link>
                  </Button>
                  <p className="text-sm sm:text-base md:text-lg text-foreground font-medium flex flex-wrap gap-x-2 gap-y-1">
                    <span><span className="text-foreground">Color</span><span className="text-gradient-blue">Pro™</span></span>
                    <span>•</span>
                    <span><span className="text-foreground">DesignPanel</span><span className="text-gradient-blue">Pro™</span></span>
                    <span>•</span>
                    <span><span className="text-foreground">Pattern</span><span className="text-gradient-blue">Pro™</span></span>
                    <span>•</span>
                    <span><span className="text-foreground">Approve</span><span className="text-gradient-blue">Pro™</span></span>
                  </p>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground">
                  The Hyper-Realistic <span className="text-gradient-blue">Vehicle Visualizer Suite™</span>
                </h1>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
                  Built for{" "}
                  <span className="inline-block min-w-[180px] sm:min-w-[240px] md:min-w-[320px] lg:min-w-[380px] text-left">
                    <span className="text-cyan-400">{typewriterText}</span>
                    <span className="typewriter-cursor text-cyan-400">|</span>
                  </span>
                </p>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-relaxed">
                  Visualize color change, printed wraps, PPF & patterns on any make & model in seconds.
                </h2>
              </div>

              {/* RIGHT CAROUSEL */}
              <div className="order-1 lg:order-2">
                <DynamicRenderSlider intervalMs={2500} />
              </div>
            </div>
          </div>
        </section>

        {/* 6 TOOLS SECTION */}
        <section className="py-12 sm:py-16 lg:py-20 bg-background border-t border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 text-foreground">
              RestylePro Visualizer Suite™ Tools
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/colorpro" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">Color</span><span className="text-gradient-blue">Pro™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Photorealistic color-change visualizer. Works with any major vinyl brand.
                </p>
              </Link>

              <Link to="/designpro" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">DesignPanel</span><span className="text-gradient-blue">Pro™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Upload printed panels and visualize them mapped instantly onto any vehicle.
                </p>
              </Link>

              <Link to="/designpro?mode=fadewraps" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">Fade</span><span className="text-gradient-blue">Wraps™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Create stunning gradient wraps with customizable color transitions and panel coverage options.
                </p>
              </Link>

              <Link to="/wbty" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Image className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">Pattern</span><span className="text-gradient-blue">Pro™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Upload any pattern design and visualize it wrapped on your vehicle.
                </p>
              </Link>

              <Link to="/approvemode" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-orange-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-8 h-8 text-orange-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">Approve</span><span className="text-gradient-blue">Pro™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Fleet expansion made easy. Upload <span className="text-orange-400 font-semibold">ONE</span> existing design → Visualize on <span className="text-orange-400 font-semibold">ANY</span> new vehicle.
                </p>
              </Link>

              <Link to="/material" className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-bold">
                    <span className="text-foreground">Material</span><span className="text-gradient-blue">Mode™</span>
                  </h3>
                </div>
                <p className="text-foreground text-base leading-relaxed">
                  Explore specialty finishes like carbon fiber, chrome, and textured materials on any vehicle.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* PROFESSIONAL DELIVERABLES */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card/30 border-t border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-foreground">
              Every Design Includes <span className="text-gradient-blue">Professional Deliverables</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Not just renders — get everything you need for client approval and documentation
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Eye className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">6 Vehicle Views</h3>
                <p className="text-muted-foreground">Driver Side, Passenger Side, Front, Rear, Top, and Detail views</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <ClipboardSignature className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">Approval Proof Sheet</h3>
                <p className="text-muted-foreground">Print-ready 16:9 layout with dual signature lines (customer + shop rep)</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <FileText className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">Film Documentation</h3>
                <p className="text-muted-foreground">Manufacturer, color name, product code, finish type, and hex color</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/gallery">
                  See Example Proofs in Gallery
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* SHOWCASE CAROUSEL */}
        {showcaseImages && showcaseImages.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16 bg-background border-t border-border/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
                  Explore Your Wrap in <span className="text-foreground">Hyper-Realistic 3D</span>
                </h2>
                <p className="text-base sm:text-lg text-foreground italic">
                  Instant previews in dozens of premium finishes.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                {showcaseImages.map((showcase) => (
                  <div key={showcase.id} className="w-full md:w-auto flex-shrink-0 group touch-manipulation">
                    <div
                      className="rounded-xl sm:rounded-2xl shadow-xl transition-transform duration-300 
                                 active:scale-95 md:hover:scale-[1.02] w-full 
                                 md:w-[380px] lg:w-[420px] cursor-pointer"
                      onClick={() => setFullscreenImage(showcase)}
                    >
                      <img
                        src={showcase.image_url}
                        alt={showcase.alt_text}
                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                      />
                    </div>
                    <p className="text-center text-foreground font-bold mt-3 text-base sm:text-lg">{showcase.title}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6 sm:mt-8">
                <Button size="lg" variant="gradient" asChild className="text-base gap-2 h-12 sm:h-14 touch-manipulation">
                  <Link to="/tools">
                    <Sparkles className="w-5 h-5" />
                    Explore Design Tools
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* CTA SECTION */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-card/50 border-t border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Ready to Transform Your Visualization Workflow?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of wrap shops and designers using RestylePro to close more deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-8 text-lg">
                <Link to="/tools">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg">
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Fullscreen Image Modal */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {fullscreenImage && (
            <img
              src={fullscreenImage.image_url}
              alt={fullscreenImage.alt_text}
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
