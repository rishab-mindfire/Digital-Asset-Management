import React, { useCallback, useEffect, useState } from 'react';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoutImage from '../../assets/logout.png';
import folderImage from '../../assets/document-management.png';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleMenu]);

  // log-out
  const handleLogout = () => {
    localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.logo} role="heading">
        <span>File Processing System</span>
        <img src={folderImage} alt="logo image" onClick={() => navigate('/projects')} />
      </div>

      {/* Hamburger Toggle */}
      <button
        className={styles.menuBtn}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        aria-controls="main-navigation"
      >
        <div className={styles.line} aria-hidden="true"></div>
        <div className={styles.line} aria-hidden="true"></div>
        <div className={styles.line} aria-hidden="true"></div>
      </button>

      {/* sidebar=navigations */}
      <nav
        id="main-navigation"
        className={`${styles.navContainer} ${isOpen ? styles.navActive : ''}`}
        aria-label="Primary Navigation"
      >
        <ul className={styles.navLinks}>
          <li className={styles.mobileLogout}>
            <button className={styles.btnLogout} onClick={handleLogout}>
              <span>Logout</span> <img src={logoutImage} alt="logout" />
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout button for smalll screen */}
      <div className={styles.desktopActions}>
        <button className={styles.btnLogout} onClick={handleLogout}>
          <span>Logout</span>
          <img src={logoutImage} alt="logout" />
        </button>
      </div>
    </header>
  );
};

export default Header;
