import {
  DISCOVER_CATEGORIES,
  FEATURED_EVENT,
  TRENDING_EVENTS,
  POPULAR_VENUES,
  RECOMMENDATIONS,
  type DiscoverEvent,
  type DiscoverVenue,
  type Recommendation,
} from './discoverData';

export type DiscoverPayload = {
  categories: string[];
  featuredEvent: DiscoverEvent;
  trendingEvents: DiscoverEvent[];
  popularVenues: DiscoverVenue[];
  recommendations: Recommendation[];
};

const delay = (ms = 430) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchDiscoverPageData(): Promise<DiscoverPayload> {
  await delay();
  return {
    categories: DISCOVER_CATEGORIES,
    featuredEvent: FEATURED_EVENT,
    trendingEvents: TRENDING_EVENTS,
    popularVenues: POPULAR_VENUES,
    recommendations: RECOMMENDATIONS,
  };
}
