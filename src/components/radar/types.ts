import type { ProductDTO } from "@/lib/products/dto";

export type ProductListItem = ProductDTO & { isWatching: boolean };

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RadarFacets {
  categories: string[];
  countries: string[];
  sources: { key: string; name: string }[];
}
