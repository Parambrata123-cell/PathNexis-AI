'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { interviewAPI } from '@/lib/api';
import styles from './page.module.css';

export default function MockInterviewPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState('setup'); // setup | interview | feedback
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('mixed');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const startInterview = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    try {
      const res = await interviewAPI.getQuestion({ role, difficulty, category });
      setQuestion(res.data);
      setPhase('interview');
      setQuestionCount(1);
    } catch {
      alert('Failed to generate question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await interviewAPI.evaluate({ question: question.question, answer, role });
      setFeedback(res.data);
      setPhase('feedback');
      setQuestionHistory(prev => [...prev, { question: question.question, answer, feedback: res.data }]);
    } catch {
      alert('Failed to evaluate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setLoading(true);
    setAnswer('');
    setFeedback(null);
    try {
      const res = await interviewAPI.getQuestion({
        role, difficulty, category,
        previousQuestions: questionHistory.map(h => h.question)
      });
      setQuestion(res.data);
      setPhase('interview');
      setQuestionCount(prev => prev + 1);
    } catch {
      alert('Failed to get next question.');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setPhase('setup');
    setQuestion(null);
    setAnswer('');
    setFeedback(null);
    setQuestionHistory([]);
    setQuestionCount(0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#00b894';
    if (score >= 60) return '#fdcb6e';
    return '#ff6b6b';
  };

  if (authLoading || !isAuthenticated) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎙️ AI Mock Interview</h1>
        <p className="page-subtitle">Practice interviews with AI and get instant feedback on your responses</p>
      </div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div className={styles.setupSection}>
          <div className={styles.setupCard}>
            <div className={styles.setupIcon}>🎯</div>
            <h2 className={styles.setupTitle}>Configure Your Interview</h2>
            <p className={styles.setupDesc}>Set your target role, difficulty, and question type to get started</p>
            <form onSubmit={startInterview} className={styles.setupForm}>
              <div className={styles.field}>
                <label className="label">Target Role *</label>
                <input className="input" placeholder="e.g. Frontend Developer, Data Scientist, Product Manager" value={role} onChange={e => setRole(e.target.value)} required />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className="label">Difficulty</label>
                  <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className="label">Category</label>
                  <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="mixed">Mixed</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="situational">Situational</option>
                    <option value="system-design">System Design</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? '🤖 Preparing...' : '🚀 Start Interview'}
              </button>
            </form>
          </div>

          {/* Previous Session Summary */}
          {questionHistory.length > 0 && (
            <div className={styles.historyCard}>
              <h3 style={{ marginBottom: 16 }}>Previous Session ({questionHistory.length} questions)</h3>
              {questionHistory.map((h, i) => (
                <div key={i} className={styles.historyItem}>
                  <div className={styles.historyQ}>Q{i + 1}: {h.question}</div>
                  <div className={styles.historyScore} style={{ color: getScoreColor(h.feedback?.score || 0) }}>
                    {h.feedback?.score || 0}/100
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interview Phase */}
      {phase === 'interview' && question && (
        <div className={styles.interviewSection}>
          <div className={styles.interviewHeader}>
            <div className={styles.questionMeta}>
              <span className="badge badge-primary">Question {questionCount}</span>
              <span className="badge badge-info">{question.category || category}</span>
              <span className={`badge ${difficulty === 'hard' ? 'badge-danger' : difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                {question.difficulty || difficulty}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetInterview}>✕ End Interview</button>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionIcon}>💬</div>
            <h2 className={styles.questionText}>{question.question}</h2>
            {question.tips?.length > 0 && (
              <div className={styles.tips}>
                <span className={styles.tipsLabel}>💡 Tips:</span>
                {question.tips.map((tip, i) => <span key={i} className={styles.tip}>{tip}</span>)}
              </div>
            )}
            {question.expectedDuration && (
              <div className={styles.expectedDuration}>⏱ Expected duration: {question.expectedDuration}</div>
            )}
          </div>

          <div className={styles.answerSection}>
            <label className="label">Your Answer</label>
            <textarea
              className="textarea"
              style={{ minHeight: 180 }}
              placeholder="Type your answer here. Be as detailed as you would in a real interview..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <button className="btn btn-primary btn-lg" onClick={submitAnswer} disabled={loading || !answer.trim()} style={{ width: '100%', marginTop: 12 }}>
              {loading ? '🤖 AI is evaluating...' : '📤 Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Phase */}
      {phase === 'feedback' && feedback && (
        <div className={styles.feedbackSection}>
          <div className={styles.feedbackHeader}>
            <h2>Interview Feedback</h2>
            <div className={styles.feedbackActions}>
              <button className="btn btn-primary" onClick={nextQuestion} disabled={loading}>
                {loading ? 'Loading...' : '→ Next Question'}
              </button>
              <button className="btn btn-secondary" onClick={resetInterview}>End Session</button>
            </div>
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.bigScore} style={{ color: getScoreColor(feedback.score || 0), borderColor: getScoreColor(feedback.score || 0) }}>
              {feedback.score || 0}
            </div>
            <div>
              <div className={styles.scoreTitle}>Your Score</div>
              <div className={styles.scoreVerdict}>
                {(feedback.score || 0) >= 80 ? '🌟 Excellent!' : (feedback.score || 0) >= 60 ? '👍 Good, room for improvement' : '💪 Keep practicing'}
              </div>
            </div>
          </div>

          {feedback.feedback && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 10, fontSize: 15 }}>📋 Detailed Feedback</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{feedback.feedback}</p>
            </div>
          )}

          <div className={styles.feedbackGrid}>
            {feedback.strengths?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#00b894', marginBottom: 10, fontSize: 15 }}>✅ Strengths</h3>
                <ul className={styles.feedbackList}>
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {feedback.improvements?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#fdcb6e', marginBottom: 10, fontSize: 15 }}>💡 Areas to Improve</h3>
                <ul className={styles.feedbackList}>
                  {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {feedback.followUpQuestion && (
            <div className="card" style={{ borderColor: 'rgba(108,92,231,0.3)' }}>
              <h3 style={{ marginBottom: 8, fontSize: 15 }}>🔄 Follow-up Question</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic' }}>{feedback.followUpQuestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
