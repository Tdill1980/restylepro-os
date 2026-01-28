import { useState } from 'react';
import { Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplatePreviewProps {
  html: string;
  subject: string;
}

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  customer_name: 'John Smith',
  customer_email: 'john@example.com',
  design_name: 'Carbon Fiber Pro',
  vehicle_name: '2024 Porsche 911 GT3',
  download_url: 'https://restylepro.com/download/abc123',
  expiry_date: 'December 15, 2025',
  order_id: 'ORD-2024-001234',
  shop_name: 'Elite Wraps Studio',
  app_url: 'https://restylepro.com',
  magic_link: 'https://restylepro.com/auth/magic?token=xyz',
  render_type: 'ColorPro',
  render_id: 'render-12345',
  rating: '2',
  flag_reason: 'Color accuracy issue',
  admin_url: 'https://restylepro.com/admin/quality',
  current_year: new Date().getFullYear().toString(),
};

export function TemplatePreview({ html, subject }: TemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);

  // Replace merge tags with sample data
  const processedHtml = Object.entries(SAMPLE_DATA).reduce(
    (acc, [tag, value]) => acc.replace(new RegExp(`{{${tag}}}`, 'g'), value),
    html
  );

  const processedSubject = Object.entries(SAMPLE_DATA).reduce(
    (acc, [tag, value]) => acc.replace(new RegExp(`{{${tag}}}`, 'g'), value),
    subject
  );

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Preview Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Preview</h3>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'desktop' | 'mobile')}>
            <TabsList className="h-8">
              <TabsTrigger value="desktop" className="h-7 px-2">
                <Monitor className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="h-7 px-2">
                <Smartphone className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setKey(k => k + 1)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Header Preview */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-16">From:</span>
            <span className="text-foreground">RestylePro &lt;onboarding@resend.dev&gt;</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-16">To:</span>
            <span className="text-foreground">{SAMPLE_DATA.customer_email}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-16">Subject:</span>
            <span className="text-foreground font-medium">{processedSubject}</span>
          </div>
        </div>
      </div>

      {/* Email Body Preview */}
      <div 
        className={`bg-white transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'max-w-full'
        }`}
      >
        <iframe
          key={key}
          srcDoc={processedHtml}
          className="w-full h-[500px] border-0"
          title="Email Preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
