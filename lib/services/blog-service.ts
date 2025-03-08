import { getSupabaseClient } from "@/lib/supabase";
import { BlogPost, BlogPostWithContent } from "@/types/blog";

export async function getBlogPosts(options?: {
  page?: number;
  limit?: number;
  tag?: string;
  includeContent?: boolean;
}): Promise<BlogPost[]> {
  const supabase = getSupabaseClient();
  const {
    page = 1,
    limit = 10,
    tag,
    includeContent = false,
  } = options || {};

  const offset = (page - 1) * limit;

  // Start building query
  let query = supabase
    .from("blog_posts")
    .select(includeContent ? "*" : "id, title, slug, excerpt, date, author, tags");

  // Filter by tag if provided
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  // Apply pagination and ordering
  query = query
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  // Execute query
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error);
    throw new Error(`Error fetching blog posts: ${error.message}`);
  }

  return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found
      return null;
    }
    console.error("Error fetching blog post:", error);
    throw new Error(`Error fetching blog post: ${error.message}`);
  }

  return data as BlogPostWithContent;
}

export async function getBlogPostsByTag(tag: string, limit: number = 10): Promise<BlogPost[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, date, author, tags")
    .contains("tags", [tag])
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching blog posts by tag:", error);
    throw new Error(`Error fetching blog posts by tag: ${error.message}`);
  }

  return data as BlogPost[];
}

export async function getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, date, author, tags")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent blog posts:", error);
    throw new Error(`Error fetching recent blog posts: ${error.message}`);
  }

  return data as BlogPost[];
}

export async function getAllBlogTags(): Promise<string[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("tags");

  if (error) {
    console.error("Error fetching blog tags:", error);
    throw new Error(`Error fetching blog tags: ${error.message}`);
  }

  // Extract unique tags
  const allTags = data.flatMap(post => post.tags || []);
  const uniqueTags = [...new Set(allTags)];
  
  return uniqueTags;
}

export async function createBlogPost(post: Omit<BlogPostWithContent, 'id'>): Promise<BlogPostWithContent> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error("Error creating blog post:", error);
    throw new Error(`Error creating blog post: ${error.message}`);
  }

  return data as BlogPostWithContent;
}

export async function updateBlogPost(slug: string, updates: Partial<BlogPostWithContent>): Promise<BlogPostWithContent> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    throw new Error(`Error updating blog post: ${error.message}`);
  }

  return data as BlogPostWithContent;
}

export async function deleteBlogPost(slug: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("slug", slug);

  if (error) {
    console.error("Error deleting blog post:", error);
    throw new Error(`Error deleting blog post: ${error.message}`);
  }
}

export async function getBlogStats(): Promise<{
  totalPosts: number;
  totalAuthors: number;
  totalTags: number;
}> {
  const supabase = getSupabaseClient();
  
  // Get total posts count
  const { count, error: countError } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting blog posts:", countError);
    throw new Error(`Error counting blog posts: ${countError.message}`);
  }

  // Get all posts data for authors and tags
  const { data, error } = await supabase
    .from("blog_posts")
    .select("author, tags");

  if (error) {
    console.error("Error fetching blog stats:", error);
    throw new Error(`Error fetching blog stats: ${error.message}`);
  }

  // Count unique authors
  const authors = new Set(data.map(post => post.author));
  
  // Count unique tags
  const tags = new Set(data.flatMap(post => post.tags || []));

  return {
    totalPosts: count || 0,
    totalAuthors: authors.size,
    totalTags: tags.size,
  };
}
