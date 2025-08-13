import { useState, useRef, useEffect } from 'react';
import type { MouseEventHandler } from 'react';
import styles from './UserDropdown.module.css';
import { supabase } from '../../../../lib/superbase';
import { useCurrentUser } from '../../../../context/UserContext';

interface UserDropdownProps {
  onSettings?: MouseEventHandler<HTMLButtonElement>;
  onPreferences?: MouseEventHandler<HTMLButtonElement>;
  onLogout?: MouseEventHandler<HTMLButtonElement>;
}

const UserDropdown = ({ onSettings, onPreferences }: UserDropdownProps) => {
  const { user } = useCurrentUser();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!user) return;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = (email: string | undefined) => {
    if (!email) return;
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (callback?: MouseEventHandler<HTMLButtonElement>) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsOpen(false);
      if (callback) {
        callback(e);
      }
    };
  };

  const handleLogout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn("No session found!");
    } else {
      await supabase.auth.signOut();
      window.location.href = "/"
    }
  }

  return (
    <div className={styles.userDropdown} ref={dropdownRef}>
      <button
        className={styles.userButton}
        onClick={toggleDropdown}
        type="button"
      >
        <div className={styles.avatar}>
          {getUserInitials(user.email)}
        </div>
        <span className={styles.userEmail}>{user.email}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownItem}
            onClick={handleMenuClick(onSettings)}
            type="button"
          >
            Settings
          </button>

          <button
            className={styles.dropdownItem}
            onClick={handleMenuClick(onPreferences)}
            type="button"
          >
            Preferences
          </button>

          <div className={styles.divider}></div>

          <button
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={async () => {
              handleLogout();
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;