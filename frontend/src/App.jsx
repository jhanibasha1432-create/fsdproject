import { useState, useEffect } from 'react';

const SAMPLES = [
  { _id: '1', subject: 'Operating Systems', topic: 'Process Scheduling', date: '2026-11-13', time: '09:00', status: 'Completed' },
  { _id: '2', subject: 'Database Management', topic: 'Indexing & B-Trees', date: '2026-11-13', time: '11:30', status: 'Pending' },
  { _id: '3', subject: 'Full Stack Development', topic: 'MERN Deployment', date: '2026-11-13', time: '15:00', status: 'Pending' }
];

export default function App() {
  const [tasks, setTasks] = useState(SAMPLES);
  const [form, setForm] = useState({ subject: '', topic: '', date: '', time: '' });
  const API = 'http://localhost:5000/tasks';

  const load = () => fetch(API).then(r => r.json()).then(d => Array.isArray(d) && d.length && setTasks(d)).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.subject) return;
    setTasks(p => [...p, { ...form, _id: Date.now().toString(), status: 'Pending' }]);
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).catch(() => {});
    setForm({ subject: '', topic: '', date: '', time: '' });
    load();
  };

  const toggle = async (id) => {
    setTasks(tasks.map(t => t._id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
    await fetch(`${API}/${id}`, { method: 'PUT' }).catch(() => {});
    load();
  };

  const del = async (id) => {
    setTasks(tasks.filter(t => t._id !== id));
    await fetch(`${API}/${id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  const done = tasks.filter(t => t.status === 'Completed').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 560, margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: 15, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 10px', color: '#1e293b' }}>📚 StudySync - Study Planner & Timetable</h2>
      <div style={{ background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', height: 22, margin: '10px 0' }}>
        <div style={{ width: `${pct}%`, background: '#10b981', color: '#fff', fontSize: 12, lineHeight: '22px', textAlign: 'center', transition: '0.3s' }}>{pct}% Completed ({done}/{tasks.length})</div>
      </div>
      <form onSubmit={add} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 }}>
        <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required style={{ padding: 6 }} />
        <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required style={{ padding: 6 }} />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ padding: 6 }} />
        <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={{ padding: 6 }} />
        <button type="submit" style={{ gridColumn: 'span 2', padding: 8, background: '#2563eb', color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>+ Schedule Subject Slot</button>
      </form>
      <h3 style={{ margin: '10px 0', color: '#334155' }}>🗓️ Active Study Schedule</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: '#fff', borderRadius: 6, borderLeft: `5px solid ${t.status === 'Completed' ? '#10b981' : '#f59e0b'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>🗓️ {t.date || 'Today'} | ⏰ {t.time || 'Flexible'}</div>
              <div style={{ fontWeight: 'bold', textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>{t.subject} - <span style={{ fontWeight: 'normal', color: '#555' }}>{t.topic}</span></div>
              <button onClick={() => toggle(t._id)} style={{ fontSize: 11, border: 0, background: t.status === 'Completed' ? '#d1fae5' : '#fef3c7', padding: '2px 6px', borderRadius: 3, cursor: 'pointer' }}>{t.status}</button>
            </div>
            <button onClick={() => del(t._id)} style={{ color: '#ef4444', border: '1px solid #ef4444', background: '#fff', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
