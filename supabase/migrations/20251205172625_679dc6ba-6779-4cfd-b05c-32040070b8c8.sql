-- Create email_templates table for MightyMail
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL DEFAULT '',
  text_content TEXT,
  from_name TEXT DEFAULT 'RestylePro',
  from_email TEXT DEFAULT 'onboarding@resend.dev',
  merge_tags JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'transactional',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public read for active templates (for edge functions)
CREATE POLICY "Service role can read templates"
ON public.email_templates
FOR SELECT
USING (is_active = true);

-- Create updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default templates
INSERT INTO public.email_templates (slug, name, description, subject, html_content, merge_tags, category) VALUES
('design-pack-delivery', 'Design Pack Delivery', 'Sent when customer purchases design pack', 'Your {{design_name}} Design Pack is Ready!', '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #333;">Your Design Pack is Ready!</h1><p>Hi {{customer_name}},</p><p>Your <strong>{{design_name}}</strong> design pack for the <strong>{{vehicle_name}}</strong> is ready for download.</p><a href="{{download_url}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Download Design Pack</a><p style="color: #666; font-size: 14px;">This link expires on {{expiry_date}}.</p><hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"><p style="color: #999; font-size: 12px;">© {{current_year}} RestylePro. All rights reserved.</p></body></html>', '["customer_name", "customer_email", "design_name", "vehicle_name", "download_url", "expiry_date", "current_year"]', 'transactional'),
('welcome', 'Welcome Email', 'Sent to new users after signup', 'Welcome to RestylePro, {{customer_name}}!', '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #333;">Welcome to RestylePro!</h1><p>Hi {{customer_name}},</p><p>Thanks for joining RestylePro Visualizer Suite. Start creating stunning wrap visualizations today!</p><a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Start Designing</a><hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"><p style="color: #999; font-size: 12px;">© {{current_year}} RestylePro. All rights reserved.</p></body></html>', '["customer_name", "customer_email", "app_url", "current_year"]', 'transactional'),
('quality-alert', 'Quality Alert', 'Admin notification for quality threshold alerts', 'Quality Alert: {{render_type}} Render Flagged', '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #dc2626;">Quality Alert</h1><p>A render has been flagged for quality review:</p><ul><li><strong>Type:</strong> {{render_type}}</li><li><strong>Render ID:</strong> {{render_id}}</li><li><strong>Rating:</strong> {{rating}}/5</li><li><strong>Reason:</strong> {{flag_reason}}</li></ul><a href="{{admin_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Review in Admin</a></body></html>', '["render_type", "render_id", "rating", "flag_reason", "admin_url", "current_year"]', 'notification'),
('tester-invite', 'Tester Invitation', 'Magic link invitation for affiliate testers', 'You''re Invited to Test RestylePro!', '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #333;">Welcome to the RestylePro Beta!</h1><p>Hi {{customer_name}},</p><p>You''ve been invited to test RestylePro Visualizer Suite as an affiliate partner.</p><a href="{{magic_link}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Access RestylePro</a><p style="color: #666; font-size: 14px;">This link is valid for 7 days and gives you unlimited access to all tools.</p><hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"><p style="color: #999; font-size: 12px;">© {{current_year}} RestylePro. All rights reserved.</p></body></html>', '["customer_name", "customer_email", "magic_link", "current_year"]', 'transactional');