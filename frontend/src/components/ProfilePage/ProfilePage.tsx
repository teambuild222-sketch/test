import React, { useState } from 'react';
import {
  Edit2, Share2, MapPin, Calendar, Users, Trophy,
  Star, Bookmark, Grid3X3, Award, Heart, Zap
} from 'lucide-react';
import './ProfilePage.css';

/* ─────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────── */

const statsData = [
  { label: 'Following', count: '0',  icon: <Users  size={16} /> },
  { label: 'Followers', count: '0', icon: <Heart  size={16} /> },
  { label: 'Events',    count: '12',   icon: <Calendar size={16} /> },
  { label: 'Badges',    count: '8',    icon: <Trophy  size={16} /> },
];

const sportsInterests = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Running', 'Tennis'];

const userPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Cricket Tournament',
    date: 'Jun 28, 2026 • 9:00 AM',
    location: 'Gachibowli Stadium, Hyderabad',
    category: 'Cricket',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Football Match',
    date: 'Jul 02, 2026 • 5:30 PM',
    location: 'Madhapur Turf, Hyderabad',
    category: 'Football',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Badminton Championship',
    date: 'Jul 08, 2026 • 6:00 PM',
    location: 'Pullela Gopichand Academy',
    category: 'Badminton',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Marathon Run',
    date: 'Jul 15, 2026 • 6:00 AM',
    location: 'Necklace Road, Hyderabad',
    category: 'Running',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Basketball Showdown',
    date: 'Jul 20, 2026 • 4:00 PM',
    location: 'Secunderabad Club, Hyderabad',
    category: 'Basketball',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&h=250&q=80',
    title: 'Community Gathering',
    date: 'Jul 25, 2026 • 7:00 PM',
    location: 'Hitech City, Hyderabad',
    category: 'Community',
  },
];

const savedPosts = userPosts.slice(1, 4);
const eventPosts = userPosts.slice(0, 3);

const badgesData = [
  { emoji: '🥇', title: 'First Blood',      desc: 'Joined first cricket match',         color: '#FFD700' },
  { emoji: '🏸', title: 'Smash King',       desc: 'Attended 3 badminton sessions',       color: '#8B5CF6' },
  { emoji: '🏃', title: 'Pacer',            desc: 'Ran 10km total across events',        color: '#10B981' },
  { emoji: '🎭', title: 'Culture Vulture',  desc: 'Attended 3 different art events',     color: '#EC4899' },
  { emoji: '⚽', title: 'Goal Getter',      desc: 'Participated in 5 football matches',  color: '#3B82F6' },
  { emoji: '🌟', title: 'Star Player',      desc: 'Received 50+ event appreciations',    color: '#F59E0B' },
  { emoji: '🤝', title: 'Team Spirit',      desc: 'Organised a community event',         color: '#06B6D4' },
  { emoji: '🔥', title: 'On Fire',          desc: '30-day login streak achieved',        color: '#F97316' },
];

const FALLBACK =
  'https://images.unsplash.com/photo-1540747737956-37872404a821?auto=format&fit=crop&w=400&h=250&q=80';

type TabType = 'posts' | 'events' | 'badges' | 'saved';

/* ─────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────── */

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK;
  };

  const getTabPosts = () => {
    if (activeTab === 'events') return eventPosts;
    if (activeTab === 'saved')  return savedPosts;
    return userPosts;
  };

  return (
    <div className="pp-container">

      {/* ── Cover Banner ── */}
      <div className="pp-cover">
        <div className="pp-cover-gradient" />
        <div className="pp-cover-orb pp-cover-orb-1" />
        <div className="pp-cover-orb pp-cover-orb-2" />
      </div>

      {/* ── Avatar ── */}
      <div className="pp-avatar-ring-wrap">
        <div className="pp-avatar-ring">
          <img
            src="/logo.png"
            alt="Zenex Galaxy Logo"
            className="pp-avatar-img"
            onError={(e) => {
              e.currentTarget.src =
                'https://ui-avatars.com/api/?name=Z&background=8b5cf6&color=fff&size=300';
            }}
          />
        </div>
      </div>

      {/* ── User Info ── */}
      <div className="pp-user-info">
        <h2 className="pp-fullname">Admin User</h2>
        <p  className="pp-handle">@admin</p>
        <p  className="pp-bio">Sports Enthusiast &amp; Event Explorer</p>
        <p  className="pp-location">
          <MapPin size={13} className="pp-loc-icon" />
          Hyderabad, India
        </p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="pp-actions">
        <button className="pp-btn pp-btn-primary" onClick={() => alert('Edit Profile')}>
          <Edit2 size={15} />
          <span>Edit Profile</span>
        </button>
        <button className="pp-btn pp-btn-secondary" onClick={() => alert('Share Profile')}>
          <Share2 size={15} />
          <span>Share</span>
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="pp-stats-grid">
        {statsData.map((s, i) => (
          <div key={i} className="pp-stat-card">
            <div className="pp-stat-icon">{s.icon}</div>
            <span className="pp-stat-value">{s.count}</span>
            <span className="pp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Interests ── */}
      <div className="pp-section">
        <h3 className="pp-section-title">Interests</h3>
        <div className="pp-chips">
          {sportsInterests.map((tag) => (
            <span key={tag} className="pp-chip">{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="pp-tabs">
        {(['posts', 'events', 'badges', 'saved'] as TabType[]).map((tab) => {
          const icons: Record<TabType, React.ReactNode> = {
            posts:  <Grid3X3  size={15} />,
            events: <Calendar size={15} />,
            badges: <Award    size={15} />,
            saved:  <Bookmark size={15} />,
          };
          return (
            <button
              key={tab}
              className={`pp-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {icons[tab]}
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="pp-tab-content">

        {/* Posts / Events / Saved */}
        {activeTab !== 'badges' && (
          <div className="pp-feed">
            {getTabPosts().map((post) => (
              <div key={post.id} className="pp-feed-card">
                <div className="pp-feed-img-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="pp-feed-img"
                    onError={onImgError}
                    loading="lazy"
                  />
                  <span className="pp-feed-badge">{post.category}</span>
                  <div className="pp-feed-img-overlay" />
                </div>
                <div className="pp-feed-body">
                  <h4 className="pp-feed-title">{post.title}</h4>
                  <p className="pp-feed-meta">
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </p>
                  <p className="pp-feed-meta">
                    <MapPin size={12} />
                    <span>{post.location}</span>
                  </p>
                  <div className="pp-feed-footer">
                    <div className="pp-feed-likes">
                      <Heart size={14} />
                      <span>{Math.floor(Math.random() * 90) + 10}</span>
                    </div>
                    <button
                      className="pp-rsvp-btn"
                      onClick={() => alert(`RSVP to ${post.title}!`)}
                    >
                      <Zap size={13} />
                      RSVP
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {activeTab === 'badges' && (
          <div className="pp-badges-grid">
            {badgesData.map((b, i) => (
              <div key={i} className="pp-badge-card">
                <div className="pp-badge-emoji-wrap" style={{ '--badge-color': b.color } as React.CSSProperties}>
                  <span className="pp-badge-emoji">{b.emoji}</span>
                </div>
                <h5 className="pp-badge-title">{b.title}</h5>
                <p className="pp-badge-desc">{b.desc}</p>
                <div className="pp-badge-star"><Star size={10} /></div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Spacer for Dynamic Island nav */}
      <div className="pp-spacer" />
    </div>
  );
};

export default ProfilePage;
