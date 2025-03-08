export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
};

export type BlogPostWithContent = BlogPost & {
  content: string;
};
