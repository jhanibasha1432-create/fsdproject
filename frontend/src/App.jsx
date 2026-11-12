import { useState, useEffect } from 'react';

// Default academic schedule items
const INITIAL_SCHEDULE = [
  {
    _id: 'sample-1',
    subject: 'Operating Systems',
    topic: 'CPU Scheduling Algorithms & Deadlocks',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '2 hrs',
    status: 'Completed'
  },
  {
    _id: 'sample-2',
    subject: 'Database Systems',
    topic: 'B+ Tree Indexing & Transaction Concurrency',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '1.5 hrs',
    status: 'Pending'
  },
  {
    _id: 'sample-3',
    subject: 'Full Stack Development',
    topic: 'MERN Stack Deployment & REST APIs',
    date: new Date().toISOString().split('T')[0],
    time: '17:30',
    duration: '2 hrs',
    status: 'Pending'
  }
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('studysync_tasks');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [form, setForm] = useState({
    subject: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '1 hr'
  });

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('studysync_api') || (
      window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/tasks' 
        : 'https://studysync-backend.onrender.com/tasks'
    );
  });
  const [showConfig, setShowConfig] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('studysync_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await fetch(backendUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [backendUrl]);

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.topic.trim()) return;

    const newTask = {
      ...form,
      _id: Date.now().toString(),
      status: 'Pending'
    };

    // Optimistic UI update
    setTasks(prev => [newTask, ...prev]);

    // Send to backend
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsOnline(true);
        fetchTasks();
      }
    } catch {
      setIsOnline(false);
    }

    setForm({
      subject: '',
      topic: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: '1 hr'
    });
  };

  // Toggle Status
  const handleToggle = async (id) => {
    setTasks(prev =>
      prev.map(t =>
        t._id === id
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );

    try {
      const res = await fetch(`${backendUrl}/${id}`, { method: 'PUT' });
      if (res.ok) setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));

    try {
      const res = await fetch(`${backendUrl}/${id}`, { method: 'DELETE' });
      if (res.ok) setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  // Calculations
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter & Search
  const filteredTasks = tasks.filter(t => {
    const matchesFilter =
      filter === 'All' ? true : t.status === filter;
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.topic.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 StudySync
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Organize daily study activities, schedule subjects & track academic progress
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 20,
            background: isOnline ? '#064e3b' : '#334155',
            color: isOnline ? '#34d399' : '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#10b981' : '#f59e0b' }}></span>
            {isOnline ? 'Database Connected' : 'Local / Offline Sync'}
          </span>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            ⚙️ API
          </button>
        </div>
      </header>

      {/* Backend URL Configuration Modal / Bar */}
      {showConfig && (
        <div style={{ background: '#1e293b', border: '1px solid #38bdf8', padding: 14, borderRadius: 8, marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
            Backend API Endpoint:
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={backendUrl}
              onChange={e => {
                setBackendUrl(e.target.value);
                localStorage.setItem('studysync_api', e.target.value);
              }}
              style={{ flex: 1, padding: 8, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
              placeholder="https://your-backend.onrender.com/tasks"
            />
            <button
              onClick={() => { fetchTasks(); setShowConfig(false); }}
              style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 600, border: 0, padding: '0 16px', borderRadius: 6, cursor: 'pointer' }}
            >
              Test & Save
            </button>
          </div>
        </div>
      )}

      {/* Progress & Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Total Study Tasks</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{tasks.length}</div>
        </div>
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Completed Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399', marginTop: 4 }}>{completedCount}</div>
        </div>
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Pending Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Study Progress</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>{progressPercent}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #334155', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: '#94a3b8' }}>Overall Completion Status</span>
          <span style={{ fontWeight: 600, color: '#38bdf8' }}>{completedCount} of {tasks.length} slots completed</span>
        </div>
        <div style={{ background: '#334155', height: 12, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #38bdf8, #10b981)',
            borderRadius: 6,
            transition: 'width 0.4s ease'
          }}></div>
        </div>
      </div>

      {/* Schedule Form */}
      <div style={{ background: '#1e293b', padding: 20, borderRadius: 10, border: '1px solid #334155', marginBottom: 28 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
          ➕ Schedule a New Study Session
        </h3>
        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Subject</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              required
              style={{ width: '100%', padding: 9, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Topic / Module</label>
            <input
              type="text"
              placeholder="e.g. Memory Management"
              value={form.topic}
              onChange={e => setForm({ ...form, topic: e.target.value })}
              required
              style={{ width: '100%', padding: 9, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
              style={{ width: '100%', padding: 9, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Start Time</label>
            <input
              type="time"
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
              required
              style={{ width: '100%', padding: 9, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Duration</label>
            <input
              type="text"
              placeholder="e.g. 1.5 hrs"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              style={{ width: '100%', padding: 9, background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '11px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Add to Timetable
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Pending', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid #334155',
                cursor: 'pointer',
                background: filter === status ? '#38bdf8' : '#1e293b',
                color: filter === status ? '#0f172a' : '#cbd5e1'
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="🔍 Search subject or topic..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 14px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 20, fontSize: 13, minWidth: 220 }}
        />
      </div>

      {/* Scheduled Task Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1e293b', borderRadius: 10, color: '#94a3b8' }}>
            No study sessions found matching your criteria.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === 'Completed';
            return (
              <div
                key={task._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  background: '#1e293b',
                  borderRadius: 10,
                  border: '1px solid #334155',
                  borderLeft: `5px solid ${isDone ? '#10b981' : '#f59e0b'}`,
                  transition: 'all 0.2s',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => handleToggle(task._id)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      border: `2px solid ${isDone ? '#10b981' : '#64748b'}`,
                      background: isDone ? '#10b981' : 'transparent',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    {isDone ? '✓' : ''}
                  </button>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, background: '#334155', padding: '2px 8px', borderRadius: 4, color: '#38bdf8', fontWeight: 600 }}>
                        {task.subject}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        🗓️ {task.date}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        ⏰ {task.time} ({task.duration || '1 hr'})
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: 16,
                      color: isDone ? '#94a3b8' : '#f8fafc',
                      textDecoration: isDone ? 'line-through' : 'none',
                      fontWeight: 600
                    }}>
                      {task.topic}
                    </h4>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontWeight: 600,
                    background: isDone ? '#064e3b' : '#451a03',
                    color: isDone ? '#34d399' : '#f59e0b'
                  }}>
                    {task.status}
                  </span>
                  <button
                    onClick={() => handleDelete(task._id)}
                    style={{
                      padding: '5px 12px',
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
