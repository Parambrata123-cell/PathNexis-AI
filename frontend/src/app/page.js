'use client';
import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    icon: '📄',
    title: 'AI Resume Analyzer',
    description: 'Get instant ATS scoring, keyword analysis, and actionable suggestions powered by AI.',
    color: '#6c5ce7',
  },
  {
    icon: '🗺️',
    title: 'Learning Roadmap',
    description: 'Personalized career paths with curated free resources tailored to your goals.',
    color: '#00b894',
  },
  {
    icon: '👥',
    title: 'Alumni Network',
    description: 'Connect with industry professionals for mentorship and career guidance.',
    color: '#00d2ff',
  },
  {
    icon: '🔗',
    title: 'Referral Marketplace',
    description: 'Access exclusive job referrals from alumni at top companies.',
    color: '#fdcb6e',
  },
  {
    icon: '🎙️',
    title: 'AI Mock Interviews',
    description: 'Practice with AI-powered interviews and get instant feedback on your responses.',
    color: '#ff6b6b',
  },
  {
    icon: '📊',
    title: 'Progress Dashboard',
    description: 'Track your career development journey with comprehensive analytics.',
    color: '#a29bfe',
  },
];

const stats = [
  { value: '10K+', label: 'Students Empowered' },
  { value: '500+', label: 'Alumni Mentors' },
  { value: '85%', label: 'Placement Rate' },
  { value: '50+', label: 'Partner Companies' },
];

export default function Home() {
  return (
    <div className={styles.landing}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            AI-Powered Career Platform
          </div>
          <h1 className={styles.heroTitle}>
            Your Career Journey,
            <br />
            <span className={styles.heroGradient}>Reimagined with AI</span>
          </h1>
          <p className={styles.heroDescription}>
            PathNexis AI empowers Tier 3 & Tier 4 students with intelligent tools to analyze resumes,
            build learning roadmaps, connect with alumni, and ace interviews.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/signup" className={styles.ctaPrimary}>
              Get Started Free →
            </Link>
            <Link href="/login" className={styles.ctaSecondary}>
              Log In
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span className={styles.heroCardDot} style={{ background: '#ff6b6b' }}></span>
              <span className={styles.heroCardDot} style={{ background: '#fdcb6e' }}></span>
              <span className={styles.heroCardDot} style={{ background: '#00b894' }}></span>
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroScore}>
                <div className={styles.heroScoreCircle}>87</div>
                <div>
                  <div className={styles.heroScoreLabel}>ATS Score</div>
                  <div className={styles.heroScoreStatus}>Excellent Match</div>
                </div>
              </div>
              <div className={styles.heroMetrics}>
                <div className={styles.heroMetric}>
                  <span>Keywords</span>
                  <div className={styles.heroBar}><div className={styles.heroBarFill} style={{ width: '78%' }}></div></div>
                </div>
                <div className={styles.heroMetric}>
                  <span>Format</span>
                  <div className={styles.heroBar}><div className={styles.heroBarFill} style={{ width: '92%' }}></div></div>
                </div>
                <div className={styles.heroMetric}>
                  <span>Skills</span>
                  <div className={styles.heroBar}><div className={styles.heroBarFill} style={{ width: '85%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.stat}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything You Need to <span className={styles.heroGradient}>Launch Your Career</span></h2>
          <p className={styles.sectionSubtitle}>
            Comprehensive AI-powered tools designed specifically for students from Tier 3 & Tier 4 colleges.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon} style={{ background: `${feature.color}20`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaSectionTitle}>Ready to Transform Your Career?</h2>
          <p className={styles.ctaSectionDesc}>Join thousands of students who are already building their dream careers with PathNexis AI.</p>
          <Link href="/signup" className={styles.ctaPrimary}>Start Your Journey →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span style={{ fontSize: 20 }}>◆</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>PathNexis<span className={styles.heroGradient}>AI</span></span>
          </div>
          <p className={styles.footerText}>Empowering careers through AI. Built for Tier 3 & Tier 4 students.</p>
          <p className={styles.footerCopy}>© 2026 PathNexis AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
