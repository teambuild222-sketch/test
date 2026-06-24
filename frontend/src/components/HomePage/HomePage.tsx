import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Flame, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { generateAvatar, generateEventImage } from '../../utils/imageGenerator';
import './HomePage.css';

interface EventItem {
  id: number;
  title: string;
  category: string;
  image: string;
  date: string;
  location: string;
  playersNeeded: string;
  distance: string;
  level: string;
}

interface BannerItem {
  id: number;
  title: string;
  category: string;
  image: string;
  tagline: string;
}

const sportsBanners: BannerItem[] = [
  {
    id: 1,
    title: 'Cricket Premier League',
    category: 'Cricket',
    image: generateEventImage('cricket', 1),
    tagline: 'Join local tournaments and show your skills!'
  },
  {
    id: 2,
    title: 'Badminton Smash Club',
    category: 'Badminton',
    image: generateEventImage('badminton', 1),
    tagline: 'Book indoor courts and find match partners.'
  },
  {
    id: 3,
    title: 'Weekend Soccer League',
    category: 'Football',
    image: generateEventImage('football', 1),
    tagline: 'Show your footwork at Madhapur Turf.'
  }
];

const categoryThumbnails = [
  { id: 'all', label: 'All', icon: '🔥' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'running', label: 'Running', icon: '🏃' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
];

const upcomingEvents: EventItem[] = [
  {
    id: 1,
    title: 'Miyapur Cricket Cup',
    category: 'Cricket',
    image: generateEventImage('cricket', 2),
    date: 'Sat, Jun 27 • 8:00 AM',
    location: 'Miyapur Grounds, Hyd',
    playersNeeded: '4 players needed',
    distance: '1.8 km',
    level: 'Beginners'
  },
  {
    id: 2,
    title: 'Over the Moon DJ Night',
    category: 'Concert',
    image: generateEventImage('concert', 0),
    date: 'Sat, Jun 27 • 8:00 PM',
    location: 'Gachibowli, Hyd',
    playersNeeded: '80 going',
    distance: '3.2 km',
    level: 'Entertainment'
  },
  {
    id: 3,
    title: 'Turf Soccer Match',
    category: 'Football',
    image: generateEventImage('football', 2),
    date: 'Sun, Jun 28 • 6:30 PM',
    location: 'Madhapur Turf, Hyd',
    playersNeeded: '2 players needed',
    distance: '2.5 km',
    level: 'Intermediate'
  }
];

const nearbyMatches: EventItem[] = [
  {
    id: 4,
    title: 'Gachibowli Strikers Match',
    category: 'Cricket',
    image: generateEventImage('cricket', 0),
    date: 'Today, 6:00 PM',
    location: 'Gachibowli Stadium, Hyd',
    playersNeeded: '2/4 players',
    distance: '2.1 km away',
    level: 'Beginners'
  },
  {
    id: 5,
    title: 'Hitters Club Sessions',
    category: 'Badminton',
    image: generateEventImage('badminton', 0),
    date: 'Tomorrow, 7:00 AM',
    location: 'Elite Academy, Hyd',
    playersNeeded: '3/4 players',
    distance: '3.4 km away',
    level: 'Intermediate'
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540747737956-37872404a821?auto=format&fit=crop&w=400&h=250&q=80';

export const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const handleLike = (id: number) => {
    const newLiked = new Set(liked);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLiked(newLiked);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="home-page-container">
      {/* 1. Featured Events Card (Hero) */}
      <div className="home-featured-hero">
        <div className="hero-content">
          <span className="hero-badge">Featured Events</span>
          <h2 className="hero-title">Welcome to ZENEX</h2>
          <p className="hero-subtitle">Explore upcoming local cricket tournaments and entertainment activities.</p>
        </div>
        <div className="hero-overlay-shimmer" />
      </div>

      {/* 2. Event Category Thumbnails */}
      <div className="home-section-container">
        <div className="thumbnails-scroll-container">
          {categoryThumbnails.map((item) => (
            <button
              key={item.id}
              className={`category-thumbnail-btn ${selectedCategory === item.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(item.id)}
              type="button"
            >
              <span className="thumbnail-icon">{item.icon}</span>
              <span className="thumbnail-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sports Banners Slider */}
      <div className="home-section-container">
        <h3 className="home-section-heading">Featured Leagues</h3>
        <div className="banners-scroll-container">
          {sportsBanners.map((banner) => (
            <div key={banner.id} className="sports-banner-card">
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="banner-image"
                onError={handleImageError}
              />
              <div className="banner-gradient-overlay" />
              <div className="banner-content">
                <span className="banner-badge">{banner.category}</span>
                <h4 className="banner-title">{banner.title}</h4>
                <p className="banner-tagline">{banner.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Nearby Matches & People */}
      <div className="home-section-container">
        <div className="section-header-row">
          <h3 className="home-section-heading">Nearby Matches & People</h3>
          <button className="see-all-link-btn" onClick={() => alert('Navigate to Explore Map')}>
            <span>See all</span>
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="nearby-scroll-container">
          {nearbyMatches.map((match) => (
            <div key={match.id} className="nearby-match-card">
              <div className="nearby-image-wrapper">
                <img 
                  src={match.image} 
                  alt={match.title} 
                  className="nearby-image"
                  onError={handleImageError}
                />
                <span className="nearby-badge">{match.level}</span>
              </div>
              <div className="nearby-details">
                <h4 className="nearby-title">{match.title}</h4>
                <p className="nearby-info">
                  <Users size={12} />
                  <span>{match.playersNeeded}</span>
                  <span className="info-dot">•</span>
                  <span>{match.distance}</span>
                </p>
                <p className="nearby-date">{match.date}</p>
                <button className="nearby-join-btn" onClick={() => alert(`Joined ${match.title} successful!`)}>
                  Join Match
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Upcoming Events Cards */}
      <div className="home-section-container">
        <h3 className="home-section-heading">Upcoming Activities</h3>
        <div className="upcoming-events-grid">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="upcoming-event-card">
              <div className="upcoming-image-container">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="upcoming-image"
                  onError={handleImageError}
                />
                <span className="upcoming-category">{event.category}</span>
              </div>
              <div className="upcoming-card-body">
                <h4 className="upcoming-title">{event.title}</h4>
                <p className="upcoming-meta">
                  <Calendar size={12} />
                  <span>{event.date}</span>
                </p>
                <p className="upcoming-meta">
                  <MapPin size={12} />
                  <span>{event.location}</span>
                </p>
                <div className="upcoming-card-footer">
                  <span className="upcoming-distance">{event.distance} away</span>
                  <button className="upcoming-rsvp-btn" onClick={() => alert(`RSVP to ${event.title} successful!`)}>
                    RSVP
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Spacing at the bottom to avoid overlapping navigation */}
      <div className="home-bottom-spacer" />
    </div>
  );
};

export default HomePage;
