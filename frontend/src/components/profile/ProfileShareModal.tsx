import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, CheckCircle, Image as ImageIcon } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Toaster, toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import './ProfileShareModal.css';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  fullname: string;
  profileImage: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: (url: string, name: string) => void;
}

export const ProfileShareModal: React.FC<ProfileShareModalProps> = ({
  isOpen,
  onClose,
  username,
  fullname,
  profileImage,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://zenex.app/profile/@${username}`;

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      action: (url, name) => {
        const text = `Check out my profile on ZENEX: ${url}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          '_blank'
        );
      },
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: '📸',
      color: '#E4405F',
      action: (url, name) => {
        const text = `Check out my profile on ZENEX: ${url}`;
        window.open(
          `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        toast.success('Copied! Paste in Instagram story or message');
      },
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      action: (url, name) => {
        const text = `Check out my profile on ZENEX: ${url}`;
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          '_blank'
        );
      },
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      icon: '𝕏',
      color: '#000000',
      action: (url, name) => {
        const text = `Check out my profile on ZENEX: ${url}`;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          '_blank'
        );
      },
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: '👍',
      color: '#1877F2',
      action: (url, name) => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      action: (url, name) => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      id: 'gmail',
      label: 'Gmail',
      icon: '✉️',
      color: '#EA4335',
      action: (url, name) => {
        const subject = `Connect with me on ZENEX`;
        const body = `Hey! Check out my profile on ZENEX:\n\n${url}\n\nLet's connect!`;
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          '_blank'
        );
      },
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: '📋',
      color: '#8b5cf6',
      action: (url, name) => {
        copyToClipboard(url);
      },
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Profile link copied successfully! 🎉');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `zenex-profile-${username}.png`;
      link.click();
      toast.success('QR code downloaded! 📥');
    }
  };

  const saveProfileCardAsImage = async () => {
    try {
      toast.loading('Generating profile card...');
      const cardElement = document.querySelector('.psm-profile-card-export');
      if (!cardElement) {
        toast.error('Could not find profile card');
        return;
      }

      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `zenex-profile-card-${username}.png`;
      link.click();
      toast.success('Profile card saved! 🎨');
    } catch (err) {
      console.error('Failed to save profile card:', err);
      toast.error('Failed to save profile card');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connect with ${fullname} on ZENEX`,
          text: 'Check out my profile on ZENEX',
          url: profileUrl,
        });
        toast.success('Shared successfully! 🚀');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleShareClick = (option: ShareOption) => {
    option.action(profileUrl, fullname);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 30, stiffness: 300 },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <Toaster position="top-center" />
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="psm-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="psm-container"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Handle Bar */}
              <div className="psm-handle-bar" />

              {/* Close Button */}
              <button
                className="psm-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {/* Content */}
              <div className="psm-content">
                {/* Header Section with Profile & QR */}
                <div className="psm-header-section">
                  {/* Profile Info */}
                  <div className="psm-profile-info">
                    <div className="psm-avatar">
                      <img src={profileImage} alt={fullname} />
                    </div>

                    <div className="psm-profile-details">
                      <h2 className="psm-name">{fullname}</h2>
                      <p className="psm-username">@{username}</p>
                      <p className="psm-cta">Scan to connect with me on ZENEX</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="psm-qr-container">
                    <div className="psm-qr-wrapper" ref={qrRef}>
                      <QRCode
                        value={profileUrl}
                        size={160}
                        level="H"
                        includeMargin={true}
                        fgColor="currentColor"
                        bgColor="transparent"
                      />
                    </div>

                    {/* QR Actions */}
                    <div className="psm-qr-actions">
                      <button
                        className="psm-download-btn"
                        onClick={downloadQR}
                        title="Download QR code"
                      >
                        <Download size={16} />
                        <span>Download QR</span>
                      </button>
                      <button
                        className="psm-download-btn"
                        onClick={saveProfileCardAsImage}
                        title="Save profile card as image"
                      >
                        <ImageIcon size={16} />
                        <span>Save Card</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Share Options Grid */}
                <div className="psm-share-grid">
                  {shareOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      className="psm-share-btn"
                      onClick={() => handleShareClick(option)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={option.label}
                    >
                      <div className="psm-share-icon">{option.icon}</div>
                      <span className="psm-share-label">{option.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Copy Link Section */}
                <div className="psm-copy-section">
                  <div className="psm-url-display">
                    <code>{profileUrl}</code>
                  </div>
                  <button
                    className={`psm-copy-url-btn ${copied ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(profileUrl)}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Native Share Button */}
                {navigator.share && (
                  <button
                    className="psm-native-share-btn"
                    onClick={handleNativeShare}
                  >
                    Share via Native Menu
                  </button>
                )}
              </div>

              {/* Hidden Profile Card Export */}
              <div className="psm-profile-card-export">
                <div className="psm-card-background">
                  <div className="psm-card-glow-top" />
                  <div className="psm-card-glow-bottom" />
                </div>
                <div className="psm-card-content">
                  <div className="psm-card-avatar">
                    <img src={profileImage} alt={fullname} />
                  </div>

                  <h3 className="psm-card-name">{fullname}</h3>
                  <p className="psm-card-username">@{username}</p>

                  <div className="psm-card-qr-section">
                    <QRCode
                      value={profileUrl}
                      size={120}
                      level="H"
                      includeMargin={true}
                      fgColor="#1f1f27"
                      bgColor="#ffffff"
                    />
                  </div>

                  <p className="psm-card-cta">Scan to connect with me on ZENEX</p>

                  <div className="psm-card-footer">
                    <div className="psm-card-logo">ZENEX</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileShareModal;
