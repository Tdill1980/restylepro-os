export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  html_content: string;
  text_content: string | null;
  from_name: string | null;
  from_email: string | null;
  merge_tags: string[];
  category: 'transactional' | 'marketing' | 'notification';
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'divider' | 'footer';
  content: Record<string, any>;
}

export const MERGE_TAGS = [
  { tag: 'customer_name', description: "Customer's full name" },
  { tag: 'customer_email', description: "Customer's email address" },
  { tag: 'design_name', description: 'Design or pattern name' },
  { tag: 'vehicle_name', description: 'Year Make Model' },
  { tag: 'download_url', description: 'Download link for files' },
  { tag: 'expiry_date', description: 'Link expiration date' },
  { tag: 'order_id', description: 'Order reference number' },
  { tag: 'shop_name', description: 'Shop branding name' },
  { tag: 'app_url', description: 'Application URL' },
  { tag: 'magic_link', description: 'Magic link for authentication' },
  { tag: 'render_type', description: 'Type of render' },
  { tag: 'render_id', description: 'Render ID' },
  { tag: 'rating', description: 'Quality rating' },
  { tag: 'flag_reason', description: 'Reason for flagging' },
  { tag: 'admin_url', description: 'Admin panel URL' },
  { tag: 'current_year', description: 'Current year (dynamic)' },
];

export const CATEGORIES = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'notification', label: 'Notification' },
];
