import { Card } from "@/components/ui/card";
import { Loader2, Lightbulb, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationWizardProps {
  elapsedSeconds: number;
  tips: string[];
  currentTipIndex: number;
  toolName?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const GenerationWizard = ({
  elapsedSeconds,
  tips,
  currentTipIndex,
  toolName = "Design",
  gradientFrom = "from-cyan-500",
  gradientTo = "to-purple-500"
}: GenerationWizardProps) => {
  const getProgressSteps = () => [
    { label: "Vehicle identified", completed: elapsedSeconds >= 2 },
    { label: "Design analyzed", completed: elapsedSeconds >= 5 },
    { label: "Applying materials", completed: elapsedSeconds >= 10 },
    { label: "Rendering photorealistic", completed: elapsedSeconds >= 18 }
  ];

  return (
    <Card className={cn(
      "p-6 border min-h-[400px]",
      `bg-gradient-to-br ${gradientFrom}/10 via-background ${gradientTo}/10`
    )}>
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-primary font-medium">Creating your {toolName}...</span>
            <span className="text-muted-foreground">{Math.min(Math.floor((elapsedSeconds / 30) * 100), 95)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", `bg-gradient-to-r ${gradientFrom} ${gradientTo}`)}
              style={{ width: `${Math.min((elapsedSeconds / 30) * 100, 95)}%` }}
            />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {getProgressSteps().map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                step.completed 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary border border-border"
              )}>
                {step.completed && <Check className="w-3 h-3" />}
              </div>
              <span className={cn(
                "text-sm",
                step.completed ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Animated Spinner */}
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        
        {/* Timer */}
        <p className="text-lg font-semibold text-foreground">
          Generating... {elapsedSeconds}s
        </p>

        {/* Rotating Tip */}
        <div className="flex items-start gap-2 p-4 bg-secondary/50 rounded-lg max-w-md">
          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground italic">
            {tips[currentTipIndex] || "Pro Tip: Great things take time..."}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Tool-specific tips
export const GRAPHICSPRO_TIPS = [
  "Pro Tip: Two-tone designs use darker color as base layer",
  "Did you know? Chrome accents require hard-light studio rendering",
  "Pro Tip: Racing stripes should flow hood → roof → trunk continuously",
  "Fun Fact: Proper chrome delete adds 8-12 hours to install time",
  "Pro Tip: OEM stripes follow factory-correct geometry and proportions",
  "Did you know? Multi-layer vinyl creates depth with stacked colors",
  "Pro Tip: Satin finishes hide imperfections better than gloss",
  "Fun Fact: A full wrap can increase vehicle resale value"
];

export const DESIGNPANELPRO_TIPS = [
  "Pro Tip: Premium panels print at 186\" × 56\" for full coverage",
  "Did you know? Panel designs seamlessly wrap around body curves",
  "Pro Tip: Gloss lamination enhances color vibrancy",
  "Fun Fact: Custom panels can be designed for any vehicle make",
  "Pro Tip: Matte finishes reduce glare and fingerprints",
  "Did you know? Panels are printed on premium cast vinyl",
  "Pro Tip: Satin finish offers the best of both gloss and matte",
  "Fun Fact: Panel wraps last 5-7 years with proper care"
];

export const FADEWRAPS_TIPS = [
  "Pro Tip: Gradient direction dramatically changes the look",
  "Did you know? FadeWraps blend colors seamlessly across panels",
  "Pro Tip: Front-to-back gradients emphasize vehicle length",
  "Fun Fact: Diagonal gradients create dynamic movement",
  "Pro Tip: Top-to-bottom gradients work great on tall vehicles",
  "Did you know? FadeWraps are printed with precision color matching",
  "Pro Tip: Choose colors that complement each other for best results",
  "Fun Fact: Gradient wraps are unique to each vehicle shape"
];

export const PATTERNPRO_TIPS = [
  "Pro Tip: Pattern scale affects how the design tiles on panels",
  "Did you know? There are 92+ specialty patterns available",
  "Pro Tip: Carbon fiber patterns look best at 1:1 scale",
  "Fun Fact: Camo patterns are popular for trucks and off-road vehicles",
  "Pro Tip: Marble patterns create a luxurious premium look",
  "Did you know? Patterns seamlessly wrap around body curves",
  "Pro Tip: Galaxy patterns look stunning on dark vehicles",
  "Fun Fact: Forged carbon is one of our most requested patterns"
];

export const COLORPRO_TIPS = [
  "Pro Tip: Matte finishes hide imperfections better than gloss",
  "Did you know? 3M 2080 series is the industry standard for color change",
  "Fun Fact: A full wrap can increase vehicle resale value",
  "Pro Tip: Darker colors show dust more easily than lighter ones",
  "Did you know? Chrome wraps require more maintenance than standard vinyl",
  "Pro Tip: PPF can be combined with color change for ultimate protection",
  "Fun Fact: Vehicle wraps can last 5-7 years with proper care",
  "Pro Tip: Always have your wrap installed in a dust-free environment"
];
