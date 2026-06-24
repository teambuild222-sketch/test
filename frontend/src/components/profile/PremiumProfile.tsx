import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  MoreHorizontal,
  QrCodeScanner,
  Check,
  MapPin,
  Calendar,
  User as UserIcon,
  Share2,
} from 'lucide-react';
import { ProfileShareModal } from './ProfileShareModal';
import './PremiumProfile.css';

const stats = [
  { label: 'Following', value: 0 },
  { label: 'Followers', value: 0 },
  { label: 'Events', value: 0 },
  { label: 'Badges', value: 0 },
];

const interests = ['Cricket', 'Football', 'Music', 'Food events'];

export const PremiumProfile: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Mock user data - this would come from props or context in production
  const username = 'admin';
  const fullname = 'Admin User';
  const profileImage = '/logo.png';
  return (
    <div className="pp-shell">
      <header className="pp-header">
        <button className="pp-icon-btn" aria-label="Back"><ChevronLeft size={22} /></button>
        <div className="pp-header-actions">
          <button className="pp-icon-btn" aria-label="QR Scanner"><QrCodeScanner size={20} /></button>
          <button className="pp-icon-btn" aria-label="More"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <section className="pp-hero">
        <div className="pp-avatar-wrap">
          <motion.div
            className="pp-logo-glow"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          >
            <img src="/logo.png" alt="Zenex Galaxy" className="pp-logo-img" />
          </motion.div>
          <span className="pp-online-dot" />
        </div>

        <div className="pp-meta">
          <div className="pp-name-row">
            <h1 className="pp-fullname">Admin User</h1>
            <span className="pp-verified" title="Verified"><Check size={14} /></span>
          </div>
          <div className="pp-username">@admin</div>
          <p className="pp-bio">Sports enthusiast and event explorer.</p>
          <div className="pp-meta-row">
            <div className="pp-meta-item"><MapPin size={14} className="meta-icon" /> Hyderabad</div>
            <div className="pp-meta-item"><Calendar size={14} className="meta-icon" /> Joined Feb 2026</div>
          </div>
        </div>
      </section>

      <section className="pp-stats glass-card">
        {stats.map((s) => (
          <div key={s.label} className="pp-stat-item">
            <div className="pp-stat-value">{s.value}</div>
            <div className="pp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="pp-actions">
        <button className="pp-btn pp-btn-edit"><UserIcon size={16} /> <span>Edit profile</span></button>
        <button className="pp-btn pp-btn-share" onClick={() => setIsShareModalOpen(true)}><Share2 size={16} /> <span>Share</span></button>
      </section>

      <nav className="pp-tabs">
        <button className="pp-tab active">Posts</button>
        <button className="pp-tab">Events</button>
        <button className="pp-tab">Badges</button>
        <button className="pp-tab">Saved</button>
      </nav>

      <section className="pp-interests">
        <h4 className="pp-section-title">Interests</h4>
        <div className="pp-chips">
          {interests.map((i) => (
            <div key={i} className="pp-chip">{i}</div>
          ))}
        </div>
      </section>

      <div style={{ height: 92 }} />

      {/* Profile Share Modal */}
      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        username={username}
        fullname={fullname}
        profileImage={profileImage}
      />
    </div>
  );
};

export default PremiumProfile;
