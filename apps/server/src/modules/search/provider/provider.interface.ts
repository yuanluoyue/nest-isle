export interface SearchItem {
  id: string;
  provider: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  url: string;
  score?: number;
}

export interface SearchProvider {
  readonly name: string;
  search(keyword: string, userId: string, permissions: string[]): Promise<SearchItem[]>;
}
