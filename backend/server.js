const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studysync';
mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Successfully'))
  .catch(err => console.error(' MongoDB Connection Error:', err.message));

// Schema & Model
const taskSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, default: '1 hr' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'StudySync API is active and running',
    endpoints: {
      getAllTasks: 'GET /tasks',
      createTask: 'POST /tasks',
      updateTask: 'PUT /tasks/:id',
      deleteTask: 'DELETE /tasks/:id'
    }
  });
});

// GET: Fetch all study tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

// POST: Create a new study task
app.post('/tasks', async (req, res) => {
  try {
    const { subject, topic, date, time, duration } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required' });
    }
    const newTask = new Task({
      subject,
      topic,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00',
      duration: duration || '1 hr',
      status: 'Pending'
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save task', details: err.message });
  }
});

// PUT: Toggle or update task status
app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// DELETE: Delete a study task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` StudySync Server is running on port ${PORT}`);
});
