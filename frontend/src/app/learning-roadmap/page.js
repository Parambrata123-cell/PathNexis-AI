'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { roadmapAPI } from '@/lib/api';
import styles from './page.module.css';

export default function LearningRoadmapPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [careerGoal, setCareerGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [currentSkills, setCurrentSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      roadmapAPI.getAll().then(r => {
        setRoadmaps(r.data);
        if (r.data.length > 0) setActiveRoadmap(r.data[0]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!careerGoal.trim()) return;
    setGenerating(true);
    try {
      const res = await roadmapAPI.generate({
        careerGoal,
        currentLevel,
        currentSkills: currentSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      const newRoadmap = res.data.progress;
      setRoadmaps(prev => [newRoadmap, ...prev]);
      setActiveRoadmap(newRoadmap);
      setShowForm(false);
      setCareerGoal('');
      setCurrentSkills('');
    } catch (err) {
      alert('Error generating roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTopic = async (phaseIdx, topicIdx) => {
    if (!activeRoadmap) return;
    try {
      const res = await roadmapAPI.toggleTopic(activeRoadmap._id, phaseIdx, topicIdx);
      setActiveRoadmap(res.data.progress);
      setRoadmaps(prev => prev.map(r => r._id === res.data.progress._id ? res.data.progress : r));
    } catch {}
  };

  if (authLoading || !isAuthenticated) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🗺️ Learning Roadmap</h1>
          <p className="page-subtitle">AI-generated personalized career paths with curated free resources</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Roadmap'}
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className={styles.generateForm}>
          <form onSubmit={handleGenerate}>
            <h3 style={{ marginBottom: 16 }}>Generate New Roadmap</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label">Career Goal *</label>
                <input className="input" placeholder="e.g. Full Stack Developer, Data Scientist, ML Engineer" value={careerGoal} onChange={e => setCareerGoal(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className="label">Current Level</label>
                <select className="select" value={currentLevel} onChange={e => setCurrentLevel(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                <label className="label">Current Skills (comma separated)</label>
                <input className="input" placeholder="e.g. HTML, CSS, JavaScript, Python" value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={generating} style={{ width: '100%', marginTop: 16 }}>
              {generating ? '🤖 AI is generating your roadmap...' : '🚀 Generate Roadmap'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : roadmaps.length === 0 && !showForm ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🗺️</div>
          <h3>No Roadmaps Yet</h3>
          <p>Generate your first personalized learning roadmap</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Roadmap</button>
        </div>
      ) : (
        <div className={styles.roadmapLayout}>
          {/* Sidebar */}
          {roadmaps.length > 1 && (
            <div className={styles.sidebar}>
              <h4 className={styles.sidebarTitle}>Your Roadmaps</h4>
              {roadmaps.map((rm) => (
                <button
                  key={rm._id}
                  className={`${styles.sidebarItem} ${activeRoadmap?._id === rm._id ? styles.active : ''}`}
                  onClick={() => setActiveRoadmap(rm)}
                >
                  <div className={styles.sidebarGoal}>{rm.careerGoal}</div>
                  <div className={styles.sidebarProgress}>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${rm.progressPercentage || 0}%` }}></div>
                    </div>
                    <span>{rm.progressPercentage || 0}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Main Roadmap */}
          {activeRoadmap && (
            <div className={styles.roadmapMain}>
              <div className={styles.roadmapHeader}>
                <div>
                  <h2 className={styles.roadmapTitle}>{activeRoadmap.roadmap?.title || activeRoadmap.careerGoal}</h2>
                  <p className={styles.roadmapDesc}>{activeRoadmap.roadmap?.description}</p>
                </div>
                <div className={styles.progressOverview}>
                  <div className={styles.progressCircle}>
                    <span className={styles.progressValue}>{activeRoadmap.progressPercentage || 0}%</span>
                  </div>
                  <div className={styles.progressMeta}>
                    <span>{activeRoadmap.completedTopics || 0}/{activeRoadmap.totalTopics || 0} topics</span>
                    <span>⏱ {activeRoadmap.roadmap?.estimatedDuration || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className={styles.phases}>
                {activeRoadmap.roadmap?.phases?.map((phase, phaseIdx) => {
                  const completedInPhase = phase.topics?.filter(t => t.isCompleted).length || 0;
                  const totalInPhase = phase.topics?.length || 0;
                  return (
                    <div key={phaseIdx} className={styles.phase}>
                      <div className={styles.phaseHeader}>
                        <div className={styles.phaseNumber}>{phase.order || phaseIdx + 1}</div>
                        <div>
                          <h3 className={styles.phaseName}>{phase.name}</h3>
                          <p className={styles.phaseDuration}>{phase.duration} • {completedInPhase}/{totalInPhase} completed</p>
                        </div>
                      </div>
                      {phase.description && <p className={styles.phaseDesc}>{phase.description}</p>}
                      <div className={styles.topics}>
                        {phase.topics?.map((topic, topicIdx) => (
                          <div key={topicIdx} className={`${styles.topic} ${topic.isCompleted ? styles.completed : ''}`}>
                            <button className={styles.topicCheck} onClick={() => handleToggleTopic(phaseIdx, topicIdx)}>
                              {topic.isCompleted ? '✓' : ''}
                            </button>
                            <div className={styles.topicContent}>
                              <div className={styles.topicTitle}>{topic.title}</div>
                              {topic.description && <p className={styles.topicDesc}>{topic.description}</p>}
                              {topic.resources?.length > 0 && (
                                <div className={styles.resources}>
                                  {topic.resources.map((r, ri) => (
                                    <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resource}>
                                      📚 {r.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
