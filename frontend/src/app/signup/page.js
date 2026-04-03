'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '', graduationYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        ...form,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow}></div>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Start your AI-powered career journey</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.field}>
            <label className="label">Full Name</label>
            <input type="text" className="input" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className="label">Email</label>
            <input type="email" className="input" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className="label">Password</label>
            <input type="password" className="input" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className="label">I am a</label>
            <select className="select" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className="label">College</label>
              <input type="text" className="input" name="college" placeholder="Your college" value={form.college} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className="label">Graduation Year</label>
              <input type="number" className="input" name="graduationYear" placeholder="2026" value={form.graduationYear} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className={styles.authSwitch}>
          Already have an account? <Link href="/login" className={styles.authLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
