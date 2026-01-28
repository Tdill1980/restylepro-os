export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approvemode_carousel: {
        Row: {
          before_url: string | null
          color_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          media_url: string
          name: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          vehicle_name: string | null
        }
        Insert: {
          before_url?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url: string
          name: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Update: {
          before_url?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url?: string
          name?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Relationships: []
      }
      approvemode_examples: {
        Row: {
          after_url: string
          before_url: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          after_url: string
          before_url: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          after_url?: string
          before_url?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      approvemode_videos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      color_visualizations: {
        Row: {
          admin_notes: string | null
          color_hex: string
          color_name: string
          created_at: string | null
          custom_design_url: string | null
          custom_styling_prompt_key: string | null
          custom_swatch_url: string | null
          customer_email: string
          design_file_name: string | null
          emailed_at: string | null
          finish_type: string
          generation_status: string | null
          has_360_spin: boolean | null
          has_metallic_flakes: boolean | null
          id: string
          infusion_color_id: string | null
          is_featured_hero: boolean | null
          is_saved: boolean | null
          mode_type: string | null
          organization_id: string | null
          render_urls: Json | null
          spin_view_count: number | null
          subscription_tier: string | null
          updated_at: string | null
          uses_custom_design: boolean | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type: string | null
          vehicle_year: number
        }
        Insert: {
          admin_notes?: string | null
          color_hex: string
          color_name: string
          created_at?: string | null
          custom_design_url?: string | null
          custom_styling_prompt_key?: string | null
          custom_swatch_url?: string | null
          customer_email: string
          design_file_name?: string | null
          emailed_at?: string | null
          finish_type: string
          generation_status?: string | null
          has_360_spin?: boolean | null
          has_metallic_flakes?: boolean | null
          id?: string
          infusion_color_id?: string | null
          is_featured_hero?: boolean | null
          is_saved?: boolean | null
          mode_type?: string | null
          organization_id?: string | null
          render_urls?: Json | null
          spin_view_count?: number | null
          subscription_tier?: string | null
          updated_at?: string | null
          uses_custom_design?: boolean | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type?: string | null
          vehicle_year: number
        }
        Update: {
          admin_notes?: string | null
          color_hex?: string
          color_name?: string
          created_at?: string | null
          custom_design_url?: string | null
          custom_styling_prompt_key?: string | null
          custom_swatch_url?: string | null
          customer_email?: string
          design_file_name?: string | null
          emailed_at?: string | null
          finish_type?: string
          generation_status?: string | null
          has_360_spin?: boolean | null
          has_metallic_flakes?: boolean | null
          id?: string
          infusion_color_id?: string | null
          is_featured_hero?: boolean | null
          is_saved?: boolean | null
          mode_type?: string | null
          organization_id?: string | null
          render_urls?: Json | null
          spin_view_count?: number | null
          subscription_tier?: string | null
          updated_at?: string | null
          uses_custom_design?: boolean | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_type?: string | null
          vehicle_year?: number
        }
        Relationships: []
      }
      custom_styling_jobs: {
        Row: {
          color_zones: Json | null
          created_at: string
          cut_file_urls: Json | null
          generation_completed_at: string | null
          generation_started_at: string | null
          hero_render_url: string | null
          id: string
          material_estimate: Json | null
          reference_image_url: string | null
          render_urls: Json | null
          status: string
          styling_prompt: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: string
          visualization_id: string | null
        }
        Insert: {
          color_zones?: Json | null
          created_at?: string
          cut_file_urls?: Json | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          hero_render_url?: string | null
          id?: string
          material_estimate?: Json | null
          reference_image_url?: string | null
          render_urls?: Json | null
          status?: string
          styling_prompt: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: string
          visualization_id?: string | null
        }
        Update: {
          color_zones?: Json | null
          created_at?: string
          cut_file_urls?: Json | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          hero_render_url?: string | null
          id?: string
          material_estimate?: Json | null
          reference_image_url?: string | null
          render_urls?: Json | null
          status?: string
          styling_prompt?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: string
          visualization_id?: string | null
        }
        Relationships: []
      }
      design_pack_purchases: {
        Row: {
          created_at: string | null
          design_id: string
          download_expires_at: string | null
          download_url: string | null
          downloaded_at: string | null
          email: string
          id: string
          order_metadata: Json | null
          purchase_type: string
          stripe_checkout_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          design_id: string
          download_expires_at?: string | null
          download_url?: string | null
          downloaded_at?: string | null
          email: string
          id?: string
          order_metadata?: Json | null
          purchase_type: string
          stripe_checkout_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string
          download_expires_at?: string | null
          download_url?: string | null
          downloaded_at?: string | null
          email?: string
          id?: string
          order_metadata?: Json | null
          purchase_type?: string
          stripe_checkout_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_pack_purchases_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designpanelpro_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      design_revision_history: {
        Row: {
          created_at: string | null
          design_id: string | null
          id: string
          original_url: string | null
          revised_url: string | null
          revision_prompt: string
          tool: string
          user_id: string | null
          view_type: string | null
        }
        Insert: {
          created_at?: string | null
          design_id?: string | null
          id?: string
          original_url?: string | null
          revised_url?: string | null
          revision_prompt: string
          tool: string
          user_id?: string | null
          view_type?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string | null
          id?: string
          original_url?: string | null
          revised_url?: string | null
          revision_prompt?: string
          tool?: string
          user_id?: string | null
          view_type?: string | null
        }
        Relationships: []
      }
      designpanelpro_carousel: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          media_url: string
          name: string
          pattern_name: string | null
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url: string
          name: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url?: string
          name?: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Relationships: []
      }
      designpanelpro_patterns: {
        Row: {
          ai_generated_name: string | null
          category: string | null
          clean_display_url: string | null
          created_at: string | null
          example_render_url: string | null
          id: string
          is_active: boolean | null
          is_curated: boolean | null
          media_url: string
          name: string
          production_file_url: string | null
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_generated_name?: string | null
          category?: string | null
          clean_display_url?: string | null
          created_at?: string | null
          example_render_url?: string | null
          id?: string
          is_active?: boolean | null
          is_curated?: boolean | null
          media_url: string
          name: string
          production_file_url?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_generated_name?: string | null
          category?: string | null
          clean_display_url?: string | null
          created_at?: string | null
          example_render_url?: string | null
          id?: string
          is_active?: boolean | null
          is_curated?: boolean | null
          media_url?: string
          name?: string
          production_file_url?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      designpanelpro_videos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          renders_unlocked: boolean | null
          social_shared: boolean | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          renders_unlocked?: boolean | null
          social_shared?: boolean | null
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          renders_unlocked?: boolean | null
          social_shared?: boolean | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          is_active: boolean | null
          merge_tags: Json | null
          name: string
          slug: string
          subject: string
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          merge_tags?: Json | null
          name: string
          slug: string
          subject: string
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          merge_tags?: Json | null
          name?: string
          slug?: string
          subject?: string
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fadewrap_designs: {
        Row: {
          created_at: string | null
          fade_category: string | null
          fade_name: string | null
          finish: string | null
          gradient_settings: Json | null
          id: string
          pattern_id: string | null
          preview_image_url: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: string | null
        }
        Insert: {
          created_at?: string | null
          fade_category?: string | null
          fade_name?: string | null
          finish?: string | null
          gradient_settings?: Json | null
          id?: string
          pattern_id?: string | null
          preview_image_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Update: {
          created_at?: string | null
          fade_category?: string | null
          fade_name?: string | null
          finish?: string | null
          gradient_settings?: Json | null
          id?: string
          pattern_id?: string | null
          preview_image_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fadewrap_designs_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "fadewraps_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      fadewraps_carousel: {
        Row: {
          created_at: string | null
          gradient_direction: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          media_url: string
          name: string
          pattern_name: string | null
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string | null
          gradient_direction?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url: string
          name: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string | null
          gradient_direction?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url?: string
          name?: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Relationships: []
      }
      fadewraps_patterns: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fadewraps_videos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_carousel: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_showcase: {
        Row: {
          alt_text: string
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text: string
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inkfusion_carousel: {
        Row: {
          color_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          media_url: string
          name: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          vehicle_name: string | null
        }
        Insert: {
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url: string
          name: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Update: {
          color_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url?: string
          name?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Relationships: []
      }
      inkfusion_swatches: {
        Row: {
          color_library: string
          created_at: string | null
          finish: string | null
          hex: string | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color_library?: string
          created_at?: string | null
          finish?: string | null
          hex?: string | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color_library?: string
          created_at?: string | null
          finish?: string | null
          hex?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inkfusion_videos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      manufacturer_colors: {
        Row: {
          created_at: string | null
          finish: string
          hex_confidence: number | null
          hex_source: string | null
          id: string
          is_ppf: boolean | null
          is_verified: boolean | null
          lab_a: number | null
          lab_b: number | null
          lab_l: number | null
          manufacturer: string
          official_hex: string
          official_name: string
          official_swatch_url: string | null
          product_code: string
          registry_version: string | null
          series: string | null
          source_file: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          finish?: string
          hex_confidence?: number | null
          hex_source?: string | null
          id?: string
          is_ppf?: boolean | null
          is_verified?: boolean | null
          lab_a?: number | null
          lab_b?: number | null
          lab_l?: number | null
          manufacturer: string
          official_hex: string
          official_name: string
          official_swatch_url?: string | null
          product_code: string
          registry_version?: string | null
          series?: string | null
          source_file?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          finish?: string
          hex_confidence?: number | null
          hex_source?: string | null
          id?: string
          is_ppf?: boolean | null
          is_verified?: boolean | null
          lab_a?: number | null
          lab_b?: number | null
          lab_l?: number | null
          manufacturer?: string
          official_hex?: string
          official_name?: string
          official_swatch_url?: string | null
          product_code?: string
          registry_version?: string | null
          series?: string | null
          source_file?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          attempted_content: string | null
          blocked_term: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_email: string
        }
        Insert: {
          attempted_content?: string | null
          blocked_term: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_email: string
        }
        Update: {
          attempted_content?: string | null
          blocked_term?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string
        }
        Relationships: []
      }
      panel_designs: {
        Row: {
          created_at: string | null
          finish: string | null
          id: string
          panel_id: string | null
          preview_image_url: string | null
          prompt_state: Json
          updated_at: string | null
          user_id: string | null
          vector_file_url: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: string | null
        }
        Insert: {
          created_at?: string | null
          finish?: string | null
          id?: string
          panel_id?: string | null
          preview_image_url?: string | null
          prompt_state?: Json
          updated_at?: string | null
          user_id?: string | null
          vector_file_url?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Update: {
          created_at?: string | null
          finish?: string | null
          id?: string
          panel_id?: string | null
          preview_image_url?: string | null
          prompt_state?: Json
          updated_at?: string | null
          user_id?: string | null
          vector_file_url?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_designs_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "designpanelpro_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_designs: {
        Row: {
          created_at: string | null
          finish: string | null
          id: string
          pattern_category: string | null
          pattern_image_url: string
          pattern_name: string | null
          pattern_scale: number | null
          preview_image_url: string | null
          product_id: string | null
          texture_profile: Json | null
          updated_at: string | null
          user_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: string | null
        }
        Insert: {
          created_at?: string | null
          finish?: string | null
          id?: string
          pattern_category?: string | null
          pattern_image_url: string
          pattern_name?: string | null
          pattern_scale?: number | null
          preview_image_url?: string | null
          product_id?: string | null
          texture_profile?: Json | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Update: {
          created_at?: string | null
          finish?: string | null
          id?: string
          pattern_category?: string | null
          pattern_image_url?: string
          pattern_name?: string | null
          pattern_scale?: number | null
          preview_image_url?: string | null
          product_id?: string | null
          texture_profile?: Json | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_designs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wbty_products"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_access_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          proof_id: string
          revoked: boolean | null
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          proof_id: string
          revoked?: boolean | null
          token?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          proof_id?: string
          revoked?: boolean | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_access_tokens_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          approved_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_notes: string | null
          film_or_design_name: string | null
          id: string
          manufacturer: string | null
          owner_user_id: string
          pdf_url: string | null
          render_urls: Json
          status: string | null
          tool_name: string
          updated_at: string | null
          vehicle_info: Json | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          film_or_design_name?: string | null
          id?: string
          manufacturer?: string | null
          owner_user_id: string
          pdf_url?: string | null
          render_urls?: Json
          status?: string | null
          tool_name: string
          updated_at?: string | null
          vehicle_info?: Json | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          film_or_design_name?: string | null
          id?: string
          manufacturer?: string | null
          owner_user_id?: string
          pdf_url?: string | null
          render_urls?: Json
          status?: string | null
          tool_name?: string
          updated_at?: string | null
          vehicle_info?: Json | null
        }
        Relationships: []
      }
      quote_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          product_type: string | null
          quote_id: string | null
          source: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          product_type?: string | null
          quote_id?: string | null
          source?: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          product_type?: string | null
          quote_id?: string | null
          source?: string
        }
        Relationships: []
      }
      render_quality_ratings: {
        Row: {
          auto_regenerated: boolean | null
          created_at: string | null
          flag_reason: string | null
          gradient_quality_score: number | null
          has_hard_line: boolean | null
          id: string
          is_flagged: boolean | null
          notes: string | null
          rating: number | null
          render_id: string
          render_type: string
          updated_at: string | null
          user_email: string | null
          validation_details: Json | null
        }
        Insert: {
          auto_regenerated?: boolean | null
          created_at?: string | null
          flag_reason?: string | null
          gradient_quality_score?: number | null
          has_hard_line?: boolean | null
          id?: string
          is_flagged?: boolean | null
          notes?: string | null
          rating?: number | null
          render_id: string
          render_type: string
          updated_at?: string | null
          user_email?: string | null
          validation_details?: Json | null
        }
        Update: {
          auto_regenerated?: boolean | null
          created_at?: string | null
          flag_reason?: string | null
          gradient_quality_score?: number | null
          has_hard_line?: boolean | null
          id?: string
          is_flagged?: boolean | null
          notes?: string | null
          rating?: number | null
          render_id?: string
          render_type?: string
          updated_at?: string | null
          user_email?: string | null
          validation_details?: Json | null
        }
        Relationships: []
      }
      render_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_golden_template: boolean | null
          prompt_signature: string
          rating: number | null
          render_urls: Json
          source_visualization_id: string | null
          updated_at: string | null
          use_count: number | null
          vehicle_signature: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_golden_template?: boolean | null
          prompt_signature: string
          rating?: number | null
          render_urls?: Json
          source_visualization_id?: string | null
          updated_at?: string | null
          use_count?: number | null
          vehicle_signature: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_golden_template?: boolean | null
          prompt_signature?: string
          rating?: number | null
          render_urls?: Json
          source_visualization_id?: string | null
          updated_at?: string | null
          use_count?: number | null
          vehicle_signature?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_templates_source_visualization_id_fkey"
            columns: ["source_visualization_id"]
            isOneToOne: false
            referencedRelation: "color_visualizations"
            referencedColumns: ["id"]
          },
        ]
      }
      render_usage: {
        Row: {
          billing_cycle_start: string
          created_at: string | null
          email: string
          id: string
          render_type: string
          tier: string
          user_id: string
        }
        Insert: {
          billing_cycle_start: string
          created_at?: string | null
          email: string
          id?: string
          render_type: string
          tier: string
          user_id: string
        }
        Update: {
          billing_cycle_start?: string
          created_at?: string | null
          email?: string
          id?: string
          render_type?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_profiles: {
        Row: {
          created_at: string | null
          default_include_disclaimer: boolean | null
          id: string
          phone: string | null
          shop_logo_url: string | null
          shop_name: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          default_include_disclaimer?: boolean | null
          id?: string
          phone?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          default_include_disclaimer?: boolean | null
          id?: string
          phone?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      tool_access_tiers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          required_tier: string
          tool_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          required_tier: string
          tool_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          required_tier?: string
          tool_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle_end: string
          billing_cycle_start: string
          created_at: string | null
          email: string
          id: string
          render_count: number | null
          render_reset_date: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_extra: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          created_at?: string | null
          email: string
          id?: string
          render_count?: number | null
          render_reset_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_extra?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          created_at?: string | null
          email?: string
          id?: string
          render_count?: number | null
          render_reset_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_extra?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicle_render_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          product_type: string
          swatch_id: string
          updated_at: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_type: string
          vehicle_year: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          product_type: string
          swatch_id: string
          updated_at?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type: string
          vehicle_year?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          product_type?: string
          swatch_id?: string
          updated_at?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string
          vehicle_year?: string | null
        }
        Relationships: []
      }
      vehicle_renders: {
        Row: {
          color_data: Json
          created_at: string | null
          id: string
          is_canonical_demo: boolean | null
          mode_type: string
          quality_verified: boolean | null
          reference_count: number | null
          render_url: string
          updated_at: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: string
        }
        Insert: {
          color_data: Json
          created_at?: string | null
          id?: string
          is_canonical_demo?: boolean | null
          mode_type: string
          quality_verified?: boolean | null
          reference_count?: number | null
          render_url: string
          updated_at?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: string
        }
        Update: {
          color_data?: Json
          created_at?: string | null
          id?: string
          is_canonical_demo?: boolean | null
          mode_type?: string
          quality_verified?: boolean | null
          reference_count?: number | null
          render_url?: string
          updated_at?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: string
        }
        Relationships: []
      }
      vinyl_reference_images: {
        Row: {
          color_characteristics: Json | null
          color_name: string
          created_at: string | null
          id: string
          image_type: string | null
          image_url: string
          is_verified: boolean | null
          manufacturer: string
          product_code: string | null
          score: number | null
          search_query: string | null
          source_url: string | null
          swatch_id: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          color_characteristics?: Json | null
          color_name: string
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          is_verified?: boolean | null
          manufacturer: string
          product_code?: string | null
          score?: number | null
          search_query?: string | null
          source_url?: string | null
          swatch_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          color_characteristics?: Json | null
          color_name?: string
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_verified?: boolean | null
          manufacturer?: string
          product_code?: string | null
          score?: number | null
          search_query?: string | null
          source_url?: string | null
          swatch_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vinyl_reference_images_swatch_id_fkey"
            columns: ["swatch_id"]
            isOneToOne: false
            referencedRelation: "vinyl_swatches"
            referencedColumns: ["id"]
          },
        ]
      }
      vinyl_swatch_search_cache: {
        Row: {
          created_at: string
          id: string
          results_json: Json
          search_query: string
          swatch_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          results_json: Json
          search_query: string
          swatch_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          results_json?: Json
          search_query?: string
          swatch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vinyl_swatch_search_cache_swatch_id_fkey"
            columns: ["swatch_id"]
            isOneToOne: false
            referencedRelation: "vinyl_swatches"
            referencedColumns: ["id"]
          },
        ]
      }
      vinyl_swatches: {
        Row: {
          ai_confidence: number | null
          chrome: boolean | null
          code: string | null
          color_type: string | null
          created_at: string | null
          created_by: string | null
          finish: string
          finish_profile: Json | null
          flake_level: string | null
          has_reference_bundle: boolean | null
          hex: string
          id: string
          is_flip_film: boolean | null
          lab: Json | null
          last_verified_at: string | null
          manufacturer: string
          material_type: string | null
          material_validated: boolean | null
          media_type: string | null
          media_url: string | null
          metallic: boolean | null
          metallic_flake: number | null
          name: string
          needs_reference_review: boolean | null
          pearl: boolean | null
          popularity_score: number | null
          ppf: boolean | null
          reference_image_count: number | null
          reflectivity: number | null
          search_count: number | null
          series: string | null
          source: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          ai_confidence?: number | null
          chrome?: boolean | null
          code?: string | null
          color_type?: string | null
          created_at?: string | null
          created_by?: string | null
          finish: string
          finish_profile?: Json | null
          flake_level?: string | null
          has_reference_bundle?: boolean | null
          hex: string
          id?: string
          is_flip_film?: boolean | null
          lab?: Json | null
          last_verified_at?: string | null
          manufacturer: string
          material_type?: string | null
          material_validated?: boolean | null
          media_type?: string | null
          media_url?: string | null
          metallic?: boolean | null
          metallic_flake?: number | null
          name: string
          needs_reference_review?: boolean | null
          pearl?: boolean | null
          popularity_score?: number | null
          ppf?: boolean | null
          reference_image_count?: number | null
          reflectivity?: number | null
          search_count?: number | null
          series?: string | null
          source?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          ai_confidence?: number | null
          chrome?: boolean | null
          code?: string | null
          color_type?: string | null
          created_at?: string | null
          created_by?: string | null
          finish?: string
          finish_profile?: Json | null
          flake_level?: string | null
          has_reference_bundle?: boolean | null
          hex?: string
          id?: string
          is_flip_film?: boolean | null
          lab?: Json | null
          last_verified_at?: string | null
          manufacturer?: string
          material_type?: string | null
          material_validated?: boolean | null
          media_type?: string | null
          media_url?: string | null
          metallic?: boolean | null
          metallic_flake?: number | null
          name?: string
          needs_reference_review?: boolean | null
          pearl?: boolean | null
          popularity_score?: number | null
          ppf?: boolean | null
          reference_image_count?: number | null
          reflectivity?: number | null
          search_count?: number | null
          series?: string | null
          source?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      wbty_carousel: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          media_url: string
          name: string
          pattern_name: string | null
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url: string
          name: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          media_url?: string
          name?: string
          pattern_name?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
        }
        Relationships: []
      }
      wbty_products: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          name: string
          price: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          name: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          name?: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wbty_videos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          media_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_generate_render: { Args: { user_email: string }; Returns: Json }
      get_tier_limit: { Args: { tier_name: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "tester"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "tester"],
    },
  },
} as const
