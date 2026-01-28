import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Zap, Bell, Crown } from "lucide-react";
import waitlistHero from "@/assets/waitlist-hero.png";

export const WaitlistPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBetaForm, setShowBetaForm] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);

  // Check if user already signed up
  useEffect(() => {
    const alreadyJoined = localStorage.getItem("waitlist_joined") === "true";
    if (alreadyJoined) {
      setHasSignedUp(true);
    }
  }, []);

  // Initial popup after 2 seconds
  useEffect(() => {
    if (hasSignedUp) return;
    const hasSeenPopup = sessionStorage.getItem("waitlist_popup_seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("waitlist_popup_seen", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSignedUp]);

  // Re-show popup when user scrolls to bottom without signing up
  useEffect(() => {
    const handleScroll = () => {
      if (hasSignedUp || isOpen) return;
      
      const scrolledToBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      
      if (scrolledToBottom) {
        const shownAtBottom = sessionStorage.getItem("waitlist_shown_at_bottom");
        if (!shownAtBottom) {
          setIsOpen(true);
          sessionStorage.setItem("waitlist_shown_at_bottom", "true");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasSignedUp, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }

    const source = showBetaForm ? 'beta_program' : 'launch_waitlist';
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .upsert(
          { email: email.toLowerCase().trim(), source },
          { onConflict: 'email' }
        );

      if (error) throw error;

      localStorage.setItem("waitlist_joined", "true");
      setIsSubmitted(true);
      setHasSignedUp(true);
      toast.success(showBetaForm 
        ? "You're on the beta list!" 
        : "You're on the waitlist!"
      );
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating badge to re-open popup */}
      {!isOpen && !hasSignedUp && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
        >
          <Bell className="w-4 h-4 group-hover:animate-pulse" />
          <span className="text-sm font-medium">Join Waitlist</span>
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-[340px] p-0 overflow-hidden border-0 bg-[#111111] rounded-2xl shadow-2xl"
          overlayClassName="bg-black/80"
        >
          {/* Hero Image Section - Full render with manufacturer branding */}
          <div className="relative w-full bg-gradient-to-br from-slate-800 to-slate-900">
            <img 
              src={waitlistHero}
              alt="Flip Gloss Fierce Fuchsia - Lamborghini Urus"
              className="w-full h-auto object-contain"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            
            {/* Logo */}
            <div className="absolute bottom-3 left-4">
              <div className="flex items-baseline">
                <span className="text-[#00d4ff] font-bold text-base tracking-tight">WPW</span>
                <span className="text-white font-bold text-base tracking-tight ml-1">RestylePro</span>
                <span className="text-[#00d4ff] text-[9px] ml-0.5">™</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {isSubmitted ? (
              <div className="text-center py-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full mb-2">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-base font-semibold text-white">You're In!</p>
                <p className="text-xs text-slate-400">We'll email you at launch.</p>
              </div>
            ) : !showBetaForm ? (
              <>
                {/* Club Badge */}
                <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#00d4ff]/20 to-[#ff0080]/20 border border-[#00d4ff]/30 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-[#00d4ff]" />
                    <span className="text-xs font-semibold text-white tracking-wide">CLUB RESTYLEPRO</span>
                    <span className="text-[8px] text-[#00d4ff]">™</span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="text-center text-white font-bold text-lg mb-2">
                  Become a Member
                </h2>
                <p className="text-center text-slate-400 text-xs mb-4 leading-relaxed">
                  Get 5 FREE renders at launch + exclusive member updates on our AI wrap visualizer.
                </p>

                {/* Value props */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3 h-3 text-[#00d4ff] flex-shrink-0" />
                    <span>500+ vinyl colors</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3 h-3 text-[#00d4ff] flex-shrink-0" />
                    <span>Custom graphics</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3 h-3 text-[#00d4ff] flex-shrink-0" />
                    <span>Patterns & prints</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3 h-3 text-[#00d4ff] flex-shrink-0" />
                    <span>Client proofs</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#ff0080]/10 rounded-lg p-3 mb-4 border border-slate-700/50">
                  <p className="text-center text-white text-sm font-semibold">
                    Get <span className="text-[#00d4ff]">5 FREE renders</span> at launch
                  </p>
                  <p className="text-center text-slate-400 text-[10px] mt-0.5">
                    Launching January 2025
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white border-0 text-black placeholder:text-slate-400 text-sm rounded-lg"
                    disabled={isSubmitting}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-bold bg-[#ff0080] hover:bg-[#e60073] text-white rounded-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "JOIN WAITLIST"}
                  </Button>
                </form>

                {/* Beta link */}
                <button
                  onClick={() => setShowBetaForm(true)}
                  className="w-full mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  Want early access? Apply for beta
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowBetaForm(false)}
                  className="text-xs text-slate-400 hover:text-white mb-2"
                >
                  ← Back
                </button>

                <h2 className="text-center text-white font-bold text-base mb-2">
                  <Zap className="w-4 h-4 inline text-amber-400 mr-1" />
                  Beta Tester Program
                </h2>
                
                <p className="text-center text-slate-400 text-xs mb-3">
                  Get access before public launch to test new features and shape the product
                </p>

                <div className="text-xs text-slate-300 space-y-1.5 mb-4 bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 flex-shrink-0" /> 
                    <span>Early access before January launch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 flex-shrink-0" /> 
                    <span>Unlimited renders during beta</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 flex-shrink-0" /> 
                    <span>Locked-in founder pricing forever</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 flex-shrink-0" /> 
                    <span>Direct input on new features</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-white border-0 text-black placeholder:text-slate-500 text-sm"
                    disabled={isSubmitting}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Applying..." : "APPLY FOR BETA"}
                  </Button>
                </form>
              </>
            )}

            <p className="text-[10px] text-slate-500 text-center mt-3">
              No spam • Unsubscribe anytime
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
