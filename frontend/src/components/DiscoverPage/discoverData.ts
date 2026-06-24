import { getPlaceholderImage } from './placeholderImages';

export type DiscoverEvent = {
  id: string;
  category: string;
  title: string;
  organizer: string;
  dateLabel: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  badge: string;
  distance: string;
  rating: number;
  description: string;
};

export type DiscoverVenue = {
  id: string;
  name: string;
  image: string;
  distance: string;
  rating: number;
  city: string;
  description: string;
};

export type Recommendation = {
  id: string;
  title: string;
  category: string;
  reason: string;
  image: string;
  location: string;
};

export const DISCOVER_CATEGORIES = [
  'All',
  'Cricket',
  'Football',
  'Basketball',
  'Tennis',
  'Pickleball',
  'Badminton',
  'Running',
  'Music / DJ',
  'Screening',
  'Clubbing',
  'Cosplaying',
  'Food Events',
  'More',
];

export const FEATURED_EVENT: DiscoverEvent = {
  id: 'featured-1',
  category: 'Cricket',
  title: 'Hyderabad T10 Night Cup',
  organizer: 'Gully Cricket Co.',
  dateLabel: 'May 24, 8:00 PM',
  time: '8:00 PM',
  location: 'Gachibowli Stadium, Hyderabad',
  venue: 'Gachibowli Stadium',
  image: 'https://images.unsplash.com/photo-1531521514432-8f6a3a202e90?w=800&q=80',
  badge: 'Premium',
  distance: '3.2 km',
  rating: 4.9,
  description:
    'A premium nighttime T10 cricket tournament beneath Hyderabad lights. Secure your seat and join the high-energy league.',
};

export const TRENDING_EVENTS: DiscoverEvent[] = [
  {
    id: 'trending-1',
    category: 'Cricket',
    title: 'Hyderabad T10 Night Cup',
    organizer: 'Gully Cricket Co.',
    dateLabel: 'May 24, 8:00 PM',
    time: '8:00 PM',
    location: 'Gachibowli Stadium, Hyderabad',
    venue: 'Gachibowli Stadium',
    image: 'https://images.unsplash.com/photo-1531521514432-8f6a3a202e90?w=800&q=80',
    badge: 'Featured',
    distance: '3.2 km',
    rating: 4.9,
    description: 'A premium nighttime T10 cricket tournament beneath Hyderabad lights. Secure your seat and join the high-energy league.',
  },
  {
    id: 'trending-2',
    category: 'Football',
    title: 'City Football League',
    organizer: 'City Football Union',
    dateLabel: 'May 25, 6:30 PM',
    time: '6:30 PM',
    location: 'Jubilee Hills Arena, Hyderabad',
    venue: 'Jubilee Hills Arena',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    badge: 'Live',
    distance: '4.8 km',
    rating: 4.8,
    description: 'A thrilling professional football league featuring top local clubs with VIP hospitality.',
  },
  {
    id: 'trending-3',
    category: 'Badminton',
    title: 'Open Badminton Championship',
    organizer: 'Zenex Sports',
    dateLabel: 'May 24, 9:00 AM',
    time: '9:00 AM',
    location: 'Pullela Gopichand Academy',
    venue: 'Pullela Gopichand Academy',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=800&q=80',
    badge: 'Premium',
    distance: '5.2 km',
    rating: 4.7,
    description: 'An elite badminton championship with professional-grade courts and world-class coaching.',
  },
  {
    id: 'trending-4',
    category: 'Basketball',
    title: 'Hyderabad Hoops Challenge',
    organizer: 'Pulse Arena',
    dateLabel: 'May 28, 6:00 PM',
    time: '6:00 PM',
    location: 'Teamsport Arena, HITEC City',
    venue: 'Teamsport Arena',
    image: 'https://images.unsplash.com/photo-1546519638-68711109d298?w=800&q=80',
    badge: 'New',
    distance: '5.5 km',
    rating: 4.6,
    description: 'A fast-paced basketball showcase with streetball energy and arena lighting.',
  },
  {
    id: 'trending-5',
    category: 'Tennis',
    title: 'Weekend Tennis Open',
    organizer: 'Ace Serve Club',
    dateLabel: 'May 26, 4:00 PM',
    time: '4:00 PM',
    location: 'Tennis Park Hyd, Secunderabad',
    venue: 'Tennis Park Hyd',
    image: 'https://images.unsplash.com/photo-1554224311-beee415c15fa?w=800&q=80',
    badge: 'Popular',
    distance: '7.0 km',
    rating: 4.5,
    description: 'Premium courts, coaching demos, and a social tennis festival vibe.',
  },
];

export const POPULAR_VENUES: DiscoverVenue[] = [
  {
    id: 'venue-1',
    name: 'Neon Arena',
    image: 'https://images.unsplash.com/photo-1587280591033-7461351ceb21?w=800&q=80',
    distance: '2.7 km',
    rating: 4.9,
    city: 'HITEC City',
    description: 'A sleek venue designed for premium sports nights and neon-lit competitions.',
  },
  {
    id: 'venue-2',
    name: 'Pulse Stadium',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    distance: '5.1 km',
    rating: 4.8,
    city: 'Madhapur',
    description: 'Modern facilities with VIP lounges, stadium seating, and exclusive event experiences.',
  },
  {
    id: 'venue-3',
    name: 'Olympus Fields',
    image: 'https://images.unsplash.com/photo-1527233666038-923d64024ab2?w=800&q=80',
    distance: '8.4 km',
    rating: 4.7,
    city: 'Banjara Hills',
    description: 'A luxurious complex for curated matches, music events, and premium dining.',
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Champions Night Football',
    category: 'Football',
    reason: 'Based on your recent match searches and energy picks.',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    location: 'Gachibowli Sport Complex',
  },
  {
    id: 'rec-2',
    title: 'Glow Cricket Festival',
    category: 'Cricket',
    reason: 'Recommended because you saved premium evening cricket events.',
    image: 'https://images.unsplash.com/photo-1531521514432-8f6a3a202e90?w=800&q=80',
    location: 'HITEC City Turf',
  },
  {
    id: 'rec-3',
    title: 'Soundwave Live DJ',
    category: 'Music',
    reason: 'A match-adjacent music experience to complement game nights.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    location: 'Skyline Lounge',
  },
];
