'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { resumeAPI } from '@/lib/api';
import styles from './page.module.css';

export default function ResumeAnalyzerPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('upload');
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      resumeAPI.getHistory().then(r => setHistory(r.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setAnalyzing(true);
    try {
      let res;
      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        if (targetRole) formData.append('targetRole', targetRole);
        if (targetIndustry) formData.append('targetIndustry', targetIndustry);
        res = await resumeAPI.analyze(formData);
      } else if (mode === 'paste' && resumeText.trim()) {
        res = await resumeAPI.analyzeText({ resumeText, targetRole, targetIndustry });
      } else {
        setError('Please provide a resume file or paste your resume text');
        setAnalyzing(false);
        return;
      }
      setResult(res.data.resume);
      setHistory(prev => [res.data.resume, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#00b894';
    if (score >= 60) return '#fdcb6e';
    return '#ff6b6b';
  };

  if (authLoading || !isAuthenticated) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📄 AI Resume Analyzer</h1>
        <p className="page-subtitle">Get instant ATS scoring, keyword analysis, and actionable improvement suggestions</p>
      </div>

      {!result ? (
        <div className={styles.analyzerLayout}>
          <div className={styles.uploadSection}>
            <div className={styles.modeSwitch}>
              <button className={`${styles.modeBtn} ${mode === 'upload' ? styles.active : ''}`} onClick={() => setMode('upload')}>📁 Upload File</button>
              <button className={`${styles.modeBtn} ${mode === 'paste' ? styles.active : ''}`} onClick={() => setMode('paste')}>📝 Paste Text</button>
            </div>

            <form onSubmit={handleAnalyze} className={styles.form}>
              {mode === 'upload' ? (
                <div className={styles.dropzone} onClick={() => document.getElementById('resume-file').click()}>
                  <input id="resume-file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                  <div className={styles.dropzoneIcon}>📄</div>
                  <div className={styles.dropzoneText}>{file ? file.name : 'Click to upload resume'}</div>
                  <div className={styles.dropzoneHint}>PDF, DOC, DOCX, or TXT (max 5MB)</div>
                </div>
              ) : (
                <textarea className="textarea" style={{ minHeight: 200 }} placeholder="Paste your resume text here..." value={resumeText} onChange={e => setResumeText(e.target.value)} />
              )}

              <div className={styles.optionsRow}>
                <div className={styles.field}>
                  <label className="label">Target Role (optional)</label>
                  <input className="input" placeholder="e.g. Frontend Developer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className="label">Target Industry (optional)</label>
                  <input className="input" placeholder="e.g. Technology" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} />
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg" disabled={analyzing} style={{ width: '100%' }}>
                {analyzing ? '🔍 Analyzing with AI...' : '🚀 Analyze Resume'}
              </button>
            </form>
          </div>

          {history.length > 0 && (
            <div className={styles.historySection}>
              <h3 className={styles.historyTitle}>Previous Analyses</h3>
              {history.slice(0, 5).map((item, i) => (
                <div key={i} className={styles.historyItem} onClick={() => setResult(item)}>
                  <div className={styles.historyScore} style={{ color: getScoreColor(item.atsScore) }}>{item.atsScore}</div>
                  <div>
                    <div className={styles.historyName}>{item.fileName}</div>
                    <div className={styles.historyDate}>{new Date(item.analyzedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.resultsLayout}>
          <button className={`btn btn-secondary ${styles.backBtn}`} onClick={() => setResult(null)}>← Analyze Another</button>

          {/* Score Overview */}
          <div className={styles.scoreOverview}>
            <div className={styles.mainScore}>
              <div className={styles.scoreCircle} style={{ borderColor: getScoreColor(result.atsScore) }}>
                <span className={styles.scoreValue}>{result.atsScore}</span>
                <span className={styles.scoreLabel}>ATS Score</span>
              </div>
            </div>
            <div className={styles.subScores}>
              {[
                { label: 'Keywords', value: result.analysis?.keywordMatch, icon: '🔑' },
                { label: 'Formatting', value: result.analysis?.formattingScore, icon: '📐' },
                { label: 'Experience', value: result.analysis?.experienceScore, icon: '💼' },
                { label: 'Education', value: result.analysis?.educationScore, icon: '🎓' },
                { label: 'Skills', value: result.analysis?.skillsScore, icon: '⚡' },
              ].map((s, i) => (
                <div key={i} className={styles.subScoreCard}>
                  <span className={styles.subScoreIcon}>{s.icon}</span>
                  <div className={styles.subScoreBar}>
                    <div className={styles.subScoreFill} style={{ width: `${s.value || 0}%`, background: getScoreColor(s.value || 0) }}></div>
                  </div>
                  <div className={styles.subScoreInfo}>
                    <span>{s.label}</span>
                    <span style={{ color: getScoreColor(s.value || 0), fontWeight: 700 }}>{s.value || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {result.analysis?.overallFeedback && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>📋 Overall Feedback</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{result.analysis.overallFeedback}</p>
            </div>
          )}

          <div className={styles.feedbackGrid}>
            {result.analysis?.strengths?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#00b894', marginBottom: 12, fontSize: 16 }}>✅ Strengths</h3>
                <ul className={styles.feedbackList}>
                  {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.analysis?.weaknesses?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#ff6b6b', marginBottom: 12, fontSize: 16 }}>⚠️ Weaknesses</h3>
                <ul className={styles.feedbackList}>
                  {result.analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {result.analysis?.suggestions?.length > 0 && (
              <div className="card">
                <h3 style={{ color: '#fdcb6e', marginBottom: 12, fontSize: 16 }}>💡 Suggestions</h3>
                <ul className={styles.feedbackList}>
                  {result.analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className={styles.skillsSection}>
            {result.analysis?.detectedSkills?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12, fontSize: 16 }}>🔍 Detected Skills</h3>
                <div className={styles.skillTags}>
                  {result.analysis.detectedSkills.map((s, i) => <span key={i} className="badge badge-success">{s}</span>)}
                </div>
              </div>
            )}
            {result.analysis?.missingSkills?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12, fontSize: 16 }}>📌 Missing Skills</h3>
                <div className={styles.skillTags}>
                  {result.analysis.missingSkills.map((s, i) => <span key={i} className="badge badge-danger">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
