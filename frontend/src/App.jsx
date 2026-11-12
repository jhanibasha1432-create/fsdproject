import { useState, useEffect } from 'react';

// Default academic study schedule
const DEFAULT_TASKS = [
  { _id: '1', subject: 'Operating Systems', topic: 'CPU Scheduling & Semaphores', date: '2026-11-13', time: '09:00', status: 'Completed' },
  { _id: '2', subject: 'Database Systems', topic: 'SQL Joins & Normalization', date: '2026-11-13', time: '11:30', status: 'Pending' },
  { _id: '3', subject: 'Full Stack Dev', topic: 'React Components & Node APIs', date: '2026-11-13', time: '15:00', status: 'Pending' }
];

export default function App() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [form, setForm] = useState({ subject: '', topic: '', date: '', time: '' });
  const [filter, setFilter] = useState('All');

  const API = 'http://localhost:5000/tasks';

  // Fetch tasks from backend
  const loadTasks = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setTasks(data); })
      .catch(() => {});
  };

  useEffect(() => { loadTasks(); }, []);

  // Add study task
  const addTask = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.topic) return;

    const newTask = { ...form, _id: Date.now().toString(), status: 'Pending' };
    setTasks(prev => [newTask, ...prev]);

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).catch(() => {});

    setForm({ subject: '', topic: '', date: '', time: '' });
    loadTasks();
  };

  // Toggle status between Pending & Completed
  const toggleStatus = async (id) => {
    setTasks(tasks.map(t =>
      t._id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
    await fetch(`${API}/${id}`, { method: 'PUT' }).catch(() => {});
    loadTasks();
  };

  // Delete task
  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t._id !== id));
    await fetch(`${API}/${id}`, { method: 'DELETE' }).catch(() => {});
    loadTasks();
  };

  // Calculations
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks
  const visibleTasks = tasks.filter(t => filter === 'All' ? true : t.status === filter);

  return (
    <div style={{ maxWidth: 620, margin: '30px auto', padding: '0 15px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ color: '#1e293b', margin: '0 0 6px' }}>📅 StudySync</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Daily Study Schedule & Academic Task Planner</p>
      </div>

      {/* Progress Monitor */}
      <div style={{ background: '#fff', padding: 15, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <b>Study Progress</b>
          <span>{completedCount} of {tasks.length} Completed ({progressPercent}%)</span>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: 6, height: 12, overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Schedule Input Form */}
      <form onSubmit={addTask} style={{ background: '#fff', padding: 15, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Schedule a Study Slot</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input placeholder="Subject (e.g. DBMS)" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <input placeholder="Topic (e.g. SQL Queries)" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 9, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>
          + Add to Timetable
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
        {['All', 'Pending', 'Completed'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              background: filter === type ? '#2563eb' : '#e2e8f0',
              color: filter === type ? '#fff' : '#334155',
              fontWeight: 500
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Scheduled Task Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleTasks.map(t => {
          const isDone = t.status === 'Completed';
          return (
            <div
              key={t._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                background: '#fff',
                borderRadius: 8,
                borderLeft: `5px solid ${isDone ? '#10b981' : '#f59e0b'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>🗓️ {t.date} | ⏰ {t.time}</div>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#1e293b', margin: '3px 0' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 12, marginRight: 6 }}>{t.subject}</span>
                  <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#94a3b8' : '#1e293b' }}>{t.topic}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => toggleStatus(t._id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: isDone ? '#dcfce7' : '#fef3c7',
                    color: isDone ? '#15803d' : '#b45309',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {t.status}
                </button>
                <button
                  onClick={() => deleteTask(t._id)}
                  style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
