'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = pathname === '/';

  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/resume-analyzer', label: 'Resume', icon: '📄' },
        { href: '/learning-roadmap', label: 'Roadmap', icon: '🗺️' },
        { href: '/alumni-network', label: 'Alumni', icon: '👥' },
        { href: '/referral-marketplace', label: 'Referrals', icon: '🔗' },
        { href: '/mock-interview', label: 'Interview', icon: '🎙️' },
      ]
    : [];

  return (
    <nav className={`${styles.navbar} ${isLanding ? styles.landing : ''}`}>
      <div className={styles.container}>
        <Link href={isAuthenticated ? '/dashboard' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>PathNexis<span className={styles.logoAi}>AI</span></span>
        </Link>

        {navLinks.length > 0 && (
          <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.linkIcon}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <button onClick={logout} className={styles.logoutBtn}>Logout</button>
            </div>
          ) : (
            !isLanding && (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginBtn}>Log In</Link>
                <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
              </div>
            )
          )}
          {navLinks.length > 0 && (
            <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
