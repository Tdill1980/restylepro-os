import { ReactNode } from "react";
import { useToolAccess } from "@/hooks/useToolAccess";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolAccessGuardProps {
  toolName: string;
  children: ReactNode;
}

const TIER_NAMES: Record<string, string> = {
  'starter': 'Restyle Starter',
  'professional': 'Restyle Professional',
  'proshop': 'Pro Shop',
  'agency': 'Restyle Agency'
};

export const ToolAccessGuard = ({ toolName, children }: ToolAccessGuardProps) => {
  const { hasAccess, requiredTier, upgradeUrl } = useToolAccess(toolName);
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full p-6 bg-primary/10">
              <Lock className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Upgrade Required
            </h2>
            <p className="text-lg text-muted-foreground">
              This tool requires a <span className="font-semibold text-primary">{TIER_NAMES[requiredTier]}</span> subscription or higher.
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Unlock this tool and access the full DesignProAI™ Suite to create stunning 3D wrap visualizations.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to={upgradeUrl}>
                View Pricing Plans
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
};
