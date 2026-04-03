'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { referralAPI } from '@/lib/api';
import styles from './page.module.css';

const SAMPLE_REFERRALS = [
  { _id: '1', company: 'Google', role: 'Software Engineer L3', description: 'Looking for a motivated engineer to join the Cloud team. Strong DSA and system design skills required.', type: 'full-time', experienceLevel: 'entry', location: 'Bangalore', tags: ['Python', 'Cloud', 'DSA'], postedBy: { name: 'Priya Sharma', currentRole: 'SDE-2' }, createdAt: new Date().toISOString() },
  { _id: '2', company: 'Microsoft', role: 'SDE Intern', description: 'Summer internship opportunity in Azure DevOps. Great learning experience for students.', type: 'internship', experienceLevel: 'entry', location: 'Hyderabad', tags: ['C++', 'Azure', 'DevOps'], postedBy: { name: 'Rahul Verma', currentRole: 'PM' }, createdAt: new Date().toISOString() },
  { _id: '3', company: 'Razorpay', role: 'Frontend Developer', description: 'Join our frontend team building payment UIs used by millions. React/TypeScript expertise needed.', type: 'full-time', experienceLevel: 'entry', location: 'Bangalore', tags: ['React', 'TypeScript', 'CSS'], postedBy: { name: 'Sneha Gupta', currentRole: 'Frontend Lead' }, createdAt: new Date().toISOString() },
  { _id: '4', company: 'Amazon', role: 'SDE-1', description: 'Opening in the Retail team. Looking for someone with strong problem-solving skills and Java experience.', type: 'full-time', experienceLevel: 'entry', location: 'Chennai', tags: ['Java', 'Spring Boot', 'AWS'], postedBy: { name: 'Ananya Das', currentRole: 'SDE-1' }, createdAt: new Date().toISOString() },
  { _id: '5', company: 'Flipkart', role: 'Data Analyst Intern', description: 'Analyze supply chain data and build dashboards. SQL and Python required.', type: 'internship', experienceLevel: 'entry', location: 'Bangalore', tags: ['SQL', 'Python', 'Tableau'], postedBy: { name: 'Karthik Nair', currentRole: 'Data Scientist' }, createdAt: new Date().toISOString() },
  { _id: '6', company: 'Swiggy', role: 'Backend Engineer', description: 'Work on high-scale distributed systems serving millions of users daily.', type: 'full-time', experienceLevel: 'mid', location: 'Bangalore', tags: ['Go', 'Kubernetes', 'Microservices'], postedBy: { name: 'Aditya Kumar', currentRole: 'Backend Engineer' }, createdAt: new Date().toISOString() },
];

export default function ReferralMarketplacePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      referralAPI.getAll({ limit: 50 }).then(r => {
        setReferrals(r.data.referrals?.length > 0 ? r.data.referrals : SAMPLE_REFERRALS);
        setLoading(false);
      }).catch(() => {
        setReferrals(SAMPLE_REFERRALS);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  const handleApply = async (id) => {
    setApplied(prev => new Set([...prev, id]));
    try {
      await referralAPI.apply(id, { note: 'Interested in this opportunity' });
    } catch {}
  };

  const filtered = referrals.filter(r => {
    const matchSearch = !search || r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) || r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = !typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });

  if (authLoading || !isAuthenticated) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🔗 Referral Marketplace</h1>
        <p className="page-subtitle">Exclusive job referrals from alumni at top companies</p>
      </div>

      <div className={styles.filters}>
        <input className="input" style={{ maxWidth: 400 }} placeholder="Search by company, role, or skill..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className={styles.filterBtns}>
          {['', 'full-time', 'internship', 'part-time'].map(type => (
            <button key={type} className={`btn btn-sm ${typeFilter === type ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTypeFilter(type)}>
              {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : (
        <div className={styles.referralGrid}>
          {filtered.map((ref) => (
            <div key={ref._id} className={styles.referralCard}>
              <div className={styles.cardHeader}>
                <div className={styles.companyIcon}>{ref.company.charAt(0)}</div>
                <div>
                  <div className={styles.cardRole}>{ref.role}</div>
                  <div className={styles.cardCompany}>{ref.company}</div>
                </div>
                <span className={`badge ${ref.type === 'internship' ? 'badge-info' : 'badge-primary'}`} style={{ marginLeft: 'auto' }}>
                  {ref.type}
                </span>
              </div>
              <p className={styles.cardDesc}>{ref.description}</p>
              <div className={styles.cardMeta}>
                <span>📍 {ref.location}</span>
                <span>👤 {ref.postedBy?.name}</span>
              </div>
              {ref.tags?.length > 0 && (
                <div className={styles.cardTags}>
                  {ref.tags.map((t, i) => <span key={i} className="badge badge-primary">{t}</span>)}
                </div>
              )}
              <button
                className={`btn ${applied.has(ref._id) ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                onClick={() => handleApply(ref._id)}
                disabled={applied.has(ref._id)}
                style={{ width: '100%', marginTop: 8 }}
              >
                {applied.has(ref._id) ? '✓ Applied' : '🚀 Apply for Referral'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
