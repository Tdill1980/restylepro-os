import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { Menu, ChevronDown, Rotate3D, Sun, Moon } from "lucide-react";
import React, { useState, useEffect, memo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
const HeaderComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const { subscription } = useSubscriptionLimits();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  const MobileNavLinks = () => (
    <>
      {/* RestylePro Visualizer Suite Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-blue text-white font-bold w-full justify-between min-h-[44px]">
            RestylePro Visualizer Suite™ <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border w-full z-[100]">
          <DropdownMenuItem asChild>
            <Link to="/colorpro" className="cursor-pointer w-full min-h-[44px] flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
              <Rotate3D className="w-4 h-4 text-cyan-400 icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
              <span className="text-foreground">ColorPro™</span>
            </Link>
          </DropdownMenuItem>
          {/* GraphicsPro, DesignPanelPro, PatternPro hidden for V1 stability */}
          <DropdownMenuItem asChild>
            <Link to="/approvemode" className="cursor-pointer w-full min-h-[44px] flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
              <Rotate3D className="w-4 h-4 text-cyan-400 icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
              <span className="text-foreground">ApprovePro™</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Gallery Standalone Link */}
      <Link 
        to="/gallery" 
        className={`block py-3 px-2 text-base font-semibold transition-colors rounded-lg min-h-[44px] flex items-center justify-center ${
          isActive('/gallery') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <span className="text-gradient-blue">✨ Gallery</span>
      </Link>
      
      {/* PrintPro Suite Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-designpro text-white font-bold w-full justify-between min-h-[44px]">
            PrintPro™ Suite <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border w-full z-[100]">
          <DropdownMenuItem asChild>
            <Link to="/printpro/inkfusion" className="cursor-pointer w-full min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
              <span className="text-foreground">Ink</span><span className="text-gradient-designpro">Fusion™</span> Premium Film
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/printpro/wbty" className="cursor-pointer w-full min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
              <span className="text-foreground">Pattern</span><span className="text-gradient-designpro">Pro™</span> Printed Rolls
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/printpro/fadewrap" className="cursor-pointer w-full min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
              <span className="text-foreground">Fade</span><span className="text-gradient-designpro">Wrap™</span> Printed Panels
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/printpro/design-packs" className="cursor-pointer w-full min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
              Full-Design Print Packs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/printpro/custom-upload" className="cursor-pointer w-full min-h-[44px] flex items-center" onClick={() => setIsOpen(false)}>
              Custom Print Upload
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
  
  const NavLinks = () => (
    <TooltipProvider delayDuration={200}>
      {/* RestylePro Visualizer Suite Dropdown */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-blue hover:opacity-90 text-white font-bold text-sm px-4 py-2 flex items-center gap-1">
                RestylePro Visualizer Suite™ <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border w-56 z-[100]">
              <DropdownMenuItem asChild>
                <Link to="/colorpro" className="cursor-pointer w-full min-h-[44px] flex items-center gap-2 group">
                  <Rotate3D className="w-4 h-4 text-cyan-400 icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="text-foreground">ColorPro™</span>
                </Link>
              </DropdownMenuItem>
              {/* GraphicsPro, DesignPanelPro, PatternPro hidden for V1 stability */}
              <DropdownMenuItem asChild>
                <Link to="/approvemode" className="cursor-pointer w-full min-h-[44px] flex items-center gap-2 group">
                  <Rotate3D className="w-4 h-4 text-cyan-400 icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="text-foreground">ApprovePro™</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-primary/20 max-w-xs">
          <p className="font-semibold">Design & Visualization Tools</p>
          <p className="text-xs text-muted-foreground">ColorPro™ • DesignPanelPro™ • PatternPro™ • ApprovePro™</p>
        </TooltipContent>
      </Tooltip>
      
      {/* PrintPro Suite Dropdown */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-designpro hover:opacity-90 text-white font-bold text-sm px-4 py-2 flex items-center gap-1">
                PrintPro Suite™ <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border w-56 z-[100]">
              <DropdownMenuItem asChild>
                <Link to="/printpro/inkfusion" className="cursor-pointer w-full min-h-[44px] flex items-center">
                  <span className="text-foreground">Ink</span><span className="text-gradient-designpro">Fusion™</span> Premium Film
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/printpro/wbty" className="cursor-pointer w-full min-h-[44px] flex items-center">
                  <span className="text-foreground">Pattern</span><span className="text-gradient-designpro">Pro™</span> Printed Rolls
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/printpro/fadewrap" className="cursor-pointer w-full min-h-[44px] flex items-center">
                  <span className="text-foreground">Fade</span><span className="text-gradient-designpro">Wrap™</span> Printed Panels
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/printpro/design-packs" className="cursor-pointer w-full min-h-[44px] flex items-center">
                  Full-Design Print Packs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/printpro/custom-upload" className="cursor-pointer w-full min-h-[44px] flex items-center">
                  Custom Print Upload
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-primary/20 max-w-xs">
          <p className="font-semibold">Print Products & Fulfillment</p>
          <p className="text-xs text-muted-foreground">Order printed vinyl films, panels, patterns & custom designs</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-2 sm:px-6">
        <div className="header-container">
          <Link to="/" className="header-logo text-base xs:text-lg sm:text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap flex items-center" style={{ lineHeight: '1.1' }}>
            <span className="text-foreground/90">WPWRestyle</span>
            <span className="text-gradient-blue-subtle">Pro</span>
            <span className="text-gradient-blue-subtle text-[0.6em] opacity-70 align-super ml-0.5">™</span>
          </Link>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden min-w-[44px] min-h-[44px]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-card border-border">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-2 mt-8">
                <MobileNavLinks />
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {user ? (
                    <>
                      <Button variant="outline" size="sm" asChild className="w-full min-h-[44px]">
                        <Link to="/billing" onClick={() => setIsOpen(false)}>Manage Billing</Link>
                      </Button>
                      <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="outline" size="sm" className="w-full min-h-[44px]">
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" asChild className="w-full min-h-[44px]">
                      <Link to="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                  )}
              <Button variant="default" size="sm" asChild className="w-full min-h-[44px] bg-gradient-blue">
                <Link to="/tools" onClick={() => setIsOpen(false)}>RestylePro Visualizer Suite™</Link>
              </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation - Suite buttons next to logo */}
          <nav className="hidden lg:flex items-center gap-3 ml-4">
            <NavLinks />
          </nav>
          
          {/* Desktop Right Side - Gallery, My Renders, Menu */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <Link 
              to="/gallery" 
              className={`text-sm font-semibold transition-colors ${
                isActive('/gallery') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-gradient-blue">✨ Gallery</span>
            </Link>
            
            <span className="text-muted-foreground">|</span>
            
            <Link
              to="/my-renders" 
              className={`text-sm font-medium transition-colors ${
                isActive('/my-renders') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Renders
            </Link>
            
            <span className="text-muted-foreground">|</span>
            
            <Link
              to="/my-designs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/my-designs') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Designs
            </Link>
            
            <span className="text-muted-foreground">|</span>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-foreground" />
              )}
            </button>
          </div>
          
          {/* Mobile: Visualizer Suite + Menu Dropdown */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile compact suite buttons removed - now in Sheet */}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  Menu <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48 z-[100]">
                <DropdownMenuItem asChild>
                  <Link to="/gallery" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">Gallery</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-renders" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">My Renders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-designs" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">My Designs</span>
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="cursor-pointer w-full min-h-[44px] flex items-center">
                      <span className="text-gradient-blue font-semibold">Manage Billing</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* Pricing temporarily hidden for affiliate testing */}
                <DropdownMenuItem asChild>
                  <Link to="/user-guide" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">Help & Guide</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin-restylepro" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-muted-foreground hover:text-foreground font-semibold">Admin</span>
                  </Link>
                </DropdownMenuItem>
                {user ? (
                  <DropdownMenuItem asChild>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start min-h-[44px]">
                      <span className="text-muted-foreground hover:text-foreground font-semibold">Log Out</span>
                    </Button>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="cursor-pointer w-full min-h-[44px] flex items-center">
                      <span className="text-gradient-blue font-semibold">Log In</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="p-0">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-h-[44px]">
                    Get Started
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Desktop: Log In + Visualizer Suite + Menu Dropdown */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-3">
            {!user && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="text-foreground hover:text-primary border-border"
              >
                <Link to="/login">Log In</Link>
              </Button>
            )}
            
            {/* Desktop suite buttons now in NavLinks section */}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  Menu <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48 z-[100]">
                <DropdownMenuItem asChild>
                  <Link to="/gallery" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">Gallery</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-renders" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-foreground font-semibold">My Renders</span>
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="cursor-pointer w-full min-h-[44px] flex items-center">
                      <span className="text-gradient-blue font-semibold">Manage Billing</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* Pricing temporarily hidden for affiliate testing */}
                <DropdownMenuItem asChild>
                  <Link to="/user-guide" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-gradient-blue font-semibold">Help & Guide</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin-restylepro" className="cursor-pointer w-full min-h-[44px] flex items-center">
                    <span className="text-muted-foreground hover:text-foreground font-semibold">Admin</span>
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start min-h-[44px]">
                      <span className="text-muted-foreground hover:text-foreground font-semibold">Log Out</span>
                    </Button>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="p-0">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-h-[44px]">
                    Get Started
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

// Memoize Header to prevent re-renders when parent components (like Index.tsx slider) update
export const Header = memo(HeaderComponent);