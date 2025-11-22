export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  category: string;
  url?: string;
  image?: string;
  tags?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  currencies?: string[]; // Related cryptocurrencies
}

export interface NewsResponse {
  articles: NewsItem[];
  totalResults: number;
  status: string;
}

export interface NewsApiParams {
  query?: string;
  category?: string;
  language?: string;
  sortBy?: "publishedAt" | "popularity" | "relevancy";
  pageSize?: number;
  page?: number;
  from?: string;
  to?: string;
}

export interface CryptoNewsApiParams extends NewsApiParams {
  currencies?: string[];
  filter?: "rising" | "hot" | "bullish" | "bearish";
  region?: string;
}
