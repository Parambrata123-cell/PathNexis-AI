'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { resumeAPI, roadmapAPI } from '@/lib/api';
import styles from './page.module.css';

const quickActions = [
  { href: '/resume-analyzer', icon: '📄', title: 'Resume Analyzer', desc: 'Get AI-powered ATS scoring', color: '#6c5ce7' },
  { href: '/learning-roadmap', icon: '🗺️', title: 'Learning Roadmap', desc: 'Personalized career path', color: '#00b894' },
  { href: '/alumni-network', icon: '👥', title: 'Alumni Network', desc: 'Connect with mentors', color: '#00d2ff' },
  { href: '/referral-marketplace', icon: '🔗', title: 'Referrals', desc: 'Find job referrals', color: '#fdcb6e' },
  { href: '/mock-interview', icon: '🎙️', title: 'Mock Interview', desc: 'Practice with AI', color: '#ff6b6b' },
];

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumeCount, setResumeCount] = useState(0);
  const [latestScore, setLatestScore] = useState(null);
  const [roadmapCount, setRoadmapCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      resumeAPI.getHistory().then(r => {
        setResumeCount(r.data.length);
        if (r.data.length > 0) setLatestScore(r.data[0].atsScore);
      }).catch(() => {});
      roadmapAPI.getAll().then(r => setRoadmapCount(r.data.length)).catch(() => {});
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return <div className="loading-container"><div className="spinner"></div><p>Loading...</p></div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className="page-container">
        <div className={styles.welcomeSection}>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome back, <span className={styles.gradient}>{user?.name?.split(' ')[0] || 'there'}</span> 👋</h1>
            <p className={styles.welcomeSubtitle}>Here&apos;s an overview of your career development journey</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(108,92,231,0.12)', color: '#6c5ce7' }}>📄</div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{resumeCount}</div>
              <div className={styles.statLabel}>Resumes Analyzed</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0,184,148,0.12)', color: '#00b894' }}>🎯</div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{latestScore ?? '—'}</div>
              <div className={styles.statLabel}>Latest ATS Score</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0,210,255,0.12)', color: '#00d2ff' }}>🗺️</div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{roadmapCount}</div>
              <div className={styles.statLabel}>Active Roadmaps</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(253,203,110,0.12)', color: '#fdcb6e' }}>⭐</div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{user?.role || 'student'}</div>
              <div className={styles.statLabel}>Account Type</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={styles.actionCard}>
                <div className={styles.actionIcon} style={{ background: `${action.color}18`, color: action.color }}>
                  {action.icon}
                </div>
                <div>
                  <div className={styles.actionTitle}>{action.title}</div>
                  <div className={styles.actionDesc}>{action.desc}</div>
                </div>
                <span className={styles.actionArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Card */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Profile</h2>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{user?.name}</div>
              <div className={styles.profileEmail}>{user?.email}</div>
              {user?.college && <div className={styles.profileDetail}>🎓 {user.college}</div>}
              {user?.skills?.length > 0 && (
                <div className={styles.profileSkills}>
                  {user.skills.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
