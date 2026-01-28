import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Loader2, Maximize2 } from 'lucide-react';
import { FullScreenRenderModal } from './FullScreenRenderModal';

interface RenderView {
  type: string;
  url: string;
}

interface RenderResultsProps {
  views: RenderView[];
  isPolling?: boolean;
  expectedViewCount?: number;
  onBack: () => void;
}

const VIEW_LABELS: Record<string, string> = {
  front: 'Hero View',
  side: 'Side View',
  rear: 'Rear View',
  top: 'Top View'
};

export function RenderResults({ views, isPolling, expectedViewCount = 1, onBack }: RenderResultsProps) {
  const [selectedView, setSelectedView] = useState<RenderView | null>(null);

  const downloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const skeletonCount = expectedViewCount - views.length;

  // Sort views in desired order: front, side, rear, top
  const sortedViews = [...views].sort((a, b) => {
    const order = ['front', 'side', 'rear', 'top'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generated Renders</h2>
          <p className="text-sm text-muted-foreground">
            {views.length} of {expectedViewCount} views ready
            {isPolling && ' • Generating more...'}
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          Generate Another
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedViews.map((view) => (
          <Card 
            key={view.type}
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg group"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{VIEW_LABELS[view.type] || view.type}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(view.url, `${view.type}-render.png`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedView(view)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div 
                className="relative overflow-hidden rounded-lg"
                onClick={() => setSelectedView(view)}
              >
                <img
                  src={view.url}
                  alt={VIEW_LABELS[view.type]}
                  className="w-full rounded-lg transition-transform group-hover:scale-105"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {isPolling && skeletonCount > 0 && Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <Skeleton className="w-full aspect-video rounded-lg" />
              <p className="text-xs text-center text-muted-foreground">Generating...</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FullScreenRenderModal
        view={selectedView}
        onClose={() => setSelectedView(null)}
        onDownload={downloadImage}
      />
    </div>
  );
}