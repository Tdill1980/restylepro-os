import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wand2, AlertTriangle, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminAIAutoFix() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoRegenerate, setAutoRegenerate] = useState(false);
  const [minFlags, setMinFlags] = useState(3);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runAutoFix = async (renderType: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-prompt-auto-fix", {
        body: { 
          renderType, 
          minFlags,
          autoRegenerate 
        },
      });

      if (error) throw error;

      setResults(data);

      toast({
        title: "AI Analysis Complete",
        description: `Analyzed ${data.flagsAnalyzed} flags and sent recommendations to your email.`,
      });
    } catch (error: any) {
      console.error("Error running auto-fix:", error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🤖 AI Prompt Auto-Fix</h1>
          <p className="text-muted-foreground">
            Automatically analyze quality issues and generate prompt improvements using AI
          </p>
        </div>

        {/* Settings Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-regen">Auto-Regenerate Flagged Renders</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically regenerate renders with improved prompts
                </p>
              </div>
              <Switch
                id="auto-regen"
                checked={autoRegenerate}
                onCheckedChange={setAutoRegenerate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-flags">Minimum Flags to Trigger Analysis</Label>
              <input
                id="min-flags"
                type="number"
                min="1"
                max="10"
                value={minFlags}
                onChange={(e) => setMinFlags(Number(e.target.value))}
                className="w-32 px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-muted-foreground">
                Requires at least {minFlags} flags across all renders
              </p>
            </div>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { type: "designpanelpro", label: "DesignPanelPro™", color: "from-purple-500 to-pink-500" },
            { type: "inkfusion", label: "ColorPro™", color: "from-cyan-400 to-blue-500" },
            { type: "fadewraps", label: "FadeWraps™", color: "from-orange-400 to-red-500" },
            { type: "wbty", label: "WBTY™", color: "from-green-400 to-emerald-500" },
          ].map((tool) => (
            <Card key={tool.type} className="p-6">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{tool.label}</h3>
              <Button
                onClick={() => runAutoFix(tool.type)}
                disabled={isAnalyzing}
                className="w-full"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analyze & Fix
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Results Display */}
        {results && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold">Analysis Results</h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Flags Analyzed</p>
                  <p className="text-2xl font-bold">{results.flagsAnalyzed}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Problematic Renders</p>
                  <p className="text-2xl font-bold">{results.problematicRenders}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className={`text-2xl font-bold ${
                    results.analysis.priority === 'high' ? 'text-red-500' :
                    results.analysis.priority === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {results.analysis.priority.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🔍 Root Causes</h3>
                <ul className="list-disc list-inside space-y-1">
                  {results.analysis.rootCauses.map((cause: string, i: number) => (
                    <li key={i} className="text-sm">{cause}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">✨ Prompt Improvements</h3>
                <div className="space-y-2">
                  {Object.entries(results.analysis.promptImprovements).map(([issue, fix]: [string, any]) => (
                    <div key={issue} className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium">{issue}</p>
                      <p className="text-sm text-muted-foreground">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">⚙️ Technical Fixes</h3>
                <div className="space-y-2">
                  {Object.entries(results.analysis.technicalFixes).map(([param, value]: [string, any]) => (
                    <div key={param} className="flex justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm font-medium">{param}</span>
                      <code className="text-sm text-primary">{value}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-600">Next Steps</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed recommendations have been sent to your email. 
                    Review the suggestions and update the AI prompts in the 
                    generate-color-render edge function.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* How It Works */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">How AI Auto-Fix Works</h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li className="text-sm">Collects all flagged renders and user feedback for the selected tool</li>
            <li className="text-sm">Uses AI to analyze patterns and identify root causes of quality issues</li>
            <li className="text-sm">Generates specific, actionable prompt improvements</li>
            <li className="text-sm">Recommends technical parameter adjustments</li>
            <li className="text-sm">Sends detailed report to admin email</li>
            <li className="text-sm">Optionally auto-regenerates flagged renders with improved prompts</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
