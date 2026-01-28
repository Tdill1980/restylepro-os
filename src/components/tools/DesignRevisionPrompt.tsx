import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, Loader2, Wand2, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DesignRevisionPromptProps {
  onRevisionSubmit: (revisionPrompt: string) => Promise<void>;
  isGenerating: boolean;
  disabled?: boolean;
}

export const DesignRevisionPrompt = ({
  onRevisionSubmit,
  isGenerating,
  disabled = false,
}: DesignRevisionPromptProps) => {
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!revisionPrompt.trim()) return;
    await onRevisionSubmit(revisionPrompt.trim());
    setRevisionPrompt("");
  };

  const suggestionChips = [
    "Make the colors more vibrant",
    "Add more contrast",
    "Make it darker/moodier",
    "Brighter lighting",
    "Cleaner background",
    "Make it more glossy",
    "Add metallic sheen",
    "Darken the hood only",
    "Increase saturation",
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "border transition-all duration-300",
        disabled 
          ? "bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20 opacity-80"
          : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
      )}>
        <CollapsibleTrigger className="w-full p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-md",
                disabled ? "bg-purple-500/10" : "bg-purple-500/20"
              )}>
                <MessageSquarePlus className={cn(
                  "w-4 h-4",
                  disabled ? "text-purple-400/60" : "text-purple-400"
                )} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    disabled ? "text-foreground/60" : "text-foreground"
                  )}>
                    AI Design Revisions
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400">
                    PRO
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {disabled ? "Generate a render first to enable revisions" : "Request changes via text prompt"}
                </span>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform text-muted-foreground",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {disabled ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Generate your first render to unlock AI-powered revisions</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  Request changes like "make it darker" or "add more gloss"
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="revision-prompt" className="text-xs text-muted-foreground mb-2 block">
                    Describe what you'd like changed in the render
                  </Label>
                  <Textarea
                    id="revision-prompt"
                    placeholder="e.g., Make the wrap color more saturated, adjust the lighting to be warmer, show a different angle..."
                    value={revisionPrompt}
                    onChange={(e) => setRevisionPrompt(e.target.value)}
                    className="min-h-[80px] bg-background/50 border-border/50 resize-none"
                    disabled={isGenerating}
                  />
                </div>

                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {suggestionChips.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setRevisionPrompt(suggestion)}
                      disabled={isGenerating}
                      className="px-3 py-1.5 text-xs bg-background/50 border border-border/50 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating || !revisionPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate with Revision
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground/70 text-center">
                  Your revision instructions will be applied to generate a new render
                </p>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
