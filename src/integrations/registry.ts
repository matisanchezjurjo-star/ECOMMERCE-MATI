import type { ProductSourceAdapter } from "./types";
import { alibaba1688Adapter } from "./alibaba-1688/adapter";
import { alibabaAdapter } from "./alibaba/adapter";
import { aliexpressAdapter } from "./aliexpress/adapter";
import { amazonAdapter } from "./amazon/adapter";
import { ebayAdapter } from "./ebay/adapter";
import { etsyAdapter } from "./etsy/adapter";
import { googleShoppingAdapter } from "./google-shopping/adapter";
import { googleTrendsAdapter } from "./google-trends/adapter";
import { instagramAdapter } from "./instagram/adapter";
import { madeInChinaAdapter } from "./made-in-china/adapter";
import { mercadoLibreAdapter } from "./mercadolibre/adapter";
import { metaAdsLibraryAdapter } from "./meta-ads-library/adapter";
import { pinterestAdapter } from "./pinterest/adapter";
import { redditAdapter } from "./reddit/adapter";
import { temuAdapter } from "./temu/adapter";
import { tiktokCreativeCenterAdapter } from "./tiktok-creative-center/adapter";
import { tiktokAdapter } from "./tiktok/adapter";
import { walmartAdapter } from "./walmart/adapter";

/** Every registered data source. Order roughly follows the spec's MVP phase priority. */
export const PRODUCT_SOURCE_ADAPTERS: ProductSourceAdapter[] = [
  mercadoLibreAdapter,
  amazonAdapter,
  redditAdapter,
  googleTrendsAdapter,
  aliexpressAdapter,
  metaAdsLibraryAdapter,
  tiktokCreativeCenterAdapter,
  tiktokAdapter,
  instagramAdapter,
  pinterestAdapter,
  etsyAdapter,
  walmartAdapter,
  ebayAdapter,
  googleShoppingAdapter,
  alibabaAdapter,
  alibaba1688Adapter,
  madeInChinaAdapter,
  temuAdapter,
];

export function getAdapter(key: string): ProductSourceAdapter | undefined {
  return PRODUCT_SOURCE_ADAPTERS.find((a) => a.key === key);
}

export function getSupplierAdapters(): ProductSourceAdapter[] {
  return PRODUCT_SOURCE_ADAPTERS.filter((a) => a.category === "supplier");
}
