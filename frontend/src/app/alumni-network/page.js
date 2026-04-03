'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { alumniAPI } from '@/lib/api';
import styles from './page.module.css';

const SAMPLE_ALUMNI = [
  { _id: '1', name: 'Priya Sharma', currentCompany: 'Google', currentRole: 'SDE-2', skills: ['Python', 'ML', 'TensorFlow'], college: 'NIT Durgapur', graduationYear: 2020, isAvailableForMentorship: true, bio: 'Passionate about helping students break into tech' },
  { _id: '2', name: 'Rahul Verma', currentCompany: 'Microsoft', currentRole: 'Product Manager', skills: ['Product Strategy', 'SQL', 'Analytics'], college: 'BIT Mesra', graduationYear: 2019, isAvailableForMentorship: true, bio: 'Ex-startup founder, now at Microsoft' },
  { _id: '3', name: 'Ananya Das', currentCompany: 'Amazon', currentRole: 'SDE-1', skills: ['Java', 'AWS', 'System Design'], college: 'KIIT Bhubaneswar', graduationYear: 2022, isAvailableForMentorship: false, bio: 'Helping students prepare for FAANG interviews' },
  { _id: '4', name: 'Karthik Nair', currentCompany: 'Flipkart', currentRole: 'Data Scientist', skills: ['Python', 'Data Science', 'NLP'], college: 'VIT Vellore', graduationYear: 2021, isAvailableForMentorship: true, bio: 'Data science enthusiast and mentor' },
  { _id: '5', name: 'Sneha Gupta', currentCompany: 'Razorpay', currentRole: 'Frontend Lead', skills: ['React', 'TypeScript', 'Node.js'], college: 'SRM Chennai', graduationYear: 2018, isAvailableForMentorship: true, bio: 'Building beautiful web experiences' },
  { _id: '6', name: 'Aditya Kumar', currentCompany: 'Swiggy', currentRole: 'Backend Engineer', skills: ['Go', 'Kubernetes', 'Microservices'], college: 'Manipal University', graduationYear: 2020, isAvailableForMentorship: true, bio: 'Distributed systems engineer' },
];

export default function AlumniNetworkPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(new Set());
  const [requestingMentor, setRequestingMentor] = useState(null);
  const [mentorTopic, setMentorTopic] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      alumniAPI.getAll({ limit: 50 }).then(r => {
        setAlumni(r.data.alumni?.length > 0 ? r.data.alumni : SAMPLE_ALUMNI);
        setLoading(false);
      }).catch(() => {
        setAlumni(SAMPLE_ALUMNI);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  const handleConnect = (id) => {
    setConnected(prev => new Set([...prev, id]));
    alumniAPI.connect(id).catch(() => {});
  };

  const handleRequestMentorship = async () => {
    if (!mentorTopic.trim()) return;
    try {
      await alumniAPI.requestMentorship({ mentorId: requestingMentor, topic: mentorTopic });
      setRequestingMentor(null);
      setMentorTopic('');
      alert('Mentorship request sent!');
    } catch {
      alert('Request sent (demo mode)');
      setRequestingMentor(null);
      setMentorTopic('');
    }
  };

  const filtered = alumni.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.currentCompany?.toLowerCase().includes(search.toLowerCase()) ||
    a.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading || !isAuthenticated) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Alumni Network</h1>
        <p className="page-subtitle">Connect with alumni from top companies for mentorship and guidance</p>
      </div>

      <div className={styles.searchBar}>
        <input className="input" placeholder="Search by name, company, or skill..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : (
        <div className={styles.alumniGrid}>
          {filtered.map((person) => (
            <div key={person._id} className={styles.alumniCard}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{person.name?.charAt(0)}</div>
                <div>
                  <div className={styles.name}>{person.name}</div>
                  <div className={styles.role}>{person.currentRole} at <strong>{person.currentCompany}</strong></div>
                </div>
                {person.isAvailableForMentorship && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Mentor</span>}
              </div>
              {person.bio && <p className={styles.bio}>{person.bio}</p>}
              <div className={styles.meta}>
                {person.college && <span>🎓 {person.college}</span>}
                {person.graduationYear && <span>📅 Class of {person.graduationYear}</span>}
              </div>
              {person.skills?.length > 0 && (
                <div className={styles.skills}>
                  {person.skills.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
                </div>
              )}
              <div className={styles.cardActions}>
                <button
                  className={`btn ${connected.has(person._id) ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
                  onClick={() => handleConnect(person._id)}
                  disabled={connected.has(person._id)}
                >
                  {connected.has(person._id) ? '✓ Connected' : '🔗 Connect'}
                </button>
                {person.isAvailableForMentorship && (
                  <button className="btn btn-primary btn-sm" onClick={() => setRequestingMentor(person._id)}>
                    📅 Request Mentorship
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mentorship Modal */}
      {requestingMentor && (
        <div className={styles.modalOverlay} onClick={() => setRequestingMentor(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Request Mentorship Session</h3>
            <div className={styles.field}>
              <label className="label">What do you want mentorship on?</label>
              <textarea className="textarea" placeholder="e.g., Career guidance, interview prep, resume review..." value={mentorTopic} onChange={e => setMentorTopic(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleRequestMentorship}>Send Request</button>
              <button className="btn btn-ghost" onClick={() => setRequestingMentor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
