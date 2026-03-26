// Search domain types based on specs/contracts/http/search-api.md

export type SearchSortOrder = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export interface SearchProductItem {
  productId: string;
  name: string;
  price: number;
  status: string;
  thumbnailUrl: string;
  categoryId: string;
  score: number;
}

export interface CategoryFacet {
  id: string;
  name: string;
  count: number;
}

export interface PriceRangeFacet {
  min: number;
  max: number;
  count: number;
}

export interface SearchFacets {
  categories: CategoryFacet[];
  priceRanges: PriceRangeFacet[];
}

export interface SearchRequest {
  q: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sort?: SearchSortOrder;
  page?: number;
  size?: number;
}

export interface SearchResponse {
  query: string;
  content: SearchProductItem[];
  facets: SearchFacets;
  page: number;
  size: number;
  totalElements: number;
}
