'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow}></div>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authSubtitle}>Log in to continue your career journey</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.field}>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className={styles.authSwitch}>
          Don&apos;t have an account? <Link href="/signup" className={styles.authLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
