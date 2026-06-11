import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Users, Award, Check, UserPlus, UserCheck, Heart } from 'lucide-react';
import { aiApi } from '../../api/ai';

interface EventCardProps {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  attendees: number;
  distance: string;
  attending: boolean;
  username: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  category,
  date,
  time,
  location,
  image,
  attendees,
  distance,
  attending: initialAttending,
  username,
}) => {
  const [isAttending, setIsAttending] = useState(initialAttending);
  const [attendeesCount, setAttendeesCount] = useState(attendees);
  const [isLoading, setIsLoading] = useState(false);

  const handleRSVP = async () => {
    setIsLoading(true);
    try {
      const nextStatus = isAttending ? 'Declined' : 'Attending';
      const data = await aiApi.rsvpEvent(username, id);
      if (data.success) {
        setIsAttending(!isAttending);
        setAttendeesCount(prev => isAttending ? prev - 1 : prev + 1);
        toast.success(data.message || `Successfully RSVP'd!`);
        // Dispatch custom event to trigger profile and layout stats updates
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update RSVP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card ai-rich-card ai-event-card animate-scaleIn">
      <div className="ai-card-image-wrapper">
        <img src={image} alt={title} className="ai-card-image" />
        <span className="ai-card-category-tag">{category}</span>
        <span className="ai-card-distance-tag">{distance}</span>
      </div>
      <div className="ai-card-content">
        <h4 className="ai-card-title">{title}</h4>
        <div className="ai-card-details">
          <div className="ai-card-detail-item">
            <Calendar size={14} />
            <span>{date} • {time}</span>
          </div>
          <div className="ai-card-detail-item">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
          <div className="ai-card-detail-item">
            <Users size={14} />
            <span>{attendeesCount} attending</span>
          </div>
        </div>
        <button
          onClick={handleRSVP}
          disabled={isLoading}
          className={`ai-card-action-btn ${isAttending ? 'attending' : ''}`}
        >
          {isLoading ? (
            <span className="ai-btn-spinner" />
          ) : isAttending ? (
            <>
              <Check size={14} />
              <span>Attending</span>
            </>
          ) : (
            <span>RSVP Now</span>
          )}
        </button>
      </div>
    </div>
  );
};

interface CommunityCardProps {
  title: string;
  category: string;
  description: string;
  members: number;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  title,
  category,
  description,
  members,
}) => {
  const [joined, setJoined] = useState(false);
  const [membersCount, setMembersCount] = useState(members);

  const handleJoin = () => {
    if (joined) {
      setJoined(false);
      setMembersCount(prev => prev - 1);
      toast.success(`Left community: ${title}`);
    } else {
      setJoined(true);
      setMembersCount(prev => prev + 1);
      toast.success(`Joined community: ${title}! Welcome!`);
    }
  };

  return (
    <div className="glass-card ai-rich-card ai-community-card animate-scaleIn">
      <div className="ai-community-header">
        <div>
          <h4 className="ai-community-title">{title}</h4>
          <span className="ai-community-tag">{category}</span>
        </div>
        <div className="ai-community-members">
          <Users size={14} />
          <span>{membersCount} members</span>
        </div>
      </div>
      <p className="ai-community-desc">{description}</p>
      <button
        onClick={handleJoin}
        className={`ai-card-action-btn ${joined ? 'joined' : ''}`}
      >
        {joined ? (
          <>
            <Check size={14} />
            <span>Joined</span>
          </>
        ) : (
          <span>Join Community</span>
        )}
      </button>
    </div>
  );
};

interface UserCardProps {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  distance: string;
  status: string; // connected, pending, not_connected
  points: number;
  level: string;
  currentUser: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  username,
  avatar,
  bio,
  distance,
  status: initialStatus,
  points,
  level,
  currentUser,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.connectUser(currentUser, id);
      if (data.success) {
        setStatus('pending');
        toast.success(data.message || `Connection request sent to ${name}!`);
        // Sync stats in layout
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send connect request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card ai-rich-card ai-user-card animate-scaleIn">
      <div className="ai-user-profile-header">
        <img src={avatar} alt={name} className="ai-user-avatar" />
        <div className="ai-user-meta">
          <h4 className="ai-user-name">{name}</h4>
          <span className="ai-user-handle">@{username}</span>
          <div className="ai-user-badges-row">
            <span className="ai-user-badge-level">{level}</span>
            <span className="ai-user-badge-points">{points} XP</span>
          </div>
        </div>
        <span className="ai-user-distance">{distance}</span>
      </div>
      <p className="ai-user-bio">{bio}</p>
      <button
        onClick={handleConnect}
        disabled={isLoading || status === 'connected' || status === 'pending'}
        className={`ai-card-action-btn ${status}`}
      >
        {isLoading ? (
          <span className="ai-btn-spinner" />
        ) : status === 'connected' ? (
          <>
            <UserCheck size={14} />
            <span>Connected</span>
          </>
        ) : status === 'pending' ? (
          <>
            <Check size={14} />
            <span>Request Pending</span>
          </>
        ) : (
          <>
            <UserPlus size={14} />
            <span>Connect</span>
          </>
        )}
      </button>
    </div>
  );
};

interface BadgeCardProps {
  name: string;
  description: string;
  color: string;
  image: string;
  unlocked: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  name,
  description,
  color,
  image,
  unlocked,
}) => {
  return (
    <div className={`glass-card ai-rich-card ai-badge-card badge-${color} ${unlocked ? 'unlocked' : 'locked'} animate-scaleIn`}>
      <div className="ai-badge-icon-wrap">
        <span className="ai-badge-icon">{image}</span>
        {!unlocked && <span className="ai-badge-lock-overlay">🔒</span>}
      </div>
      <div className="ai-badge-body">
        <h4 className="ai-badge-name">{name}</h4>
        <p className="ai-badge-desc">{description}</p>
        <span className={`ai-badge-status-pill ${unlocked ? 'unlocked' : 'locked'}`}>
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>
    </div>
  );
};
