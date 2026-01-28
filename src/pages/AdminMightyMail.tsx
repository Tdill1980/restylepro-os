import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TemplateList } from '@/components/mightymail/TemplateList';
import { TemplateEditor } from '@/components/mightymail/TemplateEditor';
import { EmailTemplate } from '@/components/mightymail/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminMightyMail() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as EmailTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setView('edit');
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setSelectedTemplate(null);
    fetchTemplates();
  };

  const handleSave = async (templateData: Partial<EmailTemplate>) => {
    try {
      if (templateData.id) {
        // Update existing
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateData.name,
            slug: templateData.slug,
            description: templateData.description,
            subject: templateData.subject,
            html_content: templateData.html_content,
            category: templateData.category,
            from_name: templateData.from_name,
            from_email: templateData.from_email,
            merge_tags: templateData.merge_tags,
          })
          .eq('id', templateData.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: templateData.name,
            slug: templateData.slug,
            description: templateData.description,
            subject: templateData.subject,
            html_content: templateData.html_content,
            category: templateData.category,
            from_name: templateData.from_name,
            from_email: templateData.from_email,
            merge_tags: templateData.merge_tags,
          });

        if (error) throw error;
      }

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      if (error.code === '23505') {
        throw new Error('A template with this slug already exists');
      }
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', deleteTemplate.id);

      if (error) throw error;
      toast.success('Template deleted');
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setDeleteTemplate(null);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      toast.success(template.is_active ? 'Template deactivated' : 'Template activated');
      await fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const newSlug = `${template.slug}-copy`;
      const newName = `${template.name} (Copy)`;
      
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: newName,
          slug: newSlug,
          description: template.description,
          subject: template.subject,
          html_content: template.html_content,
          category: template.category,
          from_name: template.from_name,
          from_email: template.from_email,
          merge_tags: template.merge_tags,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Template duplicated');
      await fetchTemplates();
      
      // Open the duplicated template for editing
      if (data) {
        setSelectedTemplate(data as EmailTemplate);
        setView('edit');
      }
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      if (error.code === '23505') {
        toast.error('A template with this slug already exists. Try a different name.');
      } else {
        toast.error('Failed to duplicate template');
      }
    }
  };

  const handleSendTest = async (template: EmailTemplate, email: string) => {
    // First save the template to ensure latest content is used
    await handleSave(template);
    
    // Call the send-templated-email edge function with sample data
    const { data, error } = await supabase.functions.invoke('send-templated-email', {
      body: {
        templateSlug: template.slug,
        to: email,
        mergeData: {
          customer_name: 'Test Customer',
          customer_email: email,
          design_name: 'Sample Design',
          vehicle_name: '2024 Porsche 911',
          download_url: 'https://example.com/download',
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          order_id: 'TEST-12345',
          shop_name: 'RestylePro Test Shop',
        },
      },
    });

    if (error) {
      console.error('Error sending test email:', error);
      throw error;
    }

    console.log('Test email sent:', data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/50">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MightyMail</h1>
                <p className="text-sm text-muted-foreground">Email Template Builder</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : view === 'list' ? (
          <TemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={setDeleteTemplate}
            onCreate={handleCreate}
            onToggleActive={handleToggleActive}
            onDuplicate={handleDuplicate}
          />
        ) : (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSave}
            onBack={handleBack}
            onSendTest={handleSendTest}
          />
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
