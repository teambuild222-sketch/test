import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Bell,
  QrCode,
  Bookmark,
  Share2,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Star,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { fetchDiscoverPageData } from './discoverApi';
import { useDiscoverStore } from './discoverStore';
import { ImageWithFallback } from './ImageWithFallback';
import './ImageLoading.css';
import './DiscoverPage.css';
import type { DiscoverEvent, DiscoverVenue, Recommendation } from './discoverData';

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const categoryScrollVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const DiscoverPage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    activeFeaturedIndex,
    setActiveFeaturedIndex,
    bookmarks,
    toggleBookmark,
  } = useDiscoverStore();

  const { data, isLoading } = useQuery({
    queryKey: ['discoverPage'],
    queryFn: fetchDiscoverPageData,
    staleTime: 1000 * 60 * 2,
  });

  const filteredTrending = useMemo(() => {
    if (!data) return [];
    return data.trendingEvents.filter((event) => {
      const categoryMatch = activeCategory === 'All' || event.category === activeCategory;
      const queryMatch =
        !searchQuery ||
        [event.title, event.category, event.location, event.organizer]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, data, searchQuery]);

  const filteredVenues = useMemo(() => {
    if (!data) return [];
    return data.popularVenues.filter((venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const filteredRecommendations = useMemo(() => {
    if (!data) return [];
    return data.recommendations.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (isLoading || !data) {
    return (
      <div className="discover-container" style={{ minHeight: '100vh' }}>
        <div className="space-y-4" style={{ padding: '16px' }}>
          <div className="h-24 w-full animate-pulse rounded-[28px]" style={{ background: 'var(--discover-card-bg)' }} />
          <div className="h-16 w-full animate-pulse rounded-[28px]" style={{ background: 'var(--discover-card-bg)' }} />
          <div className="h-96 w-full animate-pulse rounded-[32px]" style={{ background: 'var(--discover-card-bg)' }} />
          <div className="h-48 w-full animate-pulse rounded-[32px]" style={{ background: 'var(--discover-card-bg)' }} />
        </div>
      </div>
    );
  }

  const featured = data.featuredEvent;
  const categories = data.categories;

  return (
    <motion.div
      className="discover-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Header with ZENEX branding */}
      <header className="discover-header">
        <div className="discover-header-logo">
          <div className="discover-logo-icon">Z</div>
          <div className="discover-header-text">
            <div className="discover-logo-label">ZENEX</div>
            <div className="discover-logo-title">Discover</div>
          </div>
        </div>

        <div className="discover-header-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="discover-icon-button discover-qr-button"
            aria-label="Scan QR Code"
          >
            <QrCode size={20} />
            <span>Scan</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="discover-icon-button discover-notify-button"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="discover-notify-badge">7</span>
          </motion.button>
        </div>
      </header>

      {/* Search Section */}
      <div className="discover-search-section">
        <div className="discover-search-bar">
          <Search size={18} className="discover-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, sports, venues..."
            className="discover-search-input"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="discover-filter-btn"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} />
          </motion.button>
        </div>

        {/* Category Chips - Horizontal Scrollable */}
        <motion.div
          className="discover-categories-scroll"
          ref={scrollContainerRef}
          variants={categoryScrollVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`discover-category-chip ${isActive ? 'active' : ''}`}
                whileTap={{ scale: 0.92 }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                {category}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Featured Events Section */}
      <section className="discover-featured-section">
        <div className="discover-section-header">
          <div>
            <p className="discover-section-label">Featured Events</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="discover-view-all-btn"
          >
            View all
            <ChevronRight size={16} />
          </motion.button>
        </div>

        <motion.div
          className="discover-event-cards"
          variants={sectionFade}
          initial="hidden"
          animate="visible"
        >
          {filteredTrending.slice(0, 3).map((event, index) => (
            <motion.article
              key={event.id}
              className="discover-event-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Event Image */}
              <div className="discover-event-image">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="discover-event-img"
                />
                <div className="discover-event-gradient" />
              </div>

              {/* Event Info */}
              <div className="discover-event-content">
                <div className="discover-event-meta">
                  <span className="discover-event-category">{event.category}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleBookmark(event.id)}
                    className="discover-bookmark-btn"
                    aria-label="Bookmark"
                  >
                    <Bookmark
                      size={18}
                      className={bookmarks.includes(event.id) ? 'filled' : ''}
                    />
                  </motion.button>
                </div>

                <h3 className="discover-event-title">{event.title}</h3>

                <div className="discover-event-details">
                  <div className="discover-detail-item">
                    <Calendar size={14} />
                    <span>{event.dateLabel}</span>
                  </div>
                  <div className="discover-detail-item">
                    <Clock size={14} />
                    <span>{event.time}</span>
                  </div>
                  <div className="discover-detail-item">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Attendees */}
                <div className="discover-attendees">
                  <div className="discover-avatars">
                    {[
                      { initials: 'AJ', color: 'from-sky-500 to-blue-500' },
                      { initials: 'MK', color: 'from-violet-500 to-purple-500' },
                      { initials: 'RS', color: 'from-amber-400 to-orange-500' },
                    ].map((attendee, i) => (
                      <div
                        key={i}
                        className={`discover-avatar bg-gradient-to-br ${attendee.color}`}
                      >
                        {attendee.initials}
                      </div>
                    ))}
                  </div>
                  <span className="discover-attendee-count">
                    +{Math.floor(Math.random() * 150) + 100} going
                  </span>
                </div>

                {/* RSVP Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="discover-rsvp-btn"
                >
                  RSVP
                </motion.button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Popular Venues</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Places nearby</h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/90"
            >
              Explore venues
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <motion.article
                key={venue.id}
                whileHover={{ y: -4 }}
                className="rounded-[32px] border border-slate-700/80 bg-slate-950/85 overflow-hidden shadow-[0_32px_64px_-52px_rgba(79,70,229,0.8)]"
              >
                <div className="h-44 w-full overflow-hidden">
                  <ImageWithFallback
                    src={venue.image}
                    alt={venue.name}
                    className=""
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-white">{venue.name}</p>
                      <p className="text-sm text-slate-400">{venue.city}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                      <Star className="h-4 w-4 text-amber-400" />
                      {venue.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
                    <span>{venue.distance} away</span>
                    <button
                      type="button"
                      className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:bg-slate-800/90"
                    >
                      Visit
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recommended For You</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">AI-powered picks</h2>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">Tailored to your interests</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRecommendations.map((item) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -4 }}
                className="rounded-[32px] border border-slate-700/80 bg-slate-950/85 overflow-hidden shadow-[0_32px_64px_-52px_rgba(168,85,247,0.55)]"
              >
                <div className="relative overflow-hidden h-44 w-full">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-300">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">Recommended</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.reason}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-300">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-fuchsia-300" />
                      {item.location}
                    </span>
                    <button
                      type="button"
                      className="rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/90"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default DiscoverPage;
