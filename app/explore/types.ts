export type ContentSource = 'nasa_apod' | 'user_post';

export interface ExploreContent {
  source_type: ContentSource;
  source_id: string;
  title: string | null;
  description: string | null;
  content_text: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  author_name: string | null;
  author_id: string | null;
  author_avatar: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  created_at: string;
  original_created_at: string;
  tags: string[];
  categories: string[];
  gradient_colors?: string[]; // Untuk text-to-image
}

export interface TrendingHashtag {
  hashtag: string;
  post_count: number;
  last_used: string;
}

export interface ExploreFilter {
  source_type?: ContentSource | 'all';
  sort_by: 'latest' | 'popular' | 'trending';
  time_range?: 'day' | 'week' | 'month' | 'all';
  search?: string;
}