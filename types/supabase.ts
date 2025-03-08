export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          type: string;
          blockchain: string;
          roi: number;
          description: string;
          tvl: string;
          audit_url: string | null;
          website: string;
          approved: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          blockchain: string;
          roi: number;
          description: string;
          tvl: string;
          audit_url?: string | null;
          website: string;
          approved?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          blockchain?: string;
          roi?: number;
          description?: string;
          tvl?: string;
          audit_url?: string | null;
          website?: string;
          approved?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          date: string;
          author: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          date: string;
          author: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          date?: string;
          author?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type DbTables = Database['public']['Tables'];
export type TableNames = keyof DbTables;

export type ProfileRow = DbTables['profiles']['Row'];
export type ProfileInsert = DbTables['profiles']['Insert'];
export type ProfileUpdate = DbTables['profiles']['Update'];

export type ProjectRow = DbTables['projects']['Row'];
export type ProjectInsert = DbTables['projects']['Insert'];
export type ProjectUpdate = DbTables['projects']['Update'];

export type BlogPostRow = DbTables['blog_posts']['Row'];
export type BlogPostInsert = DbTables['blog_posts']['Insert'];
export type BlogPostUpdate = DbTables['blog_posts']['Update'];
