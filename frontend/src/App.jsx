import { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ subject: '', topic: '', hours: '' });
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
    setForm({ subject: '', topic: '', hours: '' });
    loadTasks();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  return (
    <div style={{ maxWidth: 450, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>StudySync Planner</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
        <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required />
        <input placeholder="Hrs" type="number" style={{ width: 50 }} value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(t => (
          <li key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
            <span><b>{t.subject}</b>: {t.topic} ({t.hours || 1} hr)</span>
            <button onClick={() => handleDelete(t._id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
