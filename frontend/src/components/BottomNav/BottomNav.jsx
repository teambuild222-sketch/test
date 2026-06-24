import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, MessageCircle, User } from 'lucide-react';
import { generateAvatar } from '../../utils/imageGenerator';
import './BottomNav.css';

const tabs = [
  { label: 'Home',     icon: Home,          path: '/' },
  { label: 'Explore',  icon: Compass,       path: '/explore' },
  { label: 'Discover', icon: Search,        path: '/discover' },
  { label: 'Chat',     icon: MessageCircle, path: '/chat' },
  { label: 'Profile',  icon: User,          path: '/profile' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const username = localStorage.getItem('zenex-username') || 'user';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dynamic-island-nav-wrapper">
      <nav className="dynamic-island-nav">
        {tabs.map((tab) => {
          const Icon   = tab.icon;
          const active = isActive(tab.path);
          
          if (tab.label === 'Profile') {
            return (
              <button
                key={tab.path}
                className={`island-tab-profile ${active ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                type="button"
              >
                <div className="island-profile-avatar-wrapper">
                  <img 
                    src={generateAvatar(username)} 
                    alt="Profile" 
                    className="island-profile-avatar" 
                  />
                </div>
                <div className="island-tab-dot" />
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              className={`island-tab ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              type="button"
            >
              <Icon size={22} className="island-icon" />
              <div className="island-tab-dot" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;

