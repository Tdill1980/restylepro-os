import { Link, useLocation } from "react-router-dom";
import { Rotate3D } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-12 sm:mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="text-foreground">WPWRestyle</span>
              <span className="text-gradient-blue">Pro™</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Professional car wrap design tools for the modern installer.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Visualizer Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/colorpro"
                  className={`text-sm inline-flex items-center gap-1.5 group hover-scale rounded-full px-3 py-1 transition-colors ${
                    location.pathname.startsWith("/colorpro") || location.pathname.startsWith("/inkfusion")
                      ? "text-gradient-blue bg-card/60 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                      : "text-foreground/80 hover:text-gradient-blue"
                  }`}
                >
                  <Rotate3D className="w-3 h-3 text-gradient-blue icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="ml-1">ColorPro™</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/designpro"
                  className={`text-sm inline-flex items-center gap-1.5 group hover-scale rounded-full px-3 py-1 transition-colors ${
                    location.pathname.startsWith("/designpro")
                      ? "text-gradient-blue bg-card/60 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                      : "text-foreground/80 hover:text-gradient-blue"
                  }`}
                >
                  <Rotate3D className="w-3 h-3 text-gradient-blue icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="ml-1">DesignPanelPro™</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/wbty"
                  className={`text-sm inline-flex items-center gap-1.5 group hover-scale rounded-full px-3 py-1 transition-colors ${
                    location.pathname.startsWith("/wbty")
                      ? "text-gradient-blue bg-card/60 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                      : "text-foreground/80 hover:text-gradient-blue"
                  }`}
                >
                  <Rotate3D className="w-3 h-3 text-gradient-blue icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="ml-1">PatternPro™</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/approvemode"
                  className={`text-sm inline-flex items-center gap-1.5 group hover-scale rounded-full px-3 py-1 transition-colors ${
                    location.pathname.startsWith("/approvemode")
                      ? "text-gradient-blue bg-card/60 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                      : "text-foreground/80 hover:text-gradient-blue"
                  }`}
                >
                  <Rotate3D className="w-3 h-3 text-gradient-blue icon-360-glow transition-transform duration-500 group-hover:animate-[rotate-360_0.6s_ease-in-out]" />
                  <span className="ml-1">ApprovePro™</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Print Products</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/printpro/inkfusion" className="text-sm hover:text-primary transition-colors inline-flex">
                  <span className="text-foreground/80 hover:text-foreground">Ink<span className="text-gradient-designpro">Fusion™</span></span>
                </Link>
              </li>
              <li>
                <Link to="/printpro/wbty" className="text-sm hover:text-primary transition-colors inline-flex">
                  <span className="text-foreground/80 hover:text-foreground">Pattern<span className="text-gradient-designpro">Pro™</span></span>
                </Link>
              </li>
              <li>
                <Link to="/printpro/fadewrap" className="text-sm hover:text-primary transition-colors inline-flex">
                  <span className="text-foreground/80 hover:text-foreground">Fade<span className="text-gradient-designpro">Wrap™</span></span>
                </Link>
              </li>
              <li><Link to="/printpro/design-packs" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Design Packs</Link></li>
              <li><Link to="/printpro/custom-upload" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Custom Prints</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/fleet" className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
                  Fleet Services
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li><a href="#" className="text-sm text-foreground/80 hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 WePrintWraps.com. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};