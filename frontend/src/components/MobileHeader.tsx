import React from 'react';
import { ThemeSwitch } from './ThemeSwitch';
import './MobileHeader.css';

export const MobileHeader: React.FC = () => {
  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <h1 className="mobile-header-title">ZENEX</h1>
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default MobileHeader;
