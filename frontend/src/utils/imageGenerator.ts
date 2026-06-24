/**
 * Curated Mock Image Generator for Zenex V1
 * Returns realistic, high-quality Unsplash image URLs for sports, entertainment, and user profiles
 */

const SPORTS_IMAGES = {
  cricket: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  running: [
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  pickleball: [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  football: [
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  tennis: [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&h=250&q=80'
  ]
};

const ENTERTAINMENT_IMAGES = {
  openmic: [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  foodfest: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  concert: [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=250&q=80'
  ],
  theatre: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&h=250&q=80',
    'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=400&h=250&q=80'
  ]
};

const PORTRAITS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80', // Arjun Reddy
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', // Rahul Sharma
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', // Neha Reddy
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', // Aman Khan
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80', // Priya Singh
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', // Vikram
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'  // Aisha
];

const COMMUNITY_IMAGES = [
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&h=250&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&h=250&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&h=250&q=80'
];

type ImageCategory =
  | 'sports'
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'badminton'
  | 'running'
  | 'pickleball'
  | 'concert'
  | 'openmic'
  | 'foodfest'
  | 'theatre'
  | 'community'
  | 'user'
  | 'event'
  | 'profile';

/**
 * Generate a realistic placeholder image URL using Unsplash images
 */
export function generatePlaceholderImage(
  category: ImageCategory,
  index: number = 0,
  _width?: number,
  _height?: number
): string {
  const i = Math.abs(index);
  
  if (category === 'cricket') {
    return SPORTS_IMAGES.cricket[i % SPORTS_IMAGES.cricket.length];
  }
  if (category === 'badminton') {
    return SPORTS_IMAGES.badminton[i % SPORTS_IMAGES.badminton.length];
  }
  if (category === 'running') {
    return SPORTS_IMAGES.running[i % SPORTS_IMAGES.running.length];
  }
  if (category === 'pickleball') {
    return SPORTS_IMAGES.pickleball[i % SPORTS_IMAGES.pickleball.length];
  }
  if (category === 'football') {
    return SPORTS_IMAGES.football[i % SPORTS_IMAGES.football.length];
  }
  if (category === 'basketball') {
    return SPORTS_IMAGES.basketball[i % SPORTS_IMAGES.basketball.length];
  }
  if (category === 'tennis') {
    return SPORTS_IMAGES.tennis[i % SPORTS_IMAGES.tennis.length];
  }
  if (category === 'concert') {
    return ENTERTAINMENT_IMAGES.concert[i % ENTERTAINMENT_IMAGES.concert.length];
  }
  if (category === 'openmic') {
    return ENTERTAINMENT_IMAGES.openmic[i % ENTERTAINMENT_IMAGES.openmic.length];
  }
  if (category === 'foodfest') {
    return ENTERTAINMENT_IMAGES.foodfest[i % ENTERTAINMENT_IMAGES.foodfest.length];
  }
  if (category === 'theatre') {
    return ENTERTAINMENT_IMAGES.theatre[i % ENTERTAINMENT_IMAGES.theatre.length];
  }
  if (category === 'community') {
    return COMMUNITY_IMAGES[i % COMMUNITY_IMAGES.length];
  }
  if (category === 'user' || category === 'profile') {
    return PORTRAITS[i % PORTRAITS.length];
  }

  // Fallbacks
  const allSports = [
    ...SPORTS_IMAGES.cricket,
    ...SPORTS_IMAGES.football,
    ...SPORTS_IMAGES.badminton,
    ...SPORTS_IMAGES.running
  ];
  return allSports[i % allSports.length];
}

/**
 * Generate avatar URL for users
 */
export function generateAvatar(name: string, index: number = 0): string {
  const avatarIndex = Math.abs(index);
  if (avatarIndex < PORTRAITS.length) {
    return PORTRAITS[avatarIndex];
  }
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&size=300&font-size=0.4`;
}

/**
 * Generate cricket match image
 */
export function generateCricketImage(index: number = 0): string {
  return generatePlaceholderImage('cricket', index);
}

/**
 * Generate football match image
 */
export function generateFootballImage(index: number = 0): string {
  return generatePlaceholderImage('football', index);
}

/**
 * Generate running event image
 */
export function generateRunningImage(index: number = 0): string {
  return generatePlaceholderImage('running', index);
}

/**
 * Generate concert image
 */
export function generateConcertImage(index: number = 0): string {
  return generatePlaceholderImage('concert', index);
}

/**
 * Generate sports community image
 */
export function generateCommunityImage(index: number = 0): string {
  return generatePlaceholderImage('community', index);
}

/**
 * Generate event image based on type
 */
export function generateEventImage(
  eventType: string = 'sports',
  index: number = 0
): string {
  const type = eventType.toLowerCase();
  
  if (type.includes('cricket')) return generateCricketImage(index);
  if (type.includes('football')) return generateFootballImage(index);
  if (type.includes('basketball')) return generatePlaceholderImage('basketball', index);
  if (type.includes('tennis')) return generatePlaceholderImage('tennis', index);
  if (type.includes('badminton')) return generatePlaceholderImage('badminton', index);
  if (type.includes('pickleball')) return generatePlaceholderImage('pickleball', index);
  if (type.includes('running')) return generateRunningImage(index);
  if (type.includes('concert') || type.includes('music') || type.includes('mic')) return generateConcertImage(index);
  if (type.includes('openmic') || type.includes('open mic')) return generatePlaceholderImage('openmic', index);
  if (type.includes('food') || type.includes('festival')) return generatePlaceholderImage('foodfest', index);
  if (type.includes('theatre') || type.includes('drama') || type.includes('play')) return generatePlaceholderImage('theatre', index);
  if (type.includes('community')) return generateCommunityImage(index);
  
  return generatePlaceholderImage('sports', index);
}

/**
 * Get a random sports category image
 */
export function getRandomSportsImage(): string {
  const categories: ImageCategory[] = [
    'cricket',
    'football',
    'basketball',
    'tennis',
    'badminton',
    'running',
    'pickleball'
  ];
  
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return generatePlaceholderImage(randomCategory);
}

/**
 * Generate multiple images for a feed/carousel
 */
export function generateEventImages(count: number, eventType: string = 'sports'): string[] {
  return Array.from({ length: count }, (_, i) => 
    generateEventImage(eventType, i)
  );
}
