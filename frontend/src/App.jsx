import { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ subject: '', topic: '', date: '', time: '' });
  const API = 'http://localhost:5000/tasks';

  const loadTasks = () => fetch(API).then(r => r.json()).then(setTasks);
  useEffect(() => { loadTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.topic) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ subject: '', topic: '', date: '', time: '' });
    loadTasks();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  return (
    <div style={{ maxWidth: 480, margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>📅 StudySync - Daily Study Schedule</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
        <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
        <button type="submit" style={{ gridColumn: 'span 2', padding: 8, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>Add to Schedule</button>
      </form>
      <h3>Scheduled Sessions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map(t => (
          <div key={t._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9' }}>
            <div>
              <div style={{ fontSize: 13, color: '#555' }}>🗓️ {t.date} | ⏰ {t.time}</div>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{t.subject}</div>
              <div style={{ color: '#444' }}>{t.topic}</div>
            </div>
            <button onClick={() => handleDelete(t._id)} style={{ color: 'red', border: '1px solid red', background: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
