import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import './EditProfileMobile.css';

const TAKEN_USERNAMES = ['admin', 'neha', 'rahul', 'aisha', 'root', 'auth', 'sports', 'zenex', 'cricket', 'manager', 'football'];
const ZENEX_LOGO = '/logo.png';

interface EditProfileMobileProps {
  onBack: () => void;
  initialData?: {
    fullName: string;
    username: string;
    bio: string;
    location: string;
    sports: string[];
    entertainment: string[];
  };
}

export const EditProfileMobile: React.FC<EditProfileMobileProps> = ({ 
  onBack,
  initialData = {
    fullName: localStorage.getItem('zenex-fullname') || '',
    username: localStorage.getItem('zenex-username') || '',
    bio: localStorage.getItem('zenex-bio') || '',
    location: localStorage.getItem('zenex-location') || '',
    sports: JSON.parse(localStorage.getItem('zenex-sports') || '[]'),
    entertainment: JSON.parse(localStorage.getItem('zenex-ent') || '[]'),
  }
}) => {
  const { theme } = useTheme();

  // Form states
  const [fullName, setFullName] = useState(initialData.fullName);
  const [username, setUsername] = useState(initialData.username);
  const [bio, setBio] = useState(initialData.bio);
  const [location, setLocation] = useState(initialData.location);
  const [sports, setSports] = useState<string[]>(initialData.sports);
  const [entertainment, setEntertainment] = useState<string[]>(initialData.entertainment);

  const [usernameStatus, setUsernameStatus] = useState<{
    status: 'checking' | 'available' | 'taken' | 'invalid' | 'idle';
    message: string;
  }>({ status: 'idle', message: '' });

  const [isSaving, setIsSaving] = useState(false);

  // Username validation
  useEffect(() => {
    if (username.trim().toLowerCase() === initialData.username.toLowerCase()) {
      setUsernameStatus({ status: 'idle', message: '' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setUsernameStatus({ status: 'idle', message: '' });
      return;
    }

    if (cleanUsername.length < 3) {
      setUsernameStatus({ status: 'invalid', message: 'Must be at least 3 characters' });
      return;
    }

    setUsernameStatus({ status: 'checking', message: 'Checking availability...' });
    const timer = setTimeout(() => {
      if (TAKEN_USERNAMES.includes(cleanUsername)) {
        setUsernameStatus({ status: 'taken', message: 'Username is already taken' });
      } else {
        setUsernameStatus({ status: 'available', message: 'Username is available!' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, initialData.username]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }

    if (usernameStatus.status === 'taken' || usernameStatus.status === 'invalid') {
      toast.error('Please fix the username errors before saving');
      return;
    }

    setIsSaving(true);

    // Simulate save
    setTimeout(() => {
      localStorage.setItem('zenex-fullname', fullName.trim());
      localStorage.setItem('zenex-username', username.trim().toLowerCase());
      localStorage.setItem('zenex-bio', bio);
      localStorage.setItem('zenex-location', location.trim());
      localStorage.setItem('zenex-sports', JSON.stringify(sports));
      localStorage.setItem('zenex-ent', JSON.stringify(entertainment));

      setIsSaving(false);
      toast.success('Profile updated successfully');
      onBack();
    }, 600);
  };

  const toggleSport = (sport: string) => {
    setSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const toggleEntertainment = (ent: string) => {
    setEntertainment(prev => prev.includes(ent) ? prev.filter(e => e !== ent) : [...prev, ent]);
  };

  const sportsOptions = ['Cricket', 'Football', 'Badminton', 'Running', 'Pickleball', 'Tennis', 'Basketball'];
  const entertainmentOptions = ['Music', 'Open Mic', 'Food Events', 'Theatre', 'Movies', 'DJ Events', 'Comedy'];

  return (
    <div className="epm-container">
      {/* Fixed Header */}
      <header className="epm-header">
        <button className="epm-back-btn" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="epm-title">Edit Profile</h1>
        <button 
          className={`epm-save-btn ${isSaving ? 'saving' : ''}`}
          onClick={handleSave}
          disabled={isSaving || usernameStatus.status === 'taken' || usernameStatus.status === 'invalid'}
          aria-label="Save profile"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="epm-scroll-area">
        <form onSubmit={handleSave} className="epm-form">
          {/* Profile Image Section */}
          <section className="epm-avatar-section">
            <div className="epm-avatar-wrapper">
              <img src={ZENEX_LOGO} alt="Profile" className="epm-avatar-img" />
              <div className="epm-avatar-badge">
                <Sparkles size={16} />
              </div>
            </div>
            <p className="epm-avatar-hint">Zenex Galaxy is your official profile image</p>
          </section>

          {/* Form Fields */}
          <section className="epm-form-section">
            {/* Full Name */}
            <div className="epm-form-group">
              <label className="epm-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="epm-input"
                maxLength={50}
              />
              <span className="epm-char-count">{50 - fullName.length} characters left</span>
            </div>

            {/* Username */}
            <div className="epm-form-group">
              <label className="epm-label">Username</label>
              <div className="epm-username-wrapper">
                <span className="epm-at-symbol">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="username"
                  className="epm-input epm-username-input"
                  maxLength={30}
                />
              </div>
              {usernameStatus.message && (
                <div className={`epm-status-msg epm-status-${usernameStatus.status}`}>
                  {usernameStatus.status === 'available' && <Check size={14} />}
                  {usernameStatus.status === 'taken' && <AlertCircle size={14} />}
                  {usernameStatus.status === 'invalid' && <AlertCircle size={14} />}
                  {usernameStatus.status === 'checking' && <span className="epm-spinner" />}
                  <span>{usernameStatus.message}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="epm-form-group">
              <div className="epm-label-row">
                <label className="epm-label">Bio</label>
                <span className={`epm-char-count ${bio.length > 140 ? 'warn' : ''}`}>
                  {150 - bio.length} left
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                placeholder="Tell other sports enthusiasts about yourself..."
                className="epm-textarea"
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="epm-form-group">
              <label className="epm-label">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="epm-input"
                maxLength={50}
              />
            </div>
          </section>

          {/* Interests Section */}
          <section className="epm-interests-section">
            <h3 className="epm-section-title">Sports & Entertainment</h3>

            {/* Sports */}
            <div className="epm-interest-group">
              <h4 className="epm-interest-category">Sports</h4>
              <div className="epm-chip-container">
                {sportsOptions.map(sport => (
                  <button
                    key={sport}
                    type="button"
                    className={`epm-chip ${sports.includes(sport) ? 'active' : ''}`}
                    onClick={() => toggleSport(sport)}
                  >
                    {sports.includes(sport) && <Check size={14} className="epm-chip-check" />}
                    <span>{sport}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Entertainment */}
            <div className="epm-interest-group">
              <h4 className="epm-interest-category">Entertainment</h4>
              <div className="epm-chip-container">
                {entertainmentOptions.map(ent => (
                  <button
                    key={ent}
                    type="button"
                    className={`epm-chip ${entertainment.includes(ent) ? 'active' : ''}`}
                    onClick={() => toggleEntertainment(ent)}
                  >
                    {entertainment.includes(ent) && <Check size={14} className="epm-chip-check" />}
                    <span>{ent}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Spacing for Navigation */}
          <div className="epm-bottom-spacing" />
        </form>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="epm-bottom-buttons">
        <button
          type="button"
          className="epm-btn epm-btn-cancel"
          onClick={onBack}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`epm-btn epm-btn-save ${isSaving ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={isSaving || usernameStatus.status === 'taken' || usernameStatus.status === 'invalid'}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProfileMobile;
