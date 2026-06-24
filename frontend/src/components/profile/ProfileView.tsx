import React, { useState, useRef, useEffect } from 'react';
import {
  Trophy,
  Target,
  Calendar,
  Users,
  ChevronLeft,
  X,
  Award,
  Grid,
  Bookmark,
  Bell,
  Settings,
  Share2,
  MoreHorizontal,
  MapPin,
  User as UserIcon,
  HelpCircle,
  Shield,
  Palette,
  Gift,
  Camera,
  LogOut,
  MessageCircle,
  Mail,
  Trash2,
  Copy,
  Link as LinkIcon,
  Sparkles,
  QrCode,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import './ProfileView.css';

type TabType = 'posts' | 'events' | 'badges' | 'saved';

const TAKEN_USERNAMES = ['admin', 'neha', 'rahul', 'aisha', 'root', 'auth', 'sports', 'zenex', 'cricket', 'manager', 'football'];

const ZENEX_LOGO = '/logo.png';

export const ProfileView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Dynamic Profile states synchronized with localStorage
  const [fullName, setFullName] = useState(() => localStorage.getItem('zenex-fullname') || 'Admin User');
  const [username, setUsername] = useState(() => localStorage.getItem('zenex-username') || 'admin');
  const [bio, setBio] = useState(() => localStorage.getItem('zenex-bio') || 'Sports enthusiast and event explorer.');
  const [location, setLocation] = useState(() => localStorage.getItem('zenex-location') || 'Hyderabad');
  const [avatar] = useState(ZENEX_LOGO);

  const [sports, setSports] = useState<string[]>(() => {
    const saved = localStorage.getItem('zenex-sports');
    return saved ? JSON.parse(saved) : ['Cricket', 'Football'];
  });
  const [entertainment, setEntertainment] = useState<string[]>(() => {
    const saved = localStorage.getItem('zenex-ent');
    return saved ? JSON.parse(saved) : ['Music', 'Food Events'];
  });

  // Stats
  const [followersCount] = useState<number>(0);
  const [followingCount] = useState<number>(0);
  const [eventsCount] = useState<number>(0);
  const [badgesCount] = useState<number>(0);

  // EDIT PROFILE TEMPORARY STATES
  const [tempFullName, setTempFullName] = useState(fullName);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempBio, setTempBio] = useState(bio);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempSports, setTempSports] = useState<string[]>(sports);
  const [tempEnt, setTempEnt] = useState<string[]>(entertainment);

  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usernameStatus, setUsernameStatus] = useState<{
    status: 'checking' | 'available' | 'taken' | 'invalid' | 'idle';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleOpenEdit = () => {
    setTempFullName(fullName);
    setTempUsername(username);
    setTempBio(bio);
    setTempLocation(location);
    setTempSports(sports);
    setTempEnt(entertainment);
    setUsernameStatus({ status: 'idle', message: '' });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (!isEditModalOpen) return;
    if (tempUsername.trim().toLowerCase() === username.toLowerCase()) {
      setUsernameStatus({ status: 'idle', message: '' });
      return;
    }
    const cleanUsername = tempUsername.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      setUsernameStatus({ status: 'invalid', message: 'Must be at least 3 characters' });
      return;
    }
    setUsernameStatus({ status: 'checking', message: 'Checking availability...' });
    const timer = setTimeout(() => {
      if (TAKEN_USERNAMES.includes(cleanUsername)) {
        setUsernameStatus({ status: 'taken', message: `Username @${cleanUsername} is already taken ❌` });
      } else {
        setUsernameStatus({ status: 'available', message: `Username @${cleanUsername} is available! ✔️` });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [tempUsername, isEditModalOpen, username]);

  const handleRemovePhoto = () => {
    toast.success('Using Zenex Galaxy logo as profile picture');
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFullName.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }
    if (usernameStatus.status === 'taken' || usernameStatus.status === 'invalid') {
      toast.error('Please fix the username errors before saving');
      return;
    }

    setFullName(tempFullName.trim());
    setUsername(tempUsername.trim().toLowerCase());
    setBio(tempBio);
    setLocation(tempLocation.trim());
    setSports(tempSports);
    setEntertainment(tempEnt);

    localStorage.setItem('zenex-fullname', tempFullName.trim());
    localStorage.setItem('zenex-username', tempUsername.trim().toLowerCase());
    localStorage.setItem('zenex-bio', tempBio);
    localStorage.setItem('zenex-location', tempLocation.trim());
    localStorage.setItem('zenex-sports', JSON.stringify(tempSports));
    localStorage.setItem('zenex-ent', JSON.stringify(tempEnt));

    setIsEditModalOpen(false);
    toast.success('Profile updated successfully');
  };

  const profileUrl = `https://zenex.app/u/${username}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl)
      .then(() => toast.success('Profile link copied'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const copyUsernameOnly = () => {
    navigator.clipboard.writeText(`@${username}`)
      .then(() => toast.success('Username copied to clipboard'))
      .catch(() => toast.error('Failed to copy username'));
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Check out my Zenex profile: ${profileUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareX = () => {
    const text = encodeURIComponent(`Check out my premium Zenex sports and entertainment profile!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareEmail = () => {
    window.location.href = `mailto:?subject=Check%20out%20my%20Zenex%20profile&body=Here%20is%20my%20Zenex%20profile%20link%3A%20${encodeURIComponent(profileUrl)}`;
  };

  function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  const exportInstagramCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 540, 960);
    drawRoundedRect(ctx, 35, 100, 470, 760, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ZENEX', 270, 160);
    ctx.font = '600 11px sans-serif';
    ctx.fillStyle = '#7B5FFF';
    ctx.fillText('SPORTS & ENTERTAINMENT', 270, 185);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#F3F3F3';
    ctx.fillText(fullName, 270, 380);
    ctx.fillStyle = '#7B5FFF';
    ctx.font = '500 15px sans-serif';
    ctx.fillText(`@${username}`, 270, 410);
    ctx.font = '600 11px sans-serif';
    ctx.fillStyle = '#8E8B82';
    ctx.fillText('zenex.app/u/' + username, 270, 790);
    const link = document.createElement('a');
    link.download = `${username}_zenex_profile.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Stories card downloaded!');
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const shareProfileAsImage = async () => {
    const canvas = document.createElement('canvas');
    const w = 1080;
    const h = 1350;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0b0b0f';
    ctx.fillRect(0, 0, w, h);

    // Prepare QR image via public QR API (fallback) and logo
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(profileUrl)}`;
    try {
      const [logoImg, qrImg] = await Promise.all([loadImage(ZENEX_LOGO), loadImage(qrSrc)]);

      // Draw rounded card area
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      const cardX = 60;
      const cardY = 140;
      const cardW = w - cardX * 2;
      const cardH = 870;
      const radius = 28;
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardW - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
      ctx.lineTo(cardX + cardW, cardY + cardH - radius);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
      ctx.lineTo(cardX + radius, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.fill();

      // Draw logo
      const logoSize = 120;
      ctx.drawImage(logoImg, cardX + 28, cardY + 28, logoSize, logoSize);

      // Draw texts
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 46px system-ui';
      ctx.fillText(fullName, cardX + 28 + logoSize + 20, cardY + 68);
      ctx.font = '600 28px system-ui';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText(`@${username}`, cardX + 28 + logoSize + 20, cardY + 108);

      // Draw QR image bottom-right
      const qrSize = 360;
      ctx.drawImage(qrImg, cardX + cardW - qrSize - 28, cardY + cardH - qrSize - 28, qrSize, qrSize);

      // Footer text
      ctx.font = '500 18px system-ui';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('Scan to open profile', cardX + cardW - qrSize - 28, cardY + cardH - qrSize - 38);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to create image');
          return;
        }
        const file = new File([blob], `${username}_zenex_qr.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await (navigator as any).share({ files: [file], title: `${fullName} on Zenex`, text: 'Check out my Zenex profile' });
          } catch (err) {
            toast.error('Share cancelled or failed');
          }
        } else if ((navigator as any).share) {
          // Some platforms allow sharing blobs via dataUrl text fallback
          const dataUrl = URL.createObjectURL(blob);
          try {
            await (navigator as any).share({ title: `${fullName} on Zenex`, text: profileUrl, url: dataUrl });
          } catch {
            // fallback to download
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${username}_zenex_qr.png`;
            a.click();
            URL.revokeObjectURL(dataUrl);
            toast('Image downloaded. Share it to Instagram from your gallery.');
          }
        } else {
          // Fallback: force download and inform user
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${username}_zenex_qr.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast('Image downloaded. Share it to Instagram from your gallery.');
        }
      }, 'image/png');
    } catch (err) {
      toast.error('Failed to prepare QR image');
    }
  };

  const handleStatClick = (statLabel: string) => {
    if (statLabel === 'Followers' && followersCount === 0) {
      toast('No followers yet.');
    } else if (statLabel === 'Following' && followingCount === 0) {
      toast('Not following anyone yet.');
    } else if (statLabel === 'Events' && eventsCount === 0) {
      toast('No events joined yet.');
    } else if (statLabel === 'Badges' && badgesCount === 0) {
      toast('Start participating in events to earn badges.');
    } else {
      toast(`Tapped on ${statLabel} details.`);
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  const allInterests = [...sports, ...entertainment];

  const interestIcons: Record<string, string> = {
    'Cricket': '🏏',
    'Football': '⚽',
    'Badminton': '🏸',
    'Running': '🏃',
    'Pickleball': '🎾',
    'Tennis': '🎾',
    'Basketball': '🏀',
    'Music': '🎵',
    'Open Mic': '🎤',
    'Food Events': '🍽️',
    'Theatre': '🎭',
    'Movies': '🎬',
    'DJ Events': '🎧',
    'Comedy': '😂',
  };

  return (
    <div className="zx-profile-shell">
      <canvas ref={cropCanvasRef} style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={() => toast('Using Zenex logo as profile image')}
      />

      {/* ─── TOP NAVIGATION BAR ─── */}
      <div className="zx-top-nav">
        <button className="zx-nav-btn zx-nav-back" aria-label="Go back" onClick={() => toast('Navigate back')}>
          <ChevronLeft size={20} />
        </button>
        <div className="zx-nav-right-group">
          <button className="zx-nav-btn" aria-label="QR Scanner" onClick={() => setIsQROpen(true)}>
            <QrCode size={19} />
          </button>
          <button className="zx-nav-btn" aria-label="More options" onClick={() => setIsMoreMenuOpen(true)}>
            <MoreHorizontal size={19} />
          </button>
        </div>
      </div>

      {/* ─── PROFILE HERO ─── */}
      <div className="zx-profile-hero">
        {/* Spinning Logo with glow ring */}
        <div className="zx-avatar-glow-wrap">
          <div className="zx-glow-ring" />
          <div className="zx-avatar-container">
            <img
              src={ZENEX_LOGO}
              alt="Zenex Galaxy Logo"
              className="zx-spinning-logo"
            />
          </div>
          <div className="zx-online-dot" title="Online" />
        </div>

        {/* Name + Verified */}
        <div className="zx-profile-name-row">
          <h1 className="zx-profile-name">{fullName}</h1>
          <div className="zx-verified-badge" title="Verified User">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>

        <span className="zx-username">@{username}</span>
        <p className="zx-bio">{bio}</p>

        {/* Meta row */}
        <div className="zx-meta-row">
          <div className="zx-meta-item">
            <MapPin size={13} />
            <span>{location}</span>
          </div>
          <div className="zx-meta-sep">·</div>
          <div className="zx-meta-item">
            <Calendar size={13} />
            <span>Joined Feb 2026</span>
          </div>
        </div>
      </div>

      {/* ─── STATS GLASS CARD ─── */}
      <div className="zx-stats-card">
        {[
          { label: 'Following', value: followingCount, icon: <Users size={16} className="zx-stat-icon blue" /> },
          { label: 'Followers', value: followersCount, icon: <Users size={16} className="zx-stat-icon pink" /> },
          { label: 'Events', value: eventsCount, icon: <Calendar size={16} className="zx-stat-icon purple" /> },
          { label: 'Badges', value: badgesCount, icon: <Award size={16} className="zx-stat-icon yellow" /> },
        ].map((stat) => (
          <button key={stat.label} className="zx-stat-btn" onClick={() => handleStatClick(stat.label)}>
            {stat.icon}
            <span className="zx-stat-value">{stat.value}</span>
            <span className="zx-stat-label">{stat.label}</span>
          </button>
        ))}
      </div>

      {/* ─── ACTION BUTTONS ─── */}
      <div className="zx-action-row">
        <button className="zx-action-btn zx-btn-edit" onClick={handleOpenEdit}>
          <UserIcon size={15} />
          <span>Edit Profile</span>
        </button>
        <button className="zx-action-btn zx-btn-share" onClick={shareProfileAsImage}>
          <Share2 size={15} />
          <span>Share Profile</span>
        </button>
      </div>

      {/* ─── TABS ─── */}
      <div className="zx-tab-bar">
        {([
          { key: 'posts', icon: <Grid size={15} />, label: 'Posts' },
          { key: 'events', icon: <Calendar size={15} />, label: 'Events' },
          { key: 'badges', icon: <Award size={15} />, label: 'Badges' },
          { key: 'saved', icon: <Bookmark size={15} />, label: 'Saved' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            className={`zx-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="zx-tab-content">

        {/* ── POSTS TAB ── */}
        {activeTab === 'posts' && (
          <div className="zx-fade-in">
            {/* Interests Section */}
            <div className="zx-interests-section">
              <span className="zx-interests-label">INTERESTS</span>
              <div className="zx-interests-chips">
                {allInterests.map((interest) => (
                  <div key={interest} className="zx-interest-chip">
                    <span className="zx-chip-icon">{interestIcons[interest] || '⭐'}</span>
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="zx-activity-list">
              {[
                {
                  id: 1, icon: '🏏',
                  title: 'Joined Cricket Tournament',
                  desc: 'Zenex Premier League 2024',
                  time: '2h ago',
                  thumbnail: 'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?auto=format&fit=crop&w=150&h=100&q=80',
                },
                {
                  id: 2, icon: '🎤',
                  title: 'Attended Open Mic Night',
                  desc: 'The Habitat, Hyderabad',
                  time: '1d ago',
                  thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=150&h=100&q=80',
                },
                {
                  id: 3, icon: '🤝',
                  title: 'Connected with Rahul Sharma',
                  desc: 'Now you are connected',
                  time: '2d ago',
                  thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
                },
                {
                  id: 4, icon: '⚽',
                  title: 'Created Football Event',
                  desc: 'Sunday Football Match',
                  time: '3d ago',
                  thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&h=100&q=80',
                },
              ].map((item) => (
                <div key={item.id} className="zx-activity-card">
                  <div className="zx-activity-left">
                    <div className="zx-activity-emoji">{item.icon}</div>
                    <div className="zx-activity-info">
                      <span className="zx-activity-title">{item.title}</span>
                      <span className="zx-activity-desc">{item.desc}</span>
                      <span className="zx-activity-time">{item.time}</span>
                    </div>
                  </div>
                  <div className="zx-activity-right">
                    <img src={item.thumbnail} alt={item.title} className="zx-activity-thumb" />
                    <button className="zx-activity-more" onClick={() => toast('Options clicked')}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="zx-empty-state zx-fade-in">
            <Calendar size={40} className="zx-empty-icon" />
            <h3>{eventsCount === 0 ? 'No events joined yet.' : `${eventsCount} Events Joined`}</h3>
            {eventsCount === 0 && <p>Host or join local cricket or entertainment gatherings to start tracking activities here.</p>}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="zx-empty-state zx-fade-in">
            <Trophy size={40} className="zx-empty-icon" />
            <h3>{badgesCount === 0 ? 'No badges earned yet.' : `${badgesCount} Badges Earned`}</h3>
            <p>{badgesCount === 0 ? 'Start participating in events to earn badges.' : 'Explore challenges around Hyderabad to unlock more achievements.'}</p>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="zx-empty-state zx-fade-in">
            <Bookmark size={40} className="zx-empty-icon" />
            <h3>No Saved Items</h3>
            <p>Save events, tournament layouts, or organizers' pages for offline access later.</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════ */}

      {/* ── QR SCANNER MODAL ── */}
      {isQROpen && (
        <div className="zx-overlay" onClick={() => setIsQROpen(false)}>
          <div className="zx-sheet zx-qr-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="zx-sheet-close" onClick={() => setIsQROpen(false)}><X size={18} /></button>
            <div className="zx-sheet-body">
              <h3 className="zx-sheet-title">Profile QR Code</h3>
              <p className="zx-sheet-subtitle">Scan to visit @{username}'s profile</p>
              <div className="zx-qr-display">
                <div className="zx-qr-logo-center">
                  <img src={ZENEX_LOGO} alt="Zenex" className="zx-qr-logo-img" />
                </div>
                <svg viewBox="0 0 200 200" width="200" height="200" className="zx-qr-svg">
                  {/* Corner finder patterns */}
                  <rect x="10" y="10" width="50" height="50" rx="6" fill="none" stroke="#7B5FFF" strokeWidth="5"/>
                  <rect x="20" y="20" width="30" height="30" rx="3" fill="#7B5FFF"/>
                  <rect x="140" y="10" width="50" height="50" rx="6" fill="none" stroke="#7B5FFF" strokeWidth="5"/>
                  <rect x="150" y="20" width="30" height="30" rx="3" fill="#7B5FFF"/>
                  <rect x="10" y="140" width="50" height="50" rx="6" fill="none" stroke="#7B5FFF" strokeWidth="5"/>
                  <rect x="20" y="150" width="30" height="30" rx="3" fill="#7B5FFF"/>
                  {/* Data modules */}
                  <rect x="75" y="10" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="90" y="10" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="75" y="25" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="10" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="25" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="120" y="10" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="10" y="75" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="10" y="90" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="25" y="75" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="10" y="105" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="25" y="120" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="140" y="75" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="155" y="75" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="170" y="75" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="140" y="90" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="170" y="90" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="155" y="105" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="140" y="120" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="170" y="120" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="75" y="75" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="90" y="90" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="75" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="75" y="105" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="105" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="75" y="140" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="90" y="155" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="140" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="120" y="155" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="75" y="170" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="105" y="170" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="140" y="140" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="155" y="155" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="170" y="140" width="10" height="10" rx="2" fill="#7B5FFF"/>
                  <rect x="140" y="170" width="10" height="10" rx="2" fill="#4CC8FF"/>
                  <rect x="170" y="170" width="10" height="10" rx="2" fill="#7B5FFF"/>
                </svg>
              </div>
              <div className="zx-qr-url">zenex.app/u/{username}</div>
              <button className="zx-qr-share-btn" onClick={copyProfileLink}>
                <Copy size={15} />
                <span>Copy Profile Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MORE OPTIONS MENU ── */}
      {isMoreMenuOpen && (
        <div className="zx-overlay" onClick={() => setIsMoreMenuOpen(false)}>
          <div className="zx-sheet zx-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="zx-more-handle" />
            <div className="zx-sheet-body">
              <div className="zx-more-menu">
                {[
                  { icon: <Bell size={18} />, label: 'Notifications', action: () => { setIsMoreMenuOpen(false); setIsNotificationsOpen(true); } },
                  { icon: <Settings size={18} />, label: 'Settings', action: () => { setIsMoreMenuOpen(false); setIsSettingsOpen(true); } },
                  { icon: <QrCode size={18} />, label: 'My QR Code', action: () => { setIsMoreMenuOpen(false); setIsQROpen(true); } },
                  { icon: <Share2 size={18} />, label: 'Share Profile', action: () => { setIsMoreMenuOpen(false); shareProfileAsImage(); } },
                  { icon: <Bell size={18} />, label: 'Notifications', action: () => { setIsMoreMenuOpen(false); setIsNotificationsOpen(true); } },
                ].map((item) => (
                  <button key={item.label} className="zx-more-item" onClick={item.action}>
                    <span className="zx-more-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="zx-more-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="zx-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="zx-sheet zx-edit-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="zx-sheet-close" onClick={() => setIsEditModalOpen(false)}><X size={18} /></button>
            <div className="zx-sheet-body zx-scrollable">
              <h3 className="zx-sheet-title">Edit Profile</h3>
              <p className="zx-sheet-subtitle">Keep your sporting bio updated</p>

              {/* Profile logo preview */}
              <div className="zx-edit-logo-preview">
                <div className="zx-edit-logo-ring">
                  <img src={ZENEX_LOGO} alt="Zenex" className="zx-edit-logo-img" />
                </div>
                <div className="zx-edit-logo-note">
                  <Sparkles size={12} />
                  <span>Zenex Galaxy logo is your official profile image</span>
                </div>
              </div>

              <form onSubmit={handleSaveChanges} className="zx-edit-form">
                <div className="zx-form-group">
                  <label className="zx-form-label">Full Name</label>
                  <input
                    type="text"
                    value={tempFullName}
                    onChange={(e) => setTempFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="zx-form-input"
                    required
                  />
                </div>

                <div className="zx-form-group">
                  <label className="zx-form-label">Username</label>
                  <div className="zx-username-wrap">
                    <span className="zx-at-prefix">@</span>
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value.replace(/\s+/g, ''))}
                      placeholder="username"
                      className="zx-form-input zx-username-input"
                      required
                    />
                  </div>
                  {usernameStatus.message && (
                    <span className={`zx-username-msg ${usernameStatus.status}`}>{usernameStatus.message}</span>
                  )}
                </div>

                <div className="zx-form-group">
                  <div className="zx-label-row">
                    <label className="zx-form-label">Bio</label>
                    <span className={`zx-char-count ${tempBio.length > 140 ? 'warn' : ''}`}>{150 - tempBio.length} left</span>
                  </div>
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value.slice(0, 150))}
                    placeholder="Tell other sports enthusiasts about yourself..."
                    className="zx-form-input zx-bio-textarea"
                    rows={3}
                  />
                </div>

                <div className="zx-form-group">
                  <label className="zx-form-label">Location</label>
                  <input
                    type="text"
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    placeholder="City, Country"
                    className="zx-form-input"
                  />
                </div>

                <div className="zx-interests-edit">
                  <span className="zx-interests-edit-title">Interests Setup</span>
                  <div className="zx-interests-sub">
                    <span className="zx-interests-cat">Sports</span>
                    <div className="zx-chip-grid">
                      {['Cricket', 'Football', 'Badminton', 'Running', 'Pickleball', 'Tennis', 'Basketball'].map((s) => (
                        <label key={s} className={`zx-chip-toggle ${tempSports.includes(s) ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={tempSports.includes(s)}
                            onChange={() => setTempSports((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                            style={{ display: 'none' }}
                          />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="zx-interests-sub">
                    <span className="zx-interests-cat">Entertainment & Socials</span>
                    <div className="zx-chip-grid">
                      {['Music', 'Open Mic', 'Food Events', 'Theatre', 'Movies', 'DJ Events', 'Comedy'].map((s) => (
                        <label key={s} className={`zx-chip-toggle ${tempEnt.includes(s) ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={tempEnt.includes(s)}
                            onChange={() => setTempEnt((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                            style={{ display: 'none' }}
                          />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="zx-form-btns">
                  <button type="button" className="zx-form-btn zx-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="zx-form-btn zx-save-btn">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE PROFILE MODAL ── */}
      {isShareModalOpen && (
        <div className="zx-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="zx-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="zx-sheet-close" onClick={() => setIsShareModalOpen(false)}><X size={18} /></button>
            <div className="zx-sheet-body">
              <h3 className="zx-sheet-title">Share Profile</h3>
              <p className="zx-sheet-subtitle">Connect with other players outside Zenex</p>
              <div className="zx-share-url-box">
                <span className="zx-share-url-label">Your Profile Link</span>
                <div className="zx-share-url-row">
                  <span className="zx-share-url-text">{profileUrl}</span>
                  <button className="zx-share-url-copy" onClick={copyProfileLink}><Copy size={15} /></button>
                </div>
              </div>
              <div className="zx-share-grid">
                {[
                  { icon: <LinkIcon size={20} />, label: 'Copy Link', cls: 'link', action: copyProfileLink },
                  { icon: <MessageCircle size={20} />, label: 'WhatsApp', cls: 'whatsapp', action: shareWhatsApp },
                  { icon: <Camera size={20} />, label: 'Stories', cls: 'instagram', action: exportInstagramCard },
                  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>, label: 'Facebook', cls: 'facebook', action: shareFacebook },
                  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>, label: 'Twitter / X', cls: 'twitter', action: shareX },
                  { icon: <Mail size={20} />, label: 'Email', cls: 'email', action: shareEmail },
                  { icon: <UserIcon size={20} />, label: 'Copy Username', cls: 'username', action: copyUsernameOnly },
                ].map((item) => (
                  <button key={item.label} className="zx-share-item" onClick={item.action}>
                    <div className={`zx-share-icon-wrap ${item.cls}`}>{item.icon}</div>
                    <span className="zx-share-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button className="zx-dismiss-btn" onClick={() => setIsShareModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS MODAL ── */}
      {isNotificationsOpen && (
        <div className="zx-overlay" onClick={() => setIsNotificationsOpen(false)}>
          <div className="zx-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="zx-sheet-close" onClick={() => setIsNotificationsOpen(false)}><X size={18} /></button>
            <div className="zx-sheet-body">
              <h3 className="zx-sheet-title">Notifications</h3>
              <p className="zx-sheet-subtitle">Stay connected with your matches</p>
              <div className="zx-notif-list">
                <div className="zx-notif-item unread">
                  <div className="zx-notif-dot" />
                  <div className="zx-notif-info">
                    <span className="zx-notif-text"><strong>Rahul Sharma</strong> sent you a connection request.</span>
                    <span className="zx-notif-time">2h ago</span>
                  </div>
                </div>
                <div className="zx-notif-item">
                  <div className="zx-notif-info">
                    <span className="zx-notif-text">Cricket Match near <strong>Madhapur</strong> starts tomorrow.</span>
                    <span className="zx-notif-time">1d ago</span>
                  </div>
                </div>
                <div className="zx-notif-item">
                  <div className="zx-notif-info">
                    <span className="zx-notif-text">Your badge <strong>Event Organizer</strong> has been unlocked!</span>
                    <span className="zx-notif-time">3d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {isSettingsOpen && (
        <div className="zx-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="zx-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="zx-sheet-close" onClick={() => setIsSettingsOpen(false)}><X size={18} /></button>
            <div className="zx-sheet-body zx-scrollable">
              <h3 className="zx-sheet-title">Settings</h3>
              <p className="zx-sheet-subtitle">Manage your account preferences</p>

              <div className="zx-settings-list">
                {[
                  { icon: <UserIcon size={16} className="s-icon blue" />, label: 'Edit Profile', action: () => { setIsSettingsOpen(false); handleOpenEdit(); } },
                  { icon: <Bell size={16} className="s-icon pink" />, label: 'Notifications', action: () => { setIsSettingsOpen(false); setIsNotificationsOpen(true); } },
                  { icon: <Palette size={16} className="s-icon purple" />, label: `Appearance (${theme === 'light' ? 'Light' : 'Dark'})`, action: () => { setIsSettingsOpen(false); toggleTheme(); } },
                  { icon: <Shield size={16} className="s-icon green" />, label: 'Privacy & Security', action: () => alert('Adjust security levels...') },
                  { icon: <Gift size={16} className="s-icon yellow" />, label: 'Rewards & Badges', action: () => alert('Open rewards menu...') },
                  { icon: <HelpCircle size={16} className="s-icon gray" />, label: 'Help & Support', action: () => alert('Opening help files...') },
                  { icon: <Shield size={16} className="s-icon gray" />, label: 'Terms & Privacy', action: () => alert('Opening Terms & Privacy...') },
                ].map((item) => (
                  <button key={item.label} className="zx-settings-item" onClick={item.action}>
                    <div className="zx-settings-item-left">{item.icon}<span>{item.label}</span></div>
                    <ChevronRight size={15} className="zx-settings-arrow" />
                  </button>
                ))}
                <div className="zx-settings-divider" />
                <button className="zx-logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileView;
