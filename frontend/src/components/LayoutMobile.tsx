import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '../themeContext';
import { Sun, Moon } from 'lucide-react';
import BottomNav from './BottomNav/BottomNav';
import ExplorePage from './ExplorePage/ExplorePage';
import HomePage from './HomePage/HomePage';
import DiscoverPage from './DiscoverPage/DiscoverPage';
import ChatPage from './ChatPage/ChatPage';
import ProfilePage from './ProfilePage/ProfilePage';
import './LayoutMobile.css';

export const LayoutMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mobile-app-container">
      {/* Theme Toggle - Top Right */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? (
          <Moon size={20} />
        ) : (
          <Sun size={20} />
        )}
      </button>

      {/* Page Content */}
      <div className="mobile-content">
        <Routes>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default LayoutMobile;
