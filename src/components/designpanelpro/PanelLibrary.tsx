import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PanelLibraryProps {
  panels: any[];
  selectedPanel: any;
  onSelectPanel: (panel: any) => void;
  isLoading: boolean;
}

const PanelCard = ({ panel, isSelected, onSelect }: { panel: any; isSelected: boolean; onSelect: () => void }) => {
  // STRICT: Only use thumbnail_url for library display - media_url is for AI generation only
  // Skip panels without thumbnail_url (they should not appear in public library)
  if (!panel.thumbnail_url) return null;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] overflow-hidden relative select-none",
        isSelected && "ring-2 ring-primary bg-primary/10 shadow-lg shadow-primary/20"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative bg-muted/30 pointer-events-none">
        <img
          src={panel.thumbnail_url}
          alt={panel.name}
          className="w-full h-auto object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      <div className="p-3 bg-background pointer-events-none">
        <p className="text-sm font-medium truncate">{panel.ai_generated_name || panel.name}</p>
      </div>
    </Card>
  );
};

export const PanelLibrary = ({ 
  panels, 
  selectedPanel, 
  onSelectPanel, 
  isLoading 
}: PanelLibraryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-video" />
        ))}
      </div>
    );
  }

  if (!panels || panels.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No curated panels available yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center py-2 px-3 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-xs font-medium text-foreground">
          Click any design to select it
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto p-1 scrollbar-blue">
        {panels.map((panel) => (
          <PanelCard 
            key={panel.id}
            panel={panel}
            isSelected={selectedPanel?.id === panel.id}
            onSelect={() => onSelectPanel(panel)}
          />
        ))}
      </div>
    </div>
  );
};
